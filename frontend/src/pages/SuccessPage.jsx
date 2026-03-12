import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Download, Calendar, MapPin, Grid } from 'lucide-react';
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
                    className="bg-white text-black w-full max-w-2xl rounded shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
                    style={{ minHeight: '300px' }}
                >
                    {/* Left Section: Poster */}
                    <div className="w-full md:w-1/3 bg-base-900 relative">
                        <img
                            src={booking.show.movie.posterUrl}
                            alt={booking.show.movie.title}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                        />
                        <div className="absolute inset-0 flex items-end p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))' }}>
                            <span className="text-white font-bold tracking-widest uppercase text-xs">ReelVerse Ticket</span>
                        </div>
                    </div>

                    {/* Right Section: Details & QR */}
                    <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col justify-between border-l-2 border-dashed border-gray-300 relative">
                        {/* Cutouts for classic ticket look */}
                        <div className="absolute -left-3 -top-3 w-6 h-6 bg-base-950 rounded-full md:block hidden"></div>
                        <div className="absolute -left-3 -bottom-3 w-6 h-6 bg-base-950 rounded-full md:block hidden"></div>

                        <div>
                            <h2 className="text-2xl font-black mb-1 leading-none uppercase">{booking.show.movie.title}</h2>
                            <p className="text-gray-500 text-sm font-semibold tracking-wider mb-6 pb-4 border-b border-gray-200">
                                {booking.show.movie.language} • {booking.show.movie.duration} mins
                            </p>

                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                                    <p className="font-bold">{new Date(booking.show.date).toLocaleDateString()}</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time</p>
                                    <p className="font-bold">{booking.show.time}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cinema</p>
                                <p className="font-bold">{booking.show.theatre.name}</p>
                                <p className="text-sm text-gray-600">{booking.show.theatre.city}</p>
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
                    {isDownloading ? 'Generating...' : 'Download Ticket PDF'}
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
