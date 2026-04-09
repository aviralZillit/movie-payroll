/**
 * Cascading Auto-Fill Defaults for Deal Memo Wizard.
 *
 * When a user selects a trigger field (territory, rate type, deal type, employment type),
 * downstream fields auto-populate with correct defaults.
 *
 * Priority order (later overrides earlier):
 *   1. Territory defaults (base layer)
 *   2. Employment Type overrides
 *   3. Deal Type overrides
 *   4. Rate Type overrides (highest priority)
 */

// ---------------------------------------------------------------------------
// Territory defaults — base layer applied when production is selected
// ---------------------------------------------------------------------------
export const TERRITORY_DEFAULTS = {
  UK: {
    hpMode: 'excl', holidayPayPct: 12.07,
    nightPremiumEnabled: true, nightPremiumPct: 50, nightPremiumFlat: 20, nightStartTime: '23:00',
    turnaroundMinHrs: 11,
    mealPenaltyEnabled: true, mealPenaltyRate: 35, mealPenaltyAfterHrs: 6,
    sixthDayMultiplier: 1.5, seventhDayMultiplier: 2.0,
    employerNiPct: 13.8, pensionPct: 3, apprenticeshipLevyPct: 0.5,
    overtimeApplicable: true,
    btaEnabled: true, btaRate: 45,
    contractedHoursSWD: 11, contractedHoursCWD: 10, contractedHoursSCWD: 10,
  },
  US: {
    hpMode: 'na', holidayPayPct: 0,
    nightPremiumEnabled: false, nightPremiumPct: 0, nightPremiumFlat: 0, nightStartTime: '00:00',
    turnaroundMinHrs: 10,
    mealPenaltyEnabled: true, mealPenaltyRate: 75, mealPenaltyAfterHrs: 6,
    sixthDayMultiplier: 1.5, seventhDayMultiplier: 2.0,
    employerNiPct: 7.65, pensionPct: 20, apprenticeshipLevyPct: 0,
    overtimeApplicable: true,
    btaEnabled: false, btaRate: 0,
    contractedHoursSWD: 8, contractedHoursCWD: 8, contractedHoursSCWD: 8,
  },
  AU: {
    hpMode: 'na', holidayPayPct: 0,
    nightPremiumEnabled: false, nightPremiumPct: 0, nightStartTime: '00:00',
    turnaroundMinHrs: 10,
    mealPenaltyEnabled: true, mealPenaltyRate: 50, mealPenaltyAfterHrs: 5,
    sixthDayMultiplier: 1.5, seventhDayMultiplier: 2.0,
    employerNiPct: 0, pensionPct: 11.5, apprenticeshipLevyPct: 0,
    overtimeApplicable: true,
  },
  DE: {
    hpMode: 'na', holidayPayPct: 0,
    nightPremiumEnabled: true, nightPremiumPct: 25, nightStartTime: '22:00',
    turnaroundMinHrs: 11,
    mealPenaltyEnabled: false, mealPenaltyRate: 0, mealPenaltyAfterHrs: 6,
    sixthDayMultiplier: 1.25, seventhDayMultiplier: 1.75,
    employerNiPct: 21, pensionPct: 4, apprenticeshipLevyPct: 0,
    overtimeApplicable: true,
  },
  FR: {
    hpMode: 'excl', holidayPayPct: 10,
    nightPremiumEnabled: true, nightPremiumPct: 25, nightStartTime: '22:00',
    turnaroundMinHrs: 11,
    mealPenaltyEnabled: false, mealPenaltyRate: 0, mealPenaltyAfterHrs: 6,
    sixthDayMultiplier: 1.5, seventhDayMultiplier: 2.0,
    employerNiPct: 45, pensionPct: 0, apprenticeshipLevyPct: 0,
    overtimeApplicable: true,
  },
  ES: {
    hpMode: 'na', holidayPayPct: 0,
    nightPremiumEnabled: false, nightPremiumPct: 0, nightStartTime: '22:00',
    turnaroundMinHrs: 11,
    mealPenaltyEnabled: false, mealPenaltyRate: 0, mealPenaltyAfterHrs: 6,
    sixthDayMultiplier: 1.5, seventhDayMultiplier: 2.0,
    employerNiPct: 30, pensionPct: 0, apprenticeshipLevyPct: 0,
    overtimeApplicable: true,
  },
  CA: {
    hpMode: 'na', holidayPayPct: 4,
    nightPremiumEnabled: false, nightPremiumPct: 0, nightStartTime: '00:00',
    turnaroundMinHrs: 10,
    mealPenaltyEnabled: true, mealPenaltyRate: 50, mealPenaltyAfterHrs: 5,
    sixthDayMultiplier: 1.5, seventhDayMultiplier: 2.0,
    employerNiPct: 8.32, pensionPct: 5, apprenticeshipLevyPct: 0,
    overtimeApplicable: true,
  },
  IE: {
    hpMode: 'excl', holidayPayPct: 12.07,
    nightPremiumEnabled: false, nightPremiumPct: 0, nightStartTime: '23:00',
    turnaroundMinHrs: 11,
    mealPenaltyEnabled: true, mealPenaltyRate: 35, mealPenaltyAfterHrs: 6,
    sixthDayMultiplier: 1.5, seventhDayMultiplier: 2.0,
    employerNiPct: 11.05, pensionPct: 0, apprenticeshipLevyPct: 0,
    overtimeApplicable: true,
  },
};

// ---------------------------------------------------------------------------
// Rate Type overrides — highest priority
// ---------------------------------------------------------------------------
export const RATE_TYPE_OVERRIDES = {
  buyout:        { hpMode: 'incl', overtimeApplicable: false, nightPremiumEnabled: false, mealPenaltyEnabled: false },
  all_in:        { hpMode: 'incl', overtimeApplicable: false, nightPremiumEnabled: false, mealPenaltyEnabled: false },
  basic:         { overtimeApplicable: true },
  negotiated:    { overtimeApplicable: true },
  scale:         { overtimeApplicable: true },
  scale_plus_10: { overtimeApplicable: true },
  scale_plus_15: { overtimeApplicable: true },
};

// ---------------------------------------------------------------------------
// Deal Type overrides
// ---------------------------------------------------------------------------
export const DEAL_TYPE_OVERRIDES = {
  flat:    { overtimeApplicable: false, nightPremiumEnabled: false, mealPenaltyEnabled: false, separateRates: false, payFrequency: 'monthly' },
  picture: { overtimeApplicable: false, nightPremiumEnabled: false, mealPenaltyEnabled: false, separateRates: false, payFrequency: 'monthly' },
  step:    { overtimeApplicable: false, nightPremiumEnabled: false, mealPenaltyEnabled: false, separateRates: false, payFrequency: 'monthly' },
  daily:   { overtimeApplicable: true, payFrequency: 'weekly' },
  weekly:  { overtimeApplicable: true, payFrequency: 'weekly' },
};

// ---------------------------------------------------------------------------
// Employment category overrides
// ---------------------------------------------------------------------------
const EMPLOYMENT_CATEGORY_OVERRIDES = {
  corporate:     { overtimeApplicable: false, nightPremiumEnabled: false, mealPenaltyEnabled: false },
  self_employed: { overtimeApplicable: false, nightPremiumEnabled: false },
  employee:      {}, // no overrides — use territory defaults
};

// ---------------------------------------------------------------------------
// Compute cascaded defaults
// ---------------------------------------------------------------------------
/**
 * Compute the final auto-fill values by merging layers.
 * @param {string} territory - UK, US, AU, DE, FR, ES, etc.
 * @param {string} employmentCategory - 'employee' | 'corporate' | 'self_employed'
 * @param {string} dealType - 'daily' | 'weekly' | 'flat' | 'picture' | 'step'
 * @param {string} rateType - 'basic' | 'buyout' | 'all_in' | 'negotiated' | 'scale' | etc.
 * @returns {object} merged defaults
 */
export function computeCascadedDefaults(territory, employmentCategory, dealType, rateType) {
  const base = TERRITORY_DEFAULTS[territory] || TERRITORY_DEFAULTS.UK;
  const empOverrides = EMPLOYMENT_CATEGORY_OVERRIDES[employmentCategory] || {};
  const dtOverrides = DEAL_TYPE_OVERRIDES[dealType] || {};
  const rtOverrides = RATE_TYPE_OVERRIDES[rateType] || {};

  return { ...base, ...empOverrides, ...dtOverrides, ...rtOverrides };
}

/**
 * Get only the fields that changed between old and new cascaded defaults.
 * Used to apply only the delta when a trigger field changes.
 */
export function getCascadeDelta(oldDefaults, newDefaults) {
  const delta = {};
  for (const [key, value] of Object.entries(newDefaults)) {
    if (oldDefaults[key] !== value) {
      delta[key] = value;
    }
  }
  return delta;
}
