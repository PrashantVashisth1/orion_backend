// src/models/needsModel.js
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Mapping frontend form types to database enum values
const FORM_TYPE_MAPPING = {
  'live-projects': 'LIVE_PROJECTS',
  'internship': 'INTERNSHIP',
  'research': 'RESEARCH',
  'csr-initiative': 'CSR_INITIATIVE'
};

/**
 * Create a new need post
 */
export async function createNeedPost(userId, formType, formData) {
  try {
    // Map form type to enum
    const needType = FORM_TYPE_MAPPING[formType];
    if (!needType) {
      throw new Error(`Invalid form type: ${formType}`);
    }
    
    // Extract common fields based on form type
    let title, description, imageUrl, contactInfo, location, duration, skills, compensation, detailsJson;
    
    switch (formType) {
      case 'live-projects':
        title = formData.projectTitle;
        description = formData.projectDescription;
        imageUrl = formData.LiveProjectsImage;
        contactInfo = {
          email: formData.projectEmail,
          phone: formData.projectPhone,
          cvEmail: formData.projectCvEmail
        };
        location = formData.projectModeLocation || formData.projectLocation || null;
        duration = formData.projectDuration;
        skills = formData.projectSkills;
        compensation = formData.projectCompensation === 'paid-above-6k' 
          ? formData.projectCompensationSpecify 
          : formData.projectCompensation;
        
        detailsJson = {
          projectTitle: formData.projectTitle,
          projectDescription: formData.projectDescription,
          projectSkills: formData.projectSkills,
          projectDuration: formData.projectDuration,
          projectMode: formData.projectMode,
          projectTeamSize: formData.projectTeamSize,
          projectLocation: formData.projectLocation,
          projectCompensation: formData.projectCompensation,
          projectCompensationSpecify: formData.projectCompensationSpecify,
          projectExtendable: formData.projectExtendable,
          projectEmail: formData.projectEmail,
          projectPhone: formData.projectPhone,
          projectCvEmail: formData.projectCvEmail,
          LiveProjectsImage: formData.LiveProjectsImage
        };
        break;
        
      case 'internship':
        title = formData.job_title;
        description = formData.description;
        imageUrl = formData.InternshipImage;
        contactInfo = {
          email: formData.contact_email,
          phone: formData.contact_phone,
          cvEmail: formData.internship_cv_email
        };
        location = null; // Internship doesn't have explicit location in current form
        duration = formData.duration;
        skills = formData.min_skills;
        compensation = formData.stipend === 'paid-intern-above-6k' 
          ? formData.stipendSpecify 
          : formData.stipend;
        
        detailsJson = {
          jobTitle: formData.job_title,
          description: formData.description,
          openFor: formData.open_for,
          duration: formData.duration,
          stipend: formData.stipend,
          stipendSpecify: formData.stipendSpecify,
          minSkills: formData.min_skills,
          extendable: formData.extendable,
          fulltime: formData.fulltime,
          contactEmail: formData.contact_email,
          contactPhone: formData.contact_phone,
          internshipCvEmail: formData.internship_cv_email,
          InternshipImage: formData.InternshipImage
        };
        break;
        
      case 'research':
        title = formData.researchTitle;
        description = formData.researchDescription;
        imageUrl = formData.ResearchImage;
        contactInfo = {
          email: formData.researchEmail,
          phone: formData.researchPhone,
          cvEmail: formData.researchCvEmail
        };
        location = null; // Research doesn't have explicit location
        duration = formData.researchDuration;
        skills = formData.researchSkills;
        compensation = formData.researchStipend === 'paid-research-above-6k' 
          ? formData.researchStipendSpecify 
          : formData.researchStipend;
        
        detailsJson = {
          researchTitle: formData.researchTitle,
          researchDescription: formData.researchDescription,
          researchOpenFor: formData.researchOpenFor,
          researchDuration: formData.researchDuration,
          researchStipend: formData.researchStipend,
          researchStipendSpecify: formData.researchStipendSpecify,
          researchSkills: formData.researchSkills,
          researchExtendable: formData.researchExtendable,
          researchEmail: formData.researchEmail,
          researchPhone: formData.researchPhone,
          researchCvEmail: formData.researchCvEmail,
          ResearchImage: formData.ResearchImage
        };
        break;
        
      case 'csr-initiative':
        title = formData.initiativeType;
        description = formData.csrDescription;
        imageUrl = formData.CsrInitiativeImage;
        contactInfo = {
          email: formData.csrEmail,
          phone: formData.csrPhone
        };
        location = formData.modeLocation || formData.location || null;
        duration = formData.csrDuration;
        skills = null; // CSR doesn't have skills requirement
        compensation = formData.csrStipend === 'paid-csr-above-6k' 
          ? formData.csrStipendSpecify 
          : formData.csrStipend || formData.csrCompensation;
        
        detailsJson = {
          initiativeType: formData.initiativeType,
          csrDescription: formData.csrDescription,
          csrDuration: formData.csrDuration,
          members: formData.members,
          mode: formData.mode,
          csrStipend: formData.csrStipend,
          csrStipendSpecify: formData.csrStipendSpecify,
          csrCompensation: formData.csrCompensation,
          location: formData.location,
          csrEmail: formData.csrEmail,
          csrPhone: formData.csrPhone,
          CsrInitiativeImage: formData.CsrInitiativeImage
        };
        break;
        
      default:
        throw new Error(`Unsupported form type: ${formType}`);
    }
    
    // Create the need post using Prisma
    const needPost = await prisma.need.create({
      data: {
        user_id: userId,
        type: needType,
        title: title,
        description: description,
        image_url: imageUrl,
        contact_info: contactInfo,
        details_json: detailsJson,
        location: location,
        duration: duration,
        skills: skills,
        compensation: compensation,
        is_published: true
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    });
    
    return needPost;
  } catch (error) {
    console.error('Error creating need post:', error);
    throw error;
  }
}

/**
 * Get all need posts with pagination and filtering
 */
export async function getAllNeeds(options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      type = null,
      location = null,
      skills = null,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {
      is_published: true,
      ...(type && { type: type }),
      ...(location && { 
        location: { 
          contains: location, 
          mode: 'insensitive' 
        } 
      }),
      ...(skills && { 
        skills: { 
          contains: skills, 
          mode: 'insensitive' 
        } 
      })
    };
    
    // Build orderBy clause
    const orderBy = {
      [sortBy]: sortOrder.toLowerCase()
    };
    
    // Get data and count in parallel
    const [needs, total] = await Promise.all([
      prisma.need.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        }
      }),
      prisma.need.count({ where })
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: needs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Error getting all needs:', error);
    throw error;
  }
}

export async function getNeedByType(needType) {
  try {
    const needs = await prisma.need.findMany({
      where: {
        type: needType,
        is_published: true
      }
    });
    return needs;
  } catch (error) {
    console.error('Error getting needs by type:', error);
    throw error;
  }
}

/**
 * Get a specific need post by ID
 */
export async function getNeedById(needId) {
  try {
    const need = await prisma.need.findFirst({
      where: {
        id: needId,
        is_published: true
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    });
    
    return need;
  } catch (error) {
    console.error('Error getting need by ID:', error);
    throw error;
  }
}

/**
 * Get needs posted by a specific user
 */
export async function getNeedsByUser(userId, options = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      includeUnpublished = false
    } = options;
    
    const skip = (page - 1) * limit;
    
    const where = {
      user_id: userId,
      ...(includeUnpublished ? {} : { is_published: true })
    };
    
    const needs = await prisma.need.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    });
    
    return needs;
  } catch (error) {
    console.error('Error getting needs by user:', error);
    throw error;
  }
}

/**
 * Update a need post
 */
export async function updateNeed(needId, userId, updateData) {
  try {
    // First, verify ownership
    const existingNeed = await prisma.need.findFirst({
      where: {
        id: needId,
        user_id: userId
      }
    });
    
    if (!existingNeed) {
      throw new Error('Need not found or unauthorized');
    }
    
    // Filter allowed fields
    const allowedFields = [
      'title', 'description', 'image_url', 'contact_info', 
      'details_json', 'location', 'duration', 'skills', 'compensation'
    ];
    
    const filteredData = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        filteredData[key] = value;
      }
    }
    
    if (Object.keys(filteredData).length === 0) {
      throw new Error('No valid fields to update');
    }
    
    // Update the need post
    const updatedNeed = await prisma.need.update({
      where: {
        id: needId
      },
      data: filteredData,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    });
    
    return updatedNeed;
  } catch (error) {
    console.error('Error updating need:', error);
    throw error;
  }
}

/**
 * Delete a need post
 */
export async function deleteNeed(needId, userId) {
  try {
    // First, verify ownership
    const existingNeed = await prisma.need.findFirst({
      where: {
        id: needId,
        user_id: userId
      }
    });
    
    if (!existingNeed) {
      throw new Error('Need not found or unauthorized');
    }
    
    // Delete the need post
    const deletedNeed = await prisma.need.delete({
      where: {
        id: needId
      }
    });
    
    return deletedNeed;
  } catch (error) {
    console.error('Error deleting need:', error);
    throw error;
  }
}

/**
 * Get statistics for needs
 */
export async function getNeedsStats(userId = null) {
  try {
    const where = {
      is_published: true,
      ...(userId && { user_id: userId })
    };
    
    // Get counts by type
    const stats = await prisma.need.groupBy({
      by: ['type'],
      where,
      _count: {
        type: true
      }
    });
    
    // Get recent counts (last 7 days)
    const recentWhere = {
      ...where,
      created_at: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      }
    };
    
    const recentStats = await prisma.need.groupBy({
      by: ['type'],
      where: recentWhere,
      _count: {
        type: true
      }
    });
    
    // Combine stats
    const combined = stats.map(stat => {
      const recentStat = recentStats.find(r => r.type === stat.type);
      return {
        type: stat.type,
        count: stat._count.type,
        recent_count: recentStat?._count.type || 0
      };
    });
    
    return combined;
  } catch (error) {
    console.error('Error getting needs stats:', error);
    throw error;
  }
}

/**
 * Search needs with advanced filters
 */
export async function searchNeeds(searchOptions = {}) {
  try {
    const {
      query = '',
      type = null,
      location = null,
      skills = null,
      compensation = null,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = searchOptions;
    
    const skip = (page - 1) * limit;
    
    const where = {
      is_published: true,
      ...(type && { type: type }),
      ...(location && { 
        location: { 
          contains: location, 
          mode: 'insensitive' 
        } 
      }),
      ...(skills && { 
        skills: { 
          contains: skills, 
          mode: 'insensitive' 
        } 
      }),
      ...(compensation && { 
        compensation: { 
          contains: compensation, 
          mode: 'insensitive' 
        } 
      }),
      ...(query && {
        OR: [
          { 
            title: { 
              contains: query, 
              mode: 'insensitive' 
            } 
          },
          { 
            description: { 
              contains: query, 
              mode: 'insensitive' 
            } 
          },
          { 
            skills: { 
              contains: query, 
              mode: 'insensitive' 
            } 
          }
        ]
      })
    };
    
    const orderBy = {
      [sortBy]: sortOrder
    };
    
    const [needs, total] = await Promise.all([
      prisma.need.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        }
      }),
      prisma.need.count({ where })
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: needs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Error searching needs:', error);
    throw error;
  }
}

// Close Prisma connection when the application shuts down
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;