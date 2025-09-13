import { createComment, deleteComment, editComment } from "../controllers/commentController.js";
import express from "express";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();

// ✅ Create Comment
router.post("/", authenticateToken, createComment);
// ✅ Delete Comment
router.delete("/:commentId", authenticateToken, deleteComment);
// ✅ Edit Comment
router.put("/:commentId", authenticateToken, editComment);

export default router;
