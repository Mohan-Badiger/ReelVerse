import { useState, useEffect } from "react";
import { m } from "framer-motion";
import { AlertCircle, Film, Calendar, Search, X } from "lucide-react";
import api from "../utils/axios";
import MovieCard from "../components/movies/MovieCard";
import SkeletonCard from "../components/common/SkeletonCard";

const UpcomingMovies = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get("/movies/upcoming");
        setMovies(res.data);
      } catch (error) {
        console.error("Failed to fetch upcoming movies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="relative overflow-hidden border-b border-base-800/50">
        <div className="absolute inset-0 bg-linear-to-br from-accent-500/8 via-transparent to-primary-600/5"></div>
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-accent-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-primary-500/5 blur-[100px] rounded-full"></div>

        <div className="relative max-w-[1400px] mx-auto px-6 pt-16 pb-10">
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent-500/15 border border-accent-500/20 flex items-center justify-center text-accent-500">
                  <Calendar size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-accent-500">Coming Soon</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                Upcoming Movies
              </h1>
              <p className="text-slate-400 text-base max-w-xl">
                Discover the most anticipated movies coming soon to theaters. Add them to your watchlist so you never miss a release.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search upcoming..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-base-900/80 backdrop-blur-md border border-base-800 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500/50 transition-all font-medium"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          </m.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <SkeletonCard key={i} />
              ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-base-900 border border-base-800 flex items-center justify-center text-slate-500 mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {searchTerm ? 'No results found' : 'No Upcoming Movies'}
            </h2>
            <p className="text-slate-400 max-w-md mb-6">
              {searchTerm
                ? `No upcoming movies match "${searchTerm}". Try a different search.`
                : "We're currently updating our movie catalog. Please check back later for exciting upcoming releases."
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-accent-500 hover:bg-accent-500/80 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all"
              >
                Clear Search
              </button>
            )}
          </m.div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-500">
                <span className="text-white font-semibold">{filteredMovies.length}</span> upcoming movie{filteredMovies.length !== 1 ? 's' : ''}
              </p>
            </div>

            <m.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.06 },
                },
              }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6"
            >
              {filteredMovies.map((movie, idx) => (
                <m.div
                  key={movie._id}
                  variants={{
                    hidden: { opacity: 0, y: 25 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <MovieCard movie={movie} index={idx} />
                </m.div>
              ))}
            </m.div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpcomingMovies;