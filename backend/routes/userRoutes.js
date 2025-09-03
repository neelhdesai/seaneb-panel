import express from "express";
import { 
  createUser, 
  getAllUsers, 
  approveUser, 
  denyUser, 
  getUserProfile,
  updateProfile
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User form submit
router.post("/addusers", createUser);

// Get logged-in user's profile
router.get("/profile", protect, getUserProfile);

// Get all users (admin only)
router.get("/getallusers", protect, getAllUsers);

// Approve/Deny users
router.patch("/approve/:userId", protect, approveUser);
router.patch("/deny/:userId", protect, denyUser);

router.put("/profile", protect, updateProfile);

export default router;
