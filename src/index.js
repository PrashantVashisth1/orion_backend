// // src/index.js
// import express from "express";
// import { createServer } from 'http';
// import { Server } from 'socket.io';
// import dotenv from "dotenv";
// import authRoutes from "./routes/authRoutes.js";
// import startupProfileRoutes from "./routes/startupProfileRoutes.js";
// import postRoutes from "./routes/postRoutes.js";
// import commentRoutes from "./routes/commentRoutes.js";
// import likeRoutes from "./routes/likeRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js"
// import trendingPostsRoutes from "./routes/trendingPostsRoutes.js";
// import sessionRoutes from './routes/sessionRoutes.js';
// import needsRoutes from "./routes/needsRoutes.js";
// import userActivityRoutes from "./routes/userActivityRoutes.js";
// import { authenticateToken } from "./middleware/auth.js";
// import pool from "./config/db.js";
// import cors from "cors";
// import morgan from "morgan";
// import { generalLimiter } from "./utils/helpers/rateLimiter.js";
// import winston from "winston";
// import prisma from "./config/prismaClient.js";

// // Load environment variables from .env file
// dotenv.config();

// // Check required environment variables
// ["JWT_SECRET", "DATABASE_URL"].forEach((key) => {
//   if (!process.env[key]) {
//     console.error(`Missing required environment variable: ${key}`);
//     process.exit(1);
//   }
// });

// const app = express();
// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: '*', // You should restrict this to your client's URL in a production environment
//     methods: ['GET', 'POST'],
//   },
// });
// const PORT = process.env.PORT || 4000;

// // Set up CORS (allow all origins by default, customize as needed)
// app.use(cors({
//   origin: '*'
// }));

// // Set up HTTP request logging
// app.use(morgan("dev"));

// // Set up rate limiting for all requests (customize as needed)
// app.use(generalLimiter);

// // Winston logger setup (for errors)
// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [new winston.transports.Console()],
// });

// app.use(express.json());

// // Serve static files (uploaded images)
// app.use("/uploads", express.static("uploads"));

// // Health check endpoint
// app.get("/", (req, res) => {
//   res.send("\uD83D\uDE80 API is running");
// });

// // Public auth routes
// app.use("/api/auth", authRoutes);

// // Startup profile routes (protected)
// app.use("/api/startup", startupProfileRoutes);

// // Needs routes
// app.use("/api/needs", needsRoutes(io));

// // Host session routes
// // app.use("/api/host-sessions", hostSessionRoutes);

// // Post Routes
// app.use("/api/posts", postRoutes(io));

// // Comment Routes
// app.use("/api/comments", commentRoutes(io));

// // Like Routes
// app.use("/api", likeRoutes(io));

// // Trending Posts
// app.use("/api",trendingPostsRoutes);

// // Session Routes
// app.use('/api/sessions',sessionRoutes(io));

// // Needs Routes
// app.use("/api/needs", needsRoutes);

// // User Activity Routes
// app.use("/api/activities", userActivityRoutes);

// //  Notification System
// app.use('/api/notifications', notificationRoutes);
// // Socket.io connection handling
// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   socket.on('disconnect', () => {
//     console.log(`User disconnected: ${socket.id}`);
//   });
// });


// // Example protected route: get current user's profile
// app.get("/api/profile", authenticateToken, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const result = await pool.query(
//       `SELECT id, full_name AS "fullName", email, mobile, created_at AS "createdAt"
//        FROM users WHERE id = $1`,
//       [userId]
//     );
//     const user = result.rows[0];
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: {
//           code: "USER_NOT_FOUND",
//           message: "User not found",
//         },
//       });
//     }
//     res.json({
//       success: true,
//       data: { user },
//       message: "Profile retrieved successfully",
//     });
//   } catch (err) {
//     console.error("Profile error:", err);
//     res.status(500).json({
//       success: false,
//       error: {
//         code: "INTERNAL_ERROR",
//         message: "Internal server error",
//       },
//     });
//   }
// });

// // Centralized error handler
// app.use((err, req, res, next) => {
//   logger.error({
//     message: err.message,
//     stack: err.stack,
//     url: req.originalUrl,
//     method: req.method,
//   });
//   res
//     .status(err.status || 500)
//     .json({ error: err.message || "Internal server error" });
// });

// // Start the server
// httpServer.listen(PORT, () => {
//   console.log(`Server listening on http://localhost:${PORT}`);
// });
// src/index.js
import express from "express";
import { createServer } from 'http';
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import winston from "winston";
import path from 'path';
import { fileURLToPath } from 'url';

// Import Socket.IO initialization
import { initializeSocket } from "./services/socketManager.js";

// Import route factories
import authRoutes from "./routes/authRoutes.js";
import startupProfileRoutes from "./routes/startupProfileRoutes.js";
import createPostRoutes from "./routes/postRoutes.js";
import createCommentRoutes from "./routes/commentRoutes.js";
import createLikeRoutes from "./routes/likeRoutes.js";
import createNotificationRoutes from "./routes/notificationRoutes.js";
import trendingPostsRoutes from "./routes/trendingPostsRoutes.js";
import createSessionRoutes from './routes/sessionRoutes.js';
import createNeedsRoutes from "./routes/needsRoutes.js";
import userActivityRoutes from "./routes/userActivityRoutes.js";
import getFundedRoutes from './routes/getFundedRoutes.js';
import exploreRoutes from './routes/exploreRoutes.js';

// Import middleware and config
import { authenticateToken } from "./middleware/auth.js";
import pool from "./config/db.js";
import prisma from "./config/prismaClient.js";
import { generalLimiter } from "./utils/helpers/rateLimiter.js";

// Load environment variables from .env file
dotenv.config();

// Check required environment variables
["JWT_SECRET", "DATABASE_URL"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

const app = express();
const httpServer = createServer(app);

// Make resource files publicly accessible
app.use('/resources', express.static('public_resources'));

// Initialize Socket.IO with proper authentication
console.log('🔌 Initializing Socket.IO...');
const io = initializeSocket(httpServer);
// ADD THIS DEBUG CODE
console.log('====================================');
console.log('🔍 DEBUG: Socket.IO instance created:', !!io);
console.log('🔍 DEBUG: Socket.IO type:', typeof io);
console.log('🔍 DEBUG: Socket.IO engine:', !!io.engine);
console.log('====================================');

const PORT = process.env.PORT || 4000;

// Winston logger setup (for errors)
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ],
});

// Set up CORS (customize for production)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

// Set up HTTP request logging
app.use(morgan("dev"));

// Set up rate limiting for all requests
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images)
app.use("/uploads", express.static("uploads"));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "🚀 API is running",
    timestamp: new Date().toISOString(),
    socketConnections: io.engine.clientsCount || 0
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    socketConnections: io.engine.clientsCount || 0,
    database: "connected", // You can add actual DB health check here
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==========================================
// ROUTES - Order matters!
// ==========================================

// Public auth routes (no io needed)
app.use("/api/auth", authRoutes);

// Startup profile routes (protected, no io needed)
app.use("/api/startup", startupProfileRoutes);

// Trending Posts (no io needed)
app.use("/api", trendingPostsRoutes);

// User Activity Routes (no io needed)
app.use("/api/activities", userActivityRoutes);

// Get Funded Resources Routes (no io needed)
app.use('/api/get-funded', getFundedRoutes);

app.use('/api/explore', exploreRoutes);

// Routes that need Socket.IO - pass io instance
app.use("/api/posts", createPostRoutes(io));
app.use("/api/comments", createCommentRoutes(io));
app.use("/api", createLikeRoutes(io)); // Like routes use /api/posts/:postId/likes
app.use("/api/sessions", createSessionRoutes(io));
app.use("/api/needs", createNeedsRoutes(io));
app.use("/api/notifications", createNotificationRoutes(io));

// Example protected route: get current user's profile
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Using Prisma instead of raw SQL (recommended)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        full_name: true,
        email: true,
        mobile: true,
        created_at: true,
        role: true,
        is_verified: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    res.json({
      success: true,
      data: { 
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          isVerified: user.is_verified,
          createdAt: user.created_at
        }
      },
      message: "Profile retrieved successfully",
    });
  } catch (err) {
    console.error("Profile error:", err);
    logger.error('Profile fetch error:', err);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    });
  }
});

// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Centralized error handler - must be last
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });
  
  res.status(err.status || 500).json({ 
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO enabled and listening`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Client URL: ${process.env.CLIENT_URL || '*'}`);
  console.log('=================================');
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} signal received: closing HTTP server`);
  
  httpServer.close(async () => {
    console.log('HTTP server closed');
    
    // Close database connections
    try {
      await prisma.$disconnect();
      console.log('Database disconnected');
    } catch (error) {
      console.error('Error disconnecting database:', error);
    }
    
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error('Unhandled Rejection:', { reason, promise });
});

export { io, httpServer };