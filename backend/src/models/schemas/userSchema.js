const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  mobile: { 
    type: String, 
    required: true, 
    unique: true,
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
  },
  address: {
    type: String,
    // Address added later during purchase
  },
  role: { 
    type: String, 
    default: 'user' 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
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

module.exports = userSchema;
