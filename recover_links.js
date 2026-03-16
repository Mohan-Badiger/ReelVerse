import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './backend/.env' });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        
        const userId = "67d53344607775080f4f9104"; // From previous debug info if available, or I'll just search all
        const targetMovieId = "69b15858fc67d8a1520d724b";

        console.log('Searching for bookings with null movie link...');
        const bookings = await db.collection('bookings').find({ 
            movie: null,
            paymentStatus: 'Completed'
        }).toArray();

        console.log(`Found ${bookings.length} potential bookings.`);

        for (const b of bookings) {
            console.log(`Booking ID: ${b._id}, Show ID: ${b.show}`);
            // Let's see if the show still exists
            const show = await db.collection('shows').findOne({ _id: b.show });
            if (show) {
                console.log(`  - Show exists! Movie in show: ${show.movie}`);
                if (show.movie.toString() === targetMovieId) {
                    console.log(`  - MATCH FOUND! Updating booking...`);
                    await db.collection('bookings').updateOne({ _id: b._id }, { $set: { movie: show.movie } });
                    console.log(`  - Updated!`);
                }
            } else {
                console.log(`  - Show ${b.show} has been deleted.`);
            }
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
