import { useState } from "react";

export default function CashfreePayment({ amount = 10, currency = "INR" }) {
  const [loading, setLoading] = useState(false);

  const initiatePayment = async () => {
    setLoading(true);
    try {
      // Call backend to create Cashfree order
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/test/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency }),
      });

      const data = await res.json();

      if (!data?.payment_session_id || !data?.order_id) {
        alert("Error creating Cashfree order");
        setLoading(false);
        return;
      }

      // Create a form to POST to Cashfree Hosted Checkout
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://www.cashfree.com/checkout/post/redirect";

      const orderInput = document.createElement("input");
      orderInput.type = "hidden";
      orderInput.name = "order_id";
      orderInput.value = data.order_id;

      const sessionInput = document.createElement("input");
      sessionInput.type = "hidden";
      sessionInput.name = "payment_session_id";
      sessionInput.value = data.payment_session_id;

      form.appendChild(orderInput);
      form.appendChild(sessionInput);
      document.body.appendChild(form);

      form.submit(); // Redirect to Cashfree
    } catch (err) {
      console.error("Payment initiation failed:", err);
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
        disabled={loading}
        className={`px-6 py-2 rounded-lg text-white ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}
