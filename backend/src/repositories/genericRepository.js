/**
 * Generic Repository Factory
 *
 * commonAuthService.js works across multiple models (Admin, Vendor, etc.),
 * so it can't import one fixed model. This factory wraps whichever Model
 * is passed in, so commonAuthService still never touches Mongoose directly.
 */
const createRepository = (Model) => ({
  findByEmail: (email) => Model.findOne({ email }),

  updateByEmail: (email, data) =>
    Model.findOneAndUpdate({ email }, { $set: data }, { new: true }),

  clearOtpByEmail: (email) =>
    Model.findOneAndUpdate({ email }, { $unset: { otp: '', otpExpires: '' } }, { new: true }),

  // Kept for password writes: findOneAndUpdate skips document middleware,
  // and password hashing lives in a pre('save') hook on the model.
  save: (doc) => doc.save(),
});

module.exports = createRepository;