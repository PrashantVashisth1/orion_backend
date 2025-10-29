import { Router } from 'express';
import { getExploreStartups, getStartupByUserId } from '../controllers/exploreController.js';

const router = Router();
// public routes
router.get('/startups', getExploreStartups);
router.get('/startups/:userId', getStartupByUserId);

export default router;