import mongoose from 'mongoose';

const rateCardSchema = new mongoose.Schema(
  {
    unionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Union', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation', required: true },
    budgetTierId: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetTier', required: true },

    // Deal type — how the weekly rate is structured
    dealType: {
      type: String,
      enum: ['50hr_week', '55hr_week', '60hr_week', 'daily', 'flat_fee', 'session', 'per_episode', 'per_film'],
      default: '55hr_week',
    },
    guaranteedHoursPerWeek: { type: Number }, // 50, 55, 60
    guaranteedHoursPerDay: { type: Number },  // 10, 11, 12

    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date, default: null },

    // Rates
    weeklyRate: { type: Number, required: true },
    dailyRate: { type: Number, required: true },
    hourlyRate: { type: Number, required: true },
    overtimeRate1x5: Number,
    overtimeRate2x: Number,
    sixthDayRate: Number,
    seventhDayRate: Number,
    nightPremiumPct: Number,

    // US TV per-episode fields
    episodeLength: { type: String, enum: ['30min', '60min', '90min', '120min', 'pilot', null], default: null },
    prepDays: Number,
    shootDays: Number,
    overageRate: Number,
    studioRate: Number,   // studio weekly rate (UPM/AD)
    locationRate: Number,  // location weekly rate (UPM/AD)

    // Metadata
    holidayPayInclusive: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sourceUrl: { type: String, required: true },
    sourceDocument: { type: String, required: true },
    notes: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Now includes dealType in the unique compound index
rateCardSchema.index(
  { unionId: 1, departmentId: 1, designationId: 1, budgetTierId: 1, dealType: 1, effectiveFrom: 1 },
  { unique: true }
);
rateCardSchema.index({ isActive: 1, effectiveFrom: -1 });

export default mongoose.model('RateCard', rateCardSchema);
