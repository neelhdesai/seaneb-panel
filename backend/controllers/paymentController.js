import crypto from "crypto";
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Hardcoded Cashfree credentials
const CASHFREE_CLIENT_ID = "1067081dcdffab8f71f600b71991807601";
const CASHFREE_CLIENT_SECRET = "cfsk_ma_prod_b233324dab834753a8d0a622603c5d7a_63936c47";

// Initialize Cashfree SDK for production
const cashfree = new Cashfree(
  CFEnvironment.PRODUCTION, // or CFEnvironment.SANDBOX
  CASHFREE_CLIENT_ID,
  CASHFREE_CLIENT_SECRET
);

// Generate unique order ID
function generateOrderId() {
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHash("sha256");
  hash.update(uniqueId);
  return hash.digest("hex").substr(0, 12); // 12-character order ID
}

// Create payment session
export const createPayment = async (req, res) => {
  try {
    const { amount = 1.0, currency = "INR", customer_name, customer_phone } = req.body;

    if (!customer_name || !customer_phone) {
      return res.status(400).json({ error: "Customer name and phone are required" });
    }

    const orderId = generateOrderId();

    const request = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: currency,
      customer_details: {
        customer_id: orderId,
        customer_name,
        customer_email: "example@email.com",
        customer_phone,
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL}/payment/return?orderId=${orderId}`,
      },
    };

    const response = await cashfree.pg.orders.create(request);

    res.json({
      order_id: orderId,
      payment_session_id: response.payment_session_id,
    });
  } catch (error) {
    console.error("Cashfree createPayment error:", error);
    res.status(500).json({ error: "Failed to create payment session" });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: "Order ID is required" });

    const response = await cashfree.pg.orders.fetch(orderId);

    const status = response.order_status === "PAID" ? "success" : "failed";

    res.json({ status, data: response });
  } catch (error) {
    console.error("Cashfree verifyPayment error:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};
