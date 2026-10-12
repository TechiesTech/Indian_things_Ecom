// src/controllers/stateController.js
const stateService = require('../services/stateService');

// ─── Public ───────────────────────────────────────────────────────────────────
const getStates = async (req, res) => {
  try {
    const states = await stateService.getStates(req.query.for);
    res.status(200).json({ success: true, data: states });
  } catch (error) {
    if (!error.isOperational) console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.isOperational ? error.message : 'Something went wrong',
    });
  }
};

const getDistricts = async (req, res) => {
  try {
    const districts = await stateService.getDistricts(req.query.stateCode);
    res.status(200).json({ success: true, data: districts });
  } catch (error) {
    if (!error.isOperational) console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.isOperational ? error.message : 'Something went wrong',
    });
  }
};

// ─── Admin: states ────────────────────────────────────────────────────────────
const getAllStates = async (req, res) => {
  try {
    const { items, pagination } = await stateService.getAllStates(req.query);
    res.status(200).json({ success: true, data: items, pagination });
  } catch (error) {
    if (!error.isOperational) console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.isOperational ? error.message : 'Something went wrong',
    });
  }
};

const getStateDetails = async (req, res) => {
  try {
    const state = await stateService.getStateDetails(req.params.stateCode);
    res.status(200).json({ success: true, data: state });
  } catch (error) {
    if (!error.isOperational) console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.isOperational ? error.message : 'Something went wrong',
    });
  }
};

const addState = async (req, res) => {
  try {
    const state = await stateService.addState(req.body);
    res.status(201).json({ success: true, data: state });
  } catch (error) {
    if (!error.isOperational) console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.isOperational ? error.message : 'Something went wrong',
    });
  }
};

const updateState = async (req, res) => {
  try {
    const state = await stateService.updateState(req.params.stateCode, req.body);
    res.status(200).json({ success: true, data: state });
  } catch (error) {
    if (!error.isOperational) console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.isOperational ? error.message : 'Something went wrong',
    });
  }
};

const deleteState = async (req, res) => {
  try {
    const result = await stateService.deleteState(req.params.stateCode);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (!error.isOperational) console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.isOperational ? error.message : 'Something went wrong',
    });
  }
};

// ─── Admin: districts ─────────────────────────────────────────────────────────
const addDistrict = async (req, res) => {
  try {
    const names = req.body.districtNames || req.body.districtName;
    const state = await stateService.addDistrict(req.params.stateCode, names);
    res.status(201).json({ success: true, data: state });
  } catch (error) {
    if (!error.isOperational) console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.isOperational ? error.message : 'Something went wrong',
    });
  }
};

const updateDistrict = async (req, res) => {
  try {
    const { stateCode, districtName } = req.params;
    const state = await stateService.updateDistrict(stateCode, districtName, req.body);
    res.status(200).json({ success: true, data: state });
  } catch (error) {
    if (!error.isOperational) console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.isOperational ? error.message : 'Something went wrong',
    });
  }
};

const deleteDistrict = async (req, res) => {
  try {
    const { stateCode, districtName } = req.params;
    const result = await stateService.deleteDistrict(stateCode, districtName);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (!error.isOperational) console.error(error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.isOperational ? error.message : 'Something went wrong',
    });
  }
};

module.exports = {
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
};