// src/models/State.js
const { Schema, model } = require('mongoose');

const districtSchema = new Schema(
  {
    districtName: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const stateSchema = new Schema(
  {
    stateCode: { type: String, required: true, uppercase: true, trim: true },
    stateName: { type: String, required: true, trim: true },
    stateType: { type: String, enum: ['STATE', 'UNION_TERRITORY'], default: 'STATE' },
    isActive: { type: Boolean, default: true },
    isOpenForVendors: { type: Boolean, default: false },
    isOpenForCustomers: { type: Boolean, default: false },
    districts: { type: [districtSchema], default: [] },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
stateSchema.index({ stateCode: 1 }, { unique: true });   // lookups + cursor pagination
stateSchema.index({ stateName: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
stateSchema.index({ isActive: 1, isOpenForVendors: 1, stateName: 1 });
stateSchema.index({ isActive: 1, isOpenForCustomers: 1, stateName: 1 });

module.exports = model('State', stateSchema, 'states');