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

// 3. Get trending startups
export const getTrendingStartups = async (req, res) => {
  try {
    // Fetch the single startup of the week
    const startupOfTheWeek = await prisma.startupProfile.findFirst({
      where: { isStartupOfTheWeek: true },
      include: {
        // Include related data needed for the card
        user: { select: { id: true } }, // Useful for linking later
        company_details: {
          select: {
            company_name: true,
            company_description: true,
            industry: true, // Used for 'category'
          }
        },
        business_details: {
          select: {
            funding_stage: true, // Used for 'funding'
            team_size: true, // Used for 'team'
            // Add 'revenue' here if you want to display growth based on it
            // revenue: true, 
          }
        },
      },
    });

    // Fetch up to 3 other trending startups
    const trendingStartups = await prisma.startupProfile.findMany({
      where: {
        isTrending: true,
        isStartupOfTheWeek: false, // Exclude the weekly one
      },
      include: {
        user: { select: { id: true } },
        company_details: {
          select: {
            company_name: true,
            company_description: true,
            industry: true,
          }
        },
        business_details: {
          select: {
            funding_stage: true,
            team_size: true,
            // revenue: true, 
          }
        },
      },
      orderBy: {
        updated_at: 'desc', // Show the most recently updated ones
      },
      take: 3, // Limit to 3 for the grid
    });

    res.status(200).json({ startupOfTheWeek, trendingStartups });
  } catch (error) {
    console.error("Error fetching trending startups:", error); // Log the error
    res.status(500).json({ message: 'Error fetching trending startups', error: error.message });
  }
};