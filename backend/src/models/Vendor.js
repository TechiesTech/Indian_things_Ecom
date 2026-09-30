const mongoose = require('mongoose');
const vendorSchema = require('./schemas/vendorSchema');

/**
 * Vendor Model
 * Compiles the vendor schema into a Mongoose model.
 */
const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;
