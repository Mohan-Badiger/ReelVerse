import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, ChevronRight, ChevronLeft, Film, Info, Layout, PlayCircle } from 'lucide-react';
import coreApi from '../../services/coreApi';
import toast from 'react-hot-toast';

const GENRES = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi',
    'Thriller', 'Animation', 'Fantasy', 'Mystery', 'Crime', 'Documentary', 'Historical'
];

const LANGUAGES = [
    'English', 'Hindi', 'Kannada', 'Telugu', 'Tamil', 'Malayalam',
    'Marathi', 'Bengali', 'Punjabi', 'Gujarati'
];

const EditMovieModal = ({ isOpen, onClose, onEdit, movie }) => {
    const [step, setStep] = useState(1);
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
                genre: movie.genre && movie.genre.length > 0 ? movie.genre[0] : '',
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

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'poster' && formData[key] === null) {
                    // Skip
                } else if (formData[key] !== null && formData[key] !== '') {
                    if (key === 'genre' || key === 'cast') {
                        const arr = typeof formData[key] === 'string' ? formData[key].split(',').map(s => s.trim()).filter(Boolean) : formData[key];
                        data.append(key, JSON.stringify(arr));
                    } else {
                        data.append(key, formData[key]);
                    }
                }
            });

            await coreApi.put(`/movies/${movie._id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Movie updated successfully');
            onEdit();
            handleClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update movie');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        onClose();
    };

    const steps = [
        { id: 1, title: 'Identity', icon: <Layout size={18} /> },
        { id: 2, title: 'Production', icon: <Film size={18} /> },
        { id: 3, title: 'Media', icon: <PlayCircle size={18} /> }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-40 backdrop-blur-md"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-[#0d0d0d] border border-base-800/50 rounded-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] z-50 overflow-hidden flex h-[600px]"
                    >
                        {/* Sidebar Progress */}
                        <div className="w-64 bg-[#111] border-r border-base-800/50 p-8 hidden md:flex flex-col">
                            <div className="mb-10">
                                <h2 className="text-xl font-bold text-white mb-1">Edit Movie</h2>
                                <p className="text-xs text-base-500 font-medium uppercase tracking-widest">Update Catalog</p>
                            </div>

                            <div className="space-y-6 relative">
                                <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-base-800/50 z-0" />

                                {steps.map((s) => (
                                    <div key={s.id} className="relative z-10 flex items-center gap-4 group">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${step === s.id ? 'bg-primary-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' :
                                                step > s.id ? 'bg-emerald-500 text-white' : 'bg-base-900 text-base-500 border border-base-800'
                                            }`}>
                                            {step > s.id ? <Check size={18} /> : s.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-semibold transition-colors ${step === s.id ? 'text-white' : 'text-base-500'}`}>
                                                {s.title}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="flex-1 flex flex-col bg-base-950/50 relative overflow-hidden">
                            <button onClick={handleClose} className="absolute top-6 right-6 text-base-500 hover:text-white transition-colors z-20">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-bold text-white">Movie Identity</h3>
                                                <p className="text-base-400">Update the core information for this title.</p>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="group">
                                                    <label className="block text-[10px] font-bold text-base-500 uppercase tracking-[0.2em] mb-2">Movie Title</label>
                                                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-transparent border-b border-base-800 py-3 text-lg text-white focus:outline-none focus:border-primary-500 transition-colors" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-base-500 uppercase tracking-[0.2em] mb-2">Genre</label>
                                                        <select name="genre" value={formData.genre} onChange={handleChange} className="box-input bg-base-900/50 border-base-800 rounded-lg">
                                                            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-base-500 uppercase tracking-[0.2em] mb-2">Language</label>
                                                        <select name="language" value={formData.language} onChange={handleChange} className="box-input bg-base-900/50 border-base-800 rounded-lg">
                                                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-base-500 uppercase tracking-[0.2em] mb-2">Description</label>
                                                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="box-input bg-base-900/50 border-base-800 rounded-lg resize-none" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-bold text-white">Production Details</h3>
                                                <p className="text-base-400">Technical specifications and crew information.</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-base-500 uppercase tracking-[0.2em] mb-2">Duration (mins)</label>
                                                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="box-input bg-base-900/50" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-base-500 uppercase tracking-[0.2em] mb-2">Release Date</label>
                                                    <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} className="box-input bg-base-900/50" style={{ colorScheme: 'dark' }} />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-base-500 uppercase tracking-[0.2em] mb-2">Director</label>
                                                    <input type="text" name="director" value={formData.director} onChange={handleChange} className="box-input bg-base-900/50" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-base-500 uppercase tracking-[0.2em] mb-2">Rating</label>
                                                    <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} className="box-input bg-base-900/50" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-base-500 uppercase tracking-[0.2em] mb-2">Lead Cast</label>
                                                <input type="text" name="cast" value={formData.cast} onChange={handleChange} className="box-input bg-base-900/50" />
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-bold text-white">Media Assets</h3>
                                                <p className="text-base-400">Update movie visuals and links.</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-base-500 uppercase tracking-[0.2em] mb-3">Movie Poster</label>
                                                    <div className="relative aspect-2/3 w-full border-2 border-dashed border-base-800 hover:border-primary-500 rounded-xl bg-base-900/30 group transition-all overflow-hidden flex items-center justify-center cursor-pointer">
                                                        {previewUrl ? (
                                                            <>
                                                                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Upload className="text-white w-8 h-8" />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center text-base-600 group-hover:text-primary-400 transition-colors">
                                                                <Upload size={32} className="mb-2" />
                                                                <span className="text-xs font-bold tracking-widest uppercase">Select Image</span>
                                                            </div>
                                                        )}
                                                        <input type="file" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                    </div>
                                                </div>
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-base-500 uppercase tracking-[0.2em] mb-2">Trailer URL</label>
                                                        <input type="text" name="trailerUrl" value={formData.trailerUrl} onChange={handleChange} className="box-input bg-base-900/50" />
                                                    </div>
                                                    <div className="bg-base-900/50 border border-base-800 p-5 rounded-xl flex items-center justify-between group hover:border-primary-500/50 transition-colors">
                                                        <div>
                                                            <p className="text-sm font-semibold text-white">Upcoming Movie</p>
                                                            <p className="text-[10px] text-primary-400 mt-0.5">Auto-categorized by release date</p>
                                                        </div>
                                                        <div className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={formData.releaseDate ? new Date(formData.releaseDate) > new Date() : formData.isUpcoming}
                                                                readOnly
                                                            />
                                                            <div className="w-11 h-6 bg-base-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-base-400 after:border-base-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-checked:after:bg-white opacity-70"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="p-8 border-t border-base-800/50 flex justify-between items-center bg-[#0d0d0d] relative z-10">
                                <p className="text-[10px] text-base-500 font-bold uppercase tracking-widest">Step {step} of 3</p>
                                <div className="flex gap-4">
                                    {step > 1 && (
                                        <button onClick={prevStep} className="px-6 py-2.5 rounded-lg text-sm font-bold text-base-400 hover:text-white flex items-center gap-2 transition-colors">
                                            <ChevronLeft size={16} /> Back
                                        </button>
                                    )}
                                    {step < 3 ? (
                                        <button onClick={nextStep} className="box-button-primary px-8 flex items-center gap-2">
                                            Next <ChevronRight size={16} />
                                        </button>
                                    ) : (
                                        <button onClick={handleSubmit} disabled={isLoading} className="box-button-primary px-8 bg-emerald-600 hover:bg-emerald-500">
                                            {isLoading ? 'Updating...' : 'Update Movie'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EditMovieModal;
