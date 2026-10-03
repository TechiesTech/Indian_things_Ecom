const ROLES = Object.freeze({
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
});

const AUTH_PROVIDER = Object.freeze({
  LOCAL: 'local',
  OTP: 'otp',
  GOOGLE: 'google',
});

const VENDOR_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

const OTP_PURPOSE = Object.freeze({
  ADMIN_REGISTER: 'admin_register',
  RESET_PASSWORD: 'reset_password',
  CUSTOMER_LOGIN: 'customer_login',
});

// OTP expires after 10 minutes
const OTP_TTL_MS = 10 * 60 * 1000;

// Verified token stays valid for 15 minutes (time to complete password reset)
const VERIFIED_TTL_MS = 15 * 60 * 1000;

// Max OTP attempts before it is invalidated
const OTP_MAX_ATTEMPTS = 5;

module.exports = { ROLES, AUTH_PROVIDER, VENDOR_STATUS, OTP_PURPOSE, OTP_TTL_MS, VERIFIED_TTL_MS, OTP_MAX_ATTEMPTS };