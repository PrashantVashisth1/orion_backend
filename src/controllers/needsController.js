// // src/controllers/needsController.js
// import {
//   createNeedPost,
//   getAllNeeds,
//   getNeedById,
//   getNeedsByUser,
//   updateNeed,
//   deleteNeed,
//   getNeedsStats,
//   searchNeeds
// } from '../models/needsModel.js';
// /**
//  * Create a new need post
//  */
// export async function createNeed(req, res,io) {
//   try {
//     const userId = req.user.id;
//     const { formType, formData } = req.body;

//     console.log('Creating need post:', { userId, formType, formData });

//     // Validation
//     if (!formType || !formData) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: 'MISSING_REQUIRED_FIELDS',
//           message: 'Form type and form data are required'
//         }
//       });
//     }

//     // Validate form type
//     const validFormTypes = ['live-projects', 'internship', 'research', 'csr-initiative'];
//     if (!validFormTypes.includes(formType)) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: 'INVALID_FORM_TYPE',
//           message: `Invalid form type. Must be one of: ${validFormTypes.join(', ')}`
//         }
//       });
//     }

//     // Form-specific validation
//     const validation = validateFormData(formType, formData);
//     if (!validation.isValid) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: 'VALIDATION_ERROR',
//           message: 'Form validation failed',
//           details: validation.errors
//         }
//       });
//     }

//     // Create the need post
//     const needPost = await createNeedPost(userId, formType, formData);

//     console.log('Need post created successfully:', needPost.id);

//     res.status(201).json({
//       success: true,
//       data: {
//         need: needPost
//       },
//       message: 'Need post created successfully'
//     });
//   } catch (error) {
//     console.error('Create need error:', error);
    
//     if (error.message.includes('Invalid form type')) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: 'INVALID_FORM_TYPE',
//           message: error.message
//         }
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       error: {
//         code: 'INTERNAL_ERROR',
//         message: 'Failed to search needs',
//         details: error.message
//       }
//     });
//   }
// }

// /**
//  * Validate form data based on form type
//  */
// function validateFormData(formType, formData) {
//   const errors = [];

//   switch (formType) {
//     case 'live-projects':
//       if (!formData.projectTitle?.trim()) {
//         errors.push('Project title is required');
//       }
//       if (!formData.projectDescription?.trim()) {
//         errors.push('Project description is required');
//       }
//       if (!formData.projectEmail?.trim()) {
//         errors.push('Email is required');
//       } else if (!isValidEmail(formData.projectEmail)) {
//         errors.push('Valid email is required');
//       }
//       if (!formData.projectPhone?.trim()) {
//         errors.push('Phone number is required');
//       }
//       if (!formData.projectCvEmail?.trim()) {
//         errors.push('CV email is required');
//       } else if (!isValidEmail(formData.projectCvEmail)) {
//         errors.push('Valid CV email is required');
//       }
//       break;

//     case 'internship':
//       if (!formData.job_title?.trim()) {
//         errors.push('Job title is required');
//       }
//       if (!formData.description?.trim()) {
//         errors.push('Description is required');
//       }
//       if (!formData.duration?.trim()) {
//         errors.push('Duration is required');
//       }
//       if (!formData.contact_email?.trim()) {
//         errors.push('Contact email is required');
//       } else if (!isValidEmail(formData.contact_email)) {
//         errors.push('Valid contact email is required');
//       }
//       if (!formData.contact_phone?.trim()) {
//         errors.push('Contact phone is required');
//       }
//       if (!formData.internship_cv_email?.trim()) {
//         errors.push('CV email is required');
//       } else if (!isValidEmail(formData.internship_cv_email)) {
//         errors.push('Valid CV email is required');
//       }
//       break;

//     case 'research':
//       if (!formData.researchTitle?.trim()) {
//         errors.push('Research title is required');
//       }
//       if (!formData.researchDescription?.trim()) {
//         errors.push('Research description is required');
//       }
//       if (!formData.researchDuration?.trim()) {
//         errors.push('Duration is required');
//       }
//       if (!formData.researchEmail?.trim()) {
//         errors.push('Email is required');
//       } else if (!isValidEmail(formData.researchEmail)) {
//         errors.push('Valid email is required');
//       }
//       if (!formData.researchPhone?.trim()) {
//         errors.push('Phone number is required');
//       }
//       if (!formData.researchCvEmail?.trim()) {
//         errors.push('CV email is required');
//       } else if (!isValidEmail(formData.researchCvEmail)) {
//         errors.push('Valid CV email is required');
//       }
//       break;

//     case 'csr-initiative':
//       if (!formData.initiativeType?.trim()) {
//         errors.push('Initiative type is required');
//       }
//       if (!formData.csrDescription?.trim()) {
//         errors.push('Initiative description is required');
//       }
//       if (!formData.csrDuration?.trim()) {
//         errors.push('Duration is required');
//       }
//       if (!formData.csrEmail?.trim()) {
//         errors.push('Email is required');
//       } else if (!isValidEmail(formData.csrEmail)) {
//         errors.push('Valid email is required');
//       }
//       if (!formData.csrPhone?.trim()) {
//         errors.push('Phone number is required');
//       }
//       break;

//     default:
//       errors.push('Invalid form type');
//   }

//   return {
//     isValid: errors.length === 0,
//     errors
//   };
// }

// /**
//  * Simple email validation
//  */
// function isValidEmail(email) {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// }

// /**
//  * Get all need posts with filtering and pagination
//  */
// export async function getNeeds(req, res) {
//   try {
//     const {
//       page = 1,
//       limit = 20,
//       type,
//       location,
//       skills,
//       sortBy = 'created_at',
//       sortOrder = 'DESC'
//     } = req.query;

//     console.log('Getting needs with params:', { page, limit, type, location, skills, sortBy, sortOrder });

//     // Validate parameters
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);

//     if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: 'INVALID_PAGINATION',
//           message: 'Invalid pagination parameters. Page must be >= 1, limit must be 1-100'
//         }
//       });
//     }

//     // Validate sortBy and sortOrder
//     const validSortFields = ['created_at', 'updated_at', 'title'];
//     const validSortOrders = ['ASC', 'DESC'];
    
//     const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
//     const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

//     const options = {
//       page: pageNum,
//       limit: limitNum,
//       type: type || null,
//       location: location || null,
//       skills: skills || null,
//       sortBy: finalSortBy,
//       sortOrder: finalSortOrder
//     };

//     const result = await getAllNeeds(options);

//     res.json({
//       success: true,
//       data: {
//         needs: result.data,
//         pagination: result.pagination
//       },
//       message: 'Needs retrieved successfully'
//     });
//   } catch (error) {
//     console.error('Get needs error:', error);
//     res.status(500).json({
//       success: false,
//       error: {
//         code: 'INTERNAL_ERROR',
//         message: 'Failed to retrieve needs',
//         details: error.message
//       }
//     });
//   }
// }

// export async function getNeedsByType(req, res) {
//   try {
//     const { type } = req.params;
//     const needs = await getNeedsByType(type);
//     res.json({
//       success: true,
//       data: {
//         needs
//       },
//       message: 'Needs retrieved successfully'
//     });
//   } catch (error) {
//     console.error('Get needs by type error:', error);
//     res.status(500).json({
//       success: false,
//       error: {
//         code: 'INTERNAL_ERROR',
//         message: 'Failed to retrieve needs by type',
//         details: error.message
//       }
//     });
//   }
// }

// /**
//  * Get a specific need post by ID
//  */
// export async function getNeed(req, res) {
//   try {
//     const { id } = req.params;
    
//     if (!id || isNaN(parseInt(id))) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: 'INVALID_ID',
//           message: 'Valid need ID is required'
//         }
//       });
//     }

//     const need = await getNeedById(parseInt(id));

//     if (!need) {
//       return res.status(404).json({
//         success: false,
//         error: {
//           code: 'NEED_NOT_FOUND',
//           message: 'Need post not found'
//         }
//       });
//     }

//     res.json({
//       success: true,
//       data: {
//         need
//       },
//       message: 'Need retrieved successfully'
//     });
//   } catch (error) {
//     console.error('Get need error:', error);
//     res.status(500).json({
//       success: false,
//       error: {
//         code: 'INTERNAL_ERROR',
//         message: 'Failed to retrieve need',
//         details: error.message
//       }
//     });
//   }
// }

// /**
//  * Get needs posted by the current user
//  */
// export async function getMyNeeds(req, res) {
//   try {
//     const userId = req.user.id;
//     const { page = 1, limit = 10, includeUnpublished = false } = req.query;

//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);

//     if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: 'INVALID_PAGINATION',
//           message: 'Invalid pagination parameters'
//         }
//       });
//     }

//     const options = {
//       page: pageNum,
//       limit: limitNum,
//       includeUnpublished: includeUnpublished === 'true'
//     };

//     const needs = await getNeedsByUser(userId, options);

//     res.json({
//       success: true,
//       data: {
//         needs
//       },
//       message: 'User needs retrieved successfully'
//     });
//   } catch (error) {
//     console.error('Get my needs error:', error);
//     res.status(500).json({
//       success: false,
//       error: {
//         code: 'INTERNAL_ERROR',
//         message: 'Failed to retrieve user needs',
//         details: error.message
//       }
//     });
//   }
// }

// /**
//  * Update a need post
//  */
// export async function updateNeedPost(req, res) {
//   try {
//     const userId = req.user.id;
//     const { id } = req.params;
//     const updateData = req.body;

//     if (!id || isNaN(parseInt(id))) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: 'INVALID_ID',
//           message: 'Valid need ID is required'
//         }
//       });
//     }

//     if (!updateData || Object.keys(updateData).length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: 'NO_UPDATE_DATA',
//           message: 'Update data is required'
//         }
//       });
//     }

//     const updatedNeed = await updateNeed(parseInt(id), userId, updateData);

//     res.json({
//       success: true,
//       data: {
//         need: updatedNeed
//       },
//       message: 'Need updated successfully'
//     });
//   } catch (error) {
//     console.error('Update need error:', error);
    
//     if (error.message.includes('not found or unauthorized')) {
//       return res.status(404).json({
//         success: false,
//         error: {
//           code: 'NEED_NOT_FOUND',
//           message: 'Need post not found or unauthorized'
//         }
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: {
//         code: 'INTERNAL_ERROR',
//         message: 'Failed to update need',
//         details: error.message
//       }
//     });
//   }
// }

// /**
//  * Delete a need post
//  */
// export async function deleteNeedPost(req, res) {
//   try {
//     const userId = req.user.id;
//     const { id } = req.params;

//     if (!id || isNaN(parseInt(id))) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: 'INVALID_ID',
//           message: 'Valid need ID is required'
//         }
//       });
//     }

//     await deleteNeed(parseInt(id), userId);

//     res.json({
//       success: true,
//       message: 'Need deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete need error:', error);
    
//     if (error.message.includes('not found or unauthorized')) {
//       return res.status(404).json({
//         success: false,
//         error: {
//           code: 'NEED_NOT_FOUND',
//           message: 'Need post not found or unauthorized'
//         }
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: {
//         code: 'INTERNAL_ERROR',
//         message: 'Failed to delete need',
//         details: error.message
//       }
//     });
//   }
// }

// /**
//  * Get needs statistics
//  */
// export async function getNeedsStatistics(req, res) {
//   try {
//     const { userOnly = false } = req.query;
//     const userId = userOnly === 'true' ? req.user.id : null;

//     const stats = await getNeedsStats(userId);

//     res.json({
//       success: true,
//       data: {
//         statistics: stats
//       },
//       message: 'Statistics retrieved successfully'
//     });
//   } catch (error) {
//     console.error('Get needs statistics error:', error);
//     res.status(500).json({
//       success: false,
//       error: {
//         code: 'INTERNAL_ERROR',
//         message: 'Failed to retrieve statistics',
//         details: error.message
//       }
//     });
//   }
// }

// /**
//  * Search needs with advanced filtering
//  */
// export async function searchNeedsController(req, res) {
//   try {
//     const searchOptions = {
//       query: req.query.q || '',
//       type: req.query.type || null,
//       location: req.query.location || null,
//       skills: req.query.skills || null,
//       compensation: req.query.compensation || null,
//       page: parseInt(req.query.page) || 1,
//       limit: parseInt(req.query.limit) || 20,
//       sortBy: req.query.sortBy || 'created_at',
//       sortOrder: req.query.sortOrder || 'desc'
//     };

//     // Validate parameters
//     if (searchOptions.page < 1 || searchOptions.limit < 1 || searchOptions.limit > 100) {
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: 'INVALID_PAGINATION',
//           message: 'Invalid pagination parameters'
//         }
//       });
//     }

//     const result = await searchNeeds(searchOptions);

//     res.json({
//       success: true,
//       data: {
//         needs: result.data,
//         pagination: result.pagination,
//         searchQuery: searchOptions.query
//       },
//       message: 'Search completed successfully'
//     });
//   } catch (error) {
//     console.error('Search needs error:', error);
//     res.status(500).json({
//       success: false,
//     });
//   }
// }

import * as notificationService from "../services/notificationService.js";
import { broadcastExceptUser } from "../services/socketManager.js";

// Update the createNeed function
export async function createNeed(req, res, io) {
  try {
    const userId = req.user.id;
    const { formType, formData } = req.body;

    // ... your validation code ...
    console.log('Creating need post:', { userId, formType, formData });

    // Validation
    if (!formType || !formData) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Form type and form data are required'
        }
      });
    }

    // Validate form type
    const validFormTypes = ['live-projects', 'internship', 'research', 'csr-initiative'];
    if (!validFormTypes.includes(formType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FORM_TYPE',
          message: `Invalid form type. Must be one of: ${validFormTypes.join(', ')}`
        }
      });
    }

    // Form-specific validation
    const validation = validateFormData(formType, formData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Form validation failed',
          details: validation.errors
        }
      });
    }

    // Create the need post
    const needPost = await createNeedPost(userId, formType, formData);
    console.log('Need post created successfully:', needPost.id);

    // Notify all users except the creator
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { full_name: true }
    });
    
    const userName = user?.full_name || 'A user';
    const needTypeReadable = formType.replace(/-/g, ' ');
    const message = `${userName} posted a new ${needTypeReadable}`;
    
    // Get all active users except the need creator
    const userIds = await notificationService.getAllActiveUserIds(userId);
    
    // Create bulk notifications
    const notifications = userIds.map(uid => ({
      userId: uid,
      message,
      needId: needPost.id,
      isRead: false
    }));
    
    if (notifications.length > 0) {
      await notificationService.createBulkNotifications(notifications);
      
      // Broadcast to all users via Socket.IO
      if (io) {
        const notification = {
          message,
          needId: needPost.id,
          createdAt: new Date(),
          isRead: false,
          need: {
            id: needPost.id,
            title: needPost.title,
            type: needPost.type
          }
        };
        await broadcastExceptUser(io, userId, notification);
      }
    }

    res.status(201).json({
      success: true,
      data: { need: needPost },
      message: 'Need post created successfully'
    });
  } catch (error) {
    console.error('Create need error:', error);
    
    if (error.message.includes('Invalid form type')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FORM_TYPE',
          message: error.message
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to search needs',
        details: error.message
      }
    });
  }
}

/**
 * Validate form data based on form type
 */
function validateFormData(formType, formData) {
  const errors = [];

  switch (formType) {
    case 'live-projects':
      if (!formData.projectTitle?.trim()) {
        errors.push('Project title is required');
      }
      if (!formData.projectDescription?.trim()) {
        errors.push('Project description is required');
      }
      if (!formData.projectEmail?.trim()) {
        errors.push('Email is required');
      } else if (!isValidEmail(formData.projectEmail)) {
        errors.push('Valid email is required');
      }
      if (!formData.projectPhone?.trim()) {
        errors.push('Phone number is required');
      }
      if (!formData.projectCvEmail?.trim()) {
        errors.push('CV email is required');
      } else if (!isValidEmail(formData.projectCvEmail)) {
        errors.push('Valid CV email is required');
      }
      break;

    case 'internship':
      if (!formData.job_title?.trim()) {
        errors.push('Job title is required');
      }
      if (!formData.description?.trim()) {
        errors.push('Description is required');
      }
      if (!formData.duration?.trim()) {
        errors.push('Duration is required');
      }
      if (!formData.contact_email?.trim()) {
        errors.push('Contact email is required');
      } else if (!isValidEmail(formData.contact_email)) {
        errors.push('Valid contact email is required');
      }
      if (!formData.contact_phone?.trim()) {
        errors.push('Contact phone is required');
      }
      if (!formData.internship_cv_email?.trim()) {
        errors.push('CV email is required');
      } else if (!isValidEmail(formData.internship_cv_email)) {
        errors.push('Valid CV email is required');
      }
      break;

    case 'research':
      if (!formData.researchTitle?.trim()) {
        errors.push('Research title is required');
      }
      if (!formData.researchDescription?.trim()) {
        errors.push('Research description is required');
      }
      if (!formData.researchDuration?.trim()) {
        errors.push('Duration is required');
      }
      if (!formData.researchEmail?.trim()) {
        errors.push('Email is required');
      } else if (!isValidEmail(formData.researchEmail)) {
        errors.push('Valid email is required');
      }
      if (!formData.researchPhone?.trim()) {
        errors.push('Phone number is required');
      }
      if (!formData.researchCvEmail?.trim()) {
        errors.push('CV email is required');
      } else if (!isValidEmail(formData.researchCvEmail)) {
        errors.push('Valid CV email is required');
      }
      break;

    case 'csr-initiative':
      if (!formData.initiativeType?.trim()) {
        errors.push('Initiative type is required');
      }
      if (!formData.csrDescription?.trim()) {
        errors.push('Initiative description is required');
      }
      if (!formData.csrDuration?.trim()) {
        errors.push('Duration is required');
      }
      if (!formData.csrEmail?.trim()) {
        errors.push('Email is required');
      } else if (!isValidEmail(formData.csrEmail)) {
        errors.push('Valid email is required');
      }
      if (!formData.csrPhone?.trim()) {
        errors.push('Phone number is required');
      }
      break;

    default:
      errors.push('Invalid form type');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Simple email validation
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get all need posts with filtering and pagination
 */
export async function getNeeds(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      location,
      skills,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    console.log('Getting needs with params:', { page, limit, type, location, skills, sortBy, sortOrder });

    // Validate parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAGINATION',
          message: 'Invalid pagination parameters. Page must be >= 1, limit must be 1-100'
        }
      });
    }

    // Validate sortBy and sortOrder
    const validSortFields = ['created_at', 'updated_at', 'title'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    const options = {
      page: pageNum,
      limit: limitNum,
      type: type || null,
      location: location || null,
      skills: skills || null,
      sortBy: finalSortBy,
      sortOrder: finalSortOrder
    };

    const result = await getAllNeeds(options);

    res.json({
      success: true,
      data: {
        needs: result.data,
        pagination: result.pagination
      },
      message: 'Needs retrieved successfully'
    });
  } catch (error) {
    console.error('Get needs error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve needs',
        details: error.message
      }
    });
  }
}

export async function getNeedsByType(req, res) {
  try {
    const { type } = req.params;
    const needs = await getNeedsByType(type);
    res.json({
      success: true,
      data: {
        needs
      },
      message: 'Needs retrieved successfully'
    });
  } catch (error) {
    console.error('Get needs by type error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve needs by type',
        details: error.message
      }
    });
  }
}

/**
 * Get a specific need post by ID
 */
export async function getNeed(req, res) {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Valid need ID is required'
        }
      });
    }

    const need = await getNeedById(parseInt(id));

    if (!need) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NEED_NOT_FOUND',
          message: 'Need post not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        need
      },
      message: 'Need retrieved successfully'
    });
  } catch (error) {
    console.error('Get need error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve need',
        details: error.message
      }
    });
  }
}

/**
 * Get needs posted by the current user
 */
export async function getMyNeeds(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, includeUnpublished = false } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAGINATION',
          message: 'Invalid pagination parameters'
        }
      });
    }

    const options = {
      page: pageNum,
      limit: limitNum,
      includeUnpublished: includeUnpublished === 'true'
    };

    const needs = await getNeedsByUser(userId, options);

    res.json({
      success: true,
      data: {
        needs
      },
      message: 'User needs retrieved successfully'
    });
  } catch (error) {
    console.error('Get my needs error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve user needs',
        details: error.message
      }
    });
  }
}

/**
 * Update a need post
 */
export async function updateNeedPost(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Valid need ID is required'
        }
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATE_DATA',
          message: 'Update data is required'
        }
      });
    }

    const updatedNeed = await updateNeed(parseInt(id), userId, updateData);

    res.json({
      success: true,
      data: {
        need: updatedNeed
      },
      message: 'Need updated successfully'
    });
  } catch (error) {
    console.error('Update need error:', error);
    
    if (error.message.includes('not found or unauthorized')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NEED_NOT_FOUND',
          message: 'Need post not found or unauthorized'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update need',
        details: error.message
      }
    });
  }
}

/**
 * Delete a need post
 */
export async function deleteNeedPost(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Valid need ID is required'
        }
      });
    }

    await deleteNeed(parseInt(id), userId);

    res.json({
      success: true,
      message: 'Need deleted successfully'
    });
  } catch (error) {
    console.error('Delete need error:', error);
    
    if (error.message.includes('not found or unauthorized')) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NEED_NOT_FOUND',
          message: 'Need post not found or unauthorized'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete need',
        details: error.message
      }
    });
  }
}

/**
 * Get needs statistics
 */
export async function getNeedsStatistics(req, res) {
  try {
    const { userOnly = false } = req.query;
    const userId = userOnly === 'true' ? req.user.id : null;

    const stats = await getNeedsStats(userId);

    res.json({
      success: true,
      data: {
        statistics: stats
      },
      message: 'Statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get needs statistics error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve statistics',
        details: error.message
      }
    });
  }
}

/**
 * Search needs with advanced filtering
 */
export async function searchNeedsController(req, res) {
  try {
    const searchOptions = {
      query: req.query.q || '',
      type: req.query.type || null,
      location: req.query.location || null,
      skills: req.query.skills || null,
      compensation: req.query.compensation || null,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'desc'
    };

    // Validate parameters
    if (searchOptions.page < 1 || searchOptions.limit < 1 || searchOptions.limit > 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAGINATION',
          message: 'Invalid pagination parameters'
        }
      });
    }

    const result = await searchNeeds(searchOptions);

    res.json({
      success: true,
      data: {
        needs: result.data,
        pagination: result.pagination,
        searchQuery: searchOptions.query
      },
      message: 'Search completed successfully'
    });
  } catch (error) {
    console.error('Search needs error:', error);
    res.status(500).json({
      success: false,
    });
  }
}