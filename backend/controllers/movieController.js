import Movie from '../models/Movie.js';
import Reminder from '../models/Reminder.js';
import { uploadFromBuffer } from '../utils/uploadService.js';

// @desc    Get all movies (Now Showing)
// @route   GET /api/movies
// @access  Public
export const getMovies = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Movies are "Now Showing" if their release date is today or in the past
        const movies = await Movie.find({
            releaseDate: { $lte: today }
        }).sort({ releaseDate: -1 });

        // Update isUpcoming flag dynamically for client consistency
        const updatedMovies = movies.map(movie => {
            const movieObj = movie.toObject();
            movieObj.isUpcoming = false;
            return movieObj;
        });

        res.json(updatedMovies);
    } catch (error) {
        next(error);
    }
};

// @desc    Get upcoming movies
// @route   GET /api/movies/upcoming
// @access  Public
export const getUpcomingMovies = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Upcoming movies are those with a release date in the future
        const movies = await Movie.find({
            releaseDate: { $gt: today }
        }).sort({ releaseDate: 1 });

        // Update isUpcoming flag dynamically for client consistency
        const updatedMovies = movies.map(movie => {
            const movieObj = movie.toObject();
            movieObj.isUpcoming = true;
            return movieObj;
        });

        res.json(updatedMovies);
    } catch (error) {
        next(error);
    }
};

// @desc    Get movie by ID
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (movie) {
            const movieObj = movie.toObject();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            movieObj.isUpcoming = new Date(movieObj.releaseDate) > today;
            
            res.json(movieObj);
        } else {
            res.status(404);
            return next(new Error('Movie not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a movie
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res, next) => {
    try {
        const { title, description, duration, language, releaseDate, genre, director, cast, rating, isUpcoming, trailerUrl } = req.body;

        let posterUrl = '';

        if (req.file) {
            const result = await uploadFromBuffer(req);
            posterUrl = result.secure_url;
        }

        const movieReleaseDate = new Date(releaseDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const autoIsUpcoming = movieReleaseDate > today;

        const movie = new Movie({
            title,
            description,
            duration,
            language,
            releaseDate,
            genre: genre ? JSON.parse(genre) : [],
            director,
            cast: cast ? JSON.parse(cast) : [],
            rating: rating || 0,
            isUpcoming: autoIsUpcoming,
            trailerUrl: trailerUrl || '',
            posterUrl: posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster',
        });

        const createdMovie = await movie.save();
        res.status(201).json(createdMovie);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res, next) => {
    try {
        const { title, description, duration, language, releaseDate, genre, director, cast, isUpcoming, trailerUrl } = req.body;

        const movie = await Movie.findById(req.params.id);

        if (movie) {
            movie.title = title || movie.title;
            movie.description = description || movie.description;
            movie.duration = duration || movie.duration;
            movie.language = language || movie.language;
            if (releaseDate) {
                movie.releaseDate = releaseDate;
                const movieReleaseDate = new Date(releaseDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                movie.isUpcoming = movieReleaseDate > today;
            }

            movie.genre = genre ? JSON.parse(genre) : movie.genre;
            movie.director = director || movie.director;
            movie.cast = cast ? JSON.parse(cast) : movie.cast;

            if (trailerUrl !== undefined) {
                movie.trailerUrl = trailerUrl;
            }

            if (req.file) {
                const result = await uploadFromBuffer(req);
                movie.posterUrl = result.secure_url;
            }

            const updatedMovie = await movie.save();
            res.json(updatedMovie);
        } else {
            res.status(404);
            return next(new Error('Movie not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (movie) {
            await Movie.deleteOne({ _id: movie._id });
            res.json({ message: 'Movie removed' });
        } else {
            res.status(404);
            return next(new Error('Movie not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Add reminder for a movie
// @route   POST /api/movies/:id/remind
// @access  Private
export const addReminder = async (req, res, next) => {
    try {
        const movieId = req.params.id;
        const userId = req.user._id;

        const movie = await Movie.findById(movieId);
        if (!movie) {
            res.status(404);
            return next(new Error('Movie not found'));
        }

        const existingReminder = await Reminder.findOne({ user: userId, movie: movieId });

        if (existingReminder) {
            await Reminder.deleteOne({ _id: existingReminder._id });
            return res.status(200).json({ message: 'Reminder removed successfully!', action: 'removed' });
        }

        const reminder = new Reminder({
            user: userId,
            movie: movieId
        });

        await reminder.save();
        res.status(201).json({ message: 'Reminder set successfully!', action: 'added' });
    } catch (error) {
        next(error);
    }
};
