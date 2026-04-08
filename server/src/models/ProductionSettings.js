import mongoose from 'mongoose';

const productionSettingsSchema = new mongoose.Schema(
  {
    productionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Production', required: true, unique: true },

    // Default working rules
    defaultBasicHrs: { type: Number, default: 10 },
    defaultRateBasis: { type: String, enum: ['daily', 'weekly', 'hourly'], default: 'daily' },
    defaultHpTreatment: { type: String, enum: ['excl', 'incl', 'na'], default: 'excl' },
    defaultHpRate: { type: Number, default: 12.07 },

    // OT structure defaults
    defaultOt1Multiplier: { type: Number, default: 1.5 },
    defaultOt1Trigger: { type: String, default: 'After standard day' },
    defaultOt2Multiplier: { type: Number, default: 2.0 },
    defaultOt2Trigger: { type: String, default: 'After 13hrs' },
    defaultSixthDayMultiplier: { type: Number, default: 1.5 },
    defaultSeventhDayMultiplier: { type: Number, default: 2.0 },
    defaultGoldenTimeEnabled: { type: Boolean, default: false },

    // Meal rules
    defaultMealIntervalHrs: { type: Number, default: 6 },
    defaultMealDurationMins: { type: Number, default: 30 },
    defaultMealPaidStatus: { type: String, enum: ['paid', 'unpaid', 'non-deductible'], default: 'unpaid' },
    defaultMealPenaltyAmount: { type: Number, default: 35 },

    // Turnaround
    defaultTurnaroundHrs: { type: Number, default: 11 },

    // Fringe defaults
    defaultNicRate: String,           // '13.8%' or '7.65% FICA'
    defaultPensionRate: String,       // '3% min auto-enrol'
    defaultMileageRate: String,       // '45p/mile'
    defaultPerDiemAmount: { type: Number, default: 35 },
    defaultKitBoxAmount: { type: Number, default: 500 },

    // Nominal codes
    nominalCodes: {
      basicLabour: { type: String, default: '2302' },
      overtime: { type: String, default: '2360' },
      kit: { type: String, default: '2350' },
      allowances: { type: String, default: '2340' },
      employerOnCosts: { type: String, default: '2399' },
      pension: { type: String, default: '2397' },
      mealPenalties: { type: String, default: '2360' },
    },

    // Tax credit
    taxCreditScheme: String,          // 'HETVC', 'SECTION_481', 'US_STATE'
    taxCreditClassification: { type: String, enum: ['core', 'non-core', null], default: null },

    // Bureau
    defaultBureau: String,

    // Signing documents templates
    standardSigningDocuments: [{
      filename: String,
      description: String,
      requiresSignature: { type: Boolean, default: true },
    }],

    // Working day type — same for all crew on this production
    workingDayType: { type: String, enum: ['SWD', 'CWD', 'SCWD'], default: 'SWD' },

    // Configurable day types — crew picks from these in timecards
    // Each maps to a rate key (prep/shoot/wrap/travel) from deal memo
    dayTypes: [{
      name: { type: String, required: true },       // "Prep", "Shoot", "Travel", "Turnaround", etc.
      rateKey: { type: String, default: 'shoot' },  // "prep", "shoot", "wrap", "travel"
      isWorkDay: { type: Boolean, default: true },   // false = flat rate, no OT
      isDefault: { type: Boolean, default: true },   // show in quick-select dropdown
      color: String,                                 // UI color hint
    }],

    // Bureau contacts — which person at the payroll bureau manages which departments
    bureauContacts: [{
      contactName: { type: String, required: true },
      email: String,
      phone: String,
      departments: [String],  // ["Wardrobe", "Costume", "HMU"]
    }],

    // Onboarding requirements (overrides country defaults)
    // When empty → use country defaults from client/src/lib/onboardingRequirements.js
    // When populated → use these instead (admin customized)
    onboardingRequirements: [{
      key: String,
      label: String,
      category: { type: String, enum: ['tax', 'id', 'bank', 'pension', 'compliance', 'personal', 'custom'], default: 'custom' },
      required: { type: Boolean, default: true },
      isCustom: { type: Boolean, default: false },
    }],

    // Flexible approval chain (configurable per production)
    approvalChain: [{
      step: { type: Number, required: true },
      role: { type: String, required: true },     // e.g. 'department_head', 'production_accountant', 'payroll_admin'
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional — specific user
      label: { type: String, required: true },     // e.g. 'HOD Approval', 'Line Producer Review'
      isRequired: { type: Boolean, default: true },
    }],
  },
  { timestamps: true }
);

export default mongoose.model('ProductionSettings', productionSettingsSchema);
