import express from "express";
import { createPayment, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

// Routes
router.get("/", createPayment);      // now maps to /api/payment
router.post("/verify", verifyPayment);

export default router;
