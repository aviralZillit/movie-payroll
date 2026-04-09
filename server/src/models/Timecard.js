import mongoose from 'mongoose';

// Audit log entry for field change tracking
const auditEntrySchema = new mongoose.Schema({
  field: String,
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedAt: { type: Date, default: Date.now },
  source: { type: String, enum: ['manual', 'call_sheet', 'gps', 'override', 'system', 'amend'], default: 'manual' },
  reason: String,
}, { _id: false });

const timecardEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  dayOfWeek: { type: Number, required: true },
  dayNumber: { type: Number, default: 1 },

  // ── 4 Universal Time Fields ─────────────────────────────────────
  callTime: String,               // Crew Call — crew's arrival time (editable by crew)
  unitCall: String,               // Unit Call — production start (locked, set by AD)
  unitWrap: String,               // Unit Wrap — production end (locked, set by AD)
  release: String,                // Release — crew's actual departure (editable by crew)
  // Legacy compat: wrapTime maps to release
  wrapTime: String,

  // Meal breaks
  lunchStart: String,
  lunchEnd: String,
  secondMealStart: String,
  secondMealEnd: String,

  // Time source tracking
  source: { type: String, enum: ['manual', 'call_sheet', 'gps', 'override', 'locked'], default: 'manual' },

  // Amendment tracking (for locked fields like unitCall/unitWrap)
  amendReason: String,
  amendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amendedAt: Date,

  // ── Computed Hours ──────────────────────────────────────────────
  totalWorkedHrs: { type: Number, default: 0 },
  straightHrs: { type: Number, default: 0 },
  ot1x5Hrs: { type: Number, default: 0 },
  ot2xHrs: { type: Number, default: 0 },
  nightHrs: { type: Number, default: 0 },

  // ── OT Breakdown (minutes, calculated from deal memo rates) ────
  preCallOTMins: { type: Number, default: 0 },    // crewCall → unitCall
  filmingOTMins: { type: Number, default: 0 },    // beyond contracted hours
  wrapOTMins: { type: Number, default: 0 },        // unitWrap → release
  btaMins: { type: Number, default: 0 },           // below turnaround shortfall
  mealDelayMins: { type: Number, default: 0 },     // meal delay penalty minutes

  // ── Pay Breakdown (per day, calculated from deal memo) ─────────
  basicPay: { type: Number, default: 0 },
  preCallOTPay: { type: Number, default: 0 },
  filmingOTPay: { type: Number, default: 0 },
  wrapOTPay: { type: Number, default: 0 },
  btaPay: { type: Number, default: 0 },
  mealDelayPay: { type: Number, default: 0 },
  nightPremPay: { type: Number, default: 0 },
  dayTotal: { type: Number, default: 0 },

  // ── Penalties ──────────────────────────────────────────────────
  mealPenaltyCount: { type: Number, default: 0 },
  mealPenaltyMinutes: { type: Number, default: 0 },
  turnaroundViolation: { type: Boolean, default: false },
  turnaroundHrs: { type: Number, default: 0 },
  turnaroundShortfallHrs: { type: Number, default: 0 },
  nightShoot: { type: Boolean, default: false },

  // ── Day Type ──────────────────────────────────────────────────
  dayType: { type: String, default: null },

  // ── Flags ─────────────────────────────────────────────────────
  isTravelDay: { type: Boolean, default: false },
  isSixthDay: { type: Boolean, default: false },
  isSeventhDay: { type: Boolean, default: false },
  isHoliday: { type: Boolean, default: false },
  isRestDay: { type: Boolean, default: false },

  // ── Day-Level Approval ────────────────────────────────────────
  dayApproved: { type: Boolean, default: false },
  dayApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dayApprovedAt: Date,

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

    // Weekly hour totals (computed)
    totalStraightHrs: { type: Number, default: 0 },
    totalOt1x5Hrs: { type: Number, default: 0 },
    totalOt2xHrs: { type: Number, default: 0 },
    totalMealPenalties: { type: Number, default: 0 },
    totalTurnaroundPenalties: { type: Number, default: 0 },
    totalNightHrs: { type: Number, default: 0 },
    daysWorked: { type: Number, default: 0 },

    // Weekly pay totals (calculated from deal memo)
    wkBasicPay: { type: Number, default: 0 },
    wkPreCallOTPay: { type: Number, default: 0 },
    wkFilmingOTPay: { type: Number, default: 0 },
    wkWrapOTPay: { type: Number, default: 0 },
    wkBTAPay: { type: Number, default: 0 },
    wkMealPenaltyPay: { type: Number, default: 0 },
    wkNightPremPay: { type: Number, default: 0 },
    wkAllowances: { type: Number, default: 0 },
    wkGross: { type: Number, default: 0 },

    // HETVC / tax credit tracking
    hetvcQualifying: { type: Boolean, default: true },

    entries: [timecardEntrySchema],

    // Audit trail
    auditLog: [auditEntrySchema],

    submittedAt: Date,
    deptApprovedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deptApprovedAt: Date,
    payrollApprovedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payrollApprovedAt: Date,
    rejectionReason: String,
    notes: String,

    schemaVersion: { type: Number, default: 2 },
  },
  { timestamps: true }
);

timecardSchema.index({ productionId: 1, weekStarting: 1 });
timecardSchema.index({ ownerId: 1, weekStarting: 1 });
timecardSchema.index({ status: 1 });

export default mongoose.model('Timecard', timecardSchema);
