import axios from "axios";

const CASHFREE_CLIENT_ID = "CF1067081D2VC6P67DP3C739B0FB0";
const CASHFREE_CLIENT_SECRET = "cfsk_ma_prod_e9009df537fc366be97ed9dad2d52095_c02d5440cashfree.js";

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

    console.log("🔗 Calling Cashfree API with PAN:", pan);

    const response = await axios.post(
      "https://kyc.cashfree.com/api/v2/pan/verify",
      { pan, consent: "Y" },
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

    if (!apiData.status || apiData.status !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: apiData.message || "PAN verification failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "PAN verification successful",
      data: { panNumber: apiData.data.pan, fullName: apiData.data.full_name },
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
