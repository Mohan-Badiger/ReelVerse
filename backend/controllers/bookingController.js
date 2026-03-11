import Booking from '../models/Booking.js';

// @desc    Get user bookings
// @access  Private
export const getUserBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate({
                path: 'show',
                populate: [
                    { path: 'movie', select: 'title posterUrl language' },
                    { path: 'theatre', select: 'name city' }
                ]
            })
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'name email')
            .populate({
                path: 'show',
                populate: [
                    { path: 'movie', select: 'title' },
                    { path: 'theatre', select: 'name' }
                ]
            })
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        next(error);
    }
};
