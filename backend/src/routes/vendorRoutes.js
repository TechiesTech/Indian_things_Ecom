const express = require('express');
const router = express.Router();
const {
    registerVendor,
    login,
    forgotPassword,
    verifyOtp,
    resetPassword,
    getVendorProfile,
    getAllVendors,
    updateVendorStatus
} = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/vendorRegister', upload.array('serviceImages', 10), registerVendor);
router.patch('/vendorApprove/:id', protect, updateVendorStatus);
router.post('/vendorLogin', login);
router.post('/vendorForgotPassword', forgotPassword);
router.post('/vendorVerifyOtp', verifyOtp);
router.post('/vendorResetPassword', resetPassword);
router.get('/vendorProfile/:id', getVendorProfile);
router.get('/getAllVendors', protect, getAllVendors);

module.exports = router;
