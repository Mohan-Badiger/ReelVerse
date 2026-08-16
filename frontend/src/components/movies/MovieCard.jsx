import { Link } from "react-router-dom";
import { m } from "framer-motion";
import Play from "lucide-react/dist/esm/icons/play";
import Star from "lucide-react/dist/esm/icons/star";
import Film from "lucide-react/dist/esm/icons/film";
import Heart from "lucide-react/dist/esm/icons/heart";
import Clock from "lucide-react/dist/esm/icons/clock";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../../utils/axios";

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
      <Link to={`/movie/${movie._id}`} className="block w-full relative z-10 hover:z-20">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04, duration: 0.35 }}
          className="group relative w-full aspect-2/3 rounded-xl overflow-hidden bg-base-900 border border-white/5 hover:border-primary-500/40 transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1.5 shadow-md hover:shadow-[0_12px_24px_rgba(0,0,0,0.8),0_0_15px_rgba(99,102,241,0.25)] cursor-pointer"
        >
          {/* Poster */}
          <img
            src={movie.posterUrl.includes('cloudinary') ? movie.posterUrl.replace('/upload/', '/upload/f_auto,q_auto,w_400/') : movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            width="400"
            height="600"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Central Play Icon Overlay (Hotstar Style) */}
          <div className="absolute inset-0 flex items-center justify-center z-15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300 ease-out">
              <Play size={22} fill="currentColor" className="ml-0.5" />
            </div>
          </div>

          {/* Watchlist Heart Button — always visible */}
          <button
            onClick={toggleWatchlist}
            disabled={isToggling}
            aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
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
            <div className="absolute top-2.5 right-2.5 z-20">
              <div className="bg-primary-600/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-lg shadow-primary-500/20 border border-primary-400/30 flex items-center gap-1">
                <Calendar size={10} />
                Coming Soon
              </div>
            </div>
          ) : (
            movie.rating > 0 && (
              <div className="absolute top-2.5 right-2.5 z-20">
                <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-400 flex items-center gap-1 border border-amber-500/20 shadow-lg">
                  <Star size={11} fill="currentColor" /> {movie.rating.toFixed(1)} IMDb
                </div>
              </div>
            )
          )}

          {/* Persistent Bottom Info — always visible, hidden on hover */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-3.5 bg-linear-to-t from-black/95 via-black/50 to-transparent pt-16 transition-opacity duration-300 group-hover:opacity-0">
            <h3 className="text-white font-bold text-sm leading-tight line-clamp-1 mb-1">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-slate-300/80 font-medium">
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
          <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/75 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

          {/* Hover Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            {/* Title */}
            <h3 className="text-white font-black text-base leading-tight mb-2 tracking-tight">
              {movie.title}
            </h3>

            {/* Meta Info */}
            <div className="flex items-center flex-wrap gap-2 text-[11px] text-slate-200 mb-2.5 font-semibold">
              <span className="flex items-center gap-1">
                <Calendar size={10} className="text-primary-400" />
                {movie.isUpcoming ? 'Releasing ' : ''}
                {new Date(movie.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {movie.duration && (
                <>
                  <span className="w-1 h-1 bg-slate-500 rounded-full" />
                  <span className="flex items-center gap-1">
                    <Clock size={10} className="text-slate-400" /> {movie.duration}m
                  </span>
                </>
              )}
              {movie.language && (
                <>
                  <span className="w-1 h-1 bg-slate-500 rounded-full" />
                  <span className="uppercase tracking-wide text-primary-400">{movie.language}</span>
                </>
              )}
            </div>

            {/* More Important Data (Cast & Director) */}
            <div className="text-[10px] text-slate-300 mb-2.5 line-clamp-2 leading-tight">
               {movie.director && <><span className="text-slate-400 font-semibold">Dir:</span> {movie.director} &bull; </>}
               {movie.cast && movie.cast.length > 0 && <><span className="text-slate-400 font-semibold">Cast:</span> {movie.cast.join(', ')}</>}
            </div>

            {/* Genre Tags */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {genres.slice(0, 3).map((g, i) => (
                  <span key={i} className="px-2 py-0.5 bg-primary-500/10 text-primary-300 border border-primary-500/20 rounded-md text-[9px] uppercase tracking-wider font-bold">
                    {g.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </m.div>
      </Link>
    </>
  );
};

export default MovieCard;