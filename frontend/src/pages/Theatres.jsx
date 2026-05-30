import { useState, useEffect } from 'react';
import { m } from 'framer-motion';
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
            <div className="max-w-350 mx-auto px-6 py-12">
                <div className="mb-10 text-center">
                    <div className="h-12 w-64 bg-base-900 rounded-sm mx-auto mb-4 animate-pulse"></div>
                    <div className="h-4 w-96 bg-base-900 rounded-sm mx-auto animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="box-panel h-80 bg-base-900/50 border border-base-800 animate-pulse">
                            <div className="p-8">
                                <div className="flex justify-between mb-6">
                                    <div className="h-8 w-40 bg-base-800 rounded-sm"></div>
                                    <div className="h-10 w-10 bg-base-800 rounded-sm"></div>
                                </div>
                                <div className="h-4 w-32 bg-base-800 rounded-sm mb-6"></div>
                                <div className="flex gap-2 mb-8">
                                    <div className="h-8 w-24 bg-base-800 rounded-sm"></div>
                                    <div className="h-8 w-24 bg-base-800 rounded-sm"></div>
                                </div>
                                <div className="mt-auto pt-6 border-t border-base-800/50">
                                    <div className="h-4 w-32 bg-base-800 rounded-sm mb-4"></div>
                                    <div className="flex gap-2">
                                        <div className="h-6 w-20 bg-base-800 rounded-sm"></div>
                                        <div className="h-6 w-20 bg-base-800 rounded-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-350 mx-auto px-6 py-12 fade-in">
            <m.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Our Theatres</h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">Experience movies like never before in our state-of-the-art cinemas across the country.</p>
            </m.div>

            {theatres.length === 0 ? (
                <div className="text-center text-slate-400 mt-20">
                    <p className="text-xl">No theatres available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {theatres.map((theatre, index) => {
                        const availableMovies = getAvailableMoviesForTheatre(theatre._id);

                        return (
                            <m.div
                                key={theatre._id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="box-panel flex flex-col h-full bg-base-900 border border-base-800 hover:border-primary-500/50 transition-colors group relative overflow-hidden"
                            >
                                {/* Decorative gradient background */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary-500/10 transition-colors" />
                                
                                <div className="p-6 md:p-8 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <h2 className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">
                                            {theatre.name}
                                        </h2>
                                        <div className="bg-base-950 p-2.5 rounded-xl border border-base-800 shadow-sm group-hover:border-primary-500/30 transition-colors">
                                            <MapPin className="text-primary-500" size={20} />
                                        </div>
                                    </div>

                                    <p className="text-slate-400 flex items-center mb-6 text-sm">
                                        <span className="opacity-60">{theatre.location || 'Location not specified'}</span>
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        <div className="px-3 py-1.5 bg-base-950 rounded-xl border border-base-800 flex items-center text-xs font-bold text-slate-300 uppercase tracking-tighter">
                                            <MonitorPlay size={14} className="mr-2 text-primary-500" />
                                            {theatre.screens} Screens
                                        </div>
                                        {theatre.facilities?.map((f, i) => (
                                            <div key={i} className="px-3 py-1.5 bg-base-950 rounded-xl border border-base-800 flex items-center text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                                {f}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-auto border-t border-base-800/50 pt-6">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center">
                                            <Film size={12} className="mr-2 text-primary-500" />
                                            Now Showing ({availableMovies.length})
                                        </h3>

                                        {availableMovies.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {availableMovies.slice(0, 3).map(movie => (
                                                    <span key={movie._id} className="text-[11px] font-bold bg-white/5 text-slate-300 px-2 py-1 rounded-md border border-base-800/50">
                                                        {movie.title}
                                                    </span>
                                                ))}
                                                {availableMovies.length > 3 && (
                                                    <span className="text-[11px] text-primary-400 font-black px-1 flex items-center">
                                                        +{availableMovies.length - 3} MORE
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-600 italic">No movies currently showing</p>
                                        )}
                                    </div>
                                </div>
                            </m.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Theatres;
