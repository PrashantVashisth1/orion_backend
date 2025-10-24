// // routes/notificationRoutes.js

// // import express from 'express';
// // // NOTE: Assuming your auth middleware is imported here
// // import { authenticateToken } from '../middleware/auth.js'; 
// // import { fetchUnreadNotifications, markNotificationAsRead } from '../controllers/notificationController.js';

// // const router = express.Router();

// // // GET /api/notifications/my - Fetch persistent unread notifications on login
// // router.get('/my', authenticateToken, fetchUnreadNotifications);

// // // POST /api/notifications/mark-read/:id - Mark a notification as read
// // router.post('/mark-read/:id', authenticateToken, markNotificationAsRead);

// // export default router;

// import express from 'express';
// import * as notificationController from '../controllers/notificationController.js';
// import { authenticate } from '../middleware/authMiddleware.js';

// const router = express.Router();

// router.use(authenticate);

// router.get('/', notificationController.getNotifications);
// router.get('/unread-count', notificationController.getUnreadCount);
// router.post('/mark-read', notificationController.markAsRead);
// router.post('/mark-all-read', notificationController.markAllAsRead);
// router.delete('/:id', notificationController.deleteNotification);

// export default router;

import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

export default (io) => {
  const router = express.Router();

  // All notification routes require authentication
  router.use(authenticateToken);

  // Get all notifications for the current user
  // GET /api/notifications?page=1&limit=20&unreadOnly=false
  router.get('/', notificationController.getNotifications);

  // Get unread notification count
  // GET /api/notifications/unread-count
  router.get('/unread-count', notificationController.getUnreadCount);

  // Mark specific notifications as read
  // POST /api/notifications/mark-read
  // Body: { notificationIds: [1, 2, 3] }
  router.post('/mark-read', notificationController.markAsRead);

  // Mark all notifications as read
  // POST /api/notifications/mark-all-read
  router.post('/mark-all-read', notificationController.markAllAsRead);

  // Delete a notification
  // DELETE /api/notifications/:id
  router.delete('/:id', notificationController.deleteNotification);

  return router;
};
