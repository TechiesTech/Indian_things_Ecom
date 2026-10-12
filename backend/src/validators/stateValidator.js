// src/validators/stateValidator.js
const Joi = require('joi');

const stateCode = Joi.string().trim().uppercase().length(2).pattern(/^[A-Z]+$/);
const stateName = Joi.string().trim().min(2).max(80);
const districtName = Joi.string().trim().min(2).max(80).pattern(/^[A-Za-z .'-]+$/);

const addStateSchema = Joi.object({
  stateCode: Joi.string().trim().uppercase().length(2).pattern(/^[A-Z]+$/).required(),
  stateName: Joi.string().trim().min(2).max(80).required(),
  stateType: Joi.string().valid('STATE', 'UNION_TERRITORY').default('STATE'),
});

const updateStateSchema = Joi.object({
  stateName,
  isActive: Joi.boolean(),
  isOpenForVendors: Joi.boolean(),
  isOpenForCustomers: Joi.boolean(),
}).min(1);


const addDistrictSchema = Joi.object({
  districtName,
  districtNames: Joi.array().items(districtName).min(1).max(100),
}).xor('districtName', 'districtNames');

const updateDistrictSchema = Joi.object({
  isActive: Joi.boolean(),
  newDistrictName: districtName,
}).min(1);

module.exports = {
  addStateSchema,
  updateStateSchema,
  addDistrictSchema,
  updateDistrictSchema,
};