import express from 'express';
import { authenticate } from '../middleware/auth';
import { uploadRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';
import { upload } from '../services/imageService';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';
import * as profileController from '../controllers/profileController';

const router = express.Router();

// Validation middleware
const setupProfileValidation = [
  body('avatarType')
    .isIn(['upload', 'preset', 'none'])
    .withMessage('Avatar type must be upload, preset, or none'),
  handleValidationErrors
];

const gameProfileValidation = [
  body('gameId')
    .notEmpty()
    .withMessage('Game ID is required'),
  body('gameName')
    .notEmpty()
    .withMessage('Game name is required'),
  body('gameUID')
    .notEmpty()
    .withMessage('Game UID is required'),
  body('inGameName')
    .notEmpty()
    .withMessage('In-game name is required'),
  handleValidationErrors
];

// Public routes
router.get('/games', asyncHandler(profileController.getAvailableGames));

// Protected routes
router.use(authenticate);

// Profile setup
router.post('/setup', 
  uploadRateLimiter, 
  upload.single('avatar'), 
  setupProfileValidation, 
  asyncHandler(profileController.setupProfile)
);

// Game profile management
router.post('/game-setup', 
  gameProfileValidation, 
  asyncHandler(profileController.setupGameProfile)
);

router.get('/games/my', asyncHandler(profileController.getUserGameProfiles));

router.put('/games/:profileId', asyncHandler(profileController.updateGameProfile));

router.delete('/games/:profileId', asyncHandler(profileController.deleteGameProfile));

// Onboarding
router.get('/onboarding/status', asyncHandler(profileController.getOnboardingStatus));

router.post('/onboarding/complete', asyncHandler(profileController.completeOnboarding));

export default router;