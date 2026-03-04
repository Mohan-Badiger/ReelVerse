import Show from '../models/Show.js';
import Theatre from '../models/Theatre.js';

// Helper to generate seats based on generic configuration
const generateSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const columns = 12;
    let seats = [];

    for (let r = 0; r < rows.length; r++) {
        for (let c = 1; c <= columns; c++) {
            seats.push({
                row: rows[r],
                number: c,
                seatId: `${rows[r]}${c}`,
                isBooked: false,
            });
        }
    }
    return seats;
};

// @desc    Get all shows for a movie
// @route   GET /api/shows/movie/:movieId
// @access  Public
export const getShowsByMovie = async (req, res, next) => {
    try {
        const shows = await Show.find({ movie: req.params.movieId }).populate('theatre', 'name city address facilities');
        res.json(shows);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single show details (includes seat map)
// @route   GET /api/shows/:id
// @access  Public
export const getShowById = async (req, res, next) => {
    try {
        const show = await Show.findById(req.params.id)
            .populate('movie', 'title posterUrl duration language')
            .populate('theatre', 'name city address');

        if (show) {
            res.json(show);
        } else {
            res.status(404);
            return next(new Error('Show not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a show
// @route   POST /api/shows
// @access  Private/Admin
export const createShow = async (req, res, next) => {
    try {
        const { movie, theatre, date, time, ticketPrice } = req.body;

        const theatreExists = await Theatre.findById(theatre);
        if (!theatreExists) {
            res.status(404);
            return next(new Error('Theatre not found'));
        }

        const seats = generateSeats();

        const show = new Show({
            movie,
            theatre,
            date,
            time,
            ticketPrice,
            seats,
        });

        const createdShow = await show.save();
        res.status(201).json(createdShow);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a show
// @route   DELETE /api/shows/:id
// @access  Private/Admin
export const deleteShow = async (req, res, next) => {
    try {
        const show = await Show.findById(req.params.id);

        if (show) {
            await Show.deleteOne({ _id: show._id });
            res.json({ message: 'Show removed' });
        } else {
            res.status(404);
            return next(new Error('Show not found'));
        }
    } catch (error) {
        next(error);
    }
};
