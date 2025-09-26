// routes/notificationRoutes.js

import express from 'express';
// NOTE: Assuming your auth middleware is imported here
import { authenticateToken } from '../middleware/auth.js'; 
import { fetchUnreadNotifications, markNotificationAsRead } from '../controllers/notificationController.js';

const router = express.Router();

// GET /api/notifications/my - Fetch persistent unread notifications on login
router.get('/my', authenticateToken, fetchUnreadNotifications);

// POST /api/notifications/mark-read/:id - Mark a notification as read
router.post('/mark-read/:id', authenticateToken, markNotificationAsRead);

export default router;