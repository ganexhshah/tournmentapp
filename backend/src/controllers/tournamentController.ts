import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { cache } from '../config/redis';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getTournaments = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  const game = req.query.game as string;

  const skip = (page - 1) * limit;
  const where: any = {};

  if (status) where.status = status;
  if (game) where.game = { contains: game, mode: 'insensitive' };

  const [tournaments, total] = await Promise.all([
    prisma.tournament.findMany({
      where,
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
        endDate: true,
        createdAt: true,
        _count: {
          select: {
            participants: true,
            teams: true
          }
        }
      },
      orderBy: { startDate: 'asc' },
      skip,
      take: limit
    }),
    prisma.tournament.count({ where })
  ]);

  res.json({
    tournaments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const getTournamentById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
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
        }
      },
      teams: {
        include: {
          team: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      },
      matches: {
        select: {
          id: true,
          title: true,
          status: true,
          scheduledAt: true,
          round: true
        },
        orderBy: { scheduledAt: 'asc' }
      }
    }
  });

  if (!tournament) {
    throw createError('Tournament not found', 404);
  }

  res.json({ tournament });
};

export const createTournament = async (req: AuthRequest, res: Response) => {
  const {
    title,
    description,
    game,
    format,
    maxParticipants,
    entryFee,
    prizePool,
    startDate,
    endDate,
    rules
  } = req.body;

  const tournament = await prisma.tournament.create({
    data: {
      title,
      description,
      game,
      format,
      maxParticipants,
      entryFee: entryFee || 0,
      prizePool: prizePool || 0,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      rules,
      status: 'UPCOMING'
    }
  });

  res.status(201).json({
    message: 'Tournament created successfully',
    tournament
  });
};

export const joinTournament = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      _count: {
        select: { participants: true }
      }
    }
  });

  if (!tournament) {
    throw createError('Tournament not found', 404);
  }

  if (tournament.status !== 'REGISTRATION_OPEN' && tournament.status !== 'UPCOMING') {
    throw createError('Tournament registration is closed', 400);
  }

  if (tournament._count.participants >= tournament.maxParticipants) {
    throw createError('Tournament is full', 400);
  }

  // Check if user already joined
  const existingParticipant = await prisma.tournamentParticipant.findUnique({
    where: {
      tournamentId_userId: {
        tournamentId: id,
        userId
      }
    }
  });

  if (existingParticipant) {
    throw createError('Already joined this tournament', 409);
  }

  await prisma.tournamentParticipant.create({
    data: {
      tournamentId: id,
      userId
    }
  });

  res.json({ message: 'Successfully joined tournament' });
};

export const leaveTournament = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const participant = await prisma.tournamentParticipant.findUnique({
    where: {
      tournamentId_userId: {
        tournamentId: id,
        userId
      }
    }
  });

  if (!participant) {
    throw createError('Not a participant in this tournament', 404);
  }

  await prisma.tournamentParticipant.delete({
    where: {
      tournamentId_userId: {
        tournamentId: id,
        userId
      }
    }
  });

  res.json({ message: 'Successfully left tournament' });
};

export const getTournamentParticipants = async (req: Request, res: Response) => {
  const { id } = req.params;

  const participants = await prisma.tournamentParticipant.findMany({
    where: { tournamentId: id },
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
    orderBy: { registeredAt: 'asc' }
  });

  res.json({ participants });
};

export const getTournamentMatches = async (req: Request, res: Response) => {
  const { id } = req.params;

  const matches = await prisma.match.findMany({
    where: { tournamentId: id },
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
    },
    orderBy: [{ round: 'asc' }, { scheduledAt: 'asc' }]
  });

  res.json({ matches });
};

export const updateTournament = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const tournament = await prisma.tournament.update({
    where: { id },
    data: updateData
  });

  res.json({
    message: 'Tournament updated successfully',
    tournament
  });
};

export const deleteTournament = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.tournament.delete({
    where: { id }
  });

  res.json({ message: 'Tournament deleted successfully' });
};

export const startTournament = async (req: Request, res: Response) => {
  const { id } = req.params;

  const tournament = await prisma.tournament.update({
    where: { id },
    data: { status: 'IN_PROGRESS' }
  });

  res.json({
    message: 'Tournament started successfully',
    tournament
  });
};

export const cancelTournament = async (req: Request, res: Response) => {
  const { id } = req.params;

  const tournament = await prisma.tournament.update({
    where: { id },
    data: { status: 'CANCELLED' }
  });

  res.json({
    message: 'Tournament cancelled successfully',
    tournament
  });
};