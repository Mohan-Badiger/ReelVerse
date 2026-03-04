import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
    row: String, // 'A', 'B'
    number: Number, // 1, 2
    seatId: String, // 'A1'
    isBooked: { type: Boolean, default: false },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

const showSchema = new mongoose.Schema(
    {
        movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
        theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
        date: { type: Date, required: true },
        time: { type: String, required: true }, // like '10:00 AM'
        ticketPrice: { type: Number, required: true },
        seats: [seatSchema], // all seats generated for this specific show
    },
    { timestamps: true }
);

export default mongoose.model('Show', showSchema);
