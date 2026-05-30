import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import User from 'lucide-react/dist/esm/icons/user';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Heart from 'lucide-react/dist/esm/icons/heart';
import { m, AnimatePresence } from 'framer-motion';
import { logout } from '../../store/slices/authSlice';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

import { lazy, Suspense } from 'react';
const LoginModal = lazy(() => import('../auth/LoginModal'));
const RegisterModal = lazy(() => import('../auth/RegisterModal'));
const OTPModal = lazy(() => import('../auth/OTPModal'));

const Navbar = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [modalState, setModalState] = useState({ type: null, email: '' });

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

    // Nav Links Data
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Movies', path: '/movies' },
        { name: 'Theatres', path: '/theatres' },
    ];

    return (
        <>
            {/* Navbar Wrapper */}
            <header className={`fixed top-0 w-full z-40 transition-[padding] duration-500 ease-out flex justify-center ${
                scrolled ? 'pt-4 px-4' : 'pt-0 px-0'
            }`}>
                <m.div 
                    layout
                    initial={false}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className={`w-full flex items-center justify-between px-6 sm:px-8 transition-[background-color,backdrop-filter,border-radius,box-shadow,height,max-width] duration-500 ease-out ${
                        scrolled 
                            ? 'max-w-300 bg-base-950/90 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] rounded-full h-16' 
                            : 'max-w-350 bg-transparent h-20 rounded-none'
                    }`}
                >

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group shrink-0">
                        <span className="text-2xl font-black tracking-tight py-1 pr-1 bg-linear-to-r from-primary-400 to-accent-400 text-transparent bg-clip-text group-hover:from-white group-hover:to-primary-200 transition-all duration-300">
                            ReelVerse
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`relative px-4 py-2 text-sm font-semibold transition-colors duration-300 rounded-full group ${location.pathname === link.path ? 'text-white' : 'text-slate-300 hover:text-white'
                                    }`}
                            >
                                <span className="relative z-10">{link.name}</span>
                                {location.pathname === link.path && (
                                    <m.div
                                        layoutId="navbar-indicator"
                                        className="absolute inset-0 bg-white/10 rounded-full z-0"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4 shrink-0">
                        {userInfo ? (
                            <div className="flex items-center gap-4">
                                <Link to="/profile" className="group flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full hover:bg-base-800 border border-transparent hover:border-base-700 transition-all duration-300">
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-500 to-accent-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                                        {userInfo.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{userInfo.name.split(' ')[0]}</span>
                                </Link>
                                <Link to="/watchlist" className="p-2.5 rounded-full text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all duration-300" title="My Watchlist" aria-label="My Watchlist">
                                    <Heart size={18} />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300"
                                    title="Sign Out"
                                    aria-label="Sign Out"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setModalState({ type: 'login', email: '' })}
                                className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 bg-linear-to-r from-primary-600 to-accent-500 hover:from-primary-500 hover:to-accent-600 rounded-full overflow-hidden hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 active:scale-97"
                            >
                                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-linear-to-b from-transparent via-transparent to-black"></span>
                                <span className="relative">Sign In</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 -mr-2 text-slate-300 hover:text-white transition-colors z-50"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </m.div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-base-950/80 backdrop-blur-sm z-30 md:hidden"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <m.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                            className="fixed top-0 right-0 w-full max-w-sm h-full bg-base-900 border-l border-white/10 z-40 md:hidden flex flex-col pt-24 px-6 pb-6 shadow-2xl"
                        >
                            <div className="flex flex-col space-y-2 flex-1">
                                {navLinks.map((link, i) => (
                                    <m.div
                                        key={link.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1, duration: 0.3 }}
                                    >
                                        <Link
                                            to={link.path}
                                            className={`flex items-center justify-between px-4 py-4 font-bold text-lg rounded-xl transition-colors ${location.pathname === link.path ? 'bg-primary-500/10 text-primary-400' : 'text-white hover:bg-base-800'
                                                }`}
                                        >
                                            {link.name}
                                            <ChevronRight size={18} className="opacity-50" />
                                        </Link>
                                    </m.div>
                                ))}

                                <div className="h-px w-full bg-white/5 my-6" />

                                {userInfo ? (
                                    <m.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.3 }}
                                        className="mt-auto space-y-3"
                                    >
                                        <div className="flex items-center gap-4 px-4 py-4 bg-base-800/50 rounded-xl mb-4">
                                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary-500 to-accent-600 flex items-center justify-center text-xl font-bold text-white">
                                                {userInfo.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">{userInfo.name}</p>
                                                <p className="text-slate-400 text-sm">{userInfo.email}</p>
                                            </div>
                                        </div>
                                        <Link to="/profile" className="flex items-center gap-3 px-4 py-4 font-bold text-lg text-white hover:bg-base-800 rounded-xl transition-colors">
                                            <User size={20} className="text-primary-400" /> My Tickets
                                        </Link>
                                        <Link to="/watchlist" className="flex items-center gap-3 px-4 py-4 font-bold text-lg text-white hover:bg-base-800 rounded-xl transition-colors">
                                            <Heart size={20} className="text-primary-400" /> Watchlist
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-4 font-bold text-lg text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                                        >
                                            <LogOut size={20} /> Sign Out
                                        </button>
                                    </m.div>
                                ) : (
                                    <m.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.3 }}
                                        className="mt-auto"
                                    >
                                        <button
                                            onClick={() => { setIsMenuOpen(false); setModalState({ type: 'login', email: '' }); }}
                                            className="w-full py-4 text-center text-white font-bold text-lg bg-linear-to-r from-primary-600 to-accent-500 hover:from-primary-500 hover:to-accent-600 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 active:scale-97"
                                        >
                                            Sign In
                                        </button>
                                    </m.div>
                                )}
                            </div>
                        </m.div>
                    </>
                )}
            </AnimatePresence>

            <Suspense fallback={null}>
                <LoginModal
                    isOpen={modalState.type === 'login'}
                    onClose={closeModals}
                    onSwitchToRegister={() => setModalState({ type: 'register', email: '' })}
                    onShowOTP={(email) => setModalState({ type: 'otp', email })}
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
            </Suspense>
        </>
    );
};

export default Navbar;
