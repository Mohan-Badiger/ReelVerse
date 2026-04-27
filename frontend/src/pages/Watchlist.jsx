import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Film, ArrowRight } from 'lucide-react';
import api from '../utils/axios';
import MovieCard from '../components/movies/MovieCard';
import SkeletonCard from '../components/common/SkeletonCard';

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchWatchlist = async () => {
            if (!userInfo) return;
            try {
                // The profile endpoint now populates the watchlist with full movie objects
                const res = await api.get('/users/profile', {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                setWatchlist(res.data.watchlist || []);
            } catch (error) {
                console.error("Failed to fetch watchlist:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWatchlist();
    }, [userInfo]);

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-base-800">
                <div className="w-12 h-12 rounded-sm bg-primary-500/10 flex items-center justify-center text-primary-500">
                    <Heart size={24} fill="currentColor" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">My Watchlist</h1>
                    <p className="text-slate-400 text-sm mt-1">Movies you've saved for later</p>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map(n => <SkeletonCard key={n} />)}
                </div>
            ) : watchlist.length > 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
                >
                    {watchlist.map(movie => (
                        <MovieCard key={movie._id} movie={movie} />
                    ))}
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center box-panel"
                >
                    <div className="w-20 h-20 bg-base-900 rounded-full flex items-center justify-center text-slate-500 mb-6">
                        <Film size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Your watchlist is empty</h2>
                    <p className="text-slate-400 max-w-md mb-8">
                        You haven't added any movies to your watchlist yet. Browse our collection and click the heart icon to save them here!
                    </p>
                    <Link 
                        to="/movies" 
                        className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-sm font-bold flex items-center gap-2 transition-all"
                    >
                        Browse Movies
                        <ArrowRight size={18} />
                    </Link>
                </motion.div>
            )}
        </div>
    );
};

export default Watchlist;
