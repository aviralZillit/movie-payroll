import mongoose from 'mongoose';

/**
 * TerritoryRule: One document per union agreement.
 * Contains 40+ fields covering OT, meals, rest, fringes, allowances, and special provisions.
 * This is the single source of truth for how each agreement works.
 * Derived from Kate's TERRITORY_RULES dataset (production accounting standard).
 */
const territoryRuleSchema = new mongoose.Schema(
  {
    // ─── Identity ────────────────────────────────────────────────────
    territoryCode: { type: String, required: true },       // UK, US, CA, etc.
    unionKey: { type: String, required: true, unique: true }, // e.g. 'PACT-BECTU', 'IATSE-BASIC', 'DGA'
    badge: String,                                          // Short display label
    effectiveFrom: Date,
    effectiveTo: Date,

    // ─── Basic Day ───────────────────────────────────────────────────
    basicHrs: { type: Number, required: true },             // Standard day length (UK:10-11, IATSE:8, DGA:12)
    basicDescription: String,                               // e.g. '10 hrs'
    hrBasis: String,                                        // e.g. 'Day ÷ 10', 'Rate ÷ 8'

    // ─── OT Tiers ────────────────────────────────────────────────────
    ot1Multiplier: Number,                                  // UK:1.25, IATSE:1.5
    ot1Trigger: String,                                     // e.g. 'Hours 11-12'
    ot1Description: String,
    ot2Multiplier: Number,                                  // UK:1.5, IATSE:2.0
    ot2Trigger: String,
    ot2Description: String,
    goldenTimeMultiplier: Number,                           // IATSE:2.0, UK:null
    goldenTimeAfterHours: Number,                           // IATSE:14, UK:null
    goldenTimeDescription: String,
    otRateCap: Number,                                      // UK Camera:81.82, others:null
    otRateCapDescription: String,

    // ─── Day Premiums ────────────────────────────────────────────────
    sixthDayMultiplier: Number,                             // 1.5 typically
    sixthDayDescription: String,
    seventhDayMultiplier: Number,                           // 2.0 typically
    seventhDayDescription: String,

    // ─── Holiday / Vacation ──────────────────────────────────────────
    holidayPayPct: Number,                                  // UK:0.1207, US:null
    holidayPayDescription: String,
    hpMode: { type: String, enum: ['excl', 'incl', 'na'], default: 'excl' },
    vacationPct: Number,                                    // US:0.08583, UK:null
    vacationDescription: String,

    // ─── Night Premium ───────────────────────────────────────────────
    nightPremiumType: { type: String, enum: ['percentage', 'flat', 'tiered', null] },
    nightPremiumValue: Number,                              // IATSE:10 (+10%), UK:20 (£20 flat)
    nightStartTime: String,                                 // '23:00' or '00:00'
    nightEndTime: String,                                   // '06:00' or '05:00'
    nightDescription: String,

    // ─── Meals ───────────────────────────────────────────────────────
    mealIntervalHrs: { type: Number, default: 6 },
    mealDurationMins: { type: Number, default: 30 },
    mealPaidStatus: { type: String, enum: ['paid', 'unpaid', 'non-deductible'], default: 'unpaid' },
    mealSubsequentInterval: Number,                         // hrs until next meal
    mealGraceMinutes: Number,                               // grace period (abolished in UK 2023)
    mealPenaltyAmounts: [Number],                           // [35] for UK, [25,35,50] for SAG (escalating)
    mealPenaltyDescription: String,
    mealPenalty2Description: String,                         // subsequent penalty detail
    frenchHoursAllowed: { type: Boolean, default: false },

    // ─── Rest / Turnaround ───────────────────────────────────────────
    turnaroundMinHrs: { type: Number, default: 11 },
    turnaroundDescription: String,
    turnaroundPenaltyType: { type: String, enum: ['hourly_rate', 'flat_penalty', 'continuous_day', null] },
    turnaroundPenaltyDescription: String,
    weeklyRestMinHrs: Number,                               // UK:24, IATSE:24 (1 day off per 7)
    dayBreakDescription: String,                            // UK: '20 min per 6 hrs'

    // ─── Employer Fringes ────────────────────────────────────────────
    rfHolidayPayPct: Number,                                // UK:0.1207 (posts to 2302)
    rfHolidayPayDescription: String,
    rfNicPct: Number,                                       // UK:0.138, US:0.0765 FICA
    rfNicThreshold: Number,                                 // UK weekly: £967 (above which NI applies)
    rfNicDescription: String,
    rfPensionPct: Number,                                   // SAG:0.185, WGA:0.21, DGA:0.06, IATSE:0.075, UK:0.03
    rfPensionDescription: String,
    rfHwPerHour: Number,                                    // IATSE:26.76, Teamsters:~30, UK:null
    rfHwDescription: String,
    rfEmployerTotalEstimate: String,                         // e.g. '~40-45%' for IATSE Basic
    rfWorkersCompPct: Number,                               // US CA: 0.035

    // ─── Allowance Defaults ──────────────────────────────────────────
    rfKitDefault: Number,
    rfMileageRate: String,                                  // '45p/mile', '67¢/mile'
    rfPerDiemDefault: Number,                               // IATSE:130-175, UK:production-set
    rfPerDiemMandatory: { type: Boolean, default: false },  // true for IATSE distant location

    // ─── Working Day Types ───────────────────────────────────────────
    workingDayTypes: [String],                              // ['SWD','CWD','SCWD'] for UK
    achApplicable: { type: Boolean, default: false },       // UK TV Drama ADs/Costume/HMU only

    // ─── Tax Credits ─────────────────────────────────────────────────
    rfTaxCreditScheme: String,                              // 'HETVC', 'Section 481', etc.

    // ─── Special Provisions ──────────────────────────────────────────
    specialProvisions: [String],                            // Array of key provision notes

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

territoryRuleSchema.index({ territoryCode: 1, unionKey: 1 });

export default mongoose.model('TerritoryRule', territoryRuleSchema);
