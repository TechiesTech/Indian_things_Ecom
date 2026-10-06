const Joi = require('joi');

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
    smsNotifications: Joi.boolean(),
    promotionalOffers: Joi.boolean(),
    orderUpdates: Joi.boolean(),
  }),
}).min(1).messages({
  'object.min': 'At least one field is required to update.',
});

module.exports = { updateProfileSchema };
