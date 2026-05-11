import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true },
        description: { type: String },
        discountPercentage: { type: Number, required: true, min: 1, max: 100 },
        expiryDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        couponType: { 
            type: String, 
            enum: ['ALL_USERS', 'FIRST_BOOKING', 'FESTIVAL'], 
            default: 'ALL_USERS' 
        },
        minAmount: { type: Number, default: 0 },
        maxUses: { type: Number, default: 100 },
        usedCount: { type: Number, default: 0 },
        usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);
