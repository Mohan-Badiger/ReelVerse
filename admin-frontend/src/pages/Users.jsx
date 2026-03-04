import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import adminApi from '../services/adminApi';
import toast from 'react-hot-toast';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await adminApi.get('/users');
            setUsers(res.data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await adminApi.delete(`/users/${id}`);
            toast.success('User deleted successfully');
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    };

    return (
        <div className="space-y-8 fade-in h-full flex flex-col">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-base-50 mb-2">User Registry</h1>
                    <p className="text-base-400">Manage all registered accounts on ReelVerse.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchUsers} className="box-button-secondary text-sm flex items-center gap-2">
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                    <button className="box-button-primary text-sm">Export CSV</button>
                </div>
            </div>

            <div className="box-panel flex-1 overflow-hidden flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="w-8 h-8 border-4 border-base-800 border-t-primary-500 rounded-sm animate-spin"></div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <AlertCircle className="w-12 h-12 text-base-600 mb-4" />
                        <h3 className="text-lg font-medium text-base-100 mb-1">No users found</h3>
                        <p className="text-base-400">There are currently no registered users.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-base-800/60 bg-base-900/30">
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Name</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Email</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Joined Date</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-800/60">
                                {users.map((user, index) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={user._id}
                                        className="hover:bg-base-800/20 transition-colors group"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-sm bg-base-800 border border-base-700 flex items-center justify-center text-xs font-bold text-primary-400">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-base-100">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-base-300">{user.email}</td>
                                        <td className="py-4 px-6 text-base-400 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-2 text-base-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-sm transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Users;
