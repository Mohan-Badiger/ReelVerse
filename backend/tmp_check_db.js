import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/db.js';
import Show from './models/Show.js';

const check = async () => {
    try {
        console.log('Connecting to DB with URI:', process.env.MONGO_URI ? 'Set' : 'Not Set');
        await connectDB();
        const shows = await Show.find().populate('movie').populate('theatre');
        console.log(`Found ${shows.length} shows in DB.`);
        if (shows.length > 0) {
            console.log('Sample show:', JSON.stringify({
                id: shows[0]._id,
                movie: shows[0].movie?.title,
                theatre: shows[0].theatre?.name,
                date: shows[0].date
            }, null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
};

check();
