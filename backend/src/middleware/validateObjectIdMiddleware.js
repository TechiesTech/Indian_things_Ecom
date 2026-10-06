const { isValidObjectId } = require('mongoose');

/**
 * Middleware factory — validates that req.params[paramName] is a valid MongoDB ObjectId.
 * Prevents invalid IDs from hitting the DB and causing a CastError.
 */
const validateObjectId = (paramName) => (req, res, next) => {
  if (!isValidObjectId(req.params[paramName])) {
    return res.status(400).json({ success: false, message: `Invalid ${paramName}.` });
  }
  next();
};

module.exports = { validateObjectId };
