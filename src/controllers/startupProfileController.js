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

import {
  personalInfoSchema,
  businessDetailsSchema,
  companyDetailsSchema,
  offeringsSchema,
  combinedSectionsSchema,
  interestsSchema,
  technologyInterestsSchema,
  partnershipInterestsSchema,
  innovationFocusSchema
} from "../utils/validation/startupProfileValidation.js";


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
export async function updateOfferings(req, res) {
  try {
    const { error } = offeringsSchema.validate(req.body);
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

    const offerings = await upsertOfferings(profileId, req.body);
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
    console.error('Update offerings error:', error);
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
 * PATCH /api/startup/profile/interests
 * Update interests section
 */
export async function updateInterests(req, res) {
  try {
    const { error } = interestsSchema.validate(req.body);
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