// import express from 'express';
// import { authenticateToken } from '../middleware/auth.js';
// import { createSession,getAllSession } from '../controllers/sessionController.js';

// // const router = express.Router();

// // // Create a new session
// // router.post('/',authenticateToken , createSession);
// // router.get('/',getAllSession);

// // export default router;

// export default (io) => {
//   const router = express.Router();

//   // Pass the `io` and `prisma` instances to the createPost controller
//   router.post('/',authenticateToken ,(req,res) => createSession(req,res,io));
//   router.get('/',getAllSession);
  
//   return router;
// };

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { createSession, getAllSession, getSession } from '../controllers/sessionController.js';

export default (io) => {
  const router = express.Router();

  // Create session - pass io to controller
  router.post('/', authenticateToken, (req, res) => {
    createSession(req, res, io);
  });

  // Get all sessions
  router.get('/all', getAllSession);

  // Get sessions by type (query param: ?type=WEBINAR)
  router.get('/', getSession);
  
  return router;
};