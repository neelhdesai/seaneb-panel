import express from "express";
import { createPayment, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

// Routes
router.get("/payment", createPayment);
router.post("/verify", verifyPayment);

export default router;
