import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Ticket from 'lucide-react/dist/esm/icons/ticket';
import User from 'lucide-react/dist/esm/icons/user';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Download from 'lucide-react/dist/esm/icons/download';
import Clock from 'lucide-react/dist/esm/icons/clock';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Lock from 'lucide-react/dist/esm/icons/lock';
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
                    console.error('Failed to fetch bookings:', error);
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
                    <span className="flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-sm border border-emerald-500/20">
                        <CheckCircle2 size={14} className="mr-1.5" /> Confirmed
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-sm border border-amber-500/20">
                        <Clock size={14} className="mr-1.5" /> Pending
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 text-xs text-slate-400 bg-slate-500/10 rounded-sm border border-slate-500/20">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[80vh]">

            <div className="grid lg:grid-cols-4 gap-8">

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Profile Card */}
                    <div className="box-panel p-6 flex flex-col items-center text-center">

                        <div className="w-24 h-24 mb-4 rounded-sm bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-3xl font-bold text-primary-400">
                            {userInfo?.name?.charAt(0).toUpperCase()}
                        </div>

                        <h2 className="text-xl font-bold text-white">{userInfo?.name}</h2>
                        <p className="text-sm text-slate-400">{userInfo?.email}</p>

                    </div>

                    {/* Navigation */}
                    <div className="box-panel p-2 flex lg:flex-col gap-2 overflow-x-auto">

                        <button
                            onClick={() => setActiveTab('bookings')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition
                                ${activeTab === 'bookings'
                                    ? 'bg-primary-500/10 text-primary-400'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                            `}
                        >
                            <Ticket size={18} />
                            My Bookings
                        </button>

                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition
                                ${activeTab === 'settings'
                                    ? 'bg-primary-500/10 text-primary-400'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                            `}
                        >
                            <Settings size={18} />
                            Account Settings
                        </button>

                    </div>

                </div>


                {/* Main Content */}
                <div className="lg:col-span-3">

                    <AnimatePresence mode="wait">

                        {/* BOOKINGS TAB */}
                        {activeTab === 'bookings' ? (

                            <motion.div
                                key="bookings"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >

                                <h2 className="text-3xl font-bold text-white mb-6">
                                    Your Bookings
                                </h2>

                                {loadingBookings ? (

                                    <div className="flex justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-base-800 border-t-primary-500 rounded-sm animate-spin"></div>
                                    </div>

                                ) : bookings.length === 0 ? (

                                    <div className="box-panel p-16 flex flex-col items-center text-center">

                                        <div className="w-20 h-20 bg-white/5 rounded-sm flex items-center justify-center mb-6">
                                            <Ticket size={36} className="text-slate-500" />
                                        </div>

                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            No bookings yet
                                        </h3>

                                        <p className="text-slate-400 mb-6">
                                            When you book tickets for your favorite movies, they will appear here.
                                        </p>

                                        <button
                                            onClick={() => window.location.href = '/movies'}
                                            className="px-6 py-3 bg-white text-black font-semibold rounded-sm hover:bg-slate-200 transition"
                                        >
                                            Browse Movies
                                        </button>

                                    </div>

                                ) : (

                                    <div className="space-y-6">

                                        {bookings.map((booking) => (

                                            <div
                                                key={booking._id}
                                                className="box-card flex flex-col md:flex-row overflow-hidden"
                                            >

                                                {/* Poster */}
                                                <div className="md:w-40 shrink-0 bg-base-800">
                                                    <img
                                                        src={booking.show?.movie?.posterUrl || 'https://via.placeholder.com/300x450?text=Details+Unavailable'}
                                                        alt={booking.show?.movie?.title || 'Show Unavailable'}
                                                        className="w-full h-48 md:h-full object-cover"
                                                    />
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 p-6 flex flex-col justify-between">

                                                    <div>

                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-base-800 pb-4 mb-4 gap-3">

                                                            <div>
                                                                <h3 className="text-xl font-bold text-white">
                                                                    {booking.show?.movie?.title || 'Show Details Unavailable'}
                                                                </h3>

                                                                <p className="flex items-center text-sm text-slate-400 mt-1">
                                                                    <MapPin size={14} className="mr-1" />
                                                                    {booking.show?.theatre?.name ? `${booking.show.theatre.name}, ${booking.show.theatre.city}` : 'Theatre details archived'}
                                                                </p>
                                                            </div>

                                                            {getStatusBadge(booking.paymentStatus)}

                                                        </div>

                                                        {/* Booking Info */}
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                                                            <div>
                                                                <p className="text-xs text-slate-500 mb-1 flex items-center">
                                                                    <Calendar size={12} className="mr-1" />
                                                                    Date & Time
                                                                </p>

                                                                <p className="text-white text-sm">
                                                                    {booking.show ? `${new Date(booking.show.date).toLocaleDateString()} • ${booking.show.time}` : 'Date details archived'}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs text-slate-500 mb-1 flex items-center">
                                                                    <Ticket size={12} className="mr-1" />
                                                                    Seats
                                                                </p>

                                                                <p className="text-white text-sm">
                                                                    {booking.seatsBooked.join(', ')}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs text-slate-500 mb-1 flex items-center">
                                                                    <CreditCard size={12} className="mr-1" />
                                                                    Amount
                                                                </p>

                                                                <p className="text-primary-400 font-semibold text-sm">
                                                                    ${booking.totalPrice}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs text-slate-500 mb-1">
                                                                    Booking ID
                                                                </p>

                                                                <p className="text-xs font-mono bg-white/5 px-2 py-1 rounded-sm text-slate-300">
                                                                    {booking._id.slice(-8).toUpperCase()}
                                                                </p>
                                                            </div>

                                                        </div>

                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex justify-end pt-6">

                                                        <button 
                                                            onClick={() => window.location.href = `/booking/success?bookingId=${booking._id}`}
                                                            className="flex items-center gap-2 px-4 py-2 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 text-sm font-semibold rounded-sm transition border border-primary-500/20"
                                                        >
                                                            <Ticket size={16} />
                                                            View & Download Ticket
                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </motion.div>

                        ) : (

                            /* SETTINGS TAB */

                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="box-panel p-8 md:p-10"
                            >

                                <h2 className="text-3xl font-bold text-white mb-2">
                                    Account Settings
                                </h2>

                                <p className="text-slate-400 mb-8">
                                    Update your personal details here.
                                </p>

                                <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-6">

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">
                                            Display Name
                                        </label>

                                        <div className="relative flex items-center">
                                            {/* <User
                                                className="absolute left-3 text-slate-500 pointer-events-none"
                                                size={18}
                                            /> */}

                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="box-input w-full pl-10 pr-3 py-3 h-12 leading-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">
                                            Email Address
                                        </label>

                                        <div className="relative">
                                            {/* <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /> */}
                                            <input
                                                type="email"
                                                value={userInfo?.email}
                                                disabled
                                                className="box-input w-full pl-12 h-12 opacity-60 cursor-not-allowed"
                                            />
                                        </div>

                                        <p className="text-xs text-slate-500 mt-2">
                                            To change your email address, please contact support.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">
                                            New Password
                                        </label>

                                        <div className="relative">
                                            {/* <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /> */}
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Leave blank to keep current password"
                                                className="box-input w-full pl-12 h-12"
                                                minLength={8}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-sm transition disabled:opacity-50"
                                    >
                                        {isLoading ? 'Saving Changes...' : 'Save Changes'}
                                    </button>

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