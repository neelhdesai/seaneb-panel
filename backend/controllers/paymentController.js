import { Cashfree, CFEnvironment } from "cashfree-pg";

// Initialize SDK
const cashfree = new Cashfree(
  CFEnvironment.PRODUCTION,
  "1067081dcdffab8f71f600b71991807601", // App ID
  "cfsk_ma_prod_b233324dab834753a8d0a622603c5d7a_63936c47" // Secret Key
);

export const createOrder = async (req, res) => {
  try {
    const { order_amount, order_currency, customer_name, customer_email, customer_phone, order_note } = req.body;

    const request = {
      order_amount: Number(order_amount),
      order_currency: order_currency || "INR",
      customer_details: {
        customer_id: "cust_" + Date.now(),
        customer_name,
        customer_email,
        customer_phone,
      },
      order_meta: {
        return_url: "https://admin.seaneb.com/payment-success?order_id={order_id}",
      },
      order_note: order_note || "",
    };

    const response = await cashfree.PGCreateOrder(request);

    res.json({
      success: true,
      order_id: response.order_id,
      payment_session_id: response.payment_session_id,
    });
  } catch (error) {
    console.error("Cashfree Order Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const response = await cashfree.PGFetchOrder("2023-08-01", orderId);

    if (response.order_status === "PAID") {
      res.json({ status: "success", data: response });
    } else {
      res.json({ status: "failed", data: response });
    }
  } catch (error) {
    console.error("Cashfree Verify Error:", error);
    res.status(500).json({ error: error.message });
  }
};
