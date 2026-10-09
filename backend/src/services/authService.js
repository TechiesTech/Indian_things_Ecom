const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { user: userRepository, otp: otpRepository } = require('../repositories/authRepository');
const LoginLog = require('../models/schemas/loginLogSchema');
const { sendOtpEmail } = require('../config/NodeMailer');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const {
  ROLES,
  AUTH_PROVIDER,
  VENDOR_STATUS,
  OTP_PURPOSE,
  OTP_TTL_MS,
  VERIFIED_TTL_MS,
  OTP_MAX_ATTEMPTS,
} = require('../utils/constants');

const PASSWORD_ROUNDS = 12;

const fail = (status, message) => Object.assign(new Error(message), { status });

// Fire-and-forget — a log write failure must never break the login flow
const writeLog = (data) => LoginLog.create(data).catch(() => {});

const hashOtp = (otp) =>
  crypto.createHmac('sha256', process.env.JWT_SECRET).update(otp).digest('hex');

const isSameHash = (a, b) =>
  a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

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

const checkAdminRegistrationService = async ({ email, mobile }) => {
  await assertNotRegistered(email, mobile);
};

const AdminRegisterService = async ({ name, email, mobile }) => {
  await assertNotRegistered(email, mobile);
  await sendOtp(email, OTP_PURPOSE.ADMIN_REGISTER, { name, phone: mobile });
  return { message: 'OTP sent to your email.' };
};

const registerVendorService = async ({
  personName, phoneNumber, email, password,
  companyName, companyAddress, servicesProvided, serviceImages, socialLinks,
}) => {
  const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);
  const user = await userRepository.create({
    name: personName,
    email,
    phone: phoneNumber,
    passwordHash,
    role: ROLES.VENDOR,
    authProvider: AUTH_PROVIDER.LOCAL,
    vendor: {
      companyName,
      companyAddress,
      servicesProvided,
      serviceImages,
      socialLinks,
      status: VENDOR_STATUS.PENDING,
    },
  });

  return {
    message: 'Registration submitted. You can log in once an admin approves your account.',
    user: withoutPassword(user),
  };
};

const loginUser = async (email, password, meta = {}) => {
  const user = await userRepository.findByEmailWithPassword(email);

  // Unknown email
  if (!user) {
    writeLog({ email, authProvider: AUTH_PROVIDER.LOCAL, success: false, failReason: 'user_not_found', ...meta });
    throw fail(401, 'Invalid email or password.');
  }

  // Wrong password
  const isValid = user.passwordHash && (await bcrypt.compare(password, user.passwordHash));
  if (!isValid) {
    writeLog({ email, userId: user._id, role: user.role, authProvider: AUTH_PROVIDER.LOCAL, success: false, failReason: 'invalid_credentials', ...meta });
    throw fail(401, 'Invalid email or password.');
  }

  // Deactivated account
  if (!user.isActive) {
    writeLog({ email, userId: user._id, role: user.role, authProvider: AUTH_PROVIDER.LOCAL, success: false, failReason: 'account_deactivated', ...meta });
    throw fail(403, 'Your account has been deactivated.');
  }

  // Vendor not yet approved
  if (user.role === ROLES.VENDOR && user.vendor.status !== VENDOR_STATUS.APPROVED) {
    writeLog({ email, userId: user._id, role: user.role, authProvider: AUTH_PROVIDER.LOCAL, success: false, failReason: 'vendor_not_approved', ...meta });
    throw fail(403, `Your vendor account is ${user.vendor.status.toLowerCase()}.`);
  }

  await userRepository.updateLastLogin(user._id);
  writeLog({ email, userId: user._id, role: user.role, authProvider: AUTH_PROVIDER.LOCAL, success: true, ...meta });
  return { token: signToken(user), user: withoutPassword(user) };
};

const forgotPasswordService = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (user?.isActive && user.authProvider === AUTH_PROVIDER.LOCAL) {
    await sendOtp(email, OTP_PURPOSE.RESET_PASSWORD);
  }
  return { message: 'If this email is registered, an OTP has been sent.' };
};

const userSendOtpService = async ({ name, email, mobile }) => {
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

const verifyOtpService = async (email, otp, meta = {}) => {
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
  return { message: 'OTP verified successfully.' };
};

const setPasswordService = async (email, password) => {
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

  await userRepository.updatePassword(email, passwordHash);
  return { message: 'Password reset successfully.' };
};

const googleLoginService = async (token, meta = {}) => {
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
  checkAdminRegistration: checkAdminRegistrationService,
  adminRegister: AdminRegisterService,
  registerVendor: registerVendorService,
  login: loginUser,
  forgotPassword: forgotPasswordService,
  userSendOtp: userSendOtpService,
  verifyOtp: verifyOtpService,
  setPassword: setPasswordService,
  googleLogin: googleLoginService,
};
