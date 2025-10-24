import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import * as notificationService from './notificationService.js';

// Store active user connections
const userSockets = new Map(); // Map<userId, Set<socketId>>

/**
 * Initialize Socket.IO server
 */
export function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`User ${userId} connected with socket ${socket.id}`);

    // Track user connection
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Send pending notifications on connection
    try {
      const unreadCount = await notificationService.getUnreadCount(userId);
      socket.emit('notification:unread-count', { count: unreadCount });

      const { notifications } = await notificationService.getUserNotifications(userId, {
        page: 1,
        limit: 10,
        unreadOnly: false
      });
      socket.emit('notification:history', { notifications });
    } catch (error) {
      console.error('Error sending pending notifications:', error);
    }

    // Handle mark as read
    socket.on('notification:mark-read', async (data) => {
      try {
        const { notificationIds } = data;
        await notificationService.markNotificationsAsRead(notificationIds, userId);
        
        const unreadCount = await notificationService.getUnreadCount(userId);
        socket.emit('notification:unread-count', { count: unreadCount });
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    });

    // Handle mark all as read
    socket.on('notification:mark-all-read', async () => {
      try {
        await notificationService.markAllNotificationsAsRead(userId);
        socket.emit('notification:unread-count', { count: 0 });
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from socket ${socket.id}`);
      
      const userSocketSet = userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });

  return io;
}

/**
 * Emit notification to a specific user
 */
export async function emitToUser(io, userId, notification) {
  try {
    // Emit to user's room (handles multiple devices)
    io.to(`user:${userId}`).emit('notification:new', notification);
    
    // Update unread count
    const unreadCount = await notificationService.getUnreadCount(userId);
    io.to(`user:${userId}`).emit('notification:unread-count', { count: unreadCount });
  } catch (error) {
    console.error('Error emitting to user:', error);
  }
}

/**
 * Emit notification to multiple users
 */
export async function emitToUsers(io, userIds, notification) {
  try {
    for (const userId of userIds) {
      await emitToUser(io, userId, notification);
    }
  } catch (error) {
    console.error('Error emitting to users:', error);
  }
}

/**
 * Broadcast notification to all users except specific user
 */
export async function broadcastExceptUser(io, excludeUserId, notification) {
  try {
    const userIds = await notificationService.getAllActiveUserIds(excludeUserId);
    await emitToUsers(io, userIds, notification);
  } catch (error) {
    console.error('Error broadcasting notification:', error);
  }
}

/**
 * Check if user is online
 */
export function isUserOnline(userId) {
  return userSockets.has(userId);
}

/**
 * Get online users count
 */
export function getOnlineUsersCount() {
  return userSockets.size;
}
