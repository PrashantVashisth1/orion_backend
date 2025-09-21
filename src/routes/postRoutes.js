// postRoutes.js
import express from "express";
import {
  createPost,
  getPost,
  updatePost,
  deletePost,
  getAllPosts,
} from "../controllers/postController.js";

import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// middleware like authenticateToken should attach req.user
router.post("/", authenticateToken, createPost);
router.get("/", getAllPosts);
router.get("/:id", getPost);
router.put("/:id", authenticateToken, updatePost);
router.delete("/:id", authenticateToken, deletePost);
export default router;
