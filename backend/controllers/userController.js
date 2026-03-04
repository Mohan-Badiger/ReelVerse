import User from '../models/User.js';
import sendEmail from '../utils/emailService.js';
import crypto from 'crypto';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(404);
            return next(new Error('User not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('+password');

        if (user) {
            user.name = req.body.name || user.name;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404);
            return next(new Error('User not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot Password
// @route   POST /api/users/forgotpassword
// @access  Public
export const forgotPassword = async (req, res, next) => {
    try {
        let { email } = req.body;

        if (!email) {
            res.status(400);
            return next(new Error('Please provide an email'));
        }

        email = email.toLowerCase().trim();

        const user = await User.findOne({ email });

        if (!user) {
            res.status(404);
            return next(new Error('There is no user with that email'));
        }

        // Get reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save({ validateBeforeSave: false });

        // Create reset url
        const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

        const message = `
      <h1>You have requested a password reset</h1>
      <p>Please make a PUT request to: \n\n ${resetUrl}</p>
    `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message,
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            res.status(500);
            return next(new Error('Email could not be sent'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Reset Password
// @route   PUT /api/users/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        }).select('+password');

        if (!user) {
            res.status(400);
            return next(new Error('Invalid token'));
        }

        if (!req.body.password) {
            res.status(400);
            return next(new Error('Please provide a new password'));
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
        });
    } catch (error) {
        next(error);
    }
};
