import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database';
import { cache } from '../config/redis';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { sendEmail, sendWelcomeEmail } from '../services/emailService';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  const { email, username, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
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
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Generate 6-digit OTP instead of UUID token
  const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('🔢 Generated OTP:', verificationOTP);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
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
      createdAt: true,
      updatedAt: true
    }
  });

  // Store verification OTP in cache (expires in 30 minutes for testing)
  await cache.set(`verification:${verificationOTP}`, user.id, 1800); // 30 minutes
  console.log('💾 Stored OTP in cache with key:', `verification:${verificationOTP}`);
  
  // Test cache immediately
  const testRetrieve = await cache.get(`verification:${verificationOTP}`);
  console.log('🧪 Test cache retrieve:', testRetrieve);

  // Send verification email
  try {
    await sendEmail({
      to: email,
      subject: 'Verify your CrackZone account',
      template: 'verification',
      data: {
        username,
        verificationOTP,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationOTP}`
      }
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }

  // Generate tokens for immediate login after registration
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Cache user data
  const userData = {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    gamerTag: user.gamerTag,
    level: user.level,
    experience: user.experience,
    coins: user.coins,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
  
  await cache.set(`user:${user.id}`, userData, 3600);

  // Store refresh token in cache
  await cache.set(`refresh:${user.id}`, refreshToken, 30 * 24 * 3600); // 30 days

  res.status(201).json({
    message: 'Registration successful. Please check your email to verify your account.',
    user: userData,
    accessToken,
    refreshToken
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
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
      createdAt: true,
      updatedAt: true,
      lastLogin: true
    }
  });

  if (!user) {
    throw createError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw createError('Account is deactivated', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('Invalid credentials', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  // Cache user data
  const userData = {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    gamerTag: user.gamerTag,
    level: user.level,
    experience: user.experience,
    coins: user.coins,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLogin: user.lastLogin?.toISOString()
  };
  
  await cache.set(`user:${user.id}`, userData, 3600);

  // Store refresh token in cache
  await cache.set(`refresh:${user.id}`, refreshToken, 30 * 24 * 3600); // 30 days

  res.json({
    message: 'Login successful',
    user: userData,
    accessToken,
    refreshToken
  });
};

export const logout = async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  // Remove user from cache
  await cache.del(`user:${userId}`);
  await cache.del(`refresh:${userId}`);

  res.json({ message: 'Logout successful' });
};

export const refreshToken = async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token required', 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    
    if (decoded.type !== 'refresh') {
      throw createError('Invalid token type', 401);
    }

    // Check if refresh token exists in cache
    const cachedToken = await cache.get(`refresh:${decoded.userId}`);
    if (cachedToken !== refreshToken) {
      throw createError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    // Update refresh token in cache
    await cache.set(`refresh:${decoded.userId}`, newRefreshToken, 30 * 24 * 3600);

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    throw createError('Invalid refresh token', 401);
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      avatar: true,
      phone: true,
      gamerTag: true,
      level: true,
      experience: true,
      coins: true,
      role: true,
      isVerified: true,
      createdAt: true,
      lastLogin: true,
      profile: {
        select: {
          bio: true,
          country: true,
          timezone: true,
          dateOfBirth: true,
          preferences: true
        }
      }
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({ user });
};

export const verifyEmail = async (req: Request, res: Response) => {
  console.log('🔍 Verify email request:', req.body);
  const { token } = req.body;

  if (!token) {
    console.log('❌ No token provided');
    throw createError('Verification token required', 400);
  }

  console.log('🔑 Looking for token in cache:', token);
  // Get user ID from cache
  const userId = await cache.get(`verification:${token}`);
  console.log('👤 Found user ID:', userId);
  
  if (!userId) {
    console.log('❌ Token not found in cache or expired');
    throw createError('Invalid or expired verification token', 400);
  }

  // Get user details before updating
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      isVerified: true
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  if (user.isVerified) {
    throw createError('Email already verified', 400);
  }

  // Update user verification status
  await prisma.user.update({
    where: { id: userId },
    data: { isVerified: true }
  });

  // Remove verification token from cache
  await cache.del(`verification:${token}`);

  // Send welcome email
  try {
    await sendWelcomeEmail(user.email, user.username);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't fail the verification if welcome email fails
  }

  res.json({ message: 'Email verified successfully! Welcome to CrackZone!' });
};

export const resendVerification = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      isVerified: true
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  if (user.isVerified) {
    throw createError('Email already verified', 400);
  }

  // Generate new 6-digit OTP
  const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
  await cache.set(`verification:${verificationOTP}`, user.id, 600); // 10 minutes

  // Send verification email
  try {
    await sendEmail({
      to: email,
      subject: 'Verify your CrackZone account',
      template: 'verification',
      data: {
        username: user.username,
        verificationOTP,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationOTP}`
      }
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw createError('Failed to send verification email', 500);
  }

  res.json({ message: 'Verification email sent' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true
    }
  });

  if (!user) {
    // Don't reveal if email exists
    return res.json({ message: 'If the email exists, a reset link has been sent' });
  }

  // Generate reset token
  const resetToken = uuidv4();
  await cache.set(`reset:${resetToken}`, user.id, 3600); // 1 hour

  // Send reset email
  try {
    await sendEmail({
      to: email,
      subject: 'Reset your CrackZone password',
      template: 'password-reset',
      data: {
        username: user.username,
        resetToken,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      }
    });
  } catch (error) {
    console.error('Failed to send reset email:', error);
  }

  res.json({ message: 'If the email exists, a reset link has been sent' });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  // Get user ID from cache
  const userId = await cache.get(`reset:${token}`);
  if (!userId) {
    throw createError('Invalid or expired reset token', 400);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  // Remove reset token from cache
  await cache.del(`reset:${token}`);

  // Clear user cache to force re-authentication
  await cache.del(`user:${userId}`);
  await cache.del(`refresh:${userId}`);

  res.json({ message: 'Password reset successful' });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createError('Current password and new password are required', 400);
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      password: true
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw createError('Current password is incorrect', 400);
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword }
  });

  res.json({ message: 'Password changed successfully' });
};