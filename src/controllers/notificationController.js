// controllers/notificationController.js

import prisma from "../config/prismaClient.js";

/**
 * Creates persistent notifications for all users (excluding the author).
 * @param {string} message - The notification message.
 * @param {number} authorId - The ID of the user who triggered the event.
 * @param {number} [postId] - The ID of the related post.
 * @param {number} [sessionId] - The ID of the related session.
 * @param {number} [needId] - The ID of the related need.
 */
export const createNotificationsForAll = async ({ message, authorId, postId, sessionId, needId }) => {
  try {
    const allUsers = await prisma.user.findMany({
      where: { id: { not: authorId } },
      select: { id: true },
    });

    const notificationData = allUsers.map(user => ({
      userId: user.id,
      message,
      postId,
      sessionId,
      needId,
    }));

    if (notificationData.length > 0) {
      await prisma.notification.createMany({
        data: notificationData,
      });
      console.log(`Successfully created ${notificationData.length} notifications.`);
    }
  } catch (error) {
    console.error("Error creating notifications:", error);
  }
};

/**
 * Creates a notification for a specific user.
 * @param {string} message - The notification message.
 * @param {number} recipientId - The ID of the user who receives the notification.
 * @param {number} [postId] - The ID of the related post.
 */
export const createNotificationForUser = async ({ message, recipientId, postId }) => {
  try {
    await prisma.notification.create({
      data: {
        userId: recipientId,
        message,
        postId,
      },
    });
    console.log(`Notification created for user ${recipientId}.`);
  } catch (error) {
    console.error("Error creating notification for user:", error);
  }
};

/**
 * Fetches all unread notifications for a specific user.
 */
export const fetchUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: "desc" },
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

/**
 * Marks a notification as read.
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });
    res.status(200).send("Notification marked as read");
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};