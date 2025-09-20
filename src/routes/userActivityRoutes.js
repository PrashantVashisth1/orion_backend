import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { getUserActivities } from "../controllers/userActivityController.js";

const router = express.Router();

router.get("/me", authenticateToken, getUserActivities);

export default router;