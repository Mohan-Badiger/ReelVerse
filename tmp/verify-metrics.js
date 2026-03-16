import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../backend/models/Booking.js';
import User from '../backend/models/User.js';
import Movie from '../backend/models/Movie.js';

dotenv.config({ path: '../backend/.env' });

async function verifyMetrics() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Check total completed revenue
        const completedBookings = await Booking.find({ paymentStatus: 'Completed' });
        const expectedRevenue = completedBookings.reduce((acc, b) => acc + b.totalPrice, 0);
        const expectedCount = completedBookings.length;

        console.log(`Expected Total Revenue: ₹${expectedRevenue}`);
        console.log(`Expected Completed Bookings Count: ${expectedCount}`);

        // 2. Check 7-day trend logic (simulation of the controller logic)
        const chartDataMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const localKey = `${year}-${month}-${day}`;
            
            chartDataMap[localKey] = { name: d.toLocaleDateString('en-US', { weekday: 'short' }), bookings: 0, revenue: 0 };
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentBookings = await Booking.find({
            paymentStatus: 'Completed',
            createdAt: { $gte: sevenDaysAgo }
        });

        recentBookings.forEach(b => {
            const bDate = new Date(b.createdAt);
            const year = bDate.getFullYear();
            const month = String(bDate.getMonth() + 1).padStart(2, '0');
            const day = String(bDate.getDate()).padStart(2, '0');
            const localKey = `${year}-${month}-${day}`;
            
            if (chartDataMap[localKey]) {
                chartDataMap[localKey].revenue += b.totalPrice;
                chartDataMap[localKey].bookings += 1;
            }
        });

        console.log('Generated Chart Data (Sample):', Object.values(chartDataMap).slice(0, 2));

        await mongoose.disconnect();
        console.log('Done');
    } catch (error) {
        console.error('Error during verification:', error);
        process.exit(1);
    }
}

verifyMetrics();
