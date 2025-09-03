import express from "express";
import { changePassword } from "../controllers/changePasswordController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.put("/", protect, changePassword);

export default router;
