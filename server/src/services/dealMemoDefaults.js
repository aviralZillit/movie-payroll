import { TerritoryRule } from '../models/index.js';

/**
 * Get territory-aware defaults for a new deal memo.
 * Looks up TerritoryRule and returns populated defaults for all DealMemo fields.
 * Falls back to hardcoded UK/US defaults when no rule is found.
 */
export async function getDealMemoDefaults(territory, unionKey) {
  // Try to find exact match
  let rule = await TerritoryRule.findOne({ unionKey, isActive: true }).lean();

  // Fall back to territory default
  if (!rule) {
    rule = await TerritoryRule.findOne({ territoryCode: territory, isActive: true }).lean();
  }

  // Fall back to hardcoded defaults
  if (!rule) {
    return getHardcodedDefaults(territory);
  }

  return {
    // Basic day
    standardWorkDayHrs: rule.basicHrs || 10,
    lunchBreakHrs: 1,
    workingDayType: rule.workingDayTypes?.[0] || 'SWD',

    // OT
    otRate1x5Multiplier: rule.ot1Multiplier || 1.5,
    otRate2xMultiplier: rule.ot2Multiplier || 2.0,
    goldenTimeEnabled: !!rule.goldenTimeMultiplier,
    goldenTimeAfterHours: rule.goldenTimeAfterHours || null,
    goldenTimeMultiplier: rule.goldenTimeMultiplier || null,
    otRateCap: rule.otRateCap || null,

    // Day premiums
    sixthDayMultiplier: rule.sixthDayMultiplier || 1.5,
    seventhDayMultiplier: rule.seventhDayMultiplier || 2.0,

    // Holiday pay
    hpMode: rule.hpMode || 'excl',
    holidayPayPct: rule.holidayPayPct || 0,

    // Night
    nightPremiumPct: rule.nightPremiumValue ? rule.nightPremiumValue / 100 : 0,
    nightStartTime: rule.nightStartTime || '23:00',

    // Meals
    mealPenaltyAfterHrs: rule.mealIntervalHrs || 6,
    mealPenaltyAmounts: rule.mealPenaltyAmounts || [35],
    mealPaidStatus: rule.mealPaidStatus || 'unpaid',

    // Turnaround
    turnaroundMinHrs: rule.turnaroundMinHrs || 11,

    // Fringes
    holidayPayPct: rule.rfHolidayPayPct || 0,
    employerNiPct: rule.rfNicPct || 0,
    employerNiThreshold: rule.rfNicThreshold || null,
    unionPensionPct: rule.rfPensionPct || 0.03,
    hwPerHour: rule.rfHwPerHour || 0,
    workersCompPct: rule.rfWorkersCompPct || 0,
    rfEmployerTotalEstimate: rule.rfEmployerTotalEstimate || null,

    // Allowance defaults
    kitAllowance: rule.rfKitDefault || 0,
    perDiemRate: rule.rfPerDiemDefault || 0,
    perDiemMandatory: rule.rfPerDiemMandatory || false,
    mileageRate: rule.rfMileageRate || null,

    // Working day types
    workingDayTypes: rule.workingDayTypes || [],
    achApplicable: rule.achApplicable || false,

    // Special
    specialProvisions: rule.specialProvisions || [],
    unionKey: rule.unionKey,
    territoryCode: rule.territoryCode,
  };
}

function getHardcodedDefaults(territory) {
  if (territory === 'US') {
    return {
      standardWorkDayHrs: 8, lunchBreakHrs: 0.5, workingDayType: null,
      otRate1x5Multiplier: 1.5, otRate2xMultiplier: 2.0,
      goldenTimeEnabled: true, goldenTimeAfterHours: 14, goldenTimeMultiplier: 2.0, otRateCap: null,
      sixthDayMultiplier: 1.5, seventhDayMultiplier: 2.0,
      hpMode: 'na', holidayPayPct: 0,
      nightPremiumPct: 0.1, nightStartTime: '00:00',
      mealPenaltyAfterHrs: 6, mealPenaltyAmounts: [75, 25], mealPaidStatus: 'non-deductible',
      turnaroundMinHrs: 10,
      employerNiPct: 0.0765, employerNiThreshold: null, unionPensionPct: 0.075,
      hwPerHour: 26.76, workersCompPct: 0.035, rfEmployerTotalEstimate: '~40%',
      kitAllowance: 100, perDiemRate: 150, perDiemMandatory: true, mileageRate: '67¢/mile',
      workingDayTypes: [], achApplicable: false, specialProvisions: [],
      unionKey: null, territoryCode: 'US',
    };
  }

  // UK default
  return {
    standardWorkDayHrs: 11, lunchBreakHrs: 1, workingDayType: 'SWD',
    otRate1x5Multiplier: 1.5, otRate2xMultiplier: 2.0,
    goldenTimeEnabled: false, goldenTimeAfterHours: null, goldenTimeMultiplier: null, otRateCap: 81.82,
    sixthDayMultiplier: 1.5, seventhDayMultiplier: 2.0,
    hpMode: 'excl', holidayPayPct: 0.1207,
    nightPremiumPct: 0, nightStartTime: '23:00',
    mealPenaltyAfterHrs: 6, mealPenaltyAmounts: [35], mealPaidStatus: 'unpaid',
    turnaroundMinHrs: 11,
    employerNiPct: 0.138, employerNiThreshold: 967, unionPensionPct: 0.03,
    hwPerHour: 0, workersCompPct: 0, rfEmployerTotalEstimate: '~26%',
    kitAllowance: 500, perDiemRate: 35, perDiemMandatory: false, mileageRate: '45p/mile',
    workingDayTypes: ['SWD', 'CWD', 'SCWD'], achApplicable: false, specialProvisions: [],
    unionKey: null, territoryCode: 'UK',
  };
}
