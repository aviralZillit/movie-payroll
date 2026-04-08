/**
 * Territory-specific default day type configurations.
 * Seeded into ProductionSettings.dayTypes when a production is created.
 * Each day type defines how that type of day is calculated in payroll.
 *
 * rateKey maps to deal memo fields: prepRate, shootRate, wrapRate, travelRate
 * standardHours = OT triggers after this many hours
 * premiumMultiplier = rate multiplier (1.5 for 6th day, 2.0 for 7th/holiday)
 */

const dt = (name, rateKey, standardHours, opts = {}) => ({
  name,
  rateKey,
  standardHours,
  isWorkDay: opts.isWorkDay !== false,
  otApplies: opts.otApplies !== false,
  mealPenaltyApplies: opts.mealPenaltyApplies !== false,
  lunchDeducted: opts.lunchDeducted !== false,
  lunchDurationHrs: opts.lunchDurationHrs ?? 1,
  premiumMultiplier: opts.premiumMultiplier ?? 1.0,
  notes: opts.notes || '',
  isDefault: opts.isDefault !== false,
  color: opts.color || null,
});

export const DAY_TYPE_DEFAULTS = {
  // ═══════════════════════════════════════════════════════════════
  // UK — BECTU (Crew)
  // ═══════════════════════════════════════════════════════════════
  UK: [
    dt('Shoot (SWD)', 'shoot', 11, { lunchDurationHrs: 1, notes: 'Standard Working Day: 11hrs + 1hr unpaid lunch', color: '#3b82f6' }),
    dt('Shoot (CWD)', 'shoot', 10, { lunchDeducted: false, lunchDurationHrs: 0, notes: 'Continuous Working Day: 10hrs, no lunch break, clock runs', color: '#2563eb' }),
    dt('Shoot (SCWD)', 'shoot', 10.5, { lunchDurationHrs: 0.5, notes: 'Semi-Continuous: 10.5hrs + 30min unpaid lunch', color: '#1d4ed8' }),
    dt('Prep', 'prep', 8, { notes: '8hr day, OT after 8hrs', color: '#f59e0b' }),
    dt('Recce', 'prep', 8, { mealPenaltyApplies: false, notes: 'Location recce, 8hr day', color: '#d97706' }),
    dt('Wrap', 'wrap', 8, { notes: 'Wrap/strike day, 8hrs', color: '#8b5cf6' }),
    dt('Travel', 'travel', 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, notes: 'Flat travel rate, no OT', color: '#6b7280' }),
    dt('6th Day', 'shoot', 11, { premiumMultiplier: 1.5, notes: '6th consecutive day, ×1.5 premium', color: '#ea580c' }),
    dt('7th Day', 'shoot', 11, { premiumMultiplier: 2.0, notes: '7th consecutive day, ×2.0 premium', color: '#dc2626' }),
    dt('Bank Holiday', 'shoot', 11, { premiumMultiplier: 2.0, notes: 'Public holiday, ×2.0 premium', color: '#dc2626' }),
    dt('Split Day', 'shoot', 11, { notes: 'Camera finish 9pm-11pm, £30 premium if over cap', color: '#7c3aed' }),
    dt('Rest', null, 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, premiumMultiplier: 0, notes: 'Rest day, no pay', color: '#d1d5db' }),
  ],

  // ═══════════════════════════════════════════════════════════════
  // UK — Equity (Performers)
  // ═══════════════════════════════════════════════════════════════
  'UK-EQUITY': [
    dt('Performance Day', 'shoot', 9, { lunchDurationHrs: 1, notes: '9hrs including meal break, 7am-10pm window', color: '#3b82f6' }),
    dt('Continuous Day', 'shoot', 7, { lunchDeducted: false, lunchDurationHrs: 0, notes: '7hrs, no formal meal break, until 10pm', color: '#2563eb' }),
    dt('Rehearsal', 'shoot', 9, { notes: 'Full performance salary', color: '#f59e0b' }),
    dt('Fitting (under 5hr)', 'prep', 5, { otApplies: false, mealPenaltyApplies: false, premiumMultiplier: 0.5, notes: 'Half daily rate for fittings under 5hrs', color: '#d97706' }),
    dt('Fitting (over 5hr)', 'prep', 9, { notes: 'Full daily rate for fittings over 5hrs', color: '#d97706' }),
    dt('Night Shoot', 'shoot', 9, { notes: 'Starting before 4am or past midnight, night premium', color: '#7c3aed' }),
    dt('Travel', 'travel', 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, notes: 'Travel allowances paid', color: '#6b7280' }),
    dt('Rest', null, 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, premiumMultiplier: 0, color: '#d1d5db' }),
  ],

  // ═══════════════════════════════════════════════════════════════
  // US — SAG-AFTRA (Performers)
  // ═══════════════════════════════════════════════════════════════
  'US-SAG': [
    dt('Work Day', 'shoot', 8, { lunchDurationHrs: 0.5, notes: '8hr straight time, OT after 8hrs (1.5x→2x→golden)', color: '#3b82f6' }),
    dt('Rehearsal', 'shoot', 8, { lunchDurationHrs: 0.5, notes: 'Same rate as work day', color: '#f59e0b' }),
    dt('Fitting (under 5hr)', 'prep', 5, { otApplies: false, mealPenaltyApplies: false, premiumMultiplier: 0.5, notes: 'Minimum 1hr pay, 15-min increments', color: '#d97706' }),
    dt('Fitting (over 5hr)', 'prep', 8, { lunchDurationHrs: 0.5, notes: 'Full daily rate', color: '#d97706' }),
    dt('Travel', 'travel', 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, notes: 'Full day pay, no OT', color: '#6b7280' }),
    dt('Hold/Idle', 'shoot', 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, notes: 'Full day pay, on hold', color: '#a3a3a3' }),
    dt('6th Day', 'shoot', 8, { lunchDurationHrs: 0.5, premiumMultiplier: 1.5, notes: '×1.5 premium', color: '#ea580c' }),
    dt('7th Day', 'shoot', 8, { lunchDurationHrs: 0.5, premiumMultiplier: 2.0, notes: '×2.0 premium', color: '#dc2626' }),
    dt('Rest', null, 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, premiumMultiplier: 0, color: '#d1d5db' }),
  ],

  // ═══════════════════════════════════════════════════════════════
  // US — IATSE (Crew)
  // ═══════════════════════════════════════════════════════════════
  US: [
    dt('Studio Day', 'shoot', 8, { lunchDurationHrs: 0.5, notes: 'Within 30-mile studio zone', color: '#3b82f6' }),
    dt('Location Day', 'shoot', 8, { lunchDurationHrs: 0.5, notes: 'Distant location, +per diem +lodging', color: '#2563eb' }),
    dt('Nearby Location', 'shoot', 8, { lunchDurationHrs: 0.5, notes: 'Beyond zone, crew commutes', color: '#1d4ed8' }),
    dt('Travel Only', 'travel', 8, { otApplies: false, mealPenaltyApplies: false, notes: '4-8hr straight time, no OT', color: '#6b7280' }),
    dt('Idle Overnight', null, 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, premiumMultiplier: 0, notes: 'Benefits accrue, no pay', color: '#a3a3a3' }),
    dt('6th Day', 'shoot', 8, { lunchDurationHrs: 0.5, premiumMultiplier: 1.5, color: '#ea580c' }),
    dt('7th Day', 'shoot', 8, { lunchDurationHrs: 0.5, premiumMultiplier: 2.0, color: '#dc2626' }),
    dt('Rest', null, 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, premiumMultiplier: 0, color: '#d1d5db' }),
  ],

  // ═══════════════════════════════════════════════════════════════
  // US — DGA (Directors, UPMs, ADs)
  // ═══════════════════════════════════════════════════════════════
  'US-DGA': [
    dt('Prep Day', 'prep', 8, { lunchDurationHrs: 0.5, notes: 'Included in program fee/weekly salary', color: '#f59e0b' }),
    dt('Shoot Day', 'shoot', 8, { lunchDurationHrs: 0.5, notes: 'Included in program fee', color: '#3b82f6' }),
    dt('Post Day', 'wrap', 8, { lunchDurationHrs: 0.5, notes: 'Editing/post days', color: '#8b5cf6' }),
    dt('Days Beyond Guarantee', 'shoot', 8, { lunchDurationHrs: 0.5, notes: 'Separate daily rate applies', color: '#ea580c' }),
    dt('Travel', 'travel', 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, notes: '$60/day distant location fee', color: '#6b7280' }),
    dt('Idle', null, 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, notes: '$60/day distant location fee continues', color: '#a3a3a3' }),
    dt('Rest', null, 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, premiumMultiplier: 0, color: '#d1d5db' }),
  ],

  // ═══════════════════════════════════════════════════════════════
  // France
  // ═══════════════════════════════════════════════════════════════
  FR: [
    dt('Tournage (Shoot)', 'shoot', 10, { lunchDurationHrs: 1, notes: 'Shooting day, equivalence hours may apply for 5+ day contracts', color: '#3b82f6' }),
    dt('Préparation (Prep)', 'prep', 8, { lunchDurationHrs: 1, notes: 'Standard labor law hours', color: '#f59e0b' }),
    dt('Post-Production', 'wrap', 8, { lunchDurationHrs: 1, notes: 'Standard labor law hours', color: '#8b5cf6' }),
    dt('Déplacement (Travel)', 'travel', 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, color: '#6b7280' }),
    dt('Nuit (Night)', 'shoot', 8, { lunchDurationHrs: 1, premiumMultiplier: 1.5, notes: '22:00-06:00, +50%', color: '#7c3aed' }),
    dt('Dimanche (Sunday)', 'shoot', 10, { lunchDurationHrs: 1, premiumMultiplier: 2.0, notes: '+100% + 7hr recovery day', color: '#dc2626' }),
    dt('Jour Férié (Holiday)', 'shoot', 10, { lunchDurationHrs: 1, premiumMultiplier: 2.0, notes: '+100% + 7hr recovery day', color: '#dc2626' }),
    dt('Repos', null, 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, premiumMultiplier: 0, color: '#d1d5db' }),
  ],

  // ═══════════════════════════════════════════════════════════════
  // Germany
  // ═══════════════════════════════════════════════════════════════
  DE: [
    dt('Drehtag (Shoot)', 'shoot', 10, { lunchDurationHrs: 0.75, notes: '10hr standard, 12hr max, 13th hr prohibited', color: '#3b82f6' }),
    dt('Vorbereitung (Prep)', 'prep', 8, { lunchDurationHrs: 0.75, notes: 'At producer request', color: '#f59e0b' }),
    dt('Reisetag (Travel)', 'travel', 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, color: '#6b7280' }),
    dt('Samstag (Saturday)', 'shoot', 10, { lunchDurationHrs: 0.75, premiumMultiplier: 1.25, notes: '+25% Saturday surcharge', color: '#ea580c' }),
    dt('Sonntag (Sunday)', 'shoot', 10, { lunchDurationHrs: 0.75, premiumMultiplier: 1.75, notes: '+75% + compensatory day off', color: '#dc2626' }),
    dt('Feiertag (Holiday)', 'shoot', 10, { lunchDurationHrs: 0.75, premiumMultiplier: 2.0, notes: '+100% + day off', color: '#dc2626' }),
    dt('Ruhetag (Rest)', null, 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, premiumMultiplier: 0, color: '#d1d5db' }),
  ],

  // ═══════════════════════════════════════════════════════════════
  // Spain
  // ═══════════════════════════════════════════════════════════════
  ES: [
    dt('Rodaje (Shoot)', 'shoot', 10, { lunchDurationHrs: 1, notes: 'Shooting day', color: '#3b82f6' }),
    dt('Preparación (Prep)', 'prep', 8, { lunchDurationHrs: 1, color: '#f59e0b' }),
    dt('Desplazamiento (Travel)', 'travel', 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, color: '#6b7280' }),
    dt('Sábado (Saturday)', 'shoot', 10, { lunchDurationHrs: 1, premiumMultiplier: 1.5, color: '#ea580c' }),
    dt('Domingo (Sunday)', 'shoot', 10, { lunchDurationHrs: 1, premiumMultiplier: 2.0, color: '#dc2626' }),
    dt('Festivo (Holiday)', 'shoot', 10, { lunchDurationHrs: 1, premiumMultiplier: 2.0, color: '#dc2626' }),
    dt('Descanso (Rest)', null, 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, premiumMultiplier: 0, color: '#d1d5db' }),
  ],

  // ═══════════════════════════════════════════════════════════════
  // Australia — MEAA
  // ═══════════════════════════════════════════════════════════════
  AU: [
    dt('Work Day', 'shoot', 10, { lunchDurationHrs: 0.5, notes: '10hr standard within 50hr week', color: '#3b82f6' }),
    dt('Travel', 'travel', 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, notes: 'Beyond 20km radius = time counted as worked', color: '#6b7280' }),
    dt('6th Day', 'shoot', 10, { lunchDurationHrs: 0.5, premiumMultiplier: 1.5, color: '#ea580c' }),
    dt('Public Holiday', 'shoot', 10, { lunchDurationHrs: 0.5, premiumMultiplier: 2.5, notes: '×2.5 penalty rate', color: '#dc2626' }),
    dt('Rest', null, 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, premiumMultiplier: 0, color: '#d1d5db' }),
  ],

  // ═══════════════════════════════════════════════════════════════
  // Canada — BCCFU/IATSE
  // ═══════════════════════════════════════════════════════════════
  CA: [
    dt('Work Day', 'shoot', 8, { lunchDurationHrs: 0.5, notes: '8hr standard', color: '#3b82f6' }),
    dt('Prep Day', 'prep', 8, { lunchDurationHrs: 0.5, color: '#f59e0b' }),
    dt('Travel', 'travel', 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, color: '#6b7280' }),
    dt('6th Day', 'shoot', 8, { lunchDurationHrs: 0.5, premiumMultiplier: 1.5, color: '#ea580c' }),
    dt('Stat Holiday', 'shoot', 8, { lunchDurationHrs: 0.5, premiumMultiplier: 2.0, color: '#dc2626' }),
    dt('Rest', null, 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, premiumMultiplier: 0, color: '#d1d5db' }),
  ],

  // ═══════════════════════════════════════════════════════════════
  // India
  // ═══════════════════════════════════════════════════════════════
  IN: [
    dt('Shoot Day', 'shoot', 10, { lunchDurationHrs: 1, notes: 'Standard shooting day', color: '#3b82f6' }),
    dt('Prep Day', 'prep', 8, { lunchDurationHrs: 1, color: '#f59e0b' }),
    dt('Wrap Day', 'wrap', 8, { lunchDurationHrs: 1, color: '#8b5cf6' }),
    dt('Travel', 'travel', 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, color: '#6b7280' }),
    dt('Overtime Day', 'shoot', 10, { premiumMultiplier: 2.0, notes: 'Double rate for OT day under Factories Act', color: '#dc2626' }),
    dt('Festival Holiday', 'shoot', 10, { premiumMultiplier: 2.0, notes: 'Gazetted holiday', color: '#dc2626' }),
    dt('Rest', null, 0, { isWorkDay: false, otApplies: false, mealPenaltyApplies: false, lunchDeducted: false, lunchDurationHrs: 0, premiumMultiplier: 0, color: '#d1d5db' }),
  ],
};

/**
 * Get default day types for a territory.
 * Supports union-specific overrides (e.g., 'UK-EQUITY', 'US-SAG', 'US-DGA').
 */
export function getDefaultDayTypes(territory, unionCode) {
  // Check for union-specific presets first
  const unionKey = `${territory}-${unionCode}`.toUpperCase();
  if (DAY_TYPE_DEFAULTS[unionKey]) return DAY_TYPE_DEFAULTS[unionKey];

  // Fall back to territory defaults
  return DAY_TYPE_DEFAULTS[territory] || DAY_TYPE_DEFAULTS.UK;
}
