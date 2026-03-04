import express from 'express';
import {
    getShowsByMovie,
    getShowById,
    createShow,
    deleteShow,
} from '../controllers/showController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/').post(protectAdmin, createShow);
router.route('/:id').get(getShowById).delete(protectAdmin, deleteShow);
router.route('/movie/:movieId').get(getShowsByMovie);

export default router;
