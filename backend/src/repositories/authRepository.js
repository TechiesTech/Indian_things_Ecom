// repositories/authRepository.js
const User = require('../models/schemas/userSchema');
const Vendor = require('../models/schemas/vendorSchema');
const Otp = require('../models/schemas/otpSchema');

const userRepository = {
  findByEmail: (email) => User.findOne({ email }).lean(),

  findByEmailWithPassword: (email) =>
    User.findOne({ email }).select('+passwordHash').lean(),

  findByEmailOrPhone: (email, phone) => {
    const conditions = phone ? [{ email }, { phone }] : [{ email }];
    return User.findOne({ $or: conditions }).select('email phone role isActive').lean();
  },

  create: async (data) => (await User.create(data)).toObject(),

  findOrCreateAndMarkLogin: (email, newUserData) =>
    User.findOneAndUpdate(
      { email },
      { $setOnInsert: newUserData, $set: { lastLoginAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    ).lean(),

  updateLastLogin: (id) =>
    User.updateOne({ _id: id }, { $set: { lastLoginAt: new Date() } }),

  updatePassword: (email, passwordHash) =>
    User.updateOne({ email }, { $set: { passwordHash } }),
};

const vendorRepository = {
  findByEmailWithPassword: (email) =>
    Vendor.findOne({ email }).select('+passwordHash').lean(),

  // Another vendor with the same mobile whose email is verified
  findVerifiedByMobile: (mobile, excludeId) =>
    Vendor.findOne({
      mobile,
      isEmailVerified: true,
      ...(excludeId && { _id: { $ne: excludeId } }),
    }).select('_id').lean(),

  findVerifiedByPhone: (phone, excludeId) =>
    Vendor.findOne({
      $or: [{ mobile: phone }, { phoneNumber: phone }],
      isEmailVerified: true,
      ...(excludeId && { _id: { $ne: excludeId } }),
    }).select('_id').lean(),

  create: async (data) => (await Vendor.create(data)).toObject(),

  updateDraftDetails: (id, { name, mobile, phoneNumber }) =>
    Vendor.updateOne({ _id: id }, { $set: { name, mobile: mobile || phoneNumber } }, { runValidators: true }),

  markEmailVerified: (email) =>
    Vendor.updateOne({ email }, { $set: { isEmailVerified: true } }),

  // Works only while no password exists. Check modifiedCount === 1.
  setInitialPassword: (email, passwordHash) =>
    Vendor.updateOne(
      { email, isEmailVerified: true, passwordHash: null }, // null also matches a missing field
      { $set: { passwordHash } }
    ),

  updatePassword: (email, passwordHash) =>
    Vendor.updateOne(
      { email },
      { $set: { passwordHash, failedLoginAttempts: 0 }, $unset: { lockedUntil: 1 }, $inc: { tokenVersion: 1 } }
    ),

  findForLogin: (email) =>
    Vendor.findOne({ email })
      .select('+passwordHash +failedLoginAttempts +lockedUntil +tokenVersion')
      .lean(),

  recordFailedLogin: (id, maxAttempts, lockMs) =>
    Vendor.updateOne({ _id: id }, [
      { $set: { failedLoginAttempts: { $add: [{ $ifNull: ['$failedLoginAttempts', 0] }, 1] } } },
      {
        $set: {
          lockedUntil: {
            $cond: [
              { $gte: ['$failedLoginAttempts', maxAttempts] },
              new Date(Date.now() + lockMs),
              '$lockedUntil',
            ],
          },
        },
      },
    ]),

  recordSuccessfulLogin: (id) =>
    Vendor.updateOne(
      { _id: id },
      { $set: { failedLoginAttempts: 0, lastLoginAt: new Date() }, $unset: { lockedUntil: 1 } }
    ),
};

const otpRepository = {
  save: (email, purpose, otpHash, payload, expiresAt) =>
    Otp.updateOne(
      { email },
      { $set: { purpose, otpHash, payload, expiresAt, attempts: 0, verified: false } },
      { upsert: true }
    ),

  // Counts one attempt atomically. Returns null if missing, expired or out of attempts.
  useAttempt: (email, maxAttempts) =>
    Otp.findOneAndUpdate(
      { email, verified: false, expiresAt: { $gt: new Date() }, attempts: { $lt: maxAttempts } },
      { $inc: { attempts: 1 } },
      { returnDocument: 'after' }
    ).select('+otpHash').lean(),

  markVerified: (id, expiresAt) =>
    Otp.updateOne({ _id: id }, { $set: { verified: true, expiresAt } }),

  // Single use: finds the verified record and deletes it in one step
  takeVerified: (email) =>
    Otp.findOneAndDelete({ email, verified: true, expiresAt: { $gt: new Date() } }).lean(),

  deleteById: (id) => Otp.deleteOne({ _id: id }),

  // Backward compatibility aliases
  upsert: (email, purpose, otpHash, payload, expiresAt) =>
    Otp.updateOne(
      { email },
      { $set: { purpose, otpHash, payload, expiresAt, attempts: 0, verified: false } },
      { upsert: true }
    ),
  consumeAttempt: (email, maxAttempts) =>
    Otp.findOneAndUpdate(
      { email, verified: false, expiresAt: { $gt: new Date() }, attempts: { $lt: maxAttempts } },
      { $inc: { attempts: 1 } },
      { returnDocument: 'after' }
    ).select('+otpHash').lean(),
  consumeVerified: (email) =>
    Otp.findOneAndDelete({ email, verified: true, expiresAt: { $gt: new Date() } }).lean(),
  remove: (id) => Otp.deleteOne({ _id: id }),
};

module.exports = { userRepository, vendorRepository, otpRepository };