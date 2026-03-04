import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
        seatsBooked: [{ type: String }], // ['A1', 'A2']
        totalPrice: { type: Number, required: true },
        paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
        stripeSessionId: { type: String },
        paymentId: { type: String }, // Stripe Charge Id
    },
    { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
