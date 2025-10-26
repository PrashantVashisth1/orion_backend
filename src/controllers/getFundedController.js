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

// Handle pitch deck submission for funding opportunity
export const submitForFunding = async (req, res) => {
  // req.user comes from the 'auth' middleware
  console.log('--- submitForFunding Controller ---'); // <-- Log entry point
  console.log('req.user:', req.user); // <-- Log user (from auth)
  console.log('req.file:', req.file); // <-- Log file (from multer)
  console.log('req.body:', req.body);
  const { id: userId } = req.user; 

  // req.file comes from the 'fileUpload' (multer-s3) middleware
  if (!req.file) {
    return res.status(400).json({ message: 'No pitch deck file uploaded.' });
  }

  // Extract file details provided by multer-s3
  const { originalname: fileName, location: filePath } = req.file; 
  // 'location' is the S3 URL

  try {
    // Create a record in the database
    const submission = await prisma.fundingSubmission.create({
      data: {
        userId: parseInt(userId, 10), // Ensure userId is an integer
        fileName: fileName,
        filePath: filePath, // Store the S3 URL
        status: "SUBMITTED", // Initial status
      },
    });

    // Send success response
    res.status(201).json({ 
      message: 'Pitch deck submitted successfully!', 
      submission: {
        id: submission.id,
        fileName: submission.fileName,
        submittedAt: submission.createdAt,
      } 
    });

  } catch (error) {
    console.error("Error submitting pitch deck:", error);
    // Consider deleting the uploaded S3 file if DB insert fails (optional cleanup)
    res.status(500).json({ message: 'Error saving submission record', error: error.message });
  }
};