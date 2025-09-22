import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// Cashfree credentials
const CASHFREE_CLIENT_ID = process.env.CF_CLIENT_ID || "YOUR_CLIENT_ID";
const CASHFREE_CLIENT_SECRET = process.env.CF_CLIENT_SECRET || "YOUR_CLIENT_SECRET";

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvTYkMAtDqU2l3DbPf57u
rWUsUY7wKTyGtmuzhdbkyjzxzMowOwBRk4DdP0PqVFLdSIqJW4vKWLZXWhEjOM0A
7ct5yYCvQnw3eYIYXqCN9k0tlphabrnpd8F0lfsbg2eaONqSbgNd/LJm8+LnIxli
9O2k9xf4FCBhdZWxdrJQSKZWxv9K6j5zOBaEsZ2gcUohcwy2Pk7NjkAW4desoRwI
6/yCLz2FgOliL/OMVGLexDaheZcXHzKQDr72KiNjTQx1Sy0ZZGa2t1YwQOB1IQtu
b5rKsE/gPr+iQaUcjQ+UKfL5naY3QkQFSgtN3QRo4/tvRcw86yoBm6kW22p9BgSB
BQIDAQAB
-----END PUBLIC KEY-----`;

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
    if (!gstin) return res.status(400).json({ success: false, message: "GSTIN is required" });

    const isValidGSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!isValidGSTIN.test(gstin)) return res.status(400).json({ success: false, message: "Invalid GSTIN format" });

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

    // Build final response
    const result = {
      reference_id: verification_id, // you can replace with apiData.reference_id if returned
      GSTIN: gstin,
      legal_name_of_business: apiData.legal_name || "",
      trade_name_of_business: apiData.trade_name || "",
      center_jurisdiction: apiData.center_jurisdiction || "",
      state_jurisdiction: apiData.state_jurisdiction || "",
      date_of_registration: apiData.date_of_registration || "",
      constitution_of_business: apiData.constitution_of_business || "",
      taxpayer_type: apiData.taxpayer_type || "",
      gst_in_status: apiData.gst_in_status || "",
      last_update_date: apiData.last_update_date || "",
      nature_of_business_activities: apiData.nature_of_business || [],
      principal_place_address: apiData.principal_place_address || "",
      principal_place_split_address: apiData.principal_place_split_address || {},
      additional_address_array: apiData.additional_address_array || [],
      valid: true,
      message: apiData.message || "GSTIN Exists"
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error("💥 Cashfree GST error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "GST verification failed",
      error: error.response?.data || error.message,
    });
  }
};
