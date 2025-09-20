import prisma from "../config/prismaClient.js";

export const getUserActivities = async (userId) => {
  // Fetch all posts created by the user
  const posts = await prisma.post.findMany({
    where: { user_id: userId },
    include: { author: true, likes: true, comments: true },
    orderBy: { created_at: "desc" },
  });

  // Fetch all comments made by the user
  const comments = await prisma.comment.findMany({
    where: { user_id: userId },
    include: { post: { include: { author: true } } },
    orderBy: { created_at: "desc" },
  });

  // Fetch all likes made by the user
  const likes = await prisma.like.findMany({
    where: { user_id: userId },
    include: { post: { include: { author: true } } },
    orderBy: { created_at: "desc" },
  });

  // Fetch all sessions created by the user
  const sessions = await prisma.session.findMany({
    where: { userId: userId },
    include: { user: true },
    orderBy: { created_at: "desc" },
  });

  // Fetch all needs created by the user
  const needs = await prisma.need.findMany({
    where: { user_id: userId },
    include: { user: true },
    orderBy: { created_at: "desc" },
  });

  const activities = [
    ...posts.map((p) => ({ ...p, type: "POST" })),
    ...comments.map((c) => ({ ...c, type: "COMMENT" })),
    ...likes.map((l) => ({ ...l, type: "LIKE" })),
    ...sessions.map((s) => ({ ...s, type: "SESSION" })),
    ...needs.map((n) => ({ ...n, type: "NEED" })),
  ];

  // Sort all activities by creation date in descending order
  activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return activities;
};