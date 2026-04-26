import { motion, AnimatePresence } from 'framer-motion';
import { X, Film, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const TrailerModal = ({ isOpen, onClose, trailerUrl, movieTitle }) => {
    const [isLoading, setIsLoading] = useState(true);

    // Escape key listener
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Handle body scroll locking and loading reset
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'; // Lock scrolling
            setIsLoading(true);
        } else {
            document.body.style.overflow = 'unset'; // Unlock scrolling
            setTimeout(() => setIsLoading(true), 300);
        }
        
        return () => {
            document.body.style.overflow = 'unset'; // Cleanup on unmount
        };
    }, [isOpen]);

    if (!trailerUrl) return null;

    // Convert YouTube URLs to embed format
    const getEmbedUrl = (url) => {
        if (!url) return '';
        let videoId = '';

        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            return url;
        }

        return videoId
            ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
            : url;
    };

    const embedUrl = getEmbedUrl(trailerUrl);

    // Render using a Portal to escape any parent CSS transforms/filters that break position: fixed
    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">

                    {/* Premium Cinematic Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-base-950/90 backdrop-blur-xl"
                    >
                        {/* Subtle glow in the center */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)] pointer-events-none" />
                    </motion.div>

                    {/* Trailer Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 35,
                            mass: 0.8
                        }}
                        className="relative w-full max-w-5xl max-h-[90vh] z-10 flex flex-col shadow-[0_0_80px_rgba(99,102,241,0.15)] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-base-950/80 backdrop-blur-md"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-black/60 backdrop-blur-md relative z-20 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 sm:p-2 bg-primary-500/20 rounded-lg border border-primary-500/30 text-primary-400">
                                    <Film size={18} />
                                </div>
                                <h3 className="text-white font-bold text-base sm:text-lg tracking-tight line-clamp-1">
                                    {movieTitle ? `${movieTitle} - Trailer` : 'Watch Trailer'}
                                </h3>
                            </div>

                            {/* Premium Close Button */}
                            <button
                                onClick={onClose}
                                className="group p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 text-slate-300 hover:text-white"
                                title="Close"
                            >
                                <X size={20} className="transition-transform duration-300 group-hover:rotate-90" />
                            </button>
                        </div>

                        {/* Video Area */}
                        <div className="relative w-full aspect-video bg-black flex-1 min-h-0">
                            {/* Loading State */}
                            <AnimatePresence>
                                {isLoading && (
                                    <motion.div 
                                        initial={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-base-950 z-10"
                                    >
                                        <Loader2 size={36} className="text-primary-500 animate-spin mb-4" />
                                        <p className="text-slate-400 text-xs sm:text-sm font-medium tracking-widest uppercase animate-pulse">Loading Trailer</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <iframe
                                src={embedUrl}
                                title={movieTitle ? `${movieTitle} Trailer` : "Movie Trailer"}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onLoad={() => setIsLoading(false)}
                            />
                        </div>
                    </motion.div>

                </div>
            )}
        </AnimatePresence>
    );

    // Only render on client side to avoid SSR issues if ever ported to Next.js
    if (typeof window === 'undefined') return null;

    return createPortal(modalContent, document.body);
};

export default TrailerModal;