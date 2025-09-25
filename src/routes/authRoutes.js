import express from "express";
import { signup, login, sendOtp, verifyOtpAndRegister } from "../controllers/authController.js";
import { authLimiter } from "../utils/helpers/rateLimiter.js";

const router = express.Router();

// Public: register a new account
router.post("/signup", authLimiter, signup);

// Public: login and receive token
router.post("/login", authLimiter, login);

router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', authLimiter, verifyOtpAndRegister);

export default router;
