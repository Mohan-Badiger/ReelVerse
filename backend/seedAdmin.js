import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const seedAdmin = async () => {
    try {
        await Admin.deleteMany({}); // Clears existing admins

        const admin = await Admin.create({
            name: 'Super Admin',
            email: process.env.ADMIN_EMAIL || 'admin@mohan.com',
            password: process.env.ADMIN_PASSWORD || 'admin@123',
        });

        console.log(`Admin account created with email: ${admin.email}`);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
