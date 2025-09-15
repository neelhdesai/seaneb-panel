import { useEffect, useState } from "react";

export default function CashfreePayment({ amount = 10, currency = "INR" }) {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const waitForSdk = () => {
      if (window.Cashfree && window.Cashfree.payments) {
        setSdkReady(true);
        console.log("✅ Cashfree SDK fully loaded");
      } else {
        console.log("⏳ Waiting for Cashfree SDK...");
        setTimeout(waitForSdk, 300);
      }
    };

    waitForSdk();
  }, []);

  const initiatePayment = async () => {
    if (!sdkReady) {
      alert("Cashfree SDK not loaded yet. Please try again.");
      return;
    }

    try {
      console.log("➡️ Initiating payment...");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/test/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, currency }),
        }
      );

      const data = await response.json();
      console.log("➡️ Backend data:", data);

      if (data?.payment_session_id) {
        console.log("✅ Payment session ID received:", data.payment_session_id);

        // Correct v3 Hosted Checkout usage
        const cf = window.Cashfree.payments.init({
          sessionId: data.payment_session_id,
          mode: "PROD", // "TEST" for sandbox
        });

        // Open payment modal
        cf.open();
      } else {
        alert("Error creating Cashfree order");
      }
    } catch (error) {
      console.error("❌ Payment initiation error:", error);
      alert("Payment failed to start");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-bold mb-4">Amount: ₹{amount}</h2>
      <button
        onClick={initiatePayment}
        disabled={!sdkReady}
        className={`px-6 py-2 rounded-lg text-white ${
          sdkReady
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {sdkReady ? "Pay Now" : "Loading SDK..."}
      </button>
    </div>
  );
}
