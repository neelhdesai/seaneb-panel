import axios from "axios";

// ⚠️ Hardcoded credentials for testing (replace in production)
const CASHFREE_CLIENT_ID = "CF1067081D2VC6P67DP3C739B0FB0";
const CASHFREE_CLIENT_SECRET = "cfsk_ma_prod_e9009df537fc366be97ed9dad2d52095_c02d5440cashfree.js";

// Toggle between SANDBOX and PROD
const ENVIRONMENT = "PROD"; // or "SANDBOX"

export const verifyPanWithCashfree = async (req, res) => {
  console.log("💡 verifyPanWithCashfree controller hit", req.body);

  try {
    const { pan } = req.body;

    if (!pan) {
      console.log("❌ PAN not provided");
      return res.status(400).json({ success: false, message: "PAN is required" });
    }

    const isValidPAN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!isValidPAN.test(pan)) {
      console.log("❌ Invalid PAN format");
      return res.status(400).json({ success: false, message: "Invalid PAN format" });
    }

    const apiUrl =
      ENVIRONMENT === "PROD"
        ? "https://api.cashfree.com/verification/v2/pan/360"
        : "https://sandbox.cashfree.com/verification/v2/pan/360";

    console.log(`🔗 Calling Cashfree API (${ENVIRONMENT}) with PAN:`, pan);

    const response = await axios.post(
      apiUrl,
      { pan, consent: "Y" },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-client-id": CASHFREE_CLIENT_ID,
          "x-client-secret": CASHFREE_CLIENT_SECRET,
          "x-api-version": "2023-01-01",
          "x-environment": ENVIRONMENT,
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
      data: { panNumber: details.pan, fullName: details.full_name },
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
