import { Router } from 'express';
import { getResources, getTrendingStartups, submitForFunding } from '../controllers/getFundedController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/fileUpload.js'; 

const router = Router();

// 1. Resources Section
router.get('/resources', getResources);

router.get('/trending', getTrendingStartups);

router.post(
  '/funding-opportunity/submit', 
  authenticateToken,
  upload.single("pitchDeck"),
  submitForFunding
);
export default router;