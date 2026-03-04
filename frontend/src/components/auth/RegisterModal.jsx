import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin, onShowOTP }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/register', { name, email, password });
            toast.success('OTP sent to your email!');
            onShowOTP(email);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
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
                        className="box-panel p-8 w-full max-w-md relative overflow-hidden"
                    >
                        {/* Glow decorative effect */}
                        <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] bg-primary-900/20 blur-[80px] rounded-full pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-2 text-base-400 hover:text-base-100 hover:bg-base-800 rounded-lg transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold tracking-tight text-base-50 mb-1">Create Account</h2>
                            <p className="text-sm text-base-400 mb-6">Join ReelVerse to book your next cinematic experience.</p>

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-base-300 ml-1 uppercase tracking-wider">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-base-500 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="box-input pl-10 h-12"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-base-300 ml-1 uppercase tracking-wider">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-base-500 w-5 h-5" />
                                        <input
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="box-input pl-10 h-12"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-base-300 ml-1 uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-base-500 w-5 h-5" />
                                        <input
                                            type="password"
                                            placeholder="Min. 8 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="box-input pl-10 h-12"
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="box-button-primary w-full h-12 mt-2 flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-sm text-base-400">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={onSwitchToLogin}
                                    className="text-primary-400 font-medium hover:text-primary-300 transition-colors"
                                >
                                    Sign in
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RegisterModal;
