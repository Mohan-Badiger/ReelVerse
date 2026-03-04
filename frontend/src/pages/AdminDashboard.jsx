import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Monitor, CalendarDays, Ticket, Plus, Trash2, Edit } from 'lucide-react';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('movies');
    const [movies, setMovies] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [shows, setShows] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [movRes, theRes, bookRes] = await Promise.all([
                api.get('/movies'),
                api.get('/theatres'),
                api.get('/bookings')
            ]);
            setMovies(movRes.data);
            setTheatres(theRes.data);
            setBookings(bookRes.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteMovie = async (id) => {
        if (window.confirm('Delete this movie?')) {
            try {
                await api.delete(`/movies/${id}`);
                toast.success('Movie deleted');
                fetchData();
            } catch (err) {
                toast.error('Failed to delete movie');
            }
        }
    };

    const tabs = [
        { id: 'dashboard', label: 'Overview', icon: <Monitor size={20} /> },
        { id: 'movies', label: 'Movies', icon: <Film size={20} /> },
        { id: 'theatres', label: 'Theatres', icon: <MapPinned size={20} /> },
        { id: 'shows', label: 'Shows', icon: <CalendarDays size={20} /> },
        { id: 'bookings', label: 'Bookings', icon: <Ticket size={20} /> },
    ];

    if (isLoading) return <div className="flex justify-center py-20"><div className="loader w-12 h-12 border-4 rounded-full"></div></div>;

    return (
        <div className="max-w-[1600px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
                <div className="glass bg-dark-800 rounded-2xl p-6 border border-white/5 sticky top-24">
                    <h2 className="text-xl font-bold text-white mb-6 px-2">Admin Panel</h2>
                    <div className="space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-4 py-3 rounded-xl transition ${activeTab === tab.id ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {tab.icon}
                                <span className="ml-3 font-semibold">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 glass bg-dark-800 rounded-2xl p-6 md:p-10 border border-white/5 min-h-[70vh]">

                {activeTab === 'dashboard' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Total Movies" value={movies.length} color="text-blue-500" />
                            <StatCard title="Total Theatres" value={theatres.length} color="text-green-500" />
                            <StatCard title="Total Bookings" value={bookings.length} color="text-brand-500" />
                            <StatCard title="Revenue" value={`$${bookings.reduce((acc, curr) => acc + curr.totalPrice, 0)}`} color="text-yellow-500" />
                        </div>
                        {/* Recent Bookings Table Preview */}
                        <div className="mt-12">
                            <h3 className="text-xl font-bold text-white mb-4">Recent Bookings</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-gray-300">
                                    <thead className="text-xs uppercase bg-white/5 text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3 rounded-tl-lg">ID</th>
                                            <th className="px-6 py-3">User</th>
                                            <th className="px-6 py-3">Movie</th>
                                            <th className="px-6 py-3">Amount</th>
                                            <th className="px-6 py-3 rounded-tr-lg">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.slice(0, 5).map(b => (
                                            <tr key={b._id} className="border-b border-white/5 hover:bg-white/5 transition">
                                                <td className="px-6 py-4 font-mono text-xs">{b._id.slice(-8)}</td>
                                                <td className="px-6 py-4">{b.user.name}</td>
                                                <td className="px-6 py-4">{b.show.movie.title}</td>
                                                <td className="px-6 py-4">${b.totalPrice}</td>
                                                <td className="px-6 py-4 text-green-400">{b.paymentStatus}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'movies' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Manage Movies</h2>
                            <button className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg flex items-center font-semibold transition">
                                <Plus size={18} className="mr-2" /> Add Movie
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {movies.map(movie => (
                                <div key={movie._id} className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden group">
                                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition" />
                                    <div className="p-4 relative">
                                        <h3 className="font-bold text-white truncate">{movie.title}</h3>
                                        <p className="text-sm text-gray-400">{movie.duration} min | {movie.language}</p>
                                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                                            <button className="p-1.5 bg-blue-500 rounded text-white hover:bg-blue-600"><Edit size={14} /></button>
                                            <button onClick={() => handleDeleteMovie(movie._id)} className="p-1.5 bg-red-500 rounded text-white hover:bg-red-600"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ... Similar tabs for Theatres, Shows, Bookings */}
                {['theatres', 'shows', 'bookings'].includes(activeTab) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20 text-gray-400">
                        <Monitor size={64} className="mb-4 opacity-50" />
                        <h2 className="text-2xl font-bold text-white mb-2 capitalize">{activeTab} Management</h2>
                        <p>This module is available via the API and ready for UI expansion.</p>
                    </motion.div>
                )}

            </div>
        </div>
    );
};

const StatCard = ({ title, value, color }) => (
    <div className="bg-dark-900 border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center">
        <h3 className="text-gray-400 text-sm tracking-widest uppercase mb-2">{title}</h3>
        <p className={`text-4xl font-black ${color}`}>{value}</p>
    </div>
);

// Fallback icon for MapPinned if lucide doesn't have it imported in this file directly
const MapPinned = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 8c0 3.613-3.869 7.42-5.393 8.79a1.5 1.5 0 0 1-2.214 0C8.87 15.42 5 11.613 5 8a7 7 0 0 1 14 0Z"></path>
        <circle cx="12" cy="8" r="2.5"></circle>
    </svg>
);

export default AdminDashboard;
