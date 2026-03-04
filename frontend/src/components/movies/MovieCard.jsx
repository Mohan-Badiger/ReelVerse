import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const MovieCard = ({ movie, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
            className="group relative rounded-sm overflow-hidden cursor-pointer w-full aspect-[2/3] flex-shrink-0 bg-base-900 border border-base-800 shadow-sm hover:shadow-sm hover:border-base-800 transition-all duration-300"
        >
            <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                <h3 className="text-white font-bold text-xl leading-tight mb-2 truncate translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {movie.title}
                </h3>

                <div className="flex items-center space-x-2 mb-6 text-xs font-medium text-slate-300 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    <span>{new Date(movie.releaseDate).getFullYear()}</span>
                    <span className="w-1 h-1 rounded-sm bg-slate-600"></span>
                    <span>{movie.duration}m</span>
                    <span className="w-1 h-1 rounded-sm bg-slate-600"></span>
                    <span className="px-1.5 py-0.5 border border-base-800 rounded-sm uppercase tracking-wider">{movie.language}</span>
                </div>

                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                    <Link
                        to={`/movie/${movie._id}`}
                        className="w-full bg-white text-base-950 font-bold py-3 rounded-sm flex items-center justify-center hover:bg-slate-200 transition-colors shadow-sm shadow-white/10 active:scale-95 duration-200"
                    >
                        <Play size={16} className="mr-2" fill="currentColor" /> Book Tickets
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default MovieCard;
