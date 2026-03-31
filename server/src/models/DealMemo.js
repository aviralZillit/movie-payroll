import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  fromStatus: String,
  toStatus: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
  createdAt: { type: Date, default: Date.now },
});

const dealMemoSchema = new mongoose.Schema(
  {
    dealNumber: { type: String, unique: true, required: true },
    productionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Production', required: true },
    personId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Union & Role
    unionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Union', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation', required: true },
    budgetTierId: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetTier', required: true },

    // Status
    status: {
      type: String,
      enum: ['draft', 'sent', 'negotiating', 'signed', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },

    // Dates
    startDate: { type: Date, required: true },
    endDate: Date,
    guaranteedDays: Number,
    guaranteedWeeks: Number,

    // Rates
    weeklyRate: { type: Number, required: true },
    dailyRate: { type: Number, required: true },
    hourlyRate: { type: Number, required: true },
    payBasis: { type: String, enum: ['weekly', 'daily'], default: 'weekly' },
    rateCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'RateCard' },
    rateCardSourceUrl: String,

    // Overtime
    otRate1x5: Number,
    otRate2x: Number,
    standardWorkDayHrs: { type: Number, default: 11 },
    lunchBreakHrs: { type: Number, default: 1 },

    // Fringes
    holidayPayPct: { type: Number, default: 0.1207 },
    holidayPayInclusive: { type: Boolean, default: false },
    employerNiPct: { type: Number, default: 0.15 },
    employerNiThresholdWeekly: { type: Number, default: 96.15 },
    pensionPct: { type: Number, default: 0.03 },
    apprenticeshipLevyPct: { type: Number, default: 0 },

    // Day premiums
    sixthDayMultiplier: { type: Number, default: 1.5 },
    seventhDayMultiplier: { type: Number, default: 2.0 },
    nightPremiumPct: { type: Number, default: 0.5 },
    nightStartTime: { type: String, default: '23:00' },

    // Meal & turnaround
    mealPenaltyRate: Number,
    mealPenaltyIncrementMin: { type: Number, default: 15 },
    mealPenaltyAfterHrs: { type: Number, default: 6 },
    turnaroundMinHrs: { type: Number, default: 11 },
    turnaroundPenaltyMultiplier: { type: Number, default: 1.5 },

    // Allowances
    kitAllowance: { type: Number, default: 0 },
    kitAllowancePeriod: { type: String, enum: ['daily', 'weekly'], default: 'weekly' },
    travelAllowance: { type: Number, default: 0 },
    perDiemRate: { type: Number, default: 0 },
    phoneAllowance: { type: Number, default: 0 },
    computerAllowance: { type: Number, default: 0 },
    carAllowance: { type: Number, default: 0 },

    // Signature
    signedAt: Date,
    signatureData: mongoose.Schema.Types.Mixed,
    signedDocumentUrl: String,

    notes: String,
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

dealMemoSchema.index({ productionId: 1, status: 1 });
dealMemoSchema.index({ personId: 1 });

export default mongoose.model('DealMemo', dealMemoSchema);
