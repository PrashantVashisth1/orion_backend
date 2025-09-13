import prisma from "../config/prismaClient.js";

export const createLike = async ({ userId, postId }) => {
  try {
    return await prisma.like.create({
      data: { user_id: userId, post_id: postId },
      // include: { user: true, post: true }, // optional: returns user & post info
    });
  } catch (error) {
    if (error.code === "P2002") {
      // Unique constraint violation: user already liked this post
      return null;
    }
    throw error;
  }
};

export const deleteLike = async ({ userId, postId }) => {
  try {
    return await prisma.like.deleteMany({
      where: { user_id: userId, post_id: postId },
    });
  } catch (error) {
    throw error;
  }
};

export const getLikesForPost = async (postId) => {
  return await prisma.like.findMany({
    where: { post_id: postId },
    include: { user: { select: { id: true, full_name: true, email: true } } },
  });
};


export const getLikeCountForPost = async (postId) => {
  return await prisma.like.count({ where: { post_id: postId } });
};