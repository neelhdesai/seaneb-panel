import express from "express";
import { 
  createUser, 
  getAllUsers, 
  approveUser, 
  denyUser, 
  getUserProfile,
  updateProfile,
  checkMobile,
  updateStatus,
  getPendingConsultantsCount,
  getMe
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User form submit
router.post("/addusers", createUser);

router.post("/check-mobile", checkMobile);
router.patch("/status/:id", updateStatus);


// Get logged-in user's profile
router.get("/profile", protect, getUserProfile);

// Get all users (admin only)
router.get("/getallusers", protect, getAllUsers);

// Approve/Deny users
router.patch("/approve/:userId", protect, approveUser);
router.patch("/deny/:userId", protect, denyUser);

router.get("/pending-count", getPendingConsultantsCount);
router.put("/profile", protect, updateProfile);

router.get("/me", protect, getMe);

export default router;
