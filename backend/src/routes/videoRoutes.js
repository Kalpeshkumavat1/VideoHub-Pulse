import express from 'express';
import {
  uploadVideo,
  getVideos,
  getVideo,
  updateVideo,
  deleteVideo,
  streamVideo,
  getVideoThumbnail,
  getProcessingStatus
} from '../controllers/videoController.js';
import { protect } from '../middleware/authMiddleware.js';
import { 
  canUploadVideo, 
  canAccessVideo, 
  canModifyVideo 
} from '../middleware/rbacMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.post('/upload', canUploadVideo, uploadRateLimiter, upload.single('video'), uploadVideo);

router.get('/', getVideos);

router.get('/:id', canAccessVideo, getVideo);

router.get('/:id/status', canAccessVideo, getProcessingStatus);

router.get('/:id/stream', canAccessVideo, streamVideo);

router.get('/:id/thumbnail', canAccessVideo, getVideoThumbnail);

router.put('/:id', canModifyVideo, updateVideo);

router.delete('/:id', canModifyVideo, deleteVideo);

export default router;
