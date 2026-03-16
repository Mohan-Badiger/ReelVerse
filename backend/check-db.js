import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Booking from './models/Booking.js';
import Show from './models/Show.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const checkData = async () => {
    try {
        await connectDB();
        
        const bookingCount = await Booking.countDocuments();
        const bookingsWithMovie = await Booking.countDocuments({ movie: { $exists: true } });
        const bookingsWithoutMovie = await Booking.countDocuments({ movie: { $exists: false } });
        
        console.log(`Total Bookings: ${bookingCount}`);
        console.log(`Bookings with movie field: ${bookingsWithMovie}`);
        console.log(`Bookings without movie field: ${bookingsWithoutMovie}`);
        
        if (bookingsWithoutMovie > 0) {
            const sample = await Booking.findOne({ movie: { $exists: false } }).populate('show');
            if (sample) {
                console.log('Sample booking without movie:');
                console.log(`ID: ${sample._id}`);
                console.log(`Show: ${sample.show ? sample.show._id : 'null'}`);
                if (sample.show) {
                    console.log(`Show Movie: ${sample.show.movie}`);
                }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

checkData();
