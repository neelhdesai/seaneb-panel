import { useEffect, useState } from "react";

export default function CashfreePayment({ amount = 10, currency = "INR" }) {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // Wait for the Cashfree SDK to load
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
        // Initialize Cashfree Checkout
        const result = await window.Cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          returnUrl: "https://your-frontend.com/payment-success",
          redirectTarget: "_self", // or "_blank"
        });

        if (result.error) {
          alert(result.error.message);
        } else if (result.redirect) {
          console.log("Redirecting to payment page...");
        }
      } else {
        alert("Error creating Cashfree order");
      }
    } catch (error) {
      console.error(error);
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
