import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Film, Ticket, TrendingUp, RefreshCw, Clock } from 'lucide-react';
import adminApi from '../services/adminApi';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const MetricCard = ({ title, value, icon: Icon, trend }) => (
    <div className="box-card hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-base-800 rounded-sm">
                <Icon className="w-6 h-6 text-primary-400" />
            </div>
            {trend !== undefined && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-sm ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-base-500/10 text-base-400'}`}>
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

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-base-900 border border-base-800 p-4 rounded-sm shadow-xl">
                <p className="text-base-300 font-medium mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
                        {entry.name === 'revenue' ? `Revenue: ₹${entry.value}` : `Bookings: ${entry.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Dashboard = () => {
    const [metrics, setMetrics] = useState({
        users: 0,
        movies: 0,
        bookings: 0,
        revenue: 0
    });
    const [chartData, setChartData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
        if (isManualRefresh) setIsRefreshing(true);
        try {
            const res = await adminApi.get('/dashboard');
            setMetrics(res.data.metrics);
            setChartData(res.data.chartData || []);
            setRecentActivity(res.data.recentActivity || []);
        } catch (error) {
            console.error('Failed to load dashboard metrics:', error);
        } finally {
            setIsLoading(false);
            if (isManualRefresh) setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        fetchDashboardData();

        // Auto-refresh every 30 seconds
        const intervalId = setInterval(() => {
            fetchDashboardData();
        }, 30000);

        return () => clearInterval(intervalId);
    }, [fetchDashboardData]);

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
        <div className="space-y-8 fade-in pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-base-50 mb-2">Overview</h1>
                    <p className="text-base-400">Welcome back, Super Admin. Here is what's happening today.</p>
                </div>
                <button
                    onClick={() => fetchDashboardData(true)}
                    disabled={isRefreshing}
                    className="box-button-secondary text-sm flex items-center gap-2"
                >
                    <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Users" value={metrics.users} icon={Users} trend={+12.5} />
                <MetricCard title="Active Movies" value={metrics.movies} icon={Film} trend={0} />
                <MetricCard title="Total Bookings" value={metrics.bookings} icon={Ticket} trend={+5.2} />
                <MetricCard title="Total Revenue" value={`₹${metrics.revenue.toLocaleString()}`} icon={TrendingUp} trend={+18.1} />
            </div>

            {/* Charts & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 7-Day Revenue Trend Chart */}
                <div className="lg:col-span-2 box-panel p-6">
                    <h3 className="text-lg font-semibold text-base-50 mb-6">7-Day Revenue Trend</h3>
                    <div className="h-[350px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#a1a1aa"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#a1a1aa"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₹${value}`}
                                        dx={-10}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#818cf8"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        activeDot={{ r: 6, fill: '#818cf8', stroke: '#18181b', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-base-500">
                                No chart data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="box-panel p-6 flex flex-col h-[460px]">
                    <h3 className="text-lg font-semibold text-base-50 mb-6 flex items-center gap-2">
                        <Clock size={18} className="text-primary-400" /> Recent Activity
                    </h3>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity) => (
                                <div key={activity._id} className="relative pl-6 before:content-[''] before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-[2px] before:bg-base-800 last:before:hidden">
                                    <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-4 border-base-950
                                        ${activity.type === 'booking' ? 'bg-primary-500' : 'bg-emerald-500'}
                                    `}>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-base-100 leading-snug">
                                            {activity.message}
                                        </p>
                                        <p className="text-xs text-base-500 mt-1.5">
                                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-base-500">
                                <Users size={32} className="opacity-20 mb-3" />
                                <p>No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
