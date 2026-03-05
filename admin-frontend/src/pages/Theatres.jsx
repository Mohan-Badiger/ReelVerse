import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, AlertCircle, RefreshCw, Edit2 } from 'lucide-react';
import coreApi from '../services/coreApi';
import toast from 'react-hot-toast';
import TheatreModal from '../components/theatres/TheatreModal';

const Theatres = () => {
    const [theatres, setTheatres] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [theatreToEdit, setTheatreToEdit] = useState(null);

    const fetchTheatres = async () => {
        setIsLoading(true);
        try {
            const res = await coreApi.get('/theatres');
            setTheatres(res.data);
        } catch (error) {
            toast.error('Failed to load theatres');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTheatres();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this theatre? This action cannot be undone.')) return;
        try {
            await coreApi.delete(`/theatres/${id}`);
            toast.success('Theatre deleted successfully');
            setTheatres(theatres.filter(t => t._id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete theatre');
        }
    };

    const handleOpenAddModal = () => {
        setTheatreToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (theatre) => {
        setTheatreToEdit(theatre);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 fade-in h-full flex flex-col">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-base-50 mb-2">Manage Theatres</h1>
                    <p className="text-base-400">View, add, and edit theatres across locations.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search name or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 bg-base-900 border border-base-800 rounded-sm py-2 px-3 text-sm text-base-50 placeholder-base-500 focus:outline-none focus:border-primary-500 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchTheatres} className="box-button-secondary text-sm flex items-center gap-2">
                            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
                        </button>
                        <button onClick={handleOpenAddModal} className="box-button-primary text-sm flex items-center gap-2">
                            <span className="text-lg leading-none">+</span> Add Theatre
                        </button>
                    </div>
                </div>
            </div>

            <div className="box-panel flex-1 overflow-hidden flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="w-8 h-8 border-4 border-base-800 border-t-primary-500 rounded-sm animate-spin"></div>
                    </div>
                ) : theatres.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <AlertCircle className="w-12 h-12 text-base-600 mb-4" />
                        <h3 className="text-lg font-medium text-base-100 mb-1">No theatres found</h3>
                        <p className="text-base-400">Your network has no theatres. Click "Add Theatre" to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-base-800/60 bg-base-900/30">
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Name</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Location</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider">Screens</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-base-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-800/60">
                                {theatres
                                    .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || (t.location && t.location.toLowerCase().includes(searchTerm.toLowerCase())))
                                    .map((theatre, index) => (
                                        <motion.tr
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={theatre._id}
                                            className="hover:bg-base-800/20 transition-colors group"
                                        >
                                            <td className="py-4 px-6">
                                                <span className="font-semibold text-base-50">{theatre.name}</span>
                                            </td>
                                            <td className="py-4 px-6 text-base-300">
                                                {theatre.location || 'N/A'}
                                            </td>
                                            <td className="py-4 px-6 text-base-300">
                                                <span className="px-2.5 py-1 bg-base-800 border border-base-700 rounded text-xs text-base-300 font-medium">
                                                    {theatre.screens} Screens
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenEditModal(theatre)}
                                                        className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-sm transition-colors"
                                                        title="Edit Theatre"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(theatre._id)}
                                                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-sm transition-colors"
                                                        title="Delete Theatre"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <TheatreModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchTheatres}
                theatre={theatreToEdit}
            />
        </div>
    );
};
export default Theatres;
