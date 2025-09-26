// postController.js
import * as postModel from "../models/postModel.js";
import { 
    createNotificationsForAll, 
    createNotificationForUser 
} from './notificationController.js'; 

// ✅ Create Post
export const createPost = async (req, res,io) => {
  try {
    const userId = req.user.id; // assuming user is set in middleware
    const { text, images, documents } = req.body;
    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Post text is required" });
    }

    const post = await postModel.createPost({
      userId,
      text,
      images,
      documents,
    });
    const authorName = post.author?.full_name || "A user";
    const notificationMessage = `${authorName} has created a new post!`;

    // 1. Broadcast real-time notification to all users
    if (io) {
      io.emit('new-post-notification', { message: notificationMessage, post });
    }
    
    // 2. Create persistent notification for all users (excluding the author)
    // NOTE: This runs asynchronously and does not block the response
    createNotificationsForAll({ message: notificationMessage, authorId: userId, postId: post.id });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ success: false, message: "Failed to create post" });
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
    const posts = await postModel.getAllPosts();
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};

