import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    LayoutDashboard,
    Film,
    Ticket,
    Users,
    LogOut,
    Menu,
    Settings,
    Bell,
    MapPin,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminApi from '../services/adminApi';
import toast from 'react-hot-toast';
import { adminLogout } from '../store/slices/authSlice';

const sidebarLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Bookings', path: '/bookings', icon: Ticket },
    { name: 'Theatres', path: '/theatres', icon: MapPin },
    { name: 'Showtimes', path: '/showtimes', icon: Clock },
    { name: 'Users', path: '/users', icon: Users },
];

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            await adminApi.post('/logout');
            dispatch(adminLogout());
            navigate('/login');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    return (
        <div className="flex h-screen bg-base-950 overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[260px] bg-base-950 border-r border-base-800 z-40 flex flex-col md:hidden shadow-2xl"
                        >
                            <div className="h-16 flex items-center justify-between px-6 border-b border-base-800 shrink-0 bg-base-900/50">
                                <span className="font-bold text-lg tracking-tight text-base-50">ReelVerse</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-base-400 hover:text-base-100 bg-base-800 rounded-sm">
                                    <Menu className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                                {sidebarLinks.map((link) => (
                                    <NavLink
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                                            flex items-center px-3 py-2.5 rounded-sm transition-all duration-200 group
                                            ${isActive
                                                ? 'bg-base-900 text-primary-400 font-medium border border-base-800 shadow-sm'
                                                : 'text-base-400 hover:text-base-100 hover:bg-base-900 border border-transparent'
                                            }
                                        `}
                                    >
                                        <link.icon className="shrink-0 w-5 h-5 mr-3" />
                                        <span>{link.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                            <div className="p-4 border-t border-base-800 shrink-0 mt-auto">
                                <button onClick={handleLogout} className="flex items-center w-full px-3 py-2.5 rounded-sm text-base-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                                    <LogOut className="shrink-0 w-5 h-5 mr-3" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Sidebar Desktop */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? '260px' : '80px' }}
                className="hidden md:flex flex-col border-r border-base-800 bg-base-950 h-full z-20 shrink-0"
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-base-800 shrink-0">
                    <AnimatePresence mode="wait">
                        {isSidebarOpen ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center space-x-2 font-bold text-lg tracking-tight text-base-50"
                            >
                                <span>ReelVerse</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mx-auto w-8 h-8 rounded bg-primary-600 flex items-center justify-center font-bold text-white shadow-sm"
                            >
                                R
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                    {sidebarLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => `
                                flex items-center px-3 py-2.5 rounded-sm transition-all duration-200 group
                                ${isActive
                                    ? 'bg-base-900 text-primary-400 font-medium border border-base-800 shadow-sm'
                                    : 'text-base-400 hover:text-base-100 hover:bg-base-900 border border-transparent'
                                }
                            `}
                        >
                            <link.icon className={`shrink-0 w-5 h-5 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                            <AnimatePresence>
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="whitespace-nowrap overflow-hidden"
                                    >
                                        {link.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </NavLink>
                    ))}
                </div>

                {/* Bottom Footer / Logout */}
                <div className="p-4 border-t border-base-800 shrink-0 mt-auto">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-3 py-2.5 rounded-sm text-base-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ${!isSidebarOpen && 'justify-center'
                            }`}
                    >
                        <LogOut className={`shrink-0 w-5 h-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Workspace */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#070b14]"> {/* Slightly deeper base for workspace */}
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-base-800 bg-base-950/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="mr-4 p-2 rounded-sm hover:bg-base-800 text-base-400 transition-colors hidden md:block"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Mobile Menu Toggle Stub */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="mr-4 md:hidden p-2 rounded-sm border border-base-800 text-base-400 hover:bg-base-800"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-sm hover:bg-base-800 text-base-400 relative transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-sm ring-2 ring-base-950"></span>
                        </button>
                        <button className="p-2 rounded-sm border border-base-800 hover:bg-base-800 text-base-400 transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                        <div className="w-8 h-8 rounded-sm bg-primary-600 flex items-center justify-center shadow-sm cursor-pointer ring-2 ring-base-950">
                            <span className="text-white text-xs font-bold shadow-sm">SA</span>
                        </div>
                    </div>
                </header>

                {/* Page Content Rendered Here */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-[1400px] mx-auto w-full h-full"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
