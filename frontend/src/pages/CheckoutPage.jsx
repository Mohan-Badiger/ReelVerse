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

    // Coupon state
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    useEffect(() => {
        const fetchShow = async () => {
            try {
                const res = await api.get(`/showtimes/${showId}`);
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

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setIsApplyingCoupon(true);
        try {
            const res = await api.post('/coupons/validate', { code: couponInput }, {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                }
            });
            setAppliedCoupon(res.data);
            toast.success(`Coupon applied! ${res.data.discountPercentage}% off!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid coupon');
            setAppliedCoupon(null);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponInput('');
        toast.success('Coupon removed');
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

            // 1. Lock Seats
            try {
                await api.post(`/showtimes/${showId}/lock-seats`, { seats: selectedSeats });
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to lock seats. They might be taken.');
                setIsCheckingOut(false);
                return;
            }

            // 2. Load Razorpay script
            const resScript = await loadRazorpayScript();
            if (!resScript) {
                toast.error('Razorpay SDK failed to load. Are you online?');
                setIsCheckingOut(false);
                return;
            }

            // 2. Create order on backend (New secure flow)
            const orderRes = await api.post('/payment/create-order', {
                showId,
                seats: selectedSeats,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
            });

            const { orderId, amount, currency } = orderRes.data;

            // 3. Open Razorpay checkout popup
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere',
                amount: amount.toString(),
                currency: currency,
                name: 'ReelVerse',
                description: `Booking for ${show.movie.title}`,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        toast.success('Payment Received. Confirming booking...');

                        // 4. On success call verification API
                        const verifyRes = await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            showId,
                            seats: selectedSeats,
                            totalPrice: amount / 100, // Pass actual billed amount
                            couponCode: appliedCoupon ? appliedCoupon.code : null,
                        });

                        if (verifyRes.data.success) {
                            toast.success('Booking confirmed successfully!');
                            navigate(`/booking/success?showId=${showId}`);
                        }
                    } catch (err) {
                        toast.error(err.response?.data?.message || 'Payment verification failed');
                    }
                },
                prefill: {
                    name: userInfo.name,
                    email: userInfo.email,
                },
                theme: {
                    color: '#f59e0b', // Primary theme color
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                toast.error(response.error.description || 'Payment failed');
            });
            paymentObject.open();

        } catch (error) {
            toast.error(error.response?.data?.message || 'Checkout failed');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-[80vh]"><div className="w-10 h-10 border-4 border-base-800 border-t-primary-500 rounded-sm animate-spin"></div></div>;
    if (!show) return <div className="text-center text-slate-400 mt-20">Show not found</div>;

    // Group seats by row
    const rowMapping = {};
    show.seats.forEach(seat => {
        if (!rowMapping[seat.row]) rowMapping[seat.row] = [];
        rowMapping[seat.row].push(seat);
    });

    const basePrice = selectedSeats.length * show.ticketPrice;
    const discountAmount = appliedCoupon ? (basePrice * (appliedCoupon.discountPercentage / 100)) : 0;
    const finalPrice = basePrice - discountAmount;

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12 fade-in">
            {/* Step Indicator */}
            <div className="w-full flex justify-center mb-16">
                <div className="flex items-center space-x-4 md:space-x-8">
                    <div className="flex items-center space-x-3 text-primary-400 font-bold">
                        <div className="w-10 h-10 rounded-sm bg-primary-500/20 flex items-center justify-center text-lg">1</div>
                        <span className="hidden md:inline text-lg text-white">Select Seats</span>
                    </div>
                    <div className="w-12 md:w-24 h-px bg-white/20"></div>
                    <div className="flex items-center space-x-3 text-slate-500 font-semibold">
                        <div className="w-10 h-10 rounded-sm bg-base-900 border border-base-800 flex items-center justify-center text-lg">2</div>
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
                        <div className="h-2 w-full bg-primary-500/30 rounded-sm blur-[2px] shadow-[0_0_30px_theme(colors.primary.500/30%)]"></div>
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
                                                    className={`w-8 h-8 md:w-10 md:h-10 rounded-sm text-xs font-bold transition-all flex items-center justify-center relative
                                                        ${seat.isBooked
                                                            ? 'bg-base-900 text-slate-700 cursor-not-allowed border border-base-800'
                                                            : isSelected
                                                                ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/40 border-primary-400'
                                                                : 'bg-base-800 text-slate-400 hover:bg-base-700 hover:text-white border border-base-800 hover:border-base-800'
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
                            <div className="w-8 h-8 rounded-sm bg-base-800 border border-base-800"></div>
                            <span className="text-sm font-medium text-slate-300">Available</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-sm bg-primary-500 shadow-sm shadow-primary-500/40"></div>
                            <span className="text-sm font-medium text-slate-300">Selected</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-sm bg-base-900 border border-base-800 flex items-center justify-center">
                                <X size={16} className="text-slate-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-300">Booked</span>
                        </div>
                    </div>
                </div>

                {/* Booking Summary Card */}
                <div className="w-full lg:w-1/3 relative">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="box-card sticky top-24 bg-base-900 border-base-800">
                        <h3 className="text-2xl font-black text-white mb-8 pb-4 border-b border-base-800">Booking Summary</h3>

                        <div className="space-y-6 mb-8">
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
                                <span className="text-slate-500">Selected Seats</span>
                                <span className="font-semibold text-white text-right max-w-[60%] leading-relaxed flex flex-wrap justify-end gap-1">
                                    {selectedSeats.length > 0
                                        ? selectedSeats.map(id => {
                                            const seat = show.seats.find(s => s.seatId === id);
                                            return seat ? `${seat.row}${seat.number}` : id;
                                        }).join(', ')
                                        : 'None'}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span className="text-slate-500">Tickets</span>
                                <span className="font-semibold text-white">{selectedSeats.length}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span className="text-slate-500">Price per Ticket</span>
                                <span className="font-semibold text-white">₹{show.ticketPrice}</span>
                            </div>

                            {/* Coupon Section */}
                            <div className="pt-4 border-t border-base-800">
                                <span className="text-slate-500 text-sm block mb-2">Have a coupon?</span>
                                {!appliedCoupon ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter Code"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value)}
                                            className="w-full bg-base-950 border border-base-800 rounded px-3 py-2 text-white outline-none focus:border-primary-500 uppercase text-sm"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={isApplyingCoupon || !couponInput.trim()}
                                            className="bg-primary-500 text-white px-4 py-2 rounded text-sm font-bold hover:bg-primary-600 disabled:opacity-50 transition-colors shrink-0"
                                        >
                                            {isApplyingCoupon ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center bg-green-500/10 border border-green-500/20 p-3 rounded">
                                        <div>
                                            <span className="text-green-500 font-bold block">{appliedCoupon.code} APPLIED</span>
                                            <span className="text-xs text-green-400">{appliedCoupon.discountPercentage}% discount</span>
                                        </div>
                                        <button onClick={removeCoupon} className="text-slate-400 hover:text-white p-1">
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Final Totaling */}
                            <div className="pt-4 border-t border-base-800 space-y-2">
                                <div className="flex justify-between text-slate-400">
                                    <span>Subtotal</span>
                                    <span>₹{basePrice.toFixed(2)}</span>
                                </div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-green-500 font-medium">
                                        <span>Discount ({appliedCoupon.discountPercentage}%)</span>
                                        <span>-₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between text-white text-2xl font-black pt-2">
                                <span>Total</span>
                                <span>₹{Math.round(finalPrice)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={selectedSeats.length === 0 || isCheckingOut}
                            className="w-full bg-white hover:bg-slate-200 text-base-950 font-black py-4 rounded-sm text-lg transition-all shadow-sm shadow-white/10 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 disabled:bg-white/50"
                        >
                            {isCheckingOut ? 'Redirecting to checkout...' : `Pay ₹${Math.round(finalPrice)}`}
                        </button>

                        {!userInfo && (
                            <p className="mt-4 text-sm text-center text-primary-400 font-medium bg-primary-500/10 py-3 rounded-sm border border-primary-500/20">
                                You must be logged in to checkout.
                            </p>
                        )}

                        <div className="mt-8 flex items-start text-xs text-slate-500 leading-relaxed bg-base-950 p-4 rounded-sm border border-base-800">
                            <ShieldAlert size={18} className="mr-3 shrink-0 text-slate-400" />
                            <p>Tickets can be cancelled up to 2 hours before the showtime. Transactions are processed securely via Razorpay.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
