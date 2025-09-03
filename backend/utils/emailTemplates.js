export const businessSubmissionTemplate = ({
  consultantName,
  businessName,
  businessPhone,
  businessEmail,
  transactionDate,
  seanebid
}) => {
  return `
    <h2>Business Registration Successful</h2>
    <p>Hello <b>${consultantName}</b>,</p>
    <p>Your business submission has been recorded successfully.</p>
    <h3>Business Details:</h3>
    <ul>
      <li><b>Business Name:</b> ${businessName}</li>
      <li><b>Business Phone:</b> ${businessPhone}</li>
      <li><b>Business Email:</b> ${businessEmail}</li>
      <li><b>Transaction Date:</b> ${transactionDate}</li>
      <li><b>Seaneb ID:</b> ${seanebid}</li>
    </ul>
    <p>Thank you,<br/>Seaneb Sales Team</p>
  `;
};

export const approvalTemplate = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2d6a4f;">Account Approved</h2>
      <p>Dear ${name || "User"},</p>
      <p>Congratulations! Your consultant account has been <b style="color: green;">approved</b> by our admin team.</p>
      <p>You can now log in and access your dashboard.</p>
      <br/>
      <p style="font-size: 14px; color: #555;">Best regards,<br/><b>SeaNeB Team</b></p>
    </div>
  `;
};

export const denialTemplate = (name, reason) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #d00000;">Account Denied</h2>
      <p>Dear ${name || "User"},</p>
      <p>We regret to inform you that your consultant account request has been <b style="color: red;">denied</b>.</p>
      <p><b>Reason:</b> ${reason || "Not specified"}</p>
      <p>If you believe this is a mistake, please contact our support team.</p>
      <br/>
      <p style="font-size: 14px; color: #555;">Best regards,<br/><b>SeaNeB Team</b></p>
    </div>
  `;
};