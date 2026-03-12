import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";

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

      {/* Rating Badge */}
      {movie.rating > 0 && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-sm text-[11px] font-bold text-amber-400 flex items-center gap-1 z-10 border border-white/10">
          <Star size={12} fill="currentColor" /> {movie.rating.toFixed(1)}
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Hover Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">

        {/* Title */}
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-2">
          {movie.title}
        </h3>

        {/* Movie Info */}
        <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-300 mb-2">
          <span>{new Date(movie.releaseDate).getFullYear()}</span>
          <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
          <span>{movie.duration}m</span>
          <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
          <span className="uppercase tracking-wide">
            {movie.language}
          </span>
        </div>

        {/* Genres */}
        {(movie.genre || movie.genres) && (
          <div className="flex flex-wrap gap-1 mb-4">
            {(Array.isArray(movie.genre || movie.genres)
              ? (movie.genre || movie.genres)
              : String(movie.genre || movie.genres).split(','))
              .slice(0, 3)
              .map((g, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded text-[9px] uppercase tracking-wider font-bold">
                  {g.trim()}
                </span>
              ))}
          </div>
        )}

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