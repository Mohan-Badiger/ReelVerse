import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Movie from '../models/Movie.js';

dotenv.config();

const movies = [
    {
        title: "Kantara",
        description: "When greed paves the way for betrayal, scheming and murder, a young tribal reluctantly dons the traditions of his ancestors to seek justice.",
        genre: ["Action", "Drama", "Thriller"],
        duration: 148,
        language: "Kannada",
        releaseDate: new Date("2022-09-30"),
        director: "Rishab Shetty",
        cast: ["Rishab Shetty", "Sapthami Gowda", "Kishore"],
        posterUrl: "https://image.tmdb.org/t/p/w500/u907NAs0fAsZ9Y7C4YpE9uYv76p.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/original/m9mU8N4vW20p3B5fH6lU5v1R8vP.jpg",
        rating: 8.5
    },
    {
        title: "KGF: Chapter 2",
        description: "In the blood-soaked Kolar Gold Fields, Rocky's name strikes fear into his foes. While his allies look up to him, the government sees him as a threat to law and order.",
        genre: ["Action", "Crime", "Drama"],
        duration: 168,
        language: "Kannada",
        releaseDate: new Date("2022-04-14"),
        director: "Prashanth Neel",
        cast: ["Yash", "Sanjay Dutt", "Raveena Tandon"],
        posterUrl: "https://image.tmdb.org/t/p/w500/3U6m1G9m5Y9O9P0Y9u5X6B6Y8u.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/original/fI8y6e0S8v7O8v7O8v7O8v7O8v7.jpg",
        rating: 8.4
    },
    {
        title: "Manjummel Boys",
        description: "A group of friends get into a daring rescue mission to save their friend from the Guna Caves, a perilously deep pit from where no one has ever returned.",
        genre: ["Adventure", "Thriller", "Survival"],
        duration: 135,
        language: "Malayalam",
        releaseDate: new Date("2024-02-22"),
        director: "Chidambaram",
        cast: ["Soubin Shahir", "Sreenath Bhasi", "Balu Varghese"],
        posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        backdropUrl: "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        rating: 8.6
    },
    {
        title: "Vaazha II",
        description: "A coming-of-age comedy drama that follows the hilarious and emotional journey of a billion bros in rural Kerala.",
        genre: ["Comedy", "Drama"],
        duration: 142,
        language: "Malayalam",
        releaseDate: new Date("2026-06-15"),
        director: "Vijay Babu",
        cast: ["Hashir H.", "Alan Bin Siraj", "Ajin Joy"],
        posterUrl: "/vaazha_2_poster_1778494734696.png",
        rating: 0,
        isUpcoming: true
    },
    {
        title: "KD: The Devil",
        description: "A gritty action crime thriller set in the 1970s Bangalore underworld, where power and blood dictate the law.",
        genre: ["Action", "Crime", "Thriller"],
        duration: 155,
        language: "Kannada",
        releaseDate: new Date("2026-05-30"),
        director: "Prem",
        cast: ["Dhruva Sarja", "Sanjay Dutt", "Shilpa Shetty"],
        posterUrl: "/kd_the_devil_poster_1778494754839.png",
        rating: 0,
        isUpcoming: true
    },
    {
        title: "Jana Nayagan",
        description: "A high-stakes political action thriller starring Vijay as a charismatic leader fighting against systemic corruption.",
        genre: ["Action", "Thriller", "Political"],
        duration: 162,
        language: "Tamil",
        releaseDate: new Date("2026-06-22"),
        director: "Gautham Vasudev Menon",
        cast: ["Vijay", "Pooja Hegde", "Bobby Deol"],
        posterUrl: "/jana_nayagan_poster_v2_1778494795724.png",
        rating: 0,
        isUpcoming: true
    },
    {
        title: "Toxic",
        description: "A fairy tale for grown-ups set in the dark underworld of the global drug trade, following a man's rise to power.",
        genre: ["Action", "Crime", "Drama"],
        duration: 170,
        language: "Kannada",
        releaseDate: new Date("2026-08-15"),
        director: "Geetu Mohandas",
        cast: ["Yash", "Kiara Advani", "Nayanthara"],
        posterUrl: "/toxic_movie_poster_1778494813844.png",
        rating: 0,
        isUpcoming: true
    },
    {
        title: "Cult",
        description: "A stylish high-octane action drama exploring the influence of underground subcultures in modern society.",
        genre: ["Action", "Drama"],
        duration: 148,
        language: "Kannada",
        releaseDate: new Date("2026-05-25"),
        director: "Zaid Khan",
        cast: ["Zaid Khan", "Rachita Ram", "Malaika Vasupal"],
        posterUrl: "/cult_movie_poster_1778494835259.png",
        rating: 0,
        isUpcoming: true
    }
];

const seedMovies = async () => {
    try {
        await connectDB();
        await Movie.deleteMany(); // Clear existing
        await Movie.insertMany(movies);
        console.log('Movies Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedMovies();
