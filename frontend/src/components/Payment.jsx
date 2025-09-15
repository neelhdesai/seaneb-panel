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
    console.log("💡 initiatePayment called");

    if (!window.Cashfree) {
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
        alert("Error creating Cashfree order");
        setLoading(false);
        return;
      }

      console.log("🔹 Payment session ID received:", data.payment_session_id);

      const cfInstance = window.Cashfree({ mode: "PROD" }); // or "TEST" if sandbox
      console.log("🔹 Cashfree instance created:", cfInstance);

      cfInstance.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "self", // ensures redirect back to your site
        onSuccess: (res) => {
          console.log("✅ Payment success:", res);
          window.location.href = `/payment-success?orderId=${res.order.order_id}&orderStatus=${res.order.order_status}&referenceId=${res.transaction.transaction_id}&txMsg=${encodeURIComponent(res.transaction.tx_msg)}`;
        },
        onFailure: (res) => {
          console.log("❌ Payment failure:", res);
          window.location.href = `/payment-success?orderId=${res.order.order_id}&orderStatus=${res.order.order_status}&txMsg=${encodeURIComponent(res.transaction.tx_msg)}`;
        },
        onClose: () => {
          console.log("⚠️ Checkout closed by user");
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
