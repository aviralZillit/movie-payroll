import mongoose from 'mongoose';

const rateCardSchema = new mongoose.Schema(
  {
    unionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Union', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation', required: true },
    budgetTierId: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetTier', required: true },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date, default: null },
    weeklyRate: { type: Number, required: true },
    dailyRate: { type: Number, required: true },
    hourlyRate: { type: Number, required: true },
    overtimeRate1x5: Number,
    overtimeRate2x: Number,
    sixthDayRate: Number,
    seventhDayRate: Number,
    nightPremiumPct: Number,
    holidayPayInclusive: { type: Boolean, default: false },
    sourceUrl: { type: String, required: true },
    sourceDocument: { type: String, required: true },
    notes: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

rateCardSchema.index(
  { unionId: 1, departmentId: 1, designationId: 1, budgetTierId: 1, effectiveFrom: 1 },
  { unique: true }
);
rateCardSchema.index({ isActive: 1, effectiveFrom: -1 });

export default mongoose.model('RateCard', rateCardSchema);
