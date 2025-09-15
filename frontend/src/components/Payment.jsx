import { useEffect, useState } from "react";

export default function CashfreePayment({ amount = 10, currency = "INR" }) {
  const [sdkReady, setSdkReady] = useState(false);

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
    if (!window.Cashfree) {
      alert("Cashfree SDK not loaded yet.");
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

      if (!data?.payment_session_id) {
        alert("Error creating Cashfree order");
        return;
      }

      // ✅ v3: Initialize SDK instance
      const cfInstance = window.Cashfree({ mode: "PROD" }); // or "TEST" for sandbox

      // ✅ Trigger checkout
      await cfInstance.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self", // or "_blank"
      });
    } catch (error) {
      console.error(error);
      alert("Payment initiation failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-bold mb-4">Amount: ₹{amount}</h2>
      <button
        onClick={initiatePayment}
        disabled={!sdkReady}
        className={`px-6 py-2 rounded-lg text-white ${
          sdkReady ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {sdkReady ? "Pay Now" : "Loading..."}
      </button>
    </div>
  );
}
