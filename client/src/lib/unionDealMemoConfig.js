// =============================================================================
// Union-Specific Deal Memo Field Configuration
// =============================================================================
// Single source of truth for what union-specific fields appear at each wizard
// step. These fields are ADDITIONS to the common fields — they do NOT replace
// the standard deal memo fields rendered by each step component.
//
// Field definition shape:
//   key          - form field key (stored under unionFields.{key})
//   label        - human-readable label
//   type         - text | number | currency | select | boolean | date |
//                  percentage | multi_select
//   options      - array of { value, label } for select / multi_select
//   default      - default value
//   required     - whether the field is required
//   helpText     - optional tooltip / helper text
//   placeholder  - optional placeholder
//   colSpan      - 1 = half width (default), 2 = full width
// =============================================================================

// ---------------------------------------------------------------------------
// Helper: build simple option list from string array
// ---------------------------------------------------------------------------
const opts = (arr) => arr.map((v) => ({ value: v, label: v }));

// ---------------------------------------------------------------------------
// UK_BECTU — PACT/BECTU Crew
// ---------------------------------------------------------------------------
const UK_BECTU = {
  unionId: 'UK_BECTU',
  label: 'PACT/BECTU Crew',
  territory: 'UK',
  currency: 'GBP',
  steps: {
    step0: [],
    // Union-specific classification fields moved to step1 so they show AFTER Continue
    step1: [
      {
        key: 'agreementType',
        label: 'Agreement Type',
        type: 'select',
        options: opts(['MMP', 'HETV', 'TV', 'Scripted']),
        required: true,
        helpText: 'Major Motion Picture, High-End TV, TV, or Scripted',
      },
      {
        key: 'branch',
        label: 'Branch',
        type: 'text',
        placeholder: 'e.g. Camera, Sound, Art Dept',
      },
      {
        key: 'hodStatus',
        label: 'Head of Department',
        type: 'boolean',
        default: false,
        helpText: 'Is this person a Head of Department?',
      },
    ],
    step2: [
      // UK uses "length of engagement" + "notice period", NOT "guaranteed weeks" (that's US)
      {
        key: 'engagementLengthWeeks',
        label: 'Length of Engagement (weeks)',
        type: 'number',
        placeholder: 'e.g. 12',
        helpText: 'Fixed-term engagement period',
      },
      {
        key: 'noticePeriodWeeks',
        label: 'Notice Period (weeks)',
        type: 'number',
        placeholder: 'e.g. 2',
        default: 2,
        helpText: 'Required notice before ending engagement',
      },
      {
        key: 'dailyOrWeekly',
        label: 'Daily or Weekly Engagement',
        type: 'select',
        options: opts(['Daily', 'Weekly']),
        default: 'Weekly',
        helpText: 'Dailies get pro-rata box rental and holiday pay uplift',
      },
    ],
    // BECTU-specific: OT rate auto-calculates, Max OT comes from territory rule.
    // Shown as read-only info, not manual input.
    step3: [
      {
        key: 'overtimeRateHourly',
        label: 'Overtime Rate (per hour)',
        type: 'currency',
        helpText: 'Auto-calculated from your weekly/daily rate ÷ standard hours. Camera: 2x in 15-min increments.',
      },
    ],
    // step4: Union-specific allowance SUGGESTIONS (shown as quick-add chips)
    // These aren't separate form fields — they're pre-filled names for the common allowances array
    allowanceSuggestions: [
      { name: 'Box Rental', frequency: 'weekly' },
      { name: 'Kit Allowance', frequency: 'weekly' },
      { name: 'Computer Rental', frequency: 'weekly' },
      { name: 'Phone Allowance', frequency: 'weekly' },
      { name: 'Car Allowance', frequency: 'weekly' },
      { name: 'Travel Allowance', frequency: 'daily' },
      { name: 'Per Diem', frequency: 'daily' },
      { name: 'Overnight Allowance', frequency: 'daily' },
    ],
    step4: [],
  },
  defaults: {
    noticePeriodWeeks: 2,
    // HP defaults are set in common fields, not union-specific
  },
};

// ---------------------------------------------------------------------------
// UK_EQUITY — Equity Performers
// ---------------------------------------------------------------------------
const UK_EQUITY = {
  unionId: 'UK_EQUITY',
  label: 'Equity Performers',
  territory: 'UK',
  currency: 'GBP',
  steps: {
    step0: [
      {
        key: 'agreementType',
        label: 'Agreement Type',
        type: 'select',
        options: opts(['CFA', 'LBF', 'VLBF', 'TV Drama', 'BBC', 'ITV', 'SA']),
        required: true,
        helpText: 'Cinema Films Agreement, Low Budget Film, Very Low Budget Film, etc.',
      },
      {
        key: 'performerCategory',
        label: 'Performer Category',
        type: 'select',
        options: opts(['Principal', 'Day Player', 'Supporting Artist', 'Walk-On', 'Stand-In', 'Stunt']),
        required: true,
      },
      {
        key: 'useType',
        label: 'Use Type',
        type: 'select',
        options: opts(['Pre-Purchase', 'Specific Territory']),
        helpText: 'How the performance will be exploited',
      },
    ],
    step1: [],
    step2: [
      {
        key: 'consecutiveEmployment',
        label: 'Consecutive Employment',
        type: 'boolean',
        default: false,
        helpText: 'Whether employment days must be consecutive',
      },
      {
        key: 'guaranteedDays',
        label: 'Guaranteed Days',
        type: 'number',
        placeholder: 'e.g. 10',
      },
      {
        key: 'fittingDaysIncluded',
        label: 'Fitting Days Included',
        type: 'number',
        placeholder: 'e.g. 2',
      },
      {
        key: 'fittingRatePercentage',
        label: 'Fitting Rate %',
        type: 'percentage',
        default: 50,
        helpText: 'Percentage of performance fee paid for fitting days',
      },
      {
        key: 'rehearsalDays',
        label: 'Rehearsal Days',
        type: 'number',
        placeholder: 'e.g. 3',
      },
      {
        key: 'postSyncDays',
        label: 'Post-Sync / ADR Days',
        type: 'number',
        placeholder: 'e.g. 1',
      },
      {
        key: 'useFeeStructure',
        label: 'Use Fee Structure',
        type: 'select',
        options: opts(['Buyout', 'Residuals', 'NPP']),
        helpText: 'Buyout, Residuals, or Net Profit Participation',
      },
      {
        key: 'netProfitSharePercentage',
        label: 'Net Profit Share %',
        type: 'percentage',
        placeholder: 'e.g. 2.5',
      },
      {
        key: 'repeatFeeApplicable',
        label: 'Repeat Fee Applicable',
        type: 'boolean',
        default: false,
      },
    ],
    step3: [
      {
        key: 'dailyPerformanceFee',
        label: 'Daily Performance Fee',
        type: 'currency',
      },
      {
        key: 'weeklyPerformanceFee',
        label: 'Weekly Performance Fee',
        type: 'currency',
      },
      {
        key: 'fittingRateDaily',
        label: 'Fitting Rate (daily)',
        type: 'currency',
      },
      {
        key: 'rehearsalRateDaily',
        label: 'Rehearsal Rate (daily)',
        type: 'currency',
      },
      {
        key: 'postSyncRateDaily',
        label: 'Post-Sync Rate (daily)',
        type: 'currency',
      },
      {
        key: 'overtimeRateHourly',
        label: 'Overtime Rate (per hour)',
        type: 'currency',
      },
      {
        key: 'useFee',
        label: 'Use Fee',
        type: 'currency',
        helpText: 'Total use/buyout fee for exploitation rights',
      },
      {
        key: 'stuntLoadingPercentage',
        label: 'Stunt Loading %',
        type: 'percentage',
        helpText: 'Additional percentage for stunt work',
      },
    ],
    step4: [
      {
        key: 'costumeAllowance',
        label: 'Costume Allowance',
        type: 'currency',
      },
      {
        key: 'wigAllowance',
        label: 'Wig Allowance',
        type: 'currency',
      },
      {
        key: 'overnightAllowance',
        label: 'Overnight Allowance',
        type: 'currency',
      },
      {
        key: 'travelClass',
        label: 'Travel Class',
        type: 'select',
        options: opts(['Standard', 'First Class']),
        default: 'Standard',
      },
    ],
    allowanceSuggestions: [
      { name: 'Costume Allowance', frequency: 'weekly' },
      { name: 'Wig Allowance', frequency: 'weekly' },
      { name: 'Travel Allowance', frequency: 'daily' },
      { name: 'Overnight Allowance', frequency: 'daily' },
      { name: 'Per Diem', frequency: 'daily' },
    ],
  },
  defaults: {
    fittingRatePercentage: 50,
    travelClass: 'Standard',
  },
};

// ---------------------------------------------------------------------------
// UK_DIRECTORS_UK — Directors UK
// ---------------------------------------------------------------------------
const UK_DIRECTORS_UK = {
  unionId: 'UK_DIRECTORS_UK',
  label: 'Directors UK',
  territory: 'UK',
  currency: 'GBP',
  steps: {
    step0: [
      {
        key: 'agreementType',
        label: 'Agreement Type',
        type: 'select',
        options: opts(['TV Drama', 'Film', 'Commercial']),
        required: true,
      },
    ],
    step1: [],
    step2: [
      {
        key: 'feeStructure',
        label: 'Fee Structure',
        type: 'select',
        options: opts(['Lump Fee', 'Weekly', 'Episodic']),
      },
      {
        key: 'guaranteedPrepDays',
        label: 'Guaranteed Prep Days',
        type: 'number',
        placeholder: 'e.g. 10',
      },
      {
        key: 'guaranteedShootDays',
        label: 'Guaranteed Shoot Days',
        type: 'number',
        placeholder: 'e.g. 20',
      },
      {
        key: 'guaranteedEditingDays',
        label: 'Guaranteed Editing Days',
        type: 'number',
        placeholder: 'e.g. 5',
      },
      {
        key: 'directorsCutRight',
        label: "Director's Cut Right",
        type: 'boolean',
        default: false,
      },
      {
        key: 'consultationOnFinalCut',
        label: 'Consultation on Final Cut',
        type: 'boolean',
        default: false,
      },
      {
        key: 'creditPosition',
        label: 'Credit Position',
        type: 'select',
        options: opts(['Main Title Single', 'Shared', 'End']),
      },
      {
        key: 'residualsApplicable',
        label: 'Residuals Applicable',
        type: 'boolean',
        default: false,
      },
    ],
    step3: [
      {
        key: 'directorsFee',
        label: "Director's Fee",
        type: 'currency',
      },
      {
        key: 'perEpisodeFee',
        label: 'Per Episode Fee',
        type: 'currency',
      },
      {
        key: 'additionalDayRate',
        label: 'Additional Day Rate',
        type: 'currency',
      },
    ],
    step4: [],
    allowanceSuggestions: [
      { name: 'Travel Allowance', frequency: 'daily' },
      { name: 'Per Diem', frequency: 'daily' },
      { name: 'Accommodation', frequency: 'daily' },
    ],
  },
  defaults: {},
};

// ---------------------------------------------------------------------------
// UK_WGGB — Writers' Guild of Great Britain
// ---------------------------------------------------------------------------
const UK_WGGB = {
  unionId: 'UK_WGGB',
  label: "Writers' Guild of Great Britain",
  territory: 'UK',
  currency: 'GBP',
  steps: {
    step0: [
      {
        key: 'agreementType',
        label: 'Agreement Type',
        type: 'select',
        options: opts(['BBC', 'PACT', 'Netflix', 'ITV']),
        required: true,
      },
      {
        key: 'programmeFormat',
        label: 'Programme Format',
        type: 'select',
        options: opts(['Original', 'Series', 'Dramatization', 'Adaptation', 'Feature Film']),
      },
      {
        key: 'programmeDurationMinutes',
        label: 'Programme Duration (minutes)',
        type: 'number',
        placeholder: 'e.g. 60',
      },
    ],
    step1: [],
    step2: [
      {
        key: 'scriptFeeStructure',
        label: 'Script Fee Structure',
        type: 'select',
        options: opts(['Per Script', 'Series', 'Step Deal']),
      },
      {
        key: 'scriptSteps',
        label: 'Script Steps',
        type: 'multi_select',
        options: opts(['Treatment', 'First Draft', 'Second Draft', 'Polish', 'Final Draft']),
      },
      {
        key: 'paymentTriggers',
        label: 'Payment Triggers',
        type: 'multi_select',
        options: opts(['Commencement', 'Delivery', 'Acceptance', 'First Day of Principal Photography', 'Broadcast']),
      },
      {
        key: 'residualsBasis',
        label: 'Residuals Basis',
        type: 'select',
        options: opts(['Gross Receipts', 'Repeat Fees', 'Extract Fees']),
      },
      {
        key: 'repeatFeeApplicable',
        label: 'Repeat Fee Applicable',
        type: 'boolean',
        default: false,
      },
    ],
    step3: [
      {
        key: 'scriptFeeTotal',
        label: 'Script Fee Total',
        type: 'currency',
      },
      {
        key: 'perStepFee',
        label: 'Per Step Fee',
        type: 'currency',
      },
      {
        key: 'repeatFeePerTransmission',
        label: 'Repeat Fee Per Transmission',
        type: 'currency',
      },
      {
        key: 'residualPercentage',
        label: 'Residual %',
        type: 'percentage',
      },
    ],
    step4: [
      {
        key: 'attendanceAllowanceDaily',
        label: 'Attendance Allowance (daily)',
        type: 'currency',
      },
      {
        key: 'travelExpenses',
        label: 'Travel Expenses Covered',
        type: 'boolean',
        default: false,
      },
    ],
    allowanceSuggestions: [
      { name: 'Travel Expenses', frequency: 'daily' },
      { name: 'Accommodation', frequency: 'daily' },
      { name: 'Research Expenses', frequency: 'weekly' },
    ],
  },
  defaults: {},
};

// ---------------------------------------------------------------------------
// UK_MU — Musicians' Union
// ---------------------------------------------------------------------------
const UK_MU = {
  unionId: 'UK_MU',
  label: "Musicians' Union",
  territory: 'UK',
  currency: 'GBP',
  steps: {
    step0: [
      {
        key: 'agreementType',
        label: 'Agreement Type',
        type: 'select',
        options: opts(['Film TV Session', 'Recording Pop', 'Recording Classical', 'Theatre']),
        required: true,
      },
      {
        key: 'instrumentGroup',
        label: 'Instrument Group',
        type: 'select',
        options: [
          { value: 'A', label: 'A - Strings, Woodwind, Brass' },
          { value: 'B', label: 'B - Keyboards, Harp, Guitar' },
          { value: 'C', label: 'C - Percussion, Timpani' },
          { value: 'D', label: 'D - Synthesiser, Electronic' },
          { value: 'E', label: 'E - Other / Specialist' },
        ],
      },
      {
        key: 'primaryInstrument',
        label: 'Primary Instrument',
        type: 'text',
        placeholder: 'e.g. Violin, French Horn',
      },
    ],
    step1: [],
    step2: [
      {
        key: 'sessionType',
        label: 'Session Type',
        type: 'select',
        options: [
          { value: 'Basic 3hr', label: 'Basic Session (3 hours)' },
          { value: 'Double 6hr', label: 'Double Session (6 hours)' },
          { value: 'Film', label: 'Film Session' },
          { value: 'Overdub', label: 'Overdub Session' },
        ],
      },
      {
        key: 'numberOfSessions',
        label: 'Number of Sessions',
        type: 'number',
        placeholder: 'e.g. 4',
      },
      {
        key: 'doubling',
        label: 'Doubling',
        type: 'boolean',
        default: false,
        helpText: 'Playing a second instrument',
      },
      {
        key: 'doublingFeePercentage',
        label: 'Doubling Fee %',
        type: 'percentage',
        default: 15,
      },
      {
        key: 'trebling',
        label: 'Trebling',
        type: 'boolean',
        default: false,
        helpText: 'Playing a third instrument',
      },
    ],
    step3: [
      {
        key: 'sessionFee',
        label: 'Session Fee',
        type: 'currency',
      },
      {
        key: 'hourlyRate',
        label: 'Hourly Rate',
        type: 'currency',
      },
      {
        key: 'doublingFee',
        label: 'Doubling Fee',
        type: 'currency',
      },
      {
        key: 'overdubFee',
        label: 'Overdub Fee',
        type: 'currency',
      },
      {
        key: 'unsocialHoursUplift',
        label: 'Unsocial Hours Uplift',
        type: 'currency',
        helpText: 'Premium for recording outside standard hours',
      },
    ],
    step4: [
      {
        key: 'porterageFee',
        label: 'Porterage Fee',
        type: 'currency',
        helpText: 'Fee for transporting large instruments',
      },
      {
        key: 'cartageFee',
        label: 'Cartage Fee',
        type: 'currency',
      },
      {
        key: 'instrumentHireFee',
        label: 'Instrument Hire Fee',
        type: 'currency',
      },
      {
        key: 'storageAllowance',
        label: 'Storage Allowance',
        type: 'currency',
      },
    ],
    allowanceSuggestions: [
      { name: 'Porterage', frequency: 'daily' },
      { name: 'Cartage', frequency: 'daily' },
      { name: 'Instrument Hire', frequency: 'weekly' },
      { name: 'Travel Allowance', frequency: 'daily' },
      { name: 'Per Diem', frequency: 'daily' },
    ],
  },
  defaults: {
    doublingFeePercentage: 15,
  },
};

// ---------------------------------------------------------------------------
// US_SAG_AFTRA — Screen Actors Guild / AFTRA
// ---------------------------------------------------------------------------
const US_SAG_AFTRA = {
  unionId: 'US_SAG_AFTRA',
  label: 'SAG-AFTRA',
  territory: 'US',
  currency: 'USD',
  steps: {
    step0: [
      {
        key: 'contractType',
        label: 'Contract Type',
        type: 'select',
        options: opts([
          'Theatrical', 'TV', 'HBSVOD', 'New Media', 'Short Film',
          'Ultra Low', 'Modified Low', 'Low Budget', 'Student', 'Commercials',
        ]),
        required: true,
      },
      {
        key: 'performerCategory',
        label: 'Performer Category',
        type: 'select',
        options: opts([
          'Series Regular', 'Recurring', 'Guest Star', 'Co-Star',
          'Day Player', 'Weekly', 'Stunt', 'Background', 'Stand-In',
        ]),
        required: true,
      },
      {
        key: 'schedule',
        label: 'Schedule',
        type: 'select',
        options: [
          { value: 'F', label: 'Schedule F - Theatrical' },
          { value: 'H', label: 'Schedule H - Television' },
          { value: 'J', label: 'Schedule J - New Media' },
          { value: 'K', label: 'Schedule K - Made for SVOD' },
        ],
        helpText: 'SAG-AFTRA rate schedule',
      },
    ],
    step1: [
      {
        key: 'sagAftraId',
        label: 'SAG-AFTRA ID',
        type: 'text',
        placeholder: 'e.g. 123456789',
      },
      {
        key: 'station12Clearance',
        label: 'Station 12 Clearance',
        type: 'boolean',
        default: false,
        helpText: 'Has this performer been cleared by Station 12?',
      },
      {
        key: 'taftHartley',
        label: 'Taft-Hartley',
        type: 'boolean',
        default: false,
        helpText: 'Is this a Taft-Hartley hire (non-union joining under 30-day rule)?',
      },
      {
        key: 'loanoutCorporation',
        label: 'Loan-Out Corporation',
        type: 'text',
        placeholder: 'e.g. Actor Corp LLC',
      },
      {
        key: 'agencyName',
        label: 'Agency Name',
        type: 'text',
        placeholder: 'e.g. CAA, WME',
      },
      {
        key: 'agencyCommissionPercentage',
        label: 'Agency Commission %',
        type: 'percentage',
        default: 10,
      },
    ],
    step2: [
      {
        key: 'scaleOrOverscale',
        label: 'Scale / Overscale',
        type: 'select',
        options: opts(['Scale', 'Scale+10', 'Overscale']),
      },
      {
        key: 'programFeeApplicable',
        label: 'Program Fee Applicable',
        type: 'boolean',
        default: false,
      },
      {
        key: 'consecutiveEmployment',
        label: 'Consecutive Employment',
        type: 'boolean',
        default: false,
      },
      {
        key: 'guaranteedDaysOrWeeks',
        label: 'Guaranteed Days/Weeks',
        type: 'number',
        placeholder: 'e.g. 5',
      },
      {
        key: 'studioZone',
        label: 'Studio Zone',
        type: 'select',
        options: opts(['Hollywood TMZ', 'New York', 'Other']),
      },
      {
        key: 'distantLocation',
        label: 'Distant Location',
        type: 'boolean',
        default: false,
      },
      {
        key: 'forcedCallRestPeriodHours',
        label: 'Forced Call Rest Period (hours)',
        type: 'number',
        default: 12,
      },
      {
        key: 'fittingDays',
        label: 'Fitting Days',
        type: 'number',
        placeholder: 'e.g. 2',
      },
      {
        key: 'fittingRateType',
        label: 'Fitting Rate Type',
        type: 'select',
        options: opts(['Half Check', 'Full Check']),
      },
      {
        key: 'residualsStructure',
        label: 'Residuals Structure',
        type: 'select',
        options: opts(['Traditional', 'HBSVOD Fixed', 'Streaming Fund']),
      },
    ],
    step3: [
      {
        key: 'dailyRate',
        label: 'Daily Rate',
        type: 'currency',
      },
      {
        key: 'weeklyRate',
        label: 'Weekly Rate',
        type: 'currency',
      },
      {
        key: 'programFee',
        label: 'Program Fee',
        type: 'currency',
      },
      {
        key: 'fittingRate',
        label: 'Fitting Rate',
        type: 'currency',
      },
      {
        key: 'overtimeRateHourly',
        label: 'Overtime Rate (per hour)',
        type: 'currency',
      },
      {
        key: 'goldenTimeRate',
        label: 'Golden Time Rate',
        type: 'currency',
        helpText: 'Penalty rate after 16 hours',
      },
      {
        key: 'stuntAdjustment',
        label: 'Stunt Adjustment',
        type: 'currency',
      },
    ],
    step4: [
      {
        key: 'perDiem',
        label: 'Per Diem',
        type: 'currency',
      },
      {
        key: 'mileageRate',
        label: 'Mileage Rate',
        type: 'currency',
        helpText: 'Per mile reimbursement rate',
      },
      {
        key: 'travelClass',
        label: 'Travel Class',
        type: 'select',
        options: opts(['Economy', 'Business', 'First']),
      },
      {
        key: 'housingAllowanceWeekly',
        label: 'Housing Allowance (weekly)',
        type: 'currency',
      },
      {
        key: 'cellPhoneAllowance',
        label: 'Cell Phone Allowance',
        type: 'currency',
      },
    ],
    allowanceSuggestions: [
      { name: 'Per Diem', frequency: 'daily' },
      { name: 'Housing Allowance', frequency: 'weekly' },
      { name: 'Cell Phone Allowance', frequency: 'weekly' },
      { name: 'Mileage Reimbursement', frequency: 'daily' },
      { name: 'Ground Transportation', frequency: 'daily' },
    ],
  },
  defaults: {
    agencyCommissionPercentage: 10,
    forcedCallRestPeriodHours: 12,
  },
};

// ---------------------------------------------------------------------------
// US_DGA — Directors Guild of America
// ---------------------------------------------------------------------------
const US_DGA = {
  unionId: 'US_DGA',
  label: 'DGA',
  territory: 'US',
  currency: 'USD',
  steps: {
    step0: [
      {
        key: 'agreementType',
        label: 'Agreement Type',
        type: 'select',
        options: opts(['Theatrical', 'TV 30min', 'TV 60min', 'TV 90min+', 'Pilot', 'Commercial']),
        required: true,
      },
    ],
    step1: [],
    step2: [
      {
        key: 'feeStructure',
        label: 'Fee Structure',
        type: 'select',
        options: opts(['Lump', 'Weekly', 'Episodic']),
      },
      {
        key: 'guaranteedPrepDays',
        label: 'Guaranteed Prep Days',
        type: 'number',
        placeholder: 'e.g. 10',
      },
      {
        key: 'guaranteedShootDays',
        label: 'Guaranteed Shoot Days',
        type: 'number',
        placeholder: 'e.g. 20',
      },
      {
        key: 'guaranteedPostDays',
        label: 'Guaranteed Post Days',
        type: 'number',
        placeholder: 'e.g. 10',
      },
      {
        key: 'directorsCutRight',
        label: "Director's Cut Right",
        type: 'boolean',
        default: false,
      },
      {
        key: 'creditPosition',
        label: 'Credit Position',
        type: 'text',
        placeholder: 'e.g. Single Main Title Card',
      },
      {
        key: 'additionalDaysRate',
        label: 'Additional Days Rate',
        type: 'currency',
      },
    ],
    step3: [
      {
        key: 'directorsFee',
        label: "Director's Fee",
        type: 'currency',
      },
      {
        key: 'episodicFee',
        label: 'Episodic Fee',
        type: 'currency',
      },
      {
        key: 'weeklyRate',
        label: 'Weekly Rate',
        type: 'currency',
      },
      {
        key: 'additionalDayRate',
        label: 'Additional Day Rate',
        type: 'currency',
      },
      {
        key: 'distantLocationFeeDaily',
        label: 'Distant Location Fee (daily)',
        type: 'currency',
        default: 60,
      },
    ],
    step4: [
      {
        key: 'perDiem',
        label: 'Per Diem',
        type: 'currency',
      },
      {
        key: 'travelClass',
        label: 'Travel Class',
        type: 'select',
        options: opts(['Economy', 'Business', 'First']),
      },
      {
        key: 'housingProvided',
        label: 'Housing Provided',
        type: 'boolean',
        default: false,
      },
    ],
    allowanceSuggestions: [
      { name: 'Per Diem', frequency: 'daily' },
      { name: 'Ground Transportation', frequency: 'daily' },
      { name: 'Accommodation', frequency: 'daily' },
    ],
  },
  defaults: {
    distantLocationFeeDaily: 60,
  },
};

// ---------------------------------------------------------------------------
// US_IATSE — International Alliance of Theatrical Stage Employees
// ---------------------------------------------------------------------------
const US_IATSE = {
  unionId: 'US_IATSE',
  label: 'IATSE',
  territory: 'US',
  currency: 'USD',
  steps: {
    step0: [
      {
        key: 'localNumber',
        label: 'Local Number',
        type: 'text',
        placeholder: 'e.g. Local 600, Local 728',
        helpText: 'IATSE local union number',
      },
      {
        key: 'agreementType',
        label: 'Agreement Type',
        type: 'select',
        options: opts(['Basic', 'Area Standards']),
      },
    ],
    step1: [],
    step2: [
      {
        key: 'studioOrLocation',
        label: 'Studio or Location',
        type: 'select',
        options: opts(['Studio', 'Location', 'Nearby']),
      },
      {
        key: 'guaranteedHoursPerDay',
        label: 'Guaranteed Hours Per Day',
        type: 'number',
        default: 8,
      },
      {
        key: 'weeklyGuarantee',
        label: 'Weekly Guarantee (hours)',
        type: 'number',
        placeholder: 'e.g. 50',
      },
      // 6th/7th day multipliers come from Territory Rule — not per deal
    ],
    step3: [
      {
        key: 'weeklyRate',
        label: 'Weekly Rate',
        type: 'currency',
      },
      {
        key: 'dailyRate',
        label: 'Daily Rate',
        type: 'currency',
      },
      {
        key: 'hourlyRate',
        label: 'Hourly Rate',
        type: 'currency',
      },
      {
        key: 'hwPerHour',
        label: 'H&W Per Hour',
        type: 'currency',
        helpText: 'Health & Welfare contribution per hour worked',
      },
      {
        key: 'pensionPercentage',
        label: 'Pension %',
        type: 'percentage',
        helpText: 'IATSE pension contribution percentage',
      },
    ],
    step4: [
      {
        key: 'boxRentalWeekly',
        label: 'Box Rental (weekly)',
        type: 'currency',
      },
      {
        key: 'kitAllowanceWeekly',
        label: 'Kit Allowance (weekly)',
        type: 'currency',
      },
      {
        key: 'mileageRate',
        label: 'Mileage Rate',
        type: 'currency',
      },
      {
        key: 'perDiem',
        label: 'Per Diem',
        type: 'currency',
      },
    ],
    allowanceSuggestions: [
      { name: 'Box Rental', frequency: 'weekly' },
      { name: 'Kit Allowance', frequency: 'weekly' },
      { name: 'Per Diem', frequency: 'daily' },
      { name: 'Mileage Reimbursement', frequency: 'daily' },
      { name: 'Cell Phone Allowance', frequency: 'weekly' },
      { name: 'Computer Rental', frequency: 'weekly' },
    ],
  },
  defaults: {
    guaranteedHoursPerDay: 8,
  },
};

// ---------------------------------------------------------------------------
// US_WGA — Writers Guild of America
// ---------------------------------------------------------------------------
const US_WGA = {
  unionId: 'US_WGA',
  label: 'WGA',
  territory: 'US',
  currency: 'USD',
  steps: {
    step0: [
      {
        key: 'agreementType',
        label: 'Agreement Type',
        type: 'select',
        options: opts(['Theatrical', 'TV 30min', 'TV 60min', 'Streaming', 'Low Budget']),
        required: true,
      },
      {
        key: 'writerCategory',
        label: 'Writer Category',
        type: 'select',
        options: opts(['Solo Writer', 'Writing Team', 'Staff Writer', 'Co-Producer Writer', 'Showrunner']),
      },
    ],
    step1: [],
    step2: [
      {
        key: 'scriptSteps',
        label: 'Script Steps',
        type: 'multi_select',
        options: opts(['Story', 'Treatment', 'First Draft', 'Second Draft', 'Polish', 'Rewrite', 'Final Draft']),
      },
      {
        key: 'paymentTriggers',
        label: 'Payment Triggers',
        type: 'multi_select',
        options: opts(['Commencement', 'Delivery', 'Acceptance', 'Production']),
      },
      {
        key: 'separatedRights',
        label: 'Separated Rights',
        type: 'boolean',
        default: false,
        helpText: 'Does the writer retain separated rights under WGA MBA?',
      },
      {
        key: 'screenplayCredit',
        label: 'Screenplay Credit',
        type: 'text',
        placeholder: 'e.g. Written By, Screenplay By',
      },
      {
        key: 'residualsStructure',
        label: 'Residuals Structure',
        type: 'text',
        placeholder: 'e.g. WGA MBA Standard',
      },
    ],
    step3: [
      {
        key: 'scriptFeeMinimum',
        label: 'Script Fee (minimum)',
        type: 'currency',
      },
      {
        key: 'perStepFee',
        label: 'Per Step Fee',
        type: 'currency',
      },
      {
        key: 'weeklyRate',
        label: 'Weekly Rate (staff)',
        type: 'currency',
        helpText: 'For staff writers only',
      },
      {
        key: 'residualPercentage',
        label: 'Residual %',
        type: 'percentage',
      },
    ],
    step4: [
      {
        key: 'travelExpenses',
        label: 'Travel Expenses Covered',
        type: 'boolean',
        default: false,
      },
    ],
    allowanceSuggestions: [
      { name: 'Travel Expenses', frequency: 'daily' },
      { name: 'Accommodation', frequency: 'daily' },
    ],
  },
  defaults: {},
};

// ---------------------------------------------------------------------------
// AU_MEAA — Media, Entertainment & Arts Alliance (Australia)
// ---------------------------------------------------------------------------
const AU_MEAA = {
  unionId: 'AU_MEAA',
  label: 'MEAA (Australia)',
  territory: 'AU',
  currency: 'AUD',
  steps: {
    step0: [
      {
        key: 'agreementType',
        label: 'Agreement Type',
        type: 'select',
        options: opts(['MPPA', 'BRECA', 'Offshore']),
        required: true,
        helpText: 'Motion Picture Production Agreement, Broadcasting & Recorded Entertainment Crew Agreement, or Offshore',
      },
    ],
    step1: [],
    step2: [
      {
        key: 'guaranteedWeeks',
        label: 'Guaranteed Weeks',
        type: 'number',
        placeholder: 'e.g. 8',
      },
      {
        key: 'fiftyHourWeekIncluded',
        label: '50-Hour Week Included',
        type: 'boolean',
        default: false,
        helpText: 'Is the rate based on a 50-hour week (inclusive of OT)?',
      },
      {
        key: 'sixthDayPremium',
        label: '6th Day Premium',
        type: 'percentage',
        placeholder: 'e.g. 50',
      },
      {
        key: 'publicHolidayPremium',
        label: 'Public Holiday Premium',
        type: 'percentage',
        placeholder: 'e.g. 150',
      },
    ],
    step3: [
      {
        key: 'weeklyRate',
        label: 'Weekly Rate',
        type: 'currency',
      },
      {
        key: 'dailyRate',
        label: 'Daily Rate',
        type: 'currency',
      },
      {
        key: 'hourlyRate',
        label: 'Hourly Rate',
        type: 'currency',
      },
      {
        key: 'superannuationPercentage',
        label: 'Superannuation %',
        type: 'percentage',
        default: 11.5,
        helpText: 'Employer superannuation guarantee rate',
      },
    ],
    step4: [
      {
        key: 'perDiem',
        label: 'Per Diem',
        type: 'currency',
        default: 120,
        helpText: 'ATO reasonable travel allowance rate (2024)',
      },
      {
        key: 'travelAllowance',
        label: 'Travel Allowance',
        type: 'currency',
        default: 50,
        helpText: 'Daily travel/mileage allowance',
      },
      {
        key: 'mealAllowance',
        label: 'Meal Allowance',
        type: 'currency',
        default: 35,
        helpText: 'Daily meal allowance when catering not provided',
      },
    ],
  },
  defaults: {
    superannuationPercentage: 11.5,
    perDiem: 120,
    travelAllowance: 50,
    mealAllowance: 35,
  },
};

// ---------------------------------------------------------------------------
// FR_CONVENTION — French Convention Collective
// ---------------------------------------------------------------------------
const FR_CONVENTION = {
  unionId: 'FR_CONVENTION',
  label: 'Convention Collective (France)',
  territory: 'FR',
  currency: 'EUR',
  steps: {
    step0: [
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: opts(['Intermittent', 'CDI', 'CDD']),
        required: true,
        helpText: 'Intermittent du spectacle, CDI (permanent), or CDD (fixed-term)',
      },
      {
        key: 'artistOrTechnician',
        label: 'Artist or Technician',
        type: 'select',
        options: opts(['Artist', 'Technician']),
        required: true,
      },
    ],
    step1: [],
    step2: [
      {
        key: 'equivalenceHoursApplicable',
        label: 'Equivalence Hours Applicable',
        type: 'boolean',
        default: false,
        helpText: 'Are equivalence hours (heures assimilees) applicable?',
      },
      {
        key: 'nightWorkApplicable',
        label: 'Night Work Applicable',
        type: 'boolean',
        default: false,
      },
      {
        key: 'sundayWorkApplicable',
        label: 'Sunday Work Applicable',
        type: 'boolean',
        default: false,
      },
    ],
    step3: [
      {
        key: 'dailyRate',
        label: 'Daily Rate (Cachet)',
        type: 'currency',
      },
      {
        key: 'monthlyRate',
        label: 'Monthly Rate',
        type: 'currency',
      },
      {
        key: 'nightPremiumPercentage',
        label: 'Night Premium %',
        type: 'percentage',
        default: 50,
      },
      {
        key: 'sundayPremiumPercentage',
        label: 'Sunday Premium %',
        type: 'percentage',
        default: 100,
      },
    ],
    step4: [
      {
        key: 'repasAllowance',
        label: 'Repas (Meal) Allowance',
        type: 'currency',
        default: 19.40,
        helpText: 'Convention Collective minimum meal indemnity (2024)',
      },
      {
        key: 'transportAllowance',
        label: 'Transport Allowance',
        type: 'currency',
        default: 15,
        helpText: 'Daily transport indemnity',
      },
      {
        key: 'logementAllowance',
        label: 'Logement (Housing) Allowance',
        type: 'currency',
        default: 80,
        helpText: 'Nightly housing allowance when on location',
      },
    ],
  },
  defaults: {
    nightPremiumPercentage: 50,
    repasAllowance: 19.40,
    transportAllowance: 15,
    logementAllowance: 80,
    sundayPremiumPercentage: 100,
  },
};

// ---------------------------------------------------------------------------
// DE_VERDI — ver.di (Germany)
// ---------------------------------------------------------------------------
const DE_VERDI = {
  unionId: 'DE_VERDI',
  label: 'ver.di (Germany)',
  territory: 'DE',
  currency: 'EUR',
  steps: {
    step0: [
      {
        key: 'kskRegistered',
        label: 'KSK Registered',
        type: 'boolean',
        default: false,
        helpText: 'Registered with Kuenstlersozialkasse (artists social insurance)?',
      },
      {
        key: 'taxClass',
        label: 'Tax Class (Steuerklasse)',
        type: 'select',
        options: [
          { value: '1', label: '1 - Single' },
          { value: '2', label: '2 - Single Parent' },
          { value: '3', label: '3 - Married (higher earner)' },
          { value: '4', label: '4 - Married (equal)' },
          { value: '5', label: '5 - Married (lower earner)' },
          { value: '6', label: '6 - Second job' },
        ],
      },
    ],
    step1: [],
    step2: [
      {
        key: 'maxDailyHours',
        label: 'Max Daily Hours',
        type: 'select',
        options: [
          { value: '10', label: '10 hours' },
          { value: '12', label: '12 hours (with exemption)' },
        ],
        default: '10',
      },
      {
        key: 'fourDayWeekEligible',
        label: '4-Day Week Eligible',
        type: 'boolean',
        default: false,
      },
      {
        key: 'saturdaySurchargePercent',
        label: 'Saturday Surcharge %',
        type: 'percentage',
        default: 25,
      },
      {
        key: 'sundaySurchargePercent',
        label: 'Sunday Surcharge %',
        type: 'percentage',
        default: 75,
      },
      {
        key: 'holidaySurchargePercent',
        label: 'Holiday Surcharge %',
        type: 'percentage',
        default: 100,
      },
    ],
    step3: [
      {
        key: 'dailyRate',
        label: 'Daily Rate (Tagegage)',
        type: 'currency',
      },
      {
        key: 'nightSurchargePercentage',
        label: 'Night Surcharge %',
        type: 'percentage',
        default: 25,
      },
    ],
    step4: [
      {
        key: 'verpflegungAllowance',
        label: 'Verpflegung (Meal) Allowance',
        type: 'currency',
        default: 16,
        helpText: 'Minimum meal allowance per German tax-free Verpflegungspauschale (2024: €16/day)',
      },
      {
        key: 'fahrtkosten',
        label: 'Fahrtkosten (Travel)',
        type: 'currency',
        default: 30,
        helpText: 'Daily travel/Pendlerpauschale (€0.30/km, ~100km avg)',
      },
    ],
  },
  defaults: {
    maxDailyHours: '10',
    saturdaySurchargePercent: 25,
    sundaySurchargePercent: 75,
    holidaySurchargePercent: 100,
    nightSurchargePercentage: 25,
    verpflegungAllowance: 16,
    fahrtkosten: 30,
  },
};

// ---------------------------------------------------------------------------
// ES_ALMA — ALMA / Spanish unions
// ---------------------------------------------------------------------------
const ES_ALMA = {
  unionId: 'ES_ALMA',
  label: 'ALMA (Spain)',
  territory: 'ES',
  currency: 'EUR',
  steps: {
    step0: [
      {
        key: 'contractType',
        label: 'Contract Type',
        type: 'select',
        options: opts(['Fijo', 'Temporal', 'Autonomo']),
        required: true,
        helpText: 'Permanent, Temporary, or Self-Employed',
      },
    ],
    step1: [],
    step2: [
      {
        key: 'convenioColectivo',
        label: 'Convenio Colectivo',
        type: 'text',
        placeholder: 'e.g. Convenio del Sector Audiovisual',
        helpText: 'Applicable collective bargaining agreement',
      },
      {
        key: 'noticePeriod',
        label: 'Notice Period',
        type: 'text',
        placeholder: 'e.g. 15 days',
      },
    ],
    step3: [
      {
        key: 'dailyRate',
        label: 'Daily Rate',
        type: 'currency',
      },
      {
        key: 'monthlyRate',
        label: 'Monthly Rate',
        type: 'currency',
      },
    ],
    step4: [
      {
        key: 'dietas',
        label: 'Dietas (Per Diem)',
        type: 'currency',
        default: 55,
        helpText: 'Convenio Colectivo minimum per diem (2024)',
      },
      {
        key: 'transporteAllowance',
        label: 'Transporte (Transport) Allowance',
        type: 'currency',
        default: 20,
        helpText: 'Daily transport allowance',
      },
    ],
  },
  defaults: {
    dietas: 55,
    transporteAllowance: 20,
  },
};

// ---------------------------------------------------------------------------
// US_AFM — American Federation of Musicians
// ---------------------------------------------------------------------------
const US_AFM = {
  unionId: 'US_AFM',
  label: 'AFM (American Federation of Musicians)',
  territory: 'US',
  currency: 'USD',
  steps: {
    step0: [
      {
        key: 'agreementType',
        label: 'Agreement Type',
        type: 'select',
        options: [
          { value: 'theatrical', label: 'Theatrical Motion Picture' },
          { value: 'television', label: 'Television Film' },
          { value: 'basic_cable', label: 'Basic Cable' },
          { value: 'new_media', label: 'New Media / Streaming' },
          { value: 'low_budget', label: 'Low Budget' },
          { value: 'videogame', label: 'Video Game' },
          { value: 'commercial', label: 'Commercial' },
          { value: 'sound_recording', label: 'Sound Recording' },
        ],
        required: true,
        helpText: 'AFM agreement under which this engagement falls',
      },
      {
        key: 'instrumentCategory',
        label: 'Instrument Category',
        type: 'select',
        options: [
          { value: 'orchestra', label: 'Orchestra / Sideline' },
          { value: 'solo', label: 'Solo / Featured' },
          { value: 'conductor', label: 'Conductor' },
          { value: 'orchestrator', label: 'Orchestrator / Arranger' },
          { value: 'contractor', label: 'Contractor' },
          { value: 'copyist', label: 'Copyist / Librarian' },
          { value: 'electronic', label: 'Electronic / Synthesist' },
        ],
        helpText: 'Determines scale rates and session rules',
      },
    ],
    step1: [
      {
        key: 'afmMemberId',
        label: 'AFM Member ID',
        type: 'text',
        placeholder: 'e.g. 123-456-789',
      },
      {
        key: 'afmLocal',
        label: 'AFM Local Number',
        type: 'text',
        placeholder: 'e.g. Local 47 (Los Angeles)',
        helpText: 'Musician\'s home AFM local union',
      },
      {
        key: 'loanoutCorporation',
        label: 'Loan-Out Corporation',
        type: 'text',
        placeholder: 'e.g. Music Corp LLC',
      },
      {
        key: 'agencyName',
        label: 'Agency Name',
        type: 'text',
        placeholder: 'e.g. Gorfaine/Schwartz',
      },
      {
        key: 'agencyCommissionPercentage',
        label: 'Agency Commission %',
        type: 'percentage',
        default: 10,
      },
    ],
    step2: [
      {
        key: 'sessionType',
        label: 'Session Type',
        type: 'select',
        options: [
          { value: 'recording', label: 'Recording Session' },
          { value: 'scoring', label: 'Scoring Session' },
          { value: 'dubbing', label: 'Dubbing / Sweetening' },
          { value: 'tracking', label: 'Tracking / Overdub' },
          { value: 'live', label: 'Live Performance (on camera)' },
        ],
        helpText: 'Type of musical session — affects scale and overtime rules',
      },
      {
        key: 'sessionLength',
        label: 'Session Length (hours)',
        type: 'number',
        default: 3,
        helpText: 'Standard AFM session = 3 hours. Overtime after that.',
      },
      {
        key: 'doublingInstruments',
        label: 'Doubling Instruments',
        type: 'number',
        default: 0,
        helpText: 'Number of additional instruments played — each adds a percentage to scale',
      },
      {
        key: 'cartage',
        label: 'Cartage Required',
        type: 'boolean',
        default: false,
        helpText: 'Does the musician bring large instruments requiring cartage payment?',
      },
    ],
    step3: [
      {
        key: 'scaleOrOverscale',
        label: 'Rate Basis',
        type: 'select',
        options: [
          { value: 'scale', label: 'AFM Scale' },
          { value: 'double_scale', label: 'Double Scale' },
          { value: 'overscale', label: 'Overscale (Negotiated)' },
        ],
        helpText: 'Most session musicians are paid at AFM scale or double scale',
      },
      {
        key: 'sessionRate',
        label: 'Session Rate',
        type: 'currency',
        helpText: 'Per-session fee (3-hour session)',
      },
      {
        key: 'doublingPctPerInstrument',
        label: 'Doubling Premium %',
        type: 'percentage',
        default: 20,
        helpText: 'First double = 20% of scale, subsequent = 15%. Production may negotiate flat.',
      },
      {
        key: 'specialPayments',
        label: 'Special Payments Fund',
        type: 'boolean',
        default: true,
        helpText: 'AFM Special Payments Fund contribution (applies to most theatrical/TV)',
      },
    ],
    step4: [
      {
        key: 'cartageRate',
        label: 'Cartage Rate',
        type: 'currency',
        helpText: 'Payment for transporting large instruments (harp, timpani, etc.)',
      },
      {
        key: 'pensionContribPct',
        label: 'AFM Pension Contribution %',
        type: 'percentage',
        default: 12.17,
        helpText: 'Employer pension contribution to AFM-EPF (currently 12.17%)',
      },
      {
        key: 'healthWelfarePct',
        label: 'H&W Contribution %',
        type: 'percentage',
        default: 11.99,
        helpText: 'Employer health & welfare contribution (currently 11.99%)',
      },
    ],
    allowanceSuggestions: [
      { name: 'Cartage', amount: 75, taxTreatment: 'non-taxable' },
      { name: 'Doubling Premium', amount: 0, taxTreatment: 'taxable-paye' },
      { name: 'Per Diem', amount: 66, taxTreatment: 'non-taxable' },
      { name: 'Travel', amount: 0, taxTreatment: 'non-taxable' },
    ],
  },
  defaults: {},
};


// =============================================================================
// Exported config map
// =============================================================================
export const UNION_CONFIGS = {
  UK_BECTU,
  UK_EQUITY,
  UK_DIRECTORS_UK,
  UK_WGGB,
  UK_MU,
  US_SAG_AFTRA,
  US_DGA,
  US_IATSE,
  US_WGA,
  US_AFM,
  AFM: US_AFM,  // Direct alias — DB stores code as 'AFM'
  AU_MEAA,
  MEAA: AU_MEAA,            // DB stores code as 'MEAA'
  SPA: AU_MEAA,             // SPA (AU performers) → same AU config
  FR_CONVENTION,
  CONVENTION_FR: FR_CONVENTION, // DB stores code as 'CONVENTION_FR'
  DE_VERDI,
  VERDI: DE_VERDI,          // DB stores code as 'VERDI'
  BFFS: DE_VERDI,           // BFFS (DE performers) → same DE config
  ES_ALMA,
  ALMA: ES_ALMA,            // DB stores code as 'ALMA'
  AISGE: ES_ALMA,           // AISGE (ES performers) → same ES config
};

// ---------------------------------------------------------------------------
// Territory-based lookup index for faster access
// ---------------------------------------------------------------------------
const TERRITORY_INDEX = {};
Object.values(UNION_CONFIGS).forEach((cfg) => {
  if (!TERRITORY_INDEX[cfg.territory]) TERRITORY_INDEX[cfg.territory] = [];
  TERRITORY_INDEX[cfg.territory].push(cfg);
});

// =============================================================================
// getUnionConfig(unionCode, territory)
// =============================================================================
// Resolves the union config for a given union code and/or territory.
//
// 1. Try exact match by unionId (e.g. 'UK_BECTU')
// 2. Try matching by combining territory + partial code (e.g. 'UK' + 'BECTU')
// 3. Try matching the code against union labels or IDs (case-insensitive)
// 4. Fallback: return first config for the given territory, or null
// ---------------------------------------------------------------------------
export function getUnionConfig(unionCode, territory) {
  if (!unionCode && !territory) return null;

  // 1. Exact match
  if (unionCode && UNION_CONFIGS[unionCode]) {
    return UNION_CONFIGS[unionCode];
  }

  // 2. Territory + code combo (e.g. territory='UK', unionCode='BECTU' -> 'UK_BECTU')
  if (territory && unionCode) {
    const combo = `${territory}_${unionCode}`.toUpperCase();
    if (UNION_CONFIGS[combo]) return UNION_CONFIGS[combo];
  }

  // 3. Case-insensitive search across all configs
  if (unionCode) {
    const needle = unionCode.toUpperCase().replace(/[\s-]/g, '_');
    for (const [key, cfg] of Object.entries(UNION_CONFIGS)) {
      if (key.toUpperCase() === needle) return cfg;
      if (cfg.label.toUpperCase().replace(/[\s-]/g, '_').includes(needle)) return cfg;
    }
    // Try partial match: 'PACT-BECTU' -> 'BECTU' -> 'UK_BECTU'
    const parts = needle.split('_');
    for (const part of parts) {
      for (const [key, cfg] of Object.entries(UNION_CONFIGS)) {
        if (key.includes(part)) return cfg;
      }
    }
  }

  // 4. Territory fallback — return first config for this territory
  if (territory) {
    const territoryConfigs = TERRITORY_INDEX[territory.toUpperCase()];
    if (territoryConfigs?.length > 0) return territoryConfigs[0];
  }

  return null;
}
