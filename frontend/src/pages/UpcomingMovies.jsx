import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Film } from 'lucide-react';
import api from '../utils/axios';
import MovieCard from '../components/movies/MovieCard';

const UpcomingMovies = () => {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await api.get('/movies/upcoming');
                setMovies(res.data);
            } catch (error) {
                console.error('Failed to fetch upcoming movies:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[80vh]">
                <div className="w-10 h-10 border-4 border-base-800 border-t-primary-500 rounded-sm animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-1400px mx-auto px-6 py-12 fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight flex items-center">
                        <Film className="mr-4 text-primary-500" size={40} />
                        Upcoming Releases
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Discover the most anticipated movies coming soon to ReelVerse. Watch trailers and stay tuned for release dates.
                    </p>
                </div>
            </div>

            {movies.length === 0 ? (
                <div className="box-panel flex flex-col items-center justify-center p-20 text-center border-dashed border-base-800 bg-transparent shadow-none">
                    <AlertCircle className="w-16 h-16 text-slate-600 mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">No Upcoming Movies Found</h2>
                    <p className="text-slate-400">We are currently updating our catalog. Check back soon for exciting new releases.</p>
                </div>
            ) : (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                >
                    {movies.map((movie, idx) => (
                        <motion.div
                            key={movie._id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                        >
                            <MovieCard movie={movie} index={idx} />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default UpcomingMovies;
