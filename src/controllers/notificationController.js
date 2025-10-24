import * as notificationService from '../services/notificationService.js';

/**
 * Get all notifications for the authenticated user
 */
export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve notifications',
        details: error.message
      }
    });
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get unread count',
        details: error.message
      }
    });
  }
}

/**
 * Mark specific notifications as read
 */
export async function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'notificationIds must be an array'
        }
      });
    }

    const result = await notificationService.markNotificationsAsRead(
      notificationIds.map(id => parseInt(id)),
      userId
    );

    res.json({
      success: true,
      data: { updated: result.count },
      message: 'Notifications marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to mark notifications as read',
        details: error.message
      }
    });
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    const result = await notificationService.markAllNotificationsAsRead(userId);

    res.json({
      success: true,
      data: { updated: result.count },
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to mark all notifications as read',
        details: error.message
      }
    });
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Valid notification ID is required'
        }
      });
    }

    const result = await notificationService.deleteNotification(parseInt(id), userId);

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete notification',
        details: error.message
      }
    });
  }
}
