import axios from "axios";
import { generateSignature } from "../config/cashfree.js";

const BASE_URL = "https://api.cashfree.com/verification/pan/advance";

export const initiatePanVerification = async (req, res) => {
  try {
    const { pan } = req.body;
    if (!pan) return res.status(400).json({ error: "PAN is required" });

    const { signature } = generateSignature();

    const response = await axios.post(
      `${BASE_URL}/init`,
      { pan },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_LIVE_CLIENT_ID,
          "x-api-signature": signature,
          "x-api-version": process.env.CASHFREE_API_VERSION,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("PAN Verification Error:", error.response?.data || error.message);
    return res.status(500).json({ error: error.response?.data || "Internal Server Error" });
  }
};

export const advancePanVerification = async (req, res) => {
  try {
    const { pan, verification_id, name } = req.body;
    if (!pan || !verification_id || !name) {
      return res.status(400).json({ error: "pan, verification_id, and name are required" });
    }

    const response = await axios.post(
      ADVANCE_URL,
      { pan, verification_id, name },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_LIVE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_LIVE_CLIENT_SECRET,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("Advance PAN Verification Error:", error.response?.data || error.message);
    return res.status(500).json({ error: error.response?.data || "Internal Server Error" });
  }
};