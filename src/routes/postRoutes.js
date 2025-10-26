import express from "express";
import {
  createPost,
  getPost,
  updatePost,
  deletePost,
  getAllPosts,
} from "../controllers/postController.js";
import { authenticateToken } from "../middleware/auth.js";

export default (io) => {
  const router = express.Router();

  // Create post - pass io to controller
  router.post("/", authenticateToken, (req, res) => {
    createPost(req, res, io);
  });

  // Get all posts
  router.get("/", getAllPosts);

  // Get single post
  router.get("/:id", getPost);

  // Update post
  router.put("/:id", authenticateToken, updatePost);

  // Delete post
  router.delete("/:id", authenticateToken, deletePost);
  
  return router;
};