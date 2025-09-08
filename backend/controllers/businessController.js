import Business from "../models/Business.js";

import { businessSubmissionTemplate } from "../utils/emailTemplates.js";
import sendEmail from "../utils/email.js";

export const submitBusiness = async (req, res) => {
  const {
    businessName,
    businessPhone,
    businessEmail,
    transactionDate,
    seanebid,
    registrationPhone,
    pangst,
  } = req.body;

  if (
    !businessName ||
    !businessPhone ||
    !businessEmail ||
    !transactionDate ||
    !seanebid ||
    !registrationPhone
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled" });
  }

  try {
    const business = new Business({
      businessName,
      businessPhone,
      businessEmail,
      transactionDate,
      seanebid,
      registrationPhone,
      pangst,
      consultant: req.user._id, // save only consultant ID
    });

    await business.save();

    // Populate consultant for email
    await business.populate("consultant");

    // 📧 Send email via ZeptoMail
    await sendEmail(
      business.consultant.email,
      "New Business Submission",
      businessSubmissionTemplate({
        consultantName: business.consultant.name,
        businessName,
        businessPhone,
        businessEmail,
        transactionDate,
        seanebid,
      })
    );

    res.status(201).json({
      message: "Business submitted successfully & email sent",
      business,
    });
  } catch (err) {
    console.error("Error submitting business:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateBusiness = async (req, res) => {
  const { id } = req.params;
  const {
    businessName,
    businessEmail,
    businessPhone,
    registrationPhone,
    pangst,
    seanebid
  } = req.body;

  try {
    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Only allow consultant who submitted or admin to update
    if (req.user.role === "consultant" && !business.consultant.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    business.businessName = businessName ?? business.businessName;
    business.businessEmail = businessEmail ?? business.businessEmail;
    business.businessPhone = businessPhone ?? business.businessPhone;
    business.registrationPhone = registrationPhone ?? business.registrationPhone;
    business.pangst = pangst ?? business.pangst;
    business.seanebid = seanebid ?? business.seanebid;

    await business.save();

    res.status(200).json({ message: "Business updated successfully", business });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find()
      .sort({ createdAt: -1 })
      .populate("consultant", "name email mobileNumber"); // populate consultant details

    res.json({ businesses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ consultant: req.user._id })
      .sort({ createdAt: -1 })
      .populate("consultant", "name email mobileNumber"); // optional

    res.json({ businesses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};