import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { createUser, findUserByEmail } from '../models/userModel.js';
import { generateToken } from '../utils/helpers/generateToken.js';
import { signupSchema, loginSchema } from '../utils/validation/authValidation.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * POST /api/auth/signup
 */
export async function signup(req, res) {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }
    const { fullName, email, mobile, password } = req.body;
    
    // Check for existing user
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Invalid registration details'
        }
      });
    }

    // Create new user
    const user = await createUser({ fullName, email, mobile, password });

    // Generate JWT
    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      data: { user, token },
      message: 'User registered successfully'
    });
  } catch (err) {
    console.log(err);
    console.error('Signup error:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }
    const { email, password } = req.body;

    // Find user
    const user = await findUserByEmail(email);
    console.log(user)
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials'
        }
      });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials'
        }
      });
    }

    // Generate JWT
    const token = generateToken(user.id);

    // Remove sensitive fields
    const { password_hash, ...userData } = user;

    return res.json({
      success: true,
      data: { user: userData, token },
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      }
    });
  }
}