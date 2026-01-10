import express from 'express';
import { authRateLimiter } from '../middleware/rateLimiter';
import { 
  registerValidation, 
  loginValidation, 
  forgotPasswordValidation, 
  resetPasswordValidation 
} from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import * as authController from '../controllers/authController';

const router = express.Router();

// Public routes
router.post('/register', authRateLimiter, registerValidation, asyncHandler(authController.register));
router.post('/login', authRateLimiter, loginValidation, asyncHandler(authController.login));
router.post('/forgot-password', authRateLimiter, forgotPasswordValidation, asyncHandler(authController.forgotPassword));
router.post('/reset-password', authRateLimiter, resetPasswordValidation, asyncHandler(authController.resetPassword));
router.post('/verify-email', authRateLimiter, asyncHandler(authController.verifyEmail));
router.post('/resend-verification', authRateLimiter, asyncHandler(authController.resendVerification));

// Protected routes
router.post('/refresh-token', authenticate, asyncHandler(authController.refreshToken));
router.post('/logout', authenticate, asyncHandler(authController.logout));
router.get('/me', authenticate, asyncHandler(authController.getProfile));
router.post('/change-password', authenticate, asyncHandler(authController.changePassword));

export default router;