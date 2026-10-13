const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const {
  checkRegistrationSchema,
  registerSchema,
  verifyOtpSchema,
  setPasswordSchema,
  loginSchema,
  forgotPasswordSchema,
  userLoginSchema,
  googleLoginSchema,
} = require('../validators/adminValidator');
const { vendorSignupSchema } = require('../validators/vendorValidator');

const {
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  adminCheckUser,
  adminRegister,
  adminProfile,
  vendorRegister,
  userSendOtp,
  googleLogin,
} = require('../controllers/authController');

router.post('/login', validate(loginSchema), login);
router.post('/google', validate(googleLoginSchema), googleLogin);
router.post('/forgotPassword', validate(forgotPasswordSchema), forgotPassword);
router.post('/verifyOtp', validate(verifyOtpSchema), verifyOtp);
router.post('/resetPassword', validate(setPasswordSchema), resetPassword);

router.post('/admin/checkUser', validate(checkRegistrationSchema), adminCheckUser);
router.post('/admin/register', validate(registerSchema), adminRegister);
router.get('/admin/profile', protect, requireAdmin, adminProfile);

router.post('/vendor/register', validate(vendorSignupSchema), vendorRegister);

router.post('/user/sendOtp', validate(userLoginSchema), userSendOtp);


module.exports = router;