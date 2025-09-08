import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  mobile: { type: String, required: true, match: /^[6-9]\d{9}$/ },
  otp: { type: String, required: true },
  attempts: { type: Number, default: 1 }, // no. of OTP requests in 24 hrs
  lastSent: { type: Date, default: Date.now }, // last OTP send timestamp
  firstAttempt: { type: Date, default: Date.now }, // first attempt in 24 hr window
  verified: { type: Boolean, default: false }
}, { timestamps: true });

const OtpLog = mongoose.model("OtpLog", otpSchema);
export default OtpLog;
