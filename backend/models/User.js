import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Common fields
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },

  // Role field
  role: {
    type: String,
    enum: ['admin', 'consultant'], // roles
    default: 'consultant'
  },

  consultantPan: {
    type: String,
    match: /^[A-Z0-9]{10}$/,
    required: false, // ✅ optional now
  },
 bankAccount: {
    type: String,
    match: [/^\d{9,18}$/, "Please enter a valid bank account number"], // 9–18 digits
    required: false,
  },
  ifsc: {
    type: String,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please enter a valid IFSC code"], // RBI format
    required: false,
  },

  // Account status & workflow
  isActive: {
    type: Boolean,
    default: true
  },
  status: { // replaces isApproved
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },

  // Approval info
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },

  // Denial info
  deniedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deniedAt: {
    type: Date
  },
  deniedReason: {
    type: String,
    trim: true
  },
  pendingUpdate: {
    type: Object,
    default: null
  },
  pendingUpdateAt: Date
}, { timestamps: true });

// Password encryption
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
