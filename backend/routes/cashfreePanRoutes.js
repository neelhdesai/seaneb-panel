import express from "express";
import { verifyPanWithCashfree } from "../controllers/cashfreePanController.js";

const router = express.Router();

router.post("/verify-pan", (req, res, next) => {
  console.log("🚀 /verify-pan route hit!", req.body); // Log incoming request
  next(); // Pass to controller
}, verifyPanWithCashfree);

export default router;
