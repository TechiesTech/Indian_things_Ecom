const Joi = require('joi');

// ─── Profile ──────────────────────────────────────────────────────────────────

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().max(100).messages({
    'string.max': 'Name must be at most 100 characters.',
  }),

  phone: Joi.string().pattern(/^[6-9]\d{9}$/).messages({
    'string.pattern.base': 'Phone must be a valid 10-digit Indian mobile number.',
  }),

  dateOfBirth: Joi.string().isoDate().messages({
    'string.isoDate': 'Date of birth must be a valid ISO date (YYYY-MM-DD).',
  }),

  gender: Joi.string().valid('male', 'female', 'other').messages({
    'any.only': 'Gender must be male, female, or other.',
  }),

  preferences: Joi.object({
    emailNotifications: Joi.boolean(),
    smsNotifications:   Joi.boolean(),
    promotionalOffers:  Joi.boolean(),
    orderUpdates:       Joi.boolean(),
  }),
}).min(1).messages({
  'object.min': 'At least one field is required to update.',
});

// ─── Address (POST — all required fields) ─────────────────────────────────────

const addressSchema = Joi.object({
  fullName: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Full name is required.',
    'any.required': 'Full name is required.',
  }),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Phone must be a valid 10-digit Indian mobile number.',
    'any.required': 'Phone is required.',
  }),
  houseFlat: Joi.string().trim().max(200).required().messages({
    'string.empty': 'House/Flat is required.',
    'any.required': 'House/Flat is required.',
  }),
  streetArea: Joi.string().trim().max(200).required().messages({
    'string.empty': 'Street/Area is required.',
    'any.required': 'Street/Area is required.',
  }),
  landmark: Joi.string().trim().max(200).allow('', null),
  city: Joi.string().trim().required().messages({
    'string.empty': 'City is required.',
    'any.required': 'City is required.',
  }),
  state: Joi.string().trim().required().messages({
    'string.empty': 'State is required.',
    'any.required': 'State is required.',
  }),
  pincode: Joi.string().pattern(/^[1-9]\d{5}$/).required().messages({
    'string.pattern.base': 'Pincode must be a valid 6-digit Indian pincode.',
    'any.required': 'Pincode is required.',
  }),
  label:     Joi.string().valid('Home', 'Work').default('Home'),
  isDefault: Joi.boolean().default(false),
});

// ─── Address (PATCH — all optional, min 1 field) ──────────────────────────────

const updateAddressSchema = addressSchema.fork(
  ['fullName', 'phone', 'houseFlat', 'streetArea', 'city', 'state', 'pincode'],
  (field) => field.optional()
).min(1).messages({
  'object.min': 'At least one field is required to update.',
});

module.exports = { updateProfileSchema, addressSchema, updateAddressSchema };
