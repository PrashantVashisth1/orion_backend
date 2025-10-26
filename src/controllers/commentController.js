
// // commentController.js
// import * as commentModel from "../models/commentModel.js";
// import prisma from "../config/prismaClient.js"; // Needed to look up the post author

// // ✅ Create Comment
// export const createComment = async (req, res, io) => { // Added 'io' parameter
//   try {
//     const { postId, content } = req.body;
//     const commenterId = req.user.id;
//     
//     if(!commenterId || !postId || !content) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }
    
//     // 1. Create the Comment
//     const newComment = await commentModel.createComment({ userId: commenterId, postId, content });
    
//     // 2. Fetch Post Author ID for Notification
//     const post = await prisma.post.findUnique({
//         where: { id: postId },
//         select: { user_id: true }
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Comment created successfully",
//       data: newComment
//     })
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error creating comment",
//       error: error.message
//     });
//   }
// }

// // deleteComment
// export const deleteComment = async (req, res) => {
//   try {
//     const userId = req.user?.id; // from auth middleware
//     const commentId = parseInt(req.params.commentId, 10);

//     if (!userId || isNaN(commentId)) {
//       return res.status(400).json({ message: "Missing or invalid fields" });
//     }

//     const deletedComment = await commentModel.deleteComment({ commentId, userId });
//     if (!deletedComment) {
//       return res.status(404).json({
//         message: "Comment not found or not authorized to delete",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Comment deleted successfully",
//       data: deletedComment,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error deleting comment",
//       error: error.message,
//     });
//   }
// };

// // editComment
// export const editComment = async (req, res) => {
//   try {
//     const userId = req.user?.id; // from auth middleware
//     const commentId = parseInt(req.params.commentId, 10);
//     const { content } = req.body;

//     if (!userId || isNaN(commentId) || !content) {
//       return res.status(400).json({ message: "Missing or invalid fields" });
//     }

//     console.log(userId, commentId, content);

//     const updatedComment = await commentModel.editComment({ commentId, userId, content });
//     if (!updatedComment) {
//       return res.status(404).json({
//         message: "Comment not found or not authorized to edit",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Comment updated successfully",
//       data: updatedComment,
//     });
//   } catch (error) {
//     console.error("Error editing comment");
//     res.status(500).json({
//       success: false,
//       message: "Error editing comment",
//       error: error.message,
//     });
//   }
// }
import * as commentModel from "../models/commentModel.js";
import prisma from "../config/prismaClient.js";
import * as notificationService from "../services/notificationService.js";
import { emitToUser } from "../services/socketManager.js";

export const createComment = async (req, res, io) => {
  try {
    const { postId, content } = req.body;
    const commenterId = req.user.id;
    
    if (!commenterId || !postId || !content) {
      return res.status(400).json({ 
        message: "Missing required fields" 
      });
    }
    
    // 1. Create the Comment
    const newComment = await commentModel.createComment({ 
      userId: commenterId, 
      postId, 
      content 
    });
    
    // 2. Fetch Post Author and Commenter info
    const [post, commenter] = await Promise.all([
      prisma.post.findUnique({
        where: { id: postId },
        select: { 
          user_id: true,
          text: true
        }
      }),
      prisma.user.findUnique({
        where: { id: commenterId },
        select: { full_name: true }
      })
    ]);
    
    // 3. Don't notify if user comments on their own post
    if (post && post.user_id !== commenterId) {
      const message = `${commenter.full_name} commented on your post`;
      
      // Create notification in database
      const notification = await notificationService.createNotification({
        userId: post.user_id,
        message,
        postId
      });
      console.log(notification);
      // Emit real-time notification via Socket.IO
      if (io) {
        await emitToUser(io, post.user_id, notification);
      }
    }
    
    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: newComment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message
    });
  }
};

// deleteComment
export const deleteComment = async (req, res) => {
  try {
    const userId = req.user?.id; // from auth middleware
    const commentId = parseInt(req.params.commentId, 10);

    if (!userId || isNaN(commentId)) {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    const deletedComment = await commentModel.deleteComment({ commentId, userId });
    if (!deletedComment) {
      return res.status(404).json({
        message: "Comment not found or not authorized to delete",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      data: deletedComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    });
  }
};

// editComment
export const editComment = async (req, res) => {
  try {
    const userId = req.user?.id; // from auth middleware
    const commentId = parseInt(req.params.commentId, 10);
    const { content } = req.body;

    if (!userId || isNaN(commentId) || !content) {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    console.log(userId, commentId, content);

    const updatedComment = await commentModel.editComment({ commentId, userId, content });
    if (!updatedComment) {
      return res.status(404).json({
        message: "Comment not found or not authorized to edit",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error editing comment");
    res.status(500).json({
      success: false,
      message: "Error editing comment",
      error: error.message,
    });
  }
}