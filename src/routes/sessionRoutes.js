import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createSession,getAllSession } from '../controllers/sessionController.js';

// const router = express.Router();

// // Create a new session
// router.post('/',authenticateToken , createSession);
// router.get('/',getAllSession);

// export default router;

export default (io) => {
  const router = express.Router();

  // Pass the `io` and `prisma` instances to the createPost controller
  router.post('/',authenticateToken ,(req,res) => createSession(req,res,io));
  router.get('/',getAllSession);
  
  return router;
};