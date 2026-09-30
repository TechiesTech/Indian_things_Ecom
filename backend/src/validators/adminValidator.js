const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'Name is required.',
  }),
  mobile: Joi.string().length(10).pattern(/^\d+$/).required().messages({
    'string.length': 'Mobile number must be exactly 10 digits.',
    'string.pattern.base': 'Mobile number must contain only digits.',
    'string.empty': 'Mobile number is required.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format.',
    'string.empty': 'Email is required.',
  }),
});

const checkRegistrationSchema = Joi.object({
  mobile: Joi.string().length(10).pattern(/^\d+$/).required().messages({
    'string.length': 'Mobile number must be exactly 10 digits.',
    'string.pattern.base': 'Mobile number must contain only digits.',
    'string.empty': 'Mobile number is required.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format.',
    'string.empty': 'Email is required.',
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format.',
    'string.empty': 'Email is required.',
  }),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

const setPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long.',
  }),
  confirmPassword: Joi.any().equal(Joi.ref('password'))
    .required()
    .label('Confirm password')
    .messages({ 'any.only': '{{#label}} does not match password' }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  registerSchema,
  verifyOtpSchema,
  setPasswordSchema,
  loginSchema,
  checkRegistrationSchema,
  forgotPasswordSchema,
};
