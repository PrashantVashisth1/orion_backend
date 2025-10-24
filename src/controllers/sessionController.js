// import prisma from "../config/prismaClient.js";
// // Create Session
// export const createSession = async (req, res,io) => {
//   try {
//     const { userId, type, title, dateTime, duration, registrationLink, ...data } = req.body;

//     // Ensure user exists
//     const user = await prisma.user.findUnique({ where: { id: userId } });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Determine the speaker/host name for the notification message
//     const hostName = user.full_name || 'A user';

//     const session = await prisma.session.create({
//       data: {
//         type,
//         title,
//         dateTime: new Date(dateTime),
//         duration,
//         registrationLink,
//         userId,
//         ...data
//       }
//     });
//     res.json(session);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// // Get session based on types

// /**
//  * GET /sessions
//  * Optional query param: type (WEBINAR | PANEL_DISCUSSION | PRODUCT_DEMO)
//  */
// export const getSession = async (req, res) => {
//   try {
//     let { type } = req.query;
//     console.log("Incoming type query (raw):", JSON.stringify(type));

//     const validTypes = ["WEBINAR", "PANEL_DISCUSSION", "PRODUCT_DEMO"];
//     let whereClause = {};

//     if (type) {
//       // Normalize and clean string
//       type = String(type).replace(/\s+/g, "").toUpperCase();
//       // OR type = String(type).trim().toUpperCase();

//       if (!validTypes.includes(type)) {
//         return res.status(400).json({ error: `Invalid type: ${type}` });
//       }

//       whereClause.type = type;
//     }

//     const sessions = await prisma.session.findMany({
//       where: whereClause,
//       include: { user: true },
//       orderBy: { created_at: "desc" },
//     });

//     res.json(sessions);
//   } catch (error) {
//     console.error("Get sessions error:", error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// // Get all sessions and return only filled data
// export const getAllSession = async (req, res) => {
//   try {
//     // This function now gets all sessions without any filtering by type.
//     const sessions = await prisma.session.findMany({
//       include: { user: true },
//       orderBy: { created_at: "desc" },
//     });


//     // Clean data to only include filled fields
//     const cleanedSessions = sessions.map(session => {
//       const cleaned = {};
//       for (const key in session) {
//         const value = session[key];
//         // Only include non-null, non-empty string, and non-empty array values
//         if (value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
//           cleaned[key] = value;
//         }
//       }
//       return cleaned;
//     });

//     res.json(cleanedSessions);
//   } catch (error) {
//     console.error("Get sessions error:", error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };
import prisma from "../config/prismaClient.js";
import * as notificationService from "../services/notificationService.js";
import { broadcastExceptUser } from "../services/socketManager.js";

export const createSession = async (req, res, io) => {
  try {
    const { 
      userId, 
      type, 
      title, 
      dateTime, 
      duration, 
      registrationLink, 
      ...data 
    } = req.body;

    // Ensure user exists
    const user = await prisma.user.findUnique({ 
      where: { id: userId } 
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hostName = user.full_name || 'A user';

    // 1. Create the session
    const session = await prisma.session.create({
      data: {
        type,
        title,
        dateTime: new Date(dateTime),
        duration,
        registrationLink,
        userId,
        ...data
      }
    });
    
    // 2. Notify all users except the session creator
    const message = `${hostName} created a new ${type.toLowerCase().replace('_', ' ')}: ${title}`;
    
    // Get all active users except the session creator
    const userIds = await notificationService.getAllActiveUserIds(userId);
    
    // Create bulk notifications
    const notifications = userIds.map(uid => ({
      userId: uid,
      message,
      sessionId: session.id,
      isRead: false
    }));
    
    if (notifications.length > 0) {
      await notificationService.createBulkNotifications(notifications);
      
      // Broadcast to all users via Socket.IO
      if (io) {
        const notification = {
          message,
          sessionId: session.id,
          createdAt: new Date(),
          isRead: false,
          session: {
            id: session.id,
            title: session.title,
            type: session.type
          }
        };
        await broadcastExceptUser(io, userId, notification);
      }
    }
    
    res.json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Get session based on types

/**
 * GET /sessions
 * Optional query param: type (WEBINAR | PANEL_DISCUSSION | PRODUCT_DEMO)
 */
export const getSession = async (req, res) => {
  try {
    let { type } = req.query;
    console.log("Incoming type query (raw):", JSON.stringify(type));

    const validTypes = ["WEBINAR", "PANEL_DISCUSSION", "PRODUCT_DEMO"];
    let whereClause = {};

    if (type) {
      // Normalize and clean string
      type = String(type).replace(/\s+/g, "").toUpperCase();
      // OR type = String(type).trim().toUpperCase();

      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: `Invalid type: ${type}` });
      }

      whereClause.type = type;
    }

    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: { user: true },
      orderBy: { created_at: "desc" },
    });

    res.json(sessions);
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Get all sessions and return only filled data
export const getAllSession = async (req, res) => {
  try {
    // This function now gets all sessions without any filtering by type.
    const sessions = await prisma.session.findMany({
      include: { user: true },
      orderBy: { created_at: "desc" },
    });


    // Clean data to only include filled fields
    const cleanedSessions = sessions.map(session => {
      const cleaned = {};
      for (const key in session) {
        const value = session[key];
        // Only include non-null, non-empty string, and non-empty array values
        if (value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
          cleaned[key] = value;
        }
      }
      return cleaned;
    });

    res.json(cleanedSessions);
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};