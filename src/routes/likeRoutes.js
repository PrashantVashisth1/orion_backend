import express from "express";
import { likePost, unlikePost, getLikeCount, getLikes } from "../controllers/likeController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Like a post
router.post("/posts/:postId/likes", authenticateToken, likePost);

// Unlike a post
router.delete("/posts/:postId/likes", authenticateToken, unlikePost);

// Get all likes for a post
router.get("/posts/:postId/likes", getLikes);

// Get like count for a post
router.get("/posts/:postId/likes/count", getLikeCount);
  
export default router;