import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const { userInfo } = useSelector((state) => state.auth);

    const fetchBookings = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get('/api/bookings/mybookings', config);
            setBookings(data);
            setLoading(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch bookings');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;

        setCancellingId(bookingId);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.put(`/api/bookings/${bookingId}/cancel`, {}, config);
            toast.success('Booking cancelled successfully');
            fetchBookings(); // Refresh the list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary-500"></span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-white">My Bookings</h1>

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-base-900 rounded-lg">
                    <p className="text-xl text-gray-400 mb-4">You haven't booked any movies yet.</p>
                    <Link to="/movies" className="bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-600 transition-colors">
                        Browse Movies
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-base-900 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-lg border border-base-800">
                            {/* Movie Poster */}
                            <div className="w-full md:w-48 h-64 md:h-auto flex-shrink-0">
                                <img
                                    src={booking.show?.movie?.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
                                    alt={booking.show?.movie?.title || 'Movie'}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Booking Details */}
                            <div className="p-6 flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">
                                                {booking.show?.movie?.title || 'Unknown Movie'}
                                            </h2>
                                            <p className="text-gray-400">
                                                {booking.show?.theatre?.name}, {booking.show?.theatre?.city}
                                            </p>
                                        </div>
                                        <div>
                                            {booking.paymentStatus === 'Completed' ? (
                                                <span className="px-3 py-1 bg-green-500 text-green-900 text-xs font-bold rounded-full">CONFIRMED</span>
                                            ) : booking.paymentStatus === 'Cancelled' ? (
                                                <span className="px-3 py-1 bg-red-500 text-red-900 text-xs font-bold rounded-full">CANCELLED</span>
                                            ) : (
                                                <span className="px-3 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full">PENDING</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-gray-500 text-sm">Date & Time</p>
                                            <p className="text-white font-medium">
                                                {booking.show ? new Date(booking.show.date).toLocaleDateString() : 'N/A'} at {booking.show?.time || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">Seats</p>
                                            <p className="text-white font-medium">{booking.seatsBooked.join(', ')}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">Amount Paid</p>
                                            <p className="text-white font-medium">₹{booking.totalPrice}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">Booking ID</p>
                                            <p className="text-white font-mono text-xs mt-1">{booking._id}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="mt-4 pt-4 border-t border-base-800 flex justify-end gap-3 items-center">
                                    {booking.paymentStatus === 'Completed' && (
                                        <button
                                            onClick={() => handleCancelBooking(booking._id)}
                                            disabled={cancellingId === booking._id}
                                            className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                                        >
                                            {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* QR Code Section */}
                            {booking.qrCode && booking.paymentStatus === 'Completed' && (
                                <div className="w-full md:w-64 bg-base-950 p-6 flex flex-col items-center justify-center border-l border-base-800">
                                    <p className="text-gray-400 text-sm mb-4 text-center">Scan at theatre</p>
                                    <div className="bg-white p-2 rounded-lg">
                                        <img src={booking.qrCode} alt="Ticket QR Code" className="w-32 h-32" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;
