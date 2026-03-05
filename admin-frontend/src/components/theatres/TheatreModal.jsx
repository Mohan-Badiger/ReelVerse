import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import coreApi from '../../services/coreApi';
import toast from 'react-hot-toast';

const TheatreModal = ({ isOpen, onClose, onSave, theatre }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        screens: 1,
        facilities: ''
    });

    const isEditMode = !!theatre;

    useEffect(() => {
        if (theatre) {
            setFormData({
                name: theatre.name || '',
                location: theatre.location || '',
                screens: theatre.screens || 1,
                facilities: theatre.facilities ? theatre.facilities.join(', ') : ''
            });
        } else {
            setFormData({
                name: '',
                location: '',
                screens: 1,
                facilities: ''
            });
        }
    }, [theatre, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = { ...formData };
            if (payload.facilities) {
                payload.facilities = JSON.stringify(payload.facilities.split(',').map(s => s.trim()).filter(Boolean));
            } else {
                payload.facilities = JSON.stringify([]);
            }

            if (isEditMode) {
                await coreApi.put(`/theatres/${theatre._id}`, payload);
                toast.success('Theatre updated successfully');
            } else {
                await coreApi.post('/theatres', payload);
                toast.success('Theatre added successfully');
            }
            onSave();
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} theatre`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-base-950 border border-base-800 rounded-sm shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-base-800 shrink-0">
                            <h2 className="text-xl font-bold tracking-tight text-white">{isEditMode ? 'Edit Theatre' : 'Add New Theatre'}</h2>
                            <button
                                onClick={handleClose}
                                className="text-base-400 hover:text-white transition-colors"
                                disabled={isLoading}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="flex-1 p-6">
                            <form id="theatre-form" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Theatre Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="box-input w-full"
                                        placeholder="e.g. PVR Cinemas"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Location *</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                        className="box-input w-full"
                                        placeholder="Mumbai, Maharashtra"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Number of Screens *</label>
                                    <input
                                        type="number"
                                        name="screens"
                                        value={formData.screens}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        className="box-input w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-base-400 uppercase tracking-wider mb-1.5">Facilities (Comma separated)</label>
                                    <input
                                        type="text"
                                        name="facilities"
                                        value={formData.facilities}
                                        onChange={handleChange}
                                        className="box-input w-full"
                                        placeholder="IMAX, 3D, Dolby Atmos, Food"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-base-800 bg-base-900 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="px-5 py-2.5 rounded-sm font-medium text-base-300 bg-transparent hover:bg-base-800 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="theatre-form"
                                disabled={isLoading}
                                className="box-button-primary min-w-[120px] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    isEditMode ? 'Update' : 'Save'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TheatreModal;
