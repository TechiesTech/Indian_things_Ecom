const Joi = require('joi');

const vendorSignupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().required().email().lowercase().trim(),
  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.empty': 'Mobile number is required.',
      'string.pattern.base': 'Enter a valid 10 digit mobile number starting with 6-9.',
      'any.required': 'Mobile number is required.',
    }),
});

/**
 * Validation schema for vendor login
 */
const loginVendorSchema = Joi.object({
  email: Joi.string().required().email().lowercase().trim(),
  password: Joi.string().required()
});

/**
 * Validation schema for status update
 */
const updateStatusSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required()
});

module.exports = {
  vendorSignupSchema,
  registerVendorSchema: vendorSignupSchema,
  loginVendorSchema,
  updateStatusSchema
};
