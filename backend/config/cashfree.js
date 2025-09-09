import crypto from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Load Cashfree public key
const PUBLIC_KEY_PATH = path.join(process.cwd(), "config", "public_key.pem");
const publicKey = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");

/**
 * Generate signature for Cashfree API
 */
export const generateSignature = () => {
  const timestamp = Math.floor(Date.now() / 1000);
  const data = `${process.env.CASHFREE_LIVE_CLIENT_ID}.${timestamp}`;

  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(data, "utf8")
  );

  return {
    signature: encrypted.toString("base64"),
    timestamp,
  };
};
