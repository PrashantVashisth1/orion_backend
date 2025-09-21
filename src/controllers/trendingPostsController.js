import prisma from "../config/prismaClient.js";


export const getTrendingPosts = async (req, res) => {
  try {
    // Aggregation query to find the top 5 most liked posts.
    // We group by post_id and count the likes for each post.
    const topPostsWithLikes = await prisma.like.groupBy({
      by: ['post_id'],
      _count: {
        post_id: true,
      },
      orderBy: {
        _count: {
          post_id: 'desc',
        },
      },
      take: 5,
    });

    // Extract the post IDs from the result
    const postIds = topPostsWithLikes.map(post => post.post_id);

    // Fetch the full post data for the top 5 posts,
    // including the author and comments relations as per the schema.
    const trendingPosts = await prisma.post.findMany({
      where: {
        id: {
          in: postIds,
        },
      },
      include: {
        author: true, // Include user data for the author of the post
        comments: true, // Include comments for each post
        likes: true, // Include likes to show the total count
      },
    });

    // Return the fetched posts
    res.status(200).json(trendingPosts);
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).json({ error: 'Failed to retrieve trending posts.' });
  }
};