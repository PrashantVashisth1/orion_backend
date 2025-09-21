// postRoutes.js
import express from "express";
import {getTrendingPosts} from "../controllers/trendingPostsController.js";

const router = express.Router();

// middleware like authenticateToken should attach req.user
router.get("/trending-posts",getTrendingPosts);
export default router;
