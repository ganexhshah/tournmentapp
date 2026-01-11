import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const type = req.query.type as string;
  const isRead = req.query.isRead as string;

  const skip = (page - 1) * limit;
  const where: any = { userId };

  if (type) where.type = type;
  if (isRead !== undefined) where.isRead = isRead === 'true';

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        metadata: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.notification.count({ where })
  ]);

  res.json({
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const getNotificationCounts = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  const [unreadCount, totalCount] = await Promise.all([
    prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    }),
    prisma.notification.count({
      where: { userId }
    })
  ]);

  res.json({
    unreadCount,
    totalCount
  });
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await prisma.notification.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!notification) {
    throw createError('Notification not found', 404);
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });

  res.json({ message: 'Notification marked as read' });
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false
    },
    data: { isRead: true }
  });

  res.json({ message: 'All notifications marked as read' });
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await prisma.notification.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!notification) {
    throw createError('Notification not found', 404);
  }

  await prisma.notification.delete({
    where: { id }
  });

  res.json({ message: 'Notification deleted successfully' });
};

export const clearAllNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  await prisma.notification.deleteMany({
    where: { userId }
  });

  res.json({ message: 'All notifications cleared successfully' });
};