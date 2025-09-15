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
    console.log("💡 initiatePayment called");

    if (!window.Cashfree) {
      console.log("❌ Cashfree SDK not loaded");
      alert("Cashfree SDK not loaded yet.");
      return;
    }

    try {
      console.log("🔹 Fetching payment session from backend...");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/test/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, currency }),
        }
      );

      const data = await response.json();
      console.log("🔹 Backend response:", data);

      if (!data?.payment_session_id) {
        console.log("❌ No payment_session_id returned");
        alert("Error creating Cashfree order");
        return;
      }

      console.log("🔹 Payment session ID received:", data.payment_session_id);

      // ✅ Initialize SDK instance
      console.log("🔹 Creating Cashfree instance...");
      const cfInstance = window.Cashfree({ mode: "PROD" });
      console.log("🔹 Cashfree instance created:", cfInstance);

      // ✅ Trigger checkout
      console.log("🔹 Calling checkout...");
      await cfInstance.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self", // or "_blank"
        onSuccess: (res) => console.log("✅ Payment success:", res),
        onFailure: (res) => console.log("❌ Payment failure:", res),
        onClose: () => console.log("⚠️ Checkout closed by user"),
      });

      console.log("🔹 checkout() call completed");
    } catch (error) {
      console.error("❌ Payment initiation failed:", error);
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
