import express from 'express';
import {
    createMovieReview,
    getMovieReviews,
    deleteMovieReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/:movieId')
    .get(getMovieReviews)
    .post(protect, createMovieReview);

router.route('/:id').delete(protectAdmin, deleteMovieReview);

export default router;
