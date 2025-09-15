import { useEffect, useState } from "react";

export default function CashfreePayment({ amount = 10, currency = "INR" }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const checkSdk = setInterval(() => {
      if (window.Cashfree) {
        setSdkReady(true);
        clearInterval(checkSdk);
        console.log("✅ Cashfree SDK v3.0 loaded");
      }
    }, 300);
    return () => clearInterval(checkSdk);
  }, []);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/test/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, currency }),
        }
      );
      const data = await response.json();
      if (!data?.payment_session_id) throw new Error("No session ID");
      setSessionId(data.payment_session_id);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch payment session");
    } finally {
      setLoading(false);
    }
  };

  const payNow = () => {
    if (!window.Cashfree || !sessionId) return alert("SDK not ready or session missing");
    const cfInstance = new window.Cashfree({ mode: "PROD" });
    cfInstance.pay({
      paymentSessionId: sessionId,
      redirectTarget: "_self",
      onError: (err) => console.error("Cashfree Pay error:", err),
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Amount: ₹{amount}</h2>

      {!sessionId ? (
        <button
          onClick={fetchSession}
          disabled={!sdkReady || loading}
          className={`px-6 py-2 rounded-lg text-white ${
            sdkReady && !loading
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Fetching..." : sdkReady ? "Pay Now" : "Loading..."}
        </button>
      ) : (
        <button
          onClick={payNow}
          className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        >
          Pay Now
        </button>
      )}
    </div>
  );
}
