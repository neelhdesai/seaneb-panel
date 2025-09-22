import express from "express";
import { verifyPanWithCashfree } from "../controllers/cashfreePanController.js";

const router = express.Router();

router.post("/verify-pan", verifyPanWithCashfree);

export default router;
