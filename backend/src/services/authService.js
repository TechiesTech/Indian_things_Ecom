const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { userRepository, vendorRepository, otpRepository } = require('../repositories/authRepository');
const LoginLog = require('../models/schemas/loginLogSchema');
const { sendOtpEmail } = require('../config/NodeMailer');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const {
  ROLES,
  AUTH_PROVIDER,
  OTP_PURPOSE,
  OTP_TTL_MS,
  VERIFIED_TTL_MS,
  OTP_MAX_ATTEMPTS,
} = require('../utils/constants');

const PASSWORD_ROUNDS = 12;
const VENDOR_MAX_ATTEMPTS = 5;
const VENDOR_LOCK_MS     = 15 * 60 * 1000; // 15 minutes

const fail = (status, message) => Object.assign(new Error(message), { status });

// Fire-and-forget — a log write failure must never break the login flow
const writeLog = (data) => LoginLog.create(data).catch(() => { });

const hashOtp = (otp) =>
  crypto.createHmac('sha256', process.env.JWT_SECRET).update(otp).digest('hex');

const isSameHash = (a, b) =>
  a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

// Token for users (no tokenVersion)
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Token for vendors — embeds tokenVersion so old tokens can be invalidated
const signVendorToken = (vendor) =>
  jwt.sign(
    { id: vendor._id, role: vendor.role, tv: vendor.tokenVersion ?? 0 },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const withoutPassword = ({ passwordHash, ...user }) => user;

const sendOtp = async (email, purpose, payload) => {
  const otp = String(crypto.randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await otpRepository.upsert(email, purpose, hashOtp(otp), payload, expiresAt);

  const sent = await sendOtpEmail(email, otp);
  if (sent?.success === false) throw fail(502, 'Failed to send OTP email. Please try again.');
};

const assertNotRegistered = async (email, phone) => {
  const existing = await userRepository.findByEmailOrPhone(email, phone);
  if (existing) throw fail(409, 'Email or mobile is already registered.');
};

const checkAdminRegistration = async ({ email, mobile }) => {
  await assertNotRegistered(email, mobile);
};

const adminRegister = async ({ name, email, mobile }) => {
  await assertNotRegistered(email, mobile);
  await sendOtp(email, OTP_PURPOSE.ADMIN_REGISTER, { name, phone: mobile });
  return { message: 'OTP sent to your email.' };
};

const vendorRegister = async ({ name, email, mobile }) => {
  // One email, one account: admins and customers live in User
  if (await userRepository.findByEmail(email)) throw fail(409, 'Email already registered.');

  const vendor = await vendorRepository.findByEmailWithPassword(email);
  if (vendor?.passwordHash) throw fail(409, 'Email already registered.');

  if (await vendorRepository.findVerifiedByMobile(mobile, vendor?._id)) {
    throw fail(409, 'Mobile number already registered.');
  }

  if (vendor) {
    await vendorRepository.updateDraftDetails(vendor._id, { name, mobile });
  } else {
    try {
      await vendorRepository.create({ name, email, mobile });
    } catch (error) {
      if (error.code === 11000) throw fail(409, 'Email already registered.');
      throw error;
    }
  }

  await sendOtp(email, OTP_PURPOSE.VENDOR_REGISTER);
  return { message: 'OTP sent to your email.', email };
};

// ── User login (Admin / Customer) ────────────────────────────────────────────
const userLogin = async (email, password, meta = {}) => {
  const user = await userRepository.findByEmailWithPassword(email);
  if (!user) return null; // signal: not a user account

  const isValid = user.passwordHash && (await bcrypt.compare(password, user.passwordHash));
  if (!isValid) {
    writeLog({ email, userId: user._id, role: user.role, authProvider: AUTH_PROVIDER.LOCAL, success: false, failReason: 'invalid_credentials', ...meta });
    throw fail(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    writeLog({ email, userId: user._id, role: user.role, authProvider: AUTH_PROVIDER.LOCAL, success: false, failReason: 'account_deactivated', ...meta });
    throw fail(403, 'Your account has been deactivated.');
  }

  await userRepository.updateLastLogin(user._id);
  writeLog({ email, userId: user._id, role: user.role, authProvider: AUTH_PROVIDER.LOCAL, success: true, ...meta });
  return { token: signToken(user), user: withoutPassword(user) };
};

// ── Vendor login ──────────────────────────────────────────────────────────────
const vendorLogin = async (email, password, meta = {}) => {
  const vendor = await vendorRepository.findForLogin(email);
  if (!vendor) return null; // signal: not a vendor account

  // Account locked?
  if (vendor.lockedUntil && vendor.lockedUntil > new Date()) {
    const minutes = Math.ceil((vendor.lockedUntil - Date.now()) / 60000);
    writeLog({ email, userId: vendor._id, role: ROLES.VENDOR, authProvider: AUTH_PROVIDER.LOCAL, success: false, failReason: 'account_locked', ...meta });
    throw fail(429, `Account locked. Try again in ${minutes} minute(s).`);
  }

  // No password yet — OTP verified but set-password step not completed
  if (!vendor.passwordHash) {
    writeLog({ email, userId: vendor._id, role: ROLES.VENDOR, authProvider: AUTH_PROVIDER.LOCAL, success: false, failReason: 'invalid_credentials', ...meta });
    throw fail(401, 'Registration not complete. Please verify your email and set a password first.');
  }

  const isValid = await bcrypt.compare(password, vendor.passwordHash);
  if (!isValid) {
    await vendorRepository.recordFailedLogin(vendor._id, VENDOR_MAX_ATTEMPTS, VENDOR_LOCK_MS);
    writeLog({ email, userId: vendor._id, role: ROLES.VENDOR, authProvider: AUTH_PROVIDER.LOCAL, success: false, failReason: 'invalid_credentials', ...meta });
    // Re-fetch to get updated attempt count for message
    const fresh = await vendorRepository.findForLogin(email);
    const attemptsLeft = Math.max(0, VENDOR_MAX_ATTEMPTS - (fresh?.failedLoginAttempts ?? VENDOR_MAX_ATTEMPTS));
    if (attemptsLeft === 0) throw fail(429, 'Too many failed attempts. Account locked for 15 minutes.');
    throw fail(401, `Invalid email or password. ${attemptsLeft} attempt(s) left.`);
  }

  if (!vendor.isActive) {
    writeLog({ email, userId: vendor._id, role: ROLES.VENDOR, authProvider: AUTH_PROVIDER.LOCAL, success: false, failReason: 'account_deactivated', ...meta });
    throw fail(403, 'Your account has been deactivated.');
  }

  // DRAFT / PENDING / REJECTED → allow login to complete the form; block selling elsewhere
  // SUSPENDED → deny outright
  if (vendor.approvalStatus === 'SUSPENDED') {
    writeLog({ email, userId: vendor._id, role: ROLES.VENDOR, authProvider: AUTH_PROVIDER.LOCAL, success: false, failReason: 'account_deactivated', ...meta });
    throw fail(403, 'Your vendor account has been suspended. Please contact support.');
  }

  await vendorRepository.recordSuccessfulLogin(vendor._id);
  writeLog({ email, userId: vendor._id, role: ROLES.VENDOR, authProvider: AUTH_PROVIDER.LOCAL, success: true, ...meta });

  const { passwordHash: _pw, failedLoginAttempts: _fa, lockedUntil: _lu, ...safeVendor } = vendor;
  return { token: signVendorToken(vendor), user: safeVendor };
};

// ── Unified login gateway ─────────────────────────────────────────────────────
const login = async (email, password, meta = {}) => {
  // 1. Try User collection first (Admin / Customer)
  const userResult = await userLogin(email, password, meta);
  if (userResult) return userResult;

  // 2. Try Vendor collection
  const vendorResult = await vendorLogin(email, password, meta);
  if (vendorResult) return vendorResult;

  // 3. Email not in either collection
  writeLog({ email, authProvider: AUTH_PROVIDER.LOCAL, success: false, failReason: 'user_not_found', ...meta });
  throw fail(401, 'Invalid email or password.');
};

const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (user?.isActive && user.authProvider === AUTH_PROVIDER.LOCAL) {
    await sendOtp(email, OTP_PURPOSE.RESET_PASSWORD);
  }
  return { message: 'If this email is registered, an OTP has been sent.' };
};

const userSendOtp = async ({ name, email, mobile }) => {
  const existing = await userRepository.findByEmailOrPhone(email, mobile);
  if (existing && existing.email !== email) {
    throw fail(409, 'Mobile is already registered with another account.');
  }
  if (existing && existing.role !== ROLES.CUSTOMER) {
    throw fail(403, 'This email belongs to a non-customer account.');
  }
  if (existing && !existing.isActive) throw fail(403, 'Your account has been deactivated.');

  await sendOtp(email, OTP_PURPOSE.CUSTOMER_LOGIN, { name, phone: mobile });
  return { message: 'OTP sent to your email.' };
};

const completeCustomerLogin = async ({ _id, email, payload }, meta = {}) => {
  await otpRepository.remove(_id);

  const user = await userRepository.findOrCreateAndMarkLogin(email, {
    name: payload.name,
    phone: payload.phone,
    role: ROLES.CUSTOMER,
    authProvider: AUTH_PROVIDER.OTP,
    isVerified: true,
  });

  if (!user.isActive) {
    writeLog({ email, userId: user._id, role: user.role, authProvider: AUTH_PROVIDER.OTP, success: false, failReason: 'account_deactivated', ...meta });
    throw fail(403, 'Your account has been deactivated.');
  }

  writeLog({ email, userId: user._id, role: user.role, authProvider: AUTH_PROVIDER.OTP, success: true, ...meta });
  return { token: signToken(user), user };
};

const verifyOtp = async (email, otp, meta = {}) => {
  const record = await otpRepository.consumeAttempt(email, OTP_MAX_ATTEMPTS);

  // OTP missing, expired, or max attempts exceeded
  if (!record || !record.otpHash) {
    writeLog({ email, authProvider: AUTH_PROVIDER.OTP, success: false, failReason: 'too_many_attempts', ...meta });
    throw fail(400, 'OTP is invalid, expired or too many attempts. Request a new one.');
  }

  // Wrong OTP value
  if (!isSameHash(record.otpHash, hashOtp(otp))) {
    writeLog({ email, authProvider: AUTH_PROVIDER.OTP, success: false, failReason: 'invalid_otp', ...meta });
    throw fail(400, `Invalid OTP. ${OTP_MAX_ATTEMPTS - record.attempts} attempt(s) left.`);
  }

  if (record.purpose === OTP_PURPOSE.CUSTOMER_LOGIN) return completeCustomerLogin(record, meta);

  await otpRepository.markVerified(record._id, new Date(Date.now() + VERIFIED_TTL_MS));

  if (record.purpose === OTP_PURPOSE.VENDOR_REGISTER) {
    await vendorRepository.markEmailVerified(email);
  }

  return { message: 'OTP verified successfully.' };
};

const setPassword = async (email, password) => {
  const record = await otpRepository.consumeVerified(email);
  if (!record) throw fail(403, 'OTP verification required first.');

  const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);

  if (record.purpose === OTP_PURPOSE.ADMIN_REGISTER) {
    await userRepository.create({
      name: record.payload.name,
      email,
      phone: record.payload.phone,
      passwordHash,
      role: ROLES.ADMIN,
      authProvider: AUTH_PROVIDER.LOCAL,
      isVerified: true,
    });
    return { message: 'Admin account created successfully.' };
  }

  if (record.purpose === OTP_PURPOSE.VENDOR_REGISTER) {
    const result = await vendorRepository.setInitialPassword(email, passwordHash);
    if (result.modifiedCount === 0) throw fail(409, 'Password already set or account not verified.');
    return { message: 'Vendor password set successfully. You can now log in.' };
  }

  await userRepository.updatePassword(email, passwordHash);
  return { message: 'Password reset successfully.' };
};

const googleLogin = async (token, meta = {}) => {
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (err) {
    writeLog({ authProvider: AUTH_PROVIDER.GOOGLE, success: false, failReason: 'invalid_credentials', ...meta });
    throw fail(401, 'Invalid Google token.');
  }

  const payload = ticket.getPayload();
  const email = payload.email;
  const name = payload.name;

  if (!email) {
    writeLog({ authProvider: AUTH_PROVIDER.GOOGLE, success: false, failReason: 'invalid_credentials', ...meta });
    throw fail(400, 'Google token did not provide an email.');
  }

  const user = await userRepository.findOrCreateAndMarkLogin(email, {
    name: name || 'Google User',
    phone: '', // Google does not guarantee phone number
    role: ROLES.CUSTOMER,
    authProvider: AUTH_PROVIDER.GOOGLE,
    isVerified: true,
  });

  if (!user.isActive) {
    writeLog({ email, userId: user._id, role: user.role, authProvider: AUTH_PROVIDER.GOOGLE, success: false, failReason: 'account_deactivated', ...meta });
    throw fail(403, 'Your account has been deactivated.');
  }

  writeLog({ email, userId: user._id, role: user.role, authProvider: AUTH_PROVIDER.GOOGLE, success: true, ...meta });
  return { token: signToken(user), user };
};

module.exports = {
  checkAdminRegistration,
  adminRegister,
  vendorRegister,
  userLogin,
  vendorLogin,
  login,
  forgotPassword,
  userSendOtp,
  verifyOtp,
  setPassword,
  googleLogin,
};
