import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createSession,getAllSession } from '../controllers/sessionController.js';

const router = express.Router();

// Create a new session
router.post('/',authenticateToken , createSession);
router.get('/',getAllSession);

export default router;

