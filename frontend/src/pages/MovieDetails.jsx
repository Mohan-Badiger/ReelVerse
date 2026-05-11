import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { m } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Clock from 'lucide-react/dist/esm/icons/clock';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Ticket from 'lucide-react/dist/esm/icons/ticket';
import Star from 'lucide-react/dist/esm/icons/star';
import StarHalf from 'lucide-react/dist/esm/icons/star-half';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import Play from 'lucide-react/dist/esm/icons/play';
import Film from 'lucide-react/dist/esm/icons/film';
import Heart from 'lucide-react/dist/esm/icons/heart';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Bell from 'lucide-react/dist/esm/icons/bell';
import toast from 'react-hot-toast';
import api from '../utils/axios';
import TrailerModal from '../components/movies/TrailerModal';
import MovieDetailsSkeleton from '../components/common/MovieDetailsSkeleton';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showTrailer, setShowTrailer] = useState(false);

    // Auth & Review form state
    const { userInfo } = useSelector((state) => state.auth);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    
    const [isWatchlisted, setIsWatchlisted] = useState(false);
    const [isReminding, setIsReminding] = useState(false);
    const [hasReminder, setHasReminder] = useState(false);

    // Group shows by date then theatre
    const [selectedDate, setSelectedDate] = useState('');
    const [groupedShows, setGroupedShows] = useState({});

    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                const [movieRes, showsRes, reviewsRes] = await Promise.all([
                    api.get(`/movies/${id}`),
                    api.get(`/showtimes/movie/${id}`),
                    api.get(`/reviews/${id}`)
                ]);

                setMovie(movieRes.data);
                setReviews(reviewsRes.data);
                
                if (userInfo && userInfo.watchlist && userInfo.watchlist.includes(id)) {
                    setIsWatchlisted(true);
                }

                // Group logic: Date -> Theatre ID -> Showtimes
                const rawShows = showsRes.data;
                const groups = {}; // { date: { theatreId: { theatreInfo, shows: [] } } }

                rawShows.forEach(show => {
                    const dateStr = new Date(show.date).toDateString();
                    if (!groups[dateStr]) groups[dateStr] = {};

                    const theatreId = show.theatre._id;
                    if (!groups[dateStr][theatreId]) {
                        groups[dateStr][theatreId] = {
                            theatre: show.theatre,
                            shows: []
                        };
                    }
                    groups[dateStr][theatreId].shows.push(show);
                });

                setGroupedShows(groups);
                if (Object.keys(groups).length > 0) {
                    setSelectedDate(Object.keys(groups)[0]);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovieData();
    }, [id]);

    const submitReview = async (e) => {
        e.preventDefault();
        if (!rating || !comment.trim()) {
            return toast.error('Please provide a rating and a comment');
        }
        setIsSubmittingReview(true);
        try {
            await api.post(`/reviews/${id}`, { rating, comment }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            toast.success('Review added successfully!');
            setComment('');
            setRating(5);
            // Refresh reviews
            const revRes = await api.get(`/reviews/${id}`);
            setReviews(revRes.data);

            // Optionally refresh movie for updated average rating
            const movRes = await api.get(`/movies/${id}`);
            setMovie(movRes.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleEnhanceReview = async () => {
        if (!comment.trim()) {
            return toast.error("Write a draft first to enhance it!");
        }
        
        setIsEnhancing(true);
        try {
            const res = await api.post('/reviews/enhance', { draftText: comment }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            setComment(res.data.enhancedText);
            toast.success('Review enhanced with AI ✨');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to enhance review');
        } finally {
            setIsEnhancing(false);
        }
    };

    const toggleWatchlist = async () => {
        if (!userInfo) {
            return toast.error('Please log in to add to watchlist');
        }
        
        // Optimistic UI update
        const previousState = isWatchlisted;
        setIsWatchlisted(!previousState);
        
        try {
            if (previousState) {
                await api.delete(`/users/watchlist/${id}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                toast.success('Removed from watchlist');
            } else {
                await api.post(`/users/watchlist/${id}`, {}, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                toast.success('Added to watchlist');
            }
        } catch (error) {
            // Revert state on failure
            setIsWatchlisted(previousState);
            toast.error('Failed to update watchlist');
        }
    };

    const handleRemindMe = async () => {
        if (!userInfo) {
            toast.error('Please login to set a reminder');
            return;
        }

        setIsReminding(true);
        try {
            const res = await api.post(`/movies/${id}/remind`);
            toast.success(res.data.message || 'Reminder updated successfully');
            if (res.data.action === 'removed') {
                setHasReminder(false);
            } else {
                setHasReminder(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update reminder');
        } finally {
            setIsReminding(false);
        }
    };

    if (isLoading) return <MovieDetailsSkeleton />;
    if (!movie) return <div className="text-center text-slate-400 mt-20">Movie not found</div>;

    const getOptimizedUrl = (url, width = '1200') => {
        if (!url) return '';
        if (url.includes('cloudinary')) {
            return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
        }
        return url;
    };

    const backdropUrl = getOptimizedUrl(movie.backdropUrl || movie.posterUrl);

    return (
        <main className="max-w-[1200px] mx-auto px-6 py-12 fade-in">
            <Helmet>
                <title>{`${movie.title} | ReelVerse - Book Tickets Now`}</title>
                <meta name="description" content={`Book tickets for ${movie.title}. Directed by ${movie.director}. ${movie.description.substring(0, 150)}...`} />
                <meta property="og:title" content={`${movie.title} | ReelVerse`} />
                <meta property="og:description" content={movie.description.substring(0, 160)} />
                <meta property="og:image" content={movie.posterUrl} />
                {backdropUrl && <link rel="preload" as="image" href={backdropUrl} fetchPriority="high" />}
            </Helmet>
            {/* Movie Header Card */}
            <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="box-panel flex flex-col md:flex-row gap-8 p-8 mb-16 relative overflow-hidden"
            >
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <img 
                        src={backdropUrl} 
                        alt="bg" 
                        className="w-full h-full object-cover blur-3xl opacity-50" 
                        fetchPriority="high"
                    />
                    <div className="absolute inset-0 bg-base-900/90"></div>
                </div>

                <div className="relative z-10 mx-auto md:mx-0">
                    <img
                        src={movie.posterUrl.includes('cloudinary') ? movie.posterUrl.replace('/upload/', '/upload/f_auto,q_auto,w_500/') : movie.posterUrl}
                        alt={movie.title}
                        width="320"
                        height="480"
                        className="w-full md:w-80 h-auto rounded-sm shadow-sm object-cover border border-base-800"
                    />
                    {movie.isUpcoming && (
                        <div className="absolute top-4 left-4 bg-primary-600 px-3 py-1 rounded-sm text-xs font-black text-white border border-primary-500 uppercase tracking-tighter shadow-lg shadow-black/50">
                            Coming Soon
                        </div>
                    )}
                </div>

                <div className="z-10 flex-1 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {movie.genre && Array.isArray(movie.genre) && movie.genre.map((g, i) => (
                            <span key={i} className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-sm text-xs font-semibold tracking-wider text-primary-400 border border-base-800 uppercase">
                                {g}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">{movie.title}</h1>
                    <div className="flex items-center gap-5 mb-8 flex-wrap">
                        {movie.isUpcoming ? (
                            <div className="bg-primary-600 px-4 py-1.5 rounded-sm text-sm font-black text-white border border-primary-500 uppercase tracking-wider shadow-sm">
                                Coming Soon
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-yellow-500">
                                <Star fill="currentColor" size={22} />
                                <span className="text-2xl font-black text-white">
                                    {movie.rating > 0 ? movie.rating.toFixed(1) : 'NR'}
                                </span>
                                <span className="text-sm text-slate-400">/ 5</span>
                            </div>
                        )}

                        {movie.trailerUrl && (
                            <button
                                onClick={() => setShowTrailer(true)}
                                className="group flex items-center gap-2 bg-primary-600/20 hover:bg-primary-500/40 text-primary-100 hover:text-white px-5 py-2.5 rounded-md text-sm font-bold border border-primary-500/30 hover:border-primary-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 backdrop-blur-md hover:-translate-y-0.5"
                            >
                                <Play size={16} fill="currentColor" className="transition-transform duration-300 group-hover:scale-110" />
                                Watch Trailer
                            </button>
                        )}
                        
                        <button
                            onClick={toggleWatchlist}
                            className={`flex items-center justify-center p-2.5 rounded-md border transition-all duration-300 active:scale-90 ${isWatchlisted ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' : 'bg-white/5 border-base-800 text-slate-300 hover:text-white hover:border-white/30 backdrop-blur-md'}`}
                            title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                            <Heart size={22} fill={isWatchlisted ? 'currentColor' : 'none'} className={isWatchlisted ? 'animate-pulse' : ''} />
                        </button>

                    </div>

                    <p className="text-slate-300 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">{movie.description}</p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-4 text-sm md:text-base border-t border-base-800 pt-8">
                        <div>
                            <p className="text-slate-500 uppercase tracking-widest text-xs mb-1">Director</p>
                            <p className="font-semibold text-white">{movie.director}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 uppercase tracking-widest text-xs mb-1">Duration</p>
                            <p className="font-semibold text-white">{movie.duration} min</p>
                        </div>
                        <div>
                            <p className="text-slate-500 uppercase tracking-widest text-xs mb-1">Language</p>
                            <p className="font-semibold text-white">{movie.language}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 uppercase tracking-widest text-xs mb-1">Release</p>
                            <p className="font-semibold text-white">
                                {movie.isUpcoming
                                    ? new Date(movie.releaseDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
                                    : new Date(movie.releaseDate).getFullYear()
                                }
                            </p>
                        </div>
                    </div>

                    {movie.isUpcoming && (
                        <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-base-800">
                            {movie.trailerUrl && (
                                <button
                                    onClick={() => setShowTrailer(true)}
                                    className="group px-8 py-3 bg-white text-base-950 font-black rounded-sm flex items-center justify-center gap-2 hover:bg-primary-50 hover:text-primary-600 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-300 uppercase tracking-wider text-sm hover:-translate-y-0.5"
                                >
                                    <Play size={18} fill="currentColor" className="transition-transform duration-300 group-hover:scale-110" />
                                    Watch Trailer
                                </button>
                            )}
                            <button
                                onClick={handleRemindMe}
                                disabled={isReminding}
                                className={`px-8 py-3 font-black rounded-sm flex items-center justify-center gap-2 transition-all border uppercase tracking-wider text-sm ${hasReminder ? 'bg-primary-600/20 text-primary-400 border-primary-500/30 hover:bg-primary-600/30' : 'bg-base-800 text-white hover:bg-base-700 border-base-700'}`}
                            >
                                <Bell size={18} fill={hasReminder ? 'currentColor' : 'none'} className={isReminding ? 'animate-pulse' : ''} />
                                {isReminding ? 'Please wait...' : hasReminder ? 'Remove Reminder' : 'Remind Me'}
                            </button>
                        </div>
                    )}
                </div>
            </m.div>

            {/* Showtimes Section */}
            {!movie.isUpcoming && (
                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <Ticket className="text-primary-500 mr-3" size={28} />
                        Select a Showtime
                    </h2>

                    {Object.keys(groupedShows).length === 0 ? (
                        <div className="box-panel p-8 text-center text-slate-400 border-dashed bg-transparent shadow-none">
                            No shows scheduled for this movie yet.
                        </div>
                    ) : (
                        <div className="space-y-8 box-panel p-8 bg-base-900 border-base-800 shadow-sm">
                            {/* Date Selector */}
                            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide border-b border-base-800">
                                {Object.keys(groupedShows).map((date) => (
                                    <button
                                        key={date}
                                        onClick={() => setSelectedDate(date)}
                                        className={`flex flex-col items-center min-w-[100px] px-6 py-4 rounded-sm transition-all border ${selectedDate === date
                                            ? 'bg-primary-600 text-white border-primary-500 shadow-sm shadow-primary-500/20'
                                            : 'bg-base-800 text-slate-400 hover:text-white border-base-800 hover:border-base-800'
                                            }`}
                                    >
                                        <span className="text-xs font-semibold uppercase tracking-wider">{date.split(' ')[0]}</span>
                                        <span className="text-2xl font-black my-1">{date.split(' ')[2]}</span>
                                        <span className="text-xs">{date.split(' ')[1]}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Theatre & Showtime List */}
                            <div className="space-y-6 pt-4">
                                {groupedShows[selectedDate] && Object.values(groupedShows[selectedDate]).map(({ theatre, shows }) => (
                                    <div key={theatre._id} className="bg-base-950 p-6 md:p-8 rounded-sm border border-base-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-base-800 transition-all">
                                        <div>
                                            <h3 className="text-xl font-bold text-white flex items-center">
                                                {theatre.name}
                                            </h3>
                                            <p className="text-slate-400 text-sm mt-1 flex items-center">
                                                <MapPin size={14} className="mr-1" /> {theatre.location || 'Location not available'}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {theatre.facilities?.map((f, i) => (
                                                    <span key={i} className="text-xs px-2.5 py-1 bg-white/5 rounded-sm text-slate-300 border border-base-800">
                                                        {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4">
                                            {shows.map((show) => (
                                                <button
                                                    key={show._id}
                                                    onClick={() => navigate(`/checkout/${show._id}`)}
                                                    className="px-6 py-3 bg-white/5 hover:bg-white text-white hover:text-base-950 border border-base-800 hover:border-white rounded-sm transition-all font-bold flex flex-col items-center min-w-[120px]"
                                                >
                                                    <span className="text-lg">{show.time}</span>
                                                    <span className="text-xs font-medium opacity-70">₹{show.ticketPrice}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </m.div>
            )}

            {/* Reviews Section */}
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-16 box-panel p-8 bg-base-950/30">
                <div className="flex justify-between items-center border-b border-base-800 pb-4 mb-8">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <MessageSquare className="text-primary-500 mr-3" size={28} />
                        Movie Reviews
                    </h2>
                </div>

                {/* AI Vibe Summary (If available) */}
                {(movie.vibeTags?.length > 0 || movie.aiSummary) && (
                    <div className="mb-10 bg-linear-to-r from-primary-900/20 to-accent-900/10 border border-primary-500/20 p-6 rounded-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={64} />
                        </div>
                        <div className="flex items-center gap-2 mb-3 text-primary-400 font-bold text-sm tracking-widest uppercase">
                            <Sparkles size={16} />
                            AI Vibe Analysis
                        </div>
                        
                        {movie.vibeTags?.length > 0 && (
                            <div className="flex flex-wrap gap-3 mb-4">
                                {movie.vibeTags.map((tag, idx) => (
                                    <span key={idx} className="bg-white/10 text-white px-4 py-1.5 rounded-full text-sm font-medium border border-white/10 backdrop-blur-sm shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        {movie.aiSummary && (
                            <p className="text-slate-300 text-base leading-relaxed max-w-3xl font-medium italic">
                                "{movie.aiSummary}"
                            </p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Review List */}
                    <div className="lg:col-span-2 space-y-6">
                        {reviews.length === 0 ? (
                            <p className="text-slate-400">No reviews yet. Be the first to review this movie!</p>
                        ) : (
                            reviews.map(review => (
                                <div key={review._id} className="bg-base-900 border border-base-800 p-6 rounded-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{review.user?.name || 'Anonymous'}</h4>
                                            <p className="text-xs text-slate-500 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-base-800'} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed text-sm">{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Write Review Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-base-900 border border-base-800 p-6 rounded-sm sticky top-24">
                            <h3 className="text-xl font-bold text-white mb-6">Write a Review</h3>

                            {!userInfo ? (
                                <div className="text-center py-6 bg-base-950 rounded border border-base-800">
                                    <p className="text-slate-400 text-sm mb-4">Please log in to write a review.</p>
                                </div>
                            ) : (
                                <form onSubmit={submitReview} className="space-y-6">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setRating(num)}
                                                    className="focus:outline-none"
                                                >
                                                    <Star
                                                        size={28}
                                                        fill={num <= rating ? '#eab308' : 'none'}
                                                        color={num <= rating ? '#eab308' : '#334155'}
                                                        className="transition-colors"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm text-slate-400 mb-2">Your Review</label>
                                        <textarea
                                            className="w-full bg-base-950 border border-base-800 text-white p-3 rounded-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors placeholder:text-slate-600 resize-none h-32 text-sm"
                                            placeholder="What did you think of the movie?"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                        ></textarea>
                                        
                                        <button
                                            type="button"
                                            onClick={handleEnhanceReview}
                                            disabled={isEnhancing || !comment.trim()}
                                            className="absolute bottom-3 right-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white px-3 py-1.5 rounded-sm text-xs font-bold border border-indigo-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                        >
                                            <Sparkles size={14} />
                                            {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmittingReview}
                                        className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-sm transition-colors disabled:opacity-50"
                                    >
                                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                    <p className="text-xs text-slate-500 mt-4 text-center">Note: You can only review movies you have successfully booked.</p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </m.div>

            {/* Trailer Modal */}
            <TrailerModal
                isOpen={showTrailer}
                onClose={() => setShowTrailer(false)}
                trailerUrl={movie.trailerUrl}
                movieTitle={movie.title}
            />
        </main>
    );
};

export default MovieDetails;
