import express from "express";
import protect from "../middleware/auth.middleware.js";
import { apiLimiter } from "../middleware/rateLimit.middleware.js";
import { getFinanceAdvice } from "../controllers/ai.controller.js";

const router = express.Router();

router.get("/advice", protect, apiLimiter, getFinanceAdvice);

export default router;