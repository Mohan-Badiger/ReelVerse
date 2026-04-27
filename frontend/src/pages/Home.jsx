import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import MovieCard from "../components/movies/MovieCard";
import SkeletonCard from "../components/common/SkeletonCard";
import TrailerModal from "../components/movies/TrailerModal";

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [heroMovie, setHeroMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showTrailer, setShowTrailer] = useState(false);

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
        if (!movies.length || showTrailer) return;

        const interval = setInterval(() => {
            setHeroMovie((current) => {
                const index = movies.findIndex((m) => m._id === current?._id);
                const next = (index + 1) % Math.min(5, movies.length);
                return movies[next];
            });
        }, 6000);

        return () => clearInterval(interval);
    }, [movies, showTrailer]);

    if (isLoading) {
        return (
            <div className="pt-20 max-w-[1400px] mx-auto px-6">
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
                <section className="relative min-h-[85vh] lg:h-[90vh] flex flex-col justify-end pb-24 overflow-hidden">

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={heroMovie._id}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.9 }}
                            className="absolute inset-0 z-0"
                        >
                            <img
                                src={heroMovie.backdropUrl || heroMovie.posterUrl}
                                alt={heroMovie.title}
                                className="w-full h-full object-cover opacity-50"
                            />

                            <div className="absolute inset-0 bg-linear-to-t from-base-950 via-base-950/80 to-transparent" />
                            <div className="absolute inset-0 bg-linear-to-r from-base-950 via-base-950/50 to-transparent" />
                        </motion.div>
                    </AnimatePresence>

                    {/* Animated glow */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                        <div className="absolute w-[600px] h-[600px] bg-primary-600/20 blur-[200px] top-[-200px] left-[-200px]" />
                        <div className="absolute w-[500px] h-[500px] bg-accent-600/10 blur-[200px] bottom-[-200px] right-[-200px]" />
                    </div>

                    {/* Hero Content */}
                    <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6">

                        <motion.div
                            key={`content-${heroMovie._id}`}
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.15 }
                                }
                            }}
                            className="max-w-3xl"
                        >
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                <span className="inline-block px-3 py-1 mb-6 border border-primary-500/30 bg-primary-500/10 text-primary-400 uppercase tracking-widest text-xs font-bold rounded-sm backdrop-blur-md">
                                    Now Showing
                                </span>
                            </motion.div>

                            <motion.h1
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-slate-200 to-slate-400 mb-6 leading-[1.1] tracking-tight drop-shadow-sm"
                            >
                                {heroMovie.title}
                            </motion.h1>

                            <motion.p
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                className="text-slate-300 text-base md:text-xl mb-10 line-clamp-3 leading-relaxed max-w-2xl font-light"
                            >
                                {heroMovie.description}
                            </motion.p>

                            <motion.div
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                className="flex flex-wrap gap-4"
                            >
                                <Link
                                    to={`/movie/${heroMovie._id}`}
                                    className="group flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold px-8 py-4 rounded-md transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-95"
                                >
                                    {heroMovie.isUpcoming ? (
                                        <>View Details</>
                                    ) : (
                                        <>
                                            <Play size={20} fill="currentColor" className="transition-transform duration-300 group-hover:scale-110" />
                                            Book Tickets
                                        </>
                                    )}
                                </Link>

                                {heroMovie.trailerUrl && (
                                    <button
                                        onClick={() => setShowTrailer(true)}
                                        className="group flex items-center justify-center gap-2 border border-white/20 bg-white/5 backdrop-blur-md text-white font-semibold px-8 py-4 rounded-md hover:bg-white hover:text-black transition-all duration-300 active:scale-95"
                                    >
                                        <Play size={20} className="transition-transform duration-300 group-hover:scale-110" />
                                        Watch Trailer
                                    </button>
                                )}
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Premium Progress Indicators */}
                    <div className="absolute bottom-8 left-6 md:left-auto md:right-12 flex gap-2 z-20">
                        {movies.slice(0, 5).map((m) => (
                            <button
                                key={m._id}
                                onClick={() => setHeroMovie(m)}
                                className={`h-1.5 rounded-full transition-all duration-500 overflow-hidden relative ${heroMovie._id === m._id
                                        ? "w-16 bg-primary-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                                        : "w-6 bg-white/20 hover:bg-white/40"
                                    }`}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* TRAILER MODAL */}
            {heroMovie?.trailerUrl && (
                <TrailerModal
                    isOpen={showTrailer}
                    onClose={() => setShowTrailer(false)}
                    trailerUrl={heroMovie.trailerUrl}
                    movieTitle={heroMovie.title}
                />
            )}

            {/* NOW SHOWING */}
            <section className="max-w-[1400px] mx-auto px-6 py-28">
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
            <section className="max-w-[1400px] mx-auto px-6 pb-32">
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