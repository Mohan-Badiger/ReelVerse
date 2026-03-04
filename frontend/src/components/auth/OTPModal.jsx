import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../../utils/axios';

const OTPModal = ({ isOpen, onClose, email }) => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email, otp });
            dispatch(setCredentials(res.data));
            toast.success('Account verified and logged in successfully!');
            onClose();
            setOtp('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-base-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="box-panel p-8 w-full max-w-md relative overflow-hidden text-center"
                    >
                        {/* Glow decorative effect */}
                        <div className="absolute top-[-30%] left-[20%] w-[60%] h-[60%] bg-emerald-900/20 blur-[80px] rounded-full pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-2 text-base-400 hover:text-base-100 hover:bg-base-800 rounded-lg transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative z-10">
                            <div className="mx-auto w-12 h-12 bg-base-900 border border-base-700 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                <KeyRound className="w-6 h-6 text-primary-400" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-base-50 mb-2">Verify email</h2>
                            <p className="text-sm text-base-400 mb-6 px-4">
                                Enter the 6-digit code sent to <span className="text-base-100 font-medium">{email}</span>
                            </p>

                            <form onSubmit={handleVerify} className="space-y-4">
                                <div className="space-y-1 text-left">
                                    <label className="text-xs font-semibold text-base-300 ml-1 uppercase tracking-wider">Security Code</label>
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="box-input h-14 text-center tracking-[1em] text-xl font-mono"
                                        required
                                        maxLength={6}
                                        autoComplete="one-time-code"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || otp.length < 6}
                                    className="box-button-primary w-full h-12 mt-4 flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Verify & Continue'
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OTPModal;
