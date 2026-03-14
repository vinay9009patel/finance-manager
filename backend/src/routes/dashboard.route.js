import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
  getDashboardData,
  getLinkedChildDetails
} from "../controllers/dashboard.controller.js";




const router =express.Router();

router.get("/",protect,getDashboardData);
router.get("/children/:childId", protect, getLinkedChildDetails);

export default router;

