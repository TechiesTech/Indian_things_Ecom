const Vendor = require('../models/Vendor');
const bcrypt = require('bcryptjs');

/**
 * Vendor Repository
 * Only DB queries live here. No validation, no business rules —
 * that stays in the service layer.
 */

/**
 * Atomically insert a vendor only if no record with this email/phone
 * exists yet. Using findOneAndUpdate + upsert (instead of a separate
 * find-then-create) closes the race where two requests for the same
 * email could both pass the "not found" check and both insert.
 *
 * findOneAndUpdate skips document middleware, so the model's
 * pre('save') password-hashing hook never runs here — the password
 * is hashed explicitly before the write instead.
 *
 * rawResult exposes lastErrorObject.upserted, which is only set when
 * a NEW document was inserted — that's how the service tells "created"
 * apart from "already existed".
 */
const registerIfNotExists = async ({ email, phoneNumber }, data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return Vendor.findOneAndUpdate(
    { $or: [{ email }, { phoneNumber }] },
    { $setOnInsert: { ...data, password: hashedPassword } },
    { upsert: true, new: true, setDefaultsOnInsert: true, rawResult: true }
  );
};

const findById = (id) => {
  return Vendor.findById(id);
};

const findAll = () => {
  return Vendor.find().sort({ createdAt: -1 });
};

const updateStatusById = (id, status) => {
  return Vendor.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
};

const findByEmailWithPassword = (email) => {
  return Vendor.findOne({ email }).select('+password');
};

module.exports = {
  registerIfNotExists,
  findById,
  findAll,
  updateStatusById,
  findByEmailWithPassword,
};