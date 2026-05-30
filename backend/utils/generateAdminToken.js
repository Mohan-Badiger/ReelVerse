import jwt from 'jsonwebtoken';

const generateAdminToken = (res, adminId) => {
    const token = jwt.sign({ adminId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.cookie('adminJwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax', // Allow cross-site cookies in production
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};

export default generateAdminToken;
