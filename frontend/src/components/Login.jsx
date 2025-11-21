import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../lib/api";
import Logo from "../../public/seaneb-offers.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Required" }));
      return;
    }
    if (!password.trim()) {
      setErrors((prev) => ({ ...prev, password: "Required" }));
      return;
    }

    setLoading(true);

try {
  const payload = { identifier: email.trim(), password };
  const res = await api.post("/api/auth/login", payload);
  console.log("🔍 Login Response:", res.data);

  const token = res.data?.token;
  const user = res.data?.user;

  if (!token || !user) {
    toast.error("Invalid server response — token missing");
    return;
  }

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("role", user.role);

  toast.success("✅ Login successful");

  switch (user.role) {
    case "admin":
      navigate("/user-business");
      break;
    case "consultant":
      navigate("/business-register");
      break;
    case "dataentry":
      navigate("/dashboard");
      break;
    default:
      navigate("/login");
      break;
  }
} catch (err) {
  console.error("❌ Login Error:", err);
  toast.error(err.response?.data?.message || "Login failed");
} finally {
  setLoading(false);
}

  };

  return (
    <div className="flex items-center justify-center py-10 px-4 min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row w-full max-w-4xl shadow-lg rounded-lg overflow-hidden">
        {/* Left Panel - Desktop */}
        <div className="hidden md:flex flex-col justify-center items-center bg-white md:w-1/2 p-8">
          <img src={Logo} alt="SeaNeB Logo" className=" mb-4" />
        </div>

        <div className="w-full md:w-1/2 bg-gray-50 p-8 flex flex-col justify-center">
          <div className="flex flex-col items-center mb-6 md:hidden">
            <img src={Logo} alt="SeaNeB Logo" className="mb-2" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center md:text-left">
            Welcome Back!
          </h2>
          <p className="text-gray-500 mb-6 text-center md:text-left">
            Sign in to continue to SeaNeB panel.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email or Phone
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or phone"
                className={`w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 ${errors.email
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-500"
                  }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full border rounded-md px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 ${errors.password
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-500"
                    }`}
                />
                <span
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-2 rounded-md font-semibold hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Links */}
          <div className="mt-4 text-center flex flex-col gap-2">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Forgot Password?
            </Link>
            {/* <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link
                to="/consultant"
                className="text-blue-600 hover:underline font-medium"
              >
                Register as Consultant
              </Link>
            </p> */}
          </div>

          {/* Footer */}
          <p className="text-gray-500 text-sm text-center mt-6">
            © 2025 SeaNeB. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
