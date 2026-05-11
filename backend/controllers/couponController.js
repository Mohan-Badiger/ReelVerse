import Coupon from '../models/Coupon.js';
import Booking from '../models/Booking.js';

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res, next) => {
    try {
        const { code, discountPercentage, expiryDate, maxUses, couponType, description, minAmount } = req.body;

        const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
        if (couponExists) {
            res.status(400);
            return next(new Error('Coupon with this code already exists'));
        }

        const coupon = new Coupon({
            code: code.toUpperCase(),
            discountPercentage,
            expiryDate,
            maxUses: maxUses || 100,
            couponType: couponType || 'ALL_USERS',
            description: description || '',
            minAmount: minAmount || 0,
        });

        const createdCoupon = await coupon.save();
        res.status(201).json(createdCoupon);
    } catch (error) {
        next(error);
    }
};

// @desc    Get active coupons (for users)
// @route   GET /api/coupons/active
// @access  Public
export const getActiveCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find({
            isActive: true,
            expiryDate: { $gt: new Date() }
        }).sort({ discountPercentage: -1 });
        
        // Filter out coupons that have reached max usage
        const activeCoupons = coupons.filter(c => (c.usedCount || 0) < (c.maxUses || Infinity));
        
        res.json(activeCoupons);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        next(error);
    }
};

// @desc    Validate a coupon
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res, next) => {
    try {
        const { code } = req.body;

        if (!code) {
            res.status(400);
            return next(new Error('Coupon code is required'));
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            res.status(404);
            return next(new Error('Invalid coupon code'));
        }

        if (!coupon.isActive) {
            res.status(400);
            return next(new Error('This coupon is no longer active'));
        }

        if (new Date(coupon.expiryDate) < new Date()) {
            res.status(400);
            return next(new Error('This coupon has expired'));
        }

        if (coupon.usedCount >= coupon.maxUses) {
            res.status(400);
            return next(new Error('This coupon has reached its maximum usage limit'));
        }

        if (coupon.usedBy && coupon.usedBy.includes(req.user._id)) {
            res.status(400);
            return next(new Error('You have already used this coupon'));
        }

        // Specific Type Checks
        if (coupon.couponType === 'FIRST_BOOKING') {
            const hasPastBookings = await Booking.findOne({ 
                user: req.user._id, 
                paymentStatus: 'Completed' 
            });
            if (hasPastBookings) {
                res.status(400);
                return next(new Error('This coupon is only valid for your first booking'));
            }
        }

        // Amount Check
        if (req.body.amount && req.body.amount < coupon.minAmount) {
            res.status(400);
            return next(new Error(`Minimum booking amount of ₹${coupon.minAmount} is required for this coupon`));
        }

        res.json({
            message: 'Coupon is valid',
            discountPercentage: coupon.discountPercentage,
            code: coupon.code,
            couponType: coupon.couponType,
            description: coupon.description
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (coupon) {
            await Coupon.deleteOne({ _id: coupon._id });
            res.json({ message: 'Coupon removed' });
        } else {
            res.status(404);
            return next(new Error('Coupon not found'));
        }
    } catch (error) {
        next(error);
    }
};
