import { useState } from "react";
import { toast } from "react-toastify";
import api from "../lib/api";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name) newErrors.name = "Name is required *";

      if (!formData.mobileNumber)
        newErrors.mobileNumber = "Mobile number is required *";
      else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber))
        newErrors.mobileNumber = "Invalid mobile number";

      if (!formData.email) newErrors.email = "Email is required *";
      else if (!/.+\@.+\..+/.test(formData.email))
        newErrors.email = "Invalid email address";

      if (!formData.password || formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";

      if (!formData.consultantPan)
        newErrors.consultantPan = "PAN is required *";
      else if (!/^[A-Z0-9]{10}$/.test(formData.consultantPan))
        newErrors.consultantPan = "Invalid PAN format";

      if (!formData.consultantUpiId)
        newErrors.consultantUpiId = "UPI ID is required *";
      else if (!/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.consultantUpiId))
        newErrors.consultantUpiId = "Invalid UPI ID";
    }

    if (step === 2 && !agreed) {
      newErrors.agreed = "You must agree to the terms and conditions to submit";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      await api.post("/api/users/addusers", formData);
      toast.success("Consultant registered successfully! Awaiting admin approval.");

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
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) =>
    errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg">
        {/* Logo Centered */}
        <div className="flex justify-center mb-6">
          <img
            src="./seaneb-offers.png" // Replace with your logo path
            alt="Logo"
            className="h-20 w-auto"
          />
        </div>

        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Consultant Registration Form - Step {step} of 2
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Full Name", name: "name", type: "text", placeholder: "Enter full name" },
                { label: "Mobile Number", name: "mobileNumber", type: "text", placeholder: "Enter mobile number", maxLength: 10 },
                { label: "Email", name: "email", type: "email", placeholder: "Enter email" },
                { label: "Password", name: "password", type: "password", placeholder: "Enter password" },
                { label: "Consultant PAN", name: "consultantPan", type: "text", placeholder: "ABCDE1234F", maxLength: 10 },
                { label: "Consultant UPI ID", name: "consultantUpiId", type: "text", placeholder: "example@upi" },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="block text-gray-700 font-medium mb-1">
                    {field.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={(e) => {
                      if (field.name === "mobileNumber") {
                        handleChange({ target: { name: field.name, value: e.target.value.replace(/\D/g, "") } });
                      } else if (field.name === "name" || field.name === "consultantPan") {
                        setFormData({ ...formData, [field.name]: e.target.value.toUpperCase() });
                      } else handleChange(e);
                    }}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={field.maxLength}
                  />
                  {renderError(field.name)}
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Terms & Review */}
          {step === 2 && (
            <div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Review your details</h3>
                <div className="space-y-1 text-gray-700">
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Mobile:</strong> {formData.mobileNumber}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Password:</strong> ******</p>
                  <p><strong>PAN:</strong> {formData.consultantPan}</p>
                  <p><strong>UPI ID:</strong> {formData.consultantUpiId}</p>
                </div>

                <div className="mt-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700 text-sm">
                      I agree to the <a href="/terms" className="text-blue-600 underline">terms and conditions</a>
                    </span>
                  </label>
                  {errors.agreed && <p className="text-red-500 text-sm mt-1">{errors.agreed}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                disabled={loading}
              >
                Back
              </button>
            )}
            {step === 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Next
              </button>
            )}
            {step === 2 && (
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
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
