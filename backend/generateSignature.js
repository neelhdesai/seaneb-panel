import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const clientId = process.env.CASHFREE_CLIENT_ID;

// Make sure public key has proper newlines
const publicKey = process.env.CASHFREE_PUBLIC_KEY.replace(/\\n/g, "\n");

// Current timestamp in milliseconds (Cashfree expects this)
const timestamp = Date.now();

// Data to encrypt: clientId.timestamp
const data = `${clientId}.${timestamp}`;
const bufferData = Buffer.from(data, "utf-8");

// Encrypt with RSA public key using PKCS1 padding
const encrypted = crypto.publicEncrypt(
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_PADDING,
  },
  bufferData
);

// Base64 encode for header
const xCfSignature = encrypted.toString("base64");

console.log("x-cf-signature:", xCfSignature);
console.log("x-cf-timestamp:", timestamp);