import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { uploadToCloudinary, deleteFromCloudinary, uploadOptions, extractPublicId } from '../services/imageService';

// Get all active banners
export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw createError('Failed to fetch banners', 500);
  }
};

// Get all banners (admin)
export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    console.error('Error fetching all banners:', error);
    throw createError('Failed to fetch banners', 500);
  }
};

// Get banner by ID
export const getBannerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!banner) {
      throw createError('Banner not found', 404);
    }

    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    console.error('Error fetching banner:', error);
    throw createError('Failed to fetch banner', 500);
  }
};

// Create new banner
export const createBanner = async (req: Request, res: Response) => {
  try {
    const {
      title,
      subtitle,
      description,
      actionText,
      actionUrl,
      priority,
      startDate,
      endDate
    } = req.body;

    if (!req.file) {
      throw createError('Banner image is required', 400);
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      {
        ...uploadOptions.general,
        folder: 'crackzone/banners',
        width: 1200,
        height: 400,
        crop: 'fill'
      }
    );

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        description,
        imageUrl: uploadResult.url,
        publicId: uploadResult.publicId,
        actionText,
        actionUrl,
        priority: priority ? parseInt(priority) : 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      data: banner
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    throw createError('Failed to create banner', 500);
  }
};

// Update banner
export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      description,
      actionText,
      actionUrl,
      priority,
      startDate,
      endDate,
      isActive
    } = req.body;

    const existingBanner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!existingBanner) {
      throw createError('Banner not found', 404);
    }

    let imageUrl = existingBanner.imageUrl;
    let publicId = existingBanner.publicId;

    // If new image is uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      if (existingBanner.publicId) {
        await deleteFromCloudinary(existingBanner.publicId);
      }

      // Upload new image
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        {
          ...uploadOptions.general,
          folder: 'crackzone/banners',
          width: 1200,
          height: 400,
          crop: 'fill'
        }
      );

      imageUrl = uploadResult.url;
      publicId = uploadResult.publicId;
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        subtitle,
        description,
        imageUrl,
        publicId,
        actionText,
        actionUrl,
        priority: priority ? parseInt(priority) : existingBanner.priority,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive === 'true' : existingBanner.isActive
      }
    });

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: banner
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    throw createError('Failed to update banner', 500);
  }
};

// Delete banner
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!banner) {
      throw createError('Banner not found', 404);
    }

    // Delete image from Cloudinary
    if (banner.publicId) {
      await deleteFromCloudinary(banner.publicId);
    }

    await prisma.banner.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    throw createError('Failed to delete banner', 500);
  }
};

// Toggle banner status
export const toggleBannerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id }
    });

    if (!banner) {
      throw createError('Banner not found', 404);
    }

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: {
        isActive: !banner.isActive
      }
    });

    res.json({
      success: true,
      message: `Banner ${updatedBanner.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedBanner
    });
  } catch (error) {
    console.error('Error toggling banner status:', error);
    throw createError('Failed to toggle banner status', 500);
  }
};