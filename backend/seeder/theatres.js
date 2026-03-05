import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Theatre from '../models/Theatre.js';

dotenv.config();

const theatres = [
    {
        name: "PVR Cinemas",
        location: "Mumbai, Maharashtra",
        screens: 4,
        facilities: ["IMAX", "3D", "Dolby Atmos", "Food"]
    },
    {
        name: "INOX Laserplex",
        location: "Delhi, NCR",
        screens: 6,
        facilities: ["4DX", "Laser", "Dolby Atmos"]
    },
    {
        name: "Cinepolis",
        location: "Bangalore, Karnataka",
        screens: 5,
        facilities: ["VIP Seating", "Dolby 7.1", "Food"]
    }
];

const seedTheatres = async () => {
    try {
        await connectDB();
        await Theatre.deleteMany(); // Clear existing
        await Theatre.insertMany(theatres);
        console.log('Theatres Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedTheatres();
