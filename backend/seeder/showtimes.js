import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';

dotenv.config();

// Helper to generate seats
const generateSeats = (seatCount = 120) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    let seats = [];
    let currentRow = 0;
    let currentNumber = 1;
    const seatsPerRow = 12;

    for (let i = 0; i < seatCount; i++) {
        seats.push({
            row: rows[currentRow],
            number: currentNumber,
            seatId: `${rows[currentRow]}${currentNumber}`,
            isBooked: i % 10 === 0, // Book every 10th seat for demo
            bookedBy: null
        });

        currentNumber++;
        if (currentNumber > seatsPerRow) {
            currentNumber = 1;
            currentRow++;
            if (currentRow >= rows.length) {
                currentRow = 0;
            }
        }
    }
    return seats;
};

const seedShowtimes = async () => {
    try {
        await connectDB();
        await Show.deleteMany();

        const movies = await Movie.find();
        const theatres = await Theatre.find();

        if (movies.length === 0 || theatres.length === 0) {
            console.error('Movies and Theatres must be seeded before showtimes!');
            process.exit(1);
        }

        const showtimes = [];

        // Distribute showtimes generically
        for (let i = 0; i < movies.length; i++) {
            for (let j = 0; j < theatres.length; j++) {
                showtimes.push({
                    movie: movies[i]._id,
                    theatre: theatres[j]._id,
                    date: new Date(new Date().setHours(0, 0, 0, 0)), // Today
                    time: "10:30 AM",
                    ticketPrice: 250,
                    seats: generateSeats(120)
                });
                showtimes.push({
                    movie: movies[i]._id,
                    theatre: theatres[j]._id,
                    date: new Date(new Date().setHours(0, 0, 0, 0)), // Today
                    time: "02:00 PM",
                    ticketPrice: 300,
                    seats: generateSeats(120)
                });
                showtimes.push({
                    movie: movies[i]._id,
                    theatre: theatres[j]._id,
                    date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0), // Tomorrow
                    time: "06:30 PM",
                    ticketPrice: 350,
                    seats: generateSeats(120)
                });
            }
        }

        await Show.insertMany(showtimes);
        console.log('Showtimes Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedShowtimes();
