import { Router } from 'express';
import { getResources, getTrendingStartups, submitForFunding } from '../controllers/getFundedController.js';
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
export default router;