const mongoose = require('mongoose');
const otpSchema = require('./schemas/otpSchema');

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
