// src/index.js
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import startupProfileRoutes from "./routes/startupProfileRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import sessionRoutes from './routes/sessionRoutes.js';
import needsRoutes from "./routes/needsRoutes.js";
import { authenticateToken } from "./middleware/auth.js";
import pool from "./config/db.js";
import cors from "cors";
import morgan from "morgan";
import { generalLimiter } from "./utils/helpers/rateLimiter.js";
import winston from "winston";

// Load environment variables from .env file
dotenv.config();

// Check required environment variables
["JWT_SECRET", "DATABASE_URL"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

const app = express();
const PORT = process.env.PORT || 4000;

// Set up CORS (allow all origins by default, customize as needed)
app.use(cors());

// Set up HTTP request logging
app.use(morgan("dev"));

// Set up rate limiting for all requests (customize as needed)
app.use(generalLimiter);

// Winston logger setup (for errors)
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

app.use(express.json());

// Serve static files (uploaded images)
app.use("/uploads", express.static("uploads"));

// Health check endpoint
app.get("/", (req, res) => {
  res.send("\uD83D\uDE80 API is running");
});

// Public auth routes
app.use("/api/auth", authRoutes);

// Startup profile routes (protected)
app.use("/api/startup", startupProfileRoutes);

// Needs routes
app.use("/api/needs", needsRoutes);

// Host session routes
// app.use("/api/host-sessions", hostSessionRoutes);

// Post Routes
app.use("/api/posts", postRoutes);

// Comment Routes
app.use("/api/comments", commentRoutes);

// Like Routes
app.use("/api", likeRoutes);

// Session Routes
app.use('/api/sessions',sessionRoutes);

// Needs Routes
app.use("/api/needs", needsRoutes);

// Example protected route: get current user's profile
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT id, full_name AS "fullName", email, mobile, created_at AS "createdAt"
       FROM users WHERE id = $1`,
      [userId]
    );
    const user = result.rows[0];
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
      data: { user },
      message: "Profile retrieved successfully",
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    });
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
