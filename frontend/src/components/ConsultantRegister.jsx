import { useState, useRef, useEffect } from "react";
import { Link } from "react-router"; 
import { toast } from "react-toastify";
import api from "../lib/api";
import {
  Eye,
  EyeOff,
  CheckCircle,
  Edit2,
  Send,
  UserCheck,
  Mail,
  Lock,
  CreditCard,
  DollarSign,
  FileText,
} from "lucide-react";

const isValidPAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
const TEST_MOBILE = "9999999999"; // <-- test number
const TEST_OTP = "123456";        // <-- test OTP

export default function ConsultantRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    consultantPan: "",
    consultantUpiId: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifiedMobile, setVerifiedMobile] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);
  const [panVerified, setPanVerified] = useState(null);
  const [lastVerifiedPan, setLastVerifiedPan] = useState("");
  const [lastRequestTime, setLastRequestTime] = useState(0);

  useEffect(() => {
    const currentTimer = timerRef.current;
    return () => {
      if (currentTimer) clearInterval(currentTimer);
    };
  }, []);

  useEffect(() => {
    if (!otpSent || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };


  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      setErrors({ ...errors, mobileNumber: "Enter valid mobile number" });
      return;
    }

    if (attempts >= 3) {
      toast.error("Max OTP attempts reached. Try again after 24 hrs.");
      return;
    }

    try {
      // 🚀 Skip API call for test number
      if (formData.mobileNumber === TEST_MOBILE) {
        toast.success(`Test OTP sent! Use ${TEST_OTP}`);
        setOtpSent(true);
        setAttempts((prev) => prev + 1);
        setResendTimer(60); // test: 1 minute timer
        return;
      }

      // ✅ Check if mobile is already registered
      const checkRes = await api.post("/api/users/check-mobile", {
        mobileNumber: formData.mobileNumber,
      });

      if (!checkRes.data.success) {
        setErrors({ ...errors, mobileNumber: checkRes.data.message });
        return;
      }

      // ✅ Send OTP if mobile is available
      await api.post("/api/whatsapp/sendOtp", {
        mobile: formData.mobileNumber,
      });

      toast.success("OTP sent on WhatsApp!");
      setOtpSent(true);
      setAttempts((prev) => prev + 1);
      setResendTimer(300);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      // 🚀 Handle test case
      if (formData.mobileNumber === TEST_MOBILE) {
        if (otp === TEST_OTP) {
          toast.success("Test mobile verified!");
          setVerifiedMobile(true);
          setStep(2);
        } else {
          toast.error("Invalid Test OTP");
        }
        return;
      }

      // ✅ Normal flow
      const res = await api.post("/api/whatsapp/verifyOtp", {
        mobile: formData.mobileNumber,
        otp,
      });

      if (res.data.success) {
        toast.success("Mobile verified!");
        setVerifiedMobile(true);
        setStep(2);
      } else toast.error("Invalid OTP");
    } catch {
      toast.error("OTP verification failed");
    }
  };

  const verifyPAN = async (pan) => {
    if (!isValidPAN(pan)) {
      setErrors((prev) => ({
        ...prev,
        consultantPan: "Enter valid PAN format (ABCDE1234F)",
      }));
      setPanVerified(false);
      return;
    }
    if (lastVerifiedPan === pan && panVerified) return;
    const now = Date.now();
    if (now - lastRequestTime < 30000) {
      const sec = Math.ceil((30000 - (now - lastRequestTime)) / 1000);
      toast.warning(`Please wait ${sec}s before verifying again.`);
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/api/pan/verify", { pan });
      if (!res.data.success) {
        setErrors((prev) => ({ ...prev, consultantPan: "Invalid PAN" }));
        setPanVerified(false);
      } else {
        setFormData((prev) => ({
          ...prev,
          name: res.data.data?.fullName || "",
        }));
        setPanVerified(true);
        setLastVerifiedPan(pan);
        setLastRequestTime(now);
        toast.success("PAN verified successfully!");
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        consultantPan: "PAN verification failed",
      }));
      setPanVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.mobileNumber)
        newErrors.mobileNumber = "Mobile number is required *";
      else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber))
        newErrors.mobileNumber = "Invalid mobile number";
      else if (!verifiedMobile)
        newErrors.mobileNumber = "Please verify your mobile number via OTP";
    }
    if (step === 2) {
      if (!formData.consultantPan)
        newErrors.consultantPan = "PAN is required *";
      else if (!isValidPAN(formData.consultantPan))
        newErrors.consultantPan = "Enter valid PAN format (ABCDE1234F)";
      else if (panVerified !== true)
        newErrors.consultantPan = "Please verify a valid PAN";
      if (!formData.email) newErrors.email = "Email is required *";
      else if (!/.+@.+\..+/.test(formData.email))
        newErrors.email = "Invalid email address";
      if (!formData.password || formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
    }
    if (step === 4 && !agreed)
      newErrors.agreed = "You must agree to the terms and conditions to submit";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };
  const handleBack = () => {
    // Prevent going back to Step 1 if mobile is verified
    if (step === 2 && verifiedMobile) return;
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    const payload = {
      ...formData,
      consultantPan: formData.consultantPan.trim().toUpperCase(),
      email: formData.email.trim().toLowerCase(),
      mobileNumber: formData.mobileNumber.trim(),
    };
    setLoading(true);
    try {
      await api.post("/api/users/addusers", payload);
      toast.success(
        "Consultant registered successfully! Awaiting admin approval."
      );
      setFormData({
        name: "",
        email: "",
        mobileNumber: "",
        password: "",
        consultantPan: "",
        consultantUpiId: "",
      });
      setAgreed(false);
      setStep(1);
      setErrors({});
      setPanVerified(null);
      setLastVerifiedPan("");
      setVerifiedMobile(false);
      setOtp("");
      setOtpSent(false);
      setAttempts(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) =>
    errors[field] && (
      <p className="text-red-500 text-sm mt-1 animate-fade">{errors[field]}</p>
    );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-3xl bg-white p-6 sm:p-10 rounded-xl shadow-xl border border-gray-200">
        {/* Logo + Heading */}
        <div className="flex justify-center mb-6">
          <img src="./seaneb-offers.png" alt="Logo" className="h-16 w-auto" />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Consultant Registration - Step {step} of 4
        </h2>

        {/* Stepper */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {[1, 2, 3, 4].map((num, idx) => (
              <div key={num} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-base sm:text-lg transition ${step === num
                    ? "bg-blue-600 text-white shadow-lg"
                    : step > num
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-600"
                    }`}
                >
                  {step > num ? <CheckCircle size={18} /> : num}
                </div>
                {idx < 3 && (
                  <div
                    className={`w-6 sm:w-10 h-1 mx-1 sm:mx-2 transition ${step > num ? "bg-green-500" : "bg-gray-300"
                      }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {step > 1 && verifiedMobile && (
          <div className="flex items-center gap-2 mb-4 text-gray-700 font-medium text-lg">
            <span>👋 Hello,</span>
            <span className="font-semibold">{`+91 ${formData.mobileNumber}`}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Mobile + OTP */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <label className="block text-gray-700 font-medium text-base">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "mobileNumber",
                        value: e.target.value.replace(/\D/g, ""),
                      },
                    })
                  }
                  maxLength={10}
                  placeholder="Enter mobile number"
                  className={`flex-1 border rounded-md px-4 py-2 text-base sm:text-lg ${verifiedMobile
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed border-green-400"
                    : "border-gray-300"
                    }`}
                  disabled={otpSent}
                />
                {otpSent && (
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setVerifiedMobile(false);
                      setOtp("");
                    }}
                    className="flex items-center text-blue-600 font-medium gap-1 text-sm sm:text-base"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                )}
              </div>
              {renderError("mobileNumber")}

              {otpSent && (
                <div className="mt-4 space-y-3">
                  <label className="block text-gray-700 font-medium text-base">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    placeholder="• • • • • •"
                    className="w-full border rounded-md px-4 py-3 text-center text-xl tracking-widest focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  />
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-2 gap-2">
                    <button
                      type="button"
                      onClick={verifyOtp}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md font-medium transition w-full sm:w-auto"
                    >
                      <CheckCircle size={18} /> Verify OTP
                    </button>
                    <span className="text-gray-500 font-medium text-sm sm:text-base">
                      {resendTimer > 0
                        ? `${Math.floor(resendTimer / 60)}:${resendTimer % 60 < 10
                          ? `0${resendTimer % 60}`
                          : resendTimer % 60
                        }`
                        : "You can resend now"}
                    </span>
                  </div>
                  {resendTimer === 0 && (
                    <button
                      type="button"
                      onClick={sendOtp}
                      className="flex items-center gap-2 text-blue-600 underline text-sm sm:text-base mt-1"
                    >
                      <Send size={16} /> Resend OTP
                    </button>
                  )}
                </div>
              )}

              {!otpSent && (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={resendTimer > 0}
                  className="mt-4 w-full sm:w-auto bg-blue-700 hover:bg-blue-800  text-white py-2 px-6 rounded-md text-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Send size={18} /> Send OTP
                </button>
              )}

              <p className="text-gray-600 text-sm mt-4 text-center">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Login
                </Link>
              </p>

            </div>
          )}

          {/* Step 2: PAN + Email + Password */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              {/* PAN Number */}
              <div className="flex items-center gap-2">
                <CreditCard size={20} />
                <span className="font-medium text-gray-700">PAN Number *</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="consultantPan"
                  value={formData.consultantPan}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  className={`flex-1 border rounded-md px-4 py-2 text-base sm:text-lg ${panVerified
                    ? "border-green-500 bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "border-gray-300"
                    }`}
                  disabled={panVerified} // Disable input after verification
                />
                {/* Show Verify button only if not verified */}
                {!panVerified && (
                  <button
                    type="button"
                    onClick={() => verifyPAN(formData.consultantPan)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-1"
                  >
                    <CheckCircle size={16} /> Verify
                  </button>
                )}
              </div>
              {renderError("consultantPan")}

              {/* Display Verified Name */}
              {panVerified && (
                <div className="mt-2">
                  <label className="block text-gray-700 font-medium mb-1">
                    Verified Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    readOnly
                    className="w-full border border-gray-300 bg-gray-100 text-gray-600 rounded-md px-4 py-2 cursor-not-allowed"
                  />
                </div>
              )}

              {/* Email */}
              <div className="flex items-center gap-2 mt-4">
                <Mail size={20} />
                <span className="font-medium text-gray-700">Email *</span>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="border rounded-md px-4 py-2 text-base sm:text-lg"
              />
              {renderError("email")}

              {/* Password */}
              <div className="flex items-center gap-2 mt-4">
                <Lock size={20} />
                <span className="font-medium text-gray-700">Password *</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full border rounded-md px-4 py-2 text-base sm:text-lg pr-10"
                />
                <span
                  className="absolute right-3 top-2.5 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
              {renderError("password")}

              {/* Navigation Buttons */}
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-4">
                {step > 2 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2 border rounded-md font-medium hover:bg-gray-100 transition"
                  >
                    Back
                  </button>
                )}
                <button
                  type={step === 4 ? "submit" : "button"}
                  onClick={step !== 4 ? handleNext : undefined}
                  disabled={loading}
                  className={`px-6 py-2 rounded-md font-semibold transition 
      ${step === 4
                      ? "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white flex items-center justify-center gap-2"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    }`}
                >
                  {step === 4 ? (
                    loading ? (
                      "Submitting..."
                    ) : (
                      <>
                        Submit <FileText size={18} />
                      </>
                    )
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: UPI */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <DollarSign size={20} />{" "}
                <span className="font-medium text-gray-700">
                  UPI ID (Optional)
                </span>
              </div>
              <input
                type="text"
                name="consultantUpiId"
                value={formData.consultantUpiId}
                onChange={handleChange}
                placeholder="example@upi"
                className="border rounded-md px-4 py-2 text-base sm:text-lg"
              />
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2 border rounded-md font-medium hover:bg-gray-100 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md font-semibold transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review + Terms + Submit */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Review Your Details
              </h3>
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50 space-y-2">
                <p>
                  <strong>Name:</strong> {formData.name || "Not Provided"}
                </p>
                <p>
                  <strong>Mobile:</strong>{" "}
                  {formData.mobileNumber || "Not Provided"}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email || "Not Provided"}
                </p>
                <p>
                  <strong>PAN:</strong>{" "}
                  {formData.consultantPan || "Not Provided"}
                </p>
                <p>
                  <strong>UPI ID:</strong>{" "}
                  {formData.consultantUpiId || "Not Provided"}
                </p>
              </div>

              {/* Terms & Conditions */}
              <label className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={() => setAgreed(!agreed)}
                  className="w-5 h-5 accent-blue-600"
                />
                I agree to the{" "}
                <span className="text-blue-600 underline cursor-pointer">
                  Terms & Conditions
                </span>
              </label>
              {renderError("agreed")}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2 border rounded-md font-medium hover:bg-gray-100 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-md font-semibold transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Submitting..."
                  ) : (
                    <>
                      Submit <FileText size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
