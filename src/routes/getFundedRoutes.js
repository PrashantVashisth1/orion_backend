import { Router } from 'express';
import { getResources, getTrendingStartups } from '../controllers/getFundedController.js';

const router = Router();

// 1. Resources Section
router.get('/resources', getResources);

// 3. Trending Section (Publicly viewable)
router.get('/trending', getTrendingStartups);
export default router;