import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { connectRedis } from './config/redis';
import { initializeSocket } from './config/socket';
import { errorHandler, notFound } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import tournamentRoutes from './routes/tournaments';
import teamRoutes from './routes/teams';
import matchRoutes from './routes/matches';
import transactionRoutes from './routes/transactions';
import notificationRoutes from './routes/notifications';
import rewardRoutes from './routes/rewards';
import orderRoutes from './routes/orders';
import imageRoutes from './routes/images';
import emailRoutes from './routes/email';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN?.split(',') || ['http://localhost:8081'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:8081', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug endpoint to check cache (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/debug/cache/:key', async (req, res) => {
    try {
      const { cache } = await import('./config/redis');
      const value = await cache.get(req.params.key);
      res.json({ key: req.params.key, value });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/email', emailRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize services
async function startServer() {
  try {
    // Try to connect to Redis (optional)
    try {
      await connectRedis();
      console.log('✅ Redis connected');
    } catch (error) {
      console.log('⚠️  Redis not available, running without cache');
    }

    // Initialize Socket.io
    initializeSocket(io);
    console.log('✅ Socket.io initialized');

    // Start server
    server.listen(PORT as number, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`🌐 Network: http://192.168.18.13:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

startServer();