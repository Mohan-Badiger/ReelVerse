import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Theatre from '../models/Theatre.js';

dotenv.config();

const theatres = [
    {
        name: "PVR Nexus (Forum Mall)",
        location: "Koramangala, Bengaluru",
        screens: 11,
        facilities: ["IMAX", "Gold Class", "Dolby Atmos", "Food Court"]
    },
    {
        name: "INOX Mantri Square Mall",
        location: "Malleshwaram, Bengaluru",
        screens: 6,
        facilities: ["Insignia", "Dolby Atmos", "Recliners", "Food"]
    },
    {
        name: "Cinepolis Meenakshi Mall",
        location: "Bannerghatta Road, Bengaluru",
        screens: 4,
        facilities: ["VIP Seating", "Dolby 7.1", "Café", "Parking"]
    },
    {
        name: "Urvashi Digital Cinema",
        location: "Lalbagh Road, Bengaluru",
        screens: 1,
        facilities: ["4K Projection", "Dolby Atmos", "Large Screen"]
    },
    {
        name: "PVR Orion Mall",
        location: "Rajajinagar, Bengaluru",
        screens: 11,
        facilities: ["PVR P[XL]", "Gold Class", "Dolby Atmos", "IMAX"]
    },
    {
        name: "Gopalan Cinemas Innovation Mall",
        location: "JP Nagar, Bengaluru",
        screens: 4,
        facilities: ["Standard", "Dolby 5.1", "Food Stall"]
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
