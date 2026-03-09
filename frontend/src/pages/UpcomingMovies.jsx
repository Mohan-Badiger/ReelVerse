import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Film } from "lucide-react";
import api from "../utils/axios";
import MovieCard from "../components/movies/MovieCard";

const UpcomingMovies = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-340px rounded-lg bg-base-800 animate-pulse"
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-14">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center gap-3">
            <Film size={36} className="text-primary-500" />
            Upcoming Movies
          </h1>

          <p className="text-slate-400 mt-3 max-w-xl">
            Discover the most anticipated movies coming soon to theaters.
            Watch trailers and stay updated with release dates.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 border border-base-800 rounded-lg bg-base-900">
          <AlertCircle size={48} className="text-slate-500 mb-5" />

          <h2 className="text-xl font-semibold text-white mb-2">
            No Upcoming Movies
          </h2>

          <p className="text-slate-400 max-w-md">
            We’re currently updating our movie catalog. Please check back later
            for exciting upcoming releases.
          </p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {movies.map((movie, idx) => (
            <motion.div
              key={movie._id}
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <MovieCard movie={movie} index={idx} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default UpcomingMovies;