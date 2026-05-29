import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import Play from "lucide-react/dist/esm/icons/play";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import { Helmet } from "react-helmet-async";

import MovieCard from "../components/movies/MovieCard";
import SkeletonCard from "../components/common/SkeletonCard";
import TrailerModal from "../components/movies/TrailerModal";

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [heroMovie, setHeroMovie] = useState(null);
    const [initialHeroMovie, setInitialHeroMovie] = useState(null);
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
                const firstMovie = showing[0] || upcomingRes.data[0];
                setHeroMovie(firstMovie);
                setInitialHeroMovie(firstMovie);
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
            <div className="pt-20 max-w-350 mx-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((n) => (
                        <SkeletonCard key={n} />
                    ))}
                </div>
            </div>
        );
    }

    const getOptimizedUrl = (url, width = '1920') => {
        if (!url) return '';
        if (url.includes('cloudinary')) {
            return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
        }
        return url;
    };

    const initialLcpImage = getOptimizedUrl(initialHeroMovie?.backdropUrl || initialHeroMovie?.posterUrl);

    return (
        <main className="-mt-16">
            <Helmet>
                <title>ReelVerse | Premium Cinema Experience</title>
                <meta name="description" content="Book tickets for the latest movies at ReelVerse. Experience premium cinema with easy online booking, real-time seat selection, and digital tickets." />
                {initialLcpImage && <link rel="preload" as="image" href={initialLcpImage} fetchPriority="high" />}
            </Helmet>

            {/* HERO SECTION */}
            {heroMovie && (
                <section className="relative min-h-[85vh] lg:h-[90vh] flex flex-col justify-end pb-24 overflow-hidden bg-base-950">

                    <AnimatePresence mode="wait">
                        <m.div
                            key={heroMovie._id}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.9 }}
                            className="absolute top-0 right-0 w-full lg:w-[75%] h-full z-0"
                        >
                            <img
                                src={getOptimizedUrl(heroMovie.backdropUrl || heroMovie.posterUrl)}
                                alt={heroMovie.title}
                                fetchPriority="high"
                                width="1920"
                                height="1080"
                                className="w-full h-full object-cover opacity-80"
                            />

                            <div className="absolute inset-0 bg-linear-to-t from-base-950 via-base-950/20 to-transparent" />
                            <div className="absolute inset-0 bg-linear-to-r from-base-950 via-base-950/30 to-transparent" />
                        </m.div>
                    </AnimatePresence>

                    {/* Animated glow */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                        <div className="absolute w-150 h-150 bg-primary-600/20 blur-[200px] -top-50 -left-50" />
                        <div className="absolute w-125 h-125 bg-accent-600/10 blur-[200px] -bottom-50 -right-50" />
                    </div>

                    {/* Hero Content */}
                    <div className="relative z-10 w-full max-w-350 mx-auto px-6">

                        <m.div
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
                            <m.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                <span className="inline-block px-3 py-1 mb-6 border border-primary-500/30 bg-primary-500/10 text-primary-400 uppercase tracking-widest text-xs font-bold rounded-sm backdrop-blur-md">
                                    Now Showing
                                </span>
                            </m.div>

                            <m.h1
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-slate-200 to-slate-400 mb-6 leading-[1.1] tracking-tight drop-shadow-sm"
                            >
                                {heroMovie.title}
                            </m.h1>

                            <m.p
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                className="text-slate-300 text-base md:text-xl mb-10 line-clamp-3 leading-relaxed max-w-2xl font-light"
                            >
                                {heroMovie.description}
                            </m.p>

                            <m.div
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
                            </m.div>
                        </m.div>
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
            <section className="max-w-350 mx-auto px-6 py-28">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 rounded-full bg-primary-500"></div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Now Showing</h2>
                    </div>

                    <Link
                        to="/movies"
                        className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 group"
                    >
                        View all
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                </div>

                <m.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                    }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6"
                >
                    {movies.slice(0, 5).map((movie, i) => (
                        <m.div
                            key={movie._id}
                            variants={{
                                hidden: { opacity: 0, y: 40 },
                                show: { opacity: 1, y: 0 },
                            }}
                        >
                            <MovieCard movie={movie} index={i} />
                        </m.div>
                    ))}
                </m.div>
            </section>

            {/* UPCOMING */}
            <section className="max-w-350 mx-auto px-6 pb-32">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 rounded-full bg-accent-500"></div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Upcoming</h2>
                    </div>

                    <Link
                        to="/upcoming-movies"
                        className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1 group"
                    >
                        View all
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                </div>

                <m.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                    }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6"
                >
                    {upcomingMovies.slice(0, 5).map((movie, i) => (
                        <m.div
                            key={movie._id}
                            variants={{
                                hidden: { opacity: 0, y: 40 },
                                show: { opacity: 1, y: 0 },
                            }}
                        >
                            <MovieCard movie={movie} index={i} />
                        </m.div>
                    ))}
                </m.div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/10 py-10 text-center text-gray-500">
                © {new Date().getFullYear()} ReelVerse. Premium Cinema Experience.
            </footer>
        </main>
    );
};

export default Home;