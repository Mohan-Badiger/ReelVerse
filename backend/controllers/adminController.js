import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Booking from '../models/Booking.js';
import generateAdminToken from '../utils/generateAdminToken.js';

// @desc    Auth admin / set token
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res, next) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            return next(new Error('Please provide an email and password'));
        }

        email = email.toLowerCase().trim();

        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            res.status(401);
            return next(new Error('Invalid email or password'));
        }

        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            res.status(401);
            return next(new Error('Invalid email or password'));
        }

        generateAdminToken(res, admin._id);

        res.status(200).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        });

    } catch (error) {
        console.error('Admin Login Error:', error);
        next(error);
    }
};

// @desc    Logout admin
// @route   POST /api/admin/logout
// @access  Private (Admin)
export const logoutAdmin = (req, res) => {
    res.cookie('adminJwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ message: 'Admin logged out successfully' });
};

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req, res, next) => {
    try {
        const usersCount = await User.countDocuments();
        const moviesCount = await Movie.countDocuments();
        const bookingsCount = await Booking.countDocuments();

        // Calculate total revenue from successful bookings
        const bookings = await Booking.find({ status: 'confirmed' });
        const totalRevenue = bookings.reduce((acc, curr) => acc + curr.totalPrice, 0);

        res.status(200).json({
            metrics: {
                users: usersCount,
                movies: moviesCount,
                bookings: bookingsCount,
                revenue: totalRevenue
            },
            message: 'Dashboard data fetched'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            return next(new Error('User not found'));
        }

        await User.deleteOne({ _id: user._id });
        res.status(200).json({ message: 'User removed successfully' });
    } catch (error) {
        next(error);
    }
};
