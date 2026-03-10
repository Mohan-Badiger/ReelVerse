import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, ArrowLeft, Check } from 'lucide-react';
import coreApi from '../services/coreApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PRESET_TIMINGS = [
    '10:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
    '03:00 PM', '04:30 PM', '06:00 PM', '07:30 PM',
    '09:00 PM', '10:30 PM'
];

const getFormattedDate = (daysToAdd) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    // Use local coordinates to avoid timezone shift in ISO string
    const offset = d.getTimezoneOffset()
    d.setMinutes(d.getMinutes() - offset)
    return d.toISOString().split('T')[0];
};

const DAYS_OPTIONS = [
    { label: 'Today', value: getFormattedDate(0) },
    { label: 'Tomorrow', value: getFormattedDate(1) },
    { label: 'Day After Tomorrow', value: getFormattedDate(2) }
];

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
            days: [DAYS_OPTIONS[0].value],
            showtimes: [],
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
                days: [DAYS_OPTIONS[0].value],
                showtimes: [],
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

    const toggleShowtime = (blockId, time) => {
        setShows(shows.map(block => {
            if (block.id !== blockId) return block;
            const isSelected = block.showtimes.includes(time);
            const newShowtimes = isSelected
                ? block.showtimes.filter(t => t !== time)
                : [...block.showtimes, time];

            // Sort new timings based on PRESET_TIMINGS index
            newShowtimes.sort((a, b) => PRESET_TIMINGS.indexOf(a) - PRESET_TIMINGS.indexOf(b));
            return { ...block, showtimes: newShowtimes };
        }));
    };

    const toggleDay = (blockId, dateValue) => {
        setShows(shows.map(block => {
            if (block.id !== blockId) return block;
            const isSelected = block.days.includes(dateValue);
            const newDays = isSelected
                ? block.days.filter(d => d !== dateValue)
                : [...block.days, dateValue];
            return { ...block, days: newDays };
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
            if (block.days.length === 0) {
                toast.error('Please select at least one scheduled day for all blocks.');
                return;
            }
            if (block.showtimes.length === 0) {
                toast.error('Please select at least one showtime for all blocks.');
                return;
            }

            formattedShows.push({
                theaterId: block.theaterId,
                screen: Number(block.screen) || 1,
                days: block.days,
                showtimes: block.showtimes,
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
            toast.success('All matching shows scheduled successfully!');
            navigate('/showtimes');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to schedule shows.');
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
                    <h1 className="text-3xl font-bold tracking-tight text-base-50 mb-2">Advanced Scheduling</h1>
                    <p className="text-base-400">Schedule multiple theaters across multiple days in split seconds.</p>
                </div>
            </div>

            <div className="box-panel p-6 flex-1 overflow-auto bg-base-900/50">
                <form id="bulk-shows-form" onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">

                    {/* Movie Selection */}
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
                            <h2 className="text-xl font-semibold text-white">2. Theater Mapping</h2>
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
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98, height: 0 }}
                                    className="bg-base-950 rounded-sm border border-base-800 shadow-md overflow-hidden relative group"
                                >
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBlock(block.id)}
                                            className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-sm transition-colors"
                                            title="Remove Theater Block"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {/* Block Header Area */}
                                    <div className="p-6 border-b border-base-800 bg-base-900/30">
                                        <h3 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                                            <span className="w-5 h-5 rounded bg-primary-500/20 flex items-center justify-center text-xs">{index + 1}</span>
                                            Theater Allocation
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div className="lg:col-span-2">
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
                                        </div>
                                    </div>

                                    {/* Scheduling Area */}
                                    <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                                        <div className="lg:col-span-8">
                                            <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-3">Select Show Timings *</label>
                                            <div className="flex flex-wrap gap-2">
                                                {PRESET_TIMINGS.map((time) => {
                                                    const isSelected = block.showtimes.includes(time);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={time}
                                                            onClick={() => toggleShowtime(block.id, time)}
                                                            className={`
                                                                px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border
                                                                ${isSelected
                                                                    ? 'bg-primary-600 text-white border-primary-500 shadow-[0_0_10px_rgba(99,102,241,0.3)] ring-1 ring-primary-500'
                                                                    : 'bg-base-900 text-base-300 border-base-700 hover:border-base-600 hover:bg-base-800'
                                                                }
                                                            `}
                                                        >
                                                            {isSelected && <Check size={14} className="shrink-0" />} {time}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {block.showtimes.length === 0 && (
                                                <p className="text-xs text-rose-500 mt-2 font-medium">Select at least one timing.</p>
                                            )}
                                        </div>

                                        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-base-800 pt-6 lg:pt-0 lg:pl-8">
                                            <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-3">Schedule Days *</label>
                                            <div className="flex flex-col gap-2">
                                                {DAYS_OPTIONS.map((dayOption) => {
                                                    const isSelected = block.days.includes(dayOption.value);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={dayOption.value}
                                                            onClick={() => toggleDay(block.id, dayOption.value)}
                                                            className={`
                                                                w-full flex items-center justify-between px-4 py-3 rounded-sm border transition-all text-left
                                                                ${isSelected
                                                                    ? 'bg-primary-500/10 border-primary-500/50 text-primary-300'
                                                                    : 'bg-base-900 border-base-800 text-base-300 hover:bg-base-800'
                                                                }
                                                            `}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-sm">{dayOption.label}</span>
                                                                <span className="text-xs opacity-70 mt-0.5">{dayOption.value}</span>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center">
                                                                    <Check size={12} className="text-white" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {block.days.length === 0 && (
                                                <p className="text-xs text-rose-500 mt-2 font-medium">Select at least one day.</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="flex bg-base-950 p-6 rounded-sm border border-base-800 shadow-xl justify-between items-center sticky bottom-4 z-10 backdrop-blur-md">
                        <div className="hidden sm:block">
                            <h3 className="text-white font-medium">Ready to deploy?</h3>
                            <p className="text-sm text-base-400">
                                This will create overlapping scheduled documents instantly.
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl px-8 py-3 rounded-sm font-semibold tracking-wide flex items-center justify-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                'Create Shows Schedule'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddShows;

