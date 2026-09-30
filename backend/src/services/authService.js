const jwt = require('jsonwebtoken');
require('dotenv').config();

const Admin = require('../models/Admin');
const adminRepository = require('../repositories/adminRepository');
const { sendOtpEmail } = require('../config/NodeMailer');
const {
  commonForgotPasswordService,
  commonVerifyOtpService,
  commonResetPasswordService,
} = require('./commonAuthService');

/**
 * Service to check if user connects before registration
 */
const checkAdminRegistrationService = async ({ email, mobile }) => {
  const existingAdmin = await adminRepository.findByEmailOrMobile({ email, mobile });

  if (existingAdmin && existingAdmin.isVerified) {
    if (existingAdmin.mobile === mobile) throw { status: 409, message: 'Mobile number already in use' };
    if (existingAdmin.email === email) throw { status: 409, message: 'Email already in use' };
  }
};

/**
 * Service for Step 1: Handle registration core logic
 */
const AdminRegisterService = async (userData) => {
  const { name, mobile, email } = userData;

  // 1. Reject if a verified admin already owns this email/mobile
  await checkAdminRegistrationService({ email, mobile });

  // 2. Atomically create-or-update the pending record in one query
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  await adminRepository.upsertByEmailOrMobile(
    { email, mobile },
    { name, mobile, email, otp, otpExpires, isVerified: false }
  );

  await sendOtpEmail(email, otp);
  return { message: 'OTP sent to your email. Valid for 5 minutes.' };
};

/**
 * Service for OTP verification (Registration and Forgot Password)
 */
const verifyOtpService = async (email, otp) => {
  const admin = await adminRepository.findByEmail(email);
  if (!admin) throw { status: 404, message: 'User not found.' };

  // Track whether this was a brand new registration BEFORE verification
  const isNewRegistration = !admin.isVerified;

  await commonVerifyOtpService(Admin, email, otp);

  if (isNewRegistration) {
    await adminRepository.updateByEmail(email, { isVerified: true });
  }

  const message = isNewRegistration
    ? 'OTP verified. Please proceed to set your password.'
    : 'OTP verified. Please proceed to reset your password.';

  return { message, isNewRegistration };
};

/**
 * Service for password setting/reset
 */
const setPasswordService = async (email, password) => {
  const admin = await adminRepository.findByEmail(email);
  if (!admin || !admin.isVerified) throw { status: 403, message: 'Email verification required.' };

  return await commonResetPasswordService(Admin, email, password);
};

/**
 * Service for Forgot Password: Send OTP to existing verified user
 */
const forgotPasswordService = async (email) => {
  // Only verified admins can reset password
  const canResetCheck = (admin) => admin.isVerified;
  return await commonForgotPasswordService(Admin, email, canResetCheck);
};

/**
 * Service for Login: Authenticate and return JWT token
 */
const loginUser = async (email, password) => {
  const admin = await adminRepository.findByEmailWithPassword(email);

  if (!admin || !admin.isVerified) {
    throw { status: 401, message: 'Invalid credentials or unverified account.' };
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) throw { status: 401, message: 'Invalid credentials.' };

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    success: true,
    token: `Bearer ${token}`,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};

module.exports = {
  checkAdminRegistrationService,
  AdminRegisterService,
  verifyOtpService,
  setPasswordService,
  loginUser,
  forgotPasswordService,
};