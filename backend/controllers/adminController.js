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
        const bookingsCount = await Booking.countDocuments({ paymentStatus: 'Completed' });

        // Calculate total revenue from successful bookings
        const allBookings = await Booking.find({ paymentStatus: 'Completed' });
        const totalRevenue = allBookings.reduce((acc, curr) => acc + curr.totalPrice, 0);

        // --- 7-Day Chart Data ---
        // Create an array of the last 7 days (including today) using local date strings
        const chartDataMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setHours(0, 0, 0, 0); // Start of day local time
            d.setDate(d.getDate() - i);
            
            // Generate a local YYYY-MM-DD key for consistent grouping
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const localKey = `${year}-${month}-${day}`;
            
            chartDataMap[localKey] = { 
                name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
                bookings: 0, 
                revenue: 0, 
                dateFull: localKey 
            };
        }

        // Only consider bookings from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentChartBookings = await Booking.find({
            paymentStatus: 'Completed',
            createdAt: { $gte: sevenDaysAgo }
        });

        recentChartBookings.forEach(b => {
            const bDate = new Date(b.createdAt);
            const year = bDate.getFullYear();
            const month = String(bDate.getMonth() + 1).padStart(2, '0');
            const day = String(bDate.getDate()).padStart(2, '0');
            const localKey = `${year}-${month}-${day}`;
            
            if (chartDataMap[localKey]) {
                chartDataMap[localKey].revenue += b.totalPrice;
                chartDataMap[localKey].bookings += 1;
            }
        });

        const chartData = Object.values(chartDataMap);

        // --- Recent Activity Feed ---
        // Top 5 most recent bookings
        const recentBookings = await Booking.find()
            .populate('user', 'name')
            .populate('show', 'movie') // Assuming show refs movie, but movie might not be directly here unless deep populated
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Let's also fetch top 5 recent users
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        // Combine them into a single timeline feed
        const activityFeed = [];

        recentBookings.forEach(b => {
            activityFeed.push({
                _id: 'b_' + b._id,
                type: 'booking',
                message: `${b.user?.name || 'A user'} booked tickets for ₹${b.totalPrice}.`,
                timestamp: b.createdAt
            });
        });

        recentUsers.forEach(u => {
            activityFeed.push({
                _id: 'u_' + u._id,
                type: 'user',
                message: `New user registered: ${u.name}.`,
                timestamp: u.createdAt
            });
        });

        // Sort combined feed descending and take top 5
        activityFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const finalActivityFeed = activityFeed.slice(0, 5);

        res.status(200).json({
            metrics: {
                users: usersCount,
                movies: moviesCount,
                bookings: bookingsCount,
                revenue: totalRevenue
            },
            chartData,
            recentActivity: finalActivityFeed,
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
