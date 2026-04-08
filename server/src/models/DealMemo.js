import mongoose from 'mongoose';

// ─── Sub-schemas ─────────────────────────────────────────────────────
const statusHistorySchema = new mongoose.Schema({
  fromStatus: String,
  toStatus: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
  createdAt: { type: Date, default: Date.now },
});

const otTierSchema = new mongoose.Schema({
  label: String,                     // e.g. "OT 1", "OT 2", "Golden Time"
  multiplier: Number,                // e.g. 1.5, 2.0
  triggerAfterHrs: Number,           // e.g. 11, 13, 14
  description: String,               // e.g. "×1.5 after 11hrs"
  isOverridden: { type: Boolean, default: false },
  overrideNote: String,
}, { _id: false });

const allowanceCapSchema = new mongoose.Schema({
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'per-engagement'], default: 'weekly' },
  weeklyCap: Number,
  dailyCap: Number,
  maxDaysPerWeek: Number,
  minDaysForFullRate: Number,
  proRateShortWeeks: { type: Boolean, default: false },
  excludeSundays: { type: Boolean, default: false },
  excludeSaturdays: { type: Boolean, default: false },
  payableOnTravelDays: { type: Boolean, default: true },
  payableOnPrepDays: { type: Boolean, default: true },
}, { _id: false });

const v2AllowanceSchema = new mongoose.Schema({
  key: String,                       // e.g. 'kit', 'car', 'phone', 'custom_1'
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  taxTreatment: { type: String, enum: ['non-taxable', 'taxable-paye', 'partly-exempt'], default: 'non-taxable' },
  nominalCode: { type: String, default: '2340' },
  isVisible: { type: Boolean, default: true }, // visible to crew on timecard
  caps: { type: allowanceCapSchema, default: () => ({}) },
}, { _id: false });

const nominalLineSchema = new mongoose.Schema({
  lineKey: String,                   // e.g. 'basic', 'ot', 'nic', 'kit', 'allowance_car'
  label: String,
  description: String,
  nominalCode: { type: String, default: '2302' },
  costCentre: { type: String, default: 'DEPT' },
  episode: { type: String, default: 'All Episodes' },
  isCore: { type: Boolean, default: false },
  isFringe: { type: Boolean, default: false },
  taxCreditTag: String,              // e.g. 'HETVC', 'SECTION_481', 'US_STATE'
}, { _id: false });

const complianceItemSchema = new mongoose.Schema({
  itemKey: String,
  name: String,
  responsibility: { type: String, enum: ['PRODUCTION', 'CREW UPLOADS', 'OPTIONAL', 'IF APPLICABLE'] },
  isRequired: { type: Boolean, default: false },
  isChecked: { type: Boolean, default: false },
  checkedAt: Date,
  checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

const signingDocumentSchema = new mongoose.Schema({
  filename: String,
  description: String,
  requiresSignature: { type: Boolean, default: true },
  isProductionContract: { type: Boolean, default: false },
  isStandard: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'sent', 'signed', 'declined'], default: 'pending' },
  signedAt: Date,
  signedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  signedIP: String,
  signatureText: String,
  signatureMethod: { type: String, enum: ['typed', 'drawn', 'docusign'], default: 'typed' },
  fileUrl: String,
  fileSize: Number,
}, { _id: false });

const approvalStepSchema = new mongoose.Schema({
  step: { type: Number, required: true },
  approverRole: String,
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  label: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'skipped'], default: 'pending' },
  approvedAt: Date,
  note: String,
}, { _id: false });

// ─── Main schema ─────────────────────────────────────────────────────
const dealMemoSchema = new mongoose.Schema(
  {
    dealNumber: { type: String, unique: true, required: true },
    productionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Production', required: true },
    personId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // ═══ STEP 0: Entity & Territory ═══════════════════════════════════
    contractingEntityId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContractingEntity' },
    territory: String,               // 'UK','US','CA','AU','DE','FR','IE','NZ', etc.
    unionKey: String,                // 'PACT-BECTU','IATSE-BASIC','DGA','SAG-THEATRICAL', etc.
    isCustomDeal: { type: Boolean, default: false },
    screenCredit: String,
    role: String,                    // Free-text role alongside designationId
    reportsTo: String,
    costCentre: String,

    // Union & Classification (existing)
    unionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Union' },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    designationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation' },
    budgetTierId: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetTier' },

    // Country (derived from production — kept for v1 backward compat)
    country: { type: String, default: 'UK' },
    state: String,
    currency: { type: String, default: 'GBP' },

    // ═══ STEP 1: Crew Details ═════════════════════════════════════════
    employmentStatus: String,        // UK: paye/ltd/sole_trader | US: w2/loanout/1099 | AU: payg/pty_ltd/abn | CA: t4/corp/self_employed | FR: cdi/cdd/intermittent | DE: festanstellung/freiberufler/gmbh | ES: fijo/temporal/autonomo
    // Tax ID fields (territory-specific, crew-to-complete)
    niNumber: String,
    taxCode: String,
    starterDeclaration: String,
    p45Received: Boolean,
    ssn: String,
    w4FilingStatus: String,
    stateWithholding: String,
    i9Status: String,
    unionCard: String,
    workAuthorization: String,
    tfn: String,
    abn: String,
    sin: String,
    province: String,
    ppsNumber: String,
    taxId: String,
    // Bank fields (crew-to-complete)
    bankSortCode: String,
    bankAccountNumber: String,
    achRoutingNumber: String,
    achAccountNumber: String,
    bsb: String,
    bankTransit: String,
    bankInstitution: String,
    bankAccount: String,
    iban: String,
    swift: String,
    // Employment-specific
    ltdCompanyName: String,
    ltdCompanyReg: String,
    ir35Status: String,
    corpName: String,
    corpEin: String,
    superFund: String,
    superMemberNumber: String,
    // Personal (crew-to-complete)
    dateOfBirth: Date,
    crewAddress: mongoose.Schema.Types.Mixed,
    emergencyContact: mongoose.Schema.Types.Mixed,

    // Right to Work (replaces old compliance for v3)
    rightToWork: {
      rtwDocType: String,                // Primary auth type (UK Passport, Visa, etc.)
      status: { type: String, enum: ['pending', 'verified', 'expired'], default: 'pending' },
      notes: String,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: Date,
      documents: [{
        docType: String,                 // "Passport", "Visa", "BRP", "Share Code"
        reference: String,               // Doc number / reference
        expiryDate: Date,
        required: { type: Boolean, default: true },
        status: { type: String, enum: ['requested', 'uploaded', 'verified', 'rejected'], default: 'requested' },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        requestedAt: { type: Date, default: Date.now },
        // Crew fills:
        uploadedFile: String,            // original filename
        fileUrl: String,                 // /uploads/xxx.pdf
        fileSize: Number,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: Date,
        // Admin fills:
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: Date,
        rejectionNote: String,
      }],
    },

    // Separate rates toggle — different rates for different day types
    separateRates: { type: Boolean, default: false },
    prepRate: Number,       // rateKey: "prep"
    shootRate: Number,      // rateKey: "shoot"
    wrapRate: Number,       // rateKey: "wrap"
    travelRate: Number,     // rateKey: "travel"

    // ═══ STEP 2: Deal Structure ═══════════════════════════════════════
    dealType: {
      type: String,
      enum: [
        // v1 types (kept for backward compat)
        '50hr_week', '55hr_week', '60hr_week', 'flat_fee', 'session', 'per_episode', 'per_film',
        // v2 types (Kate's)
        'daily', 'weekly', 'hourly', 'flat', 'picture', 'step', 'pop',
      ],
      default: '55hr_week',
    },
    wrapDays: { type: Number, default: 0 },
    travelDays: { type: Number, default: 0 },
    exclusivity: { type: String, enum: ['full', 'first_call', 'none', null], default: null },
    payOrPlay: { type: Boolean, default: false },
    aiContractImportId: String,
    payrollWeekStart: String,        // e.g. 'monday'

    // US-specific fields (existing, kept)
    episodeLength: { type: String, enum: ['30min', '60min', '90min', '120min', 'pilot', null], default: null },
    episodeCount: Number,
    prepDays: Number,
    shootDays: Number,
    postDays: Number,
    programFee: Number,
    overageRate: Number,
    studioOrLocation: { type: String, enum: ['studio', 'location', null], default: null },

    // Status (existing)
    status: {
      type: String,
      enum: ['draft', 'sent', 'negotiating', 'signed', 'pending_approval', 'active', 'completed', 'cancelled', 'issued'],
      default: 'draft',
    },

    // Dates (existing)
    startDate: { type: Date, required: true },
    endDate: Date,
    guaranteedDays: Number,
    guaranteedWeeks: Number,

    // ═══ STEP 3: Rates & Compensation ═════════════════════════════════
    // Existing rate fields (kept for v1 compat)
    guaranteedHoursPerWeek: { type: Number, default: 55 },
    guaranteedHoursPerDay: { type: Number, default: 11 },
    weeklyRate: { type: Number, required: true },
    dailyRate: { type: Number, required: true },
    hourlyRate: { type: Number, required: true },
    payBasis: { type: String, enum: ['weekly', 'daily', 'hourly'], default: 'weekly' },
    rateCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'RateCard' },
    rateCardSourceUrl: String,

    // v2 rate fields
    rateBasis: { type: String, enum: ['daily', 'weekly', 'hourly', null], default: null },
    rateType: { type: String, enum: ['negotiated', 'basic', 'all_in', 'buyout', 'scale', 'scale_plus_10', 'scale_plus_15', null], default: null },
    hpMode: { type: String, enum: ['excl', 'incl', 'na'], default: 'excl' },
    rateVerification: mongoose.Schema.Types.Mixed, // snapshot from rateVerificationService

    // OT (existing v1 fields kept)
    otRate1x5: Number,
    otRate2x: Number,
    standardWorkDayHrs: { type: Number, default: 11 },
    lunchBreakHrs: { type: Number, default: 1 },

    // v2 OT fields
    otMode: { type: String, enum: ['agreement', 'custom'], default: 'agreement' },
    otTiers: [otTierSchema],
    otRateCap: Number,               // UK Camera: 81.82
    goldenTimeEnabled: { type: Boolean, default: false },
    goldenTimeMultiplier: Number,
    goldenTimeAfterHours: Number,

    // Fringes (existing v1 fields kept)
    holidayPayPct: { type: Number, default: 0.1207 },
    holidayPayInclusive: { type: Boolean, default: false },
    employerNiPct: { type: Number, default: 0.15 },
    employerNiThresholdWeekly: { type: Number, default: 96.15 },
    pensionPct: { type: Number, default: 0.03 },
    apprenticeshipLevyPct: { type: Number, default: 0 },

    // v2 fringe fields
    unionPensionPct: Number,         // SAG:0.185, WGA:0.21, DGA:0.06, IATSE:0.075
    hwPerHour: { type: Number, default: 0 }, // IATSE $26-34/hr
    workersCompPct: Number,
    vacationHolidayPct: Number,      // US: 0.08583

    // Day premiums (existing)
    sixthDayMultiplier: { type: Number, default: 1.5 },
    seventhDayMultiplier: { type: Number, default: 2.0 },
    nightPremiumPct: { type: Number, default: 0.5 },
    nightStartTime: { type: String, default: '23:00' },

    // Meal & turnaround (existing)
    mealPenaltyRate: Number,
    mealPenaltyIncrementMin: { type: Number, default: 15 },
    mealPenaltyAfterHrs: { type: Number, default: 6 },
    mealPenaltyAmounts: [Number],    // v2: escalating [25,35,50] for SAG
    mealPaidStatus: { type: String, enum: ['paid', 'unpaid', 'non-deductible', null], default: null },
    turnaroundMinHrs: { type: Number, default: 11 },
    turnaroundPenaltyMultiplier: { type: Number, default: 1.5 },

    // Working day type
    workingDayType: { type: String, enum: ['SWD', 'CWD', 'SCWD', null], default: null },

    // ═══ STEP 4: Allowances (v2 full cap model) ══════════════════════
    allowances: [v2AllowanceSchema],
    allowancesVisibleToCrew: { type: Boolean, default: true },
    delegateCannotSeeAmounts: { type: Boolean, default: false },

    // v1 allowance fields (kept for backward compat)
    kitAllowance: { type: Number, default: 0 },
    kitAllowancePeriod: { type: String, enum: ['daily', 'weekly'], default: 'weekly' },
    travelAllowance: { type: Number, default: 0 },
    perDiemRate: { type: Number, default: 0 },
    phoneAllowance: { type: Number, default: 0 },
    computerAllowance: { type: Number, default: 0 },
    carAllowance: { type: Number, default: 0 },
    productionFee: { type: Number, default: 0 },
    productionFeeBasis: { type: String, enum: ['one_time', 'weekly', 'per_episode', null], default: null },
    idleDays: { type: Number, default: 0 },
    idleDayRate: { type: Number, default: 0 },
    housingAllowance: { type: Number, default: 0 },
    housingAllowancePeriod: { type: String, enum: ['daily', 'weekly', 'monthly', null], default: 'weekly' },
    customAllowances: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      period: { type: String, enum: ['daily', 'weekly', 'monthly', 'one_time'], default: 'weekly' },
    }],

    // ═══ STEP 5: Nominal Coding ══════════════════════════════════════
    nominalLines: [nominalLineSchema],
    taxCreditScheme: String,         // 'HETVC','FTC','SECTION_481','US_STATE','NONE'
    taxCreditIsCore: Boolean,
    taxCreditResidentStatus: { type: String, enum: ['qualifying', 'eea', 'non-qualifying', null], default: null },

    // ═══ STEP 6: Compliance ══════════════════════════════════════════
    complianceChecklist: [complianceItemSchema],

    // ═══ STEP 7: Documents ═══════════════════════════════════════════
    signingDocuments: [signingDocumentSchema],
    signingEnvelopeId: String,

    // ═══ APPROVAL CHAIN ══════════════════════════════════════════════
    approvalStatus: [approvalStepSchema],
    currentApprovalStep: { type: Number, default: 0 },

    // ═══ STEP 8: Payroll Start ═══════════════════════════════════════
    payrollBureau: String,
    payFrequency: { type: String, enum: ['weekly', 'biweekly', 'monthly', null], default: null },
    outstandingFields: [String],
    // Responsibility assignments (free-text names)
    productionAccountant: String,
    payrollAdmin: String,
    hodApprover: String,
    timecardApprover: String,

    // ═══ STEP 9: Preview & Issue ═════════════════════════════════════
    dealReference: String,           // e.g. 'MH-DM-2026-0047'
    issuedAt: Date,
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    crewPortalInviteSentAt: Date,
    timecardActivatedAt: Date,
    costReportLinesGenerated: { type: Boolean, default: false },

    // ═══ Union-Specific Fields (flexible JSON) ════════════════════════
    // Stores all union-specific field values from the deal memo wizard.
    // Shape depends on the union config (e.g. UK_BECTU, US_SAG_AFTRA).
    unionSpecificFields: { type: mongoose.Schema.Types.Mixed, default: {} },

    // ═══ Existing fields ═════════════════════════════════════════════
    signedAt: Date,
    signatureData: mongoose.Schema.Types.Mixed,
    signedDocumentUrl: String,
    notes: String,
    statusHistory: [statusHistorySchema],
    schemaVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

dealMemoSchema.index({ productionId: 1, status: 1 });
dealMemoSchema.index({ personId: 1 });
dealMemoSchema.index({ territory: 1, unionKey: 1 });

export default mongoose.model('DealMemo', dealMemoSchema);
