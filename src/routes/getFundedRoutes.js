import { Router } from 'express';
import { getResources } from '../controllers/getFundedController.js';

const router = Router();

// 1. Resources Section
router.get('/resources', getResources);

export default router;