// controllers/paymentController.js
import CashfreePG from "cashfree-pg";

// Initialize CashfreePG SDK
const cashfree = new CashfreePG(
  "1067081dcdffab8f71f600b71991807601", // App ID
  "cfsk_ma_prod_b233324dab834753a8d0a622603c5d7a_63936c47", // Secret Key
  "PROD" // Change to "SANDBOX" for testing
);

// ---------------- CREATE ORDER ----------------
export const createOrder = async (req, res) => {
  try {
    console.log("📥 Incoming request body:", req.body);

    const {
      order_amount,
      order_currency = "INR",
      customer_name,
      customer_email,
      customer_phone,
      order_note = "",
    } = req.body;

    const request = {
      order_amount: Number(order_amount),
      order_currency,
      customer_details: {
        customer_id: "cust_" + Date.now(),
        customer_name,
        customer_email,
        customer_phone,
      },
      order_meta: {
        return_url: "https://admin.seaneb.com/payment-success?order_id={order_id}",
      },
      order_note,
    };

    console.log("🚀 Sending request to Cashfree:", JSON.stringify(request, null, 2));

    // Create order using v4 SDK
    const response = await cashfree.createOrder(request);

    console.log("✅ Cashfree Order Response:", response);

    res.json({
      success: true,
      order_id: response.order_id,
      payment_session_id: response.payment_session_id,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("💥 Cashfree Order Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ---------------- VERIFY ORDER ----------------
export const verifyOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log(`🔍 Verifying order: ${orderId}`);

    // Fetch order details
    const response = await cashfree.fetchOrder(orderId);

    console.log("✅ Order Verification Response:", response);

    if (response.order_status === "PAID") {
      res.json({ status: "success", data: response });
    } else {
      res.json({ status: "failed", data: response });
    }
  } catch (error) {
    console.error("💥 Cashfree Verify Error:", error);
    res.status(500).json({ error: error.message });
  }
};
