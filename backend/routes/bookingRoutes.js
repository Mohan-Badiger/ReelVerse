import express from 'express';
import {
    checkoutSession,
    confirmBooking,
    getUserBookings,
    getAllBookings,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/').get(protectAdmin, getAllBookings);
router.route('/mybookings').get(protect, getUserBookings);
router.route('/checkout').post(protect, checkoutSession);
router.route('/confirm').post(protect, confirmBooking);

export default router;
