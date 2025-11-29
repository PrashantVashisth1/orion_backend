import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Helper to generate JWT tokens for a user
 */
export function generateToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured. Set JWT_SECRET in your .env file');
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });
}