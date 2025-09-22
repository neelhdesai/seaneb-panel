import axios from "axios";

// ⚠️ Hardcoding your credentials here (not recommended for production)
// Better only for testing / POC
const CASHFREE_LIVE_CLIENT_ID = "CF1067081D2VC6P67DP3C739B0FB0";
const CASHFREE_LIVE_CLIENT_SECRET = "cfsk_ma_prod_e9009df537fc366be97ed9dad2d52095_c02d5440cashfree.js";

export const verifyPanWithCashfree = async (req, res) => {
  try {
    const { pan } = req.body;

    if (!pan) {
      return res.status(400).json({ success: false, message: "PAN is required" });
    }

    // ✅ Validate PAN format
    const isValidPAN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!isValidPAN.test(pan)) {
      return res.status(400).json({ success: false, message: "Invalid PAN format" });
    }

    // ✅ Call Cashfree PAN 360 API
    const response = await axios.post(
      "https://api.cashfree.com/verification/v2/pan/360",
      {
        pan,
        consent: "Y",
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-client-id": CASHFREE_LIVE_CLIENT_ID,
          "x-client-secret": CASHFREE_LIVE_CLIENT_SECRET,
          "x-api-version": "2022-01-01",
        },
      }
    );

    const apiData = response.data;

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
        fullName: details.full_name,
      },
    });
  } catch (error) {
    console.error("Cashfree PAN error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "PAN verification failed",
      error: error.response?.data || error.message,
    });
  }
};
