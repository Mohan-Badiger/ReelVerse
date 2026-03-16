import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
        show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
        seatsBooked: [{ type: String }], // ['A1', 'A2']
        totalPrice: { type: Number, required: true },
        paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
        orderId: { type: String }, // Razorpay Order Id
        paymentId: { type: String }, // Razorpay Payment Id
        qrCode: { type: String }, // Base64 QR code image
    },
    { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
