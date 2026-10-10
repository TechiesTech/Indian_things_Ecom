const Joi = require('joi');

// ─── Profile ──────────────────────────────────────────────────────────────────

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().max(100).messages({
    'string.max': 'Name must be at most 100 characters.',
  }),

  phone: Joi.string().pattern(/^[6-9]\d{9}$/).messages({
    'string.pattern.base': 'Phone must be a valid 10-digit Indian mobile number.',
  }),

  dateOfBirth: Joi.string().isoDate().allow('', null).messages({
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

const addAddressSchema = Joi.object({
  fullName:   Joi.string().trim().max(100).required(),
  phone:      Joi.string().pattern(/^[6-9]\d{9}$/).required()
                .messages({ 'string.pattern.base': 'Address phone must be a valid 10-digit Indian mobile number.' }),
  houseFlat:  Joi.string().trim().max(200).required(),
  streetArea: Joi.string().trim().max(200).required(),
  landmark:   Joi.string().trim().max(200).allow(''),
  city:       Joi.string().trim().required(),
  state:      Joi.string().trim().required(),
  pincode:    Joi.string().pattern(/^[1-9]\d{5}$/).required()
                .messages({ 'string.pattern.base': 'Pincode must be a valid 6-digit pincode.' }),
  label:      Joi.string().trim().max(30),
  isDefault:  Joi.boolean(),
});

// ─── Address (PATCH — all optional, min 1, isDefault only true allowed) ───────

const updateAddressSchema = addAddressSchema
  .fork(Object.keys(addAddressSchema.describe().keys), (field) => field.optional())
  .keys({ isDefault: Joi.boolean().valid(true) })
  .min(1);

module.exports = { updateProfileSchema, addAddressSchema, updateAddressSchema };

