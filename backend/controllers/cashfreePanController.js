import axios from "axios";
import { v4 as uuidv4 } from "uuid"; // to generate unique verification_id

const CASHFREE_CLIENT_ID = "CF1067081D38D78RGTCCS739KF4S0";
const CASHFREE_CLIENT_SECRET = "cfsk_ma_prod_208306d235e211f8e730d2ba7921263d_408b70b9";

export const verifyPanWithCashfree = async (req, res) => {
  console.log("🚀 /verify-pan route hit!", req.body);
  try {
    const { pan } = req.body;
    if (!pan) return res.status(400).json({ success: false, message: "PAN is required" });

    const isValidPAN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!isValidPAN.test(pan)) {
      console.log("❌ Invalid PAN format");
      return res.status(400).json({ success: false, message: "Invalid PAN format" });
    }

    const verification_id = `verify_${uuidv4().replace(/-/g, "")}`.slice(0, 50); // max 50 chars

    console.log("🔗 Calling Cashfree PAN 360 API with PAN:", pan);

    const response = await axios.post(
      "https://api.cashfree.com/verification/pan/360",
      { pan, verification_id },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-client-id": CASHFREE_CLIENT_ID,
          "x-client-secret": CASHFREE_CLIENT_SECRET,
        },
      }
    );

    const apiData = response.data;
    console.log("✅ Cashfree API response:", apiData);

    if (apiData.status !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: apiData.message || "PAN verification failed",
      });
    }

    const details = apiData.result;
    return res.status(200).json({
      success: true,
      message: "PAN verification successful",
      data: {
        panNumber: details.pan,
        fullName: `${details.first_name} ${details.last_name}`,
        email: details.email,          // masked
        mobile: details.mobile,        // masked
        address: details.address,      // if available
      },
    });

  } catch (error) {
    console.error("💥 Cashfree PAN error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "PAN verification failed",
      error: error.response?.data || error.message,
    });
  }
};

