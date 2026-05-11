import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Search from 'lucide-react/dist/esm/icons/search';
import Filter from 'lucide-react/dist/esm/icons/filter';
import Film from 'lucide-react/dist/esm/icons/film';
import X from 'lucide-react/dist/esm/icons/x';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import api from '../utils/axios';
import MovieCard from '../components/movies/MovieCard';
import SkeletonCard from '../components/common/SkeletonCard';

const Movies = () => {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [selectedLanguage, setSelectedLanguage] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await api.get('/movies');
                setMovies(res.data.filter(m => !m.isUpcoming));
            } catch (error) {
                console.error('Failed to fetch movies:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovies();
    }, []);

    // Extract unique genres and languages
    const allGenres = ['All', ...new Set(movies.flatMap(m => {
        const g = m.genre || m.genres;
        if (!g) return [];
        return (Array.isArray(g) ? g : String(g).split(',')).map(x => x.trim());
    }))];

    const allLanguages = ['All', ...new Set(movies.map(m => m.language).filter(Boolean))];

    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre === 'All' || (() => {
            const g = movie.genre || movie.genres;
            if (!g) return false;
            const genres = (Array.isArray(g) ? g : String(g).split(',')).map(x => x.trim());
            return genres.includes(selectedGenre);
        })();
        const matchesLanguage = selectedLanguage === 'All' || movie.language === selectedLanguage;
        return matchesSearch && matchesGenre && matchesLanguage;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedGenre('All');
        setSelectedLanguage('All');
    };

    const hasActiveFilters = searchTerm || selectedGenre !== 'All' || selectedLanguage !== 'All';

    return (
        <main className="min-h-screen">
            <Helmet>
                <title>All Movies | ReelVerse - Premium Online Movie Booking</title>
                <meta name="description" content="Browse our extensive collection of latest movies. Filter by genre and language to find your perfect cinematic experience." />
            </Helmet>
            {/* Page Header with gradient background */}
            <div className="relative overflow-hidden border-b border-base-800/50">
                <div className="absolute inset-0 bg-linear-to-br from-primary-600/8 via-transparent to-accent-500/5"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/5 blur-[120px] rounded-full"></div>

                <div className="relative max-w-[1400px] mx-auto px-6 pt-16 pb-10">
                    <m.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-primary-500/15 border border-primary-500/20 flex items-center justify-center text-primary-400">
                                    <Film size={20} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Now Showing</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">All Movies</h1>
                            <p className="text-slate-400 text-base max-w-lg">Discover and book tickets for the latest releases in theaters near you.</p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {/* Search */}
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search movies..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-base-900/80 backdrop-blur-md border border-base-800 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/50 transition-all font-medium"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            {/* Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-3 rounded-lg border transition-all duration-300 ${showFilters
                                        ? 'bg-primary-500/15 border-primary-500/30 text-primary-400'
                                        : 'bg-base-900/80 border-base-800 text-slate-400 hover:text-white hover:border-base-700'
                                    }`}
                            >
                                <Filter size={20} />
                            </button>
                        </div>
                    </m.div>

                    {/* Filter Bar */}
                    {showFilters && (
                        <m.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 flex flex-wrap items-center gap-3"
                        >
                            {/* Genre Filter */}
                            <div className="relative">
                                <select
                                    value={selectedGenre}
                                    onChange={(e) => setSelectedGenre(e.target.value)}
                                    className="appearance-none bg-base-900 border border-base-800 rounded-lg py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer"
                                >
                                    {allGenres.map(g => (
                                        <option key={g} value={g}>{g === 'All' ? 'All Genres' : g}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Language Filter */}
                            <div className="relative">
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="appearance-none bg-base-900 border border-base-800 rounded-lg py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer"
                                >
                                    {allLanguages.map(l => (
                                        <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1 transition-colors"
                                >
                                    <X size={14} /> Clear All
                                </button>
                            )}

                            <span className="text-xs text-slate-500 ml-auto">
                                {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''} found
                            </span>
                        </m.div>
                    )}
                </div>
            </div>

            {/* Movie Grid */}
            <div className="max-w-[1400px] mx-auto px-6 py-10">
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : (
                    <>
                        {filteredMovies.length === 0 ? (
                            <m.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-base-900 border border-base-800 flex items-center justify-center text-slate-500 mb-6">
                                    <Film size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No movies found</h3>
                                <p className="text-slate-400 max-w-md mb-6">
                                    {searchTerm ? `No results for "${searchTerm}". Try a different search.` : 'No movies match your current filters.'}
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all"
                                >
                                    Clear Filters
                                </button>
                            </m.div>
                        ) : (
                            <m.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.05 },
                                    },
                                }}
                                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6"
                            >
                                {filteredMovies.map((movie, idx) => (
                                    <m.div
                                        key={movie._id}
                                        variants={{
                                            hidden: { opacity: 0, y: 25 },
                                            visible: { opacity: 1, y: 0 },
                                        }}
                                    >
                                        <MovieCard movie={movie} index={idx} />
                                    </m.div>
                                ))}
                            </m.div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
};

export default Movies;
