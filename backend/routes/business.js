import express from "express";
import { submitBusiness, updateBusiness, getAllBusinesses, getMyBusinesses } from "../controllers/businessController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Submit a business - only consultant can submit
router.post("/submitBusiness", protect, restrictTo("consultant"), submitBusiness);

// Get all businesses - only admin can view
router.get("/getAllBusiness", protect, restrictTo("admin"), getAllBusinesses);

// Update business - only admin can update
router.patch("/:id", protect, restrictTo("admin"), updateBusiness);

router.get("/my", protect, getMyBusinesses);

export default router;
