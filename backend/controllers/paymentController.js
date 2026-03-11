import crypto from 'crypto';
import razorpay from '../config/razorpay.js';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import sendEmail from '../utils/emailService.js';

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = async (req, res, next) => {
    try {
        const { amount } = req.body; // Amount in INR

        if (!amount) {
            res.status(400);
            return next(new Error('Amount is required'));
        }

        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            res.status(500);
            return next(new Error('Some error occured while creating Razorpay order'));
        }

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Verify Razorpay Payment and Confirm Booking
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            showId,
            seats,
            totalPrice
        } = req.body;

        // Verify Signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            res.status(400);
            return next(new Error('Invalid payment signature. Payment failed.'));
        }

        // Payment is successful, confirm booking
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
            return next(new Error('Seats booked by someone else during checkout. Please contact support for refund.'));
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
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
        });

        const createdBooking = await booking.save();

        // Send Confirmation Email
        const message = `
      <h1>Your Booking is Confirmed!</h1>
      <p>Movie: <strong>${show.movie.title}</strong></p>
      <p>Theatre: ${show.theatre.name}, ${show.theatre.city}</p>
      <p>Date & Time: ${new Date(show.date).toDateString()} at ${show.time}</p>
      <p>Seats: ${seats.join(', ')}</p>
      <p>Total Paid: ₹${totalPrice}</p>
      <p>Booking ID: ${createdBooking._id}</p>
      <p>Razorpay Payment ID: ${razorpay_payment_id}</p>
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

        res.status(201).json({ success: true, booking: createdBooking });

    } catch (error) {
        next(error);
    }
};
