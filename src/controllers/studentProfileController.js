import {
  getStudentProfile,
  createStudentProfile,
  upsertStudentPersonalInfo,
  upsertStudentSkills,
  createEducationRecord,
  updateEducationRecord,
  deleteEducationRecord,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
  createCertificateRecord,
  updateCertificateRecord,
  deleteCertificateRecord,
  updateCompletionPercentage,
  deleteStudentProfile
} from '../models/studentProfileModel.js';

import prisma from '../config/prismaClient.js';
// import {
//   personalInfoSchema,
//   educationRecordSchema,
//   workExperienceSchema,
//   skillsSchema,
//   certificateRecordSchema
// } from "../utils/validation/studentProfileValidation.js"; // Assume this file exists

// Helper to get profile ID safely (assuming a middleware attaches req.profile)
const getProfileId = (req) => req.profile.id;

// --- Core Profile Endpoints ---

/**
 * GET /api/student/profile
 * Get user's complete student profile with all sections
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const profile = await getStudentProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Student profile not found'
        }
      });
    }

    return res.json({
      success: true,
      data: profile,
      message: 'Student profile retrieved successfully'
    });
  } catch (error) {
    console.error('Get student profile error:', error);
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
 * POST /api/student/profile
 * Create a new student profile
 */
export async function createProfile(req, res) {
  try {
    const userId = req.user.id;

    const existingProfile = await getStudentProfile(userId);
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'PROFILE_EXISTS',
          message: 'Student profile already exists'
        }
      });
    }

    const profile = await createStudentProfile(userId);

    return res.status(201).json({
      success: true,
      data: profile,
      message: 'Student profile created successfully'
    });
  } catch (error) {
    console.error('Create student profile error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

// --- Personal Info Section (One-to-One) ---

/**
 * PATCH /api/student/profile/personal-info
 * Update personal information section
 */
// export async function updatePersonalInfo(req, res) {
//   try {
//     // const { error } = personalInfoSchema.validate(req.body); // Uncomment when validation is ready
//     // if (error) { return handleValidationError(res, error); }

//     const profileId = getProfileId(req);
//     const personalInfo = await upsertStudentPersonalInfo(profileId, req.body);
//     const completionPercentage = await updateCompletionPercentage(profileId);

//     return res.json({
//       success: true,
//       data: {
//         personal_info: personalInfo,
//         completion_percentage: completionPercentage
//       },
//       message: 'Personal information updated successfully'
//     });
//   } catch (error) {
//     console.error('Update personal info error:', error);
//     return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
//   }
// }


import { uploadSingle, handleUploadError } from '../middleware/fileUpload.js'; // Assuming file upload middleware path
import { deleteFile } from '../controllers/uploadController.js'; // Assuming you have an accessible delete function

// --- Middleware Wrapper for File Upload ---
/**
 * Handles S3 upload for profile image and populates req.body with text fields.
 */
export const uploadPersonalInfoImage = (req, res, next) => {
    // 'file' must match the image field name in the client's FormData
    uploadSingle(req, res, (err) => {
        if (err) {
            return handleUploadError(err, req, res, next);
        }
        // req.body now contains text fields, and req.file contains image metadata.
        next(); 
    });
};


// --- Modified Main Controller Function ---
export async function updatePersonalInfo(req, res) {
    const profileId = getProfileId(req); // Assuming getProfileId is an accessible helper
    
    // 1. Prepare Image Data (if uploaded)
    const newImageUrl = req.file?.location;
    const newImageKey = req.file?.key;

    // 2. Combine all data: text fields (req.body) + image fields
    // NOTE: This merged object will be passed to upsertStudentPersonalInfo
    let combinedData = { ...req.body };

    if (newImageUrl && newImageKey) {
        combinedData.profilePicture = newImageUrl; // Will be converted to profile_picture by toSnake
        combinedData.profilePictureKey = newImageKey; // Will be converted to profile_picture_key
    }

    try {
        // --- PRE-UPDATE: Fetch current profile to find old image key ---
        // This is necessary for cleanup before the upsert overwrites the old key.
        const currentProfile = await prisma.studentPersonalInfo.findUnique({
            where: { student_profile_id: profileId },
            select: { profile_picture_key: true }
        });
        const oldImageKey = currentProfile?.profile_picture_key;

        // 3. Call the modified modal function
        // Note: The original upsertStudentPersonalInfo function handles the merging of existing data.
        const personalInfo = await upsertStudentPersonalInfo(profileId, combinedData);
        const completionPercentage = await updateCompletionPercentage(profileId);

        // 4. CLEANUP: Delete old file from S3 if a new one was successfully saved
        if (newImageKey && oldImageKey && oldImageKey !== newImageKey) {
            try {
                // Assuming deleteFile takes the key directly
                await deleteFile({ body: { key: oldImageKey } }, res); // Pass minimal req/res structure
                console.log(`Successfully deleted old profile image: ${oldImageKey}`);
            } catch (cleanupError) {
                console.warn('Warning: Failed to delete old S3 profile image:', cleanupError);
                // Continue execution, as the main profile update succeeded.
            }
        }

        return res.json({
            success: true,
            data: {
                personal_info: personalInfo,
                completion_percentage: completionPercentage
            },
            message: 'Personal information and image updated successfully'
        });

    } catch (error) {
        console.error('Update personal info error:', error);
        return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
    }
}

// --- Education Section (One-to-Many CRUD) ---

/**
 * POST /api/student/profile/education
 * Create new education record
 */
export async function addEducationRecord(req, res) {
  try {
    // const { error } = educationRecordSchema.validate(req.body);
    // if (error) { return handleValidationError(res, error); }

    const profileId = getProfileId(req);
    const newRecord = await createEducationRecord(profileId, req.body);
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.status(201).json({
      success: true,
      data: {
        education_record: newRecord,
        completion_percentage: completionPercentage
      },
      message: 'Education record added successfully'
    });
  } catch (error) {
    console.error('Add education record error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
}

/**
 * PATCH /api/student/profile/education/:recordId
 * Update education record
 */
export async function editEducationRecord(req, res) {
  try {
    // const { error } = educationRecordSchema.validate(req.body);
    // if (error) { return handleValidationError(res, error); }

    const recordId = parseInt(req.params.recordId, 10);
    const profileId = getProfileId(req); // Used for completion percentage update

    const updatedRecord = await updateEducationRecord(recordId, req.body);
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.json({
      success: true,
      data: {
        education_record: updatedRecord,
        completion_percentage: completionPercentage
      },
      message: 'Education record updated successfully'
    });
  } catch (error) {
    console.error('Update education record error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
}

/**
 * DELETE /api/student/profile/education/:recordId
 * Delete education record
 */
export async function removeEducationRecord(req, res) {
  try {
    const recordId = parseInt(req.params.recordId, 10);
    const profileId = getProfileId(req);

    await deleteEducationRecord(recordId);
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.json({
      success: true,
      data: { completion_percentage: completionPercentage },
      message: 'Education record deleted successfully'
    });
  } catch (error) {
    console.error('Delete education record error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
}

// --- Work Experience Section (One-to-Many CRUD) ---

/**
 * POST /api/student/profile/work-experience
 * Create new work experience record
 */
export async function addWorkExperience(req, res) {
  try {
    // const { error } = workExperienceSchema.validate(req.body);
    // if (error) { return handleValidationError(res, error); }

    const profileId = getProfileId(req);
    const newRecord = await createWorkExperience(profileId, req.body);
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.status(201).json({
      success: true,
      data: {
        work_experience: newRecord,
        completion_percentage: completionPercentage
      },
      message: 'Work experience added successfully'
    });
  } catch (error) {
    console.error('Add work experience error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
}

/**
 * PATCH /api/student/profile/work-experience/:recordId
 * Update work experience record
 */
export async function editWorkExperience(req, res) {
  try {
    // const { error } = workExperienceSchema.validate(req.body);
    // if (error) { return handleValidationError(res, error); }

    const recordId = parseInt(req.params.recordId, 10);
    const profileId = getProfileId(req);

    const updatedRecord = await updateWorkExperience(recordId, req.body);
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.json({
      success: true,
      data: {
        work_experience: updatedRecord,
        completion_percentage: completionPercentage
      },
      message: 'Work experience updated successfully'
    });
  } catch (error) {
    console.error('Update work experience error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
}

/**
 * DELETE /api/student/profile/work-experience/:recordId
 * Delete work experience record
 */
export async function removeWorkExperience(req, res) {
  try {
    const recordId = parseInt(req.params.recordId, 10);
    const profileId = getProfileId(req);

    await deleteWorkExperience(recordId);
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.json({
      success: true,
      data: { completion_percentage: completionPercentage },
      message: 'Work experience deleted successfully'
    });
  } catch (error) {
    console.error('Delete work experience error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
}

// --- Skills Section (One-to-One with Certificates One-to-Many) ---

/**
 * PATCH /api/student/profile/skills
 * Update student selected skills
 */
export async function updateSkills(req, res) {
  try {
    // const { error } = skillsSchema.validate(req.body);
    // if (error) { return handleValidationError(res, error); }

    const profileId = getProfileId(req);
    const skillsInfo = await upsertStudentSkills(profileId, req.body);
    const completionPercentage = await updateCompletionPercentage(profileId);

    return res.json({
      success: true,
      data: {
        skills_info: skillsInfo,
        completion_percentage: completionPercentage
      },
      message: 'Skills updated successfully'
    });
  } catch (error) {
    console.error('Update skills error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
}

// Certificate CRUD (Requires getting student_skills_id first, typically from req.profile.skills_info.id)

/**
 * POST /api/student/profile/skills/certificate
 * Add a certificate. Assumes req.profile is available.
 */
// export async function addCertificate(req, res) {
//   try {
//     // const { error } = certificateRecordSchema.validate(req.body);
//     // if (error) { return handleValidationError(res, error); }

//     const skillsId = req.profile.skills_info?.id;

//     if (!skillsId) {
//       return res.status(400).json({ success: false, error: { code: 'SKILLS_MISSING', message: 'Skills section must be created first.' } });
//     }

//     const newCertificate = await createCertificateRecord(skillsId, req.body);

//     return res.status(201).json({
//       success: true,
//       data: { certificate: newCertificate },
//       message: 'Certificate added successfully'
//     });
//   } catch (error) {
//     console.error('Add certificate error:', error);
//     return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
//   }
// }

/**
 * POST /api/student/profile/skills/certificate
 * Add a certificate. Creates skills section if it doesn't exist.
 */
export async function addCertificate(req, res) {
  try {
    const profileId = getProfileId(req);
    
    // Fetch the current profile with skills_info
    const currentProfile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
      include: { skills_info: true }
    });

    let skillsId = currentProfile?.skills_info?.id;
    
    if (!skillsId) {
      // Create skills section if it doesn't exist
      const newSkillsInfo = await prisma.studentSkills.create({
        data: {
          student_profile_id: profileId,
          selected_skills: []
        }
      });
      skillsId = newSkillsInfo.id;
    }

    // Now create the certificate
    const certificateData = {
      student_skills_id: skillsId,
      certificate_name: req.body.certificateName,
      issuing_organization: req.body.issuingOrganization || null,
      issue_date: req.body.issueDate ? new Date(req.body.issueDate) : null,
      credential_id: req.body.credentialId || null,
      credential_url: req.body.credentialUrl || null
    };

    const newCertificate = await prisma.certificateRecord.create({
      data: certificateData
    });

    // Convert to camelCase before sending
    const camelCaseCert = {
      id: newCertificate.id,
      studentSkillsId: newCertificate.student_skills_id,
      certificateName: newCertificate.certificate_name,
      issuingOrganization: newCertificate.issuing_organization,
      issueDate: newCertificate.issue_date,
      credentialId: newCertificate.credential_id,
      credentialUrl: newCertificate.credential_url,
      createdAt: newCertificate.created_at,
      updatedAt: newCertificate.updated_at
    };

    return res.status(201).json({
      success: true,
      data: { certificate: camelCaseCert },
      message: 'Certificate added successfully'
    });
  } catch (error) {
    console.error('Add certificate error:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: error.message || 'Internal server error' 
      } 
    });
  }
}


// Add this to studentProfileController.js

/**
 * PATCH /api/student/profile/skills/certificate/:recordId
 * Update an existing certificate record
 */
export async function editCertificate(req, res) {
  try {
    // Validation check would go here (e.g., certificateRecordSchema.validate)

    const recordId = parseInt(req.params.recordId, 10);
    
    // We update the record but don't re-calculate completion percentage 
    // as updating a certificate rarely affects core profile completeness (0% to 100%).

    const updatedRecord = await updateCertificateRecord(recordId, req.body);

    return res.json({
      success: true,
      data: { certificate: updatedRecord },
      message: 'Certificate updated successfully'
    });
  } catch (error) {
    console.error('Update certificate error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
}

/**
 * DELETE /api/student/profile/skills/certificate/:recordId
 * Delete a certificate.
 */
export async function removeCertificate(req, res) {
  try {
    const recordId = parseInt(req.params.recordId, 10);

    await deleteCertificateRecord(recordId);

    return res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    console.error('Delete certificate error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
}

/**
 * GET /api/student/profile/completion
 * Get profile completion status
 */
export async function getCompletionStatus(req, res) {
  try {
    const userId = req.user.id;
    const profile = await getStudentProfile(userId); // Uses the model function defined earlier

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
    console.error('Get student completion status error:', error);
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
 * DELETE /api/student/profile
 * Delete user's student profile and all related data
 */
export async function deleteProfile(req, res) {
  try {
    const userId = req.user.id;
    const deleted = await deleteStudentProfile(userId); // Uses the model function defined earlier

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Student profile not found'
        }
      });
    }

    // You might also want to update the role or a flag on the User model here 
    // if the deletion should change the user's status.

    return res.json({
      success: true,
      message: 'Student profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete student profile error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}