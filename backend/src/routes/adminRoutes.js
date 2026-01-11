import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getStats, getUsers, getVideos } from '../controllers/adminController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/videos', getVideos);

export default router;
