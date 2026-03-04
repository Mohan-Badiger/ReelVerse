import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        city: { type: String, required: true },
        address: { type: String, required: true },
        facilities: { type: [String] }, // e.g., IMAX, 3D, Food
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model('Theatre', theatreSchema);
