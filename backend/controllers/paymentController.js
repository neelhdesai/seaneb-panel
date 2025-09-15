import axios from "axios";

export const createOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      console.warn("⚠️ Missing amount or currency in request body");
      return res.status(400).json({ error: "Amount and currency are required" });
    }

    const isProduction = process.env.CASHFREE_ENV?.toLowerCase() === "production";
    const apiBase = isProduction ? "https://api.cashfree.com" : "https://sandbox.cashfree.com";

    console.log("📦 Creating Cashfree order in", isProduction ? "Production" : "Sandbox");

    const payload = {
      order_amount: amount,
      order_currency: currency,
      customer_details: {
        customer_id: "cust_001",
        customer_email: "customer@example.com",
        customer_phone: "9999999999",
      },
      order_meta: {
        return_url: `https://admin.seaneb.com/payment-success?order_id={order_id}&order_status={order_status}&payment_mode={payment_mode}&reference_id={reference_id}&tx_msg={tx_msg}`,
      },
    };

    const headers = {
      "x-client-id": process.env.CASHFREE_APP_ID,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      "x-api-version": "2022-09-01",
      "Content-Type": "application/json",
    };

    console.log("📤 Request Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(`${apiBase}/pg/orders`, payload, { headers });

    console.log("📥 Raw response from Cashfree:", response.data);

    const { order_id, payment_session_id } = response.data;

    if (!order_id || !payment_session_id) {
      console.error("❌ Missing order_id or payment_session_id in response:", response.data);
      return res.status(500).json({ error: "Invalid response from Cashfree" });
    }

    console.log("✅ Order created successfully");
    return res.json({ order_id, payment_session_id });
  } catch (error) {
    console.error("❌ Cashfree Order Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      return res.status(error.response.status).json({
        error: "Payment order creation failed",
        details: error.response.data,
      });
    } else {
      console.error(error.message);
      return res.status(500).json({ error: "Payment order creation failed" });
    }
  }
};
