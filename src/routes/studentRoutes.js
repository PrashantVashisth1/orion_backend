import express from 'express';
import {
  getProfile,
  createProfile,
  deleteProfile,
  getCompletionStatus,
  updatePersonalInfo,
  updateSkills,
  addEducationRecord,
  editEducationRecord,
  removeEducationRecord,
  addWorkExperience,
  editWorkExperience,
  removeWorkExperience,
  addCertificate,
  editCertificate, 
  removeCertificate
  // You might want a 'getPublicStudentProfile' route too, but keeping it focused on provided controllers
} from '../controllers/studentProfileController.js'; // Adjust path as necessary
import { uploadPersonalInfoImage} from '../controllers/studentProfileController.js';

// Middleware specific to student profile existence check
import { checkAndCreateStudentProfile } from '../middleware/studentProfileMiddleware.js'; // You'll need to create this middleware

// Common utilities/middleware
import { authenticateToken } from '../middleware/auth.js';
import { profileRateLimit } from '../utils/helpers/rateLimiter.js';
// import { uploadFile, deleteFile } from '../controllers/uploadController.js'; // Include if file uploads are needed for student profile images/docs

const router = express.Router();

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(profileRateLimit);

// --- Main Profile Routes (/api/student/profile) ---

/**
 * GET /api/student/profile - Get complete private profile
 * POST /api/student/profile - Create initial profile
 * DELETE /api/student/profile - Delete profile
 */
router.get('/profile', getProfile);
router.post('/profile', createProfile);
router.delete('/profile', deleteProfile);

// --- Profile Status Route ---

/**
 * GET /api/student/profile/completion - Get completion percentage
 */
router.get('/profile/completion', getCompletionStatus);

// --- Public Profile Route (Optional, but usually standard) ---

// router.get('/profile/:userId', getPublicStudentProfile); // Uncomment if you create this controller

// --- Section-Specific Update Routes (One-to-One Sections) ---

/**
 * PATCH /api/student/profile/personal-info
 * PATCH /api/student/profile/skills
 * Uses checkAndCreateStudentProfile middleware to ensure the parent profile exists.
 */
router.patch('/profile/personal-info', checkAndCreateStudentProfile,uploadPersonalInfoImage, updatePersonalInfo);
router.patch('/profile/skills', checkAndCreateStudentProfile, updateSkills);


// --- One-to-Many Sections (Education and Work Experience CRUD) ---

// Education Records
router.post('/profile/education', checkAndCreateStudentProfile, addEducationRecord);
router.patch('/profile/education/:recordId', checkAndCreateStudentProfile, editEducationRecord);
router.delete('/profile/education/:recordId', checkAndCreateStudentProfile, removeEducationRecord);

// Work Experience Records
router.post('/profile/work-experience', checkAndCreateStudentProfile, addWorkExperience);
router.patch('/profile/work-experience/:recordId', checkAndCreateStudentProfile, editWorkExperience);
router.delete('/profile/work-experience/:recordId', checkAndCreateStudentProfile, removeWorkExperience);

// Certificate Records (Related to Skills)
router.post('/profile/skills/certificate', checkAndCreateStudentProfile, addCertificate);
router.patch('/profile/skills/certificate/:recordId', checkAndCreateStudentProfile, editCertificate); // Uncomment if you added this controller
router.delete('/profile/skills/certificate/:recordId', checkAndCreateStudentProfile, removeCertificate);


// --- Submit for Review (Optional for Students, but structured for future use) ---

// router.post('/profile/submit-for-review', submitForReview); // Uncomment if implemented for students

export default router;