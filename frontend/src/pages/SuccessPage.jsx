import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { m } from 'framer-motion';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Download from 'lucide-react/dist/esm/icons/download';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Grid from 'lucide-react/dist/esm/icons/grid';
import Share2 from 'lucide-react/dist/esm/icons/share-2';
import Ticket from 'lucide-react/dist/esm/icons/ticket';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Confetti from 'react-confetti';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const SuccessPage = () => {
    const [searchParams] = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(true);
    const [booking, setBooking] = useState(null);
    const ticketRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [windowDimensions, setWindowDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchBooking = async () => {
            const bookingId = searchParams.get('bookingId');

            if (!bookingId) {
                setIsProcessing(false);
                return;
            }

            try {
                const res = await api.get(`/bookings/${bookingId}`);
                setBooking(res.data);
            } catch (error) {
                console.error('Failed to fetch booking details', error);
            } finally {
                setIsProcessing(false);
            }
        };

        fetchBooking();
    }, [searchParams]);

    const handleDownloadPDF = async () => {
        if (!ticketRef.current || isDownloading) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: false, // Must be false to allow toDataURL
                backgroundColor: '#121212',
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
            setIsDownloading(false);
        }
    };

    const handleShareTicket = async () => {
        if (!ticketRef.current || isDownloading) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#121212',
            });

            canvas.toBlob(async (blob) => {
                if (!blob) throw new Error('Failed to generate image blob');

                const file = new File([blob], `ReelVerse-Ticket-${booking._id.substring(0, 6)}.png`, { type: 'image/png' });

                // Try Web Share API first (Mobile devices)
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: `Ticket for ${booking.show.movie.title}`,
                            text: 'Got my tickets on ReelVerse!',
                            files: [file],
                        });
                        toast.success('Shared successfully!');
                    } catch (shareError) {
                        if (shareError.name !== 'AbortError') {
                            throw shareError;
                        }
                    }
                } else {
                    // Fallback to Download (Desktop)
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = file.name;
                    link.href = url;
                    link.click();
                    URL.revokeObjectURL(url);
                    toast.success('Ticket image downloaded for sharing!');
                }
                setIsDownloading(false);
            }, 'image/png', 1.0);

        } catch (error) {
            console.error('Failed to generate share image', error);
            toast.error('Failed to prepare ticket for sharing');
            setIsDownloading(false);
        }
    };

    if (isProcessing) {
        return (
            <div className="fixed inset-0 z-50 bg-base-950 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)]" />
                <m.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 flex flex-col items-center"
                >
                    <div className="relative mb-8">
                        <div className="w-16 h-16 border-4 border-base-800 rounded-sm"></div>
                        <div className="w-16 h-16 border-4 border-emerald-500 rounded-sm border-t-transparent animate-spin absolute top-0 left-0"></div>
                        <m.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 flex items-center justify-center text-2xl"
                        >
                            🎬
                        </m.div>
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">Securing Your Tickets</h2>
                    <p className="text-slate-500 font-medium animate-pulse">Confirming transaction with cinema...</p>
                </m.div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <CheckCircle size={40} className="text-red-500 rotate-45" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Booking Not Found</h2>
                <p className="text-slate-400 max-w-md mb-8">We couldn't retrieve your booking details. If you've already paid, please check your email or contact support.</p>
                <Link to="/" className="px-8 py-3 bg-white text-black font-black rounded-sm hover:bg-slate-200 transition">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-20 fade-in relative">
            <Confetti
                width={windowDimensions.width}
                height={windowDimensions.height}
                recycle={false}
                numberOfPieces={400}
                gravity={0.12}
                colors={['#10b981', '#6366f1', '#f59e0b', '#ffffff']}
            />

            <div className="flex flex-col items-center text-center mb-16 relative z-10">
                <m.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)] border border-emerald-500/30"
                >
                    <CheckCircle size={40} />
                </m.div>

                <m.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase"
                >
                    Cinema <span className="text-emerald-500">Confirmed!</span>
                </m.h1>

                <m.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-400 text-lg max-w-xl"
                >
                    Awesome! Your booking for <span className="text-white font-bold">{booking.show.movie.title}</span> is successful. A copy has been sent to your email.
                </m.p>
            </div>

            {/* TICKET CONTAINER */}
            <m.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-16 flex justify-center w-full group"
            >
                <div
                    ref={ticketRef}
                    className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden flex flex-col md:flex-row relative shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
                    style={{ backgroundColor: '#09090b', color: '#ffffff', minHeight: '400px', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    {/* LEFT SIDE: POSTER & MOVIE INFO */}
                    <div className="w-full md:w-[350px] relative overflow-hidden">
                        <img
                            src={booking.show.movie.posterUrl}
                            alt={booking.show.movie.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            crossOrigin="anonymous"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#09090b] via-[#09090b]/40 to-transparent p-8 flex flex-col justify-end">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={16} className="text-emerald-400" />
                                <span className="text-xs font-black tracking-[0.3em] uppercase text-emerald-400">ReelVerse Premier</span>
                            </div>
                            <h2 className="text-3xl font-black leading-tight uppercase tracking-tighter mb-2">{booking.show.movie.title}</h2>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{booking.show.movie.language} &bull; {booking.show.movie.duration} min</p>
                        </div>
                    </div>

                    {/* RIGHT SIDE: TICKET STUB */}
                    <div className="flex-1 p-10 md:p-12 flex flex-col justify-between relative bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05)_0%,transparent_50%)]">

                        {/* THE CINEMATIC "CUTOUTS" */}
                        <div className="absolute -left-5 top-0 bottom-0 flex flex-col justify-center gap-4 md:flex">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="w-10 h-6 bg-black rounded-full -ml-8 border border-white/5" />
                            ))}
                        </div>

                        <div>
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Cinema Venue</p>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={18} className="text-emerald-500" />
                                        <h3 className="text-xl font-black text-white uppercase">{booking.show.theatre.name}</h3>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">{booking.show.theatre.location || booking.show.theatre.city}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Booking ID</p>
                                    <p className="text-sm font-mono text-white/40">#{booking._id.substring(0, 10).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Date</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-emerald-500" />
                                        <p className="text-lg font-black uppercase">{new Date(booking.show.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Time</p>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-emerald-500" />
                                        <p className="text-lg font-black uppercase">{booking.show.time}</p>
                                    </div>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Seats</p>
                                    <div className="flex items-center gap-2">
                                        <Grid size={16} className="text-emerald-500" />
                                        <p className="text-xl font-black text-emerald-400">{booking.seatsBooked.join(', ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-8">
                            <div className="flex flex-col">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Total Amount</p>
                                <p className="text-3xl font-black text-white">₹{booking.totalPrice}</p>
                            </div>

                            {booking.qrCode ? (
                                <div className="relative group/qr">
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover/qr:opacity-100 transition-opacity" />
                                    <div className="relative bg-white p-2 rounded-xl shadow-lg border-2 border-emerald-500/30">
                                        <img
                                            src={booking.qrCode}
                                            alt="QR"
                                            className="w-20 h-20 sm:w-24 sm:h-24"
                                            crossOrigin="anonymous"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                                    <Ticket size={24} className="mx-auto text-slate-600 mb-1" />
                                    <p className="text-[8px] font-bold text-slate-500 uppercase">Verify at Counter</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </m.div>

            <m.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10"
            >
                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="w-full sm:w-auto px-10 py-5 bg-white hover:bg-slate-200 text-base-950 rounded-sm font-black flex items-center justify-center text-lg transition-all shadow-xl active:scale-95 duration-200 disabled:opacity-50"
                >
                    {isDownloading ? (
                        <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    ) : (
                        <Download size={22} className="mr-3" />
                    )}
                    {isDownloading ? 'Processing...' : 'Download PDF'}
                </button>
                <button
                    onClick={handleShareTicket}
                    disabled={isDownloading}
                    className="w-full sm:w-auto px-10 py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-sm font-black flex items-center justify-center text-lg transition-all shadow-xl active:scale-95 duration-200 disabled:opacity-50"
                >
                    <Share2 size={22} className="mr-3" />
                    Share Story
                </button>
                <Link
                    to="/profile"
                    className="w-full sm:w-auto px-10 py-5 bg-base-900 border border-base-800 hover:bg-base-800 text-white rounded-sm font-black flex items-center justify-center text-lg transition-all active:scale-95 duration-200"
                >
                    My Dashboard <ArrowRight size={22} className="ml-3 text-slate-500" />
                </Link>
            </m.div>
        </div>
    );
};

export default SuccessPage;
