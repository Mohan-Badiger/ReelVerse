import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';

// @desc    Create new review
// @route   POST /api/reviews/:movieId
// @access  Private
export const createMovieReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const movieId = req.params.movieId;

        // Ensure user actually booked this movie
        const userBookings = await Booking.find({ user: req.user._id, paymentStatus: 'Completed' }).populate('show');

        let hasBookedMovie = false;
        for (const booking of userBookings) {
            if (booking.show && booking.show.movie.toString() === movieId) {
                hasBookedMovie = true;
                break;
            }
        }

        if (!hasBookedMovie) {
            res.status(400);
            return next(new Error('You can only review movies you have booked.'));
        }

        const movie = await Movie.findById(movieId);

        if (!movie) {
            res.status(404);
            return next(new Error('Movie not found'));
        }

        // Check if user already reviewed
        const alreadyReviewed = await Review.findOne({ user: req.user._id, movie: movieId });

        if (alreadyReviewed) {
            res.status(400);
            return next(new Error('You have already reviewed this movie'));
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
