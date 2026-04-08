import mongoose from 'mongoose';

const timecardEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  dayOfWeek: { type: Number, required: true },
  dayNumber: { type: Number, default: 1 },
  callTime: String,
  wrapTime: String,
  lunchStart: String,
  lunchEnd: String,
  secondMealStart: String,
  secondMealEnd: String,

  // Computed hours
  totalWorkedHrs: { type: Number, default: 0 },
  straightHrs: { type: Number, default: 0 },
  ot1x5Hrs: { type: Number, default: 0 },
  ot2xHrs: { type: Number, default: 0 },
  nightHrs: { type: Number, default: 0 },

  // Penalties
  mealPenaltyCount: { type: Number, default: 0 },
  mealPenaltyMinutes: { type: Number, default: 0 },
  turnaroundViolation: { type: Boolean, default: false },
  turnaroundShortfallHrs: { type: Number, default: 0 },

  // Day type — crew selects from production's configured day types
  // Free text: "Prep", "Shoot", "Wrap", "Travel", "Turnaround", "Rehearsal", "Recce", "Rest", etc.
  dayType: { type: String, default: null },

  // Flags (some auto-derived from dayType, others from calendar position)
  isTravelDay: { type: Boolean, default: false },
  isSixthDay: { type: Boolean, default: false },
  isSeventhDay: { type: Boolean, default: false },
  isHoliday: { type: Boolean, default: false },
  isRestDay: { type: Boolean, default: false },
  notes: String,
});

const timecardSchema = new mongoose.Schema(
  {
    timecardNumber: { type: String, unique: true, required: true },
    productionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Production', required: true },
    dealMemoId: { type: mongoose.Schema.Types.ObjectId, ref: 'DealMemo', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weekStarting: { type: Date, required: true },
    weekEnding: { type: Date, required: true },

    status: {
      type: String,
      enum: ['draft', 'submitted', 'dept_approved', 'payroll_approved', 'rejected', 'revision_requested'],
      default: 'draft',
    },

    // Weekly totals (computed)
    totalStraightHrs: { type: Number, default: 0 },
    totalOt1x5Hrs: { type: Number, default: 0 },
    totalOt2xHrs: { type: Number, default: 0 },
    totalMealPenalties: { type: Number, default: 0 },
    totalTurnaroundPenalties: { type: Number, default: 0 },
    totalNightHrs: { type: Number, default: 0 },
    daysWorked: { type: Number, default: 0 },

    entries: [timecardEntrySchema],

    submittedAt: Date,
    deptApprovedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deptApprovedAt: Date,
    payrollApprovedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payrollApprovedAt: Date,
    rejectionReason: String,
    notes: String,

    schemaVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

timecardSchema.index({ productionId: 1, weekStarting: 1 });
timecardSchema.index({ ownerId: 1, weekStarting: 1 });
timecardSchema.index({ status: 1 });

export default mongoose.model('Timecard', timecardSchema);
