const User = require('../models/schemas/userSchema');
const Otp = require('../models/schemas/otpSchema');

const user = {
  findByEmail: (email) => User.findOne({ email }).lean(),

  findByEmailWithPassword: (email) =>
    User.findOne({ email }).select('+passwordHash').lean(),

  findByEmailOrPhone: (email, phone) => {
    const conditions = phone ? [{ email }, { phone }] : [{ email }];
    return User.findOne({ $or: conditions }).select('email phone role isActive').lean();
  },

  create: async (data) => {
    const created = await User.create(data);
    return created.toObject();
  },

  findOrCreateAndMarkLogin: (email, newUserData) =>
    User.findOneAndUpdate(
      { email },
      { $setOnInsert: newUserData, $set: { lastLoginAt: new Date() } },
      { upsert: true, new: true }
    ).lean(),

  updateLastLogin: (id) =>
    User.updateOne({ _id: id }, { $set: { lastLoginAt: new Date() } }),

  updatePassword: (email, passwordHash) =>
    User.updateOne({ email }, { $set: { passwordHash } }),
};

const otp = {
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
      { new: true }
    ).select('+otpHash').lean(),

  markVerified: (id, expiresAt) =>
    Otp.updateOne({ _id: id }, { $set: { verified: true, expiresAt } }),

  consumeVerified: (email) =>
    Otp.findOneAndDelete({ email, verified: true, expiresAt: { $gt: new Date() } }).lean(),

  remove: (id) => Otp.deleteOne({ _id: id }),
};

module.exports = { user, otp };