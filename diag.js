import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './backend/.env' });

const run = async () => {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        
        log('--- DATABASE DIAGNOSTICS ---');
        
        const bookingCount = await db.collection('bookings').countDocuments();
        log(`Total bookings: ${bookingCount}`);
        
        const bookings = await db.collection('bookings').find({}).limit(10).toArray();
        log('Sample bookings (first 10):');
        bookings.forEach(b => {
            log(`- ID: ${b._id}, User: ${b.user}, Movie: ${b.movie}, Show: ${b.show}, Status: ${b.paymentStatus}`);
        });

        const bookingsWithMovie = await db.collection('bookings').countDocuments({ movie: { $exists: true } });
        log(`Bookings with movie field: ${bookingsWithMovie}`);

        const bookingsCompleted = await db.collection('bookings').countDocuments({ paymentStatus: 'Completed' });
        log(`Bookings with status Completed: ${bookingsCompleted}`);

        fs.writeFileSync('diag_output.txt', output);
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('diag_output.txt', 'ERROR: ' + e.message);
        process.exit(1);
    }
};

run();
