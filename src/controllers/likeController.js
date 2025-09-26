// import * as likeModel from "../models/likeModel.js";

// // Like a post
// export const likePost = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     // const userId = 2;
//     const postId = parseInt(req.params.postId, 10);
//     console.log(userId, postId);

//     const newLike = await likeModel.createLike({ userId, postId });

//     if (!newLike) {
//       return res.status(400).json({
//         success: false,
//         message: "You have already liked this post",
//       });
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Post liked successfully",
//       data: newLike,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error liking post",
//       error: error.message,
//     });
//   }
// };


// likeController.js
import * as likeModel from "../models/likeModel.js";
import prisma from "../config/prismaClient.js"; // Needed to look up the post author
import { createNotificationForUser } from './notificationController.js'; // Added import
import { getPost } from './postController.js'; // Assuming you can access getPost to fetch post data

// Like a post
export const likePost = async (req, res, io) => { // Added 'io' parameter
  try {
    const likerId = req.user.id;
    const postId = parseInt(req.params.postId, 10);
    
    // 1. Create the Like
    const newLike = await likeModel.createLike({ userId: likerId, postId });

    if (!newLike) {
      return res.status(400).json({ success: false, message: "You have already liked this post" });
    }
    
    // 2. Fetch Post Author ID for Notification
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { user_id: true }
    });
    
    if (!post) {
        // Log an error but proceed since the like was successfully created.
        console.error(`Post with ID ${postId} not found for notification.`);
    } else if (post.user_id !== likerId) { // Do not notify if author likes their own post
        const likerName = req.user.full_name || "Someone";
        const notificationMessage = `${likerName} liked your post.`;
        const postAuthorId = post.user_id;

        // a. Send real-time notification to the post author (target specific user)
        if (io) {
            io.to(postAuthorId.toString()).emit('new-like-notification', { message: notificationMessage, postId });
        }
        
        // b. Create persistent notification for the post author
        createNotificationForUser({ message: notificationMessage, recipientId: postAuthorId, postId });
    }

    return res.status(201).json({ success: true, message: "Post liked successfully", data: newLike });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error liking post", error: error.message });
  }
};

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
