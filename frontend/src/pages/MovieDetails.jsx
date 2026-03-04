import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import api from '../utils/axios';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Group shows by date
    const [selectedDate, setSelectedDate] = useState('');
    const [groupedShows, setGroupedShows] = useState({});

    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                const [movieRes, showsRes] = await Promise.all([
                    api.get(`/movies/${id}`),
                    api.get(`/shows/movie/${id}`)
                ]);

                setMovie(movieRes.data);

                // Group logic
                const rawShows = showsRes.data;
                const groups = {};
                rawShows.forEach(show => {
                    const dateStr = new Date(show.date).toDateString();
                    if (!groups[dateStr]) groups[dateStr] = [];
                    groups[dateStr].push(show);
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

    if (isLoading) return <div className="flex justify-center items-center h-[80vh]"><div className="w-10 h-10 border-4 border-white/10 border-t-primary-500 rounded-full animate-spin"></div></div>;
    if (!movie) return <div className="text-center text-slate-400 mt-20">Movie not found</div>;

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12 fade-in">
            {/* Movie Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="box-panel flex flex-col md:flex-row gap-8 p-8 mb-16 relative overflow-hidden"
            >
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <img src={movie.backdropUrl || movie.posterUrl} alt="bg" className="w-full h-full object-cover blur-3xl opacity-50" />
                    <div className="absolute inset-0 bg-base-900/90"></div>
                </div>

                <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full md:w-80 h-auto rounded-2xl shadow-xl z-10 mx-auto md:mx-0 object-cover border border-white/10"
                />

                <div className="z-10 flex-1 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {movie.genre.map((g, i) => (
                            <span key={i} className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-lg text-xs font-semibold tracking-wider text-primary-400 border border-white/10 uppercase">
                                {g}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">{movie.title}</h1>
                    <p className="text-slate-300 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">{movie.description}</p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-sm md:text-base border-t border-white/10 pt-8">
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
                            <p className="font-semibold text-white">{new Date(movie.releaseDate).getFullYear()}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Showtimes Section */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Ticket className="text-primary-500 mr-3" size={28} />
                    Select a Showtime
                </h2>

                {Object.keys(groupedShows).length === 0 ? (
                    <div className="box-panel p-8 text-center text-slate-400 border-dashed bg-transparent shadow-none">
                        No shows scheduled for this movie yet.
                    </div>
                ) : (
                    <div className="space-y-8 box-panel p-8 bg-base-900 border-white/10 shadow-lg">
                        {/* Date Selector */}
                        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide border-b border-white/10">
                            {Object.keys(groupedShows).map((date) => (
                                <button
                                    key={date}
                                    onClick={() => setSelectedDate(date)}
                                    className={`flex flex-col items-center min-w-[100px] px-6 py-4 rounded-xl transition-all border ${selectedDate === date
                                        ? 'bg-primary-600 text-white border-primary-500 shadow-lg shadow-primary-500/20'
                                        : 'bg-base-800 text-slate-400 hover:text-white border-white/5 hover:border-white/20'
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
                            {groupedShows[selectedDate]?.map((show) => (
                                <div key={show._id} className="bg-base-950 p-6 md:p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/10 transition-all">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center">
                                            {show.theatre.name}
                                        </h3>
                                        <p className="text-slate-400 text-sm mt-1 flex items-center">
                                            <MapPin size={14} className="mr-1" /> {show.theatre.address}, {show.theatre.city}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {show.theatre.facilities.map((f, i) => (
                                                <span key={i} className="text-xs px-2.5 py-1 bg-white/5 rounded-md text-slate-300 border border-white/10">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <button
                                            onClick={() => navigate(`/checkout/${show._id}`)}
                                            className="px-6 py-3 bg-white/5 hover:bg-white text-white hover:text-base-950 border border-white/10 hover:border-white rounded-xl transition-all font-bold flex flex-col items-center min-w-[120px]"
                                        >
                                            <span className="text-lg">{show.time}</span>
                                            <span className="text-xs font-medium opacity-70">${show.ticketPrice}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default MovieDetails;
