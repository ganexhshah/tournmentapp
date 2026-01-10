import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { idValidation, paginationValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import * as rewardController from '../controllers/rewardController';

const router = express.Router();

// Public routes
router.get('/', paginationValidation, asyncHandler(rewardController.getRewards));
router.get('/:id', idValidation, asyncHandler(rewardController.getRewardById));

// Protected routes
router.use(authenticate);

router.get('/user/available', asyncHandler(rewardController.getAvailableRewards));
router.get('/user/claimed', paginationValidation, asyncHandler(rewardController.getClaimedRewards));
router.post('/:id/claim', idValidation, asyncHandler(rewardController.claimReward));

// Admin routes
router.post('/', authorize('ADMIN'), asyncHandler(rewardController.createReward));
router.put('/:id', authorize('ADMIN'), idValidation, asyncHandler(rewardController.updateReward));
router.delete('/:id', authorize('ADMIN'), idValidation, asyncHandler(rewardController.deleteReward));

export default router;