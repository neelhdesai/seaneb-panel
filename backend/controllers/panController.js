import axios from "axios";

const {
  MI_BASE_URL,
  MI_USERNAME,
  MI_PASSWORD,
  MI_CLIENT_ID,
  MI_CLIENT_SECRET,
} = process.env;

export const verifyPan = async (req, res) => {
  try {
    const { pan } = req.body;

    if (!pan) {
      return res.status(400).json({ success: false, message: "PAN is required" });
    }

    // ✅ Validate PAN format first
    const isValidPAN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!isValidPAN.test(pan)) {
      return res.status(400).json({ success: false, message: "Invalid PAN format" });
    }

    // Step 1: Get Access Token
    const tokenResponse = await axios.post(`${MI_BASE_URL}/oauth/access_token`, {
      username: MI_USERNAME,
      password: MI_PASSWORD,
      client_id: MI_CLIENT_ID,
      client_secret: MI_CLIENT_SECRET,
      grant_type: "password",
    });

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(500).json({ success: false, message: "Failed to generate token" });
    }

    // Step 2: Call PAN Verification API
    const panResponse = await axios.get(
      `${MI_BASE_URL}/commonapis/pandetail?pan=${pan}`,
      {
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          client_id: MI_CLIENT_ID,
        },
      }
    );

    const apiData = panResponse.data;
    const response = apiData?.data?.response;

    if (apiData.error || !response) {
      return res.status(400).json({
        success: false,
        message: apiData.message || "Invalid PAN response",
      });
    }

    return res.status(200).json({
      success: true,
      message: "PAN verification successful",
      data: {
        panNumber: response.number,
        fullName: response.name,
        firstName: response.firstName,
        middleName: response.middleName,
        lastName: response.lastName,
        typeOfHolder: response.typeOfHolder,
        isIndividual: response.isIndividual,
        panStatus: response.panStatus,
        aadhaarSeedingStatus: response.aadhaarSeedingStatus,
      },
    });
  } catch (error) {
    console.error("PAN verification error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "PAN verification failed",
      error: error.response?.data || error.message,
    });
  }
};
