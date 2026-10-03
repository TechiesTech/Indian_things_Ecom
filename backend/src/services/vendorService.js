const jwt = require('jsonwebtoken');
require('dotenv').config();

const vendorRepository = require('../repositories/vendorRepository');

/**
 * Service to register a new vendor
 */
const registerVendorService = async (vendorData) => {
  const result = await vendorRepository.registerIfNotExists(
    { email: vendorData.email, phoneNumber: vendorData.phoneNumber },
    vendorData
  );

  const wasInserted = Boolean(result.lastErrorObject && result.lastErrorObject.upserted);

  if (!wasInserted) {
    throw {
      status: 409,
      message: 'A vendor with this email or phone number is already registered.',
    };
  }

  const newVendor = result.value;

  return {
    message: 'Registration successful! Your account is pending admin approval. You will be able to access your account once approved, typically within 24 hours.',
    vendorId: newVendor._id,
  };
};

/**
 * Service to get vendor profile
 */
const getVendorProfileService = async (id) => {
  const vendor = await vendorRepository.findById(id);
  if (!vendor) {
    throw { status: 404, message: 'Vendor not found' };
  }

  if (vendor.status !== 'approved') {
    throw {
      status: 403,
      message: 'Your account is pending approval. Please wait for admin confirmation.',
    };
  }

  return vendor;
};

/**
 * Service to get all vendors (Admin)
 */
const getAllVendorsService = async () => {
  return await vendorRepository.findAll();
};

/**
 * Service to update vendor status (Admin)
 */
const updateVendorStatusService = async (id, status) => {
  if (!['approved', 'rejected'].includes(status)) {
    throw { status: 400, message: 'Invalid status. Use "approved" or "rejected".' };
  }

  const vendor = await vendorRepository.updateStatusById(id, status);

  if (!vendor) {
    throw { status: 404, message: 'Vendor not found' };
  }

  return vendor;
};

/**
 * Service for vendor login
 */
const loginVendorService = async (email, password) => {
  const vendor = await vendorRepository.findByEmailWithPassword(email);

  if (!vendor) {
    throw { status: 401, message: 'Invalid credentials or unapproved account.' };
  }

  if (vendor.status !== 'approved') {
    throw { status: 403, message: 'Your account is pending approval. Please wait for admin confirmation.' };
  }

  const isMatch = await vendor.comparePassword(password);
  if (!isMatch) throw { status: 401, message: 'Invalid credentials.' };

  const token = jwt.sign(
    { id: vendor._id, role: vendor.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    success: true,
    token: `Bearer ${token}`,
    vendor: {
      id: vendor._id,
      personName: vendor.personName,
      email: vendor.email,
      role: vendor.role,
      companyName: vendor.companyName,
    },
  };
};

module.exports = {
  register:     registerVendorService,
  getProfile:   getVendorProfileService,
  getAll:       getAllVendorsService,
  updateStatus: updateVendorStatusService,
  login:        loginVendorService,
};