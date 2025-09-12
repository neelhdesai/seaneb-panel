import express from "express";
import { createOrder } from "../controllers/paymentController.js";

const router = express.Router();

// POST: create a new order in Cashfree
router.post("/create-order", createOrder);

export default router;
