import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { cache } from '../config/redis';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { 
  uploadToCloudinary, 
  deleteFromCloudinary, 
  uploadOptions, 
  validateImageFile, 
  extractPublicId 
} from '../services/imageService';

export const getUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const sortBy = req.query.sortBy as string || 'createdAt';
  const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';
  const search = req.query.search as string;

  const skip = (page - 1) * limit;

  const where: any = {
    isActive: true
  };

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        gamerTag: true,
        level: true,
        experience: true,
        createdAt: true
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit
    }),
    prisma.user.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  res.json({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Try to get from cache first
  const cacheKey = `user:profile:${id}`;
  let user = await cache.get(cacheKey);

  if (!user) {
    user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        gamerTag: true,
        level: true,
        experience: true,
        coins: true,
        isVerified: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            country: true,
            timezone: true
          }
        },
        _count: {
          select: {
            teams: true,
            tournaments: true,
            matches: true
          }
        }
      }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, user, 300);
  }

  res.json({ user });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { firstName, lastName, bio, country, timezone, gamerTag } = req.body;

  // Check if gamerTag is unique (if provided)
  if (gamerTag) {
    const existingUser = await prisma.user.findFirst({
      where: {
        gamerTag,
        NOT: { id: userId }
      }
    });

    if (existingUser) {
      throw createError('Gamer tag already taken', 409);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      gamerTag,
      profile: {
        upsert: {
          create: {
            bio,
            country,
            timezone
          },
          update: {
            bio,
            country,
            timezone
          }
        }
      }
    },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      avatar: true,
      gamerTag: true,
      level: true,
      experience: true,
      coins: true,
      profile: {
        select: {
          bio: true,
          country: true,
          timezone: true
        }
      }
    }
  });

  // Update cache
  await cache.set(`user:${userId}`, updatedUser, 3600);
  await cache.del(`user:profile:${userId}`);

  res.json({
    message: 'Profile updated successfully',
    user: updatedUser
  });
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  if (!req.file) {
    throw createError('No image file provided', 400);
  }

  try {
    // Validate and upload image
    validateImageFile(req.file);
    const { url, publicId } = await uploadToCloudinary(req.file.buffer, uploadOptions.avatar);

    // Get current user to check for existing avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true }
    });

    // Delete old avatar if exists
    if (currentUser?.avatar) {
      const oldPublicId = extractPublicId(currentUser.avatar);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }
    }

    // Update user avatar
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: url },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true
      }
    });

    // Update cache
    await cache.del(`user:${userId}`);
    await cache.del(`user:profile:${userId}`);

    res.json({
      message: 'Avatar uploaded successfully',
      user: updatedUser,
      imageUrl: url,
      publicId
    });
  } catch (error) {
    throw createError('Avatar upload failed', 500);
  }
};

export const deleteAvatar = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  await prisma.user.update({
    where: { id: userId },
    data: { avatar: null }
  });

  // Update cache
  await cache.del(`user:${userId}`);
  await cache.del(`user:profile:${userId}`);

  res.json({ message: 'Avatar deleted successfully' });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, isActive, isVerified } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      role,
      isActive,
      isVerified
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      isVerified: true,
      updatedAt: true
    }
  });

  // Clear cache
  await cache.del(`user:${id}`);
  await cache.del(`user:profile:${id}`);

  res.json({
    message: 'User updated successfully',
    user: updatedUser
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Soft delete by deactivating the user
  await prisma.user.update({
    where: { id },
    data: { isActive: false }
  });

  // Clear cache
  await cache.del(`user:${id}`);
  await cache.del(`user:profile:${id}`);

  res.json({ message: 'User deleted successfully' });
};

export const banUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  await prisma.user.update({
    where: { id },
    data: { isActive: false }
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: id,
      title: 'Account Suspended',
      message: reason || 'Your account has been suspended.',
      type: 'SYSTEM'
    }
  });

  // Clear cache
  await cache.del(`user:${id}`);
  await cache.del(`user:profile:${id}`);

  res.json({ message: 'User banned successfully' });
};

export const unbanUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.user.update({
    where: { id },
    data: { isActive: true }
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: id,
      title: 'Account Restored',
      message: 'Your account has been restored.',
      type: 'SYSTEM'
    }
  });

  // Clear cache
  await cache.del(`user:${id}`);
  await cache.del(`user:profile:${id}`);

  res.json({ message: 'User unbanned successfully' });
};