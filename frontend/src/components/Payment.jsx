import { useEffect, useState } from "react";

export default function CashfreePayment({ amount = 10, currency = "INR" }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const initiatePayment = async () => {
  if (!window.Cashfree) return alert("SDK not loaded");

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

    // Create instance and pay immediately
    const cfInstance = new window.Cashfree({ mode: "PROD" });
    cfInstance.pay({
      paymentSessionId: data.payment_session_id,
      redirectTarget: "_self",
      onError: (err) => console.error("Cashfree Pay error:", err),
    });
  } catch (error) {
    console.error(error);
    alert("Payment initiation failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Amount: ₹{amount}</h2>
      <button
        onClick={initiatePayment}
        disabled={!sdkReady || loading}
        className={`px-6 py-2 rounded-lg text-white ${
          sdkReady && !loading
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {loading ? "Processing..." : sdkReady ? "Pay Now" : "Loading..."}
      </button>
    </div>
  );
}
