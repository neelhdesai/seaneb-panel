import crypto from "crypto";
import { Cashfree } from "cashfree-pg";

// Generate unique order ID
function generateOrderId() {
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHash("sha256");
  hash.update(uniqueId);
  const orderId = hash.digest("hex");
  return orderId.substr(0, 12);
}

// Create payment session
export const createPayment = async (req, res) => {
  try {
    const { amount = 1.0, currency = "INR" } = req.query;

    const request = {
      order_amount: Number(amount),
      order_currency: currency,
      order_id: generateOrderId(),
      customer_details: {
        customer_id: "webcodder01",
        customer_phone: "9999999999",
        customer_name: "Web Codder",
        customer_email: "webcodder@example.com",
      },
    };

    const today = new Date().toISOString().split("T")[0]; // dynamic date
    const response = await Cashfree.PGCreateOrder(today, request);
    res.json(response.data);
  } catch (error) {
    console.error("Cashfree createPayment error:", error?.response?.data || error);
    res.status(500).json({ error: "Failed to create payment session" });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: "Order ID is required" });

    const today = new Date().toISOString().split("T")[0]; // dynamic date
    const response = await Cashfree.PGOrderFetchPayments(today, orderId);
    res.json(response.data);
  } catch (error) {
    console.error("Cashfree verifyPayment error:", error?.response?.data || error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
};
