// src/controllers/exploreController.js
import prisma from '../config/prismaClient.js';

/**
 * Get all startups for explore page with filtering and pagination
 */
export const getExploreStartups = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      industry,
      fundingStage,
      location,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause for filtering
    const where = {
      // is_complete: true, // Only show completed profiles
      AND: []
    };

    // Add filters
    if (industry) {
      where.AND.push({
        OR: [
          { business_details: { industry: { contains: industry, mode: 'insensitive' } } },
          { company_details: { industry: { contains: industry, mode: 'insensitive' } } }
        ]
      });
    }

    if (fundingStage) {
      where.AND.push({
        business_details: { funding_stage: { contains: fundingStage, mode: 'insensitive' } }
      });
    }

    if (location) {
      where.AND.push({
        OR: [
          { personal_info: { location: { contains: location, mode: 'insensitive' } } },
          { company_details: { company_location: { contains: location, mode: 'insensitive' } } }
        ]
      });
    }

    if (search) {
      where.AND.push({
        OR: [
          { company_details: { company_name: { contains: search, mode: 'insensitive' } } },
          { company_details: { company_description: { contains: search, mode: 'insensitive' } } },
          { company_details: { industry: { contains: search, mode: 'insensitive' } } }
        ]
      });
    }

    // Remove empty AND array if no filters
    if (where.AND.length === 0) {
      delete where.AND;
    }

    // Fetch startups with pagination
    const [startups, total] = await Promise.all([
      prisma.startupProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
              created_at: true
            }
          },
          personal_info: {
            select: {
              first_name: true,
              last_name: true,
              location: true,
              website: true,
              profile_picture: true
            }
          },
          business_details: {
            select: {
              job_title: true,
              industry: true,
              team_size: true,
              revenue: true,
              funding_stage: true,
              experience: true,
              linkedin_profile: true,
              twitter_profile: true
            }
          },
          company_details: {
            select: {
              company_name: true,
              company_logo: true,
              company_description: true,
              company_location: true,
              company_email: true,
              company_phone: true,
              company_website: true,
              founded_year: true,
              industry: true,
              vision: true,
              mission: true,
              team_size: true
            }
          },
          offerings: {
            select: {
              products: true,
              services: true,
              value_proposition: true,
              competitive_advantage: true
            }
          },
          interests: {
            select: {
              primary_industry: true,
              secondary_industry: true
            }
          }
        },
        orderBy: sortBy === 'created_at' ? { created_at: sortOrder } : { updated_at: sortOrder },
        skip,
        take: parseInt(limit)
      }),
      prisma.startupProfile.count({ where })
    ]);

    // Transform data to match frontend format
    const transformedStartups = startups.map(startup => {
      const isGrowing = startup.isTrending || true;
      const isHiring = true; // You can add a field for this in the database
      
      return {
        id: startup.user_id, // Use user_id as the public identifier
        name: startup.company_details?.company_name || startup.user.full_name,
        status: getStartupStatus(startup),
        statusColor: getStatusColor(startup),
        description: startup.company_details?.company_description || 
                    startup.offerings?.value_proposition || 
                    'Innovative startup transforming the industry',
        funding: startup.business_details?.funding_stage || 'Bootstrapped',
        team: startup.business_details?.team_size || startup.company_details?.team_size || '1-10',
        growth: calculateGrowth(startup),
        isGrowing,
        isHiring,
        founded: startup.company_details?.founded_year?.toString() || new Date(startup.created_at).getFullYear().toString(),
        location: startup.company_details?.company_location || startup.personal_info?.location || 'Remote',
        website: startup.company_details?.company_website || startup.personal_info?.website || '',
        email: startup.company_details?.company_email || startup.user.email,
        phone: startup.company_details?.company_phone || '',
        industry: startup.company_details?.industry || startup.business_details?.industry || 'Technology',
        mission: startup.company_details?.mission || 'Making a difference in the world',
        vision: startup.company_details?.vision || '',
        achievements: generateAchievements(startup),
        keyMetrics: generateKeyMetrics(startup),
        logo: startup.company_details?.company_logo || null,
        profilePicture: startup.personal_info?.profile_picture || null,
        products: startup.offerings?.products || [],
        services: startup.offerings?.services || [],
        socialLinks: {
          linkedin: startup.business_details?.linkedin_profile || '',
          twitter: startup.business_details?.twitter_profile || ''
        }
      };
    });

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        startups: transformedStartups,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching explore startups:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch startups',
        details: error.message
      }
    });
  }
};

/**
 * Get a single startup's public profile by user ID
 */
export const getStartupByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Valid user ID is required'
        }
      });
    }

    const startup = await prisma.startupProfile.findUnique({
      where: { user_id: parseInt(userId) },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            created_at: true
          }
        },
        personal_info: true,
        business_details: true,
        company_details: true,
        offerings: true,
        interests: true,
        technology_interests: true,
        partnership_interests: true,
        innovation_focus: true
      }
    });

    if (!startup) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Startup not found'
        }
      });
    }

    // Transform to match frontend format
    const transformedStartup = {
      id: startup.user_id,
      name: startup.company_details?.company_name || startup.user.full_name,
      status: getStartupStatus(startup),
      statusColor: getStatusColor(startup),
      description: startup.company_details?.company_description || '',
      funding: startup.business_details?.funding_stage || 'Bootstrapped',
      team: startup.business_details?.team_size || startup.company_details?.team_size || '1-10',
      growth: calculateGrowth(startup),
      isGrowing: startup.isTrending || false,
      isHiring: true,
      founded: startup.company_details?.founded_year?.toString() || new Date(startup.created_at).getFullYear().toString(),
      location: startup.company_details?.company_location || startup.personal_info?.location || 'Remote',
      website: startup.company_details?.company_website || startup.personal_info?.website || '',
      email: startup.company_details?.company_email || startup.user.email,
      phone: startup.company_details?.company_phone || '',
      industry: startup.company_details?.industry || startup.business_details?.industry || 'Technology',
      mission: startup.company_details?.mission || '',
      vision: startup.company_details?.vision || '',
      achievements: generateAchievements(startup),
      keyMetrics: generateKeyMetrics(startup),
      logo: startup.company_details?.company_logo || null,
      profilePicture: startup.personal_info?.profile_picture || null,
      products: startup.offerings?.products || [],
      services: startup.offerings?.services || [],
      socialLinks: {
        linkedin: startup.business_details?.linkedin_profile || '',
        twitter: startup.business_details?.twitter_profile || ''
      },
      // Full profile data
      fullProfile: {
        personalInfo: startup.personal_info,
        businessDetails: startup.business_details,
        companyDetails: startup.company_details,
        offerings: startup.offerings,
        interests: startup.interests,
        technologyInterests: startup.technology_interests,
        partnershipInterests: startup.partnership_interests,
        innovationFocus: startup.innovation_focus
      }
    };

    res.status(200).json({
      success: true,
      data: transformedStartup
    });
  } catch (error) {
    console.error('Error fetching startup:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch startup',
        details: error.message
      }
    });
  }
};

// Helper functions
function getStartupStatus(startup) {
  if (startup.isStartupOfTheWeek) return 'Startup of the Week';
  if (startup.isTrending) return 'Trending';
  
  const fundingStage = startup.business_details?.funding_stage?.toLowerCase() || '';
  
  if (fundingStage.includes('series') || fundingStage.includes('unicorn')) {
    return 'Growth Stage';
  }
  if (fundingStage.includes('seed')) {
    return 'Early Stage';
  }
  if (fundingStage.includes('pre-seed')) {
    return 'Seed Funded';
  }
  
  return 'Rising Star';
}

function getStatusColor(startup) {
  const status = getStartupStatus(startup);
  
  const colorMap = {
    'Startup of the Week': 'bg-yellow-500/20 text-yellow-800 border-yellow-500/30',
    'Trending': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Growth Stage': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Early Stage': 'bg-green-500/20 text-green-300 border-green-500/30',
    'Seed Funded': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'Rising Star': 'bg-orange-500/20 text-orange-700 border-orange-500/30'
  };
  
  return colorMap[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
}

function calculateGrowth(startup) {
  // You can implement actual growth calculation based on your metrics
  // For now, return a default value
  return '150%';
}

function generateAchievements(startup) {
  const achievements = [];
  
  if (startup.isStartupOfTheWeek) {
    achievements.push('Startup of the Week');
  }
  if (startup.isTrending) {
    achievements.push('Trending Startup');
  }
  if (startup.offerings?.certifications?.length > 0) {
    achievements.push(...startup.offerings.certifications.slice(0, 2));
  }
  
  // Add default achievements if empty
  if (achievements.length === 0) {
    achievements.push('Innovative Solution', 'Growing Team', 'Market Leader');
  }
  
  return achievements.slice(0, 3);
}

function generateKeyMetrics(startup) {
  return {
    revenue: startup.business_details?.revenue || 'Growing',
    customers: '1,000+', // You can add this field to the database
    retention: '90%+', // You can add this field to the database
    valuation: startup.business_details?.funding_stage || 'Bootstrapped'
  };
}