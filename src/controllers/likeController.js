
// // likeController.js
// import * as likeModel from "../models/likeModel.js";
// import prisma from "../config/prismaClient.js"; // Needed to look up the post author
// import { getPost } from './postController.js'; 

// // Like a post
// export const likePost = async (req, res, io) => { // Added 'io' parameter
//   try {
//     const likerId = req.user.id;
//     const postId = parseInt(req.params.postId, 10);
    
//     // 1. Create the Like
//     const newLike = await likeModel.createLike({ userId: likerId, postId });

//     if (!newLike) {
//       return res.status(400).json({ success: false, message: "You have already liked this post" });
//     }
    
//     // 2. Fetch Post Author ID for Notification
//     const post = await prisma.post.findUnique({
//         where: { id: postId },
//         select: { user_id: true }
//     });

//     return res.status(201).json({ success: true, message: "Post liked successfully", data: newLike });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: "Error liking post", error: error.message });
//   }
// };

// // Unlike a post
// export const unlikePost = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const postId = parseInt(req.params.postId, 10);

//     const deleted = await likeModel.deleteLike({ userId, postId });

//     if (deleted.count === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Like not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Post unliked successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error unliking post",
//       error: error.message,
//     });
//   }
// };

// // Get all likes for a post
// export const getLikes = async (req, res) => {
//   try {
//     const postId = parseInt(req.params.postId, 10);
//     const likes = await likeModel.getLikesForPost(postId);

//     return res.status(200).json({
//       success: true,
//       message: "Likes fetched successfully",
//       data: likes,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching likes",
//       error: error.message,
//     });
//   }
// };

// // Get like count for a post
// export const getLikeCount = async (req, res) => {
//   try {
//     const postId = parseInt(req.params.postId, 10);
//     const count = await likeModel.getLikeCountForPost(postId);

//     return res.status(200).json({
//       success: true,
//       message: "Like count fetched successfully",
//       data: { count },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching like count",
//       error: error.message,
//     });
//   }
// };
import * as likeModel from "../models/likeModel.js";
import prisma from "../config/prismaClient.js";
import * as notificationService from "../services/notificationService.js";
import { emitToUser } from "../services/socketManager.js";

// export const likePost = async (req, res, io) => {
//   try {
//     const likerId = req.user.id;
//     const postId = parseInt(req.params.postId, 10);
    
//     // 1. Create the Like
//     const newLike = await likeModel.createLike({ userId: likerId, postId });
    
//     if (!newLike) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "You have already liked this post" 
//       });
//     }
    
//     // 2. Fetch Post Author and Liker info
//     const [post, liker] = await Promise.all([
//       prisma.post.findUnique({
//         where: { id: postId },
//         select: { 
//           user_id: true,
//           text: true
//         }
//       }),
//       prisma.user.findUnique({
//         where: { id: likerId },
//         select: { full_name: true }
//       })
//     ]);
    
//     // 3. Don't notify if user likes their own post
//     if (post && post.user_id !== likerId) {
//       const message = `${liker.full_name} liked your post`;
      
//       // Create notification in database
//       const notification = await notificationService.createNotification({
//         userId: post.user_id,
//         message,
//         postId
//       });
      
//       // Emit real-time notification via Socket.IO
//       if (io) {
//         await emitToUser(io, post.user_id, notification);
//       }
//     }
    
//     return res.status(201).json({ 
//       success: true, 
//       message: "Post liked successfully", 
//       data: newLike 
//     });
//   } catch (error) {
//     console.error('Like post error:', error);
//     return res.status(500).json({ 
//       success: false, 
//       message: "Error liking post", 
//       error: error.message 
//     });
//   }
// };

export const likePost = async (req, res, io) => {
  console.log('🔍 [LIKE] Starting likePost controller');
  console.log('🔍 [LIKE] io is available:', !!io);
  console.log('🔍 [LIKE] User ID:', req.user?.id);
  console.log('🔍 [LIKE] Post ID:', req.params.postId);
  
  try {
    const likerId = req.user.id;
    const postId = parseInt(req.params.postId, 10);
    
    // 1. Create the Like
    const newLike = await likeModel.createLike({ userId: likerId, postId });
    
    if (!newLike) {
      console.log('⚠️ [LIKE] User already liked this post');
      return res.status(400).json({ 
        success: false, 
        message: "You have already liked this post" 
      });
    }
    
    console.log('✅ [LIKE] Like created successfully');
    
    // 2. Fetch Post Author and Liker info
    const [post, liker] = await Promise.all([
      prisma.post.findUnique({
        where: { id: postId },
        select: { 
          user_id: true,
          text: true
        }
      }),
      prisma.user.findUnique({
        where: { id: likerId },
        select: { full_name: true }
      })
    ]);
    
    console.log('🔍 [LIKE] Post author ID:', post?.user_id);
    console.log('🔍 [LIKE] Liker name:', liker?.full_name);
    
    // 3. Don't notify if user likes their own post
    if (post && post.user_id !== likerId) {
      const message = `${liker.full_name} liked your post`;
      console.log('📝 [LIKE] Creating notification:', message);
      
      // Create notification in database
      const notification = await notificationService.createNotification({
        userId: post.user_id,
        message,
        postId
      });
      
      console.log('✅ [LIKE] Notification created in DB:', notification.id);
      
      // Emit real-time notification via Socket.IO
      if (io) {
        console.log('📡 [LIKE] Emitting notification via Socket.IO to user:', post.user_id);
        await emitToUser(io, post.user_id, notification);
        console.log('✅ [LIKE] Notification emitted successfully');
      } else {
        console.error('❌ [LIKE] io is undefined! Cannot emit notification');
      }
    } else {
      console.log('ℹ️ [LIKE] Not sending notification (user liked own post)');
    }
    
    return res.status(201).json({ 
      success: true, 
      message: "Post liked successfully", 
      data: newLike 
    });
  } catch (error) {
    console.error('❌ [LIKE] Error in likePost:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Error liking post", 
      error: error.message 
    });
  }
}

// Unlike a post
export const unlikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.postId, 10);

    const deleted = await likeModel.deleteLike({ userId, postId });

    if (deleted.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Like not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post unliked successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error unliking post",
      error: error.message,
    });
  }
};

// Get all likes for a post
export const getLikes = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const likes = await likeModel.getLikesForPost(postId);

    return res.status(200).json({
      success: true,
      message: "Likes fetched successfully",
      data: likes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching likes",
      error: error.message,
    });
  }
};

// Get like count for a post
export const getLikeCount = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const count = await likeModel.getLikeCountForPost(postId);

    return res.status(200).json({
      success: true,
      message: "Like count fetched successfully",
      data: { count },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching like count",
      error: error.message,
    });
  }
};