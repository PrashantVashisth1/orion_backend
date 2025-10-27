import express from 'express';
import {
  getProfile,
  createProfile,
  deleteProfile,
  getCompletionStatus,
  updatePersonalInfo,
  updateBusinessDetails,
  updateCompanyDetails,
  updateOfferings,
  updateInterests,
  updateTechnologyInterests,
  updatePartnershipInterests,
  updateInnovationFocus,
  updateCombinedSections,
  getPublicStartupProfile
} from '../controllers/startupProfileController.js';
import { checkAndCreateProfile } from '../middleware/startupProfileMiddleware.js';
import { uploadFile, deleteFile } from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/auth.js';
import { profileRateLimit } from '../utils/helpers/rateLimiter.js';

const router = express.Router();

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(profileRateLimit);

// Main profile routes
router.get('/profile', getProfile);
router.post('/profile', createProfile);
router.delete('/profile', deleteProfile);

// Profile completion status
router.get('/profile/completion', getCompletionStatus);

router.get('/profile/:userId', getPublicStartupProfile);

// File upload routes
router.post('/upload', uploadFile);
router.delete('/upload/:filename', deleteFile);

// Section-specific update routes
router.patch('/profile/personal-info', checkAndCreateProfile, updatePersonalInfo);
router.patch('/profile/business-details', checkAndCreateProfile, updateBusinessDetails);
router.patch('/profile/company-details', checkAndCreateProfile, updateCompanyDetails);
router.patch('/profile/offerings', checkAndCreateProfile, updateOfferings);
router.patch('/profile/interests', checkAndCreateProfile, updateInterests);
router.patch('/profile/technology-interests', checkAndCreateProfile, updateTechnologyInterests);
router.patch('/profile/partnership-interests', checkAndCreateProfile, updatePartnershipInterests);
router.patch('/profile/innovation-focus', checkAndCreateProfile, updateInnovationFocus);
router.patch('/profile/combined-sections', checkAndCreateProfile, updateCombinedSections);

export default router;
