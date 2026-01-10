import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from './database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export const initializeSocket = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.user?.username} connected: ${socket.id}`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining tournament rooms
    socket.on('join_tournament', (tournamentId: string) => {
      socket.join(`tournament:${tournamentId}`);
      console.log(`User ${socket.user?.username} joined tournament room: ${tournamentId}`);
    });

    // Handle leaving tournament rooms
    socket.on('leave_tournament', (tournamentId: string) => {
      socket.leave(`tournament:${tournamentId}`);
      console.log(`User ${socket.user?.username} left tournament room: ${tournamentId}`);
    });

    // Handle joining team rooms
    socket.on('join_team', (teamId: string) => {
      socket.join(`team:${teamId}`);
      console.log(`User ${socket.user?.username} joined team room: ${teamId}`);
    });

    // Handle leaving team rooms
    socket.on('leave_team', (teamId: string) => {
      socket.leave(`team:${teamId}`);
      console.log(`User ${socket.user?.username} left team room: ${teamId}`);
    });

    // Handle match events
    socket.on('join_match', (matchId: string) => {
      socket.join(`match:${matchId}`);
      console.log(`User ${socket.user?.username} joined match room: ${matchId}`);
    });

    socket.on('leave_match', (matchId: string) => {
      socket.leave(`match:${matchId}`);
      console.log(`User ${socket.user?.username} left match room: ${matchId}`);
    });

    // Handle chat messages
    socket.on('send_message', (data: {
      room: string;
      message: string;
      type: 'tournament' | 'team' | 'match';
    }) => {
      const { room, message, type } = data;
      const roomName = `${type}:${room}`;
      
      // Broadcast message to room
      socket.to(roomName).emit('new_message', {
        id: Date.now().toString(),
        userId: socket.userId,
        username: socket.user?.username,
        message,
        timestamp: new Date().toISOString(),
        type
      });
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { room: string; type: string }) => {
      const roomName = `${data.type}:${data.room}`;
      socket.to(roomName).emit('user_typing', {
        userId: socket.userId,
        username: socket.user?.username
      });
    });

    socket.on('typing_stop', (data: { room: string; type: string }) => {
      const roomName = `${data.type}:${data.room}`;
      socket.to(roomName).emit('user_stopped_typing', {
        userId: socket.userId,
        username: socket.user?.username
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user?.username} disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Utility functions for emitting events
export const socketEvents = {
  // Notify user
  notifyUser: (io: Server, userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  },

  // Notify tournament participants
  notifyTournament: (io: Server, tournamentId: string, event: string, data: any) => {
    io.to(`tournament:${tournamentId}`).emit(event, data);
  },

  // Notify team members
  notifyTeam: (io: Server, teamId: string, event: string, data: any) => {
    io.to(`team:${teamId}`).emit(event, data);
  },

  // Notify match participants
  notifyMatch: (io: Server, matchId: string, event: string, data: any) => {
    io.to(`match:${matchId}`).emit(event, data);
  },

  // Broadcast to all connected users
  broadcast: (io: Server, event: string, data: any) => {
    io.emit(event, data);
  }
};