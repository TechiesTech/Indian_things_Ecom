const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const { AUTH_PROVIDER, ROLES } = require('../../utils/constants');

/**
 * loginlogs collection
 * One document per login attempt (success or failure).
 * Users data → users collection (userSchema)
 * Login history → loginlogs collection (this schema)
 */
const loginLogSchema = new mongoose.Schema(
  {
    // Reference to the user who attempted login (null if email not found)
    userId: { type: ObjectId, ref: 'User', default: null },

    // Email used in the attempt (stored even if user not found)
    email: { type: String, lowercase: true, trim: true, required: true },

    // Role at time of login (Customer / Vendor / Admin)
    role: { type: String, enum: Object.values(ROLES), default: null },

    // How they logged in
    authProvider: {
      type: String,
      enum: [...Object.values(AUTH_PROVIDER), 'google'],
      required: true,
    },

    // Result of the attempt
    success: { type: Boolean, required: true },

    // Reason for failure (null on success)
    failReason: {
      type: String,
      enum: [
        'invalid_credentials',   // wrong password
        'invalid_otp',           // wrong / expired OTP
        'account_deactivated',   // isActive = false
        'vendor_not_approved',   // vendor pending/rejected
        'user_not_found',        // email not in DB
        'too_many_attempts',     // OTP max attempts exceeded
        null,
      ],
      default: null,
    },

    // Client info (populated from request headers / IP)
    ip:        { type: String, trim: true },
    userAgent: { type: String, trim: true },
    device:    { type: String, trim: true },   // e.g. "Mobile", "Desktop"
    browser:   { type: String, trim: true },   // e.g. "Chrome 124"
    os:        { type: String, trim: true },   // e.g. "Windows 11"
  },
  {
    // createdAt = exact timestamp of the login attempt
    // updatedAt not needed for logs, but timestamps adds both with minimal overhead
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'loginlogs',
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// Admin: list all logins for a specific user, newest first
loginLogSchema.index({ userId: 1, createdAt: -1 });

// Admin: filter by success/failure across all users, newest first
loginLogSchema.index({ success: 1, createdAt: -1 });

// Admin: filter by email (brute-force detection on unknown emails)
loginLogSchema.index({ email: 1, createdAt: -1 });

// TTL: auto-delete logs older than 90 days (3 months retention)
loginLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

// ─────────────────────────────────────────────────────────────────────────────

const LoginLog = mongoose.model('LoginLog', loginLogSchema, 'loginlogs');

module.exports = LoginLog;
