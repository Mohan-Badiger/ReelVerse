import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const MovieCard = ({ movie, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="group relative w-full aspect-2/3 rounded-lg overflow-hidden bg-base-900 border border-base-800 hover:border-primary-500 transition-all duration-300 shadow-sm hover:shadow-md"
    >
      {/* Poster */}
      <img
        src={movie.posterUrl}
        alt={movie.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-90"></div>

      {/* Hover Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition duration-300">
        
        {/* Title */}
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-2">
          {movie.title}
        </h3>

        {/* Movie Info */}
        <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-300 mb-3">
          <span>{new Date(movie.releaseDate).getFullYear()}</span>

          <span className="w-1 h-1 bg-slate-500 rounded-full"></span>

          <span>{movie.duration}m</span>

          <span className="w-1 h-1 bg-slate-500 rounded-full"></span>

          <span className="px-2 py-0.5 border border-slate-600 rounded text-[10px] uppercase tracking-wide">
            {movie.language}
          </span>
        </div>

        {/* Button */}
        <Link
          to={`/movie/${movie._id}`}
          className="flex items-center justify-center gap-1 bg-white text-black text-xs font-semibold py-2 rounded-md hover:bg-slate-200 transition active:scale-95"
        >
          <Play size={14} fill="currentColor" />
          Book
        </Link>
      </div>
    </motion.div>
  );
};

export default MovieCard;