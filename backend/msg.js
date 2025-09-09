import crypto from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const { CASHFREE_CLIENT_ID } = process.env;

// Load Cashfree Public Key (the one you pasted earlier)
const publicKeyPath = path.join(process.cwd(), "config", "public_key.pem");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

function generateSignature() {
  const timestamp = Math.floor(Date.now() / 1000);
  const message = `${CASHFREE_CLIENT_ID}.${timestamp}`;

  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING, // required by Cashfree
    },
    Buffer.from(message, "utf8")
  );

  const signature = encrypted.toString("base64");

  console.log("Message:", message);
  console.log("Timestamp:", timestamp);
  console.log("Signature:", signature);

  return { signature, timestamp };
}

generateSignature();