import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import MovieCard from "../components/movies/MovieCard";
import SkeletonCard from "../components/common/SkeletonCard";

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [heroMovie, setHeroMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const [moviesRes, upcomingRes] = await Promise.all([
                    api.get("/movies"),
                    api.get("/movies/upcoming"),
                ]);

                const showing = moviesRes.data.filter((m) => !m.isUpcoming);

                setMovies(showing);
                setUpcomingMovies(upcomingRes.data);
                setHeroMovie(showing[0] || upcomingRes.data[0]);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovies();
    }, []);

    useEffect(() => {
        if (!movies.length) return;

        const interval = setInterval(() => {
            setHeroMovie((current) => {
                const index = movies.findIndex((m) => m._id === current?._id);
                const next = (index + 1) % Math.min(5, movies.length);
                return movies[next];
            });
        }, 6000);

        return () => clearInterval(interval);
    }, [movies]);

    if (isLoading) {
        return (
            <div className="pt-20 max-w-1400px mx-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((n) => (
                        <SkeletonCard key={n} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="-mt-16">

            {/* HERO SECTION */}
            {heroMovie && (
                <section className="relative h-[90vh] overflow-hidden">

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={heroMovie._id}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.9 }}
                            className="absolute inset-0"
                        >
                            <img
                                src={heroMovie.backdropUrl || heroMovie.posterUrl}
                                className="w-full h-full object-cover opacity-40"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                        </motion.div>
                    </AnimatePresence>

                    {/* Animated glow */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div className="absolute w-[600px] h-[600px] bg-primary-500/20 blur-[200px] top-[-200px] left-[-200px]" />
                        <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-[200px] bottom-[-200px] right-[-200px]" />
                    </div>

                    {/* Hero Content */}
                    <div className="relative z-10 h-full flex items-center max-w-1400px mx-auto px-6">

                        <motion.div
                            key={`content-${heroMovie._id}`}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-2xl"
                        >
                            <p className="text-primary-400 uppercase tracking-widest text-sm mb-4">
                                Now Showing
                            </p>

                            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
                                {heroMovie.title}
                            </h1>

                            <p className="text-gray-300 text-lg mb-10 line-clamp-3">
                                {heroMovie.description}
                            </p>

                            <div className="flex gap-4">
                                <Link
                                    to={`/movie/${heroMovie._id}`}
                                    className="flex items-center gap-2 bg-white text-black font-semibold px-7 py-4 rounded-lg hover:scale-105 transition"
                                >
                                    <Play size={18} /> Book Tickets
                                </Link>

                                <Link
                                    to="/movies"
                                    className="border border-white/20 px-7 py-4 rounded-lg hover:bg-white/10 transition"
                                >
                                    Browse Movies
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Progress Indicators */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
                        {movies.slice(0, 5).map((m) => (
                            <button
                                key={m._id}
                                onClick={() => setHeroMovie(m)}
                                className={`h-1 rounded-full transition-all duration-500 ${heroMovie._id === m._id
                                        ? "w-10 bg-primary-500"
                                        : "w-3 bg-white/30"
                                    }`}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* NOW SHOWING */}
            <section className="max-w-1400px mx-auto px-6 py-28">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-4xl font-bold text-white">Now Showing</h2>

                    <Link
                        to="/movies"
                        className="text-primary-400 hover:text-primary-300 transition"
                    >
                        View all →
                    </Link>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.1 } },
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7"
                >
                    {movies.slice(0, 4).map((movie, i) => (
                        <motion.div
                            key={movie._id}
                            variants={{
                                hidden: { opacity: 0, y: 40 },
                                show: { opacity: 1, y: 0 },
                            }}
                        >
                            <MovieCard movie={movie} index={i} />
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* UPCOMING */}
            <section className="max-w-1400px mx-auto px-6 pb-32">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-4xl font-bold text-white">Upcoming</h2>

                    <Link
                        to="/upcoming-movies"
                        className="text-primary-400 hover:text-primary-300 transition"
                    >
                        View all →
                    </Link>
                </div>

                <div className="flex gap-6 overflow-x-auto scrollbar-hide">
                    {upcomingMovies.map((movie, i) => (
                        <div key={movie._id} className="min-w-[300px]">
                            <MovieCard movie={movie} index={i} />
                        </div>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/10 py-10 text-center text-gray-500">
                © {new Date().getFullYear()} ReelVerse. Premium Cinema Experience.
            </footer>
        </div>
    );
};

export default Home;