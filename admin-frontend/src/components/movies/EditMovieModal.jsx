import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import coreApi from '../../services/coreApi';
import toast from 'react-hot-toast';

const EditMovieModal = ({ isOpen, onClose, onEdit, movie }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        genre: '',
        duration: '',
        language: '',
        releaseDate: '',
        director: '',
        cast: '',
        rating: '',
        isUpcoming: false,
        trailerUrl: '',
        poster: null
    });

    useEffect(() => {
        if (movie) {
            setFormData({
                title: movie.title || '',
                description: movie.description || '',
                genre: movie.genre ? movie.genre.join(', ') : '',
                duration: movie.duration || '',
                language: movie.language || '',
                releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split('T')[0] : '',
                director: movie.director || '',
                cast: movie.cast ? movie.cast.join(', ') : '',
                rating: movie.rating || '',
                isUpcoming: movie.isUpcoming || false,
                trailerUrl: movie.trailerUrl || '',
                poster: null
            });
            setPreviewUrl(movie.posterUrl || null);
        }
    }, [movie]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            setFormData({ ...formData, poster: file });
            if (file) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(movie?.posterUrl || null);
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'poster' && formData[key] === null) {
                    // Don't append if null, backend handles it
                } else if (formData[key] !== null && formData[key] !== '') {
                    if (key === 'genre' || key === 'cast') {
                        const arr = formData[key].split(',').map(s => s.trim()).filter(Boolean);
                        data.append(key, JSON.stringify(arr));
                    } else {
                        data.append(key, formData[key]);
                    }
                }
            });

            const res = await coreApi.put(`/movies/${movie._id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Movie updated successfully');
            onEdit();
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update movie');
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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-base-950 border border-base-800 rounded-sm shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-base-800 shrink-0">
                            <h2 className="text-xl font-bold tracking-tight text-white">Edit Movie</h2>
                            <button
                                onClick={handleClose}
                                className="text-base-400 hover:text-white transition-colors"
                                disabled={isLoading}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrolling Form Body */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            <form id="edit-movie-form" onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Title *</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                required
                                                className="box-input w-full"
                                                placeholder="e.g. Inception"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Genre (Comma separated) *</label>
                                            <input
                                                type="text"
                                                name="genre"
                                                value={formData.genre}
                                                onChange={handleChange}
                                                required
                                                className="box-input w-full"
                                                placeholder="Action, Sci-Fi"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Duration (mins) *</label>
                                                <input
                                                    type="number"
                                                    name="duration"
                                                    value={formData.duration}
                                                    onChange={handleChange}
                                                    required
                                                    className="box-input w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Rating (0-10)</label>
                                                <input
                                                    type="number"
                                                    name="rating"
                                                    value={formData.rating}
                                                    onChange={handleChange}
                                                    step="0.1"
                                                    min="0"
                                                    max="10"
                                                    className="box-input w-full"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Language *</label>
                                                <input
                                                    type="text"
                                                    name="language"
                                                    value={formData.language}
                                                    onChange={handleChange}
                                                    required
                                                    className="box-input w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Release Date *</label>
                                                <input
                                                    type="date"
                                                    name="releaseDate"
                                                    value={formData.releaseDate}
                                                    onChange={handleChange}
                                                    required
                                                    className="box-input w-full"
                                                    style={{ colorScheme: 'dark' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column (File Upload & Description) */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Movie Poster (Leave empty to keep)</label>
                                            <div className="relative border-2 border-dashed border-base-700 hover:border-primary-500 rounded-sm h-40 flex items-center justify-center bg-base-900 group transition-colors overflow-hidden">
                                                {previewUrl ? (
                                                    <div className="relative w-full h-full">
                                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-contain bg-black" />
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <p className="text-white text-sm font-medium">Click to change</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-base-400 group-hover:text-primary-400 transition-colors">
                                                        <Upload className="w-6 h-6 mb-2" />
                                                        <span className="text-sm font-medium">Upload Image</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    name="poster"
                                                    accept="image/*"
                                                    onChange={handleChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Director</label>
                                            <input
                                                type="text"
                                                name="director"
                                                value={formData.director}
                                                onChange={handleChange}
                                                className="box-input w-full"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Cast (Comma separated)</label>
                                            <input
                                                type="text"
                                                name="cast"
                                                value={formData.cast}
                                                onChange={handleChange}
                                                className="box-input w-full"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Trailer URL</label>
                                            <input
                                                type="text"
                                                name="trailerUrl"
                                                value={formData.trailerUrl}
                                                onChange={handleChange}
                                                className="box-input w-full"
                                                placeholder="https://youtube.com/..."
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 bg-base-900 border border-base-800 rounded-sm p-3">
                                            <input
                                                type="checkbox"
                                                id="isUpcomingEdit"
                                                name="isUpcoming"
                                                checked={formData.isUpcoming}
                                                onChange={(e) => setFormData({ ...formData, isUpcoming: e.target.checked })}
                                                className="w-4 h-4 rounded-sm border-base-700 bg-base-900 text-primary-500 focus:ring-primary-500/50 cursor-pointer"
                                            />
                                            <label htmlFor="isUpcomingEdit" className="text-sm font-medium text-base-50 cursor-pointer user-select-none">
                                                Mark as Upcoming Movie
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Width Description */}
                                <div>
                                    <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows="3"
                                        className="box-input w-full resize-none"
                                    ></textarea>
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
                                form="edit-movie-form"
                                disabled={isLoading}
                                className="box-button-primary min-w-[120px] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Update Movie'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EditMovieModal;
