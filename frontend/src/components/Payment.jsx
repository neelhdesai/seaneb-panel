import { useEffect, useState } from "react";

export default function CashfreePayment({ amount = 10, currency = "INR" }) {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const checkSdk = setInterval(() => {
      if (window.Cashfree) {
        setSdkReady(true);
        clearInterval(checkSdk);
        console.log("✅ Cashfree SDK ready (production)");
      } else {
        console.log("⏳ Waiting for Cashfree SDK...");
      }
    }, 300);

    return () => clearInterval(checkSdk);
  }, []);

  const initiatePayment = async () => {
    console.log("➡️ Initiating payment...");

    if (!window.Cashfree) {
      console.error("❌ Cashfree SDK not loaded");
      alert("Cashfree SDK not loaded yet. Please try again.");
      return;
    }

    try {
      console.log("➡️ Creating order on backend...");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/test/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, currency }),
        }
      );

      console.log("➡️ Fetch response received:", response);

      if (!response.ok) {
        const errText = await response.text();
        console.error("❌ Backend responded with error:", errText);
        alert("Backend order creation failed");
        return;
      }

      const data = await response.json();
      console.log("➡️ Backend data:", data);

      if (data?.payment_session_id) {
        console.log("✅ Payment session ID received:", data.payment_session_id);

        // Initialize Hosted Checkout
        console.log("➡️ Initializing Cashfree checkout...");
        window.Cashfree.init({
          token: data.payment_session_id,
          mode: "PROD", // "TEST" for sandbox
        });

        console.log("➡️ Opening Cashfree checkout...");
        window.Cashfree.open();
      } else {
        console.error("❌ No payment_session_id returned from backend");
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
        {sdkReady ? "Pay Now" : "Loading..."}
      </button>
    </div>
  );
}
