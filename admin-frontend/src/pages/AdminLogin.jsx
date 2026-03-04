import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setAdminCredentials } from "../store/slices/authSlice";
import adminApi from "../services/adminApi";

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    });

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
            const res = await adminApi.post("/login", credentials);

            dispatch(setAdminCredentials(res.data));

            toast.success("Admin login successful");
            navigate("/dashboard");
        } catch (error) {
            toast.error(error.response?.data?.message || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-950 px-6">

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-sm"
            >
                <div className="bg-base-900 border border-base-800 rounded-sm p-8 shadow-sm">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 flex items-center justify-center border border-base-700 bg-base-950 rounded-sm mb-4">
                            <ShieldAlert className="w-6 h-6 text-primary-400" />
                        </div>

                        <h1 className="text-xl font-semibold text-base-50">
                            Admin Portal
                        </h1>

                        <p className="text-sm text-base-400 mt-1">
                            Sign in to access dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="text-sm text-base-300 mb-1 block">
                                Email
                            </label>

                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-500" />

                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={credentials.email}
                                    onChange={handleChange}
                                    placeholder="admin@reelverse.com"
                                    className="w-full h-11 pl-10 pr-3 text-sm bg-base-950 border border-base-800 rounded-sm outline-none focus:border-primary-500 transition"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-sm text-base-300 mb-1 block">
                                Password
                            </label>

                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-500" />

                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={credentials.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full h-11 pl-10 pr-3 text-sm bg-base-950 border border-base-800 rounded-sm outline-none focus:border-primary-500 transition"
                                />
                            </div>
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-sm flex items-center justify-center transition"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-base-800 border-t-white rounded-sm animate-spin"></div>
                            ) : (
                                "Login"
                            )}
                        </button>

                    </form>
                </div>

                {/* Back button */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => window.location.href = "http://localhost:5173"}
                        className="text-sm text-base-500 hover:text-base-300"
                    >
                        ← Back to Application
                    </button>
                </div>
            </motion.div>

        </div>
    );
};

export default AdminLogin;