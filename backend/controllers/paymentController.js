import { Cashfree } from "cashfree-pg";

// ✅ Configure Cashfree globally
Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID || "1067081dcdffab8f71f600b71991807601";
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET || "cfsk_ma_prod_b233324dab834753a8d0a622603c5d7a_63936c47";
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

const CASHFREE_RETURN_URL = "https://admin.seaneb.com/payment-success";

export const createCashfreeOrder = async (req, res) => {
  try {
    console.log("📥 Incoming request body:", req.body);

    const { order_amount, customer_name, customer_email, customer_phone, order_note } = req.body;

    const request = {
      order_amount: Number(order_amount) || 1,
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_name: customer_name || "Test User",
        customer_email: customer_email || "example@gmail.com",
        customer_phone: customer_phone || "9999999999",
      },
      order_meta: {
        return_url: CASHFREE_RETURN_URL,
      },
      order_note: order_note || "",
    };

    console.log("🚀 Sending request to Cashfree:", JSON.stringify(request, null, 2));

    // ✅ Wrap inside { request }
    const response = await Cashfree.PGCreateOrder({ request });

    console.log("✅ Cashfree API Response:", JSON.stringify(response.data, null, 2));
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("💥 Cashfree Order Error Details:");
    console.error("Message:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Stack:", error.stack);
    }

    return res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: error.response?.data || error.message,
    });
  }
};
