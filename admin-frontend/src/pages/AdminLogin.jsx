import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setAdminCredentials } from '../store/slices/authSlice';
import adminApi from '../services/adminApi';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await adminApi.post('/login', credentials);

            // Assuming the backend sends back user info or a token payload in res.data
            // The actual JWT is in an HTTP-only cookie, 
            // but we might want to store user details in Redux.
            dispatch(setAdminCredentials(res.data));

            toast.success('Admin authentication successful');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-950 p-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-900/40 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-600/20 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="box-panel p-10 relative z-10 border border-base-800 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="h-16 w-16 bg-base-900 border border-base-700 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                            <ShieldAlert className="text-primary-400 w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-base-50">Admin Portal</h1>
                        <p className="text-sm text-base-400 mt-2">Sign in to access the ReelVerse dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-base-300 ml-1">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-500" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={credentials.email}
                                    onChange={handleChange}
                                    className="box-input pl-12"
                                    placeholder="admin@reelverse.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-base-300 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-500" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={credentials.password}
                                    onChange={handleChange}
                                    className="box-input pl-12"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="box-button-primary w-full flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Authenticate'
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => window.location.href = 'http://localhost:5173'}
                        className="text-sm text-base-500 hover:text-base-300 transition-colors"
                    >
                        &larr; Return to Application
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
