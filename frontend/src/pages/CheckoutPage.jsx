import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const CheckoutPage = () => {
    const { showId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);

    const [show, setShow] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
        const fetchShow = async () => {
            try {
                const res = await api.get(`/shows/${showId}`);
                setShow(res.data);
            } catch (error) {
                toast.error('Failed to load seat map');
            } finally {
                setIsLoading(false);
            }
        };
        fetchShow();
    }, [showId]);

    const toggleSeat = (seat) => {
        if (seat.isBooked) return;

        if (selectedSeats.includes(seat.seatId)) {
            setSelectedSeats(selectedSeats.filter((id) => id !== seat.seatId));
        } else {
            if (selectedSeats.length >= 10) {
                toast.error('You can only select up to 10 seats');
                return;
            }
            setSelectedSeats([...selectedSeats, seat.seatId]);
        }
    };

    const handleCheckout = async () => {
        if (!userInfo) {
            toast.error('Please login to continue');
            return;
        }

        if (selectedSeats.length === 0) {
            toast.error('Please select at least one seat');
            return;
        }

        setIsCheckingOut(true);
        try {
            const totalPrice = selectedSeats.length * show.ticketPrice;
            const res = await api.post('/bookings/checkout', {
                showId,
                seats: selectedSeats,
                totalPrice,
            });

            // Redirect to Stripe checkout
            window.location.href = res.data.url;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Checkout failed');
            setIsCheckingOut(false);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-[80vh]"><div className="w-10 h-10 border-4 border-white/10 border-t-primary-500 rounded-full animate-spin"></div></div>;
    if (!show) return <div className="text-center text-slate-400 mt-20">Show not found</div>;

    // Group seats by row
    const rowMapping = {};
    show.seats.forEach(seat => {
        if (!rowMapping[seat.row]) rowMapping[seat.row] = [];
        rowMapping[seat.row].push(seat);
    });

    const totalPrice = selectedSeats.length * show.ticketPrice;

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12 fade-in">
            {/* Step Indicator */}
            <div className="w-full flex justify-center mb-16">
                <div className="flex items-center space-x-4 md:space-x-8">
                    <div className="flex items-center space-x-3 text-primary-400 font-bold">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-lg">1</div>
                        <span className="hidden md:inline text-lg text-white">Select Seats</span>
                    </div>
                    <div className="w-12 md:w-24 h-px bg-white/20"></div>
                    <div className="flex items-center space-x-3 text-slate-500 font-semibold">
                        <div className="w-10 h-10 rounded-full bg-base-900 border border-white/10 flex items-center justify-center text-lg">2</div>
                        <span className="hidden md:inline text-lg">Checkout</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Seat Selection Panel */}
                <div className="w-full lg:w-2/3 box-panel p-8 md:p-12 overflow-hidden bg-base-950/50">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-black text-white mb-2">{show.movie.title}</h2>
                        <p className="text-slate-400">{new Date(show.date).toLocaleDateString()} &middot; {show.time}</p>
                    </div>

                    {/* Screen Preview */}
                    <div className="w-full max-w-2xl mx-auto mb-20 relative">
                        <div className="h-2 w-full bg-primary-500/30 rounded-full blur-[2px] shadow-[0_0_30px_theme(colors.primary.500/30%)]"></div>
                        <div className="absolute top-2 w-full h-16 bg-gradient-to-b from-primary-500/10 to-transparent flex justify-center pt-3">
                            <span className="text-white/40 text-xs tracking-[1em] uppercase font-bold">Screen</span>
                        </div>
                    </div>

                    {/* Seats Grid */}
                    <div className="max-w-3xl mx-auto overflow-x-auto pb-8 scrollbar-hide">
                        <div className="min-w-[500px] flex flex-col items-center gap-4">
                            {Object.keys(rowMapping).map(rowLetter => (
                                <div key={rowLetter} className="flex justify-center items-center gap-3 md:gap-4">
                                    <span className="w-6 text-right font-bold text-slate-500 text-sm">{rowLetter}</span>

                                    <div className="flex gap-2 md:gap-3">
                                        {rowMapping[rowLetter].map(seat => {
                                            const isSelected = selectedSeats.includes(seat.seatId);

                                            return (
                                                <motion.button
                                                    whileHover={!seat.isBooked ? { scale: 1.1 } : {}}
                                                    whileTap={!seat.isBooked ? { scale: 0.9 } : {}}
                                                    key={seat.seatId}
                                                    onClick={() => toggleSeat(seat)}
                                                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center relative
                                                        ${seat.isBooked
                                                            ? 'bg-base-900 text-slate-700 cursor-not-allowed border border-white/5'
                                                            : isSelected
                                                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/40 border-primary-400'
                                                                : 'bg-base-800 text-slate-400 hover:bg-base-700 hover:text-white border border-white/10 hover:border-white/30'
                                                        }`}
                                                    disabled={seat.isBooked}
                                                >
                                                    {seat.isBooked ? <X size={14} className="opacity-50" /> : seat.number}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                    <span className="w-6 text-left font-bold text-slate-500 text-sm">{rowLetter}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legends */}
                    <div className="flex justify-center flex-wrap mt-16 gap-6 md:gap-12">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-base-800 border border-white/10"></div>
                            <span className="text-sm font-medium text-slate-300">Available</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-500 shadow-lg shadow-primary-500/40"></div>
                            <span className="text-sm font-medium text-slate-300">Selected</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-base-900 border border-white/5 flex items-center justify-center">
                                <X size={16} className="text-slate-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-300">Booked</span>
                        </div>
                    </div>
                </div>

                {/* Booking Summary Card */}
                <div className="w-full lg:w-1/3">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="box-card sticky top-28 bg-base-900 border-white/10">
                        <h3 className="text-2xl font-black text-white mb-8 pb-4 border-b border-white/10">Booking Summary</h3>

                        <div className="space-y-6 mb-10">
                            <div className="flex justify-between text-slate-300">
                                <span className="text-slate-500">Theatre</span>
                                <span className="font-semibold text-white">{show.theatre.name}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span className="text-slate-500">Date & Time</span>
                                <span className="font-semibold text-white text-right">
                                    {new Date(show.date).toLocaleDateString()}<br />{show.time}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span className="text-slate-500">Seats</span>
                                <span className="font-bold text-primary-400 text-right max-w-[50%] leading-relaxed">
                                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                                </span>
                            </div>
                            <div className="flex justify-between text-white text-2xl font-black pt-6 border-t border-white/10">
                                <span>Total Price</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={selectedSeats.length === 0 || isCheckingOut}
                            className="w-full bg-white hover:bg-slate-200 text-base-950 font-black py-4 rounded-xl text-lg transition-all shadow-lg shadow-white/10 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 disabled:bg-white/50"
                        >
                            {isCheckingOut ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
                        </button>

                        {!userInfo && (
                            <p className="mt-4 text-sm text-center text-primary-400 font-medium bg-primary-500/10 py-3 rounded-lg border border-primary-500/20">
                                You must be logged in to checkout.
                            </p>
                        )}

                        <div className="mt-8 flex items-start text-xs text-slate-500 leading-relaxed bg-base-950 p-4 rounded-xl border border-white/5">
                            <ShieldAlert size={18} className="mr-3 shrink-0 text-slate-400" />
                            <p>Tickets once booked cannot be cancelled. Transactions are processed securely via Stripe Test Mode.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
