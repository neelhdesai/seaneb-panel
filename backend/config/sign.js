import crypto from "crypto";
import fs from "fs";
import path from "path";

export const getCashfreeSignature = (clientId) => {
  const timestamp = Math.floor(Date.now() / 1000); // current UNIX timestamp
  const message = `${clientId}.${timestamp}`;

  const publicKeyPath = path.join(process.cwd(), "config", "public_key.pem"); // your Cashfree public key
  const publicKey = fs.readFileSync(publicKeyPath, "utf8");

  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(message, "utf8")
  );

  return { signature: encrypted.toString("base64"), timestamp };
};
