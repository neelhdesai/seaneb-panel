import express from "express";
import { createCashfreeOrder } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", createCashfreeOrder);

export default router;
