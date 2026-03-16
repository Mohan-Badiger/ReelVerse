import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

const logFile = 'c:/Users/mohan/Documents/Projects/fotx studios/ReelVerse/diag_results.txt';
let logData = '';
const log = (msg) => {
    console.log(msg);
    logData += msg + '\n';
};

// Try multiple possible paths for .env
const envPaths = ['./backend/.env', './.env', '../.env'];
let envLoaded = false;
for (const p of envPaths) {
    if (fs.existsSync(p)) {
        dotenv.config({ path: p });
        log(`Loaded env from ${p}`);
        envLoaded = true;
        break;
    }
}

if (!envLoaded) {
    fs.writeFileSync(logFile, 'CRITICAL: No .env file found!');
    process.exit(1);
}

const run = async () => {
    try {
        log('Connecting to MongoDB...');
        if (!process.env.MONGO_URI) {
            log('MONGO_URI is missing from env!');
            fs.writeFileSync(logFile, logData);
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        log('Successfully connected to MongoDB');

        const db = mongoose.connection.db;
        
        const bookingCount = await db.collection('bookings').countDocuments();
        const movieCount = await db.collection('movies').countDocuments();
        const showCount = await db.collection('shows').countDocuments();
        const userCount = await db.collection('users').countDocuments();

        log(`--- DATABASE COUNTS ---`);
        log(`Users: ${userCount}`);
        log(`Movies: ${movieCount}`);
        log(`Shows: ${showCount}`);
        log(`Bookings: ${bookingCount}`);

        const bookingsWithMovieField = await db.collection('bookings').countDocuments({ movie: { $exists: true } });
        log(`Bookings with direct movie link: ${bookingsWithMovieField}`);

        const completedBookings = await db.collection('bookings').countDocuments({ paymentStatus: 'Completed' });
        log(`Completed bookings: ${completedBookings}`);

        if (bookingCount > 0) {
            log('--- SAMPLE COMPLETED BOOKING ---');
            const sample = await db.collection('bookings').findOne({ paymentStatus: 'Completed' });
            if (sample) {
                log(JSON.stringify(sample, null, 2));
            } else {
                log('No completed bookings found.');
            }
        }

        fs.writeFileSync(logFile, logData);
        process.exit(0);
    } catch (e) {
        log('DIAGNOSTIC ERROR: ' + e.message);
        fs.writeFileSync(logFile, logData);
        process.exit(1);
    }
};

run();
