import { useEffect, useState } from "react";
import axios from "axios";
import { load } from "@cashfreepayments/cashfree-js";

export default function CashfreePayment({ amount = 100, currency = "INR" }) {
  const [cashfree, setCashfree] = useState(null);
  const [orderId, setOrderId] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Load Cashfree SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const cf = await load({ mode: "PROD" }); // Use "sandbox" for testing
        setCashfree(cf);
      } catch (error) {
        console.error("Error loading Cashfree SDK:", error);
      }
    };
    initializeSDK();
  }, []);

 const getSessionId = async () => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/payment`, {
      amount,
      currency,
      customer_name: "Neel Desai",
      customer_phone: "8160026509",
    });

    if (res.data?.order_id && res.data?.payment_session_id) {
      setOrderId(res.data.order_id);
      return res.data.payment_session_id;
    } else {
      throw new Error("No payment session returned from backend");
    }
  } catch (error) {
    console.error("Error fetching payment session:", error);
    alert("Failed to create payment session");
  }
};

  // Verify payment after checkout
  const verifyPayment = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/payment/verify`, { orderId });

      if (res.data?.status === "success") {
        alert("Payment verified successfully!");
      } else {
        alert("Payment verification failed.");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert("Error verifying payment");
    }
  };

  // Handle "Pay Now" button click
  const handleClick = async (e) => {
    e.preventDefault();
    if (!cashfree) return alert("Payment SDK is not loaded yet!");

    try {
      const sessionId = await getSessionId();
      if (!sessionId) return;

      await cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_modal", // "_self" or "_blank" also possible
      });

      await verifyPayment();
    } catch (error) {
      console.error("Error during payment:", error);
      alert("Payment failed");
    }
  };

  return (
    <div>
      <h1>Cashfree Payment Gateway</h1>
      <button onClick={handleClick} disabled={!cashfree}>
        Pay Now
      </button>
    </div>
  );
}
