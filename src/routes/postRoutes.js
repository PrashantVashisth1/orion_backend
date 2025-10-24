// // postRoutes.js
// import express from "express";
// import {
//   createPost,
//   getPost,
//   updatePost,
//   deletePost,
//   getAllPosts,
// } from "../controllers/postController.js";

// import { authenticateToken } from "../middleware/auth.js";

// // const router = express.Router();

// // // middleware like authenticateToken should attach req.user
// // // router.post("/", authenticateToken, createPost);
// // router.post("/", authenticateToken, (req, res) => createPost(req, res, io));
// // router.get("/", getAllPosts);
// // router.get("/:id", getPost);
// // router.put("/:id", authenticateToken, updatePost);
// // router.delete("/:id", authenticateToken, deletePost);
// // export default router;
// // This function now accepts both `io` and `prisma` as arguments
// export default (io) => {
//   const router = express.Router();

//   // Pass the `io` and `prisma` instances to the createPost controller
//   router.post("/", authenticateToken, (req, res) => createPost(req, res, io));
//   router.get("/", getAllPosts);
//   router.get("/:id", getPost);
//   router.put("/:id", authenticateToken, updatePost);
//   router.delete("/:id", authenticateToken, deletePost);
  
//   return router;
// };

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