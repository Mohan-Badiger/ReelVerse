import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Download, Calendar, MapPin, Grid } from 'lucide-react';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const SuccessPage = () => {
    const [searchParams] = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(true);
    const [show, setShow] = useState(null);
    const [bookingDetails, setBookingDetails] = useState({ seats: [], totalPrice: 0 });

    useEffect(() => {
        const confirmPayment = async () => {
            const showId = searchParams.get('showId');
            const seats = searchParams.get('seats')?.split(',');
            const totalPrice = searchParams.get('totalPrice');
            const sessionId = searchParams.get('session_id');

            if (!showId || !seats || !sessionId) {
                setIsProcessing(false);
                return;
            }

            setBookingDetails({ seats, totalPrice });

            try {
                // Confirm booking
                await api.post('/bookings/confirm', {
                    showId,
                    seats,
                    totalPrice,
                    sessionId,
                });

                // Fetch show details for the card
                const showRes = await api.get(`/showtimes/${showId}`);
                setShow(showRes.data);

                toast.success('Payment successful & seats locked!');
            } catch (error) {
                if (error.response?.data?.message !== 'Seats booked by someone else during checkout. Please try again.') {
                    console.error(error);
                }
                // Try fetching show details anyway to show the card
                try {
                    const showRes = await api.get(`/showtimes/${showId}`);
                    setShow(showRes.data);
                } catch (e) {
                    console.error(e);
                }
            } finally {
                setIsProcessing(false);
            }
        };

        confirmPayment();
    }, [searchParams]);

    if (isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] fade-in">
                <div className="w-12 h-12 border-4 border-base-800 border-t-emerald-500 rounded-sm animate-spin mb-6"></div>
                <p className="text-white text-lg font-medium">Securing your tickets...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-20 fade-in">
            <div className="flex flex-col items-center text-center mb-12">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-sm flex items-center justify-center mb-8 shadow-sm shadow-emerald-500/20 border border-emerald-500/20"
                >
                    <CheckCircle size={48} />
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"
                >
                    Booking Confirmed!
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-400 text-lg"
                >
                    Your tickets are ready. An email confirmation has been sent.
                </motion.p>
            </div>

            {/* Booking Details Card */}
            {show && (
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="box-panel p-1 mb-12 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-sm blur-3xl -mr-10 -mt-10"></div>

                    <div className="bg-base-950 rounded-sm p-8 flex flex-col sm:flex-row gap-8 relative z-10 border border-base-800">
                        <img
                            src={show.movie.posterUrl}
                            alt={show.movie.title}
                            className="w-32 h-48 object-cover rounded-sm shadow-sm border border-base-800 hidden sm:block"
                        />

                        <div className="flex-1 flex flex-col justify-center">
                            <h2 className="text-2xl font-black text-white mb-4">{show.movie.title}</h2>

                            <div className="space-y-3">
                                <div className="flex items-start text-slate-300">
                                    <MapPin size={18} className="mr-3 text-slate-500 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-white">{show.theatre.name}</p>
                                        <p className="text-sm text-slate-500">{show.theatre.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-slate-300">
                                    <Calendar size={18} className="mr-3 text-slate-500" />
                                    <span className="font-medium text-white">{new Date(show.date).toLocaleDateString()}</span>
                                    <span className="mx-2 text-slate-600">&bull;</span>
                                    <span className="font-medium text-white">{show.time}</span>
                                </div>
                                <div className="flex items-center text-slate-300">
                                    <Grid size={18} className="mr-3 text-slate-500" />
                                    <span className="text-sm text-slate-500 mr-2">Seats:</span>
                                    <span className="font-bold text-primary-400">{bookingDetails.seats.join(', ')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
                <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-200 text-base-950 rounded-sm font-bold flex items-center justify-center text-lg transition-all shadow-sm active:scale-95 duration-200"
                >
                    <Download size={20} className="mr-3" /> Download Ticket
                </button>
                <Link
                    to="/profile"
                    className="w-full sm:w-auto px-8 py-4 bg-base-900 border border-base-800 hover:border-base-800 text-white rounded-sm font-bold flex items-center justify-center text-lg transition-all active:scale-95 duration-200"
                >
                    View Dashboard <ArrowRight size={20} className="ml-3 text-slate-400" />
                </Link>
            </motion.div>
        </div>
    );
};

export default SuccessPage;
