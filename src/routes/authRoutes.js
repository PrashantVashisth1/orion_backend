import express from "express";
import {
  signup,
  login,
  sendOtp,
  verifyOtpAndRegister,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { authLimiter } from "../utils/helpers/rateLimiter.js";

const router = express.Router();

// Public: register a new account
router.post("/signup", authLimiter, signup);

// Public: login and receive token
router.post("/login", authLimiter, login);

router.post("/send-otp", authLimiter, sendOtp);
router.post("/verify-otp", authLimiter, verifyOtpAndRegister);

router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);


export default router;
