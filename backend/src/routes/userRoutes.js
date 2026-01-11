import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { canManageUsers } from '../middleware/rbacMiddleware.js';
import { profileRateLimiter } from '../middleware/rateLimiter.js';
import { 
  getProfile, 
  updateProfile,
  createUser,
  getUsers,
  getUser,
  updateUserRole,
  updateUserStatus,
  deleteUser
} from '../controllers/userController.js';

const router = express.Router();

router.use(protect);

router.get('/profile', profileRateLimiter, getProfile);
router.put('/profile', updateProfile);

router.post('/', canManageUsers, createUser);
router.get('/', canManageUsers, getUsers);
router.get('/:id', canManageUsers, getUser);
router.put('/:id/role', canManageUsers, updateUserRole);
router.put('/:id/status', canManageUsers, updateUserStatus);
router.delete('/:id', canManageUsers, deleteUser);

export default router;
