import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/emailService.js';
import crypto from 'crypto';

/* ======================================================
   REGISTER USER & SEND OTP
====================================================== */
export const registerUser = async (req, res, next) => {
    try {
        let { name, email, password } = req.body;

        if (!name || !email || !password) {
            res.status(400);
            return next(new Error('Please provide name, email, and password'));
        }

        email = email.toLowerCase().trim();

        const userExists = await User.findOne({ email });

        if (userExists && userExists.isVerified) {
            res.status(400);
            return next(new Error('User already exists and is verified'));
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

        let user;

        if (userExists && !userExists.isVerified) {
            userExists.name = name;
            userExists.password = password;
            userExists.otp = otpHash;
            userExists.otpExpire = otpExpire;

            user = await userExists.save();
        } else {
            user = await User.create({
                name,
                email,
                password,
                otp: otpHash,
                otpExpire,
            });
        }

        const message = `
            <h1>ReelVerse Registration OTP</h1>
            <p>Your OTP for account verification is:</p>
            <h2>${otp}</h2>
            <p>This OTP is valid for 10 minutes.</p>
        `;

        await sendEmail({
            email: user.email,
            subject: 'ReelVerse OTP Verification',
            message,
        });

        res.status(201).json({
            message: 'OTP sent successfully. Please verify your email.',
            email: user.email,
        });

    } catch (error) {
        console.error('Register Error:', error);
        next(error);
    }
};

/* ======================================================
   VERIFY OTP
====================================================== */
export const verifyOTP = async (req, res, next) => {
    try {
        let { email, otp } = req.body;

        if (!email || !otp) {
            res.status(400);
            return next(new Error('Please provide both email and OTP'));
        }

        email = email.toLowerCase().trim();
        const otpString = String(otp).trim();

        const user = await User.findOne({ email })
            .select('+otp +otpExpire +password');

        if (!user) {
            res.status(400);
            return next(new Error('User not found'));
        }

        if (!user.otp || !user.otpExpire) {
            res.status(400);
            return next(new Error('OTP not found. Please request a new one.'));
        }

        if (user.otpExpire < Date.now()) {
            res.status(400);
            return next(new Error('OTP has expired'));
        }

        const otpHash = crypto
            .createHash('sha256')
            .update(otpString)
            .digest('hex');

        if (user.otp !== otpHash) {
            res.status(400);
            return next(new Error('Invalid OTP'));
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;

        await user.save({ validateBeforeSave: false });

        generateToken(res, user._id);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

    } catch (error) {
        console.error('verifyOTP error:', error);
        next(error);
    }
};

/* ======================================================
   LOGIN USER
====================================================== */
export const loginUser = async (req, res, next) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            return next(new Error('Please provide email and password'));
        }

        email = email.toLowerCase().trim();

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            res.status(401);
            return next(new Error('Invalid email or password'));
        }

        if (!user.isVerified) {
            res.status(401);
            return next(new Error('Please verify your email first'));
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            res.status(401);
            return next(new Error('Invalid email or password'));
        }

        generateToken(res, user._id);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

    } catch (error) {
        console.error('Login Error:', error);
        next(error);
    }
};

/* ======================================================
   LOGOUT USER
====================================================== */
export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ message: 'User logged out successfully' });
};