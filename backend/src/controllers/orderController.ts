import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;

  const skip = (page - 1) * limit;
  const where: any = { userId };

  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      select: {
        id: true,
        items: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.order.count({ where })
  ]);

  res.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  res.json({ order });
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const {
    items,
    totalAmount,
    shippingAddress,
    paymentMethod
  } = req.body;
  const userId = req.user.id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw createError('Items are required', 400);
  }

  if (!totalAmount || totalAmount <= 0) {
    throw createError('Invalid total amount', 400);
  }

  // Check user balance if paying with coins
  if (paymentMethod === 'coins') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true }
    });

    if (!user || user.coins < totalAmount) {
      throw createError('Insufficient coins balance', 400);
    }
  }

  const order = await prisma.order.create({
    data: {
      userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'PENDING'
    }
  });

  // If paying with coins, deduct from user balance
  if (paymentMethod === 'coins') {
    await prisma.user.update({
      where: { id: userId },
      data: {
        coins: { decrement: totalAmount }
      }
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        type: 'PURCHASE',
        amount: totalAmount,
        description: `Order #${order.id}`,
        status: 'COMPLETED',
        metadata: { orderId: order.id }
      }
    });
  }

  res.status(201).json({
    message: 'Order created successfully',
    order
  });
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  if (order.status !== 'PENDING') {
    throw createError('Only pending orders can be cancelled', 400);
  }

  await prisma.$transaction(async (tx) => {
    // Update order status
    await tx.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    // Refund coins if paid with coins
    if (order.paymentMethod === 'coins') {
      await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: order.totalAmount }
        }
      });

      // Create refund transaction
      await tx.transaction.create({
        data: {
          userId,
          type: 'REFUND',
          amount: order.totalAmount,
          description: `Refund for cancelled order #${order.id}`,
          status: 'COMPLETED',
          metadata: { orderId: order.id }
        }
      });
    }

    // Create notification
    await tx.notification.create({
      data: {
        userId,
        title: 'Order Cancelled',
        message: `Your order #${order.id} has been cancelled successfully.`,
        type: 'SYSTEM'
      }
    });
  });

  res.json({ message: 'Order cancelled successfully' });
};

export const getAllOrders = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;

  const skip = (page - 1) * limit;
  const where: any = {};

  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.order.count({ where })
  ]);

  res.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const confirmOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  if (order.status !== 'PENDING') {
    throw createError('Only pending orders can be confirmed', 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { status: 'CONFIRMED' }
    });

    await tx.notification.create({
      data: {
        userId: order.userId,
        title: 'Order Confirmed',
        message: `Your order #${order.id} has been confirmed and is being processed.`,
        type: 'SYSTEM'
      }
    });
  });

  res.json({ message: 'Order confirmed successfully' });
};

export const shipOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { trackingNumber } = req.body;

  const order = await prisma.order.findUnique({
    where: { id }
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  if (order.status !== 'CONFIRMED') {
    throw createError('Only confirmed orders can be shipped', 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { 
        status: 'SHIPPED',
        shippingAddress: {
          ...order.shippingAddress as any,
          trackingNumber
        }
      }
    });

    await tx.notification.create({
      data: {
        userId: order.userId,
        title: 'Order Shipped',
        message: `Your order #${order.id} has been shipped. ${trackingNumber ? `Tracking: ${trackingNumber}` : ''}`,
        type: 'SYSTEM'
      }
    });
  });

  res.json({ message: 'Order shipped successfully' });
};

export const deliverOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id }
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  if (order.status !== 'SHIPPED') {
    throw createError('Only shipped orders can be marked as delivered', 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { status: 'DELIVERED' }
    });

    await tx.notification.create({
      data: {
        userId: order.userId,
        title: 'Order Delivered',
        message: `Your order #${order.id} has been delivered successfully.`,
        type: 'SYSTEM'
      }
    });
  });

  res.json({ message: 'Order marked as delivered successfully' });
};