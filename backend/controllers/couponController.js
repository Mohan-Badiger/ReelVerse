import Coupon from '../models/Coupon.js';

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res, next) => {
    try {
        const { code, discountPercentage, expiryDate, maxUses } = req.body;

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
        });

        const createdCoupon = await coupon.save();
        res.status(201).json(createdCoupon);
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

        res.json({
            message: 'Coupon is valid',
            discountPercentage: coupon.discountPercentage,
            code: coupon.code,
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
