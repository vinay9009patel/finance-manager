import express from "express";
import protect from "../middleware/auth.middleware.js";
import Badge from "../models/Badge.model.js";


const router =express.Router();

router.get("/",protect,async(req,res)=>{
const badges=await Badge.find({
user:req.user._id

})
res.json(badges)
})

export default router;