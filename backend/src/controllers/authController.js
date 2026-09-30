const { checkAdminRegistrationService, AdminRegisterService, verifyOtpService, setPasswordService, loginUser, forgotPasswordService } = require('../services/authService');
const { checkRegistrationSchema, registerSchema, verifyOtpSchema, setPasswordSchema, loginSchema, forgotPasswordSchema } = require('../validators/adminValidator');

/**
 * Controller to check if a user is already registered
 */
const checkUser = async (req, res, next) => {
  const { error, value } = checkRegistrationSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    await checkAdminRegistrationService(value);
    res.status(200).json({ success: true, message: 'All fields are valid. Proceed to next step.' });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller for Step 1: Registration initiation
 */
const adminRegister = async (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const result = await AdminRegisterService(value);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller for OTP verification (Generic)
 */
const verifyOtp = async (req, res, next) => {
  const { error, value } = verifyOtpSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const result = await verifyOtpService(value.email, value.otp);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller for Step 3: Password setting
 */
const setPassword = async (req, res, next) => {
  const { error, value } = setPasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const result = await setPasswordService(value.email, value.password);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller for Login
 */
const login = async (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const result = await loginUser(value.email, value.password);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller for Forgot Password (Send OTP)
 */
const forgotPassword = async (req, res, next) => {
  const { error, value } = forgotPasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const result = await forgotPasswordService(value.email);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};



module.exports = {
  checkUser,
  adminRegister,
  verifyOtp,
  setPassword,
  login,
  forgotPassword,
};
