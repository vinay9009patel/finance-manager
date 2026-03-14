import express from "express";
import protect from "../middleware/auth.middleware.js";
import { apiLimiter } from "../middleware/rateLimit.middleware.js";
import { chatWithAI } from "../controllers/chat.controller.js";
import { getChatHistory } from "../controllers/chat.controller.js";
const router =express.Router()
router.post("/",protect,apiLimiter,chatWithAI)
router.get("/history",protect,getChatHistory)
export default router
