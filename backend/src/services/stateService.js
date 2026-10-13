// src/services/stateService.js
const State = require('../models/schemas/stateSchema');
const AppError = require('../utils/appError');

// ─── Read ─────────────────────────────────────────────────────────────────────
// Dropdown: small fixed list, no pagination
const getStates = async (audience = 'customer') => {
  let audienceFlag;
  if (audience === 'vendor') audienceFlag = 'isOpenForVendors';
  else if (audience === 'customer') audienceFlag = 'isOpenForCustomers';
  else throw new AppError('for must be vendor or customer', 400);

  return State.find({ isActive: true, [audienceFlag]: true })
    .select('stateCode stateName -_id')
    .sort('stateName')
    .lean();
};

// Admin list: cursor pagination (cursor = base64url of the last stateCode)
const getAllStates = async ({ cursor, limit, isActive, isOpenForVendors, isOpenForCustomers }) => {
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const filter = {};
  if (isActive === 'true' || isActive === 'false') filter.isActive = isActive === 'true';
  if (isOpenForVendors === 'true' || isOpenForVendors === 'false') {
    filter.isOpenForVendors = isOpenForVendors === 'true';
  }
  if (isOpenForCustomers === 'true' || isOpenForCustomers === 'false') {
    filter.isOpenForCustomers = isOpenForCustomers === 'true';
  }

  if (cursor) {
    const lastStateCode = Buffer.from(String(cursor), 'base64url').toString();
    if (!/^[A-Z]{2}$/.test(lastStateCode)) throw new AppError('Invalid cursor', 400);
    filter.stateCode = { $gt: lastStateCode };
  }

  // one extra row tells us whether another page exists
  const rows = await State.find(filter)
    .select('stateCode stateName stateType isActive isOpenForVendors isOpenForCustomers')
    .sort({ stateCode: 1 })
    .limit(pageSize + 1)
    .lean();

  const hasNextPage = rows.length > pageSize;
  const items = hasNextPage ? rows.slice(0, pageSize) : rows;
  const nextCursor = hasNextPage
    ? Buffer.from(items[items.length - 1].stateCode).toString('base64url')
    : null;

  return { items, pagination: { limit: pageSize, hasNextPage, nextCursor } };
};

const getStateDetails = async (stateCode) => {
  const code = String(stateCode || '').trim().toUpperCase();

  const state = await State.findOne({ stateCode: code }).lean();
  if (!state) throw new AppError('State not found', 404);
  return state;
};

const getDistricts = async (stateCode) => {
  const code = String(stateCode || '').trim().toUpperCase();

  const state = await State.findOne({ stateCode: code, isActive: true })
    .select('stateName districts')
    .lean();
  if (!state) throw new AppError('Invalid stateCode', 400);

  return state.districts
    .filter((district) => district.isActive)
    .map((district) => district.districtName)
    .sort();
};

// ─── State write ──────────────────────────────────────────────────────────────
const addState = async ({ stateCode, stateName, stateType }) => {
  try {
    const state = await State.create({
      stateCode: String(stateCode || '').trim().toUpperCase(),
      stateName: String(stateName || '').trim(),
      stateType,
    });
    return state.toObject();
  } catch (error) {
    if (error.code === 11000) throw new AppError('State already exists', 409);
    throw error;
  }
};

const updateState = async (stateCode, body) => {
  const code = String(stateCode || '').trim().toUpperCase();

  // only whitelisted fields can be changed
  const changes = {};
  ['stateName', 'isActive', 'isOpenForVendors', 'isOpenForCustomers'].forEach((field) => {
    if (body[field] !== undefined) changes[field] = body[field];
  });
  if (changes.stateName) changes.stateName = String(changes.stateName).trim();
  if (!Object.keys(changes).length) throw new AppError('Nothing to update', 400);

  try {
    const state = await State.findOneAndUpdate(
      { stateCode: code },
      { $set: changes },
      { new: true, runValidators: true }
    ).lean();
    if (!state) throw new AppError('State not found', 404);
    return state;
  } catch (error) {
    if (error.code === 11000) throw new AppError('State name already exists', 409);
    throw error;
  }
};

const deleteState = async (stateCode) => {
  const code = String(stateCode || '').trim().toUpperCase();

  const state = await State.findOneAndDelete({ stateCode: code }).lean();
  if (!state) throw new AppError('State not found', 404);
  return { deleted: state.stateCode };
};

// ─── District write ───────────────────────────────────────────────────────────
const addDistrict = async (stateCode, districtNames) => {
  const code = String(stateCode || '').trim().toUpperCase();

  // accept one name or an array; trim, drop blanks, remove duplicates ignoring case
  const input = Array.isArray(districtNames) ? districtNames : [districtNames];
  const uniqueNames = [
    ...new Map(
      input
        .map((name) => String(name || '').trim())
        .filter(Boolean)
        .map((name) => [name.toLowerCase(), name])
    ).values(),
  ];
  if (!uniqueNames.length) throw new AppError('At least one district name is required', 400);

  const state = await State.findOne({ stateCode: code }).select('districts').lean();
  if (!state) throw new AppError('State not found', 404);

  // skip names that already exist (ignoring case)
  const existingLower = new Set(state.districts.map((d) => d.districtName.toLowerCase()));
  const newNames = uniqueNames.filter((name) => !existingLower.has(name.toLowerCase()));
  const skipped = uniqueNames.filter((name) => existingLower.has(name.toLowerCase()));

  if (!newNames.length) {
    throw new AppError(`Already exists in this state: ${skipped.join(', ')}`, 409);
  }

  // atomic: the database refuses the write if any of these exact names was added meanwhile
  const updated = await State.findOneAndUpdate(
    { stateCode: code, 'districts.districtName': { $nin: newNames } },
    { $push: { districts: { $each: newNames.map((districtName) => ({ districtName })) } } },
    { new: true }
  ).lean();

  if (!updated) {
    throw new AppError('District was just added by another request, please retry', 409);
  }
  return updated;
};

const updateDistrict = async (stateCode, districtName, { isActive, newDistrictName }) => {
  const code = String(stateCode || '').trim().toUpperCase();
  const currentName = String(districtName || '').trim();
  const changes = {};

  if (typeof isActive === 'boolean') changes['districts.$.isActive'] = isActive;

  if (newDistrictName) {
    const newName = String(newDistrictName).trim();
    const state = await State.findOne({ stateCode: code }).lean();
    const duplicate = state?.districts.some(
      (district) =>
        district.districtName.toLowerCase() === newName.toLowerCase() &&
        district.districtName !== currentName
    );
    if (duplicate) throw new AppError('District name already exists in this state', 409);
    changes['districts.$.districtName'] = newName;
  }

  if (!Object.keys(changes).length) throw new AppError('Nothing to update', 400);

  const updated = await State.findOneAndUpdate(
    { stateCode: code, 'districts.districtName': currentName },
    { $set: changes },
    { new: true }
  ).lean();
  if (!updated) throw new AppError('State or district not found', 404);
  return updated;
};

const deleteDistrict = async (stateCode, districtName) => {
  const code = String(stateCode || '').trim().toUpperCase();
  const name = String(districtName || '').trim();

  const state = await State.findOneAndUpdate(
    { stateCode: code, 'districts.districtName': name },
    { $pull: { districts: { districtName: name } } },
    { new: true }
  ).lean();
  if (!state) throw new AppError('State or district not found', 404);
  return { deleted: name };
};

module.exports = {
  getStates,
  getAllStates,
  getStateDetails,
  getDistricts,
  addState,
  updateState,
  deleteState,
  addDistrict,
  updateDistrict,
  deleteDistrict,
};