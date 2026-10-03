const mongoose = require('mongoose');
const { OTP_PURPOSE } = require('../../utils/constants');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },

  purpose: {
    type: String,
    enum: Object.values(OTP_PURPOSE),
    required: true,
  },

  // HMAC-SHA256 hash of the OTP — never store plain OTPs
  otpHash: { type: String, required: true, select: false },

  // Optional payload (e.g. name + phone for registration flows)
  payload: { type: mongoose.Schema.Types.Mixed, default: null },

  attempts: { type: Number, default: 0 },

  // When true the OTP has been verified; awaiting the next step (e.g. set password)
  verified: { type: Boolean, default: false },

  expiresAt: { type: Date, required: true },
});

// One active OTP record per email at a time
otpSchema.index({ email: 1 }, { unique: true });

// MongoDB TTL index — auto-deletes expired documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = otpSchema;
