import { Cashfree, CFEnvironment } from "cashfree-pg";

const CASHFREE_CLIENT_ID = "1067081dcdffab8f71f600b71991807601";
const CASHFREE_CLIENT_SECRET = "cfsk_ma_prod_b233324dab834753a8d0a622603c5d7a_63936c47";
const CASHFREE_RETURN_URL = "https://admin.seaneb.com/payment-success";

const cashfree = new Cashfree(
  CFEnvironment.PRODUCTION,  // or CFEnvironment.SANDBOX for testing
  CASHFREE_CLIENT_ID,
  CASHFREE_CLIENT_SECRET
);

export const createCashfreeOrder = async (req, res) => {
  try {
    const { order_amount, customer_name, customer_email, customer_phone, order_note } = req.body;

    const request = {
      order_amount: order_amount || "1",
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

    const response = await cashfree.PGCreateOrder(request);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("💥 Cashfree Order Error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: error.response?.data || error.message,
    });
  }
};
