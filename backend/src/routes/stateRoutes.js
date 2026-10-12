// src/routes/stateRoutes.js
const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const {
  addStateSchema,
  updateStateSchema,
  addDistrictSchema,
  updateDistrictSchema,
} = require('../validators/stateValidator');
const {
  getStates,
  getDistricts,
  getAllStates,
  getStateDetails,
  addState,
  updateState,
  deleteState,
  addDistrict,
  updateDistrict,
  deleteDistrict,
} = require('../controllers/stateController');

// ─── Public (dropdowns) ───────────────────────────────────────────────────────
router.get('/getStates', getStates);           // ?for=vendor | customer
router.get('/getDistricts', getDistricts);     // ?stateCode=TS

// ─── Admin: states ────────────────────────────────────────────────────────────
router.get('/getAllStates', protect, requireAdmin, getAllStates);   // ?limit=10&cursor=...&isActive=true
router.get('/getStateDetails/:stateCode', protect, requireAdmin, getStateDetails);
router.post('/addState', protect, requireAdmin, validate(addStateSchema), addState);
router.patch('/updateState/:stateCode', protect, requireAdmin, validate(updateStateSchema), updateState);
router.delete('/deleteState/:stateCode', protect, requireAdmin, deleteState);

// ─── Admin: districts ─────────────────────────────────────────────────────────
router.post('/addDistrict/:stateCode', protect, requireAdmin, validate(addDistrictSchema), addDistrict);
router.patch(
  '/updateDistrict/:stateCode/:districtName',
  protect,
  requireAdmin,
  validate(updateDistrictSchema),
  updateDistrict
);
router.delete('/deleteDistrict/:stateCode/:districtName', protect, requireAdmin, deleteDistrict);

module.exports = router;