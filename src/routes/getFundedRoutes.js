import { Router } from 'express';
import { getResources, getTrendingStartups, submitForFunding, getPitchReviewStatus,
  submitPitchForReview, } from '../controllers/getFundedController.js';
import { authenticateToken } from '../middleware/auth.js';
import { pitchDeckUpload, handlePitchDeckUploadError } from '../middleware/pitchDeckUploadMiddleware.js';

const router = Router();

// 1. Resources Section
router.get('/resources', getResources);

router.get('/trending', getTrendingStartups);

router.post(
  '/funding-opportunity/submit',
  authenticateToken, 
  pitchDeckUpload.single('pitchDeck'),
  submitForFunding,
  handlePitchDeckUploadError
);

// GET the user's current pitch review status (daily limit check)
router.get('/pitch-review-status', authenticateToken, getPitchReviewStatus);

// POST a new pitch deck for AI review
router.post(
  '/submit-pitch-review',
  authenticateToken,
  pitchDeckUpload.single('pitchDeck'), // Re-uses your existing multer middleware
  submitPitchForReview
);


export default router;