import Show from '../models/Show.js';
import Theatre from '../models/Theatre.js';

// Helper to generate seats based on generic configuration
const generateSeats = (seatCount = 120) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    let seats = [];
    let currentRow = 0;
    let currentNumber = 1;
    const seatsPerRow = 12; // Static seats per row for simplicity, can be adjusted

    for (let i = 0; i < seatCount; i++) {
        seats.push({
            row: rows[currentRow],
            number: currentNumber,
            seatId: `${rows[currentRow]}${currentNumber}`,
            isBooked: false,
        });

        currentNumber++;
        if (currentNumber > seatsPerRow) {
            currentNumber = 1;
            currentRow++;
            if (currentRow >= rows.length) {
                currentRow = 0; // Wrap around if extremely large
            }
        }
    }
    return seats;
};

// @desc    Get all shows
// @route   GET /api/shows
// @access  Public
export const getAllShows = async (req, res, next) => {
    try {
        const shows = await Show.find()
            .populate('movie', 'title posterUrl duration language')
            .populate('theatre', 'name city address location screens');
        res.json(shows);
    } catch (error) {
        next(error);
    }
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
        const { movie, theatre, date, time, ticketPrice, seatCount } = req.body;

        const theatreExists = await Theatre.findById(theatre);
        if (!theatreExists) {
            res.status(404);
            return next(new Error('Theatre not found'));
        }

        const seats = generateSeats(seatCount ? Number(seatCount) : 120);

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

// @desc    Update a show
// @route   PUT /api/shows/:id
// @access  Private/Admin
export const updateShow = async (req, res, next) => {
    try {
        const { movie, theatre, date, time, ticketPrice, seatCount } = req.body;

        const show = await Show.findById(req.params.id);

        if (show) {
            show.movie = movie || show.movie;
            show.theatre = theatre || show.theatre;
            show.date = date || show.date;
            show.time = time || show.time;
            show.ticketPrice = ticketPrice || show.ticketPrice;

            if (seatCount) {
                show.seats = generateSeats(Number(seatCount));
            }

            const updatedShow = await show.save();
            res.json(updatedShow);
        } else {
            res.status(404);
            return next(new Error('Show not found'));
        }
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
