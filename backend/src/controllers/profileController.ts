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

// Setup profile with avatar
export const setupProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { avatarType, avatarData } = req.body;

  let avatarUrl = null;

  try {
    // Handle avatar upload if provided
    if (avatarType === 'upload' && req.file) {
      validateImageFile(req.file);
      const { url } = await uploadToCloudinary(req.file.buffer, uploadOptions.avatar);
      avatarUrl = url;
    } else if (avatarType === 'preset' && avatarData) {
      // For preset avatars, we can store the avatar data or generate a URL
      avatarUrl = avatarData;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: avatarUrl,
        profileSetup: true,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        profileSetup: true,
        gameSetup: true,
        onboardingComplete: true
      }
    });

    // Clear cache
    await cache.del(`user:${userId}`);
    await cache.del(`user:profile:${userId}`);

    res.json({
      message: 'Profile setup completed successfully',
      user: updatedUser
    });
  } catch (error) {
    throw createError('Profile setup failed', 500);
  }
};

// Get available games
export const getAvailableGames = async (req: Request, res: Response) => {
  const games = [
    {
      id: 'freefire',
      name: 'Free Fire',
      description: 'Battle Royale Survival Game',
      color: '#FF6B35',
      icon: 'flame-outline',
      isActive: true
    },
    {
      id: 'pubg',
      name: 'PUBG Mobile',
      description: 'Battle Royale Game',
      color: '#FF8C42',
      icon: 'game-controller-outline',
      isActive: true
    },
    {
      id: 'codm',
      name: 'Call of Duty Mobile',
      description: 'FPS Battle Royale',
      color: '#FFB366',
      icon: 'skull-outline',
      isActive: true
    },
    {
      id: 'valorant',
      name: 'Valorant Mobile',
      description: 'Tactical FPS',
      color: '#E74C3C',
      icon: 'flash-outline',
      isActive: true
    },
    {
      id: 'apex',
      name: 'Apex Legends Mobile',
      description: 'Hero-based Battle Royale',
      color: '#F39C12',
      icon: 'shield-outline',
      isActive: true
    },
    {
      id: 'mlbb',
      name: 'Mobile Legends',
      description: 'MOBA Strategy Game',
      color: '#3498DB',
      icon: 'sword-outline',
      isActive: true
    },
    {
      id: 'lol',
      name: 'League of Legends: Wild Rift',
      description: 'MOBA Strategy Game',
      color: '#9B59B6',
      icon: 'diamond-outline',
      isActive: true
    },
    {
      id: 'csgo',
      name: 'CS:GO Mobile',
      description: 'Tactical FPS',
      color: '#2ECC71',
      icon: 'telescope-outline',
      isActive: true
    },
    {
      id: 'fortnite',
      name: 'Fortnite Mobile',
      description: 'Battle Royale Building Game',
      color: '#8E44AD',
      icon: 'construct-outline',
      isActive: true
    },
    {
      id: 'clash-royale',
      name: 'Clash Royale',
      description: 'Real-time Strategy',
      color: '#1ABC9C',
      icon: 'trophy-outline',
      isActive: true
    },
    {
      id: 'brawl-stars',
      name: 'Brawl Stars',
      description: 'Multiplayer Battle Arena',
      color: '#F1C40F',
      icon: 'star-outline',
      isActive: true
    },
    {
      id: 'among-us',
      name: 'Among Us',
      description: 'Social Deduction Game',
      color: '#E67E22',
      icon: 'people-outline',
      isActive: true
    }
  ];

  res.json({ games });
};

// Setup game profile
export const setupGameProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { gameId, gameName, gameUID, inGameName } = req.body;

  if (!gameId || !gameName || !gameUID || !inGameName) {
    throw createError('All game profile fields are required', 400);
  }

  try {
    // Check if user already has a profile for this game
    const existingProfile = await prisma.gameProfile.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId
        }
      }
    });

    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await prisma.gameProfile.update({
        where: { id: existingProfile.id },
        data: {
          gameName,
          gameUID,
          inGameName,
          updatedAt: new Date()
        }
      });

      // Update user game setup status
      await prisma.user.update({
        where: { id: userId },
        data: {
          gameSetup: true,
          onboardingComplete: true,
          updatedAt: new Date()
        }
      });

      res.json({
        message: 'Game profile updated successfully',
        gameProfile: updatedProfile
      });
    } else {
      // Create new game profile
      const gameProfile = await prisma.gameProfile.create({
        data: {
          userId,
          gameId,
          gameName,
          gameUID,
          inGameName,
          isPrimary: true // First game profile is primary
        }
      });

      // Update user game setup status
      await prisma.user.update({
        where: { id: userId },
        data: {
          gameSetup: true,
          onboardingComplete: true,
          updatedAt: new Date()
        }
      });

      res.json({
        message: 'Game profile created successfully',
        gameProfile
      });
    }

    // Clear cache
    await cache.del(`user:${userId}`);
    await cache.del(`user:profile:${userId}`);
    await cache.del(`user:games:${userId}`);

  } catch (error) {
    console.error('Game setup error:', error);
    throw createError('Game profile setup failed', 500);
  }
};

// Get user's game profiles
export const getUserGameProfiles = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  try {
    const gameProfiles = await prisma.gameProfile.findMany({
      where: { userId },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    res.json({ gameProfiles });
  } catch (error) {
    throw createError('Failed to fetch game profiles', 500);
  }
};

// Update game profile
export const updateGameProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { profileId } = req.params;
  const { gameUID, inGameName, isPrimary } = req.body;

  try {
    // Verify the profile belongs to the user
    const existingProfile = await prisma.gameProfile.findFirst({
      where: {
        id: profileId,
        userId
      }
    });

    if (!existingProfile) {
      throw createError('Game profile not found', 404);
    }

    // If setting as primary, unset other primary profiles
    if (isPrimary) {
      await prisma.gameProfile.updateMany({
        where: {
          userId,
          id: { not: profileId }
        },
        data: { isPrimary: false }
      });
    }

    const updatedProfile = await prisma.gameProfile.update({
      where: { id: profileId },
      data: {
        gameUID,
        inGameName,
        isPrimary,
        updatedAt: new Date()
      }
    });

    // Clear cache
    await cache.del(`user:games:${userId}`);

    res.json({
      message: 'Game profile updated successfully',
      gameProfile: updatedProfile
    });
  } catch (error) {
    throw createError('Failed to update game profile', 500);
  }
};

// Delete game profile
export const deleteGameProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { profileId } = req.params;

  try {
    // Verify the profile belongs to the user
    const existingProfile = await prisma.gameProfile.findFirst({
      where: {
        id: profileId,
        userId
      }
    });

    if (!existingProfile) {
      throw createError('Game profile not found', 404);
    }

    await prisma.gameProfile.delete({
      where: { id: profileId }
    });

    // If this was the primary profile, set another one as primary
    if (existingProfile.isPrimary) {
      const nextProfile = await prisma.gameProfile.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' }
      });

      if (nextProfile) {
        await prisma.gameProfile.update({
          where: { id: nextProfile.id },
          data: { isPrimary: true }
        });
      }
    }

    // Clear cache
    await cache.del(`user:games:${userId}`);

    res.json({ message: 'Game profile deleted successfully' });
  } catch (error) {
    throw createError('Failed to delete game profile', 500);
  }
};

// Get onboarding status
export const getOnboardingStatus = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileSetup: true,
        gameSetup: true,
        onboardingComplete: true,
        avatar: true,
        gameProfiles: {
          select: {
            id: true,
            gameId: true,
            gameName: true,
            isPrimary: true
          }
        }
      }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      onboarding: {
        profileSetup: user.profileSetup,
        gameSetup: user.gameSetup,
        onboardingComplete: user.onboardingComplete,
        hasAvatar: !!user.avatar,
        gameProfilesCount: user.gameProfiles.length,
        primaryGame: user.gameProfiles.find(gp => gp.isPrimary)
      }
    });
  } catch (error) {
    throw createError('Failed to get onboarding status', 500);
  }
};

// Complete onboarding
export const completeOnboarding = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingComplete: true,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        profileSetup: true,
        gameSetup: true,
        onboardingComplete: true
      }
    });

    // Clear cache
    await cache.del(`user:${userId}`);

    res.json({
      message: 'Onboarding completed successfully',
      user: updatedUser
    });
  } catch (error) {
    throw createError('Failed to complete onboarding', 500);
  }
};