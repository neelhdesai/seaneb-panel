import React, { useState } from "react";
import axios from "axios";

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    dob: "",
    gender: "",
    country_code: "+91",
    mobile_no: "",
    player_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorType, setErrorType] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorType("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorType("");
    setLoading(true);

    console.log("🚀 Submitting form with data:", formData);

    try {
      const res = await axios.post(
        "https://api.seaneb.com/api/mobile/register-user-no-otp",
        formData
      );

      console.log("✅ API Response:", res.data);
      setMessage(`✅ ${res.data.message || "User registered successfully!"}`);

      // ✅ Clear form fields after success
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        dob: "",
        gender: "",
        country_code: "+91",
        mobile_no: "",
        player_id: "",
      });
    } catch (err) {
  console.group("❌ Registration Error Details");
  console.log("Response Data:", err.response?.data);
  console.log("Status:", err.response?.status);
  console.log("Headers:", err.response?.headers);
  console.log("Error Message:", err.message);
  console.groupEnd();

  const errMsg =
    err.response?.data?.message || "Registration failed. Please try again.";

  if (errMsg.includes("User not found")) {
    setMessage("⚠️ Please complete mobile verification before registering.");
    setErrorType("mobile");
  } else {
    setMessage(`❌ ${errMsg}`);
  }
} finally {
      setLoading(false);
      console.log("🕓 Request completed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Register User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full focus:outline-blue-500"
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full focus:outline-blue-500"
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="p-3 border rounded-lg w-full focus:outline-blue-500"
          />

          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="p-3 border rounded-lg w-full focus:outline-blue-500"
            required
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="p-3 border rounded-lg w-full focus:outline-blue-500"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              name="country_code"
              placeholder="+91"
              value={formData.country_code}
              onChange={handleChange}
              className="p-3 border rounded-lg w-full focus:outline-blue-500"
            />
            <input
              type="text"
              name="mobile_no"
              placeholder="Mobile Number"
              value={formData.mobile_no}
              onChange={handleChange}
              className={`p-3 border rounded-lg col-span-2 w-full focus:outline-blue-500 ${
                errorType === "mobile" ? "border-red-500 bg-red-50" : ""
              }`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              message.includes("⚠️")
                ? "text-yellow-700"
                : message.includes("❌")
                ? "text-red-600"
                : "text-green-700"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterUser;
