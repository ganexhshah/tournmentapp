import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getRewards = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const type = req.query.type as string;

  const skip = (page - 1) * limit;
  const where: any = { isActive: true };

  if (type) where.type = type;

  const [rewards, total] = await Promise.all([
    prisma.reward.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        value: true,
        requirements: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.reward.count({ where })
  ]);

  res.json({
    rewards,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const getRewardById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const reward = await prisma.reward.findUnique({
    where: { id }
  });

  if (!reward) {
    throw createError('Reward not found', 404);
  }

  res.json({ reward });
};

export const getAvailableRewards = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  // Get user's current stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      level: true,
      experience: true,
      coins: true,
      _count: {
        select: {
          tournaments: true,
          matches: true,
          teams: true
        }
      }
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Get rewards user hasn't claimed yet
  const claimedRewardIds = await prisma.userReward.findMany({
    where: { userId },
    select: { rewardId: true }
  });

  const claimedIds = claimedRewardIds.map(ur => ur.rewardId);

  const availableRewards = await prisma.reward.findMany({
    where: {
      isActive: true,
      NOT: {
        id: { in: claimedIds }
      }
    }
  });

  // Filter rewards based on requirements
  const eligibleRewards = availableRewards.filter(reward => {
    if (!reward.requirements) return true;

    const requirements = reward.requirements as any;
    
    if (requirements.minLevel && user.level < requirements.minLevel) return false;
    if (requirements.minExperience && user.experience < requirements.minExperience) return false;
    if (requirements.minTournaments && user._count.tournaments < requirements.minTournaments) return false;
    if (requirements.minMatches && user._count.matches < requirements.minMatches) return false;

    return true;
  });

  res.json({ rewards: eligibleRewards });
};

export const getClaimedRewards = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const skip = (page - 1) * limit;

  const [userRewards, total] = await Promise.all([
    prisma.userReward.findMany({
      where: { userId },
      include: {
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
      orderBy: { claimedAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.userReward.count({ where: { userId } })
  ]);

  res.json({
    rewards: userRewards,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const claimReward = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if reward exists and is active
  const reward = await prisma.reward.findUnique({
    where: { id }
  });

  if (!reward || !reward.isActive) {
    throw createError('Reward not found or inactive', 404);
  }

  // Check if user already claimed this reward
  const existingClaim = await prisma.userReward.findUnique({
    where: {
      userId_rewardId: {
        userId,
        rewardId: id
      }
    }
  });

  if (existingClaim) {
    throw createError('Reward already claimed', 409);
  }

  // Check if user meets requirements
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      level: true,
      experience: true,
      coins: true,
      _count: {
        select: {
          tournaments: true,
          matches: true,
          teams: true
        }
      }
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  if (reward.requirements) {
    const requirements = reward.requirements as any;
    
    if (requirements.minLevel && user.level < requirements.minLevel) {
      throw createError('Level requirement not met', 400);
    }
    if (requirements.minExperience && user.experience < requirements.minExperience) {
      throw createError('Experience requirement not met', 400);
    }
    if (requirements.minTournaments && user._count.tournaments < requirements.minTournaments) {
      throw createError('Tournament participation requirement not met', 400);
    }
    if (requirements.minMatches && user._count.matches < requirements.minMatches) {
      throw createError('Match participation requirement not met', 400);
    }
  }

  // Claim reward in transaction
  await prisma.$transaction(async (tx) => {
    // Create user reward record
    await tx.userReward.create({
      data: {
        userId,
        rewardId: id,
        claimed: true,
        claimedAt: new Date()
      }
    });

    // Apply reward based on type
    if (reward.type === 'COINS') {
      await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: reward.value }
        }
      });
    } else if (reward.type === 'EXPERIENCE') {
      await tx.user.update({
        where: { id: userId },
        data: {
          experience: { increment: reward.value }
        }
      });
    }

    // Create notification
    await tx.notification.create({
      data: {
        userId,
        title: 'Reward Claimed!',
        message: `You have claimed the reward: ${reward.title}`,
        type: 'REWARD'
      }
    });
  });

  res.json({ message: 'Reward claimed successfully' });
};

export const getRewardCounts = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  const [unclaimedCount, totalCount] = await Promise.all([
    // Count available rewards user hasn't claimed
    prisma.reward.count({
      where: {
        isActive: true,
        NOT: {
          userRewards: {
            some: {
              userId
            }
          }
        }
      }
    }),
    // Count total rewards user has claimed
    prisma.userReward.count({
      where: { userId }
    })
  ]);

  res.json({
    unclaimedCount,
    totalCount
  });
};

export const createReward = async (req: Request, res: Response) => {
  const {
    title,
    description,
    type,
    value,
    requirements
  } = req.body;

  const reward = await prisma.reward.create({
    data: {
      title,
      description,
      type,
      value,
      requirements
    }
  });

  res.status(201).json({
    message: 'Reward created successfully',
    reward
  });
};

export const updateReward = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const reward = await prisma.reward.update({
    where: { id },
    data: updateData
  });

  res.json({
    message: 'Reward updated successfully',
    reward
  });
};

export const deleteReward = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.reward.update({
    where: { id },
    data: { isActive: false }
  });

  res.json({ message: 'Reward deleted successfully' });
};