const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { parseVendorBody } = require('../middleware/parseVendorBody');
const {
  checkRegistrationSchema,
  registerSchema,
  verifyOtpSchema,
  setPasswordSchema,
  loginSchema,
  forgotPasswordSchema,
  userLoginSchema,
} = require('../validators/adminValidator');
const { registerVendorSchema } = require('../validators/vendorValidator');

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
} = require('../controllers/authController');

router.post('/login', validate(loginSchema), login);
router.post('/forgotPassword', validate(forgotPasswordSchema), forgotPassword);
router.post('/verifyOtp', validate(verifyOtpSchema), verifyOtp);
router.post('/resetPassword', validate(setPasswordSchema), resetPassword);

router.post('/admin/checkUser', validate(checkRegistrationSchema), adminCheckUser);
router.post('/admin/register', validate(registerSchema), adminRegister);
router.get('/admin/profile', protect, adminProfile);

router.post(
  '/vendor/register',
  upload.array('serviceImages', 10),
  parseVendorBody,
  validate(registerVendorSchema),
  vendorRegister
);

router.post('/user/sendOtp', validate(userLoginSchema), userSendOtp);

module.exports = router;