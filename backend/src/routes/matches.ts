import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { idValidation, paginationValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import * as matchController from '../controllers/matchController';

const router = express.Router();

// Public routes
router.get('/', paginationValidation, asyncHandler(matchController.getMatches));
router.get('/:id', idValidation, asyncHandler(matchController.getMatchById));

// Protected routes
router.use(authenticate);

router.post('/', authorize('ADMIN', 'MODERATOR'), asyncHandler(matchController.createMatch));
router.put('/:id', authorize('ADMIN', 'MODERATOR'), idValidation, asyncHandler(matchController.updateMatch));
router.delete('/:id', authorize('ADMIN', 'MODERATOR'), idValidation, asyncHandler(matchController.deleteMatch));
router.post('/:id/start', authorize('ADMIN', 'MODERATOR'), idValidation, asyncHandler(matchController.startMatch));
router.post('/:id/result', idValidation, asyncHandler(matchController.submitResult));
router.get('/:id/participants', idValidation, asyncHandler(matchController.getMatchParticipants));

export default router;