const Admin = require('../models/Admin');

/**
 * Admin Repository
 * Only DB queries live here. No validation, no business rules —
 * that stays in the service layer.
 */

const findByEmailOrMobile = ({ email, mobile }) => {
  return Admin.findOne({ $or: [{ email }, { mobile }] });
};

const findByEmail = (email) => {
  return Admin.findOne({ email });
};

const findByEmailWithPassword = (email) => {
  return Admin.findOne({ email }).select('+password');
};

/**
 * Atomically create-or-update the pending registration record.
 * Replaces the old "find, then save-or-create" pattern with a single
 * atomic query, so two simultaneous requests for the same email/mobile
 * can't race each other.
 */
const upsertByEmailOrMobile = ({ email, mobile }, data) => {
  return Admin.findOneAndUpdate(
    { $or: [{ email }, { mobile }] },
    { $set: data },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const updateByEmail = (email, data) => {
  return Admin.findOneAndUpdate({ email }, { $set: data }, { new: true });
};

module.exports = {
  findByEmailOrMobile,
  findByEmail,
  findByEmailWithPassword,
  upsertByEmailOrMobile,
  updateByEmail,
};