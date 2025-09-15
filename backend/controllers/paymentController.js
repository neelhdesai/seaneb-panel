import axios from "axios";

export const createOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: "Amount and currency are required" });
    }

    // Determine Cashfree environment
    const isProduction = process.env.CASHFREE_ENV?.toLowerCase() === "production";
    const apiBase = isProduction ? "https://api.cashfree.com" : "https://sandbox.cashfree.com";

    console.log("📦 Creating Cashfree order in", isProduction ? "Production" : "Sandbox");

    // Create order via Cashfree Orders API
    const response = await axios.post(
      `${apiBase}/pg/orders`,
      {
        order_amount: amount,
        order_currency: currency,
        customer_details: {
          customer_id: "cust_001",
          customer_email: "customer@example.com",
          customer_phone: "9999999999",
        },
        order_meta: {
          // Use your frontend-accessible success URL
          return_url: `https://admin.seaneb.com/payment-success?order_id={order_id}&order_status={order_status}&payment_mode={payment_mode}&reference_id={reference_id}&tx_msg={tx_msg}`,
        },
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      }
    );

    const { order_id, payment_session_id } = response.data;

    if (!order_id || !payment_session_id) {
      console.error("❌ Missing order_id or payment_session_id in response:", response.data);
      return res.status(500).json({ error: "Invalid response from Cashfree" });
    }

    console.log("✅ Order created:", response.data);
    console.log("➡️ Sending payment_session_id and order_id to frontend");

    return res.json({ order_id, payment_session_id });
  } catch (error) {
    console.error("❌ Cashfree Order Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Payment order creation failed" });
  }
};
