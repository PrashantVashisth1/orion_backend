import {
  getStartupProfile,
  createStartupProfile,
  upsertPersonalInfo,
  upsertBusinessDetails,
  upsertCompanyDetails,
  upsertOfferings,
  upsertInterests,
  upsertTechnologyInterests,
  upsertPartnershipInterests,
  upsertInnovationFocus,
  updateCompletionPercentage,
  deleteStartupProfile
} from '../models/startupProfileModel.js';

import prisma from '../config/prismaClient.js';

import {
  personalInfoSchema,
  businessDetailsSchema,
  companyDetailsSchema,
  offeringsSchema,
  combinedSectionsSchema,
  // interestsSchema,
  technologyInterestsSchema,
  partnershipInterestsSchema,
  innovationFocusSchema,
  interestsAndRelatedSchema
} from "../utils/validation/startupProfileValidation.js";


/**
 * POST /api/profile/submit-for-review
 * @desc    Allows a startup to submit their completed profile for manual verification.
 * @access  Private (Startup only)
 */
export const submitForReview = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Find the user's main startup profile
    const startupProfile = await prisma.startupProfile.findUnique({
      where: { user_id: userId },
      include: {
        // Include all 5 sections to check them
        personal_info: true,
        company_details: true,
        business_details: true,
        interests: true,
        offerings: true,
      },
    });

    if (!startupProfile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "PROFILE_NOT_FOUND",
          message: "No profile data found. Please start by saving your Personal Info.",
        },
      });
    }

    // 2. --- Validation Check ---
    // We check if the records exist and if key required fields are filled.
    const errors = [];

    if (!startupProfile.personal_info || !startupProfile.personal_info.first_name) {
      errors.push("Personal Info");
    }
    if (!startupProfile.business_details || !startupProfile.business_details.job_title) {
      errors.push("Business Details");
    }
    if (!startupProfile.company_details || !startupProfile.company_details.company_name) {
      errors.push("Company Details");
    }
    if (!startupProfile.interests || !startupProfile.interests.primary_industry) {
      errors.push("Interests");
    }
    if (!startupProfile.offerings) {
      // Offerings has no strictly required fields in the schema, so we just check if it's been created.
      errors.push("Offerings");
    }

    // 3. If any checks failed, return a specific error
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INCOMPLETE_PROFILE",
          message: `Your profile is incomplete. Please fill out and save all required fields in the following sections: ${errors.join(
            ", "
          )}`,
        },
      });
    }

    // 4. --- Mark as Submitted ---
    // All checks passed! Update the USER model, not the profile model.
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        has_submitted_profile: true,
      },
    });

    // 5. Return success and the updated user data
    // (This helps the frontend update its auth state)
    res.status(200).json({
      success: true,
      message: "Profile submitted for review successfully!",
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          is_startup_verified: updatedUser.is_startup_verified,
          has_submitted_profile: updatedUser.has_submitted_profile,
        },
      },
    });
  } catch (error) {
    console.error("Error submitting for review:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An error occurred while submitting your profile.",
      },
    });
  }
};


/**
 * GET /api/startup/profile
 * Get user's startup profile with all sections
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const profile = await getStartupProfile(userId);
    console.log(profile)

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Startup profile not found'
        }
      });
    }

    return res.json({
      success: true,
      data: profile,
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

/**
 * Fetches a public startup profile by User ID.
 * Includes associated details needed for the profile page.
 */
export const getPublicStartupProfile = async (req, res) => {
  const { userId } = req.params; // Get userId from URL parameter

  if (!userId || isNaN(parseInt(userId, 10))) {
    return res.status(400).json({ message: 'Valid User ID is required.' });
  }

  const userIdInt = parseInt(userId, 10);

  try {
    const startupProfile = await prisma.startupProfile.findUnique({
      where: {
        user_id: userIdInt, // Find the profile linked to this user ID
      },
      include: {
        // Include all related data needed for the profile page
        user: { // Basic user info (needed for name, maybe email depending on privacy)
          select: {
            id: true,
            full_name: true,
            email: true, // Consider privacy implications
            created_at: true,
          }
        },
        personal_info: true,
        company_details: true,
        business_details: true,
        offerings: true,
        interests: true,
        // Include other relations if needed for the profile page
        // innovation_focus: true,
        // partnership_interests: true,
        // technology_interests: true,
      }
    });

    if (!startupProfile) {
      return res.status(404).json({ message: 'Startup profile not found for this user.' });
    }

    // Optionally, check if the user associated has the STARTUP role?
    // const user = await prisma.user.findUnique({ where: { id: userIdInt } });
    // if (!user || user.role !== 'STARTUP') {
    //   return res.status(404).json({ message: 'Profile not found or user is not a startup.' });
    // }


    res.status(200).json(startupProfile);

  } catch (error) {
    console.error("Error fetching public startup profile:", error);
    res.status(500).json({ message: 'Error fetching startup profile', error: error.message });
  }
};

/**
 * POST /api/startup/profile
 * Create a new startup profile
 */
export async function createProfile(req, res) {
  try {
    const userId = req.user.id;
    
    // Check if profile already exists
    const existingProfile = await getStartupProfile(userId);
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'PROFILE_EXISTS',
          message: 'Startup profile already exists'
        }
      });
    }

    const profile = await createStartupProfile(userId);
    
    return res.status(201).json({
      success: true,
      data: profile,
      message: 'Startup profile created successfully'
    });
  } catch (error) {
    console.error('Create profile error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

/**
 * DELETE /api/startup/profile
 * Delete user's startup profile
 */
export async function deleteProfile(req, res) {
  try {
    const userId = req.user.id;
    const deleted = await deleteStartupProfile(userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Startup profile not found'
        }
      });
    }

    return res.json({
      success: true,
      message: 'Startup profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

/**
 * GET /api/startup/profile/completion
 * Get profile completion status
 */
export async function getCompletionStatus(req, res) {
  try {
    // console.log("req user", req.user);
    const userId = req.user.id;
    const profile = await getStartupProfile(userId);

    if (!profile) {
      return res.json({
        success: true,
        data: {
          is_complete: false,
          completion_percentage: 0,
          profile_exists: false
        }
      });
    }

    return res.json({
      success: true,
      data: {
        is_complete: profile.is_complete,
        completion_percentage: profile.completion_percentage,
        profile_exists: true
      }
    });
  } catch (error) {
    console.error('Get completion status error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}


/**
 * PATCH /api/startup/profile/personal-info
 * Update personal information section
 */
export async function updatePersonalInfo(req, res) {
  try {
    const { error } = personalInfoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    // The middleware already checked and created the profile
    const profileId = req.profile.id;
    console.log("Request body:", req.body);
    const personalInfo = await upsertPersonalInfo(profileId, req.body);
    const completionPercentage = await updateCompletionPercentage(profileId);
    console.log("personalInfo:", personalInfo);

    return res.json({
      success: true,
      data: {
        personal_info: personalInfo,
        completion_percentage: completionPercentage
      },
      message: 'Personal information updated successfully'
    });
  } catch (error) {
    console.error('Update personal info error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

/**
 * PATCH /api/startup/profile/business-details
 * Update business details section
 */
export async function updateBusinessDetails(req, res) {
  try {
    const { error } = businessDetailsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    // The middleware already checked and created the profile
    const profileId = req.profile.id;

    const businessDetails = await upsertBusinessDetails(profileId, req.body);
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.json({
      success: true,
      data: {
        business_details: businessDetails,
        completion_percentage: completionPercentage
      },
      message: 'Business details updated successfully'
    });
  } catch (error) {
    console.error('Update business details error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

/**
 * PATCH /api/startup/profile/company-details
 * Update company details section
 */
export async function updateCompanyDetails(req, res) {
  try {
    const { error } = companyDetailsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    // The middleware already checked and created the profile
    const profileId = req.profile.id;

    const companyDetails = await upsertCompanyDetails(profileId, req.body);
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.json({
      success: true,
      data: {
        company_details: companyDetails,
        completion_percentage: completionPercentage
      },
      message: 'Company details updated successfully'
    });
  } catch (error) {
    console.error('Update company details error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

/**
 * PATCH /api/startup/profile/offerings
 * Update offerings section
 */
// export async function updateOfferings(req, res) {
//   try {
//     console.log(req.body);
//     const { error } = offeringsSchema.validate(req.body);
//     if (error) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: 'VALIDATION_ERROR',
//           message: 'Validation failed',
//           details: error.details.map(detail => ({
//             field: detail.path.join('.'),
//             message: detail.message
//           }))
//         }
//       });
//     }

//     // The middleware already checked and created the profile
//     const profileId = req.profile.id;

//     const offerings = await upsertOfferings(profileId, req.body);
//     const completionPercentage = await updateCompletionPercentage(profileId);

//     return res.json({
//       success: true,
//       data: {
//         offerings: offerings,
//         completion_percentage: completionPercentage
//       },
//       message: 'Offerings updated successfully'
//     });
//   } catch (error) {
//     console.error('Update offerings error:', error);
//     return res.status(500).json({
//       success: false,
//       error: {
//         code: 'INTERNAL_ERROR',
//         message: 'Internal server error'
//       }
//     });
//   }
// }

export async function updateOfferings(req, res) {
  try {
    // Clean and normalize the data before validation
    const cleanedBody = {
      ...req.body,
      // Ensure arrays are arrays, not strings
      products: Array.isArray(req.body.products) ? req.body.products : [],
      services: Array.isArray(req.body.services) ? req.body.services : [],
      revenue_streams: Array.isArray(req.body.revenue_streams) ? req.body.revenue_streams : [],
      partnerships: Array.isArray(req.body.partnerships) ? req.body.partnerships : [],
      certifications: Array.isArray(req.body.certifications) ? req.body.certifications : [],
      
      // Ensure strings are strings, not null/undefined
      pricing_model: req.body.pricing_model || '',
      target_market: req.body.target_market || '',
      competitive_advantage: req.body.competitive_advantage || '',
      value_proposition: req.body.value_proposition || '',
      business_model: req.body.business_model || '',
    };
    
    // Validate the cleaned data
    const { error, value } = offeringsSchema.validate(cleanedBody, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      console.log('Validation Error Details:', error.details);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value,
            type: typeof detail.context?.value
          }))
        }
      });
    }

    // Check if profile exists
    if (!req.profile || !req.profile.id) {
      console.log('Profile not found in request');
      return res.status(400).json({
        success: false,
        error: {
          code: 'PROFILE_ERROR',
          message: 'Profile not found'
        }
      });
    }

    const profileId = req.profile.id;

    const offerings = await upsertOfferings(profileId, value);

    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.json({
      success: true,
      data: {
        offerings: offerings,
        completion_percentage: completionPercentage
      },
      message: 'Offerings updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
}

/**
 * PATCH /api/startup/profile/interests
 * Update interests section
 */
export async function updateInterests(req, res) {
  try {
    const { error } = interestsAndRelatedSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    // The middleware already checked and created the profile
    const profileId = req.profile.id;

    const interests = await upsertInterests(profileId, req.body);
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.json({
      success: true,
      data: {
        interests: interests,
        completion_percentage: completionPercentage
      },
      message: 'Interests updated successfully'
    });
  } catch (error) {
    console.error('Update interests error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

/**
 * PATCH /api/startup/profile/technology-interests
 * Update technology interests section
 */
export async function updateTechnologyInterests(req, res) {
  try {
    const { error } = technologyInterestsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    // The middleware already checked and created the profile
    const profileId = req.profile.id;

    const technologyInterests = await upsertTechnologyInterests(profileId, req.body);
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.json({
      success: true,
      data: {
        technology_interests: technologyInterests,
        completion_percentage: completionPercentage
      },
      message: 'Technology interests updated successfully'
    });
  } catch (error) {
    console.error('Update technology interests error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

/**
 * PATCH /api/startup/profile/partnership-interests
 * Update partnership interests section
 */
export async function updatePartnershipInterests(req, res) {
  try {
    const { error } = partnershipInterestsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    // The middleware already checked and created the profile
    const profileId = req.profile.id;

    const partnershipInterests = await upsertPartnershipInterests(profileId, req.body);
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.json({
      success: true,
      data: {
        partnership_interests: partnershipInterests,
        completion_percentage: completionPercentage
      },
      message: 'Partnership interests updated successfully'
    });
  } catch (error) {
    console.error('Update partnership interests error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

/**
 * PATCH /api/startup/profile/innovation-focus
 * Update innovation focus section
 */
export async function updateInnovationFocus(req, res) {
  try {
    const { error } = innovationFocusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    // The middleware already checked and created the profile
    const profileId = req.profile.id;

    const innovationFocus = await upsertInnovationFocus(profileId, req.body);
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.json({
      success: true,
      data: {
        innovation_focus: innovationFocus,
        completion_percentage: completionPercentage
      },
      message: 'Innovation focus updated successfully'
    });
  } catch (error) {
    console.error('Update innovation focus error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

/**
 * Helper function to extract relevant data from the request body
 * @param {Object} body
 * @param {Array<string>} fields
 * @returns {Object}
 */
function extractData(body, fields) {
  const data = {};
  fields.forEach(field => {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  });
  return data;
}

/**
 * PATCH /api/startup/profile/combined-sections
 * Update multiple sections in a single request
 */
export async function updateCombinedSections(req, res) {
  try {
    const { error } = combinedSectionsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    // The middleware already checked and created the profile
    const profileId = req.profile.id;

    const result = {};
    
    // Define field maps for each section
    const interestsFields = ['primary_industry', 'secondary_industry', 'primary_target_market', 'geographic_focus', 'market_description', 'partnership_goals', 'innovation_description', 'future_goals'];
    const techFields = ['ai_ml', 'blockchain', 'cloud_computing', 'cybersecurity', 'iot', 'fintech', 'healthtech', 'edtech', 'sustainability_tech', 'other_tech'];
    const partnershipFields = ['startup_partnerships', 'enterprise_partnerships', 'research_collaborations', 'academic_partnerships', 'government_contracts', 'nonprofit_collaborations'];
    const innovationFields = ['product_development', 'process_innovation', 'business_model_innovation', 'sustainability_innovation', 'social_impact', 'disruptive_technology'];

    // Update sections if data is provided
    const interestsData = extractData(req.body, interestsFields);
    if (Object.keys(interestsData).length > 0) {
      result.interests = await upsertInterests(profileId, interestsData);
    }

    const techInterestsData = extractData(req.body, techFields);
    if (Object.keys(techInterestsData).length > 0) {
      result.technology_interests = await upsertTechnologyInterests(profileId, techInterestsData);
    }
    
    const partnershipData = extractData(req.body, partnershipFields);
    if (Object.keys(partnershipData).length > 0) {
      result.partnership_interests = await upsertPartnershipInterests(profileId, partnershipData);
    }
    
    const innovationData = extractData(req.body, innovationFields);
    if (Object.keys(innovationData).length > 0) {
      result.innovation_focus = await upsertInnovationFocus(profileId, innovationData);
    }

    // Update completion percentage
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.json({
      success: true,
      data: {
        ...result,
        completion_percentage: completionPercentage
      },
      message: 'Sections updated successfully'
    });
  } catch (error) {
    console.error('Update combined sections error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}