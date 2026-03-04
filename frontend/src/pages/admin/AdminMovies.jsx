import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertCircle, RefreshCw, Edit2 } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const AdminMovies = () => {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMovies = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/movies');
            setMovies(res.data);
        } catch (error) {
            toast.error('Failed to load movies');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this movie? This action cannot be undone.')) return;
        try {
            await api.delete(`/movies/${id}`);
            toast.success('Movie deleted successfully');
            setMovies(movies.filter(m => m._id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete movie');
        }
    };

    return (
        <div className="space-y-8 fade-in h-full flex flex-col">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-base-50 mb-2">Manage Movies</h1>
                    <p className="text-base-400">View and edit the active movie catalog.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchMovies} className="box-button-secondary text-sm flex items-center gap-2">
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                    <button className="box-button-primary text-sm flex items-center gap-2">
                        <span className="text-lg leading-none">+</span> Add Movie
                    </button>
                </div>
            </div>

            <div className="box-panel flex-1 overflow-hidden flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="w-8 h-8 border-4 border-base-800 border-t-primary-500 rounded-full animate-spin"></div>
                    </div>
                ) : movies.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <AlertCircle className="w-12 h-12 text-base-600 mb-4" />
                        <h3 className="text-lg font-medium text-base-100 mb-1">No movies found</h3>
                        <p className="text-base-400">Your catalog is empty. Click "Add Movie" to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-base-800/60 bg-base-900/30">
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Movie</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Language</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Duration</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Release Date</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-800/60">
                                {movies.map((movie, index) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={movie._id}
                                        className="hover:bg-base-800/20 transition-colors group"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={movie.posterUrl}
                                                    alt={movie.title}
                                                    className="w-10 h-14 object-cover rounded shadow-sm border border-base-700"
                                                />
                                                <span className="font-semibold text-base-50 line-clamp-2 max-w-[200px]">{movie.title}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-2.5 py-1 bg-base-800 border border-base-700 rounded text-xs text-base-300 font-medium">
                                                {movie.language}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-base-300">{movie.duration} min</td>
                                        <td className="py-4 px-6 text-base-400 text-sm">
                                            {new Date(movie.releaseDate).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                <button
                                                    className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                                                    title="Edit Movie"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(movie._id)}
                                                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    title="Delete Movie"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AdminMovies;
