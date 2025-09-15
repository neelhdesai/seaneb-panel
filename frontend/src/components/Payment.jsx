import { useEffect, useState } from "react";

export default function CashfreePayment({ amount = 10, currency = "INR" }) {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // Dynamically load the Cashfree SDK
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;

    script.onload = () => {
      console.log("✅ Cashfree SDK loaded dynamically");
      setSdkReady(true);
    };

    script.onerror = () => console.error("❌ Failed to load Cashfree SDK");

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initiatePayment = async () => {
    if (!sdkReady) {
      alert("Cashfree SDK not loaded yet. Please try again.");
      return;
    }

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

      if (data?.payment_session_id) {
        console.log("✅ Payment session ID received:", data.payment_session_id);

        const cf = window.Cashfree.payments.init({
          sessionId: data.payment_session_id,
          mode: "PROD", // use "TEST" for sandbox
        });

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
