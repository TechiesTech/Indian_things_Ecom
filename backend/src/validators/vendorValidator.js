const Joi = require('joi');

/**
 * Validation schema for vendor registration
 */
const registerVendorSchema = Joi.object({
  personName: Joi.string().required().trim(),
  phoneNumber: Joi.string().required().pattern(/^\d{10}$/),
  email: Joi.string().required().email().lowercase().trim(),
  password: Joi.string().required().min(8),
  confirmPassword: Joi.any().equal(Joi.ref('password')).required().messages({ 'any.only': 'Passwords do not match' }),
  companyName: Joi.string().required().trim(),
  companyAddress: Joi.object({
    street: Joi.string().required().trim(),
    city: Joi.string().required().trim(),
    mandal: Joi.string().required().trim(),
    district: Joi.string().required().trim(),
    state: Joi.string().required().trim(),
    pincode: Joi.string().required().pattern(/^\d{6}$/)
  }).required(),
  servicesProvided: Joi.array().items(Joi.string().valid(
    'FunctionHall',
    'MakeUpArtist',
    'Decoration tent house',
    'Lightings',
    'Catering',
    'Mehandi',
    'DJ band',
    'PhotoGraphy/video',
    'Cooking master'
  )).min(1).required(),
  serviceImages: Joi.array().items(Joi.string()).min(1).required(),
  socialLinks: Joi.object({
    instagram: Joi.string().allow('').trim(),
    facebook: Joi.string().allow('').trim(),
    youtube: Joi.string().allow('').trim(),
    whatsapp: Joi.string().allow('').trim()
  }).optional()
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
  registerVendorSchema,
  loginVendorSchema,
  updateStatusSchema
};
