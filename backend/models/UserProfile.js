import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  panNumber: {
    type: String,
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
  },
  upiId: {
    type: String,
    unique: true,
    sparse: true, // allows multiple nulls but enforces uniqueness when set
    match: [/^[\w.-]+@[\w.-]+$/, 'Please enter a valid UPI ID']
  },
  bankDetails: {
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { 
      type: String, 
      required: true, 
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'] 
    },
    bankName: { type: String, required: true },
    branchName: { type: String }
  }
}, { timestamps: true });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
export default UserProfile;