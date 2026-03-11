import express from 'express';
import {
    getUserBookings,
    getAllBookings,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/').get(protectAdmin, getAllBookings);
router.route('/mybookings').get(protect, getUserBookings);

export default router;
