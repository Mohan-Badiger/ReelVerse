import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import { generateMovieVibeSummary, enhanceReviewText } from '../utils/aiService.js';

// @desc    Create new review
// @route   POST /api/reviews/:movieId
// @access  Private
export const createMovieReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const movieId = req.params.movieId;

        const userBookings = await Booking.find({ user: req.user._id, paymentStatus: 'Completed' }).populate('show');

        let hasBookedMovie = false;
        let hasOrphanedBooking = false;

        for (const booking of userBookings) {
            const bookedMovieId = booking.movie ? booking.movie.toString() : (booking.show?.movie ? booking.show.movie.toString() : null);
            
            if (bookedMovieId === movieId) {
                hasBookedMovie = true;
                break;
            }
            
            // If movie link is missing AND show is gone, it's an orphaned booking from before our fix
            if (!bookedMovieId && !booking.show) {
                hasOrphanedBooking = true;
            }
        }

        // Allow review if we found the movie OR if they have an orphaned booking (legacy support)
        if (!hasBookedMovie && !hasOrphanedBooking) {
            res.status(400);
            return next(new Error('You can only review movies you have successfully booked.'));
        }

        const movie = await Movie.findById(movieId);

        if (!movie) {
            res.status(404);
            return next(new Error('Target movie not found in database.'));
        }

        // Check if user already reviewed
        const alreadyReviewed = await Review.findOne({ user: req.user._id, movie: movieId });

        if (alreadyReviewed) {
            res.status(400);
            return next(new Error('You have already submitted a review for this movie. Multiple reviews are not allowed.'));
        }

        const review = new Review({
            user: req.user._id,
            movie: movieId,
            rating: Number(rating),
            comment,
        });

        await review.save();

        // Update movie's average rating
        const allReviews = await Review.find({ movie: movieId });
        const numReviews = allReviews.length;
        const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

        movie.rating = avgRating;
        await movie.save(); // Assuming we update Movie model with rating later or it already has one

        // Asynchronously generate AI Vibe Tags and Summary in the background
        (async () => {
            try {
                const updatedReviews = await Review.find({ movie: movieId });
                const aiResult = await generateMovieVibeSummary(movie.title, updatedReviews);
                if (aiResult) {
                    movie.vibeTags = aiResult.vibeTags || [];
                    movie.aiSummary = aiResult.aiSummary || '';
                    await movie.save();
                }
            } catch (aiError) {
                console.error("Failed to generate background AI summary:", aiError);
            }
        })();

        res.status(201).json({ message: 'Review added' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reviews for a movie
// @route   GET /api/reviews/:movieId
// @access  Public
export const getMovieReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ movie: req.params.movieId }).populate('user', 'name');
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteMovieReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            res.status(404);
            return next(new Error('Review not found'));
        }

        const movieId = review.movie;
        await Review.deleteOne({ _id: review._id });

        // Update movie's average rating
        const allReviews = await Review.find({ movie: movieId });
        const numReviews = allReviews.length;
        const avgRating = numReviews > 0 ? allReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;

        await Movie.findByIdAndUpdate(movieId, { rating: avgRating });

        res.json({ message: 'Review removed' });
    } catch (error) {
        next(error);
    }
};

// @desc    Enhance review text with AI
// @route   POST /api/reviews/enhance
// @access  Private
export const enhanceReview = async (req, res, next) => {
    try {
        const { draftText } = req.body;
        
        if (!draftText) {
            res.status(400);
            return next(new Error('Please provide draft text to enhance'));
        }

        const enhancedText = await enhanceReviewText(draftText);
        
        res.json({ enhancedText });
    } catch (error) {
        next(error);
    }
};
