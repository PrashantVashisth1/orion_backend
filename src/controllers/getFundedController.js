import prisma from '../config/prismaClient.js';

// Get all resources, grouped by category
export const getResources = async (req, res) => {
  try {
    const categories = await prisma.resourceCategory.findMany({
      include: {
        files: true, // Include all related files for each category
      },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources', error: error.message });
  }
};