import express from 'express';
import { loginAdmin, logoutAdmin, getAdminDashboard, getAllUsers, deleteUser } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/dashboard', protectAdmin, getAdminDashboard);
router.get('/users', protectAdmin, getAllUsers);
router.delete('/users/:id', protectAdmin, deleteUser);

export default router;
