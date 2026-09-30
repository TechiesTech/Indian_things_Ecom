const { 
  registerVendorService, 
  getVendorProfileService, 
  getAllVendorsService, 
  updateVendorStatusService,
  loginVendorService,
  forgotPasswordVendorService,
  verifyOtpVendorService,
  resetPasswordVendorService
} = require('../services/vendorService');
const { registerVendorSchema, loginVendorSchema, updateStatusSchema } = require('../validators/vendorValidator');

/**
 * Utility to format vendor response in a consistent order
 */
const formatVendorResponse = (v) => ({
  _id: v._id,
  personName: v.personName,
  phoneNumber: v.phoneNumber,
  email: v.email,
  companyName: v.companyName,
  companyAddress: v.companyAddress,
  servicesProvided: v.servicesProvided,
  serviceImages: v.serviceImages,
  socialLinks: v.socialLinks,
  status: v.status,
  role: v.role,
  createdAt: v.createdAt,
  updatedAt: v.updatedAt
});

/**
 * Controller to register a new vendor
 */
const registerVendor = async (req, res, next) => {
  if (req.body.companyAddress && typeof req.body.companyAddress === 'string') {
    try { req.body.companyAddress = JSON.parse(req.body.companyAddress); } catch (e) {}
  }
  if (req.body.servicesProvided && typeof req.body.servicesProvided === 'string') {
    try {
      const parsed = JSON.parse(req.body.servicesProvided);
      req.body.servicesProvided = Array.isArray(parsed) ? parsed : [req.body.servicesProvided];
    } catch (e) {
      req.body.servicesProvided = [req.body.servicesProvided];
    }
  }
  if (req.body.socialLinks && typeof req.body.socialLinks === 'string') {
    try { req.body.socialLinks = JSON.parse(req.body.socialLinks); } catch (e) {}
  }

  if (req.files && req.files.length > 0) {
    req.body.serviceImages = req.files.map(file => file.location);
  }

  const { error, value } = registerVendorSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const result = await registerVendorService(value);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for vendor login
 */
const login = async (req, res, next) => {
  const { error, value } = loginVendorSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const result = await loginVendorService(value.email, value.password);
    // Format the vendor object before returning
    if (result.vendor) {
      result.vendor = formatVendorResponse(result.vendor);
    }
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for vendor forgot password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const result = await forgotPasswordVendorService(req.body.email);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for vendor OTP verification
 */
const verifyOtp = async (req, res, next) => {
  try {
    const result = await verifyOtpVendorService(req.body.email, req.body.otp);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for vendor password reset
 */
const resetPassword = async (req, res, next) => {
  try {
    const result = await resetPasswordVendorService(req.body.email, req.body.password);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to get vendor profile
 */
const getVendorProfile = async (req, res, next) => {
  try {
    const vendor = await getVendorProfileService(req.params.id);
    res.status(200).json({ 
      success: true, 
      vendor: formatVendorResponse(vendor) 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Get all vendors
 */
const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await getAllVendorsService();
    res.status(200).json({ 
      success: true, 
      count: vendors.length, 
      vendors: vendors.map(v => formatVendorResponse(v)) 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update vendor status
 */
const updateVendorStatus = async (req, res, next) => {
  const { error, value } = updateStatusSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const vendor = await updateVendorStatusService(req.params.id, value.status);
    res.status(200).json({
      success: true,
      message: `Vendor ${value.status} successfully.`,
      vendor: formatVendorResponse(vendor)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerVendor,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getVendorProfile,
  getAllVendors,
  updateVendorStatus
};
