import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import coreApi from '../services/coreApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AddShows = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [movies, setMovies] = useState([]);
    const [theatres, setTheatres] = useState([]);

    const [movieId, setMovieId] = useState('');
    const [shows, setShows] = useState([
        {
            id: Date.now(),
            theaterId: '',
            screen: 1,
            date: '',
            showtimes: [''],
            price: 250,
            totalSeats: 120
        }
    ]);

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [moviesRes, theatresRes] = await Promise.all([
                    coreApi.get('/movies'),
                    coreApi.get('/theatres')
                ]);
                setMovies(moviesRes.data);
                setTheatres(theatresRes.data);
            } catch (error) {
                toast.error('Failed to load movies or theatres. Please refresh.');
            }
        };
        fetchDependencies();
    }, []);

    const handleAddBlock = () => {
        setShows([
            ...shows,
            {
                id: Date.now(),
                theaterId: '',
                screen: 1,
                date: '',
                showtimes: [''],
                price: 250,
                totalSeats: 120
            }
        ]);
    };

    const handleRemoveBlock = (id) => {
        if (shows.length === 1) {
            toast.error('At least one theater block is required.');
            return;
        }
        setShows(shows.filter(s => s.id !== id));
    };

    const handleBlockChange = (id, field, value) => {
        setShows(shows.map(s => (s.id === id ? { ...s, [field]: value } : s)));
    };

    const handleShowtimeChange = (blockId, index, value) => {
        setShows(shows.map(block => {
            if (block.id !== blockId) return block;
            const newShowtimes = [...block.showtimes];
            newShowtimes[index] = value;
            return { ...block, showtimes: newShowtimes };
        }));
    };

    const handleAddShowtimeInput = (blockId) => {
        setShows(shows.map(block => {
            if (block.id !== blockId) return block;
            return { ...block, showtimes: [...block.showtimes, ''] };
        }));
    };

    const handleRemoveShowtimeInput = (blockId, index) => {
        setShows(shows.map(block => {
            if (block.id !== blockId) return block;
            if (block.showtimes.length === 1) {
                toast.error('At least one showtime is required per theater.');
                return block;
            }
            const newShowtimes = [...block.showtimes];
            newShowtimes.splice(index, 1);
            return { ...block, showtimes: newShowtimes };
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!movieId) {
            toast.error('Please select a movie.');
            return;
        }

        const formattedShows = [];

        for (const block of shows) {
            if (!block.theaterId) {
                toast.error('Please select a theater for all blocks.');
                return;
            }
            if (!block.date) {
                toast.error('Please select a date for all blocks.');
                return;
            }

            const validShowtimes = block.showtimes.filter(t => t.trim() !== '');
            if (validShowtimes.length === 0) {
                toast.error('Please provide at least one valid showtime for all blocks.');
                return;
            }

            formattedShows.push({
                theaterId: block.theaterId,
                screen: Number(block.screen) || 1,
                date: block.date,
                showtimes: validShowtimes,
                price: Number(block.price) || 250,
                totalSeats: Number(block.totalSeats) || 120
            });
        }

        setIsLoading(true);
        try {
            await coreApi.post('/showtimes/bulk-create', {
                movieId,
                shows: formattedShows
            });
            toast.success('All shows created successfully!');
            navigate('/showtimes');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create shows.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 fade-in h-full flex flex-col pb-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-sm bg-base-900 border border-base-800 text-base-300 hover:text-white hover:bg-base-800 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-base-50 mb-2">Bulk Add Shows</h1>
                    <p className="text-base-400">Add multiple theaters and showtimes for a movie in one go.</p>
                </div>
            </div>

            <div className="box-panel p-6 flex-1 overflow-auto bg-base-900/50">
                <form id="bulk-shows-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">

                    {/* Movie Selection Profile */}
                    <div className="bg-base-950 p-6 rounded-sm border border-base-800 shadow-md">
                        <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-2">
                            1. Select Movie *
                        </label>
                        <select
                            value={movieId}
                            onChange={(e) => setMovieId(e.target.value)}
                            required
                            className="box-input w-full text-lg py-3"
                        >
                            <option value="" disabled>-- Select a movie --</option>
                            {movies.map(m => (
                                <option key={m._id} value={m._id}>{m.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">2. Theater & Showtime Blocks</h2>
                            <button
                                type="button"
                                onClick={handleAddBlock}
                                className="box-button-secondary text-sm flex items-center gap-2"
                            >
                                <Plus size={16} /> Add Theater Block
                            </button>
                        </div>

                        <AnimatePresence>
                            {shows.map((block, index) => (
                                <motion.div
                                    key={block.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-base-950 p-6 rounded-sm border border-base-800 shadow-md relative group"
                                >
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBlock(block.id)}
                                            className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-sm transition-colors"
                                            title="Remove Theater Block"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-5">
                                        Theater Block {index + 1}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Select Theater *</label>
                                            <select
                                                required
                                                value={block.theaterId}
                                                onChange={(e) => handleBlockChange(block.id, 'theaterId', e.target.value)}
                                                className="box-input w-full"
                                            >
                                                <option value="" disabled>Select theater...</option>
                                                {theatres.map(t => (
                                                    <option key={t._id} value={t._id}>{t.name} - {t.location}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Screen No. *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    value={block.screen}
                                                    onChange={(e) => handleBlockChange(block.id, 'screen', e.target.value)}
                                                    className="box-input w-full"
                                                    placeholder="1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Date *</label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={block.date}
                                                    onChange={(e) => handleBlockChange(block.id, 'date', e.target.value)}
                                                    className="box-input w-full"
                                                    style={{ colorScheme: 'dark' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-2">Showtimes for this Date *</label>
                                        <div className="flex flex-wrap gap-3 items-center">
                                            {block.showtimes.map((st, i) => (
                                                <div key={i} className="flex items-center gap-1 bg-base-900 border border-base-800 rounded-sm pr-1">
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="10:00 AM"
                                                        value={st}
                                                        onChange={(e) => handleShowtimeChange(block.id, i, e.target.value)}
                                                        className="bg-transparent border-none text-sm text-base-50 py-1.5 px-3 w-28 focus:outline-none focus:ring-0 placeholder-base-600"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveShowtimeInput(block.id, i)}
                                                        className="p-1 text-base-500 hover:text-rose-400 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => handleAddShowtimeInput(block.id)}
                                                className="py-1.5 px-3 text-sm text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 rounded-sm border border-primary-500/20 transition-colors flex items-center gap-1"
                                            >
                                                <Plus size={14} /> Add Time
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 bg-base-900/50 p-4 rounded-sm border border-base-800/50">
                                        <div>
                                            <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Ticket Price (₹) *</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                value={block.price}
                                                onChange={(e) => handleBlockChange(block.id, 'price', e.target.value)}
                                                className="box-input w-full"
                                                placeholder="250"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Total Seats *</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={block.totalSeats}
                                                onChange={(e) => handleBlockChange(block.id, 'totalSeats', e.target.value)}
                                                className="box-input w-full"
                                                placeholder="120"
                                            />
                                        </div>
                                    </div>

                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="flex bg-base-950 p-6 rounded-sm border border-base-800 shadow-md justify-between items-center sticky bottom-0 z-10">
                        <p className="text-sm text-base-400 hidden sm:block">
                            Review all theaters and showtimes before submitting.
                        </p>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="box-button-primary min-w-[200px] flex items-center justify-center gap-2 ml-auto"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Creating Shows...
                                </>
                            ) : (
                                'Create All Shows'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

// Simple inline X icon since I forgot to import it at the top
const X = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default AddShows;
