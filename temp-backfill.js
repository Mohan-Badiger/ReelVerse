import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

let logStr = '';
const log = (msg) => {
    console.log(msg);
    logStr += msg + '\n';
};

dotenv.config({ path: './backend/.env' });

const bookingSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    movie: mongoose.Schema.Types.ObjectId,
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show_temp' },
    paymentStatus: String
}, { timestamps: true });

const showSchema = new mongoose.Schema({
    movie: mongoose.Schema.Types.ObjectId
});

const Booking = mongoose.model('Booking_temp', bookingSchema, 'bookings');
const Show = mongoose.model('Show_temp', showSchema, 'shows');

const run = async () => {
    try {
        log('Connecting to ' + process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        log('DB Connected');

        const bookings = await Booking.find({ movie: { $exists: false }, paymentStatus: 'Completed' }).populate('show');
        log(`Found ${bookings.length} bookings to backfill`);

        let count = 0;
        for (const b of bookings) {
            if (b.show && b.show.movie) {
                b.movie = b.show.movie;
                await b.save();
                count++;
            }
        }
        log(`Backfilled ${count} bookings`);
        fs.writeFileSync('backfill_log.txt', logStr);
        process.exit(0);
    } catch (e) {
        log('ERROR: ' + e.message);
        fs.writeFileSync('backfill_log.txt', logStr);
        process.exit(1);
    }
};

run();
