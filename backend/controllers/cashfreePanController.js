import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// Cashfree credentials
const CASHFREE_CLIENT_ID = "CF1067081D38D78RGTCCS739KF4S0";
const CASHFREE_CLIENT_SECRET = "cfsk_ma_prod_208306d235e211f8e730d2ba7921263d_408b70b9";

// 2FA Public Key (you provided)
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvTYkMAtDqU2l3DbPf57u
rWUsUY7wKTyGtmuzhdbkyjzxzMowOwBRk4DdP0PqVFLdSIqJW4vKWLZXWhEjOM0A
7ct5yYCvQnw3eYIYXqCN9k0tlphabrnpd8F0lfsbg2eaONqSbgNd/LJm8+LnIxli
9O2k9xf4FCBhdZWxdrJQSKZWxv9K6j5zOBaEsZ2gcUohcwy2Pk7NjkAW4desoRwI
6/yCLz2FgOliL/OMVGLexDaheZcXHzKQDr72KiNjTQx1Sy0ZZGa2t1YwQOB1IQtu
b5rKsE/gPr+iQaUcjQ+UKfL5naY3QkQFSgtN3QRo4/tvRcw86yoBm6kW22p9BgSB
BQIDAQAB
-----END PUBLIC KEY-----`;

// Function to generate x-cf-signature
const generateSignature = () => {
  const timestamp = Math.floor(Date.now() / 1000); // UNIX timestamp
  const data = `${CASHFREE_CLIENT_ID}.${timestamp}`;

  const bufferData = Buffer.from(data);
  const encrypted = crypto.publicEncrypt(
    {
      key: PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    bufferData
  );

  return encrypted.toString("base64");
};

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

    const verification_id = `verify_${uuidv4().replace(/-/g, "")}`.slice(0, 50);

    console.log("🔗 Calling Cashfree PAN 360 API with PAN:", pan);

    const signature = generateSignature();

    const response = await axios.post(
      "https://api.cashfree.com/verification/pan/360",
      { pan, verification_id },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-client-id": CASHFREE_CLIENT_ID,
          "x-client-secret": CASHFREE_CLIENT_SECRET,
          "x-cf-signature": signature,
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
        email: details.email,
        mobile: details.mobile,
        address: details.address,
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
