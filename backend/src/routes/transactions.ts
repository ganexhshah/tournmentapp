import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { idValidation, paginationValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import * as transactionController from '../controllers/transactionController';

const router = express.Router();

// Protected routes only
router.use(authenticate);

router.get('/', paginationValidation, asyncHandler(transactionController.getTransactions));
router.get('/:id', idValidation, asyncHandler(transactionController.getTransactionById));
router.post('/deposit', asyncHandler(transactionController.createDeposit));
router.post('/withdrawal', asyncHandler(transactionController.createWithdrawal));

// Admin routes
router.get('/admin/all', authorize('ADMIN'), paginationValidation, asyncHandler(transactionController.getAllTransactions));
router.post('/:id/approve', authorize('ADMIN'), idValidation, asyncHandler(transactionController.approveTransaction));
router.post('/:id/reject', authorize('ADMIN'), idValidation, asyncHandler(transactionController.rejectTransaction));

export default router;