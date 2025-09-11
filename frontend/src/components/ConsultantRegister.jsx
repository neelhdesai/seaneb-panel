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
    confirmMobileNumber: "",
    password: "",
    consultantPan: "",
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
  const STORAGE_KEY = "consultant_register_form";
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || {});
        setStep(parsed.step || 1);
        setOtp(parsed.otp || "");
        setOtpSent(parsed.otpSent || false);
        setVerifiedMobile(parsed.verifiedMobile || false);
        setAttempts(parsed.attempts || 0);
        setResendTimer(parsed.resendTimer || 0);
        setAgreed(parsed.agreed || false);
        setPanVerified(parsed.panVerified ?? null);
        setLastVerifiedPan(parsed.lastVerifiedPan || "");
        setLastRequestTime(parsed.lastRequestTime || 0);
      } catch {
        console.warn("Failed to parse saved form state");
      }
    }
  }, []);

  // 🔹 Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        formData,
        step,
        otp,
        otpSent,
        verifiedMobile,
        attempts,
        resendTimer,
        agreed,
        panVerified,
        lastVerifiedPan,
        lastRequestTime,
      })
    );
  }, [
    formData,
    step,
    otp,
    otpSent,
    verifiedMobile,
    attempts,
    resendTimer,
    agreed,
    panVerified,
    lastVerifiedPan,
    lastRequestTime,
  ]);

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
    let { name, value } = e.target;

    if (name === "consultantPan") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, ""); // PAN must be uppercase alphanumeric
    }

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const sendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      setErrors({ ...errors, mobileNumber: "Enter valid WhatsApp number" });
      return;
    }

    if (formData.mobileNumber !== formData.confirmMobileNumber) {
      setErrors({ ...errors, confirmMobileNumber: "WhatsApp numbers do not match" });
      return;
    }

    if (attempts >= 3) {
      toast.error("Max OTP attempts reached. Try again after 24 hrs.");
      return;
    }

    try {
      if (formData.mobileNumber === TEST_MOBILE) {
        toast.success(`Test OTP sent! Use ${TEST_OTP}`);
        setOtpSent(true);
        setAttempts((prev) => prev + 1);
        setResendTimer(60);
        return;
      }

      const checkRes = await api.post("/api/users/check-mobile", {
        mobileNumber: formData.mobileNumber,
      });

      if (!checkRes.data.success) {
        setErrors({ ...errors, mobileNumber: checkRes.data.message });
        return;
      }

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

      const res = await api.post("/api/whatsapp/verifyOtp", {
        mobile: formData.mobileNumber,
        otp,
      });




      if (res.data.success) {
        toast.success("Mobile verified!");
        setVerifiedMobile(true);
        setStep(2);
      } else toast.error("Invalid OTP");
    } catch (err) {
      toast.error("OTP verification failed");
      console.log(err);

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
        newErrors.mobileNumber = "WhatsApp  number is required *";
      else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber))
        newErrors.mobileNumber = "Invalid WhatsApp  number";

      if (!formData.confirmMobileNumber)
        newErrors.confirmMobileNumber = "Confirm WhatsApp number is required *";
      else if (formData.mobileNumber !== formData.confirmMobileNumber)
        newErrors.confirmMobileNumber = "WhatsApp numbers do not match";

      else if (!verifiedMobile)
        newErrors.mobileNumber = "Please verify your WhatsApp Number via OTP";
    }
    if (step === 2) {
      if (!formData.consultantPan) {
        newErrors.consultantPan = "PAN is required";
      } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.consultantPan)) {
        newErrors.consultantPan = "Enter valid PAN format (ABCDE1234F)";
      }

      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Enter a valid email address";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    if (step === 3 && !agreed)
      newErrors.agreed = "You must agree to the terms and conditions to submit";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };
  const handleBack = () => {
    if (step === 2) return; // 👈 Prevent going back to Step 1
    setStep((prev) => Math.max(prev - 1, 1));
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

    // ✅ Reset form state
    setFormData({
      name: "",
      email: "",
      mobileNumber: "",
      confirmMobileNumber: "",
      password: "",
      consultantPan: "",
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

    // ✅ Clear saved state from localStorage
    localStorage.removeItem(STORAGE_KEY);

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
          Consultant Registration - Step {step} of 3
        </h2>

        {/* Stepper */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {[1, 2, 3].map((num, idx) => (
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
                {idx < 2 && (
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
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <label className="block text-gray-700 font-medium text-base">
                WhatsApp Number <span className="text-red-500">*</span>
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
                  placeholder="Enter WhatsApp Number"
                  className={`flex-1 border rounded-md px-4 py-2 text-base sm:text-lg ${verifiedMobile
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed border-green-400"
                    : "border-gray-300"
                    }`}
                  disabled={otpSent}
                />
              </div>
              {renderError("mobileNumber")}

              {/* Confirm WhatsApp Number */}
              {!verifiedMobile && (
                <>
                  <label className="block text-gray-700 font-medium text-base">
                    Confirm WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="confirmMobileNumber"
                    value={formData.confirmMobileNumber}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "confirmMobileNumber",
                          value: e.target.value.replace(/\D/g, ""),
                        },
                      })
                    }
                    maxLength={10}
                    placeholder="Re-enter WhatsApp Number"
                    className={`flex-1 border rounded-md px-4 py-2 text-base sm:text-lg ${verifiedMobile
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed border-green-400"
                      : "border-gray-300"
                      }`}
                    disabled={otpSent}
                  />
                  {renderError("confirmMobileNumber")}
                </>
              )}

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

             
            </div>
          )}

          {/* Step 2: PAN, Email, Password */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <label className="block text-gray-700 font-medium text-base">
                PAN Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  name="consultantPan"
                  value={formData.consultantPan}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  disabled={!!formData.name} // Disable when name exists
                  className={`w-full border rounded-md px-4 py-2 uppercase ${panVerified
                    ? "border-green-500 bg-gray-100 text-gray-500 cursor-not-allowed"
                    : errors.consultantPan
                      ? "border-red-500"
                      : ""
                    }`}
                />

                {/* Show Verify if not verified */}
                {!formData.name && (
                  <button
                    type="button"
                    onClick={() => verifyPAN(formData.consultantPan)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Verify
                  </button>
                )}

                {/* Show Edit if already verified */}
                {formData.name && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, name: "" });
                      setPanVerified(false);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                  >
                    Edit
                  </button>
                )}
              </div>
              {renderError("consultantPan")}
              <label className="block text-gray-700 font-medium text-base">
                Name (as per PAN)
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                readOnly
                className="w-full border rounded-md px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              />

              <label className="block text-gray-700 font-medium text-base">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full border rounded-md px-4 py-2"
                />
                <Mail className="absolute right-3 top-3 text-gray-400" size={18} />
              </div>
              {renderError("email")}

              <label className="block text-gray-700 font-medium text-base">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full border rounded-md px-10 py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {renderError("password")}

            </div>
          )}



          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Review Your Details
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-gray-700">
                <p>
                  <strong>Mobile:</strong> {formData.mobileNumber}
                </p>
                <p>
                  <strong>PAN:</strong> {formData.consultantPan}
                </p>
                <p>
                  <strong>Email:</strong> {formData.email}
                </p>
                <p>
                  <strong>Name:</strong> {formData.name}
                </p>

              </div>

              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  I agree to the terms and conditions
                </span>
              </div>
              {renderError("agreed")}
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
              >
                Back
              </button>
            )}
            {step > 1 && step < 3 && ( // 👈 Next only from Step 2 & 3
              <button
                type="button"
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Next
              </button>
            )}
            {step === 3 && (
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
