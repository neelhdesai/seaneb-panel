import { useEffect, useState } from "react";
import axios from "axios";
import { load } from "@cashfreepayments/cashfree-js";

export default function CashfreePayment({
  amount = 100,
  currency = "INR",
  customer = {
    name: "Neel Desai",
    email: "neel@example.com",
    phone: "8160026509",
  },
}) {
  const [cashfree, setCashfree] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = "https://seaneb.onrender.com"; // backend

  // Load Cashfree SDK
  useEffect(() => {
    const initSDK = async () => {
      try {
        const cf = await load({ mode: "PROD" }); // or "sandbox"
        setCashfree(cf);
      } catch (err) {
        console.error("Error loading Cashfree SDK:", err);
        alert("Failed to load payment SDK");
      }
    };
    initSDK();
  }, []);

  // Create payment session
  const getSessionId = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/payment/create-order`, {
        order_amount: amount.toString(),
        order_currency: currency,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        order_note: "Payment for product/service",
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
    } finally {
      setLoading(false);
    }
  };

  // Verify payment status
  const verifyPayment = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/payment/verify`, { orderId });
      if (res.data?.status === "success") {
        alert("✅ Payment verified successfully!");
      } else {
        alert("❌ Payment verification failed.");
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      alert("Error verifying payment");
    }
  };

  // Trigger checkout
  const handlePay = async () => {
    if (!cashfree) return alert("Payment SDK not loaded yet!");

    const sessionId = await getSessionId();
    if (!sessionId) return;

    try {
      await cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_modal", // "_self" or "_blank" are options
      });

      await verifyPayment();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed");
    }
  };

  return (
    <div>
      <h1>Cashfree Payment Gateway</h1>
      <button onClick={handlePay} disabled={!cashfree || loading}>
        {loading ? "Initializing..." : "Pay Now"}
      </button>
    </div>
  );
}
