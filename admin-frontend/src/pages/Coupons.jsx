import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle, RefreshCw, Plus, Tag, X } from 'lucide-react';
import coreApi from '../services/coreApi';
import toast from 'react-hot-toast';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountPercentage: 10,
        expiryDate: '',
        maxUses: 100
    });

    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const res = await coreApi.get('/coupons');
            setCoupons(res.data);
        } catch (error) {
            console.error('Failed to load coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await coreApi.delete(`/coupons/${id}`);
            toast.success('Coupon deleted successfully');
            setCoupons(coupons.filter(c => c._id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete coupon');
        }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        try {
            const res = await coreApi.post('/coupons', newCoupon);
            toast.success('Coupon created successfully');
            setCoupons([res.data, ...coupons]);
            setIsAddModalOpen(false);
            setNewCoupon({ code: '', discountPercentage: 10, expiryDate: '', maxUses: 100 });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create coupon');
        }
    };

    return (
        <div className="space-y-8 fade-in h-full flex flex-col relative">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-base-50 mb-2">Discount Coupons</h1>
                    <p className="text-base-400">Manage promotional codes and discounts.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchCoupons} className="box-button-secondary text-sm flex items-center gap-2">
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="box-button-primary text-sm flex items-center gap-2">
                        <Plus size={16} /> New Coupon
                    </button>
                </div>
            </div>

            <div className="box-panel flex-1 overflow-hidden flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="w-8 h-8 border-4 border-base-800 border-t-primary-500 rounded-sm animate-spin"></div>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <Tag className="w-12 h-12 text-base-600 mb-4" />
                        <h3 className="text-lg font-medium text-base-100 mb-1">No coupons found</h3>
                        <p className="text-base-400">Create a coupon to offer discounts to your users.</p>
                        <button onClick={() => setIsAddModalOpen(true)} className="mt-6 box-button-primary text-sm">
                            Create First Coupon
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-base-800/60 bg-base-900/30">
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Code</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Discount</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Usage</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Expiry</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-800/60">
                                {coupons.map((coupon, index) => {
                                    const isExpired = new Date(coupon.expiryDate) < new Date();
                                    const isMaxedOut = coupon.usedCount >= coupon.maxUses;
                                    const isActive = coupon.isActive && !isExpired && !isMaxedOut;

                                    return (
                                        <motion.tr
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={coupon._id}
                                            className="hover:bg-base-800/20 transition-colors group"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-sm bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                                                        <Tag size={14} />
                                                    </div>
                                                    <span className="font-bold text-base-100 tracking-wider font-mono">{coupon.code}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-green-400 font-bold">{coupon.discountPercentage}% OFF</span>
                                            </td>
                                            <td className="py-4 px-6 text-base-300">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-base-800 rounded-full h-1.5 max-w-[60px]">
                                                        <div 
                                                            className="bg-primary-500 h-1.5 rounded-full" 
                                                            style={{ width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs">{coupon.usedCount} / {coupon.maxUses}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-base-400 text-sm">
                                                {new Date(coupon.expiryDate).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="py-4 px-6">
                                                {isActive ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                                                ) : isExpired ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Expired</span>
                                                ) : isMaxedOut ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Limit Reached</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-base-800 text-base-400 border border-base-700">Inactive</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleDelete(coupon._id)}
                                                    className="p-2 text-base-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-sm transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                    title="Delete Coupon"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-base-900 border border-base-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-base-800 bg-base-950/50">
                                <h2 className="text-xl font-bold text-white">Create New Coupon</h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-base-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-base-300 mb-1">Coupon Code (e.g. SUMMER20)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter code"
                                        className="box-input w-full uppercase"
                                        value={newCoupon.code}
                                        onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-base-300 mb-1">Discount %</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="100"
                                            className="box-input w-full"
                                            value={newCoupon.discountPercentage}
                                            onChange={(e) => setNewCoupon({...newCoupon, discountPercentage: Number(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-base-300 mb-1">Max Uses</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            className="box-input w-full"
                                            value={newCoupon.maxUses}
                                            onChange={(e) => setNewCoupon({...newCoupon, maxUses: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-base-300 mb-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="box-input w-full"
                                        value={newCoupon.expiryDate}
                                        onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                                    />
                                </div>
                                
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="box-button-secondary flex-1">
                                        Cancel
                                    </button>
                                    <button type="submit" className="box-button-primary flex-1">
                                        Create Coupon
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Coupons;
