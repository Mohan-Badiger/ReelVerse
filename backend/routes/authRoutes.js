import express from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    verifyEmail,
    sendVerification
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/verify-email', verifyEmail);
router.post('/send-verification', sendVerification);

export default router;
