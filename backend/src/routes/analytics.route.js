import express from "express";
import protect from "../middleware/auth.middleware.js";
import { getAnalytics, getSummary } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protect, getAnalytics);
router.get("/summary", protect, getSummary);

export default router;
