
import { useState } from "react";
import api from "../lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VerifyPan() {
  const [pan, setPan] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!pan) {
      toast.error("Please enter PAN number");
      return;
    }

    setLoading(true);
    setFullName("");

    try {
      const res = await api.post("/api/verify-pan", { pan });

      if (res.data.success) {
        setFullName(res.data.data.fullName); // ✅ only use fullName
        toast.success("PAN verified successfully");
      } else {
        toast.error(res.data.message || "PAN verification failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-2xl font-bold mb-4 text-gray-800">PAN Verification</h2>

      <input
        type="text"
        value={pan}
        onChange={(e) => setPan(e.target.value.toUpperCase())}
        placeholder="Enter PAN Number"
        className="w-full border px-3 py-2 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className={`w-full py-2 rounded-lg text-white font-medium shadow-md transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      {fullName && (
        <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
          <p className="text-sm text-gray-600">Full Name (as per PAN)</p>
          <p className="font-semibold text-gray-800 mt-1">{fullName}</p>
        </div>
      )}
    </div>
  );
}
