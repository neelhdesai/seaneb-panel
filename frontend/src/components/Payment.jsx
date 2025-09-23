import { useEffect, useState } from "react";
import axios from "axios";
import { load } from "@cashfreepayments/cashfree-js";

export default function CashfreePayment({ amount = 100, currency = "INR" }) {
  const [cashfree, setCashfree] = useState(null);
  const [orderId, setOrderId] = useState("");
  const API_BASE_URL = "https://seaneb.onrender.com"; // backend

  // Load SDK
  useEffect(() => {
    const init = async () => {
      try {
        const cf = await load({ mode: "PROD" }); // or "sandbox"
        setCashfree(cf);
      } catch (err) {
        console.error("Error loading Cashfree SDK:", err);
      }
    };
    init();
  }, []);

  // Get payment session
  const getSessionId = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/payment/create-order`, {
        order_amount: amount.toString(),
        order_currency: currency,
        customer_name: "Neel Desai",
        customer_email: "neel@example.com",
        customer_phone: "8160026509",
        order_note: "Test Payment",
      });

      if (res.data?.order_id && res.data?.payment_session_id) {
        setOrderId(res.data.order_id);
        return res.data.payment_session_id;
      } else {
        throw new Error("No session returned from backend");
      }
    } catch (err) {
      console.error("Error fetching session:", err);
      alert("Failed to create payment session");
    }
  };

  // Verify payment
  const verifyPayment = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/payment/verify`, {
        orderId,
      });
      if (res.data.status === "success") {
        alert("✅ Payment verified successfully!");
      } else {
        alert("❌ Payment verification failed.");
      }
    } catch (err) {
      console.error("Error verifying:", err);
      alert("Error verifying payment");
    }
  };

  // Checkout
  const handlePay = async () => {
    if (!cashfree) return alert("SDK not loaded yet!");

    try {
      const sessionId = await getSessionId();
      if (!sessionId) return;

      await cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_modal", // can be "_self", "_blank"
      });

      await verifyPayment();
    } catch (err) {
      console.error("Error in payment:", err);
      alert("Payment failed");
    }
  };

  return (
    <div>
      <h1>Cashfree Payment Gateway</h1>
      <button onClick={handlePay} disabled={!cashfree}>
        Pay Now
      </button>
    </div>
  );
}
