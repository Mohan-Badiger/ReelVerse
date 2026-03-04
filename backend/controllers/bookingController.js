import Stripe from 'stripe';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import sendEmail from '../utils/emailService.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create Stripe Checkout Session
// @route   POST /api/bookings/checkout
// @access  Private
export const checkoutSession = async (req, res, next) => {
    try {
        const { showId, seats, totalPrice } = req.body;

        const show = await Show.findById(showId).populate('movie', 'title posterUrl');

        if (!show) {
            res.status(404);
            return next(new Error('Show not found'));
        }

        // Check availability of requested seats
        const unavailableSeats = show.seats.filter(
            (seat) => seats.includes(seat.seatId) && seat.isBooked
        );

        if (unavailableSeats.length > 0) {
            res.status(400);
            return next(new Error('Some of the selected seats are already booked'));
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: `${process.env.FRONTEND_URL}/booking/success?showId=${showId}&seats=${seats.join(',')}&totalPrice=${totalPrice}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/booking/cancel`,
            customer_email: req.user.email,
            client_reference_id: req.user._id.toString(),
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: totalPrice * 100,
                        product_data: {
                            name: `Booking for ${show.movie.title}`,
                            description: `Seats: ${seats.join(', ')}`,
                            images: [show.movie.posterUrl],
                        },
                    },
                    quantity: 1,
                },
            ],
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        next(error);
    }
};

// @desc    Confirm booking and update seats
// @route   POST /api/bookings/confirm
// @access  Private
export const confirmBooking = async (req, res, next) => {
    try {
        const { showId, seats, totalPrice, sessionId } = req.body;

        // Optional: verify session ID with Stripe (skipped for test mode simplicity)
        const show = await Show.findById(showId).populate('movie theatre');

        if (!show) {
            res.status(404);
            return next(new Error('Show not found'));
        }

        // Double check seat availability due to concurrent bookings
        const unavailableSeats = show.seats.filter(
            (seat) => seats.includes(seat.seatId) && seat.isBooked
        );

        if (unavailableSeats.length > 0) {
            res.status(400);
            return next(new Error('Seats booked by someone else during checkout. Please try again.'));
        }

        // Update Seat Status
        show.seats.forEach((seat) => {
            if (seats.includes(seat.seatId)) {
                seat.isBooked = true;
                seat.bookedBy = req.user._id;
            }
        });

        await show.save();

        // Create Booking Record
        const booking = new Booking({
            user: req.user._id,
            show: showId,
            seatsBooked: seats,
            totalPrice,
            paymentStatus: 'Completed',
            stripeSessionId: sessionId,
        });

        const createdBooking = await booking.save();

        // Send Confirmation Email
        const message = `
      <h1>Your Booking is Confirmed!</h1>
      <p>Movie: <strong>${show.movie.title}</strong></p>
      <p>Theatre: ${show.theatre.name}, ${show.theatre.city}</p>
      <p>Date & Time: ${new Date(show.date).toDateString()} at ${show.time}</p>
      <p>Seats: ${seats.join(', ')}</p>
      <p>Total Paid: $${totalPrice}</p>
      <p>Booking ID: ${createdBooking._id}</p>
      <p>Enjoy the show!</p>
    `;

        try {
            await sendEmail({
                email: req.user.email,
                subject: 'ReelVerse Booking Confirmation',
                message,
            });
        } catch (err) {
            console.error('Confirmation email not sent', err);
        }

        res.status(201).json(createdBooking);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
export const getUserBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate({
                path: 'show',
                populate: [
                    { path: 'movie', select: 'title posterUrl language' },
                    { path: 'theatre', select: 'name city' }
                ]
            })
            .sort({ createdAt: -1 });

        res.json(bookings);
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

        res.json(bookings);
    } catch (error) {
        next(error);
    }
};
