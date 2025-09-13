import prisma from "../config/prismaClient.js";

// ✅ Create Comment
export const createComment = async ({userId, postId, content}) => {
  try {
    const newComment = await prisma.comment.create({
      data: {
        user_id: userId,
        post_id: postId,
        content: content
      }
    });
    return newComment;
  } catch (error) {
    throw new Error("Error creating comment");
  }
}

// deleteComment (the person who created the comment can delete it)
export const deleteComment = async ({commentId, userId}) => {
  try {
    const deletedComment = await prisma.comment.delete({
      where: { id: commentId, user_id: userId }
    });
    return deletedComment;
  } catch (error) {
    console.error("Error deleting comment");
  }
}

// edit comment (the person who created the comment can edit it)
export const editComment = async ({commentId, userId, content}) => {
  try {
    const updatedComment = await prisma.comment.update({
      where: { id: commentId, user_id: userId },
      data: { content }
    });
    return updatedComment;
  } catch (error) {
    throw error;
  }
}