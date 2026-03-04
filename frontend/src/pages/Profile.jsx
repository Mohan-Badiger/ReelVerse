import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Ticket, User, Settings, Calendar, MapPin, CreditCard, Download, Clock, CheckCircle2 } from 'lucide-react';
import api from '../utils/axios';
import { setCredentials } from '../store/slices/authSlice';

const Profile = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState('bookings');
    const [name, setName] = useState(userInfo?.name || '');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);

    useEffect(() => {
        if (activeTab === 'bookings') {
            const fetchBookings = async () => {
                try {
                    const res = await api.get('/bookings/mybookings');
                    setBookings(res.data);
                } catch (error) {
                    toast.error('Failed to fetch bookings');
                } finally {
                    setLoadingBookings(false);
                }
            };
            fetchBookings();
        }
    }, [activeTab]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = { name };
            if (password) payload.password = password;
            const res = await api.put('/users/profile', payload);
            dispatch(setCredentials(res.data));
            toast.success('Profile updated successfully');
            setPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'paid':
                return (
                    <span className="flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-sm border border-emerald-500/20">
                        <CheckCircle2 size={14} className="mr-1.5" /> Confirmed
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-sm border border-amber-500/20">
                        <Clock size={14} className="mr-1.5" /> Pending
                    </span>
                );
            default:
                return (
                    <span className="flex items-center px-3 py-1 bg-slate-500/10 text-slate-400 text-xs font-bold rounded-sm border border-slate-500/20">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12 min-h-[80vh] fade-in">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Sidebar */}
                <div className="w-full lg:w-1/4 flex flex-col gap-6">
                    <div className="box-panel p-6 flex flex-col items-center text-center">
                        <div className="w-24 h-24 mb-4 rounded-sm bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-3xl font-black text-primary-400 shadow-sm shadow-primary-500/10 relative overflow-hidden">
                            {userInfo?.name?.charAt(0).toUpperCase()}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary-500/20 to-transparent"></div>
                        </div>
                        <h2 className="text-xl font-black text-white">{userInfo?.name}</h2>
                        <p className="text-sm text-slate-400 font-medium">{userInfo?.email}</p>
                    </div>

                    <div className="box-panel overflow-hidden p-2 flex lg:flex-col gap-1 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`flex items-center px-4 py-4 rounded-sm transition-all whitespace-nowrap font-medium text-sm
                                ${activeTab === 'bookings'
                                    ? 'bg-primary-500/10 text-primary-400'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Ticket size={20} className="mr-3" /> My Bookings
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center px-4 py-4 rounded-sm transition-all whitespace-nowrap font-medium text-sm
                                ${activeTab === 'settings'
                                    ? 'bg-primary-500/10 text-primary-400'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Settings size={20} className="mr-3" /> Account Settings
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="w-full lg:w-3/4">
                    <AnimatePresence mode="wait">
                        {activeTab === 'bookings' ? (
                            <motion.div
                                key="bookings"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-3xl font-black text-white">Your Bookings</h2>
                                </div>

                                {loadingBookings ? (
                                    <div className="flex justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-base-800 border-t-primary-500 rounded-sm animate-spin"></div>
                                    </div>
                                ) : bookings.length === 0 ? (
                                    <div className="box-panel p-16 flex flex-col items-center justify-center text-center">
                                        <div className="w-24 h-24 bg-white/5 rounded-sm flex items-center justify-center mb-6">
                                            <Ticket size={40} className="text-slate-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">No bookings yet</h3>
                                        <p className="text-slate-400 max-w-sm mb-8">When you book tickets for your favorite movies, they will appear here.</p>
                                        <button onClick={() => window.location.href = '/movies'} className="px-8 py-3 bg-white text-base-950 font-bold rounded-sm hover:bg-slate-200 transition-colors">
                                            Browse Movies
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {bookings.map((booking) => (
                                            <div key={booking._id} className="box-card overflow-hidden group">
                                                <div className="flex flex-col sm:flex-row gap-0 sm:gap-6">
                                                    {/* Poster */}
                                                    <div className="w-full sm:w-40 shrink-0">
                                                        <img
                                                            src={booking.show.movie.posterUrl}
                                                            alt={booking.show.movie.title}
                                                            className="w-full h-48 sm:h-full object-cover rounded-sm"
                                                        />
                                                    </div>

                                                    {/* Details */}
                                                    <div className="p-6 sm:p-6 sm:pl-0 flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex border-b border-base-800 pb-4 mb-4 justify-between items-start">
                                                                <div>
                                                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{booking.show.movie.title}</h3>
                                                                    <div className="flex items-center text-slate-400 text-sm">
                                                                        <MapPin size={14} className="mr-1.5" />
                                                                        <span>{booking.show.theatre.name}, {booking.show.theatre.city}</span>
                                                                    </div>
                                                                </div>
                                                                {getStatusBadge(booking.paymentStatus)}
                                                            </div>

                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                                <div>
                                                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center"><Calendar size={12} className="mr-1" /> Date & Time</p>
                                                                    <p className="text-white font-medium text-sm">{new Date(booking.show.date).toLocaleDateString()} &bull; {booking.show.time}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center"><Ticket size={12} className="mr-1" /> Seats</p>
                                                                    <p className="text-white font-medium text-sm">{booking.seatsBooked.join(', ')}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center"><CreditCard size={12} className="mr-1" /> Amount</p>
                                                                    <p className="text-primary-400 font-bold text-sm">${booking.totalPrice}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Booking ID</p>
                                                                    <p className="text-slate-300 font-mono text-xs mt-0.5 tracking-wider bg-white/5 px-2 py-0.5 rounded truncate inline-block max-w-full" title={booking._id}>{booking._id.slice(-8).toUpperCase()}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex justify-end gap-3 pt-4 border-t border-base-800">
                                                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-sm text-sm font-semibold transition-colors flex items-center group-hover:bg-white/10">
                                                                <Download size={16} className="mr-2 text-slate-400" /> Download Ticket
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="box-panel p-8 md:p-12"
                            >
                                <div className="mb-8">
                                    <h2 className="text-3xl font-black text-white mb-2">Account Settings</h2>
                                    <p className="text-slate-400">Update your personal details here.</p>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-6">
                                    <div>
                                        <label className="block text-slate-400 text-sm font-bold mb-2">Display Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="box-input w-full pl-12 h-14"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 text-sm font-bold mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={userInfo?.email}
                                            disabled
                                            className="box-input w-full h-14 opacity-50 cursor-not-allowed bg-base-950 border-base-800"
                                        />
                                        <p className="text-xs text-slate-500 mt-2 font-medium">To change your email address, please contact support.</p>
                                    </div>

                                    <div className="pt-4 border-t border-base-800">
                                        <label className="block text-slate-400 text-sm font-bold mb-2">New Password <span className="font-normal text-slate-500">(Optional)</span></label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Leave blank to keep current password"
                                            className="box-input w-full h-14"
                                            minLength={8}
                                        />
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full sm:w-auto px-8 h-14 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-sm transition-all disabled:opacity-50 active:scale-95 shadow-sm shadow-primary-500/20"
                                        >
                                            {isLoading ? 'Saving Changes...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Profile;
