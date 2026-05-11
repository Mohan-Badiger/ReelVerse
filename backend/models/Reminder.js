import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
        isSent: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Ensure a user can only have one reminder per movie
reminderSchema.index({ user: 1, movie: 1 }, { unique: true });

export default mongoose.model('Reminder', reminderSchema);
