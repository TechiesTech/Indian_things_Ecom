const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Vendor Schema
 * Defines the structure for vendor details.
 */
const vendorSchema = new mongoose.Schema({
  personName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    match: /^\d{10}$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    default: 'vendor'
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  companyAddress: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    mandal: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, match: /^\d{6}$/ }
  },
  servicesProvided: {
    type: [{
      type: String,
      enum: [
        'FunctionHall',
        'MakeUpArtist',
        'Decoration tent house',
        'Lightings',
        'Catering',
        'Mehandi',
        'DJ band',
        'PhotoGraphy/video',
        'Cooking master'
      ],
      trim: true
    }],
    required: true,
    validate: [v => Array.isArray(v) && v.length > 0, 'At least one service is required']
  },
  serviceImages: {
    type: [String],
    required: true,
    validate: [v => Array.isArray(v) && v.length > 0, 'At least one service image is required']
  },
  socialLinks: {
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },
    youtube: { type: String, trim: true },
    whatsapp: { type: String, trim: true }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  }
}, {
  timestamps: true,
});

// Automatically hash password before saving
vendorSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper to compare passwords for login
vendorSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = vendorSchema;
