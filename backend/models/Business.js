import mongoose from "mongoose";

const businessSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  businessPhone: {
    type: String,
    required: true,
    match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"]
  },
  businessEmail: {
    type: String,
    required: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please enter a valid email address"]
  },
  transactionDate: { type: Date, required: true },
  seanebid: { type: String, required: true },

  registrationPhone: {
    type: String,
    required: true,
    match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"]
  },
  pangst: {
    type: String,
    required: false,
    uppercase: true,
    trim: true
  },

  consultant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

}, { timestamps: true });

const Business = mongoose.model("Business", businessSchema);
export default Business;
