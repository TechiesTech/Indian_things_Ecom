const mongoose = require('mongoose');
const authSchema = require('./schemas/authSchema');

/**
 * Admin Model
 * Compiles the admin schema into a Mongoose model.
 */
const Admin = mongoose.model('Admin', authSchema);

module.exports = Admin;
