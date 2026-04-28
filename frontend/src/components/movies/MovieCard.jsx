import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Star, Film, Heart, Clock, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../../utils/axios";
import TrailerModal from "./TrailerModal";

let globalWatchlistCache = null;
let globalWatchlistPromise = null;

const fetchWatchlist = () => {
  if (globalWatchlistCache) return Promise.resolve(globalWatchlistCache);
  if (!globalWatchlistPromise) {
    globalWatchlistPromise = api.get('/users/profile').then(res => {
      globalWatchlistCache = res.data.watchlist || [];
      return globalWatchlistCache;
    }).catch(err => {
      globalWatchlistPromise = null;
      return [];
    });
  }
  return globalWatchlistPromise;
};

const MovieCard = ({ movie, index = 0 }) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Check if movie is in user's watchlist
  useEffect(() => {
    if (!userInfo) return;
    fetchWatchlist().then(wl => {
      setIsInWatchlist(wl.some(m => (m._id || m) === movie._id));
    });
  }, [userInfo, movie._id]);

  const toggleWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userInfo) {
      toast.error('Please login to use watchlist');
      return;
    }

    // Optimistic update
    const previousState = isInWatchlist;
    setIsInWatchlist(!previousState);
    setIsToggling(true);

    try {
      if (previousState) {
        await api.delete(`/users/watchlist/${movie._id}`);
        if (globalWatchlistCache) {
          globalWatchlistCache = globalWatchlistCache.filter(m => (m._id || m) !== movie._id);
        }
        toast.success('Removed from watchlist');
      } else {
        await api.post(`/users/watchlist/${movie._id}`);
        if (globalWatchlistCache) {
          globalWatchlistCache.push(movie._id);
        }
        toast.success('Added to watchlist');
      }
    } catch (err) {
      setIsInWatchlist(previousState); // revert
      toast.error(err.response?.data?.message || 'Failed to update watchlist');
    } finally {
      setIsToggling(false);
    }
  };

  const genres = Array.isArray(movie.genre || movie.genres)
    ? (movie.genre || movie.genres)
    : String(movie.genre || movie.genres || '').split(',').filter(Boolean);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.35 }}
        className="group relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-base-900 border border-base-800/60 hover:border-primary-500/50 transition-all duration-500 shadow-sm hover:shadow-lg hover:shadow-primary-500/5"
      >
        {/* Poster */}
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Watchlist Heart Button — always visible */}
        <button
          onClick={toggleWatchlist}
          disabled={isToggling}
          className={`absolute top-2.5 left-2.5 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md border
            ${isInWatchlist
              ? 'bg-rose-500/90 border-rose-400 text-white shadow-lg shadow-rose-500/30 scale-100'
              : 'bg-black/40 border-white/10 text-white/70 hover:bg-rose-500/80 hover:border-rose-400 hover:text-white hover:shadow-lg hover:shadow-rose-500/20'
            }
            ${isToggling ? 'animate-pulse' : ''}
          `}
          title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Heart size={15} fill={isInWatchlist ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>

        {/* Rating Badge or Coming Soon */}
        {movie.isUpcoming ? (
          <div className="absolute top-2.5 right-2.5 z-10">
            <div className="bg-primary-600/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-lg shadow-primary-500/20 border border-primary-400/30 flex items-center gap-1">
              <Calendar size={10} />
              Coming Soon
            </div>
          </div>
        ) : (
          movie.rating > 0 && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-400 flex items-center gap-1 border border-amber-500/20 shadow-lg">
                <Star size={11} fill="currentColor" /> {movie.rating.toFixed(1)}
              </div>
            </div>
          )
        )}

        {/* Persistent Bottom Info — always visible */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-3.5 bg-linear-to-t from-black/95 via-black/70 to-transparent pt-16">
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-1 mb-1.5">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-slate-300/80">
            {movie.duration && (
              <span className="flex items-center gap-0.5">
                <Clock size={10} /> {movie.duration}m
              </span>
            )}
            {movie.language && (
              <>
                <span className="w-0.5 h-0.5 bg-slate-500 rounded-full"></span>
                <span className="uppercase tracking-wide">{movie.language}</span>
              </>
            )}
          </div>
        </div>

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-10"></div>

        {/* Hover Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-3 group-hover:translate-y-0">

          {/* Title */}
          <h3 className="text-white font-bold text-base leading-tight line-clamp-2 mb-1.5">
            {movie.title}
          </h3>

          {/* Meta Info */}
          <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-300 mb-2.5">
            <span>{movie.isUpcoming ? `Release ${new Date(movie.releaseDate).getFullYear()}` : new Date(movie.releaseDate).getFullYear()}</span>
            {movie.duration && (
              <>
                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                <span>{movie.duration}m</span>
              </>
            )}
            {movie.language && (
              <>
                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                <span className="uppercase tracking-wide">{movie.language}</span>
              </>
            )}
          </div>

          {/* Genre Tags */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {genres.slice(0, 3).map((g, i) => (
                <span key={i} className="px-2 py-0.5 bg-white/10 text-white/80 backdrop-blur-sm border border-white/10 rounded-full text-[9px] uppercase tracking-wider font-semibold">
                  {g.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {movie.trailerUrl && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowTrailer(true);
                }}
                className="flex items-center justify-center gap-1.5 bg-white/10 backdrop-blur-md text-white border border-white/15 text-xs font-semibold py-2 rounded-lg hover:bg-white/20 hover:border-white/25 transition-all duration-300 active:scale-95"
              >
                <Film size={13} />
                Watch Trailer
              </button>
            )}

            <Link
              to={`/movie/${movie._id}`}
              className="flex items-center justify-center gap-1.5 bg-white text-black text-xs font-bold py-2.5 rounded-lg hover:bg-slate-100 transition-all duration-300 active:scale-95 shadow-lg"
            >
              {movie.isUpcoming ? (
                <>View Details</>
              ) : (
                <>
                  <Play size={13} fill="currentColor" />
                  Book Now
                </>
              )}
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </>
  );
};

export default MovieCard;