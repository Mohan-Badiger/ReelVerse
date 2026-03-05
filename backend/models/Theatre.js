import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        location: { type: String, required: true },
        screens: { type: Number, required: true, default: 1 },
        facilities: { type: [String] }, // e.g., IMAX, 3D, Food
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model('Theatre', theatreSchema);
