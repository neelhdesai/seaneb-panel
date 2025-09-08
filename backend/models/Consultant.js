import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const consultantSchema = new mongoose.Schema({
    consultantName: {
        type: String,
        required: true,
        trim: true
    },
    consultantPhoneNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
    },
    consultantEmail: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    consultantPan: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10,
        uppercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },

// consultant upi details
    consultantUpiId: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/, 'Please enter a valid UPI ID']
    },

    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Encrypt password before save
consultantSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match entered password with hashed password
consultantSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

const Consultant = mongoose.model('Consultant', consultantSchema);
export default Consultant;
