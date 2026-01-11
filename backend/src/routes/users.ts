import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { updateProfileValidation, idValidation, paginationValidation, registerValidation } from '../middleware/validation';
import { uploadRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';
import { upload } from '../services/imageService';
import * as userController from '../controllers/userController';

const router = express.Router();

// Public routes
router.get('/', paginationValidation, asyncHandler(userController.getUsers));
router.get('/:id', idValidation, asyncHandler(userController.getUserById));

// Protected routes
router.use(authenticate);

router.put('/profile', updateProfileValidation, asyncHandler(userController.updateProfile));
router.post('/upload-avatar', uploadRateLimiter, upload.single('avatar'), asyncHandler(userController.uploadAvatar));
router.delete('/avatar', asyncHandler(userController.deleteAvatar));

// Admin only routes
router.post('/', authorize('ADMIN'), registerValidation, asyncHandler(userController.createUser));
router.put('/:id', authorize('ADMIN'), idValidation, asyncHandler(userController.updateUser));
router.delete('/:id', authorize('ADMIN'), idValidation, asyncHandler(userController.deleteUser));
router.post('/:id/ban', authorize('ADMIN', 'MODERATOR'), idValidation, asyncHandler(userController.banUser));
router.post('/:id/unban', authorize('ADMIN', 'MODERATOR'), idValidation, asyncHandler(userController.unbanUser));

export default router;