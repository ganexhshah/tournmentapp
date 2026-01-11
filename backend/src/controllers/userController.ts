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
import bcrypt from 'bcryptjs';

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  try {
    // Try to get from cache first
    const cacheKey = `user:${userId}`;
    let user = await cache.get(cacheKey);

    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          gamerTag: true,
          level: true,
          experience: true,
          coins: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          profile: {
            select: {
              bio: true,
              country: true,
              timezone: true
            }
          }
        }
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      // Cache for 1 hour
      await cache.set(cacheKey, user, 3600);
    }

    res.json({ user });
  } catch (error) {
    throw createError('Failed to get current user', 500);
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { email, username, password, firstName, lastName, gamerTag, role = 'USER' } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username },
        ...(gamerTag ? [{ gamerTag }] : [])
      ]
    }
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw createError('Email already registered', 409);
    }
    if (existingUser.username === username) {
      throw createError('Username already taken', 409);
    }
    if (gamerTag && existingUser.gamerTag === gamerTag) {
      throw createError('Gamer tag already taken', 409);
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      gamerTag,
      role,
      isVerified: true, // Admin created users are auto-verified
      profile: {
        create: {}
      }
    },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      avatar: true,
      gamerTag: true,
      level: true,
      experience: true,
      coins: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true
    }
  });

  res.status(201).json({
    message: 'User created successfully',
    user
  });
};

export const getUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const sortBy = req.query.sortBy as string || 'createdAt';
  const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';
  const search = req.query.search as string;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { gamerTag: { contains: search, mode: 'insensitive' } }
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
        email: true,
        phone: true,
        avatar: true,
        gamerTag: true,
        level: true,
        experience: true,
        coins: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        profile: {
          select: {
            bio: true,
            country: true,
            timezone: true,
            dateOfBirth: true
          }
        },
        _count: {
          select: {
            teams: true,
            tournaments: true,
            matches: true,
            transactions: true,
            orders: true
          }
        },
        teams: {
          select: {
            id: true,
            role: true,
            joinedAt: true,
            team: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          take: 5
        },
        tournaments: {
          select: {
            id: true,
            registeredAt: true,
            tournament: {
              select: {
                id: true,
                title: true,
                game: true,
                status: true
              }
            }
          },
          take: 5,
          orderBy: {
            registeredAt: 'desc'
          }
        },
        matches: {
          select: {
            id: true,
            score: true,
            position: true,
            match: {
              select: {
                id: true,
                title: true,
                game: true,
                status: true,
                scheduledAt: true
              }
            }
          },
          take: 5,
          orderBy: {
            match: {
              scheduledAt: 'desc'
            }
          }
        }
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
        email: true,
        phone: true,
        avatar: true,
        gamerTag: true,
        level: true,
        experience: true,
        coins: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        profile: {
          select: {
            bio: true,
            country: true,
            timezone: true,
            dateOfBirth: true,
            preferences: true
          }
        },
        _count: {
          select: {
            teams: true,
            tournaments: true,
            matches: true,
            transactions: true,
            notifications: true,
            rewards: true,
            orders: true
          }
        },
        teams: {
          select: {
            id: true,
            role: true,
            joinedAt: true,
            team: {
              select: {
                id: true,
                name: true,
                description: true,
                avatar: true,
                maxMembers: true,
                _count: {
                  select: {
                    members: true
                  }
                }
              }
            }
          }
        },
        tournaments: {
          select: {
            id: true,
            registeredAt: true,
            tournament: {
              select: {
                id: true,
                title: true,
                description: true,
                game: true,
                format: true,
                status: true,
                maxParticipants: true,
                entryFee: true,
                prizePool: true,
                startDate: true,
                endDate: true
              }
            }
          },
          orderBy: {
            registeredAt: 'desc'
          }
        },
        matches: {
          select: {
            id: true,
            score: true,
            position: true,
            match: {
              select: {
                id: true,
                title: true,
                game: true,
                status: true,
                round: true,
                scheduledAt: true,
                startedAt: true,
                endedAt: true,
                result: true
              }
            }
          },
          orderBy: {
            match: {
              scheduledAt: 'desc'
            }
          }
        },
        transactions: {
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        rewards: {
          select: {
            id: true,
            claimed: true,
            claimedAt: true,
            createdAt: true,
            reward: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                value: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        orders: {
          select: {
            id: true,
            items: true,
            totalAmount: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
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
  const { permanent } = req.query; // Optional query parameter for permanent deletion

  try {
    if (permanent === 'true') {
      // Hard delete - permanently remove user and all related data
      await prisma.$transaction(async (tx) => {
        // Delete related data first (due to foreign key constraints)
        await tx.notification.deleteMany({ where: { userId: id } });
        await tx.transaction.deleteMany({ where: { userId: id } });
        await tx.userReward.deleteMany({ where: { userId: id } });
        await tx.order.deleteMany({ where: { userId: id } });
        await tx.teamMember.deleteMany({ where: { userId: id } });
        await tx.tournamentParticipant.deleteMany({ where: { userId: id } });
        await tx.matchParticipant.deleteMany({ where: { userId: id } });
        await tx.gameProfile.deleteMany({ where: { userId: id } });
        await tx.userProfile.deleteMany({ where: { userId: id } });
        
        // Finally delete the user
        await tx.user.delete({ where: { id } });
      });
    } else {
      // Soft delete - just deactivate the user
      await prisma.user.update({
        where: { id },
        data: { 
          isActive: false,
          updatedAt: new Date()
        }
      });
    }

    // Clear cache
    await cache.del(`user:${id}`);
    await cache.del(`user:profile:${id}`);

    res.json({ 
      message: permanent === 'true' 
        ? 'User permanently deleted successfully' 
        : 'User deactivated successfully' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    throw createError('Failed to delete user', 500);
  }
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