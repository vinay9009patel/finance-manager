import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
  registerUser,
  loginUser,
  linkParentByCode,
  linkStudentToParent,
  updateProfile
} from "../controllers/auth.controller.js";

const router=express.Router();
router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/link-parent", protect, linkParentByCode);
router.post("/link-student", protect, linkStudentToParent);
router.put("/profile", protect, updateProfile);
export default router;
