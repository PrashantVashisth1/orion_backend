import * as commentModel from "../models/commentModel.js";

// ✅ Create Comment
export const createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id; // From authenticateToken middleware
    if(!userId || !postId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newComment = await commentModel.createComment({ userId, postId, content });
    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: newComment
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message
    });
  }
}

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
