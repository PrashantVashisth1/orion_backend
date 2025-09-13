import express from "express";
import { signup, login } from "../controllers/authController.js";
import { authLimiter } from "../utils/helpers/rateLimiter.js";

const router = express.Router();

// Public: register a new account
router.post("/signup", authLimiter, signup);

// Public: login and receive token
router.post("/login", authLimiter, login);

export default router;
