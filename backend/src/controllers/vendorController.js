const vendorService = require('../services/vendorService');

/**
 * Utility – format vendor response in consistent field order
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
  updatedAt: v.updatedAt,
});

const getVendorProfile = async (req, res, next) => {
  try {
    const vendor = await vendorService.getProfile(req.params.id);
    res.status(200).json({ success: true, vendor: formatVendorResponse(vendor) });
  } catch (error) {
    next(error);
  }
};

const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await vendorService.getAll();
    res.status(200).json({
      success: true,
      count: vendors.length,
      vendors: vendors.map((v) => formatVendorResponse(v)),
    });
  } catch (error) {
    next(error);
  }
};

const updateVendorStatus = async (req, res, next) => {
  try {
    const vendor = await vendorService.updateStatus(req.params.id, req.body.status);
    res.status(200).json({
      success: true,
      message: `Vendor ${req.body.status} successfully.`,
      vendor: formatVendorResponse(vendor),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVendorProfile,
  getAllVendors,
  updateVendorStatus,
};
