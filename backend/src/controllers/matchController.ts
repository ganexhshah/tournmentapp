import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getMatches = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  const game = req.query.game as string;

  const skip = (page - 1) * limit;
  const where: any = {};

  if (status) where.status = status;
  if (game) where.game = { contains: game, mode: 'insensitive' };

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where,
      select: {
        id: true,
        title: true,
        game: true,
        status: true,
        round: true,
        scheduledAt: true,
        startedAt: true,
        endedAt: true,
        createdAt: true,
        tournament: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { scheduledAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.match.count({ where })
  ]);

  res.json({
    matches,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const getMatchById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      tournament: {
        select: {
          id: true,
          title: true,
          game: true
        }
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              level: true
            }
          }
        },
        orderBy: { position: 'asc' }
      }
    }
  });

  if (!match) {
    throw createError('Match not found', 404);
  }

  res.json({ match });
};

export const createMatch = async (req: AuthRequest, res: Response) => {
  const {
    title,
    game,
    tournamentId,
    scheduledAt,
    round,
    participantIds
  } = req.body;

  const match = await prisma.match.create({
    data: {
      title,
      game,
      tournamentId,
      scheduledAt: new Date(scheduledAt),
      round,
      participants: {
        create: participantIds?.map((userId: string, index: number) => ({
          userId,
          position: index + 1
        })) || []
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      }
    }
  });

  res.status(201).json({
    message: 'Match created successfully',
    match
  });
};

export const updateMatch = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const match = await prisma.match.update({
    where: { id },
    data: updateData
  });

  res.json({
    message: 'Match updated successfully',
    match
  });
};

export const deleteMatch = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.match.delete({
    where: { id }
  });

  res.json({ message: 'Match deleted successfully' });
};

export const startMatch = async (req: Request, res: Response) => {
  const { id } = req.params;

  const match = await prisma.match.update({
    where: { id },
    data: {
      status: 'IN_PROGRESS',
      startedAt: new Date()
    }
  });

  res.json({
    message: 'Match started successfully',
    match
  });
};

export const submitResult = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { results } = req.body; // Array of { userId, score, position }
  const userId = req.user.id;

  // Check if user is a participant in the match
  const participant = await prisma.matchParticipant.findFirst({
    where: {
      matchId: id,
      userId
    }
  });

  if (!participant && req.user.role !== 'ADMIN' && req.user.role !== 'MODERATOR') {
    throw createError('Only participants or admins can submit results', 403);
  }

  // Update match status and results
  await prisma.$transaction(async (tx) => {
    // Update match
    await tx.match.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        result: results
      }
    });

    // Update participant scores
    for (const result of results) {
      await tx.matchParticipant.update({
        where: {
          matchId_userId: {
            matchId: id,
            userId: result.userId
          }
        },
        data: {
          score: result.score,
          position: result.position
        }
      });

      // Award experience points based on position
      const expGain = Math.max(100 - (result.position - 1) * 20, 10);
      await tx.user.update({
        where: { id: result.userId },
        data: {
          experience: { increment: expGain }
        }
      });
    }
  });

  res.json({ message: 'Match results submitted successfully' });
};

export const getMatchParticipants = async (req: Request, res: Response) => {
  const { id } = req.params;

  const participants = await prisma.matchParticipant.findMany({
    where: { matchId: id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
          level: true,
          experience: true
        }
      }
    },
    orderBy: { position: 'asc' }
  });

  res.json({ participants });
};