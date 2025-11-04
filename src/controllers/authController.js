import dotenv from "dotenv";
import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmail,
  findUserByEmailAndStatus,
  upsertUnverifiedUser,
  verifyUser,
  findUserByResetToken,
  setUserResetToken,
  updateUserPassword,
} from "../models/userModel.js";
import { generateToken } from "../utils/helpers/generateToken.js";
import {
  signupSchema,
  loginSchema,
} from "../utils/validation/authValidation.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../utils/helpers/emailService.js";
import crypto from "crypto";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * POST /api/auth/signup
 */
// export async function signup(req, res) {
//   try {
//     const { error } = signupSchema.validate(req.body);
//     if (error) {
//       console.log(error);
//       return res.status(400).json({
//         success: false,
//         error: {
//           code: "VALIDATION_ERROR",
//           message: "Validation failed",
//           details: error.details.map((detail) => ({
//             field: detail.path.join("."),
//             message: detail.message,
//           })),
//         },
//       });
//     }
//     const { fullName, email, mobile, password } = req.body;

//     // Check for existing user
//     const existing = await findUserByEmail(email);
//     if (existing) {
//       return res.status(409).json({
//         success: false,
//         error: {
//           code: "EMAIL_EXISTS",
//           message: "Invalid registration details",
//         },
//       });
//     }

//     // Create new user
//     const user = await createUser({ fullName, email, mobile, password });

//     // Generate JWT
//     const token = generateToken(user.id);

//     return res.status(201).json({
//       success: true,
//       data: { user, token },
//       message: "User registered successfully",
//     });
//   } catch (err) {
//     console.log(err);
//     console.error("Signup error:", err);
//     return res.status(500).json({
//       success: false,
//       error: {
//         code: "INTERNAL_ERROR",
//         message: "Internal server error",
//       },
//     });
//   }
// }

export async function signup(req, res) {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          })),
        },
      });
    }

    const { fullName, email, mobile, password, role } = req.body;

    // Check for existing user
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: "EMAIL_EXISTS",
          message: "Invalid registration details",
        },
      });
    }

    // Create new user with role
    const user = await createUser({ fullName, email, mobile, password, role });

    // Generate JWT
    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      data: { user, token },
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
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
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          })),
        },
      });
    }
    const { email, password } = req.body;

    // Find user
    const user = await findUserByEmail(email);
    console.log(user);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
        },
      });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
        },
      });
    }

    // Generate JWT
    const token = generateToken(user.id);

    // Remove sensitive fields
    // const { password_hash, ...userData } = user;

    const userData = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      is_startup_verified: user.is_startup_verified, 
      has_submitted_profile: user.has_submitted_profile, 
      last_login: user.last_login,
      created_at: user.created_at
    };

    return res.json({
      success: true,
      data: { user: userData, token },
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    });
  }
}

// export const sendOtp = async (req, res) => {
//   // 1. Validate input
//   const { full_name, email, mobile, password } = req.body;

//   // 2. Check if a verified user with this email already exists
//   const existingVerifiedUser = await findUserByEmailAndStatus(email, true);
//   if (existingVerifiedUser) {
//     return res
//       .status(409)
//       .json({ message: "A verified account with this email already exists." });
//   }

//   // 3. Generate OTP and hash password
//   const otp = crypto.randomInt(100000, 999999).toString();
//   const password_hash = await bcrypt.hash(password, 10);
//   const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

//   // 4. Create or update user as unverified
//   const userData = {
//     full_name,
//     email,
//     mobile,
//     password_hash,
//     otp,
//     otp_expires_at,
//     is_verified: false,
//   };
//   await upsertUnverifiedUser(email, userData);

//   // 5. Send OTP email
//   try {
//     await sendOtpEmail(email, otp);
//     res.status(200).json({ message: "OTP sent to your email. Please verify." });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to send OTP." });
//   }
// };

export const sendOtp = async (req, res) => {
  const { full_name, email, mobile, password, role = "STARTUP" } = req.body; // 🟢 added role

  const existingVerifiedUser = await findUserByEmailAndStatus(email, true);
  if (existingVerifiedUser) {
    return res
      .status(409)
      .json({ message: "A verified account with this email already exists." });
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const password_hash = await bcrypt.hash(password, 10);
  const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

  const userData = {
    full_name,
    email,
    mobile,
    password_hash,
    otp,
    otp_expires_at,
    is_verified: false,
    role, // 🟢 add this line
  };

  await upsertUnverifiedUser(email, userData);

  try {
    await sendOtpEmail(email, otp);
    res.status(200).json({ message: "OTP sent to your email. Please verify." });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP." });
  }
};


export const verifyOtpAndRegister = async (req, res) => {
  // 1. Get email and OTP from request
  const { email, otp } = req.body;

  // 2. Find unverified user
  const user = await findUserByEmailAndStatus(email, false);
  if (!user || user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP." });
  }

  // 3. Check if OTP has expired
  if (new Date() > new Date(user.otp_expires_at)) {
    return res.status(400).json({ message: "OTP has expired." });
  }

  // 4. Verify user and generate token
  const verifiedUser = await verifyUser(email);
  const token = generateToken(verifiedUser.id);

  res.status(201).json({ token, user: verifiedUser });
};


/**
 * @desc    Request a password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await setUserResetToken(user.id, resetToken, resetTokenExpiry);
      await sendPasswordResetEmail(user.email, resetToken);
    }
    
    
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

/**
 * @desc    Reset password using a token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, error: 'Token and password are required.' });
        }

        const user = await findUserByResetToken(token);

        if (!user || user.reset_token_expiry < new Date()) {
            return res.status(400).json({ success: false, error: 'Invalid or expired password reset token.' });
        }

        await updateUserPassword(user.id, password);

        res.status(200).json({ success: true, message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};