import User from "../models/User.js";
import sendEmail from "../utils/email.js"
import { approvalTemplate, denialTemplate, adminNewConsultantTemplate } from "../utils/emailTemplates.js";
import OtpLog from "../models/OtpLog.js";

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id; // assuming you decoded JWT in middleware
    const user = await User.findById(userId).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, mobileNumber, password, role, consultantPan } = req.body;

    const otpRecord = await OtpLog.findOne({ mobile: mobileNumber, verified: true });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Mobile number not verified. Please complete OTP verification."
      });
    }

    const user = new User({
      name,
      email,
      mobileNumber,
      password,
      role: role || "consultant",
      status: "pending",
      consultantPan,
    });

    await user.save();
    await OtpLog.deleteOne({ mobile: mobileNumber });

    if (process.env.ADMIN_NOTIFY_EMAIL) {
      await sendEmail(
        process.env.ADMIN_NOTIFY_EMAIL,
        "New Consultant Registration - Pending Approval",
        adminNewConsultantTemplate(user)
      );
    }

    user.password = undefined;

    res.status(201).json({
      success: true,
      message: "User registered successfully. Awaiting admin approval.",
      data: user
    });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      let fieldName = "";
      switch (duplicateField) {
        case "mobileNumber": fieldName = "Mobile number"; break;
        case "email": fieldName = "Email"; break;
        case "consultantPan": fieldName = "PAN number"; break;
        default: fieldName = duplicateField;
      }
      return res.status(400).json({
        success: false,
        message: `${fieldName} already exists. Please use a different ${fieldName}.`
      });
    }

    res.status(400).json({ success: false, message: "Registration failed" });
  }
};

export const checkMobile = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid mobile number",
      });
    }

    const existingUser = await User.findOne({ mobileNumber });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already registered. Please use a different number.",
      });
    }

    res.status(200).json({ success: true, message: "Mobile number is available" });
  } catch (error) {
    console.error("Error checking mobile number:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Get all users (excluding password) with pending first
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $addFields: {
          sortOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "pending"] }, then: 0 },
                { case: { $eq: ["$status", "approved"] }, then: 1 },
                { case: { $eq: ["$status", "denied"] }, then: 2 },
              ],
              default: 3,
            },
          },
        },
      },
      { $sort: { sortOrder: 1, updatedAt: -1 } }, // pending first, newest first
      {
        $lookup: {
          from: "users",
          localField: "approvedBy",
          foreignField: "_id",
          as: "approvedBy",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "deniedBy",
          foreignField: "_id",
          as: "deniedBy",
        },
      },
      {
        $project: {
          password: 0,
          "approvedBy.password": 0,
          "deniedBy.password": 0,
        },
      },
    ]);

    res.json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPendingConsultantsCount = async (req, res) => {
  try {
    // Count users with role 'consultant' and status 'pending'
    const count = await User.countDocuments({ role: "consultant", status: "pending" });

    res.json({ success: true, count });
  } catch (err) {
    console.error("Error fetching pending consultants count:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin approves a consultant
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.status === "approved") {
      return res.status(400).json({ success: false, message: "User already approved" });
    }

    user.status = "approved";
    user.approvedBy = adminId;
    user.approvedAt = new Date();

    user.deniedBy = undefined;
    user.deniedAt = undefined;

    await user.save();

    // 📧 Send approval email via ZeptoMail
    await sendEmail(
      user.email,
      "Your Account Has Been Approved",
      approvalTemplate(user.name)
    );

    res.json({
      success: true,
      message: "User approved successfully",
      data: user,
    });
  } catch (err) {
    console.error("Error approving user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin denies a consultant
export const denyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.status === "denied") {
      return res.status(400).json({ success: false, message: "User already denied" });
    }

    user.status = "denied";
    user.deniedBy = adminId;
    user.deniedAt = new Date();

    user.approvedBy = undefined;
    user.approvedAt = undefined;

    await user.save();

    // 📧 Send denial email via ZeptoMail
    await sendEmail(
      user.email,
      "Your Account Request Has Been Denied",
      denialTemplate(user.name)
    );

    res.json({
      success: true,
      message: "User denied successfully",
      data: user,
    });
  } catch (err) {
    console.error("Error denying user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, mobileNumber, consultantPan, bankAccount, confirmBankAccount, ifsc } = req.body;

    // 🔎 Check duplicate email
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // 🔎 Check duplicate mobile
    if (mobileNumber && mobileNumber !== user.mobileNumber) {
      const existingMobile = await User.findOne({ mobileNumber });
      if (existingMobile) {
        return res.status(400).json({ message: "Mobile number already exists" });
      }
    }

    // 🔎 PAN duplicate check (only for consultants)
    if (user.role === "consultant" && consultantPan && consultantPan !== user.consultantPan) {
      const existingPan = await User.findOne({ consultantPan });
      if (existingPan) {
        return res.status(400).json({ message: "PAN already exists" });
      }
    }

    // ✅ Bank Account confirmation
    if (bankAccount && confirmBankAccount && bankAccount !== confirmBankAccount) {
      return res.status(400).json({ message: "Bank account numbers do not match" });
    }

    // ✅ Save in pendingUpdate
    user.pendingUpdate = {
      name: name || user.name,
      email: email || user.email,
      mobileNumber: mobileNumber || user.mobileNumber,
      consultantPan: user.role === "consultant" ? (consultantPan || user.consultantPan) : undefined,
      bankAccount: bankAccount || user.bankAccount,
      ifsc: ifsc || user.ifsc,
    };
    user.pendingUpdateAt = new Date();

    await user.save();
    await user.populate("approvedBy", "name email");

    res.json({
      message: "Profile update request submitted. Changes will apply after 24 hours.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        status: user.status,
        consultantPan: user.consultantPan,
        bankAccount: user.bankAccount,
        ifsc: user.ifsc,
        approvedBy: user.approvedBy,
        pendingUpdate: user.pendingUpdate,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to request profile update" });
  }
};



export const getUserProfile = async (req, res) => {
  try {
    // req.user is populated by protect middleware
    const user = await User.findById(req.user._id)
      .select("-password") // hide password
      .populate("approvedBy", "name email role")
      .populate("deniedBy", "name email role");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "approved", "denied"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user, message: "Status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
