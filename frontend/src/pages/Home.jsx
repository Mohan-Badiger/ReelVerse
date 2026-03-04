import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Ticket, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import MovieCard from '../components/movies/MovieCard';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [heroMovie, setHeroMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await api.get('/movies');
                setMovies(res.data);
                if (res.data.length > 0) {
                    const randomIndex = Math.floor(Math.random() * res.data.length);
                    setHeroMovie(res.data[randomIndex]);
                }
            } catch (error) {
                console.error('Failed to fetch movies:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="w-10 h-10 border-4 border-white/10 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="-mt-16 w-full fade-in">
            {/* Cinematic Hero Section */}
            {heroMovie && (
                <div className="relative h-[85vh] w-full bg-base-950 border-b border-white/10">
                    <div className="absolute inset-0">
                        <img
                            src={heroMovie.backdropUrl || heroMovie.posterUrl}
                            alt={heroMovie.title}
                            className="w-full h-full object-cover opacity-40 object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/70 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-base-950 via-base-950/80 to-transparent"></div>
                    </div>

                    <div className="relative h-full flex flex-col justify-center px-6 md:px-12 max-w-[1400px] mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="max-w-3xl mt-12"
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <span className="bg-primary-500/10 text-primary-400 font-bold tracking-widest text-[10px] uppercase px-3 py-1 rounded-full border border-primary-500/20">
                                    Now Showing
                                </span>
                                <span className="px-2 py-0.5 bg-base-900 border border-white/10 rounded font-medium text-xs text-slate-300">
                                    {heroMovie.language}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
                                {heroMovie.title}
                            </h1>
                            <p className="text-lg text-slate-300 mb-10 line-clamp-3 leading-relaxed max-w-xl">
                                {heroMovie.description}
                            </p>

                            <div className="flex items-center space-x-4 flex-wrap">
                                <Link
                                    to={`/movie/${heroMovie._id}`}
                                    className="bg-white hover:bg-slate-200 text-base-950 font-bold py-4 px-8 text-lg rounded-2xl transition-all duration-300 flex items-center shadow-lg shadow-white/10 hover:scale-105 active:scale-95"
                                >
                                    <Play size={20} className="mr-3" fill="currentColor" />
                                    Book Tickets Now
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}

            <div className="max-w-[1400px] mx-auto px-6 py-24 relative z-10 space-y-32">

                {/* Now Showing */}
                <section>
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-4xl font-bold tracking-tight text-white m-0">
                            Now Showing
                        </h2>
                        <Link to="/movies" className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors py-2 px-4 rounded-full hover:bg-primary-500/10">
                            View all &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {movies.slice(0, 4).map((movie, idx) => (
                            <MovieCard key={movie._id} movie={movie} index={idx} />
                        ))}
                    </div>
                </section>

                {/* Upcoming */}
                <section>
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-4xl font-bold tracking-tight text-white m-0">
                            Upcoming Releases
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 opacity-70">
                        {movies.slice(4, 8).map((movie, idx) => (
                            <MovieCard key={movie._id} movie={movie} index={idx} />
                        ))}
                        {movies.length <= 4 && (
                            <div className="col-span-1 sm:col-span-2 lg:col-span-4 box-panel w-full p-12 text-center text-slate-400 border border-dashed border-white/10 bg-transparent shadow-none">
                                Exciting new movies coming soon.
                            </div>
                        )}
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="py-16">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Why Book With ReelVerse</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Experience the most premium, seamless, and lightning-fast movie ticket booking platform.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="box-card text-center flex flex-col items-center group">
                            <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6 text-primary-400 group-hover:scale-110 group-hover:bg-primary-500/20 transition-all duration-300">
                                <Ticket size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Seamless Booking</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Book your favorite seats in just three clicks. No clutter, no distractions.</p>
                        </div>
                        <div className="box-card text-center flex flex-col items-center group">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                                <Zap size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Built on modern architecture ensuring zero lag and instant confirmations.</p>
                        </div>
                        <div className="box-card text-center flex flex-col items-center group">
                            <div className="w-16 h-16 border border-white/10 bg-base-800 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Guaranteed Seats</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">Real-time seat locking prevents double bookings. Your perfect spot is secured.</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Clean Footer */}
            <footer className="border-t border-white/10 bg-base-950 py-12 text-center mt-20">
                <div className="max-w-[1400px] mx-auto px-6 flex flex-col items-center justify-center">
                    <Link to="/" className="text-2xl font-black text-white tracking-tighter mb-4 flex items-center">
                        <span className="text-primary-500 mr-2">
                            <Play size={24} fill="currentColor" />
                        </span>
                        ReelVerse.
                    </Link>
                    <p className="text-slate-500 text-sm mt-4">
                        &copy; {new Date().getFullYear()} ReelVerse. All rights reserved. Premium Cinema Experience.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
