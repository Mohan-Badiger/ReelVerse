import express from 'express';
import {
    getAllShows,
    getShowsByMovie,
    getShowById,
    createShow,
    updateShow,
    deleteShow,
} from '../controllers/showController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/').get(getAllShows).post(protectAdmin, createShow);
router.route('/:id').get(getShowById).put(protectAdmin, updateShow).delete(protectAdmin, deleteShow);
router.route('/movie/:movieId').get(getShowsByMovie);

export default router;
