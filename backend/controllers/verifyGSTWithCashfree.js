import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// Cashfree credentials
const CASHFREE_CLIENT_ID = "CF1067081D38D78RGTCCS739KF4S0";
const CASHFREE_CLIENT_SECRET = "cfsk_ma_prod_208306d235e211f8e730d2ba7921263d_408b70b9";

// 2FA Public Key
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvTYkMAtDqU2l3DbPf57u
rWUsUY7wKTyGtmuzhdbkyjzxzMowOwBRk4DdP0PqVFLdSIqJW4vKWLZXWhEjOM0A
7ct5yYCvQnw3eYIYXqCN9k0tlphabrnpd8F0lfsbg2eaONqSbgNd/LJm8+LnIxli
9O2k9xf4FCBhdZWxdrJQSKZWxv9K6j5zOBaEsZ2gcUohcwy2Pk7NjkAW4desoRwI
6/yCLz2FgOliL/OMVGLexDaheZcXHzKQDr72KiNjTQx1Sy0ZZGa2t1YwQOB1IQtu
b5rKsE/gPr+iQaUcjQ+UKfL5naY3QkQFSgtN3QRo4/tvRcw86yoBm6kW22p9BgSB
BQIDAQAB
-----END PUBLIC KEY-----`;

// Generate x-cf-signature
const generateSignature = () => {
  const timestamp = Math.floor(Date.now() / 1000);
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

export const verifyGSTWithCashfree = async (req, res) => {
  try {
    const { gstin } = req.body;
    if (!gstin) {
      return res.status(400).json({ success: false, message: "GSTIN is required" });
    }

    // GSTIN format validation: 15 characters (2 digits + 10 PAN chars + 1 entity code + 1 default Z + 1 checksum)
    const isValidGSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!isValidGSTIN.test(gstin)) {
      return res.status(400).json({ success: false, message: "Invalid GSTIN format" });
    }

    const verification_id = `verify_${uuidv4().replace(/-/g, "")}`.slice(0, 50);
    const signature = generateSignature();

    const response = await axios.post(
      "https://api.cashfree.com/verification/gstin",
      { gstin, verification_id },
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

    if (!["VALID", "SUCCESS"].includes(apiData.status)) {
      return res.status(400).json({
        success: false,
        message: apiData.message || "GST verification failed",
      });
    }

    return res.status(200).json({
      success: true,
      status: apiData.status || "VALID",
      message: apiData.message || "GST verified successfully",
      gstin: apiData.gstin || gstin,
      trade_name: apiData.trade_name || "",
      legal_name: apiData.legal_name || "",
      address: apiData.address || {},
      nature_of_business: apiData.nature_of_business || "",
      center_jurisdiction: apiData.center_jurisdiction || "",
      state_jurisdiction: apiData.state_jurisdiction || "",
    });
  } catch (error) {
    console.error("💥 Cashfree GST error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "GST verification failed",
      error: error.response?.data || error.message,
    });
  }
};
