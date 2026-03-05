import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import coreApi from '../../services/coreApi';
import toast from 'react-hot-toast';

const ShowtimeModal = ({ isOpen, onClose, onSave, showtime }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [movies, setMovies] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [formData, setFormData] = useState({
        movie: '',
        theatre: '',
        date: '',
        time: '',
        ticketPrice: '',
        seatCount: 120
    });

    const isEditMode = !!showtime;

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
                toast.error('Failed to load movies or theatres for options');
            }
        };
        fetchDependencies();
    }, []);

    useEffect(() => {
        if (showtime) {
            setFormData({
                movie: showtime.movie?._id || showtime.movie || '',
                theatre: showtime.theatre?._id || showtime.theatre || '',
                date: showtime.date ? new Date(showtime.date).toISOString().split('T')[0] : '',
                time: showtime.time || '',
                ticketPrice: showtime.ticketPrice || '',
                seatCount: showtime.seats?.length || 120
            });
        } else {
            setFormData({
                movie: '',
                theatre: '',
                date: '',
                time: '',
                ticketPrice: '',
                seatCount: 120
            });
        }
    }, [showtime, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = { ...formData };
            payload.ticketPrice = Number(payload.ticketPrice);
            payload.seatCount = Number(payload.seatCount);

            if (isEditMode) {
                await coreApi.put(`/showtimes/${showtime._id}`, payload);
                toast.success('Showtime updated successfully');
            } else {
                await coreApi.post('/showtimes', payload);
                toast.success('Showtime added successfully');
            }
            onSave();
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} showtime`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-base-950 border border-base-800 rounded-sm shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-base-800 shrink-0">
                            <h2 className="text-xl font-bold tracking-tight text-white">{isEditMode ? 'Edit Showtime' : 'Add New Showtime'}</h2>
                            <button
                                onClick={handleClose}
                                className="text-base-400 hover:text-white transition-colors"
                                disabled={isLoading}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            <form id="showtime-form" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Select Movie *</label>
                                    <select
                                        name="movie"
                                        value={formData.movie}
                                        onChange={handleChange}
                                        required
                                        className="box-input w-full"
                                    >
                                        <option value="" disabled>Select a movie...</option>
                                        {movies.map(m => (
                                            <option key={m._id} value={m._id}>{m.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Select Theatre *</label>
                                    <select
                                        name="theatre"
                                        value={formData.theatre}
                                        onChange={handleChange}
                                        required
                                        className="box-input w-full"
                                    >
                                        <option value="" disabled>Select a theatre...</option>
                                        {theatres.map(t => (
                                            <option key={t._id} value={t._id}>{t.name} - {t.location}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Date *</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            required
                                            className="box-input w-full"
                                            style={{ colorScheme: 'dark' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Time *</label>
                                        <input
                                            type="text"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleChange}
                                            required
                                            className="box-input w-full"
                                            placeholder="10:30 AM"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Ticket Price (₹) *</label>
                                        <input
                                            type="number"
                                            name="ticketPrice"
                                            value={formData.ticketPrice}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="box-input w-full"
                                            placeholder="250"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Seat Count *</label>
                                        <input
                                            type="number"
                                            name="seatCount"
                                            value={formData.seatCount}
                                            onChange={handleChange}
                                            required
                                            min="1"
                                            className="box-input w-full"
                                            placeholder="120"
                                            disabled={isEditMode}
                                        />
                                        {isEditMode && <p className="text-xs text-base-500 mt-1">Cannot change seat count after creation.</p>}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-base-800 bg-base-900 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="px-5 py-2.5 rounded-sm font-medium text-base-300 bg-transparent hover:bg-base-800 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="showtime-form"
                                disabled={isLoading}
                                className="box-button-primary min-w-[120px] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    isEditMode ? 'Update' : 'Save'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ShowtimeModal;
