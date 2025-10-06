import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Helper to generate JWT tokens for a user
 */
export function generateToken(userId) {
  console.log(JWT_SECRET)
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}