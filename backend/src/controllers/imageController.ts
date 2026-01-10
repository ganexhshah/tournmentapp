import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { 
  uploadToCloudinary, 
  deleteFromCloudinary, 
  uploadOptions, 
  validateImageFile, 
  extractPublicId,
  uploadMultipleImages,
  getOptimizedImageUrl
} from '../services/imageService';

// Upload team logo
export const uploadTeamLogo = async (req: AuthRequest, res: Response) => {
  const { teamId } = req.params;
  const userId = req.user.id;

  if (!req.file) {
    throw createError('No image file provided', 400);
  }

  // Check if user is team leader
  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId,
      userId,
      role: 'LEADER'
    }
  });

  if (!membership) {
    throw createError('Only team leaders can update team logo', 403);
  }

  try {
    validateImageFile(req.file);
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, uploadOptions.teamLogo);

    // Get current team to check for existing logo
    const currentTeam = await prisma.team.findUnique({
      where: { id: teamId },
      select: { avatar: true }
    });

    // Delete old logo if exists
    if (currentTeam?.avatar) {
      const oldPublicId = extractPublicId(currentTeam.avatar);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }
    }

    // Update team logo
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: { avatar: url },
      select: {
        id: true,
        name: true,
        avatar: true
      }
    });

    res.json({
      message: 'Team logo uploaded successfully',
      team: updatedTeam,
      imageUrl: url,
      publicId
    });
  } catch (error) {
    throw createError('Team logo upload failed', 500);
  }
};

// Upload tournament banner
export const uploadTournamentBanner = async (req: AuthRequest, res: Response) => {
  const { tournamentId } = req.params;

  if (!req.file) {
    throw createError('No image file provided', 400);
  }

  // Check if user is admin/moderator
  if (req.user.role !== 'ADMIN' && req.user.role !== 'MODERATOR') {
    throw createError('Only admins can upload tournament banners', 403);
  }

  try {
    validateImageFile(req.file);
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, uploadOptions.tournamentBanner);

    // Note: You might want to add a banner field to the Tournament model
    // For now, we'll return the URL for frontend to handle

    res.json({
      message: 'Tournament banner uploaded successfully',
      imageUrl: url,
      publicId,
      optimizedUrls: {
        thumbnail: getOptimizedImageUrl(publicId, 300, 150),
        medium: getOptimizedImageUrl(publicId, 600, 300),
        large: getOptimizedImageUrl(publicId, 1200, 600)
      }
    });
  } catch (error) {
    throw createError('Tournament banner upload failed', 500);
  }
};

// Upload game screenshots
export const uploadGameScreenshots = async (req: AuthRequest, res: Response) => {
  const { matchId } = req.params;

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw createError('No image files provided', 400);
  }

  // Check if user is participant in the match
  const participant = await prisma.matchParticipant.findFirst({
    where: {
      matchId,
      userId: req.user.id
    }
  });

  if (!participant && req.user.role !== 'ADMIN' && req.user.role !== 'MODERATOR') {
    throw createError('Only match participants or admins can upload screenshots', 403);
  }

  try {
    const uploadedImages = await uploadMultipleImages(req.files, uploadOptions.gameScreenshot);

    res.json({
      message: 'Screenshots uploaded successfully',
      images: uploadedImages.map(img => ({
        url: img.url,
        publicId: img.publicId,
        optimizedUrls: {
          thumbnail: getOptimizedImageUrl(img.publicId, 300, 169),
          medium: getOptimizedImageUrl(img.publicId, 600, 338),
          large: getOptimizedImageUrl(img.publicId, 1200, 675)
        }
      }))
    });
  } catch (error) {
    throw createError('Screenshot upload failed', 500);
  }
};

// Delete image
export const deleteImage = async (req: AuthRequest, res: Response) => {
  const { publicId } = req.params;

  if (!publicId) {
    throw createError('Public ID is required', 400);
  }

  try {
    const success = await deleteFromCloudinary(publicId);
    
    if (success) {
      res.json({ message: 'Image deleted successfully' });
    } else {
      throw createError('Failed to delete image', 500);
    }
  } catch (error) {
    throw createError('Image deletion failed', 500);
  }
};

// Get image with transformations
export const getImageWithTransformations = async (req: Request, res: Response) => {
  const { publicId } = req.params;
  const { width, height, quality, format } = req.query;

  if (!publicId) {
    throw createError('Public ID is required', 400);
  }

  try {
    const transformedUrl = getOptimizedImageUrl(
      publicId,
      width ? parseInt(width as string) : undefined,
      height ? parseInt(height as string) : undefined
    );

    res.json({
      originalPublicId: publicId,
      transformedUrl,
      parameters: {
        width: width || 'auto',
        height: height || 'auto',
        quality: quality || 'auto',
        format: format || 'auto'
      }
    });
  } catch (error) {
    throw createError('Image transformation failed', 500);
  }
};