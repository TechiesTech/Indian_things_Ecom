// src/repositories/stateRepository.js
const State = require('../models/schemas/stateSchema');

const PUBLIC_FIELDS = 'stateCode stateName -_id';
const ADMIN_LIST_FIELDS = 'stateCode stateName stateType isActive isOpenForVendors isOpenForCustomers';

// ─── Read ─────────────────────────────────────────────────────────────────────
const findOpenStates = (audienceFlag) =>
  State.find({ isActive: true, [audienceFlag]: true }).select(PUBLIC_FIELDS).sort('stateName').lean();

const findStatesPage = ({ filter, limit }) =>
  State.find(filter).select(ADMIN_LIST_FIELDS).sort({ stateCode: 1 }).limit(limit).lean();

const findByStateCode = (stateCode) => State.findOne({ stateCode }).lean();

const findDistrictsByStateCode = (stateCode) =>
  State.findOne({ stateCode, isActive: true }).select('stateName districts').lean();

// ─── State write ──────────────────────────────────────────────────────────────
const createState = async (data) => (await State.create(data)).toObject();

const updateState = (stateCode, changes) =>
  State.findOneAndUpdate({ stateCode }, { $set: changes }, { new: true, runValidators: true }).lean();

const deleteState = (stateCode) => State.findOneAndDelete({ stateCode }).lean();

// ─── District write ───────────────────────────────────────────────────────────
const addDistrict = (stateCode, districtName) =>
  State.findOneAndUpdate(
    { stateCode, 'districts.districtName': { $ne: districtName } },
    { $push: { districts: { districtName } } },
    { new: true }
  ).lean();

const updateDistrict = (stateCode, districtName, changes) =>
  State.findOneAndUpdate(
    { stateCode, 'districts.districtName': districtName },
    { $set: changes },
    { new: true }
  ).lean();

const removeDistrict = (stateCode, districtName) =>
  State.findOneAndUpdate(
    { stateCode, 'districts.districtName': districtName },
    { $pull: { districts: { districtName } } },
    { new: true }
  ).lean();

module.exports = {
  findOpenStates,
  findStatesPage,
  findByStateCode,
  findDistrictsByStateCode,
  createState,
  updateState,
  deleteState,
  addDistrict,
  updateDistrict,
  removeDistrict,
};