import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

const TrailerModal = ({ isOpen, onClose, trailerUrl }) => {
    // Escape key listener
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex">

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    {/* Trailer Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="relative w-full max-w-6xl aspect-video z-10"
                    >
                        {/* Video */}
                        <iframe
                            src={embedUrl}
                            title="Movie Trailer"
                            className="w-full h-[90vh] rounded-md shadow-2xl border border-white/10"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full transition"
                            title="Close"
                        >
                            <X size={22} />
                        </button>
                    </motion.div>

                </div>
            )}
        </AnimatePresence>
    );
};

export default TrailerModal;