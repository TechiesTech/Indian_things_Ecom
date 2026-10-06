const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { validateObjectId } = require('../middleware/validateObjectIdMiddleware');
const { updateProfileSchema, addAddressSchema, updateAddressSchema } = require('../validators/userValidator');
const {
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} = require('../controllers/userController');

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get('/getUserProfile',      protect, getUserProfile);
router.patch('/updateUserProfile', protect, validate(updateProfileSchema), updateUserProfile);

// ─── Addresses ────────────────────────────────────────────────────────────────
router.get('/getUserAddresses',    protect, getUserAddresses);
router.post('/addUserAddress',     protect, validate(addAddressSchema), addUserAddress);
router.patch(
  '/updateUserAddress/:addressId',
  protect,
  validateObjectId('addressId'),
  validate(updateAddressSchema),
  updateUserAddress
);
router.delete('/deleteUserAddress/:addressId', protect, validateObjectId('addressId'), deleteUserAddress);

module.exports = router;