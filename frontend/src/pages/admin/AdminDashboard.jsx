import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Film, Ticket, TrendingUp } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const MetricCard = ({ title, value, icon: Icon, trend }) => (
    <div className="box-card hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-base-800 rounded-sm">
                <Icon className="w-6 h-6 text-primary-400" />
            </div>
            {trend && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-sm ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                </span>
            )}
        </div>
        <div>
            <p className="text-sm font-medium text-base-400 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-base-50 tracking-tight">{value}</h3>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState({
        users: 0,
        movies: 0,
        bookings: 0,
        revenue: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await api.get('/admin/dashboard');
                setMetrics(res.data.metrics);
            } catch (error) {
                toast.error('Failed to load dashboard metrics');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-8 fade-in animate-pulse">
                <div className="w-1/3 h-10 bg-base-900 rounded-sm mb-2"></div>
                <div className="w-1/4 h-4 bg-base-900 rounded-sm mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="box-card h-32"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 box-panel h-[400px]"></div>
                    <div className="box-panel h-[400px]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-base-50 mb-2">Overview</h1>
                    <p className="text-base-400">Welcome back, Super Admin. Here is what's happening today.</p>
                </div>
                <button className="box-button-secondary text-sm">Download Report</button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Users" value={metrics.users} icon={Users} trend={+12.5} />
                <MetricCard title="Active Movies" value={metrics.movies} icon={Film} trend={0} />
                <MetricCard title="Total Bookings" value={metrics.bookings} icon={Ticket} trend={+5.2} />
                <MetricCard title="Total Revenue" value={`$${metrics.revenue}`} icon={TrendingUp} trend={+18.1} />
            </div>

            {/* Placeholder for Recent Activity and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 box-panel p-6 h-[400px] flex items-center justify-center">
                    <p className="text-base-500 flex flex-col items-center">
                        <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                        Revenue Chart goes here
                    </p>
                </div>
                <div className="box-panel p-6 h-[400px]">
                    <h3 className="text-lg font-semibold text-base-50 mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start space-x-4">
                                <div className="w-2 h-2 mt-2 rounded-sm bg-primary-500 shrink-0"></div>
                                <div>
                                    <p className="text-sm text-base-100">User registered</p>
                                    <p className="text-xs text-base-500 mt-1">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
