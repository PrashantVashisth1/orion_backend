import prisma from '../config/prismaClient.js';

/**
 * Get startup profile by user ID with all related data
 * @param {number} userId
 * @returns {Promise<Object|null>} complete startup profile or null if not found
 */


export async function getStartupProfile(userId) {
  try {
    const profile = await prisma.startupProfile.findUnique({
      where: {
        user_id: userId,
      },
      include: {
        personal_info: true,
        business_details: true,
        company_details: true,
        offerings: true,
        interests: true,
        technology_interests: true,
        partnership_interests: true,
        innovation_focus: true,
      },
    });

    return profile;
  } catch (error) {
    console.error('Error getting startup profile:', error);
    throw error;
  }
}

/**
 * Create a new startup profile
 * @param {number} userId
 * @returns {Promise<Object>} newly created startup profile
 */
export async function createStartupProfile(userId) {
  try {
    const profile = await prisma.startupProfile.create({
      data: {
        user_id: userId,
      },
    });
    return profile;
  } catch (error) {
    console.error('Error creating startup profile:', error);
    throw error;
  }
}

/**
 * Update or create personal info section
 * @param {number} startupProfileId
 * @param {Object} personalInfoData
 * @returns {Promise<Object>} updated personal info
 */

export async function upsertPersonalInfo(startupProfileId, personalInfoData) {
  try {
    const existing = await prisma.personalInfo.findUnique({
      where: { startup_profile_id: startupProfileId },
    });
    const mergedData = existing ? { ...existing, ...personalInfoData } : personalInfoData;
    const personalInfo = await prisma.personalInfo.upsert({
      where: {
        startup_profile_id: startupProfileId,
      },
      create: {
        startup_profile_id: startupProfileId,
        ...personalInfoData,
      },
      update: {
        ...mergedData,
      },
    });
    return personalInfo;
  } catch (error) {
    console.error('Error upserting personal info:', error);
    throw error;
  }
}

/**
 * Update or create business details section
 * @param {number} startupProfileId
 * @param {Object} businessDetailsData
 * @returns {Promise<Object>} updated business details
 */
// export async function upsertBusinessDetails(startupProfileId, businessDetailsData) {
//   try {
//     const businessDetails = await prisma.businessDetails.upsert({
//       where: {
//         startup_profile_id: startupProfileId,
//       },
//       create: {
//         startup_profile_id: startupProfileId,
//         ...businessDetailsData,
//       },
//       update: {
//         ...businessDetailsData,
//       },
//     });

//     return businessDetails;
//   } catch (error) {
//     console.error('Error upserting business details:', error);
//     throw error;
//   }
// }

export async function upsertBusinessDetails(startupProfileId, businessDetailsData) {
  try {
    const existing = await prisma.businessDetails.findUnique({
      where: { startup_profile_id: startupProfileId },
    });
    const mergedData = existing ? { ...existing, ...businessDetailsData } : businessDetailsData;
    const businessDetails = await prisma.businessDetails.upsert({
      where: {
        startup_profile_id: startupProfileId,
      },
      create: {
        startup_profile_id: startupProfileId,
        ...businessDetailsData,
      },
      update: {
        ...mergedData,
      },
    });
    return businessDetails;
  } catch (error) {
    console.error('Error upserting business details:', error);
    throw error;
  }
}


/**
 * Update or create company details section
 * @param {number} startupProfileId
 * @param {Object} companyDetailsData
 * @returns {Promise<Object>} updated company details
 */
// export async function upsertCompanyDetails(startupProfileId, companyDetailsData) {
//   try {
//     const companyDetails = await prisma.companyDetails.upsert({
//       where: {
//         startup_profile_id: startupProfileId,
//       },
//       create: {
//         startup_profile_id: startupProfileId,
//         ...companyDetailsData,
//       },
//       update: {
//         ...companyDetailsData,
//       },
//     });

//     return companyDetails;
//   } catch (error) {
//     console.error('Error upserting company details:', error);
//     throw error;
//   }
// }

export async function upsertCompanyDetails(startupProfileId, companyDetailsData) {
  try {
    const existing = await prisma.companyDetails.findUnique({
      where: { startup_profile_id: startupProfileId },
    });
    const mergedData = existing ? { ...existing, ...companyDetailsData } : companyDetailsData;
    const companyDetails = await prisma.companyDetails.upsert({
      where: {
        startup_profile_id: startupProfileId,
      },
      create: {
        startup_profile_id: startupProfileId,
        ...companyDetailsData,
      },
      update: {
        ...mergedData,
      },
    });

    return companyDetails;
  } catch (error) {
    console.error('Error upserting company details:', error);
    throw error;
  }
}


/**
 * Update or create offerings section
 * @param {number} startupProfileId
 * @param {Object} offeringsData
 * @returns {Promise<Object>} updated offerings
 */
export async function upsertOfferings(startupProfileId, offeringsData) {
  try {
    // Step 1: check if an entry already exists
    const existing = await prisma.offerings.findUnique({
      where: { startup_profile_id: startupProfileId },
    });
    let mergedData;
    if (existing) {
      // Step 2: merge old and new
      mergedData = {
        ...existing,
        ...offeringsData,
        services: [
          ...(existing.services || []),
          ...(offeringsData.services || []),
        ],
        products: [
          ...(existing.products || []),
          ...(offeringsData.products || []),
        ],
      };
    } else {
      mergedData = offeringsData;
    }
    const offerings = await prisma.offerings.upsert({
      where: {
        startup_profile_id: startupProfileId,
      },
      create: {
        startup_profile_id: startupProfileId,
        ...mergedData,
      },
      update: {
        ...mergedData,
      },
    });

    return offerings;
  } catch (error) {
    console.error('Error upserting offerings:', error);
    throw error;
  }
}

/**
 * Update or create interests section
 * @param {number} startupProfileId
 * @param {Object} interestsData
 * @returns {Promise<Object>} updated interests
 */
// export async function upsertInterests(startupProfileId, interestsData) {
//   try {
//     const interests = await prisma.interests.upsert({
//       where: {
//         startup_profile_id: startupProfileId,
//       },
//       create: {
//         startup_profile_id: startupProfileId,
//         ...interestsData,
//       },
//       update: {
//         ...interestsData,
//       },
//     });

//     return interests;
//   } catch (error) {
//     console.error('Error upserting interests:', error);
//     throw error;
//   }
// }

export async function upsertInterests(startupProfileId, interestsData) {
  try {
    const existing = await prisma.interests.findUnique({
      where: { startup_profile_id: startupProfileId },
    });
    const mergedData = existing ? { ...existing, ...interestsData } : interestsData;
    const interests = await prisma.interests.upsert({
      where: {
        startup_profile_id: startupProfileId,
      },
      create: {
        startup_profile_id: startupProfileId,
        ...interestsData,
      },
      update: {
        ...mergedData,
      },
    });

    return interests;
  } catch (error) {
    console.error('Error upserting interests:', error);
    throw error;
  }
}

/**
 * Update or create technology interests section
 * @param {number} startupProfileId
 * @param {Object} technologyInterestsData
 * @returns {Promise<Object>} updated technology interests
 */
// export async function upsertTechnologyInterests(startupProfileId, technologyInterestsData) {
//   try {
//     const technologyInterests = await prisma.technologyInterests.upsert({
//       where: {
//         startup_profile_id: startupProfileId,
//       },
//       create: {
//         startup_profile_id: startupProfileId,
//         ...technologyInterestsData,
//       },
//       update: {
//         ...technologyInterestsData,
//       },
//     });
//     return technologyInterests;
//   } catch (error) {
//     console.error('Error upserting technology interests:', error);
//     throw error;
//   }
// }
export async function upsertTechnologyInterests(startupProfileId, technologyInterestsData) {
  try {
    const existing = await prisma.technologyInterests.findUnique({
      where: { startup_profile_id: startupProfileId },
    });
    const mergedData = existing ? { ...existing, ...technologyInterestsData } : technologyInterestsData;
    const technologyInterests = await prisma.technologyInterests.upsert({
      where: {
        startup_profile_id: startupProfileId,
      },
      create: {
        startup_profile_id: startupProfileId,
        ...technologyInterestsData,
      },
      update: {
        ...mergedData,
      },
    });
    return technologyInterests;
  } catch (error) {
    console.error('Error upserting technology interests:', error);
    throw error;
  }
}

/**
 * Update or create partnership interests section
 * @param {number} startupProfileId
 * @param {Object} partnershipInterestsData
 * @returns {Promise<Object>} updated partnership interests
 */
// export async function upsertPartnershipInterests(startupProfileId, partnershipInterestsData) {
//   try {
//     const partnershipInterests = await prisma.partnershipInterests.upsert({
//       where: {
//         startup_profile_id: startupProfileId,
//       },
//       create: {
//         startup_profile_id: startupProfileId,
//         ...partnershipInterestsData,
//       },
//       update: {
//         ...partnershipInterestsData,
//       },
//     });
//     return partnershipInterests;
//   } catch (error) {
//     console.error('Error upserting partnership interests:', error);
//     throw error;
//   }
// }

export async function upsertPartnershipInterests(startupProfileId, partnershipInterestsData) {
  try {
    const existing = await prisma.partnershipInterests.findUnique({
      where: { startup_profile_id: startupProfileId },
    });
    const mergedData = existing ? { ...existing, ...partnershipInterestsData } : partnershipInterestsData;
    const partnershipInterests = await prisma.partnershipInterests.upsert({
      where: {
        startup_profile_id: startupProfileId,
      },
      create: {
        startup_profile_id: startupProfileId,
        ...partnershipInterestsData,
      },
      update: {
        ...mergedData,
      },
    });
    return partnershipInterests;
  } catch (error) {
    console.error('Error upserting partnership interests:', error);
    throw error;
  }
}


/**
 * Update or create innovation focus section
 * @param {number} startupProfileId
 * @param {Object} innovationFocusData
 * @returns {Promise<Object>} updated innovation focus
 */
// export async function upsertInnovationFocus(startupProfileId, innovationFocusData) {
//   try {
//     const innovationFocus = await prisma.innovationFocus.upsert({
//       where: {
//         startup_profile_id: startupProfileId,
//       },
//       create: {
//         startup_profile_id: startupProfileId,
//         ...innovationFocusData,
//       },
//       update: {
//         ...innovationFocusData,
//       },
//     });

//     return innovationFocus;
//   } catch (error) {
//     console.error('Error upserting innovation focus:', error);
//     throw error;
//   }
// }

export async function upsertInnovationFocus(startupProfileId, innovationFocusData) {
  try {
    const existing = await prisma.innovationFocus.findUnique({
      where: { startup_profile_id: startupProfileId },
    });
    const mergedData = existing ? { ...existing, ...innovationFocusData } : innovationFocusData;
    const innovationFocus = await prisma.innovationFocus.upsert({
      where: {
        startup_profile_id: startupProfileId,
      },
      create: {
        startup_profile_id: startupProfileId,
        ...innovationFocusData,
      },
      update: {
        ...mergedData,
      },
    });

    return innovationFocus;
  } catch (error) {
    console.error('Error upserting innovation focus:', error);
    throw error;
  }
}

/**
 * Calculate and update completion percentage
 * @param {number} startupProfileId
 * @returns {Promise<number>} completion percentage
 */
export async function updateCompletionPercentage(startupProfileId) {
  try {
    const profile = await prisma.startupProfile.findUnique({
      where: {
        id: startupProfileId,
      },
      include: {
        personal_info: true,
        business_details: true,
        company_details: true,
        interests: true,
        offerings: true
      },
    });

    const sections = [
      profile.personal_info,
      profile.business_details,
      profile.company_details,
      profile.interests,
      profile.offerings
    ];

    const completedSections = sections.filter(section => section !== null).length;
    const completionPercentage = Math.round((completedSections / sections.length) * 100);
    const isComplete = completionPercentage === 100;

    await prisma.startupProfile.update({
      where: { id: startupProfileId },
      data: {
        completion_percentage: completionPercentage,
        is_complete: isComplete,
      },
    });

    return completionPercentage;
  } catch (error) {
    console.error('Error updating completion percentage:', error);
    throw error;
  }
}

/**
 * Delete startup profile and all related data
 * @param {number} userId
 * @returns {Promise<boolean>} success status
 */
export async function deleteStartupProfile(userId) {
  try {
    const deletedProfile = await prisma.startupProfile.delete({
      where: {
        user_id: userId,
      },
    });
    return !!deletedProfile;
  } catch (error) {
    console.error('Error deleting startup profile:', error);
    throw error;
  }
}