import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import Play from "lucide-react/dist/esm/icons/play";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
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
    const [isHovered, setIsHovered] = useState(false);

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
        if (!movies.length || showTrailer || isHovered) return;

        const interval = setInterval(() => {
            setHeroMovie((current) => {
                const index = movies.findIndex((m) => m._id === current?._id);
                const next = (index + 1) % Math.min(5, movies.length);
                return movies[next];
            });
        }, 6000);

        return () => clearInterval(interval);
    }, [movies, showTrailer, isHovered, heroMovie]);

    const handleNextSlide = () => {
        if (!movies.length) return;
        setHeroMovie((current) => {
            const index = movies.findIndex((m) => m._id === current?._id);
            const next = (index + 1) % Math.min(5, movies.length);
            return movies[next];
        });
    };

    const handlePrevSlide = () => {
        if (!movies.length) return;
        setHeroMovie((current) => {
            const index = movies.findIndex((m) => m._id === current?._id);
            const prev = (index - 1 + Math.min(5, movies.length)) % Math.min(5, movies.length);
            return movies[prev];
        });
    };

    const formatDuration = (minutes) => {
        if (!minutes) return "";
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    };

    const getReleaseYear = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).getFullYear();
    };

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
                <section
                    className="relative w-full h-[70vh] md:h-[75vh] lg:h-[85vh] min-h-125 lg:min-h-150 overflow-hidden bg-[#0c111b] group/hero"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Background Backdrop Image with Ken Burns Zoom Effect */}
                    <AnimatePresence mode="wait">
                        <m.div
                            key={heroMovie._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute top-0 right-0 w-full lg:w-[70%] h-full z-0 overflow-hidden"
                        >
                            <m.img
                                src={getOptimizedUrl(heroMovie.backdropUrl || heroMovie.posterUrl)}
                                alt={heroMovie.title}
                                fetchPriority="high"
                                initial={{ scale: 1.08 }}
                                animate={{ scale: 1.02 }}
                                transition={{ duration: 6, ease: "linear" }}
                                className="w-full h-full object-cover object-top opacity-70 lg:opacity-85"
                            />

                            {/* Gradients to blend image with backgrounds */}
                            {/* Horizontal blend for desktop */}
                            <div className="hidden lg:block absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-[#0c111b] via-[#0c111b]/85 to-transparent z-1" />
                            <div className="hidden lg:block absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-[#0c111b] via-[#0c111b]/40 to-transparent z-1" />
                            
                            {/* Vertical blend for mobile / standard */}
                            <div className="absolute inset-0 bg-linear-to-t from-[#0c111b] via-[#0c111b]/20 to-[#0c111b]/30 z-1" />
                            <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-base-950 via-base-950/90 to-transparent z-1" />
                        </m.div>
                    </AnimatePresence>

                    {/* Gradient overlay behind text for high contrast on all devices */}
                    <div className="absolute inset-0 bg-linear-to-r from-[#0c111b] via-[#0c111b]/95 md:via-[#0c111b]/80 lg:via-[#0c111b]/60 to-transparent z-10 pointer-events-none" />

                    {/* Left Info Panel */}
                    <div className="absolute left-0 top-0 h-full w-full lg:w-[50%] flex flex-col justify-center px-6 sm:px-12 lg:pl-16 xl:pl-24 z-20 pt-16">
                        <AnimatePresence mode="wait">
                            <m.div
                                key={`content-${heroMovie._id}`}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4 }}
                                className="max-w-2xl"
                            >
                                {/* Metadata badges */}
                                <div className="flex flex-wrap items-center gap-2.5 mb-5 text-xs md:text-sm text-slate-300 font-medium">
                                    <span className="bg-primary-600/20 text-primary-300 border border-primary-500/30 px-2 py-0.5 rounded-md font-bold text-xs uppercase tracking-wider">
                                        {heroMovie.isUpcoming ? "Upcoming" : "Now Showing"}
                                    </span>
                                    {heroMovie.releaseDate && (
                                        <span className="text-slate-400 font-semibold">
                                            {getReleaseYear(heroMovie.releaseDate)}
                                        </span>
                                    )}
                                    <span className="w-1 h-1 rounded-full bg-slate-500" />
                                    {heroMovie.duration && (
                                        <span className="text-slate-400 font-semibold">
                                            {formatDuration(heroMovie.duration)}
                                        </span>
                                    )}
                                    <span className="w-1 h-1 rounded-full bg-slate-500" />
                                    {heroMovie.language && (
                                        <span className="text-slate-400 font-semibold">
                                            {heroMovie.language}
                                        </span>
                                    )}
                                    <span className="w-1 h-1 rounded-full bg-slate-500" />
                                    <span className="border border-white/20 text-white/80 px-1.5 py-0.5 rounded text-[10px] md:text-xs font-bold bg-white/5">
                                        U/A 16+
                                    </span>
                                </div>

                                {/* Movie Title */}
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-4 tracking-tight drop-shadow-md">
                                    {heroMovie.title}
                                </h1>

                                {/* Movie Genre */}
                                {heroMovie.genre && heroMovie.genre.length > 0 && (
                                    <div className="text-xs md:text-sm text-primary-400 font-semibold mb-4 tracking-wide uppercase">
                                        {heroMovie.genre.join("  |  ")}
                                    </div>
                                )}

                                {/* Description */}
                                <p className="text-slate-300 text-sm md:text-base lg:text-lg mb-8 line-clamp-3 md:line-clamp-4 leading-relaxed max-w-lg font-light">
                                    {heroMovie.description}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        to={`/movie/${heroMovie._id}`}
                                        className="flex items-center justify-center gap-2 bg-white hover:bg-white/90 active:scale-95 text-[#0c111b] font-bold px-7 py-3.5 rounded-lg transition-all duration-200 shadow-lg"
                                    >
                                        {heroMovie.isUpcoming ? (
                                            <>View Details</>
                                        ) : (
                                            <>
                                                <Play size={18} fill="currentColor" />
                                                Book Tickets
                                            </>
                                        )}
                                    </Link>

                                    {heroMovie.trailerUrl && (
                                        <button
                                            onClick={() => setShowTrailer(true)}
                                            className="flex items-center justify-center gap-2 border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold px-6 py-3.5 rounded-lg transition-all duration-200"
                                        >
                                            <Play size={18} />
                                            Watch Trailer
                                        </button>
                                    )}
                                </div>
                            </m.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Chevrons */}
                    <button
                        onClick={handlePrevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-[#0c111b]/60 hover:bg-[#0c111b]/90 border border-white/10 text-white hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/hero:opacity-100 duration-300 pointer-events-auto cursor-pointer"
                        aria-label="Previous Slide"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleNextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-[#0c111b]/60 hover:bg-[#0c111b]/90 border border-white/10 text-white hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/hero:opacity-100 duration-300 pointer-events-auto cursor-pointer"
                        aria-label="Next Slide"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Bottom Preview Cards Carousel */}
                    <div className="absolute bottom-6 right-6 md:right-12 z-30 flex items-center gap-4 max-w-[90%] sm:max-w-2xl md:max-w-3xl overflow-x-auto py-2 px-1 scrollbar-none">
                        {movies.slice(0, 5).map((m) => {
                            const isActive = heroMovie._id === m._id;
                            return (
                                <button
                                    key={m._id}
                                    onClick={() => setHeroMovie(m)}
                                    className={`relative shrink-0 w-24 sm:w-36 h-14 sm:h-20 rounded-lg overflow-hidden transition-all duration-300 text-left border-2 focus:outline-none ${
                                        isActive
                                            ? "border-primary-500 scale-105 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10"
                                            : "border-transparent opacity-60 hover:opacity-100 hover:scale-102"
                                    }`}
                                >
                                    {/* Thumbnail Image */}
                                    <img
                                        src={getOptimizedUrl(m.backdropUrl || m.posterUrl, "400")}
                                        alt={m.title}
                                        className="w-full h-full object-cover"
                                    />
                                    
                                    {/* Thumbnail Dark Overlay */}
                                    <div className={`absolute inset-0 transition-opacity duration-300 ${
                                        isActive ? "bg-black/20" : "bg-black/40 hover:bg-black/25"
                                    }`} />

                                    {/* Small Movie Title inside thumbnail */}
                                    <div className="absolute bottom-1.5 left-2 right-2 text-[9px] sm:text-[11px] font-bold text-white truncate drop-shadow-md">
                                        {m.title}
                                    </div>

                                    {/* Dynamic Loading Progress Bar at the bottom of the active thumbnail card */}
                                    {isActive && !showTrailer && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.75 bg-white/20">
                                            <div
                                                key={`progress-${m._id}`}
                                                className={`h-full bg-primary-500 shadow-[0_0_8px_#6366f1] animate-autoplay-progress ${
                                                    isHovered ? "paused" : ""
                                                }`}
                                            />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
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