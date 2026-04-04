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
  },
  { timestamps: true }
);

export default mongoose.model('ProductionSettings', productionSettingsSchema);
