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
            if (coupon.usedBy && coupon.usedBy.includes(req.user._id)) {
                res.status(400);
                return next(new Error('You have already used this coupon'));
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
            if (coupon && (!coupon.usedBy || !coupon.usedBy.includes(req.user._id))) {
                coupon.usedCount += 1;
                if (!coupon.usedBy) coupon.usedBy = [];
                coupon.usedBy.push(req.user._id);
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
            movie: show.movie._id,
            show: showId,
            seatsBooked: seats,
            totalPrice,
            paymentStatus: 'Completed',
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            qrCode: qrCodeDataUrl,
            movieName: show.movie.title,
            moviePoster: show.movie.posterUrl,
            theatreName: `${show.theatre.name}, ${show.theatre.city}`,
            showtime: show.time,
            date: show.date,
            status: 'upcoming'
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
          <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; padding: 40px 20px; color: #f8fafc; min-height: 100vh;">
            <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1e293b, #0f172a); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(to right, #4f46e5, #6366f1); padding: 30px; text-align: center; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);"></div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">ReelVerse Ticket</h1>
                    <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px; position: relative; z-index: 1;">Your premium cinematic experience awaits.</p>
                </div>

                <!-- Body -->
                <div style="padding: 40px 30px;">
                    <p style="font-size: 16px; margin-bottom: 25px; color: #cbd5e1;">Hi <strong style="color: #ffffff;">${req.user.name || 'Moviegoer'}</strong>,</p>
                    <p style="font-size: 15px; margin-bottom: 35px; color: #94a3b8; line-height: 1.6;">Your booking is confirmed! Please present the QR code below at the cinema entrance.</p>

                    <!-- Ticket Details Card -->
                    <div style="background-color: #1e293b; border-left: 4px solid #6366f1; border-radius: 8px; padding: 25px; margin-bottom: 40px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);">
                        <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 22px; font-weight: 800;">${show.movie.title}</h2>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Location</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #f8fafc; font-weight: 600; text-align: right;">${show.theatre.name}, ${show.theatre.city}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Date & Time</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #f8fafc; font-weight: 600; text-align: right;">${new Date(show.date).toDateString()} at ${show.time}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Seats</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #10b981; font-weight: 700; text-align: right; font-size: 16px;">${seats.join(', ')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Total Paid</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #f8fafc; font-weight: 600; text-align: right;">₹${totalPrice}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Booking ID</td>
                                <td style="padding: 12px 0; color: #94a3b8; font-family: monospace; text-align: right; font-size: 12px;">${createdBooking._id}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- QR Code Section -->
                    <div style="text-align: center; background-color: #ffffff; padding: 30px; border-radius: 12px; margin: 0 auto; width: fit-content; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                        <p style="margin: 0 0 15px 0; color: #0f172a; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; font-size: 12px;">Scan at Entrance</p>
                        <img src="cid:ticket_qrcode" alt="QR Code" style="width: 200px; height: 200px; display: block; margin: 0 auto;" />
                    </div>

                </div>

                <!-- Footer -->
                <div style="background-color: #0f172a; padding: 25px; text-align: center; border-top: 1px dashed rgba(255,255,255,0.1);">
                    <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">Please arrive 15 minutes before showtime.<br/>Enjoy the movie!<br/><br/><strong style="color: #94a3b8;">The ReelVerse Team</strong></p>
                </div>
            </div>
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
