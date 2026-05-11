import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Download, Calendar, MapPin, Grid, Share2 } from 'lucide-react';
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
            <div className="flex flex-col items-center justify-center h-[80vh] fade-in">
                <div className="w-12 h-12 border-4 border-base-800 border-t-emerald-500 rounded-sm animate-spin mb-6"></div>
                <p className="text-white text-lg font-medium">Securing your tickets...</p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] fade-in">
                <p className="text-slate-400 text-lg font-medium">Booking not found or you are not authorized.</p>
                <Link to="/" className="mt-4 text-primary-500 hover:text-primary-400">Go Home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-20 fade-in relative">
            <Confetti
                width={windowDimensions.width}
                height={windowDimensions.height}
                recycle={false}
                numberOfPieces={500}
                gravity={0.15}
            />

            <div className="flex flex-col items-center text-center mb-12 relative z-10">
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

            {/* Ticket PDF Wrapper */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-12 flex justify-center w-full"
            >
                <div
                    ref={ticketRef}
                    className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden flex flex-col md:flex-row relative"
                    style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '320px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                >
                    {/* Left Section: Poster */}
                    <div className="w-full md:w-2/5 relative">
                        <img
                            src={booking.show.movie.posterUrl}
                            alt={booking.show.movie.title}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            style={{ minHeight: '100%' }}
                        />
                        <div className="absolute inset-0 p-6 flex items-end" style={{ background: 'linear-gradient(to top, #121212 0%, rgba(18,18,18,0) 100%)' }}>
                            <span style={{ color: '#f59e0b', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '13px' }}>ReelVerse Premier</span>
                        </div>
                    </div>

                    {/* Right Section: Details & QR */}
                    <div className="w-full md:w-3/5 p-8 flex flex-col justify-between relative" style={{ borderLeft: '2px dashed #333333' }}>
                        {/* Cutouts for classic ticket look */}
                        <div className="absolute -left-4 -top-4 w-8 h-8 rounded-full md:block hidden" style={{ backgroundColor: '#09090b' }}></div>
                        <div className="absolute -left-4 -bottom-4 w-8 h-8 rounded-full md:block hidden" style={{ backgroundColor: '#09090b' }}></div>

                        <div>
                            <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px', lineHeight: '1.1', textTransform: 'uppercase' }}>{booking.show.movie.title}</h2>
                            <p style={{ color: '#a1a1aa', fontSize: '14px', fontWeight: '600', letterSpacing: '1px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #333333' }}>
                                {booking.show.movie.language} • {booking.show.movie.duration} mins
                            </p>

                            <div className="flex gap-4 mb-6">
                                <div className="flex-1">
                                    <p style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Date</p>
                                    <p style={{ fontWeight: '700', fontSize: '16px' }}>{new Date(booking.show.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                </div>
                                <div className="flex-1">
                                    <p style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Time</p>
                                    <p style={{ fontWeight: '700', fontSize: '16px' }}>{booking.show.time}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 mb-6">
                                <div className="flex-1">
                                    <p style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Cinema</p>
                                    <p style={{ fontWeight: '700', fontSize: '16px' }}>{booking.show.theatre.name}</p>
                                    <p style={{ fontSize: '14px', color: '#a1a1aa' }}>{booking.show.theatre.city}</p>
                                </div>
                                <div className="flex-1">
                                    <p style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Seats</p>
                                    <p style={{ fontWeight: '900', fontSize: '20px', color: '#f59e0b' }}>{booking.seatsBooked.join(', ')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between pt-6" style={{ borderTop: '1px solid #333333' }}>
                            <div>
                                <p style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Paid</p>
                                <p style={{ fontWeight: '900', fontSize: '24px' }}>₹{booking.totalPrice}</p>
                            </div>
                            {booking.qrCode && (
                                <div className="text-center">
                                    <div style={{ backgroundColor: '#ffffff', padding: '6px', borderRadius: '4px' }}>
                                        <img
                                            src={booking.qrCode}
                                            alt="Ticket QR Code"
                                            style={{ width: '80px', height: '80px' }}
                                            crossOrigin="anonymous"
                                        />
                                    </div>
                                    <p style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '6px' }}>ID: {booking._id.substring(0, 8)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10"
            >
                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-200 text-base-950 rounded-sm font-bold flex items-center justify-center text-lg transition-all shadow-sm active:scale-95 duration-200 disabled:opacity-50"
                >
                    {isDownloading ? (
                        <div className="w-5 h-5 border-2 border-base-800 border-t-base-950 rounded-sm animate-spin mr-3"></div>
                    ) : (
                        <Download size={20} className="mr-3" />
                    )}
                    {isDownloading ? 'Generating...' : 'Download PDF'}
                </button>
                <button
                    onClick={handleShareTicket}
                    disabled={isDownloading}
                    className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-sm font-bold flex items-center justify-center text-lg transition-all shadow-sm active:scale-95 duration-200 disabled:opacity-50"
                >
                    <Share2 size={20} className="mr-3" />
                    Share to Story
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
