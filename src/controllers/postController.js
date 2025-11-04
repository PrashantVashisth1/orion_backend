// // postController.js
// import * as postModel from "../models/postModel.js";

// // ✅ Create Post
// export const createPost = async (req, res,io) => {
//   try {
//     const userId = req.user.id; // assuming user is set in middleware
//     const { text, images, documents } = req.body;
//     if (!text) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Post text is required" });
//     }

//     const post = await postModel.createPost({
//       userId,
//       text,
//       images,
//       documents,
//     });
//     const authorName = post.author?.full_name || "A user";

//     res.status(201).json({ success: true, data: post });
//   } catch (error) {
//     console.error("Error creating post:", error);
//     res.status(500).json({ success: false, message: "Failed to create post" });
//   }
// };

// // ✅ Get Single Post
// export const getPost = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const post = await postModel.getPost(parseInt(id));

//     if (!post)
//       return res
//         .status(404)
//         .json({ success: false, message: "Post not found" });

//     res.json({ success: true, data: post });
//   } catch (error) {
//     console.error("Error fetching post:", error);
//     res.status(500).json({ success: false, message: "Failed to fetch post" });
//   }
// };

// // ✅ Update Post
// export const updatePost = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { id } = req.params;
//     const { text, images, documents, published } = req.body;

//     // Validation
//     if (!text) {
//       return res.status(400).json({
//         success: false,
//         message: "Post text is required",
//       });
//     }

//     // Validate arrays if provided
//     if (images && !Array.isArray(images)) {
//       return res.status(400).json({
//         success: false,
//         message: "Images must be an array",
//       });
//     }

//     if (documents && !Array.isArray(documents)) {
//       return res.status(400).json({
//         success: false,
//         message: "Documents must be an array",
//       });
//     }

//     const updatedPost = await postModel.updatePost({
//       postId: parseInt(id),
//       userId,
//       text,
//       images,
//       documents,
//       published,
//     });

//     if (!updatedPost) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized or post not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Post updated successfully",
//       data: updatedPost,
//     });
//   } catch (error) {
//     console.error("Error updating post:", error);
//     res.status(500).json({ success: false, message: "Failed to update post" });
//   }
// };

// // ✅ Delete Post
// export const deletePost = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { id } = req.params;

//     const result = await postModel.deletePost({ postId: parseInt(id), userId });

//     if (result.count === 0) {
//       return res
//         .status(403)
//         .json({ success: false, message: "Not authorized or post not found" });
//     }

//     res.json({ success: true, message: "Post deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting post:", error);
//     res.status(500).json({ success: false, message: "Failed to delete post" });
//   }
// };

// // ✅ Get All Posts
// export const getAllPosts = async (req, res) => {
//   try {
//     const posts = await postModel.getAllPosts();
//     res.json({ success: true, data: posts });
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     res.status(500).json({ success: false, message: "Failed to fetch posts" });
//   }
// };
import prisma from "../config/prismaClient.js";
import * as postModel from "../models/postModel.js";
import * as notificationService from "../services/notificationService.js";
import { broadcastExceptUser } from "../services/socketManager.js";

const postInclude = {
  author: {
    select: {
      id: true,
      full_name: true,
      role: true,
      startup_profile: {
        select: {
          personal_info: {
            select: {
              profile_picture: true,
            },
          },
          company_details: {
            select: {
              company_logo: true,
              company_name: true,
            },
          },
        },
      },
    },
  },
  likes: {
    select: { user_id: true },
  },
  comments: {
    include: {
      // --- THIS IS THE FIX ---
      user: { // Changed from 'author' to 'user' to match your schema
      // --- END OF FIX ---
        select: {
          id: true,
          full_name: true,
          role: true,
          startup_profile: {
            select: {
              personal_info: { select: { profile_picture: true } },
              company_details: {
                select: { company_logo: true, company_name: true },
              },
            },
          },
        },
      },
    },
    orderBy: {
      created_at: 'asc',
    },
  },
  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },
};

export const createPost = async (req, res, io) => {
  try {
    const userId = req.user.id;
    const { text, images, documents } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: "Post text is required" 
      });
    }

    // 1. Create the post
    const post = await postModel.createPost({
      userId,
      text,
      images,
      documents,
    });
    
    const authorName = post.author?.full_name || "A user";
    
    // 2. Notify all users except the author
    const message = `${authorName} created a new post`;
    
    // Get all active users except the post author
    const userIds = await notificationService.getAllActiveUserIds(userId);
    
    // Create bulk notifications for all users
    const notifications = userIds.map(uid => ({
      userId: uid,
      message,
      postId: post.id,
      isRead: false
    }));
    
    if (notifications.length > 0) {
      await notificationService.createBulkNotifications(notifications);
      
      // Broadcast to all users via Socket.IO
      if (io) {
        const notification = {
          message,
          postId: post.id,
          createdAt: new Date(),
          isRead: false,
          post: {
            id: post.id,
            text: post.text,
            author: {
              id: userId,
              full_name: authorName
            }
          }
        };
        await broadcastExceptUser(io, userId, notification);
      }
    }

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create post" 
    });
  }
};

// ✅ Get Single Post
export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postModel.getPost(parseInt(id));

    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    res.json({ success: true, data: post });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ success: false, message: "Failed to fetch post" });
  }
};

// ✅ Update Post
export const updatePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { text, images, documents, published } = req.body;

    // Validation
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Post text is required",
      });
    }

    // Validate arrays if provided
    if (images && !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: "Images must be an array",
      });
    }

    if (documents && !Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        message: "Documents must be an array",
      });
    }

    const updatedPost = await postModel.updatePost({
      postId: parseInt(id),
      userId,
      text,
      images,
      documents,
      published,
    });

    if (!updatedPost) {
      return res.status(403).json({
        success: false,
        message: "Not authorized or post not found",
      });
    }

    res.json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ success: false, message: "Failed to update post" });
  }
};

// ✅ Delete Post
export const deletePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await postModel.deletePost({ postId: parseInt(id), userId });

    if (result.count === 0) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized or post not found" });
    }

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ success: false, message: "Failed to delete post" });
  }
};

// ✅ Get All Posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: postInclude,
    });
    console.log(posts)
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};