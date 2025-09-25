import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { createUser, findUserByEmail, findUserByEmailAndStatus, upsertUnverifiedUser, verifyUser } from '../models/userModel.js';
import { generateToken } from '../utils/helpers/generateToken.js';
import { signupSchema, loginSchema } from '../utils/validation/authValidation.js';
import { sendOtpEmail } from '../utils/helpers/emailService.js';
import crypto from "crypto";

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

export const sendOtp = async (req, res) => {
  // 1. Validate input
  const { full_name, email, mobile, password } = req.body;

  // 2. Check if a verified user with this email already exists
  const existingVerifiedUser = await findUserByEmailAndStatus(email, true);
  if (existingVerifiedUser) {
    return res.status(409).json({ message: 'A verified account with this email already exists.' });
  }

  // 3. Generate OTP and hash password
  const otp = crypto.randomInt(100000, 999999).toString();
  const password_hash = await bcrypt.hash(password, 10);
  const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // 4. Create or update user as unverified
  const userData = { full_name, email, mobile, password_hash, otp, otp_expires_at, is_verified: false };
  await upsertUnverifiedUser(email, userData);

  // 5. Send OTP email
  try {
    await sendOtpEmail(email, otp);
    res.status(200).json({ message: 'OTP sent to your email. Please verify.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
};

export const verifyOtpAndRegister = async (req, res) => {
    // 1. Get email and OTP from request
    const { email, otp } = req.body;

    // 2. Find unverified user
    const user = await findUserByEmailAndStatus(email, false);
    if (!user || user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // 3. Check if OTP has expired
    if (new Date() > new Date(user.otp_expires_at)) {
        return res.status(400).json({ message: 'OTP has expired.' });
    }

    // 4. Verify user and generate token
    const verifiedUser = await verifyUser(email);
    const token = generateToken(verifiedUser.id);

    res.status(201).json({ token, user: verifiedUser });
};
