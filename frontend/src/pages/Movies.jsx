import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import api from '../utils/axios';
import MovieCard from '../components/movies/MovieCard';

const Movies = () => {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await api.get('/movies');
                setMovies(res.data);
            } catch (error) {
                console.error('Failed to fetch movies:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovies();
    }, []);

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12 fade-in min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">All Movies</h1>
                    <p className="text-slate-400">Discover and book tickets for the latest releases.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search movies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-base-900 border border-base-800 rounded-sm py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                        />
                    </div>
                    <button className="bg-base-900 border border-base-800 p-3 rounded-sm hover:bg-white/5 transition-colors text-slate-300">
                        <Filter size={20} />
                    </button>
                </div>
            </motion.div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <div className="w-8 h-8 border-4 border-base-800 border-t-primary-500 rounded-sm animate-spin"></div>
                </div>
            ) : (
                <>
                    {filteredMovies.length === 0 ? (
                        <div className="box-panel w-full p-16 text-center text-slate-400 border border-dashed border-base-800 bg-transparent shadow-none">
                            <p className="text-lg mb-2">No movies found matching "{searchTerm}"</p>
                            <button onClick={() => setSearchTerm('')} className="text-primary-400 hover:text-white transition-colors">Clear search</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredMovies.map((movie, idx) => (
                                <MovieCard key={movie._id} movie={movie} index={idx} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Movies;
