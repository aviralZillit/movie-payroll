import mongoose from 'mongoose';

const rateRowSchema = new mongoose.Schema({
  grade: String,                                    // e.g. "Camera Operator", "1st AC"
  isHeader: { type: Boolean, default: false },      // Section header row
  primaryRate: String,                              // e.g. "4,038/50hr", "£808/10hr"
  secondaryRate: String,                            // e.g. "808/10hr" or note
  weeklyRate: Number,                               // Parsed numeric for comparison
  dailyRate: Number,
  hourlyRate: Number,
  budgetTier: String,                               // e.g. "MMP £30m+", "TV Band 4"
  dealType: String,                                 // e.g. "50hr_week", "55hr_week"
  isIndividuallyNegotiated: { type: Boolean, default: false }, // DOP, Line Producer
  isOwnNegotiation: { type: Boolean, default: false },
}, { _id: false });

const ruleItemSchema = new mongoose.Schema({
  key: String,                                      // e.g. "OT Tier 1", "Turnaround"
  value: String,                                    // e.g. "×1.5 after 8hrs"
  isWarning: { type: Boolean, default: false },     // Orange highlight for compliance risk
}, { _id: false });

const incentiveItemSchema = new mongoose.Schema({
  key: String,
  value: String,
}, { _id: false });

const incentiveSchema = new mongoose.Schema({
  name: String,                                     // e.g. "HETV Tax Credit"
  rate: String,                                     // e.g. "34%"
  items: [incentiveItemSchema],
}, { _id: false });

const rateBibleEntrySchema = new mongoose.Schema(
  {
    territoryCode: { type: String, required: true, index: true },
    agreementId: { type: String, required: true, unique: true }, // e.g. "uk-cam", "us-sag"
    agreementName: { type: String, required: true },
    union: String,                                  // Union body name
    type: { type: String, enum: ['crew', 'performers', 'writers', 'directors', 'post', 'production', 'background', 'vfx', 'bbc'] },
    status: { type: String, enum: ['confirmed', 'not_extracted', 'broken'], default: 'confirmed' },
    access: { type: String, enum: ['public', 'member'], default: 'public' },
    effectiveFrom: Date,
    effectiveTo: Date,
    sourceUrl: String,
    pdfUrl: String,
    holidayPayNote: String,                         // e.g. "HP NOT included — add 12.07%"
    note: String,

    rates: [rateRowSchema],                         // All rate rows for this agreement
    rules: [ruleItemSchema],                        // Working rules for this agreement
    incentives: [incentiveSchema],                  // Tax incentives for this territory

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

rateBibleEntrySchema.index({ territoryCode: 1, status: 1 });
rateBibleEntrySchema.index({ 'rates.grade': 'text', agreementName: 'text' }); // Full-text search

export default mongoose.model('RateBibleEntry', rateBibleEntrySchema);
