import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Protect admin routes
export const protectAdmin = async (req, res, next) => {
    let token;

    // Admin token is specifically read from adminJwt cookie
    token = req.cookies.adminJwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the admin based on explicit adminId token payload
            req.admin = await Admin.findById(decoded.adminId).select('-password');

            if (!req.admin) {
                res.status(401);
                return next(new Error('Admin no longer exists.'));
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            return next(new Error('Not authorized, token failed'));
        }
    } else {
        res.status(401);
        return next(new Error('Not authorized, no admin token'));
    }
};
