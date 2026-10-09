const authService  = require('../services/authService');
const vendorService = require('../services/vendorService');

// Extract client info from the request for login logging
const getMeta = (req) => ({
  ip:        req.ip || req.headers['x-forwarded-for'] || '',
  userAgent: req.headers['user-agent'] || '',
});

// ─── Admin ────────────────────────────────────────────────────────────────────

const adminCheckUser = async (req, res) => {
  await authService.checkAdminRegistration(req.body);
  res.status(200).json({ success: true, message: 'All fields are valid. Proceed to next step.' });
};

const adminRegister = async (req, res) => {
  const result = await authService.adminRegister(req.body);
  res.status(200).json({ success: true, ...result });
};

const adminProfile = (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to your profile!', admin: req.admin });
};

// ─── Shared (admin + vendor) ──────────────────────────────────────────────────

const login = async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password, getMeta(req));
  res.status(200).json({ success: true, ...result });
};


const forgotPassword = async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.status(200).json({ success: true, ...result });
};

const verifyOtp = async (req, res) => {
  const result = await authService.verifyOtp(req.body.email, req.body.otp, getMeta(req));
  res.status(200).json({ success: true, ...result });
};

const resetPassword = async (req, res) => {
  const result = await authService.setPassword(req.body.email, req.body.password);
  res.status(200).json({ success: true, ...result });
};

// ─── Vendor ───────────────────────────────────────────────────────────────────

const vendorRegister = async (req, res) => {
  const result = await vendorService.register(req.body);
  res.status(201).json({ success: true, ...result });
};

// ─── Customer ─────────────────────────────────────────────────────────────────

const userSendOtp = async (req, res) => {
  const result = await authService.userSendOtp(req.body);
  res.status(200).json({ success: true, ...result });
};

const googleLogin = async (req, res) => {
  const result = await authService.googleLogin(req.body.token, getMeta(req));
  res.status(200).json({ success: true, ...result });
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  // Admin
  adminCheckUser,
  adminRegister,
  adminProfile,
  // Shared
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  // Vendor
  vendorRegister,
  // User
  userSendOtp,
  googleLogin,
};