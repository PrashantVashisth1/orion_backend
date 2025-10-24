// import { createComment, deleteComment, editComment } from "../controllers/commentController.js";
// import express from "express";
// import { authenticateToken } from "../middleware/auth.js";
// // const router = express.Router();

// // // ✅ Create Comment
// // router.post("/", authenticateToken, createComment);
// // // ✅ Delete Comment
// // router.delete("/:commentId", authenticateToken, deleteComment);
// // // ✅ Edit Comment
// // router.put("/:commentId", authenticateToken, editComment);

// // export default router;

// export default (io) => {
//   const router = express.Router();

// // ✅ Create Comment
// router.post("/", authenticateToken,(req,res) => createComment(req,res,io));
// // ✅ Delete Comment
// router.delete("/:commentId", authenticateToken, deleteComment);
// // ✅ Edit Comment
// router.put("/:commentId", authenticateToken, editComment);

//   return router;
// };
import express from "express";
import { createComment, deleteComment, editComment } from "../controllers/commentController.js";
import { authenticateToken } from "../middleware/auth.js";

export default (io) => {
  const router = express.Router();

  // Create Comment - pass io to controller
  router.post("/", authenticateToken, (req, res) => {
    createComment(req, res, io);
  });

  // Delete Comment
  router.delete("/:commentId", authenticateToken, deleteComment);

  // Edit Comment
  router.put("/:commentId", authenticateToken, editComment);

  return router;
};