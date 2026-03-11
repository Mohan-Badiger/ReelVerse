import crypto from 'crypto';
import QRCode from 'qrcode';
import razorpay from '../config/razorpay.js';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import Coupon from '../models/Coupon.js';
import sendEmail from '../utils/emailService.js';

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = async (req, res, next) => {
    try {
        const { showId, seats, couponCode } = req.body;

        if (!showId || !seats || seats.length === 0) {
            res.status(400);
            return next(new Error('Show ID and seats are required to create an order'));
        }

        const show = await Show.findById(showId);
        if (!show) {
            res.status(404);
            return next(new Error('Show not found'));
        }

        let discountPercentage = 0;
        let appliedCoupon = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

            if (!coupon || !coupon.isActive || new Date(coupon.expiryDate) < new Date() || coupon.usedCount >= coupon.maxUses) {
                res.status(400);
                return next(new Error('Invalid or expired coupon provided during checkout'));
            }
            discountPercentage = coupon.discountPercentage;
            appliedCoupon = coupon;
        }

        let baseAmount = show.ticketPrice * seats.length;
        let amount = baseAmount - (baseAmount * (discountPercentage / 100));

        // Ensure amount is an integer for Razorpay
        amount = Math.round(amount);

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
        const now = new Date();
        const unavailableSeats = show.seats.filter(seat => {
            if (!seats.includes(seat.seatId)) return false;

            if (seat.isBooked) return true;

            if (seat.lockedUntil && seat.lockedUntil > now && seat.lockedBy.toString() !== req.user._id.toString()) {
                return true;
            }

            return false;
        });

        if (unavailableSeats.length > 0) {
            res.status(400);
            return next(new Error('Seats booked or locked by someone else during checkout. Please contact support.'));
        }

        // Handle Coupon Usage Count (if we decided to track usage)
        // Since we didn't pass couponCode inside verify request, we can assume the price validation happened.
        // For production, we'd pass couponCode here too to increment its `usedCount`.
        // I will add a simple check if the frontend sent it (I'll update the frontend to send it later).
        const { couponCode } = req.body;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon) {
                coupon.usedCount += 1;
                await coupon.save();
            }
        }

        // Update Seat Status
        show.seats.forEach((seat) => {
            if (seats.includes(seat.seatId)) {
                seat.isBooked = true;
                seat.bookedBy = req.user._id;
            }
        });

        await show.save();

        // Generate QR Code data
        const qrData = JSON.stringify({
            bookingId: 'to_be_generated', // Updated below
            movie: show.movie.title,
            theatre: show.theatre.name,
            showtime: `${new Date(show.date).toDateString()} ${show.time}`,
            seats: seats.join(','),
        });

        // Generate base64 QR code
        const qrCodeDataUrl = await QRCode.toDataURL(qrData);

        // Create Booking Record
        const booking = new Booking({
            user: req.user._id,
            show: showId,
            seatsBooked: seats,
            totalPrice,
            paymentStatus: 'Completed',
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            qrCode: qrCodeDataUrl,
        });

        const createdBooking = await booking.save();

        // Re-generate QR with final booking ID if desired, but for now we just keep the base64 or you can update the document afterwards.
        // Let's generate it cleanly with the ID once it's created:
        const finalQrData = JSON.stringify({
            bookingId: createdBooking._id,
            movie: show.movie.title,
            theatre: show.theatre.name,
            showtime: `${new Date(show.date).toDateString()} ${show.time}`,
            seats: seats.join(','),
        });
        const finalQrCodeDataUrl = await QRCode.toDataURL(finalQrData);

        createdBooking.qrCode = finalQrCodeDataUrl;
        await createdBooking.save();

        // Send rich HTML Confirmation Email with inline QR image
        // Base64 data parts: data:image/png;base64,.....
        const base64Data = finalQrCodeDataUrl.split(',')[1];

        const message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h1 style="color: #f59e0b; text-align: center;">ReelVerse Ticket</h1>
            <p>Hi ${req.user.name || 'Moviegoer'},</p>
            <p>Your booking is confirmed! Here are your ticket details:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Movie:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${show.movie.title}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Theatre:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${show.theatre.name}, ${show.theatre.city}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date & Time:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(show.date).toDateString()} at ${show.time}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Seats:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${seats.join(', ')}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Paid:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">₹${totalPrice}</td></tr>
                <tr><td style="padding: 8px;"><strong>Booking ID:</strong></td><td style="padding: 8px;">${createdBooking._id}</td></tr>
            </table>
            
            <div style="text-align: center; margin-top: 30px;">
                <p style="margin-bottom: 10px;"><strong>Scan to verify ticket:</strong></p>
                <img src="cid:ticket_qrcode" alt="QR Code" style="width: 200px; height: 200px;" />
            </div>

            <p style="text-align: center; margin-top: 30px; color: #888; font-size: 12px;">Enjoy the movie!<br/>The ReelVerse Team</p>
          </div>
        `;

        try {
            await sendEmail({
                email: req.user.email,
                subject: 'Your ReelVerse Ticket 🎬',
                message,
                attachments: [
                    {
                        filename: 'qrcode.png',
                        content: base64Data,
                        encoding: 'base64',
                        cid: 'ticket_qrcode', // same cid value as in the html img src
                    }
                ]
            });
        } catch (err) {
            console.error('Confirmation email not sent', err);
        }

        res.status(201).json({ success: true, booking: createdBooking });

    } catch (error) {
        next(error);
    }
};
