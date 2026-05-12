import Booking from '../models/Booking.js';

const updatePastBookingsStatus = async (bookings) => {
    if (!bookings) return;
    const currentTime = new Date();
    const bookingsArray = Array.isArray(bookings) ? bookings : [bookings];
    
    for (let booking of bookingsArray) {
        if (!booking.status || booking.status === 'upcoming') {
            let showDateTime = null;
            if (booking.date && booking.showtime) {
                showDateTime = new Date(`${new Date(booking.date).toDateString()} ${booking.showtime}`);
            } else if (booking.show && booking.show.date && booking.show.time) {
                showDateTime = new Date(`${new Date(booking.show.date).toDateString()} ${booking.show.time}`);
            }
            
            if (showDateTime && currentTime > showDateTime) {
                booking.status = 'completed';
                await Booking.updateOne({ _id: booking._id }, { $set: { status: 'completed' } });
            } else if (!booking.status) {
                booking.status = 'upcoming';
                await Booking.updateOne({ _id: booking._id }, { $set: { status: 'upcoming' } });
            }
        }
    }
};

// @desc    Get user bookings
// @access  Private
export const getUserBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('movie', 'title posterUrl language duration')
            .populate({
                path: 'show',
                populate: [
                    { path: 'movie', select: 'title posterUrl language' },
                    { path: 'theatre', select: 'name city' }
                ]
            })
            .sort({ createdAt: -1 });

        await updatePastBookingsStatus(bookings);

        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate({
                path: 'show',
                populate: [
                    { path: 'movie', select: 'title posterUrl language duration' },
                    { path: 'theatre', select: 'name city address' }
                ]
            });

        if (!booking) {
            res.status(404);
            return next(new Error('Booking not found'));
        }

        // Must be the user's booking or admin
        if (booking.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            return next(new Error('Not authorized to view this booking'));
        }

        await updatePastBookingsStatus(booking);

        res.json(booking);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'name email')
            .populate({
                path: 'show',
                populate: [
                    { path: 'movie', select: 'title' },
                    { path: 'theatre', select: 'name' }
                ]
            })
            .sort({ createdAt: -1 });

        await updatePastBookingsStatus(bookings);

        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email')
            .populate({
                path: 'show',
                populate: [
                    { path: 'movie', select: 'title' },
                    { path: 'theatre', select: 'name city' }
                ]
            });

        if (!booking) {
            res.status(404);
            return next(new Error('Booking not found'));
        }

        // Check if correct user
        if (booking.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            return next(new Error('Not authorized to cancel this booking'));
        }

        if (booking.paymentStatus === 'Cancelled') {
            res.status(400);
            return next(new Error('Booking is already cancelled'));
        }

        // Check the 2 hours rule
        const showDateTime = new Date(`${new Date(booking.show.date).toDateString()} ${booking.show.time}`);
        const currentTime = new Date();
        const differenceInHours = (showDateTime - currentTime) / (1000 * 60 * 60);

        if (differenceInHours < 2) {
            res.status(400);
            return next(new Error('Bookings can only be cancelled up to 2 hours before the showtime'));
        }

        // Cancel the booking
        await Booking.updateOne({ _id: booking._id }, { $set: { paymentStatus: 'Cancelled', status: 'cancelled' } });
        booking.paymentStatus = 'Cancelled';
        booking.status = 'cancelled';

        // Release the seats in the show
        const show = booking.show;
        show.seats.forEach(seat => {
            if (booking.seatsBooked.includes(seat.seatId)) {
                seat.isBooked = false;
                seat.bookedBy = null;
            }
        });

        // Save the updated show via its own model, since populate doesn't always allow deep array saves easily without explicit model fetching in some setups, but we populated it so we can save it.
        const ShowModel = (await import('../models/Show.js')).default;
        await ShowModel.updateOne({ _id: show._id }, { $set: { seats: show.seats } });

        // Optionally: Trigger refund API via Razorpay here. For this implementation we skip actual Razorpay API refund calling and just mark it cancelled locally.

        // Send Cancellation Email
        // Use a dynamic import if sendEmail is not at the top (Wait, we should add it to top of file)
        const { default: sendEmail } = await import('../utils/emailService.js');
        const message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h1 style="color: #ef4444; text-align: center;">Booking Cancelled</h1>
            <p>Hi ${booking.user.name || 'Moviegoer'},</p>
            <p>Your booking for <strong>${show.movie.title}</strong> has been successfully cancelled.</p>
            <p>The amount of ₹${booking.totalPrice} is being refunded (if applicable according to refund policy).</p>
            <p>Booking ID: ${booking._id}</p>
            <p style="text-align: center; margin-top: 30px; color: #888; font-size: 12px;">See you next time!<br/>The ReelVerse Team</p>
          </div>
        `;

        try {
            await sendEmail({
                email: booking.user.email,
                subject: 'ReelVerse Booking Cancellation',
                message,
            });
        } catch (err) {
            console.error('Cancellation email not sent', err);
        }

        res.json({ message: 'Booking cancelled successfully', booking });

    } catch (error) {
        next(error);
    }
};
