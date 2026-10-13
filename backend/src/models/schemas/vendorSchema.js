const { Schema, model } = require('mongoose');

const CATEGORIES = ['HOMEMADE', 'LOCAL', 'BUSINESS', 'GI'];
const LEVEL_BY_CATEGORY = { HOMEMADE: 'LIGHT', LOCAL: 'STANDARD', BUSINESS: 'FULL', GI: 'FULL' };
const LEVEL_RANK = { LIGHT: 1, STANDARD: 2, FULL: 3 };

const maskKeepLast4 = (v) => (v.length > 4 ? 'X'.repeat(v.length - 4) + v.slice(-4) : v);

// One verification record per document: who verified it and when
const verificationSchema = new Schema(
  {
    isVerified: { type: Boolean, default: false },
    verifiedByAdminId: { type: Schema.Types.ObjectId, ref: 'Admin' },
    verifiedAt: Date,
  },
  { _id: false }
);
const verificationField = { type: verificationSchema, default: () => ({}) };

const vendorSchema = new Schema(
  {
    // ===== Account (filled at signup) =====
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    isEmailVerified: { type: Boolean, default: false },
    passwordHash: { type: String, select: false },
    isActive: { type: Boolean, default: true },               // account lock (admin or security)

    // ===== Login safety =====
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockedUntil: { type: Date, select: false },
    lastLoginAt: Date,
    tokenVersion: { type: Number, default: 0, select: false }, // bump to invalidate old JWTs

    // ===== Business (filled in the vendor form) =====
    businessName: { type: String, trim: true },
    storeName: { type: String, trim: true },
    businessType: { type: String, enum: ['HOME_CHEF', 'SHOP', 'ARTISAN', 'FARMER', 'COMPANY', 'OTHER'] },
    storeDescription: { type: String, trim: true },
    storeLogoUrl: String,                                      // public bucket
    sellsFoodItems: { type: Boolean, default: false },

    // ===== Categories and delivery (single source of truth) =====
    categoryDelivery: {
      type: [{
        _id: false,
        category: { type: String, enum: CATEGORIES, required: true },
        deliveryArea: { type: String, enum: ['DISTRICT_ONLY', 'STATE_ONLY', 'ALL_INDIA'], required: true },
        deliverableDistrictNames: { type: [String], default: [] },
      }],
      default: [],
    },
    documentCheckLevel: { type: String, enum: ['LIGHT', 'STANDARD', 'FULL'] }, // derived in hook

    // ===== Location =====
    state: { type: Schema.Types.ObjectId, ref: 'State' },
    districtName: { type: String, trim: true },
    pickupAddress: {
      addressLine1: { type: String, trim: true },
      addressLine2: { type: String, trim: true },
      cityOrVillage: { type: String, trim: true },
      pincode: { type: String, match: /^\d{6}$/ },
    },

    // ===== Documents =====
    documents: {
      // Aadhaar and PAN: only a keyed hash (for the unique check) and the mask are stored
      aadharDetails: {
        aadharHash: { type: String, select: false },
        maskedAadharNumber: String,
        aadharFileKey: { type: String, select: false },
      },
      panDetails: {
        panHash: { type: String, select: false },
        maskedPanNumber: String,
        panFileKey: { type: String, select: false },
      },

      // GST and FSSAI: business identifiers, stored as given
      gstDetails: {
        gstNumber: {
          type: String, select: false, uppercase: true, trim: true,
          match: /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
        },
        maskedGstNumber: String,
        gstFileKey: { type: String, select: false },
      },
      fssaiDetails: {
        fssaiNumber: { type: String, select: false, match: /^\d{14}$/ },
        maskedFssaiNumber: String,
        fssaiFileKey: { type: String, select: false },
      },

      giPermissions: {
        giCertificateFileKey: { type: String, select: false },
        giProductNames: { type: [String], default: undefined },
      },

      // Admin only: who verified which document, and when
      verification: {
        aadhar: verificationField,
        pan: verificationField,
        gst: verificationField,
        fssai: verificationField,
        gi: verificationField,
      },
    },

    // ===== Bank =====
    bankDetails: {
      accountHolderName: { type: String, trim: true },
      encryptedAccountNumber: { type: String, select: false },  // AES-256-GCM
      maskedAccountNumber: String,
      ifscCode: { type: String, uppercase: true, trim: true, match: /^[A-Z]{4}0[A-Z0-9]{6}$/ },
      bankName: { type: String, trim: true },
      isBankVerified: { type: Boolean, default: false },
    },

    // ===== Approval (admin only) =====
    // DRAFT = form not submitted, PENDING = submitted and waiting for admin
    approvalStatus: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'DRAFT',
    },
    submittedAt: Date,
    approvalHistory: {                                          // admin actions only
      type: [{
        status: { type: String, enum: ['APPROVED', 'REJECTED', 'SUSPENDED'], required: true },
        reason: { type: String, trim: true },
        adminId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
        at: { type: Date, default: Date.now },
      }],
      default: [],
    },

    // ===== Commission and stats =====
    commissionPercent: { type: Number, default: 10, min: 0, max: 100 },  // admin only
    averageRating: { type: Number, default: 0, min: 0, max: 5 },         // server only
    totalRatings: { type: Number, default: 0 },                          // server only
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ===== Hook =====
vendorSchema.pre('validate', function () {
  // 1. Empty strings must never reach the unique indexes
  ['documents.gstDetails.gstNumber', 'documents.fssaiDetails.fssaiNumber'].forEach((path) => {
    if (this.isModified(path) && this.get(path) === '') this.set(path, undefined);
  });

  // 2. Masks for GST and FSSAI (Aadhaar, PAN and bank masks are built in the service)
  [
    ['documents.gstDetails.gstNumber', 'documents.gstDetails.maskedGstNumber'],
    ['documents.fssaiDetails.fssaiNumber', 'documents.fssaiDetails.maskedFssaiNumber'],
  ].forEach(([numberPath, maskPath]) => {
    if (this.isModified(numberPath)) {
      const value = this.get(numberPath);
      this.set(maskPath, value ? maskKeepLast4(value) : undefined);
    }
  });

  // 3. A changed document or bank detail loses its verified status
  if (!this.isNew) {
    [
      { fields: ['documents.aadharDetails.aadharHash', 'documents.aadharDetails.aadharFileKey'], reset: 'documents.verification.aadhar' },
      { fields: ['documents.panDetails.panHash', 'documents.panDetails.panFileKey'], reset: 'documents.verification.pan' },
      { fields: ['documents.gstDetails.gstNumber', 'documents.gstDetails.gstFileKey'], reset: 'documents.verification.gst' },
      { fields: ['documents.fssaiDetails.fssaiNumber', 'documents.fssaiDetails.fssaiFileKey'], reset: 'documents.verification.fssai' },
      { fields: ['documents.giPermissions.giCertificateFileKey'], reset: 'documents.verification.gi' },
    ].forEach(({ fields, reset }) => {
      if (fields.some((p) => this.isModified(p))) this.set(reset, { isVerified: false });
    });

    if (['bankDetails.encryptedAccountNumber', 'bankDetails.ifscCode', 'bankDetails.accountHolderName']
      .some((p) => this.isModified(p))) {
      this.set('bankDetails.isBankVerified', false);
    }
  }

  // 4. Category rules
  const entries = this.categoryDelivery || [];
  const categories = entries.map((e) => e.category);

  if (new Set(categories).size !== categories.length) {
    this.invalidate('categoryDelivery', 'Duplicate categories are not allowed');
  }
  entries.forEach((e, i) => {
    if (e.deliveryArea === 'ALL_INDIA' && e.category !== 'GI') {
      this.invalidate(`categoryDelivery.${i}.deliveryArea`, 'ALL_INDIA is allowed only for GI');
    }
    if (e.deliveryArea === 'DISTRICT_ONLY' && !(e.deliverableDistrictNames || []).length) {
      this.invalidate(`categoryDelivery.${i}.deliverableDistrictNames`, 'Select at least one district');
    }
  });

  // 5. Strictest check level among the chosen categories
  this.documentCheckLevel = categories.length
    ? categories.map((c) => LEVEL_BY_CATEGORY[c]).reduce((a, b) => (LEVEL_RANK[b] > LEVEL_RANK[a] ? b : a))
    : undefined;
});

// ===== Unique indexes =====
// email is already unique through `unique: true` on the field.
[
  'documents.aadharDetails.aadharHash',
  'documents.panDetails.panHash',
  'documents.gstDetails.gstNumber',
  'documents.fssaiDetails.fssaiNumber',
].forEach((path) => {
  vendorSchema.index(
    { [path]: 1 },
    { unique: true, partialFilterExpression: { [path]: { $type: 'string' } } }
  );
});

// Mobile unique among verified vendors
vendorSchema.index(
  { mobile: 1 },
  { unique: true, partialFilterExpression: { isEmailVerified: true } }
);

// ===== Admin and listing queries =====
vendorSchema.index({ state: 1, districtName: 1, approvalStatus: 1 });         // admin filter by location
vendorSchema.index({ approvalStatus: 1, createdAt: 1, _id: 1 });              // pending queue with cursor paging
vendorSchema.index({ 'categoryDelivery.category': 1, approvalStatus: 1 });    // filter by category

module.exports = model('Vendor', vendorSchema, 'vendors');