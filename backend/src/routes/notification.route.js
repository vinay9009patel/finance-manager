import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
  getNotifications,
  markAllNotificationsRead
} from "../controllers/notification.controller.js";

const router =express.Router();
router.get("/",protect,getNotifications);
router.patch("/read-all", protect, markAllNotificationsRead);

export default router
