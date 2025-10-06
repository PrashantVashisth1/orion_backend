import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { findUserById } from '../models/userModel.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Express middleware to protect routes with JWT authentication.
 * Expects a header: Authorization: Bearer <token>
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // "h3rY9XnJmKpLz0Q2vW5s8dA7tFcGjMhBqR4uZxVoN1yTwEkOi+LxSfU6V3pDzC0H"

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Verify that the user exists in the database
    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // attach user information to request
    req.user = { id: user.id };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

