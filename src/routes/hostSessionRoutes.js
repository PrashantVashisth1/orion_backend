import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createHostSession, getHostSessions } from '../controllers/hostSessionController.js';

const router = express.Router();

// Create a new host session (protected)
router.post('/', authenticateToken ,createHostSession);

// Get all host sessions (public)
router.get('/', getHostSessions);

export default router;
