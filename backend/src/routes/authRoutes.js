const express = require('express');
const router = express.Router();
const {
  checkUser,
  adminRegister,
  verifyOtp,
  setPassword,
  login,
  forgotPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registration and Authentication routes
 */

/**
 * @swagger
 * /api/auth/checkUser:
 *   post:
 *     summary: Step 0 - Check if an admin with the given email/mobile is already registered
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - email
 *             properties:
 *               mobile:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fields are valid, proceed to next step
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or Mobile already in use
 * 
 */
router.post('/checkUser', checkUser);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Step 1 - Register name, mobile, and email to receive OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - mobile
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               mobile:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to the email
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate email or mobile
 */
router.post('/register', adminRegister);

/**
 * @swagger
 * /api/auth/verifyOtp:
 *   post:
 *     summary: Verify OTP (Used for both Registration and Forgot Password)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
router.post('/verifyOtp', verifyOtp);

/**
 * @swagger
 * /api/auth/set-password:
 *   post:
 *     summary: Step 3 - Set password and complete registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin account created successfully
 *       400:
 *         description: Validation error or passwords do not match
 *       403:
 *         description: OTP verification required first
 */
router.post('/setPassword', setPassword);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Admin Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/forgotPassword:
 *   post:
 *     summary: Forgot Password - Send OTP to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset OTP sent to email
 *       400:
 *         description: Validation error
 *       404:
 *         description: Verified user not found with this email
 */
router.post('/forgotPassword', forgotPassword);



/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get protected admin profile info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile returned
 *       401:
 *         description: Not authorized
 */
router.get('/profile', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to your profile!',
    admin: req.admin
  });
});

module.exports = router;
