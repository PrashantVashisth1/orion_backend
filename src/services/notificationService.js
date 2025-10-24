import prisma from "../config/prismaClient.js";

/**
 * Create a notification in the database
 */
export async function createNotification({ userId, message, postId, sessionId, needId }) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
        postId: postId || null,
        sessionId: sessionId || null,
        needId: needId || null,
        isRead: false
      },
      include: {
        post: {
          select: {
            id: true,
            text: true
          }
        },
        session: {
          select: {
            id: true,
            title: true,
            type: true
          }
        },
        need: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users (bulk)
 */
export async function createBulkNotifications(notifications) {
  try {
    const result = await prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true
    });

    return result;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
  try {
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(unreadOnly && { isRead: false })
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          post: {
            select: {
              id: true,
              text: true,
              author: {
                select: {
                  id: true,
                  full_name: true
                }
              }
            }
          },
          session: {
            select: {
              id: true,
              title: true,
              type: true
            }
          },
          need: {
            select: {
              id: true,
              title: true,
              type: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
}

/**
 * Mark notification(s) as read
 */
export async function markNotificationsAsRead(notificationIds, userId) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId // Ensure user owns these notifications
      },
      data: {
        isRead: true
      }
    });

    return result;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId, userId) {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId // Ensure user owns this notification
      }
    });

    return result;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

/**
 * Get all active users (for broadcasting notifications)
 */
export async function getAllActiveUserIds(excludeUserId = null) {
  try {
    const users = await prisma.user.findMany({
      where: {
        is_active: true,
        ...(excludeUserId && { id: { not: excludeUserId } })
      },
      select: {
        id: true
      }
    });

    return users.map(u => u.id);
  } catch (error) {
    console.error('Error getting active users:', error);
    throw error;
  }
}