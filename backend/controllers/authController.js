import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/emailService.js';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getOtpEmailTemplate = (otp, type = 'Registration') => `
<div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; padding: 40px 20px; color: #f8fafc; min-height: 100vh;">
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1e293b, #0f172a); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.1);">
        <div style="background: linear-gradient(to right, #4f46e5, #6366f1); padding: 30px; text-align: center; position: relative; overflow: hidden;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; position: relative; z-index: 1;">ReelVerse Auth</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px; position: relative; z-index: 1;">Secure Account ${type}</p>
        </div>
        <div style="padding: 40px 30px; text-align: center;">
            <p style="font-size: 16px; margin-bottom: 25px; color: #cbd5e1;">Your one-time password for account verification is:</p>
            <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; display: inline-block; margin-bottom: 30px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                <h2 style="margin: 0; color: #10b981; font-size: 36px; letter-spacing: 8px; font-family: monospace;">${otp}</h2>
            </div>
            <p style="font-size: 14px; color: #94a3b8; margin: 0;">This code will expire in <strong style="color: #f8fafc;">10 minutes</strong>. Do not share it with anyone.</p>
        </div>
        <div style="background-color: #0f172a; padding: 25px; text-align: center; border-top: 1px dashed rgba(255,255,255,0.1);">
            <p style="color: #64748b; font-size: 12px; margin: 0;">If you did not request this, please ignore this email.<br/><br/><strong style="color: #94a3b8;">The ReelVerse Security Team</strong></p>
        </div>
    </div>
</div>
`;

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

        const message = getOtpEmailTemplate(otp, 'Registration');

        try {
            await sendEmail({
                email: user.email,
                subject: 'ReelVerse OTP Verification',
                message,
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            res.status(500);
            return next(new Error('Failed to send OTP email. Please check your SMTP App Password configuration.'));
        }

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
   RESEND OTP / SEND VERIFICATION
====================================================== */
export const sendVerification = async (req, res, next) => {
    try {
        let { email } = req.body;

        if (!email) {
            res.status(400);
            return next(new Error('Please provide email'));
        }

        email = email.toLowerCase().trim();
        const user = await User.findOne({ email });

        if (!user) {
            res.status(404);
            return next(new Error('User not found'));
        }

        if (user.isVerified) {
            res.status(400);
            return next(new Error('User is already verified'));
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otpHash;
        user.otpExpire = otpExpire;
        await user.save({ validateBeforeSave: false });

        const message = getOtpEmailTemplate(otp, 'Verification');

        try {
            await sendEmail({
                email: user.email,
                subject: 'ReelVerse OTP Verification',
                message,
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            res.status(500);
            return next(new Error('Failed to send OTP email. Please check your SMTP App Password configuration.'));
        }

        res.status(200).json({
            message: 'Verification OTP sent successfully.',
        });

    } catch (error) {
        console.error('Send Verification Error:', error);
        next(error);
    }
};

/* ======================================================
   VERIFY EMAIL OTP
====================================================== */
export const verifyEmail = async (req, res, next) => {
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
        secure: process.env.NODE_ENV !== 'development',
        sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax',
    });

    res.status(200).json({ message: 'User logged out successfully' });
};

/* ======================================================
   GOOGLE LOGIN
====================================================== */
export const googleLogin = async (req, res, next) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            res.status(400);
            return next(new Error('No Google credential provided'));
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            // audience is handled by client if GOOGLE_CLIENT_ID is provided
        });
        
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400);
            return next(new Error('Invalid Google credential payload'));
        }

        const { email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Register them automatically
            const randomPassword = crypto.randomBytes(16).toString('hex');
            user = await User.create({
                name,
                email,
                password: randomPassword,
                isVerified: true
            });
        }

        // If not verified but logging in via Google, automatically verify
        if (!user.isVerified) {
            user.isVerified = true;
            await user.save({ validateBeforeSave: false });
        }

        generateToken(res, user._id);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            picture,
            message: 'Logged in with Google successfully'
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401);
        next(new Error('Google Authentication Failed'));
    }
};