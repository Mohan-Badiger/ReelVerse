import express from 'express';
import {
    getTheatres,
    createTheatre,
    updateTheatre,
    deleteTheatre,
} from '../controllers/theatreController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router
    .route('/')
    .get(getTheatres)
    .post(protectAdmin, createTheatre);

router
    .route('/:id')
    .put(protectAdmin, updateTheatre)
    .delete(protectAdmin, deleteTheatre);

export default router;
