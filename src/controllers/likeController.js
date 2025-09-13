import * as likeModel from "../models/likeModel.js";

// Like a post
export const likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    // const userId = 2;
    const postId = parseInt(req.params.postId, 10);
    console.log(userId, postId);

    const newLike = await likeModel.createLike({ userId, postId });

    if (!newLike) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this post",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Post liked successfully",
      data: newLike,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error liking post",
      error: error.message,
    });
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
