import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { uploadRateLimiter } from '../middleware/rateLimiter';
import { idValidation } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { upload } from '../services/imageService';
import * as imageController from '../controllers/imageController';

const router = express.Router();

// Public routes
router.get('/transform/:publicId', asyncHandler(imageController.getImageWithTransformations));

// Protected routes
router.use(authenticate);

// Team logo upload
router.post('/team/:teamId/logo', 
  uploadRateLimiter, 
  idValidation, 
  upload.single('logo'), 
  asyncHandler(imageController.uploadTeamLogo)
);

// Tournament banner upload (Admin/Moderator only)
router.post('/tournament/:tournamentId/banner', 
  authorize('ADMIN', 'MODERATOR'),
  uploadRateLimiter, 
  idValidation, 
  upload.single('banner'), 
  asyncHandler(imageController.uploadTournamentBanner)
);

// Game screenshots upload (multiple files)
router.post('/match/:matchId/screenshots', 
  uploadRateLimiter, 
  idValidation, 
  upload.array('screenshots', 5), // Max 5 screenshots
  asyncHandler(imageController.uploadGameScreenshots)
);

// Delete image
router.delete('/:publicId', 
  asyncHandler(imageController.deleteImage)
);

export default router;