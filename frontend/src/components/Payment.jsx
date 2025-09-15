import { useState, useEffect } from "react";

export default function CashfreePayment({ amount = 10, currency = "INR" }) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // This part is crucial for ensuring the SDK is loaded before use
    const checkSDK = () => {
      if (window.Cashfree) {
        setSdkReady(true);
      } else {
        setTimeout(checkSDK, 100);
      }
    };
    checkSDK();
  }, []);

  const initiatePayment = async () => {
    if (!sdkReady) {
      alert("Cashfree SDK is not ready. Please try again in a moment.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/test/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle server-side errors returned from your API
        alert(`Failed to create order: ${data.error}`);
        setLoading(false);
        return;
      }

      // Use Cashfree JS SDK for checkout
      window.Cashfree.checkout({
        orderId: data.order_id,
        sessionId: data.payment_session_id,
        environment: import.meta.env.VITE_CASHFREE_ENV || "sandbox",
      });

    } catch (err) {
      console.error("Payment initiation failed:", err);
      alert("Payment initiation failed. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Amount: ₹{amount}</h2>
      <button
        onClick={initiatePayment}
        disabled={loading || !sdkReady}
        className={`px-6 py-2 rounded-lg text-white ${
          loading || !sdkReady ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {!sdkReady && <p className="mt-2 text-sm text-red-500">Loading payment SDK...</p>}
    </div>
  );
}
