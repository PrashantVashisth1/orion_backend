// src/routes/needsRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createNeed,
  getNeeds,
  getNeed,
  getMyNeeds,
  updateNeedPost,
  deleteNeedPost,
  getNeedsStatistics,
  searchNeedsController,
  getNeedsByType
} from '../controllers/needsController.js';

const router = express.Router();

// Public routes
router.get('/', getNeeds);                    // Get all needs with filtering/pagination
router.get('/search', searchNeedsController); // Search needs with advanced filters
router.get('/stats', getNeedsStatistics);     // Get needs statistics (public)
router.get('/:id', getNeed);                  // Get specific need by ID
router.get('/needs/:type', getNeedsByType);

// Protected routes (require authentication)
router.post('/', authenticateToken, createNeed);           // Create a new need post
router.get('/user/me', authenticateToken, getMyNeeds);     // Get current user's needs
router.put('/:id', authenticateToken, updateNeedPost);     // Update need post
router.delete('/:id', authenticateToken, deleteNeedPost);  // Delete need post
router.get('/stats/me', authenticateToken, getNeedsStatistics); // Get user-specific stats

export default router;