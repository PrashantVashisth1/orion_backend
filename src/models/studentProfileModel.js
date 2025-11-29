// import prisma from '../config/prismaClient.js';

// // --- Core Profile Operations ---

// /**
//  * Get student profile by user ID with all related data
//  * @param {number} userId
//  * @returns {Promise<Object|null>} complete student profile or null if not found
//  */
// export async function getStudentProfile(userId) {
//   try {
//     const profile = await prisma.studentProfile.findUnique({
//       where: {
//         user_id: userId,
//       },
//       include: {
//         personal_info: true,
//         education_records: true, // Include all education records
//         work_experiences: true,  // Include all work experiences
//         skills_info: {
//           include: {
//             certificates: true, // Include certificates within skills
//           },
//         },
//       },
//     });

//     return profile;
//   } catch (error) {
//     console.error('Error getting student profile:', error);
//     throw error;
//   }
// }

// /**
//  * Create a new student profile
//  * @param {number} userId
//  * @returns {Promise<Object>} newly created student profile
//  */
// export async function createStudentProfile(userId) {
//   try {
//     const profile = await prisma.studentProfile.create({
//       data: {
//         user_id: userId,
//       },
//     });
//     return profile;
//   } catch (error) {
//     console.error('Error creating student profile:', error);
//     throw error;
//   }
// }

// // --- Section Operations (One-to-One: Personal Info, Skills) ---

// /**
//  * Update or create personal info section
//  * @param {number} studentProfileId
//  * @param {Object} personalInfoData
//  * @returns {Promise<Object>} updated personal info
//  */
// export async function upsertStudentPersonalInfo(studentProfileId, personalInfoData) {
//   try {
//     const existing = await prisma.studentPersonalInfo.findUnique({
//       where: { student_profile_id: studentProfileId },
//     });
//     // Merge existing data with new data to handle partial updates
//     const mergedData = existing ? { ...existing, ...personalInfoData } : personalInfoData;

//     const personalInfo = await prisma.studentPersonalInfo.upsert({
//       where: {
//         student_profile_id: studentProfileId,
//       },
//       create: {
//         student_profile_id: studentProfileId,
//         ...personalInfoData,
//       },
//       update: {
//         ...mergedData,
//       },
//     });
//     return personalInfo;
//   } catch (error) {
//     console.error('Error upserting personal info:', error);
//     throw error;
//   }
// }

// /**
//  * Update or create student skills section (including selected skills array)
//  * @param {number} studentProfileId
//  * @param {Object} skillsData - { selected_skills: string[] }
//  * @returns {Promise<Object>} updated skills info
//  */
// export async function upsertStudentSkills(studentProfileId, skillsData) {
//   try {
//     const existing = await prisma.studentSkills.findUnique({
//       where: { student_profile_id: studentProfileId },
//     });
//     const mergedData = existing ? { ...existing, ...skillsData } : skillsData;

//     const skillsInfo = await prisma.studentSkills.upsert({
//       where: {
//         student_profile_id: studentProfileId,
//       },
//       create: {
//         student_profile_id: studentProfileId,
//         ...skillsData,
//       },
//       update: {
//         ...mergedData,
//       },
//     });
//     return skillsInfo;
//   } catch (error) {
//     console.error('Error upserting student skills:', error);
//     throw error;
//   }
// }

// // --- Section Operations (One-to-Many: Education, Work Experience, Certificates) ---

// // Education Record Functions

// /**
//  * Create a new education record for a student profile
//  * @param {number} studentProfileId
//  * @param {Object} educationData
//  * @returns {Promise<Object>} new education record
//  */
// export async function createEducationRecord(studentProfileId, educationData) {
//   try {
//     const record = await prisma.educationRecord.create({
//       data: {
//         student_profile_id: studentProfileId,
//         ...educationData,
//       },
//     });
//     return record;
//   } catch (error) {
//     console.error('Error creating education record:', error);
//     throw error;
//   }
// }

// /**
//  * Update an existing education record
//  * @param {number} recordId
//  * @param {Object} educationData
//  * @returns {Promise<Object>} updated education record
//  */
// export async function updateEducationRecord(recordId, educationData) {
//   try {
//     const record = await prisma.educationRecord.update({
//       where: { id: recordId },
//       data: educationData,
//     });
//     return record;
//   } catch (error) {
//     console.error('Error updating education record:', error);
//     throw error;
//   }
// }

// /**
//  * Delete an education record
//  * @param {number} recordId
//  * @returns {Promise<Object>} deleted education record
//  */
// export async function deleteEducationRecord(recordId) {
//   try {
//     const record = await prisma.educationRecord.delete({
//       where: { id: recordId },
//     });
//     return record;
//   } catch (error) {
//     console.error('Error deleting education record:', error);
//     throw error;
//   }
// }

// // Work Experience Functions

// /**
//  * Create a new work experience record for a student profile
//  * @param {number} studentProfileId
//  * @param {Object} workExperienceData
//  * @returns {Promise<Object>} new work experience record
//  */
// export async function createWorkExperience(studentProfileId, workExperienceData) {
//   try {
//     const record = await prisma.workExperience.create({
//       data: {
//         student_profile_id: studentProfileId,
//         ...workExperienceData,
//       },
//     });
//     return record;
//   } catch (error) {
//     console.error('Error creating work experience record:', error);
//     throw error;
//   }
// }

// /**
//  * Update an existing work experience record
//  * @param {number} recordId
//  * @param {Object} workExperienceData
//  * @returns {Promise<Object>} updated work experience record
//  */
// export async function updateWorkExperience(recordId, workExperienceData) {
//   try {
//     const record = await prisma.workExperience.update({
//       where: { id: recordId },
//       data: workExperienceData,
//     });
//     return record;
//   } catch (error) {
//     console.error('Error updating work experience record:', error);
//     throw error;
//   }
// }

// /**
//  * Delete a work experience record
//  * @param {number} recordId
//  * @returns {Promise<Object>} deleted work experience record
//  */
// export async function deleteWorkExperience(recordId) {
//   try {
//     const record = await prisma.workExperience.delete({
//       where: { id: recordId },
//     });
//     return record;
//   } catch (error) {
//     console.error('Error deleting work experience record:', error);
//     throw error;
//   }
// }

// // Certificate Functions (Linked to StudentSkills)

// /**
//  * Create a new certificate record
//  * @param {number} studentSkillsId
//  * @param {Object} certificateData
//  * @returns {Promise<Object>} new certificate record
//  */
// export async function createCertificateRecord(studentSkillsId, certificateData) {
//   try {
//     const record = await prisma.certificateRecord.create({
//       data: {
//         student_skills_id: studentSkillsId,
//         ...certificateData,
//       },
//     });
//     return record;
//   } catch (error) {
//     console.error('Error creating certificate record:', error);
//     throw error;
//   }
// }

// /**
//  * Update an existing certificate record
//  * @param {number} recordId
//  * @param {Object} certificateData
//  * @returns {Promise<Object>} updated certificate record
//  */
// export async function updateCertificateRecord(recordId, certificateData) {
//   try {
//     const record = await prisma.certificateRecord.update({
//       where: { id: recordId },
//       data: certificateData,
//     });
//     return record;
//   } catch (error) {
//     console.error('Error updating certificate record:', error);
//     throw error;
//   }
// }

// /**
//  * Delete a certificate record
//  * @param {number} recordId
//  * @returns {Promise<Object>} deleted certificate record
//  */
// export async function deleteCertificateRecord(recordId) {
//   try {
//     const record = await prisma.certificateRecord.delete({
//       where: { id: recordId },
//     });
//     return record;
//   } catch (error) {
//     console.error('Error deleting certificate record:', error);
//     throw error;
//   }
// }

// // --- Helper and Maintenance Functions ---

// /**
//  * Calculate and update completion percentage
//  * @param {number} studentProfileId
//  * @returns {Promise<number>} completion percentage
//  */
// export async function updateCompletionPercentage(studentProfileId) {
//   try {
//     const profile = await prisma.studentProfile.findUnique({
//       where: {
//         id: studentProfileId,
//       },
//       include: {
//         personal_info: true,
//         education_records: true,
//         work_experiences: true,
//         skills_info: true,
//       },
//     });

//     // Check for existence of core sections (one-to-one)
//     let completedSections = 0;
//     const totalSections = 4; // PersonalInfo, Education, WorkExperience, Skills

//     if (profile.personal_info) {
//       // Check a critical field to consider it "complete"
//       if (profile.personal_info.first_name && profile.personal_info.phone) {
//         completedSections++;
//       }
//     }

//     // Check if at least one record exists for one-to-many sections
//     if (profile.education_records && profile.education_records.length > 0) {
//       completedSections++;
//     }

//     if (profile.work_experiences && profile.work_experiences.length > 0) {
//       completedSections++;
//     }

//     if (profile.skills_info) {
//       // Check a critical field to consider it "complete"
//       if (profile.skills_info.selected_skills && profile.skills_info.selected_skills.length > 0) {
//         completedSections++;
//       }
//     }

//     const completionPercentage = Math.round((completedSections / totalSections) * 100);
//     const isComplete = completionPercentage === 100;

//     await prisma.studentProfile.update({
//       where: { id: studentProfileId },
//       data: {
//         completion_percentage: completionPercentage,
//         is_complete: isComplete,
//       },
//     });

//     return completionPercentage;
//   } catch (error) {
//     console.error('Error updating completion percentage:', error);
//     throw error;
//   }
// }

// /**
//  * Delete student profile and all related data
//  * @param {number} userId
//  * @returns {Promise<boolean>} success status
//  */
// export async function deleteStudentProfile(userId) {
//   try {
//     // Due to onDelete: Cascade in the schema, deleting the main profile deletes all sub-records.
//     const deletedProfile = await prisma.studentProfile.delete({
//       where: {
//         user_id: userId,
//       },
//     });
//     return !!deletedProfile;
//   } catch (error) {
//     console.error('Error deleting student profile:', error);
//     throw error;
//   }
// }

import prisma from '../config/prismaClient.js';

/* -------------------------------------------------------
   🔥 UNIVERSAL MAPPER — camelCase ⇆ snake_case
---------------------------------------------------------*/

// Convert camelCase → snake_case before storing in DB
function toSnake(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const out = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => "_" + letter.toLowerCase());
    out[snakeKey] = Array.isArray(obj[key])
      ? obj[key].map(v => toSnake(v))
      : toSnake(obj[key]);
  }
  return out;
}

// Convert snake_case → camelCase before returning to frontend
// function toCamel(obj) {
//   if (!obj || typeof obj !== 'object') return obj;

//   const out = {};
//   for (const key in obj) {
//     const camelKey = key.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
//     out[camelKey] = Array.isArray(obj[key])
//       ? obj[key].map(v => toCamel(v))
//       : toCamel(obj[key]);
//   }
//   return out;
// }
// Convert snake_case → camelCase before returning to frontend
function toCamel(obj) {
  // Handle null/undefined
  if (!obj) return obj;
  
  // Handle Date objects - return as-is (don't try to convert)
  if (obj instanceof Date) return obj;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(v => toCamel(v));
  }
  
  // Handle non-objects (primitives)
  if (typeof obj !== 'object') return obj;

  const out = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
    const value = obj[key];
    
    // Check if value is a Date
    if (value instanceof Date) {
      out[camelKey] = value;
    }
    // Check if value is an array
    else if (Array.isArray(value)) {
      out[camelKey] = value.map(v => toCamel(v));
    }
    // Check if value is an object
    else if (value && typeof value === 'object') {
      out[camelKey] = toCamel(value);
    }
    // Primitive value
    else {
      out[camelKey] = value;
    }
  }
  return out;
}
/* -------------------------------------------------------
   ✨ Your ORIGINAL CODE — only wrapped in mapper
--------------------------------------------------------- */

// --- Core Profile Operations ---

export async function getStudentProfile(userId) {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: userId },
      include: {
        personal_info: true,
        education_records: true,
        work_experiences: true,
        skills_info: {
          include: { certificates: true },
        },
      },
    });

    return toCamel(profile);   // AUTO convert to camelCase
  } catch (error) {
    console.error('Error getting student profile:', error);
    throw error;
  }
}

export async function createStudentProfile(userId) {
  try {
    const profile = await prisma.studentProfile.create({
      data: { user_id: userId },
    });

    return toCamel(profile);
  } catch (error) {
    console.error('Error creating student profile:', error);
    throw error;
  }
}

// --- Personal Info ---

export async function upsertStudentPersonalInfo(studentProfileId, personalInfoData) {
  try {
    const existing = await prisma.studentPersonalInfo.findUnique({
      where: { student_profile_id: studentProfileId },
    });

    const mergedData = existing
      ? { ...existing, ...toSnake(personalInfoData) }
      : toSnake(personalInfoData);

    const personalInfo = await prisma.studentPersonalInfo.upsert({
      where: { student_profile_id: studentProfileId },
      create: { student_profile_id: studentProfileId, ...toSnake(personalInfoData) },
      update: mergedData,
    });

    return toCamel(personalInfo);
  } catch (error) {
    console.error('Error upserting personal info:', error);
    throw error;
  }
}

// --- Skills ---

// export async function upsertStudentSkills(studentProfileId, skillsData) {
//   try {
//     const existing = await prisma.studentSkills.findUnique({
//       where: { student_profile_id: studentProfileId },
//     });

//     const mergedData = existing
//       ? { ...existing, ...toSnake(skillsData) }
//       : toSnake(skillsData);

//     const skillsInfo = await prisma.studentSkills.upsert({
//       where: { student_profile_id: studentProfileId },
//       create: { student_profile_id: studentProfileId, ...toSnake(skillsData) },
//       update: mergedData,
//     });

//     return toCamel(skillsInfo);
//   } catch (error) {
//     console.error('Error upserting student skills:', error);
//     throw error;
//   }
// }

// export async function upsertStudentSkills(studentProfileId, skillsData) {
//   try {
//     const { selectedSkills, certificates } = skillsData;

//     const snakeSkills = {
//       selected_skills: selectedSkills
//     };

//     // ---------- CREATE BLOCK ----------
//     const createBlock = {
//       student_profile_id: studentProfileId,
//       ...snakeSkills
//     };

//     // Only add certificates to CREATE if they exist
//     if (certificates && certificates.length > 0) {
//       createBlock.certificates = {
//         create: toSnake(certificates)
//       };
//     }
//     // If empty → do nothing (NO deleteMany allowed)

//     // ---------- UPDATE BLOCK ----------
//     const updateBlock = {
//       ...snakeSkills,
//       certificates: {
//         deleteMany: {} // Clear all old ones
//       }
//     };

//     // Add new certs during update
//     if (certificates && certificates.length > 0) {
//       updateBlock.certificates.create = toSnake(certificates);
//     }

//     const result = await prisma.studentSkills.upsert({
//       where: { student_profile_id: studentProfileId },
//       create: createBlock,
//       update: updateBlock
//     });

//     return toCamel(result);

//   } catch (error) {
//     console.error("Error upserting student skills:", error);
//     throw error;
//   }
// }

export async function upsertStudentSkills(studentProfileId, skillsData) {
  try {
    const { selectedSkills, certificates } = skillsData || {};

    const snakeSkills = {
      selected_skills: Array.isArray(selectedSkills) ? selectedSkills : []
    };

    // CREATE block
    const createBlock = {
      student_profile_id: studentProfileId,
      ...snakeSkills
    };
    if (Array.isArray(certificates) && certificates.length > 0) {
      createBlock.certificates = { create: certificates.map(toSnake) };
    }

    // UPDATE block - only touch certificates if explicitly provided
    const updateBlock = { ...snakeSkills };
    
    if (typeof certificates !== 'undefined') {
      // Only modify certificates when frontend sends them
      updateBlock.certificates = {
        deleteMany: {},
        ...(Array.isArray(certificates) && certificates.length > 0
          ? { create: certificates.map(toSnake) }
          : {})
      };
    }
    // If certificates is undefined, existing certificates are LEFT ALONE

    const result = await prisma.studentSkills.upsert({
      where: { student_profile_id: studentProfileId },
      create: createBlock,
      update: updateBlock
    });

    return toCamel(result);
  } catch (error) {
    console.error("Error upserting student skills:", error);
    throw error;
  }
}

// --- Education ---

export async function createEducationRecord(studentProfileId, educationData) {
  try {
    const record = await prisma.educationRecord.create({
      data: {
        student_profile_id: studentProfileId,
        ...toSnake(educationData),
      },
    });

    return toCamel(record);
  } catch (error) {
    console.error('Error creating education record:', error);
    throw error;
  }
}

export async function updateEducationRecord(recordId, educationData) {
  try {
    const record = await prisma.educationRecord.update({
      where: { id: recordId },
      data: toSnake(educationData),
    });

    return toCamel(record);
  } catch (error) {
    console.error('Error updating education record:', error);
    throw error;
  }
}

export async function deleteEducationRecord(recordId) {
  try {
    const record = await prisma.educationRecord.delete({
      where: { id: recordId },
    });

    return toCamel(record);
  } catch (error) {
    console.error('Error deleting education record:', error);
    throw error;
  }
}

// --- Work Experience ---

export async function createWorkExperience(studentProfileId, workExperienceData) {
  try {
    const record = await prisma.workExperience.create({
      data: {
        student_profile_id: studentProfileId,
        ...toSnake(workExperienceData),
      },
    });

    return toCamel(record);
  } catch (error) {
    console.error('Error creating work experience record:', error);
    throw error;
  }
}

export async function updateWorkExperience(recordId, workExperienceData) {
  try {
    const record = await prisma.workExperience.update({
      where: { id: recordId },
      data: toSnake(workExperienceData),
    });

    return toCamel(record);
  } catch (error) {
    console.error('Error updating work experience record:', error);
    throw error;
  }
}

export async function deleteWorkExperience(recordId) {
  try {
    const record = await prisma.workExperience.delete({
      where: { id: recordId },
    });

    return toCamel(record);
  } catch (error) {
    console.error('Error deleting work experience record:', error);
    throw error;
  }
}

// --- Certificates ---

export async function createCertificateRecord(studentSkillsId, certificateData) {
  try {
    const record = await prisma.certificateRecord.create({
      data: {
        student_skills_id: studentSkillsId,
        ...toSnake(certificateData),
      },
    });

    return toCamel(record);
  } catch (error) {
    console.error('Error creating certificate record:', error);
    throw error;
  }
}

export async function updateCertificateRecord(recordId, certificateData) {
  try {
    const record = await prisma.certificateRecord.update({
      where: { id: recordId },
      data: toSnake(certificateData),
    });

    return toCamel(record);
  } catch (error) {
    console.error('Error updating certificate record:', error);
    throw error;
  }
}

export async function deleteCertificateRecord(recordId) {
  try {
    const record = await prisma.certificateRecord.delete({
      where: { id: recordId },
    });

    return toCamel(record);
  } catch (error) {
    console.error('Error deleting certificate record:', error);
    throw error;
  }
}

// --- Completion Percentage ---

export async function updateCompletionPercentage(studentProfileId) {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: {
        personal_info: true,
        education_records: true,
        work_experiences: true,
        skills_info: true,
      },
    });

    let completedSections = 0;
    const totalSections = 4;

    if (profile.personal_info?.first_name && profile.personal_info?.phone)
      completedSections++;

    if (profile.education_records?.length) completedSections++;
    if (profile.work_experiences?.length) completedSections++;

    if (profile.skills_info?.selected_skills?.length)
      completedSections++;

    const completionPercentage = Math.round((completedSections / totalSections) * 100);
    const isComplete = completionPercentage === 100;

    await prisma.studentProfile.update({
      where: { id: studentProfileId },
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

// --- Delete Profile ---

export async function deleteStudentProfile(userId) {
  try {
    const deletedProfile = await prisma.studentProfile.delete({
      where: { user_id: userId },
    }); 

    return !!deletedProfile;
  } catch (error) {
    console.error('Error deleting student profile:', error);
    throw error;
  }
}
