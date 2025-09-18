import prisma from "../config/prismaClient.js";

// ✅ Create Post
export const createPost = async ({
  userId,
  text,
  images = [],
  documents = [],
}) => {
  return await prisma.post.create({
    data: {
      text,
      user_id: userId,
      ...(images.length > 0 && { images }),
      ...(documents.length > 0 && { documents }),
    },
    include: {
      author: true,
      likes: true,
      comments: true,
    },
  });
};

// ✅ Get Single Post
export const getPost = async (postId) => {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: { author: true, likes: true, comments: { include: { user: true } } },
  });
};

// ✅ Update Post (author only)
export const updatePost = async ({
  postId,
  userId,
  text,
  images,
  documents,
  published,
}) => {
  // First check if post exists and belongs to user
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      user_id: userId,
    },
  });

  if (!post) {
    return null;
  }

  // Update the post and return the updated data
  return await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      text,
      ...(images?.length >= 0 ? { images } : {}),
      ...(documents?.length >= 0 ? { documents } : {}),
      ...(published !== undefined && { published }),
      updated_at: new Date(),
    },
    include: {
      author: true,
      likes: true,
      comments: true,
    },
  });
};

// ✅ Delete Post (author only)
export const deletePost = async ({ postId, userId }) => {
  return await prisma.post.deleteMany({
    where: { id: postId, user_id: userId },
  });
};

// ✅ Get All Posts
export const getAllPosts = async () => {
  return await prisma.post.findMany({
    include: { author: true, likes: true, comments: { include: { user: true } } },
    orderBy: { created_at: "desc" },
  });
};
