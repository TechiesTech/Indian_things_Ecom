const jwt = require('jsonwebtoken');
require('dotenv').config();
const { ROLES } = require('../utils/constants');

const protect = (req, res, next) => {
  let token;

  // 1. Morgan logs the incoming request (automatic)
  // 2. Auth middleware extracts the token from the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 3. jwt.verify() checks if the token is valid and not expired (pinned to HS256)
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

      // 4. If valid, the user's ID and role are attached to the request object
      req.user = decoded;

      // 5. The request reaches the controller and the actual work happens
      next();
    } catch (error) {
      // 6. If the token is missing or expired/invalid, 401 is returned immediately
      console.error('JWT error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token.' });
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions.' });
  }
  next();
};

const requireAdmin = restrictTo(ROLES.ADMIN);
const requireVendor = restrictTo(ROLES.VENDOR);
const requireCustomer = restrictTo(ROLES.CUSTOMER);

module.exports = { protect, restrictTo, requireAdmin, requireVendor, requireCustomer };
