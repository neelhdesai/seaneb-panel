import axios from "axios";
import dotenv from "dotenv";
import OtpLog from "../models/OtpLog.js";

dotenv.config();

export const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, message: "Mobile number is required" });
    }

    const now = Date.now();
    let record = await OtpLog.findOne({ mobile });

    // 🔑 If already verified, reset record so new OTP can be sent
    if (record?.verified) {
      await OtpLog.deleteOne({ mobile });
      record = null;
    }

    // If record exists, check limits
    if (record) {
      // Max 3 fresh OTPs within 24 hrs
      if (
        record.attempts >= 3 &&
        now - record.firstAttempt.getTime() < 24 * 60 * 60 * 1000
      ) {
        return res.status(429).json({
          success: false,
          message: "Maximum OTP attempts reached. Try again after 24 hours.",
        });
      }

      // Resend cooldown 5 mins
      if (now - record.lastSent.getTime() < 5 * 60 * 1000) {
        const waitTime = Math.ceil(
          (5 * 60 * 1000 - (now - record.lastSent.getTime())) / 1000
        );
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitTime} seconds before resending OTP.`,
        });
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP via WhatsApp
    await axios.post(
      "https://graph.facebook.com/v22.0/697235583482932/messages",
      {
        messaging_product: "whatsapp",
        to: `91${mobile}`,
        type: "template",
        template: {
          name: "otp",
          language: { code: "en" },
          components: [
            { type: "body", parameters: [{ type: "text", text: otp }] },
            {
              type: "button",
              sub_type: "URL",
              index: "0",
              parameters: [{ type: "text", text: "COPY_CODE" }],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Update or create DB record
    if (!record) {
      record = new OtpLog({
        mobile,
        otp,
        attempts: 1, // first OTP of the day
        firstAttempt: now,
        lastSent: now,
        verified: false,
      });
    } else {
      // Reset daily attempts if 24 hrs passed
      if (now - record.firstAttempt.getTime() >= 24 * 60 * 60 * 1000) {
        record.attempts = 1;
        record.firstAttempt = now;
      }
      // 🔑 For resends, do NOT increment attempts
      record.otp = otp;
      record.lastSent = now;
      record.verified = false;
    }

    await record.save();

    res.json({ success: true, message: "OTP sent successfully via WhatsApp" });
  } catch (error) {
    console.error("Error sending OTP:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const record = await OtpLog.findOne({ mobile });

    if (!record)
      return res
        .status(400)
        .json({ success: false, message: "OTP not requested for this number" });

    if (record.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    // Mark verified
    record.verified = true;
    await record.save();

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};
