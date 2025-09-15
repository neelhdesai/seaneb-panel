import axios from "axios";

export const createOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const env =
      process.env.CASHFREE_ENV.toLowerCase() === "production"
        ? "api.cashfree.com"
        : "sandbox.cashfree.com";

    console.log("📦 Creating Cashfree order...");

    const response = await axios.post(
      `https://${env}/pg/orders`,
      {
        order_amount: amount,
        order_currency: currency,
        customer_details: {
          customer_id: "cust_001",
          customer_email: "customer@example.com",
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: "https://your-frontend.com/payment-success",
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

    console.log("✅ Order created:", response.data);
    console.log("➡️ Sending payment_session_id to frontend:", response.data.payment_session_id);

    return res.json({
      payment_session_id: response.data.payment_session_id,
    });
  } catch (error) {
    console.error("❌ Cashfree Order Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Payment order creation failed" });
  }
};
