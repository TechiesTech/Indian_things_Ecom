const mongoose = require('mongoose');
const { ROLES, AUTH_PROVIDER } = require('../../utils/constants');


// Delivery addresses saved by the customer (added at checkout)
const addressSchema = new mongoose.Schema(
  {
    // Contact for this delivery address
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    phone:    { type: String, required: true, match: /^[6-9]\d{9}$/ },

    // Address lines
    houseFlat:  { type: String, required: true, trim: true, maxlength: 200 },
    streetArea: { type: String, required: true, trim: true, maxlength: 200 },
    landmark:   { type: String, trim: true, maxlength: 200 },
    city:       { type: String, required: true, trim: true },
    state:      { type: String, required: true, trim: true },
    pincode:    { type: String, required: true, match: /^[1-9]\d{5}$/ },

    // Label shown in UI — only 'Home' or 'Work' allowed
    label:     { type: String, enum: ['Home', 'Work'], default: 'Home' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, match: /^[6-9]\d{9}$/ },

    // Google-only users have no password
    passwordHash: {
      type: String,
      select: false,
      required() {
        return this.authProvider === AUTH_PROVIDER.LOCAL;
      },
    },
    authProvider: { type: String, enum: Object.values(AUTH_PROVIDER), default: AUTH_PROVIDER.OTP },
    googleId: { type: String },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },

    role: { type: String, enum: Object.values(ROLES), default: ROLES.CUSTOMER },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Extended profile
    dateOfBirth: { type: Date },
    gender:      { type: String, enum: ['male', 'female', 'other'] },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications:   { type: Boolean, default: true },
      promotionalOffers:  { type: Boolean, default: true },
      orderUpdates:       { type: Boolean, default: true },
    },

    avatar: { type: String },
    addresses: {
      type: [addressSchema],
      default: [],
      validate: [(v) => v.length <= 5, 'Maximum 5 addresses allowed'],
    },

    refreshTokenHash: { type: String, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Login lookup, and no duplicate accounts
userSchema.index({ email: 1 }, { unique: true });

// Unique only when the value exists, so users without a phone or Google id don't clash
userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: 'string' } } }
);
userSchema.index(
  { googleId: 1 },
  { unique: true, partialFilterExpression: { googleId: { $type: 'string' } } }
);

// Admin lists: users by role and status, newest first, with cursor pagination on _id
userSchema.index({ role: 1, isActive: 1, createdAt: -1 });

// Admin search by name
userSchema.index({ name: 'text' });

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;