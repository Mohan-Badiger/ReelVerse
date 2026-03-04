import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        duration: { type: Number, required: true }, // in minutes
        language: { type: String, required: true },
        releaseDate: { type: Date, required: true },
        posterUrl: { type: String, required: true }, // Cloudinary URL
        backdropUrl: { type: String }, // For Netflix style hero section
        genre: { type: [String], required: true },
        director: { type: String },
        cast: { type: [String] },
    },
    { timestamps: true }
);

export default mongoose.model('Movie', movieSchema);
