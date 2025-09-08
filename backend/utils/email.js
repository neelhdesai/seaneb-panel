// utils/email.js
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const sendEmail = async (to, subject, html) => {
  try {
    // ✅ Validate required fields
    if (!to || !subject || !html) {
      console.error("❌ Email not sent: missing required fields", {
        to,
        subject,
        htmlLength: html?.length || 0,
      });
      return null;
    }

    const payload = {
      from: {
        address: process.env.ZEPTO_EMAIL,
        name: "SeaNeB Support",
      },
      to: [
        {
          email_address: { address: to },
        },
      ],
      subject,
      htmlbody: html,
    };

    // 🔎 Debug payload
    console.log("📧 Sending email via Zepto:", JSON.stringify(payload, null, 2));

    const response = await axios.post(process.env.ZEPTO_API_URL, payload, {
      headers: {
        // 👇 Ensure .env has ONLY the token, without "Zoho-enczapikey"
        Authorization: `Zoho-enczapikey ${process.env.ZEPTO_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Email sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ ZeptoMail send error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // 🚨 Fallback: don't crash app during email failure
    console.log("⚠️ Email delivery failed, but app will continue running.");
    return null;
  }
};

export default sendEmail;