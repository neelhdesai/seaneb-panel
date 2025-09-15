import { useEffect, useState } from "react";

export default function CashfreePayment({ amount = 10, currency = "INR" }) {
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check for Cashfree SDK
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

    setLoading(true);

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
        setLoading(false);
        return;
      }

      console.log("🔹 Payment session ID received:", data.payment_session_id);

      // Initialize SDK instance in PROD
      const cfInstance = window.Cashfree({ mode: "PROD" });
      console.log("🔹 Cashfree instance created:", cfInstance);

      // Trigger checkout in a new tab/modal
      cfInstance.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_blank", // Use "_blank" for modal/popup
        onSuccess: (res) => {
          console.log("✅ Payment success callback triggered:", res);
          alert("Payment Successful!");
        },
        onFailure: (res) => {
          console.log("❌ Payment failure callback triggered:", res);
          alert("Payment Failed!");
        },
        onClose: () => {
          console.log("⚠️ Checkout closed by user");
          alert("Payment Closed!");
        },
      });

      console.log("🔹 checkout() call initiated");
    } catch (error) {
      console.error("❌ Payment initiation failed:", error);
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
