import { useState, useEffect } from "react";

export default function CashfreePayment({ amount = 10, currency = "INR" }) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  // Use a useEffect to check for the SDK presence
  useEffect(() => {
    // We check every 100ms until the SDK is ready
    const timer = setInterval(() => {
      if (window.Cashfree) {
        setSdkReady(true);
        clearInterval(timer); // Stop checking once it's ready
      }
    }, 100);

    // Clean up the timer when the component unmounts
    return () => clearInterval(timer);
  }, []); // Empty dependency array means this runs once on mount

  const initiatePayment = async () => {
    // Prevent payment initiation if the SDK is not ready
    if (!sdkReady) {
      alert("Cashfree SDK is not ready yet. Please wait a moment.");
      return;
    }

    setLoading(true);
    try {
      // Your existing fetch logic
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/test/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency }),
      });

      const data = await res.json();

      if (!data.payment_session_id || !data.order_id) {
        alert("Failed to create order");
        setLoading(false);
        return;
      }

      // The `checkout` function will now be available
      window.Cashfree.checkout({
        orderId: data.order_id,
        sessionId: data.payment_session_id,
        environment: import.meta.env.VITE_CASHFREE_ENV || "sandbox",
      });
    } catch (err) {
      console.error(err);
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
        disabled={loading || !sdkReady} // Disable button until SDK is ready
        className={`px-6 py-2 rounded-lg text-white ${
          loading || !sdkReady ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Processing..." : sdkReady ? "Pay Now" : "Loading..."}
      </button>
    </div>
  );
}
