import express from 'express';
import {
    createMovieReview,
    getMovieReviews,
    deleteMovieReview,
    enhanceReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/enhance', protect, enhanceReview);

router.route('/:movieId')
    .get(getMovieReviews)
    .post(protect, createMovieReview);

router.route('/:id').delete(protectAdmin, deleteMovieReview);

export default router;
