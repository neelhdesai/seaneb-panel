import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../lib/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [cooldown, setCooldown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown((c) => {
                    if (c <= 1) clearInterval(timer);
                    return c - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const handleRequestOtp = async () => {
        if (!/^[6-9]\d{9}$/.test(mobile)) {
            toast.error("Enter a valid 10-digit mobile number");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/api/password/forgot-password", { mobile });
            toast.success(res.data.message);
            setStep(2);
            setAttempts((prev) => prev + 1);
            setCooldown(300); // 5 mins
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error("Enter the OTP");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/api/whatsapp/verifyOtp", { mobile, otp });
            toast.success(res.data.message);
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error("Enter both fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/api/password/reset-password", {
                mobile,
                otp,
                newPassword,
            });
            toast.success(res.data.message);
            setStep(4); // success step
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    const steps = ["Enter Mobile", "Verify OTP", "Reset Password"];

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    Forgot Password
                </h2>

                {/* Progress indicator */}
                <div className="flex justify-between mb-8">
                    {steps.map((label, index) => (
                        <div key={index} className="flex flex-col items-center w-1/3">
                            <div
                                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold 
                ${step === index + 1
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : step > index + 1
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-300 text-gray-600"
                                    }`}
                            >
                                {index + 1}
                            </div>
                            <span className="text-xs mt-2 text-gray-600">{label}</span>
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="space-y-5">
                        <div className="relative">
                            <input
                                type="text"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                maxLength={10}
                                className="peer w-full border-b-2 border-gray-300 bg-transparent py-2 focus:border-blue-600 outline-none"
                                placeholder=" "
                            />
                            <label className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all 
                peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base 
                peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-blue-600">
                                Mobile Number
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">We’ll send OTP to your WhatsApp.</p>
                        <button
                            onClick={handleRequestOtp}
                            disabled={loading || attempts >= 3}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
                        >
                            {loading ? "Sending..." : attempts >= 3 ? "Max Attempts Reached" : "Send OTP"}
                        </button>

                        <Link
                            to="/login"
                            className="w-full block text-center bg-gray-300 text-gray-800 py-3 rounded-xl hover:bg-gray-400 transition"
                        >
                            ← Back to Login
                        </Link>
                    </div>
                )}
                {/* Step 2 */}
                {step === 2 && (
                    <div className="space-y-5">
                        <div className="relative">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} // max 5 digits
                                maxLength={6}
                                className="peer w-full border-b-2 border-gray-300 bg-transparent py-2 focus:border-green-600 outline-none"
                                placeholder=" "
                            />
                            <label className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all 
                peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base 
                peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-green-600">
                                Enter OTP
                            </label>
                        </div>

                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>

                        {/* Resend OTP */}
                        <button
                            onClick={handleRequestOtp}
                            disabled={cooldown > 0 || attempts >= 3}
                            className="w-full bg-gray-600 text-white py-2 rounded-xl hover:bg-gray-700 transition"
                        >
                            {cooldown > 0
                                ? `Resend in ${formatTime(cooldown)}`
                                : attempts >= 3
                                    ? "Max Attempts Reached"
                                    : "Resend OTP"}
                        </button>
                    </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <div className="space-y-5">
                        {/* New Password */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="peer w-full border-b-2 border-gray-300 bg-transparent py-2 pr-10 focus:border-purple-600 outline-none"
                                placeholder=" "
                            />
                            <label className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all 
          peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base 
          peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-purple-600">
                                New Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="peer w-full border-b-2 border-gray-300 bg-transparent py-2 pr-10 focus:border-purple-600 outline-none"
                                placeholder=" "
                            />
                            <label className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all 
          peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base 
          peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-purple-600">
                                Confirm Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Reset Button */}
                        <button
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </div>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                    <div className="flex flex-col items-center gap-4">
                        <h2 className="text-green-600 font-semibold text-lg">
                            Password Reset Successful 🎉
                        </h2>
                        <p className="text-gray-600 text-sm">
                            You can now login with your new password.
                        </p>
                        <Link
                            to="/login"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Go to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}


