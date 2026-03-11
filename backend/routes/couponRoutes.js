import express from 'express';
import {
    createCoupon,
    getCoupons,
    validateCoupon,
    deleteCoupon,
} from '../controllers/couponController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protectAdmin, getCoupons).post(protectAdmin, createCoupon);
router.route('/validate').post(protect, validateCoupon);
router.route('/:id').delete(protectAdmin, deleteCoupon);

export default router;
