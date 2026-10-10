const express = require('express');
const router = express.Router();
const { protect, requireCustomer } = require('../middleware/authMiddleware');
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
router.get('/getUserProfile',      protect, requireCustomer, getUserProfile);
router.patch('/updateUserProfile', protect, requireCustomer, validate(updateProfileSchema), updateUserProfile);
router.put('/updateUserProfile',   protect, requireCustomer, validate(updateProfileSchema), updateUserProfile);

// ─── Addresses ────────────────────────────────────────────────────────────────
router.get('/getUserAddresses',    protect, requireCustomer, getUserAddresses);
router.post('/addUserAddress',     protect, requireCustomer, validate(addAddressSchema), addUserAddress);
router.patch(
  '/updateUserAddress/:addressId',
  protect,
  requireCustomer,
  validateObjectId('addressId'),
  validate(updateAddressSchema),
  updateUserAddress
);
router.delete('/deleteUserAddress/:addressId', protect, requireCustomer, validateObjectId('addressId'), deleteUserAddress);

module.exports = router;