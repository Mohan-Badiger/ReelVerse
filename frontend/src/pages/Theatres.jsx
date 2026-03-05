import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, MonitorPlay, Film } from 'lucide-react';
import api from '../utils/axios';

const Theatres = () => {
    const [theatres, setTheatres] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTheatresData = async () => {
            try {
                const [theatresRes, showtimesRes] = await Promise.all([
                    api.get('/theatres'),
                    api.get('/showtimes')
                ]);

                setTheatres(theatresRes.data);
                setShowtimes(showtimesRes.data);
            } catch (error) {
                console.error("Failed to load data for theatres page", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTheatresData();
    }, []);

    // Helper to get available movies for a given theatre
    const getAvailableMoviesForTheatre = (theatreId) => {
        const showsForTheatre = showtimes.filter(s => s.theatre?._id === theatreId || s.theatre === theatreId);

        // Extract unique movies
        const movieMap = new Map();
        showsForTheatre.forEach(show => {
            if (show.movie && show.movie._id) {
                movieMap.set(show.movie._id, show.movie);
            }
        });

        return Array.from(movieMap.values());
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <div className="w-10 h-10 border-4 border-base-800 border-t-primary-500 rounded-sm animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12 fade-in">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Our Theatres</h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">Experience movies like never before in our state-of-the-art cinemas across the country.</p>
            </motion.div>

            {theatres.length === 0 ? (
                <div className="text-center text-slate-400 mt-20">
                    <p className="text-xl">No theatres available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {theatres.map((theatre, index) => {
                        const availableMovies = getAvailableMoviesForTheatre(theatre._id);

                        return (
                            <motion.div
                                key={theatre._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="box-panel flex flex-col h-full bg-base-900 border border-base-800 hover:border-primary-500/50 transition-colors group"
                            >
                                <div className="p-6 md:p-8 flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <h2 className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">
                                            {theatre.name}
                                        </h2>
                                        <div className="bg-base-950 p-2 rounded-sm border border-base-800">
                                            <MapPin className="text-primary-500" size={20} />
                                        </div>
                                    </div>

                                    <p className="text-slate-400 flex items-center mb-6">
                                        {theatre.location || 'Location not specified'}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        <div className="px-3 py-1.5 bg-base-950 rounded-sm border border-base-800 flex items-center text-sm font-medium text-slate-300">
                                            <MonitorPlay size={14} className="mr-2 text-primary-500" />
                                            {theatre.screens} Screens
                                        </div>
                                        {theatre.facilities?.map((f, i) => (
                                            <div key={i} className="px-3 py-1.5 bg-base-950 rounded-sm border border-base-800 flex items-center text-sm font-medium text-slate-300">
                                                {f}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-auto border-t border-base-800 pt-6">
                                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                                            <Film size={14} className="mr-2" />
                                            Now Showing ({availableMovies.length})
                                        </h3>

                                        {availableMovies.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {availableMovies.slice(0, 3).map(movie => (
                                                    <span key={movie._id} className="text-xs bg-white/5 text-slate-300 px-2 py-1 rounded-sm border border-base-800/50">
                                                        {movie.title}
                                                    </span>
                                                ))}
                                                {availableMovies.length > 3 && (
                                                    <span className="text-xs text-primary-400 font-medium px-2 py-1 flex items-center">
                                                        +{availableMovies.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">No movies currently showing</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Theatres;
