// controllers/authController.js
import User from "../models/User.js";
import { sendOtp } from "./whatsappController.js"; // reuse your OTP logic
import OtpLog from "../models/OtpLog.js";
import bcrypt from "bcryptjs";

export const forgotPassword = async (req, res) => {
  try {
    const { mobile } = req.body;

    // ✅ Check if user exists
    const user = await User.findOne({ mobileNumber: mobile });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this mobile number",
      });
    }

    // ✅ Reuse sendOtp
    req.body.mobile = mobile;
    return sendOtp(req, res);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { mobile, otp, newPassword } = req.body;

    // ✅ Validate OTP
    const otpRecord = await OtpLog.findOne({ mobile, otp, verified: true });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unverified OTP",
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update user password
    const user = await User.findOneAndUpdate(
      { mobileNumber: mobile },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Clear OTP record
    await OtpLog.deleteOne({ mobile });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};