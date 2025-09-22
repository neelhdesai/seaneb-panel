import express from "express";
import { createPayment, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/", createPayment);      // POST /api/payment
router.post("/verify", verifyPayment); // POST /api/payment/verify
export default router;
