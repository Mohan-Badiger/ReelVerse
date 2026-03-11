import express from 'express';
import {
    getAllShows,
    getShowsByMovie,
    getShowById,
    createShow,
    updateShow,
    deleteShow,
    createBulkShows,
    lockSeats,
} from '../controllers/showController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getAllShows).post(protectAdmin, createShow);
router.route('/bulk-create').post(protectAdmin, createBulkShows);
router.route('/:id').get(getShowById).put(protectAdmin, updateShow).delete(protectAdmin, deleteShow);
router.route('/:id/lock-seats').post(protect, lockSeats);
router.route('/movie/:movieId').get(getShowsByMovie);

export default router;
