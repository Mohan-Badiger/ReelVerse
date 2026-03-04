import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, User, Menu, X, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../store/slices/authSlice';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import OTPModal from '../auth/OTPModal';

const Navbar = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [modalState, setModalState] = useState({ type: null, email: '' }); // 'login', 'register', 'otp', null

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            dispatch(logout());
            toast.success('Signed out successfully');
            navigate('/');
        } catch (err) {
            toast.error('Logout failed');
        }
    };

    const closeModals = () => setModalState({ type: null, email: '' });

    return (
        <>
            <header className={`fixed top-0 w-full z-40 h-16 transition-all duration-300 ${scrolled ? 'bg-base-950/80 backdrop-blur-md border-b border-base-800 shadow-sm' : 'bg-transparent'
                }`}>
                <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between">

                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="text-xl font-bold tracking-tight text-base-50 group-hover:text-white transition-colors">
                            ReelVerse
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-sm font-medium text-base-300 hover:text-base-50 transition-colors">Home</Link>
                        <Link to="/movies" className="text-sm font-medium text-base-300 hover:text-base-50 transition-colors">Movies</Link>
                        <Link to="/theatres" className="text-sm font-medium text-base-300 hover:text-base-50 transition-colors">Theatres</Link>
                    </nav>

                    <div className="hidden md:flex items-center space-x-6">
                        {userInfo ? (
                            <div className="flex items-center gap-4">
                                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-sm hover:bg-base-800 transition-colors border border-transparent hover:border-base-700">
                                    <div className="w-7 h-7 rounded-sm bg-base-800 border border-base-700 flex items-center justify-center text-xs font-semibold text-primary-400">
                                        {userInfo.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-base-100">{userInfo.name.split(' ')[0]}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-sm text-base-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setModalState({ type: 'login', email: '' })}
                                className="box-button-primary py-2 px-5 text-sm"
                            >
                                Sign In
                            </button>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 -mr-2 text-base-300 hover:text-base-50"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-16 left-0 w-full bg-base-950/95 backdrop-blur-xl border-b border-base-800 z-30 md:hidden shadow-sm"
                    >
                        <div className="flex flex-col p-6 space-y-2">
                            <Link to="/" className="px-4 py-3 text-base-100 font-medium hover:bg-base-900 rounded-sm">Home</Link>
                            <Link to="/movies" className="px-4 py-3 text-base-100 font-medium hover:bg-base-900 rounded-sm">Movies</Link>
                            <Link to="/theatres" className="px-4 py-3 text-base-100 font-medium hover:bg-base-900 rounded-sm">Theatres</Link>

                            <div className="h-px w-full bg-base-800 my-2" />

                            {userInfo ? (
                                <>
                                    <Link to="/profile" className="px-4 py-3 flex items-center gap-3 text-base-100 font-medium hover:bg-base-900 rounded-sm">
                                        <User size={18} className="text-primary-400" /> My Tickets
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-3 w-full text-left flex items-center gap-3 text-rose-400 font-medium hover:bg-rose-500/10 rounded-sm"
                                    >
                                        <LogOut size={18} /> Sign Out
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => { setIsMenuOpen(false); setModalState({ type: 'login', email: '' }); }}
                                    className="box-button-primary w-full mt-2"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals */}
            <LoginModal
                isOpen={modalState.type === 'login'}
                onClose={closeModals}
                onSwitchToRegister={() => setModalState({ type: 'register', email: '' })}
            />
            <RegisterModal
                isOpen={modalState.type === 'register'}
                onClose={closeModals}
                onSwitchToLogin={() => setModalState({ type: 'login', email: '' })}
                onShowOTP={(email) => setModalState({ type: 'otp', email })}
            />
            <OTPModal
                isOpen={modalState.type === 'otp'}
                onClose={closeModals}
                email={modalState.email}
            />
        </>
    );
};

export default Navbar;
