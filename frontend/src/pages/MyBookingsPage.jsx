import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming');
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
            console.error('Failed to fetch bookings:', error);
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
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancellingId(null);
        }
    };

    const handleDownloadPDF = async (booking) => {
        const ticketElement = document.getElementById(`ticket-${booking._id}`);
        if (!ticketElement || downloadingId) return;

        setDownloadingId(booking._id);

        try {
            const canvas = await html2canvas(ticketElement, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const elements = clonedDoc.getElementsByTagName('*');
                    for (let i = 0; i < elements.length; i++) {
                        const el = elements[i];
                        const style = clonedDoc.defaultView.getComputedStyle(el);
                        // html2canvas fails on oklab CSS functions which CSS variables in Tailwind v4 resolve to
                        if (style.backgroundImage.includes('oklab')) {
                            el.style.backgroundImage = 'none';
                        }
                        if (style.backgroundColor.includes('oklab')) {
                            el.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                        }
                        if (style.color.includes('oklab')) {
                            el.style.color = 'rgba(0, 0, 0, 1)';
                        }
                        if (style.borderColor.includes('oklab')) {
                            el.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                        }
                    }
                }
            });
            const imgData = canvas.toDataURL('image/png', 1.0);

            const pdfWidth = 16;
            const pdfHeight = 9;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'in',
                format: [pdfWidth, pdfHeight]
            });

            const imgRatio = canvas.width / canvas.height;
            const pdfRatio = pdfWidth / pdfHeight;
            let finalWidth = pdfWidth;
            let finalHeight = pdfHeight;
            let xOffset = 0;
            let yOffset = 0;

            if (imgRatio > pdfRatio) {
                finalHeight = finalWidth / imgRatio;
                yOffset = (pdfHeight - finalHeight) / 2;
            } else {
                finalWidth = finalHeight * imgRatio;
                xOffset = (pdfWidth - finalWidth) / 2;
            }

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
            pdf.save(`ReelVerse-Ticket-${booking._id.substring(0, 6)}.pdf`);
            toast.success('Ticket downloaded successfully!');
        } catch (error) {
            console.error('Failed to generate PDF', error);
            toast.error('Failed to generate ticket PDF');
        } finally {
            setDownloadingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary-500"></span>
            </div>
        );
    }

    const getBookingStatus = (b) => {
        if (b.status && b.status !== 'upcoming') return b.status;
        if (b.paymentStatus === 'Cancelled') return 'cancelled';
        
        let showDateTime = null;
        if (b.date && b.showtime) {
            showDateTime = new Date(`${new Date(b.date).toDateString()} ${b.showtime}`);
        } else if (b.show && b.show.date && b.show.time) {
            showDateTime = new Date(`${new Date(b.show.date).toDateString()} ${b.show.time}`);
        }
        
        if (showDateTime && new Date() > showDateTime) {
            return 'completed';
        }
        
        return b.status || 'upcoming';
    };

    const filteredBookings = bookings.filter(b => {
        const bStatus = getBookingStatus(b);
        return bStatus === activeTab;
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-white">My Bookings</h1>

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-base-900 rounded-lg">
                    <p className="text-xl text-gray-400 mb-4">You haven't booked any movies yet.</p>
                    <Link
                        to="/movies"
                        className="bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-600 transition-colors"
                    >
                        Browse Movies
                    </Link>
                </div>
            ) : (
                <>
                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 border-b border-base-800 pb-2">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`pb-2 px-4 transition-colors relative ${activeTab === 'upcoming' ? 'text-primary-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                            Upcoming
                            {activeTab === 'upcoming' && (
                                <span className="absolute bottom-[-11px] left-0 right-0 h-1 bg-primary-500 rounded-t-md"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`pb-2 px-4 transition-colors relative ${activeTab === 'completed' ? 'text-primary-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                            Completed
                            {activeTab === 'completed' && (
                                <span className="absolute bottom-[-11px] left-0 right-0 h-1 bg-primary-500 rounded-t-md"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('cancelled')}
                            className={`pb-2 px-4 transition-colors relative ${activeTab === 'cancelled' ? 'text-primary-500 font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                            Cancelled
                            {activeTab === 'cancelled' && (
                                <span className="absolute bottom-[-11px] left-0 right-0 h-1 bg-primary-500 rounded-t-md"></span>
                            )}
                        </button>
                    </div>

                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-12 bg-base-900 rounded-lg">
                            <p className="text-xl text-gray-400 mb-4">No {activeTab} bookings found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {filteredBookings.map((booking) => {
                                const bStatus = getBookingStatus(booking);

                                return (
                                    <div
                                        key={booking._id}
                                        className="bg-base-900 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-lg border border-base-800 min-h-[220px]"
                                    >
                                        {/* Movie Poster */}
                                        <div className="w-full md:w-[180px] shrink-0">
                                            <img
                                                src={
                                                    booking.moviePoster ||
                                                    booking.movie?.posterUrl ||
                                                    booking.show?.movie?.posterUrl ||
                                                    'https://via.placeholder.com/300x450?text=No+Poster'
                                                }
                                                alt={booking.movieName || booking.movie?.title || booking.show?.movie?.title || 'Movie'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Booking Details */}
                                        <div className="p-6 grow flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-white mb-1">
                                                            {booking.movieName || booking.movie?.title || booking.show?.movie?.title || 'Movie Details Unavailable'}
                                                        </h2>
                                                        <p className="text-gray-400">
                                                            {booking.theatreName || (booking.show?.theatre?.name ? `${booking.show.theatre.name}, ${booking.show.theatre.city}` : 'Theatre details unavailable')}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        {bStatus === 'completed' ? (
                                                            <span className="px-3 py-1 bg-gray-500 text-gray-900 text-xs font-bold rounded-full">
                                                                COMPLETED
                                                            </span>
                                                        ) : bStatus === 'cancelled' ? (
                                                            <span className="px-3 py-1 bg-red-500 text-red-900 text-xs font-bold rounded-full">
                                                                CANCELLED
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1 bg-green-500 text-green-900 text-xs font-bold rounded-full">
                                                                ACTIVE
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-gray-500 text-sm">Date & Time</p>
                                                        <p className="text-white font-medium">
                                                            {booking.date
                                                                ? new Date(booking.date).toLocaleDateString()
                                                                : (booking.show
                                                                    ? new Date(booking.show.date).toLocaleDateString()
                                                                    : 'N/A')}{' '}
                                                            at {booking.showtime || booking.show?.time || 'N/A'}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-gray-500 text-sm">Seats</p>
                                                        <p className="text-white font-medium">
                                                            {booking.seatsBooked.join(', ')}
                                                        </p>
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
                                                {booking.paymentStatus === 'Completed' && bStatus !== 'cancelled' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleDownloadPDF(booking)}
                                                            disabled={downloadingId === booking._id}
                                                            className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            {downloadingId === booking._id ? (
                                                                <span className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></span>
                                                            ) : (
                                                                <Download size={16} />
                                                            )}
                                                            Download Ticket
                                                        </button>

                                                        {bStatus === 'upcoming' && (
                                                            <button
                                                                onClick={() => handleCancelBooking(booking._id)}
                                                                disabled={cancellingId === booking._id}
                                                                className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                                                            >
                                                                {cancellingId === booking._id
                                                                    ? 'Cancelling...'
                                                                    : 'Cancel Booking'}
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Hidden Ticket for PDF generation */}
                                        {booking.paymentStatus === 'Completed' && (
                                            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                                                <div
                                                    id={`ticket-${booking._id}`}
                                                    className="bg-white text-black w-full max-w-2xl rounded shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
                                                    style={{ width: '800px', minHeight: '300px' }}
                                                >
                                                    <div className="w-1/3 bg-base-900 relative">
                                                        <img
                                                            src={booking.moviePoster || booking.movie?.posterUrl || booking.show?.movie?.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
                                                            alt={booking.movieName || booking.movie?.title || booking.show?.movie?.title || 'Movie'}
                                                            className="w-full h-full object-cover"
                                                            crossOrigin="anonymous"
                                                        />
                                                        <div className="absolute inset-0 flex items-end p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))' }}>
                                                            <span className="text-white font-bold tracking-widest uppercase text-xs">ReelVerse Ticket</span>
                                                        </div>
                                                    </div>

                                                    <div className="w-2/3 p-6 md:p-8 flex flex-col justify-between border-l-2 border-dashed border-gray-300 relative">
                                                        <div className="absolute -left-3 -top-3 w-6 h-6 bg-base-950 rounded-full"></div>
                                                        <div className="absolute -left-3 -bottom-3 w-6 h-6 bg-base-950 rounded-full"></div>

                                                        <div>
                                                            <h2 className="text-2xl font-black mb-1 leading-none uppercase">{booking.movieName || booking.movie?.title || booking.show?.movie?.title || 'Unknown Movie'}</h2>
                                                            <p className="text-gray-500 text-sm font-semibold tracking-wider mb-6 pb-4 border-b border-gray-200">
                                                                {booking.movie?.language || booking.show?.movie?.language || 'EN'} • {booking.movie?.duration || booking.show?.movie?.duration ? (booking.movie?.duration || booking.show?.movie?.duration) + ' mins' : 'Duration N/A'}
                                                            </p>

                                                            <div className="flex gap-4 mb-4">
                                                                <div className="flex-1">
                                                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                                                                    <p className="font-bold">{booking.date ? new Date(booking.date).toLocaleDateString() : (booking.show ? new Date(booking.show.date).toLocaleDateString() : 'N/A')}</p>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time</p>
                                                                    <p className="font-bold">{booking.showtime || booking.show?.time || 'N/A'}</p>
                                                                </div>
                                                            </div>

                                                            <div className="mb-4">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cinema</p>
                                                                <p className="font-bold">{booking.theatreName ? booking.theatreName.split(',')[0] : (booking.show?.theatre?.name || 'Archived Theatre')}</p>
                                                                <p className="text-sm text-gray-600">{booking.theatreName ? booking.theatreName.split(',')[1] : (booking.show?.theatre?.city || '')}</p>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Seats</p>
                                                                <p className="font-black text-lg text-primary-600">{booking.seatsBooked.join(', ')}</p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
                                                            <div>
                                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Total Paid</p>
                                                                <p className="font-black text-xl">₹{booking.totalPrice}</p>
                                                            </div>
                                                            {booking.qrCode && (
                                                                <div className="text-center">
                                                                    <img
                                                                        src={booking.qrCode}
                                                                        alt="Ticket QR Code"
                                                                        className="w-20 h-20 bg-white p-1 border border-gray-200"
                                                                        crossOrigin="anonymous"
                                                                    />
                                                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">ID: {booking._id.substring(0, 8)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* QR Code Section */}
                                        {booking.qrCode && booking.paymentStatus === 'Completed' && bStatus !== 'cancelled' && (
                                            <div className="w-full md:w-[180px] bg-base-950 p-6 flex flex-col items-center justify-center border-l border-base-800">
                                                <p className="text-gray-400 text-sm mb-4 text-center">
                                                    Scan at theatre
                                                </p>

                                                <div className="bg-white p-2 rounded-lg">
                                                    <img
                                                        src={booking.qrCode}
                                                        alt="Ticket QR Code"
                                                        className="w-32 h-32"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MyBookingsPage;