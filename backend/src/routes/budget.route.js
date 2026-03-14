import express from "express";
import protect from "../middleware/auth.middleware.js";

import {
  setBudget,
  getBudget,
  getBudgetStatus,
  getBudgetWarning,
  updateBudget,
  deleteBudget
} from "../controllers/budget.controller.js";


const router = express.Router();

router.post("/", protect, setBudget);
router.get("/", protect, getBudget);
router.put("/:id", protect, updateBudget);
router.delete("/:id", protect, deleteBudget);
router.get("/status", protect, getBudgetStatus);
router.get("/warning", protect, getBudgetWarning);

export default router;
