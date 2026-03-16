import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import connectDB from '../config/db.js';

dotenv.config({ path: 'c:/Users/mohan/Documents/Projects/fotx studios/ReelVerse/backend/.env' });

const backfillBookings = async () => {
    try {
        await connectDB();

        console.log('Fetching bookings without movie field...');
        const bookings = await Booking.find({ movie: { $exists: false } }).populate('show');
        
        console.log(`Found ${bookings.length} bookings to backfill.`);

        let successCount = 0;
        let failCount = 0;

        for (const booking of bookings) {
            if (booking.show && booking.show.movie) {
                booking.movie = booking.show.movie;
                await booking.save();
                successCount++;
            } else {
                console.warn(`Could not backfill booking ${booking._id}: Show not found or movie missing.`);
                failCount++;
            }
        }

        console.log(`Backfill complete. Success: ${successCount}, Failed: ${failCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Backfill failed:', error);
        process.exit(1);
    }
};

backfillBookings();
