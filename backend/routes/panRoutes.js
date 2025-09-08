import express from "express";
import { verifyPan } from "../controllers/panController.js";

const router = express.Router();

// POST /api/pan/verify
router.post("/verify", verifyPan);

export default router;
