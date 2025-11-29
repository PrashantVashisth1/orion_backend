import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { findUserById } from '../models/userModel.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error("Token Verification Error:", err.message);

    // Specific handling for expired tokens
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: 'Token expired', 
        code: 'TOKEN_EXPIRED',
        expiredAt: err.expiredAt 
      });
    }

    return res.status(403).json({ error: 'Invalid token' });
  }
}