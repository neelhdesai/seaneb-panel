import { Cashfree, CFEnvironment } from "cashfree-pg";

// Initialize Cashfree SDK with your credentials
const cashfree = new Cashfree(
  CFEnvironment.PRODUCTION,
  "1067081dcdffab8f71f600b71991807601",
  "cfsk_ma_prod_b233324dab834753a8d0a622603c5d7a_63936c47"
);

// ---------------- CREATE ORDER ----------------
export const createOrder = async (req, res) => {
  try {
    console.log("📥 Incoming request body:", req.body);

    const {
      order_amount,
      order_currency,
      customer_name,
      customer_email,
      customer_phone,
      order_note,
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

    // ✅ Updated function
    const response = await cashfree.orders.createOrder(request);

    console.log("✅ Cashfree Order Response:", response);

    res.json(response);
  } catch (error) {
    console.error("💥 Cashfree Order Error Details:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ error: error.message });
  }
};

// ---------------- VERIFY ORDER ----------------
export const verifyOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    console.log(`🔍 Verifying order: ${orderId}`);

    const version = "2023-08-01";
    const response = await cashfree.orders.fetchOrder(version, orderId);

    console.log("✅ Order Verification Response:", response);

    if (response.order_status === "PAID") {
      res.json({ status: "success", data: response });
    } else {
      res.json({ status: "failed", data: response });
    }
  } catch (error) {
    console.error("💥 Cashfree Verify Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
