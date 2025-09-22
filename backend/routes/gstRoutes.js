import express from "express";
import {verifyGSTWithCashfree} from "../controllers/cashfreeGstController.js";

const router = express.Router();

// GST verification
router.post("/verify-gst", verifyGSTWithCashfree);

export default router;
