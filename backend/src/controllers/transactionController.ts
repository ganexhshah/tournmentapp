import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getTransactions = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const type = req.query.type as string;

  const skip = (page - 1) * limit;
  const where: any = { userId };

  if (type) where.type = type;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.transaction.count({ where })
  ]);

  res.json({
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const getTransactionById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!transaction) {
    throw createError('Transaction not found', 404);
  }

  res.json({ transaction });
};

export const createDeposit = async (req: AuthRequest, res: Response) => {
  const { amount, paymentMethod } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) {
    throw createError('Invalid amount', 400);
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: 'DEPOSIT',
      amount,
      description: `Deposit via ${paymentMethod || 'Unknown'}`,
      status: 'PENDING',
      metadata: { paymentMethod }
    }
  });

  res.status(201).json({
    message: 'Deposit request created successfully',
    transaction
  });
};

export const createWithdrawal = async (req: AuthRequest, res: Response) => {
  const { amount, withdrawalMethod } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) {
    throw createError('Invalid amount', 400);
  }

  // Check user balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coins: true }
  });

  if (!user || user.coins < amount) {
    throw createError('Insufficient balance', 400);
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: 'WITHDRAWAL',
      amount,
      description: `Withdrawal via ${withdrawalMethod || 'Unknown'}`,
      status: 'PENDING',
      metadata: { withdrawalMethod }
    }
  });

  res.status(201).json({
    message: 'Withdrawal request created successfully',
    transaction
  });
};

export const getAllTransactions = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  const type = req.query.type as string;

  const skip = (page - 1) * limit;
  const where: any = {};

  if (status) where.status = status;
  if (type) where.type = type;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
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
    prisma.transaction.count({ where })
  ]);

  res.json({
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const approveTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!transaction) {
    throw createError('Transaction not found', 404);
  }

  if (transaction.status !== 'PENDING') {
    throw createError('Transaction is not pending', 400);
  }

  await prisma.$transaction(async (tx) => {
    // Update transaction status
    await tx.transaction.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });

    // Update user balance based on transaction type
    if (transaction.type === 'DEPOSIT') {
      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          coins: { increment: transaction.amount }
        }
      });
    } else if (transaction.type === 'WITHDRAWAL') {
      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          coins: { decrement: transaction.amount }
        }
      });
    }

    // Create notification
    await tx.notification.create({
      data: {
        userId: transaction.userId,
        title: 'Transaction Approved',
        message: `Your ${transaction.type.toLowerCase()} of ${transaction.amount} coins has been approved.`,
        type: 'TRANSACTION'
      }
    });
  });

  res.json({ message: 'Transaction approved successfully' });
};

export const rejectTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const transaction = await prisma.transaction.findUnique({
    where: { id }
  });

  if (!transaction) {
    throw createError('Transaction not found', 404);
  }

  if (transaction.status !== 'PENDING') {
    throw createError('Transaction is not pending', 400);
  }

  await prisma.$transaction(async (tx) => {
    // Update transaction status
    await tx.transaction.update({
      where: { id },
      data: { 
        status: 'FAILED',
        metadata: {
          ...transaction.metadata as any,
          rejectionReason: reason
        }
      }
    });

    // Create notification
    await tx.notification.create({
      data: {
        userId: transaction.userId,
        title: 'Transaction Rejected',
        message: `Your ${transaction.type.toLowerCase()} has been rejected. ${reason ? `Reason: ${reason}` : ''}`,
        type: 'TRANSACTION'
      }
    });
  });

  res.json({ message: 'Transaction rejected successfully' });
};