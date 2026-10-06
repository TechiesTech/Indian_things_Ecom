const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { updateProfileSchema } = require('../validators/userValidator');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

router.get('/getUserProfile', protect, getUserProfile);
router.patch('/updateUserProfile', protect, validate(updateProfileSchema), updateUserProfile);

module.exports = router;