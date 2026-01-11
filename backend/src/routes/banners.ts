import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../services/imageService';
import {
  getBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus
} from '../controllers/bannerController';

const router = express.Router();

// Public routes
router.get('/', getBanners);

// Protected routes (admin only)
router.get('/admin', authenticate, authorize('ADMIN'), getAllBanners);
router.get('/:id', authenticate, authorize('ADMIN'), getBannerById);
router.post('/', authenticate, authorize('ADMIN'), upload.single('image'), createBanner);
router.put('/:id', authenticate, authorize('ADMIN'), upload.single('image'), updateBanner);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteBanner);
router.patch('/:id/toggle', authenticate, authorize('ADMIN'), toggleBannerStatus);

export default router;