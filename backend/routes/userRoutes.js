import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword,
    addMovieToWatchlist,
    removeMovieFromWatchlist
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.post('/watchlist/:movieId', protect, addMovieToWatchlist);
router.delete('/watchlist/:movieId', protect, removeMovieFromWatchlist);

export default router;
