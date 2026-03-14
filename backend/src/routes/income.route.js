import express from "express";
import protect from "../middleware/auth.middleware.js";
import{
    addIncome,getIncomes
} from "../controllers/income.controller.js";

const router =express.Router();
router.post("/",protect,addIncome);
router.get("/",protect,getIncomes);

export default router;