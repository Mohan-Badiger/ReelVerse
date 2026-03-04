import Movie from '../models/Movie.js';
import { uploadFromBuffer } from '../utils/uploadService.js';

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
export const getMovies = async (req, res, next) => {
    try {
        const movies = await Movie.find({});
        res.json(movies);
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
            res.json(movie);
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
        const { title, description, duration, language, releaseDate, genre, director, cast, rating } = req.body;

        let posterUrl = '';

        if (req.file) {
            const result = await uploadFromBuffer(req);
            posterUrl = result.secure_url;
        }

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
        const { title, description, duration, language, releaseDate, genre, director, cast } = req.body;

        const movie = await Movie.findById(req.params.id);

        if (movie) {
            movie.title = title || movie.title;
            movie.description = description || movie.description;
            movie.duration = duration || movie.duration;
            movie.language = language || movie.language;
            movie.releaseDate = releaseDate || movie.releaseDate;
            movie.genre = genre ? JSON.parse(genre) : movie.genre;
            movie.director = director || movie.director;
            movie.cast = cast ? JSON.parse(cast) : movie.cast;

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
