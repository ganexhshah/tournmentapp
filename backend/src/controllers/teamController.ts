import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getTeams = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;

  const skip = (page - 1) * limit;
  const where: any = { isActive: true };

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        avatar: true,
        maxMembers: true,
        createdAt: true,
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.team.count({ where })
  ]);

  res.json({
    teams,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const getTeamById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      members: {
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
        orderBy: { joinedAt: 'asc' }
      }
    }
  });

  if (!team) {
    throw createError('Team not found', 404);
  }

  res.json({ team });
};

export const createTeam = async (req: AuthRequest, res: Response) => {
  const { name, description, maxMembers } = req.body;
  const userId = req.user.id;

  // Check if user is already in a team
  const existingMembership = await prisma.teamMember.findFirst({
    where: { userId }
  });

  if (existingMembership) {
    throw createError('You are already a member of a team', 409);
  }

  const team = await prisma.team.create({
    data: {
      name,
      description,
      maxMembers: maxMembers || 5,
      members: {
        create: {
          userId,
          role: 'LEADER'
        }
      }
    },
    include: {
      members: {
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
    message: 'Team created successfully',
    team
  });
};

export const updateTeam = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, maxMembers } = req.body;
  const userId = req.user.id;

  // Check if user is team leader
  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId: id,
      userId,
      role: 'LEADER'
    }
  });

  if (!membership) {
    throw createError('Only team leaders can update team details', 403);
  }

  const team = await prisma.team.update({
    where: { id },
    data: {
      name,
      description,
      maxMembers
    }
  });

  res.json({
    message: 'Team updated successfully',
    team
  });
};

export const deleteTeam = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if user is team leader
  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId: id,
      userId,
      role: 'LEADER'
    }
  });

  if (!membership) {
    throw createError('Only team leaders can delete the team', 403);
  }

  await prisma.team.update({
    where: { id },
    data: { isActive: false }
  });

  res.json({ message: 'Team deleted successfully' });
};

export const joinTeam = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      _count: {
        select: { members: true }
      }
    }
  });

  if (!team || !team.isActive) {
    throw createError('Team not found', 404);
  }

  if (team._count.members >= team.maxMembers) {
    throw createError('Team is full', 400);
  }

  // Check if user is already in any team
  const existingMembership = await prisma.teamMember.findFirst({
    where: { userId }
  });

  if (existingMembership) {
    throw createError('You are already a member of a team', 409);
  }

  await prisma.teamMember.create({
    data: {
      teamId: id,
      userId,
      role: 'MEMBER'
    }
  });

  res.json({ message: 'Successfully joined team' });
};

export const leaveTeam = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId: id,
      userId
    }
  });

  if (!membership) {
    throw createError('You are not a member of this team', 404);
  }

  if (membership.role === 'LEADER') {
    // Check if there are other members
    const memberCount = await prisma.teamMember.count({
      where: { teamId: id }
    });

    if (memberCount > 1) {
      throw createError('Transfer leadership before leaving the team', 400);
    }
  }

  await prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId: id,
        userId
      }
    }
  });

  res.json({ message: 'Successfully left team' });
};

export const getTeamMembers = async (req: Request, res: Response) => {
  const { id } = req.params;

  const members = await prisma.teamMember.findMany({
    where: { teamId: id },
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
    orderBy: [
      { role: 'desc' }, // Leaders first
      { joinedAt: 'asc' }
    ]
  });

  res.json({ members });
};

export const inviteToTeam = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { username } = req.body;
  const userId = req.user.id;

  // Check if user is team leader
  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId: id,
      userId,
      role: 'LEADER'
    }
  });

  if (!membership) {
    throw createError('Only team leaders can invite members', 403);
  }

  // Find user to invite
  const userToInvite = await prisma.user.findUnique({
    where: { username }
  });

  if (!userToInvite) {
    throw createError('User not found', 404);
  }

  // Create notification for invitation
  await prisma.notification.create({
    data: {
      userId: userToInvite.id,
      title: 'Team Invitation',
      message: `You have been invited to join a team`,
      type: 'TEAM'
    }
  });

  res.json({ message: 'Invitation sent successfully' });
};

export const kickFromTeam = async (req: AuthRequest, res: Response) => {
  const { id, userId: targetUserId } = req.params;
  const userId = req.user.id;

  // Check if user is team leader
  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId: id,
      userId,
      role: 'LEADER'
    }
  });

  if (!membership) {
    throw createError('Only team leaders can kick members', 403);
  }

  // Cannot kick yourself
  if (userId === targetUserId) {
    throw createError('Cannot kick yourself', 400);
  }

  const targetMembership = await prisma.teamMember.findFirst({
    where: {
      teamId: id,
      userId: targetUserId
    }
  });

  if (!targetMembership) {
    throw createError('User is not a member of this team', 404);
  }

  await prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId: id,
        userId: targetUserId
      }
    }
  });

  res.json({ message: 'Member kicked successfully' });
};

export const promoteToLeader = async (req: AuthRequest, res: Response) => {
  const { id, userId: targetUserId } = req.params;
  const userId = req.user.id;

  // Check if user is team leader
  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId: id,
      userId,
      role: 'LEADER'
    }
  });

  if (!membership) {
    throw createError('Only team leaders can promote members', 403);
  }

  // Update roles in transaction
  await prisma.$transaction([
    // Demote current leader to member
    prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId: id,
          userId
        }
      },
      data: { role: 'MEMBER' }
    }),
    // Promote target user to leader
    prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId: id,
          userId: targetUserId
        }
      },
      data: { role: 'LEADER' }
    })
  ]);

  res.json({ message: 'Leadership transferred successfully' });
};