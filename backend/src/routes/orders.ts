import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { idValidation, paginationValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import * as orderController from '../controllers/orderController';

const router = express.Router();

// Protected routes only
router.use(authenticate);

router.get('/', paginationValidation, asyncHandler(orderController.getOrders));
router.get('/:id', idValidation, asyncHandler(orderController.getOrderById));
router.post('/', asyncHandler(orderController.createOrder));
router.post('/:id/cancel', idValidation, asyncHandler(orderController.cancelOrder));

// Admin routes
router.get('/admin/all', authorize('ADMIN'), paginationValidation, asyncHandler(orderController.getAllOrders));
router.post('/:id/confirm', authorize('ADMIN'), idValidation, asyncHandler(orderController.confirmOrder));
router.post('/:id/ship', authorize('ADMIN'), idValidation, asyncHandler(orderController.shipOrder));
router.post('/:id/deliver', authorize('ADMIN'), idValidation, asyncHandler(orderController.deliverOrder));

export default router;