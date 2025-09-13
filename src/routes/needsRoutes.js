import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createNeed, getNeeds } from '../controllers/needsController.js';

const router = express.Router();

// Create a new need post (protected)
router.post('/',authenticateToken , createNeed);

// Get all need posts (public)
router.get('/', getNeeds);

export default router;
