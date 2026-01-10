import express from 'express';
import { authenticate } from '../middleware/auth';
import { idValidation, paginationValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import * as notificationController from '../controllers/notificationController';

const router = express.Router();

// Protected routes only
router.use(authenticate);

router.get('/', paginationValidation, asyncHandler(notificationController.getNotifications));
router.get('/unread-count', asyncHandler(notificationController.getUnreadCount));
router.post('/:id/read', idValidation, asyncHandler(notificationController.markAsRead));
router.post('/read-all', asyncHandler(notificationController.markAllAsRead));
router.delete('/:id', idValidation, asyncHandler(notificationController.deleteNotification));
router.delete('/clear-all', asyncHandler(notificationController.clearAllNotifications));

export default router;