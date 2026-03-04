import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, CheckCircle2, Ticket } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/bookings');
            setBookings(res.data);
        } catch (error) {
            toast.error('Failed to load bookings');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="space-y-8 fade-in h-full flex flex-col">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-base-50 mb-2">Bookings Ledger</h1>
                    <p className="text-base-400">Track and view all user ticket purchases.</p>
                </div>
                <button onClick={fetchBookings} className="box-button-secondary text-sm flex items-center gap-2">
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            <div className="box-panel flex-1 overflow-hidden flex flex-col">
                {isLoading ? (
                    <div className="w-full p-6 animate-pulse">
                        <div className="w-full h-10 bg-base-900 rounded-sm mb-4"></div>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-full h-16 bg-base-900 rounded-sm mb-2 opacity-50"></div>
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <Ticket className="w-12 h-12 text-base-600 mb-4" />
                        <h3 className="text-lg font-medium text-base-100 mb-1">No bookings found</h3>
                        <p className="text-base-400">Transactions will appear here when users book tickets.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-base-800/60 bg-base-900/30">
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Booking ID</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Customer</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Movie / Show</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider text-right">Amount</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-800/60">
                                {bookings.map((booking, index) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={booking._id}
                                        className="hover:bg-base-800/20 transition-colors"
                                    >
                                        <td className="py-4 px-6">
                                            <span className="font-mono text-sm text-base-300">
                                                #{booking._id.substring(booking._id.length - 8).toUpperCase()}
                                            </span>
                                            <div className="text-xs text-base-500 mt-1">
                                                {new Date(booking.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-base-50">{booking.user?.name || 'Unknown User'}</div>
                                            <div className="text-sm text-base-400">{booking.user?.email || 'N/A'}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-primary-300 line-clamp-1 max-w-[200px]">
                                                {booking.show?.movie?.title || 'Unknown Movie'}
                                            </div>
                                            <div className="text-sm text-base-400 flex items-center gap-2 mt-1">
                                                <span>{booking.seats?.length || 0} seats</span>
                                                <span className="w-1 h-1 rounded-sm bg-base-700"></span>
                                                <span>
                                                    {booking.show?.startTime ? new Date(booking.show.startTime).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right font-medium text-base-50">
                                            {formatCurrency(booking.totalPrice)}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {booking.status === 'confirmed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    <CheckCircle2 size={12} /> Confirmed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
export default AdminBookings;
