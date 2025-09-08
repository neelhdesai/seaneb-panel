import express from "express";
import { sendOtp, verifyOtp } from "../controllers/whatsappController.js";

const router = express.Router();

// Send OTP
router.post("/sendOtp", sendOtp);

// Verify OTP
router.post("/verifyOtp", verifyOtp);

export default router;
