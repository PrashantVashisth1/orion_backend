// import express from "express";
// import { likePost, unlikePost, getLikeCount, getLikes } from "../controllers/likeController.js";
// import { authenticateToken } from "../middleware/auth.js";

// // const router = express.Router();

// // // Like a post
// // router.post("/posts/:postId/likes", authenticateToken, likePost);

// // // Unlike a post
// // router.delete("/posts/:postId/likes", authenticateToken, unlikePost);

// // // Get all likes for a post
// // router.get("/posts/:postId/likes", getLikes);

// // // Get like count for a post
// // router.get("/posts/:postId/likes/count", getLikeCount);
  
// // export default router;

// export default (io) => {
//   const router = express.Router();

// // Like a post
// router.post("/posts/:postId/likes", authenticateToken,(req,res) => likePost(req,res,io));

// // Unlike a post
// router.delete("/posts/:postId/likes", authenticateToken, unlikePost);

// // Get all likes for a post
// router.get("/posts/:postId/likes", getLikes);

// // Get like count for a post
// router.get("/posts/:postId/likes/count", getLikeCount);
  
//   return router;
// };

import express from "express";
import { likePost, unlikePost, getLikeCount, getLikes } from "../controllers/likeController.js";
import { authenticateToken } from "../middleware/auth.js";

export default (io) => {
  console.log('🔍 [ROUTE] likeRoutes received io:', !!io);
  const router = express.Router();

  // Like a post - pass io to controller
  router.post("/posts/:postId/likes", authenticateToken, (req, res) => {
    console.log('🔍 [ROUTE] Inside like route, io available:', !!io);
    likePost(req, res, io);
  });

  // Unlike a post
  router.delete("/posts/:postId/likes", authenticateToken, unlikePost);

  // Get all likes for a post
  router.get("/posts/:postId/likes", getLikes);

  // Get like count for a post
  router.get("/posts/:postId/likes/count", getLikeCount);
  
  return router;
};