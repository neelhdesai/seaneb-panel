import { useState, useContext } from "react";
import { toast } from "react-toastify";
import api from "../lib/api";
import "../index.css";

export default function BusinessRegister() {
  const [formData, setFormData] = useState({
    businessName: "",
    registrationPhone: "",
    businessPhone: "",
    pangst: "",
    businessEmail: "",
    transactionDate: "",
    seanebid: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Business Details, Step 2: Review

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateStep = () => {
    const newErrors = {};

    // Step 1: Business Details
    if (!formData.businessName)
      newErrors.businessName = "Business Name is required *";
    if (!formData.registrationPhone)
      newErrors.registrationPhone = "User Registration Number is required *";
    else if (!/^\d{10}$/.test(formData.registrationPhone))
      newErrors.registrationPhone = "Invalid registration number";

    if (!formData.businessPhone)
      newErrors.businessPhone = "Business Phone is required *";
    else if (!/^[6-9]\d{9}$/.test(formData.businessPhone))
      newErrors.businessPhone = "Invalid phone number";

    if (formData.pangst && !/^[A-Z0-9]+$/.test(formData.pangst))
      newErrors.pangst = "PAN/GST must be alphanumeric";

    if (!formData.businessEmail)
      newErrors.businessEmail = "Business Email is required *";
    else if (!/.+\@.+\..+/.test(formData.businessEmail))
      newErrors.businessEmail = "Invalid email address";

    if (!formData.transactionDate)
      newErrors.transactionDate = "Transaction Date is required *";
    if (!formData.seanebid) newErrors.seanebid = "Seanebid is required *";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      await api.post("/api/business/submitBusiness", formData); // consultant ID attached on backend
      toast.success("Business submitted successfully!");
      setFormData({
        businessName: "",
        registrationPhone: "",
        businessPhone: "",
        pangst: "",
        businessEmail: "",
        transactionDate: "",
        seanebid: "",
      });
      setErrors({});
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Business submission failed");
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
        

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Business Registration Form - Step {step} of 2
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Business Details */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-gray-700 font-medium mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter business name"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {renderError("businessName")}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  User Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="registrationPhone"
                  value={formData.registrationPhone}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "registrationPhone", value: e.target.value.replace(/\D/g, "") },
                    })
                  }
                  placeholder="Enter User Registration Number"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  inputMode="numeric"
                  maxLength="10"
                />
                {renderError("registrationPhone")}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Business Phone / WhatsApp Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={(e) =>
                    handleChange({
                      target: { name: "businessPhone", value: e.target.value.replace(/\D/g, "") },
                    })
                  }
                  placeholder="Enter business phone"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  inputMode="numeric"
                  maxLength="10"
                />
                {renderError("businessPhone")}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  PAN / GST Number (Optional)
                </label>
                <input
                  type="text"
                  name="pangst"
                  value={formData.pangst}
                  onChange={(e) =>
                    setFormData({ ...formData, pangst: e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() })
                  }
                  placeholder="Enter PAN/GST Number"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {renderError("pangst")}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Business Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  placeholder="Enter Business email"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {renderError("businessEmail")}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Transaction Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {renderError("transactionDate")}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  SeaNeB ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="seanebid"
                  value={formData.seanebid}
                  onChange={handleChange}
                  placeholder="Enter Seanebid"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {renderError("seanebid")}
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Review your details</h3>
              <div className="mb-2"><strong>Business Name:</strong> {formData.businessName}</div>
              <div className="mb-2"><strong>User Registration Number:</strong> {formData.registrationPhone}</div>
              <div className="mb-2"><strong>Business Phone:</strong> {formData.businessPhone}</div>
              <div className="mb-2"><strong>PAN / GST Number:</strong> {formData.pangst || "N/A"}</div>
              <div className="mb-2"><strong>Business Email:</strong> {formData.businessEmail}</div>
              <div className="mb-2"><strong>Transaction Date:</strong> {formData.transactionDate}</div>
              <div className="mb-2"><strong>Seanebid:</strong> {formData.seanebid}</div>
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
            {step < 2 && (
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
