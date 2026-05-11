import express from 'express';
import multer from 'multer';
import {
    getMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    getUpcomingMovies,
    addReminder
} from '../controllers/movieController.js';
import { protectAdmin } from '../middleware/adminMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer();

router
    .route('/')
    .get(getMovies)
    .post(protectAdmin, upload.single('poster'), createMovie);

router.get('/upcoming', getUpcomingMovies);

router
    .route('/:id')
    .get(getMovieById)
    .put(protectAdmin, upload.single('poster'), updateMovie)
    .delete(protectAdmin, deleteMovie);

router.post('/:id/remind', protect, addReminder);

export default router;
