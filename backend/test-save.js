import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const user = await User.findOne({ email: 'test@example.com' });
        if (user) {
            user.isVerified = true;
            user.otp = undefined;
            user.otpExpire = undefined;
            await user.save({ validateBeforeSave: false });
            console.log("Success");
        } else {
            console.log("User not found");
        }
    } catch (err) {
        console.error("Error:", err);
    } finally {
        mongoose.disconnect();
    }
});
