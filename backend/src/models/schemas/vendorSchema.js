const mongoose = require('mongoose');
const { VENDOR_STATUS } = require('../../utils/constants');

const { ObjectId } = mongoose.Schema.Types;

const vendorSchema = new mongoose.Schema(
  {
    // Login details (name, email, phone, password) live in User
    userId: { type: ObjectId, ref: 'User', required: true, unique: true },

    businessName: { type: String, required: true, trim: true, maxlength: 150 },

    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      mandal: { type: String, trim: true },
      pincode: { type: String, required: true, match: /^[1-9]\d{5}$/ },
    },
    // Products inherit these two
    stateId: { type: ObjectId, ref: 'State', required: true },
    districtId: { type: ObjectId, ref: 'District', required: true },

    // Vendor types these in by hand, for example "Handmade soaps", "Organic honey"
    servicesProvided: {
      type: [{ type: String, trim: true, minlength: 2, maxlength: 60 }],
      validate: [
        { validator: (v) => v.length > 0, message: 'At least one service is required' },
        { validator: (v) => v.length <= 10, message: 'Maximum 10 services allowed' },
      ],
    },

    gstin: {
      type: String,
      uppercase: true,
      trim: true,
      match: /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
    },
    pan: { type: String, required: true, uppercase: true, trim: true, match: /^[A-Z]{5}\d{4}[A-Z]$/ },

    // Hidden from every query unless asked with .select('+bank')
    bank: {
      type: {
        accountNo: { type: String, required: true },
        ifsc: { type: String, required: true, uppercase: true, match: /^[A-Z]{4}0[A-Z0-9]{6}$/ },
        holderName: { type: String, required: true, trim: true },
      },
      select: false,
    },

    kycDocs: { type: [String], select: false },
    shopImages: {
      type: [String],
      validate: [(v) => v.length > 0, 'At least one shop image is required'],
    },

    socialLinks: {
      instagram: { type: String, trim: true },
      facebook: { type: String, trim: true },
      youtube: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
    },

    status: { type: String, enum: Object.values(VENDOR_STATUS), default: VENDOR_STATUS.PENDING },
    rejectionReason: { type: String, trim: true },
    approvedBy: { type: ObjectId, ref: 'User' },
    approvedAt: { type: Date },

    // null means use the category or platform default
    commissionOverride: { type: Number, min: 0, max: 100, default: null },
  },
  { timestamps: true }
);

// Admin list: filter by status, newest first
vendorSchema.index({ status: 1, createdAt: -1 });
// Admin filter by state and district
vendorSchema.index({ stateId: 1, districtId: 1, status: 1 });
// Same business cannot register twice (GSTIN is optional, so sparse)
vendorSchema.index({ gstin: 1 }, { unique: true, sparse: true });
vendorSchema.index({ pan: 1 }, { unique: true });
// Admin search by business name
vendorSchema.index({ businessName: 'text' });
// Search vendors by what they provide
vendorSchema.index({ servicesProvided: 1 });

module.exports = mongoose.model('Vendor', vendorSchema, 'vendors');