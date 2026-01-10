import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Request } from 'express';
import { createError } from '../middleware/errorHandler';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for memory storage
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer upload configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Image upload options for different types
export const uploadOptions = {
  avatar: {
    folder: 'crackzone/avatars',
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    format: 'webp'
  },
  teamLogo: {
    folder: 'crackzone/teams',
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    format: 'webp'
  },
  tournamentBanner: {
    folder: 'crackzone/tournaments',
    width: 800,
    height: 400,
    crop: 'fill',
    quality: 'auto',
    format: 'webp'
  },
  gameScreenshot: {
    folder: 'crackzone/screenshots',
    width: 1200,
    height: 675,
    crop: 'fill',
    quality: 'auto',
    format: 'webp'
  },
  general: {
    folder: 'crackzone/general',
    quality: 'auto',
    format: 'webp'
  }
};

// Upload image to Cloudinary
export const uploadToCloudinary = async (
  buffer: Buffer,
  options: any = uploadOptions.general
): Promise<{ url: string; publicId: string }> => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          ...options,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    throw createError('Image upload failed', 500);
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

// Generate transformation URL
export const generateTransformationUrl = (
  publicId: string,
  transformations: any = {}
): string => {
  return cloudinary.url(publicId, {
    ...transformations,
    secure: true,
  });
};

// Predefined transformations
export const transformations = {
  thumbnail: { width: 150, height: 150, crop: 'fill' },
  small: { width: 300, height: 300, crop: 'fill' },
  medium: { width: 600, height: 600, crop: 'fill' },
  large: { width: 1200, height: 1200, crop: 'fill' },
  banner: { width: 1200, height: 400, crop: 'fill' },
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string | null => {
  try {
    const matches = url.match(/\/v\d+\/(.+)\./);
    return matches ? matches[1] : null;
  } catch (error) {
    return null;
  }
};

// Validate image file
export const validateImageFile = (file: Express.Multer.File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw createError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.', 400);
  }

  if (file.size > maxSize) {
    throw createError('File too large. Maximum size is 10MB.', 400);
  }

  return true;
};

// Batch upload multiple images
export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  options: any = uploadOptions.general
): Promise<Array<{ url: string; publicId: string }>> => {
  const uploadPromises = files.map(file => {
    validateImageFile(file);
    return uploadToCloudinary(file.buffer, options);
  });

  return Promise.all(uploadPromises);
};

// Get optimized image URL with auto format and quality
export const getOptimizedImageUrl = (
  publicId: string,
  width?: number,
  height?: number
): string => {
  return cloudinary.url(publicId, {
    quality: 'auto',
    format: 'auto',
    width,
    height,
    crop: width && height ? 'fill' : undefined,
    secure: true,
  });
};

export { cloudinary };