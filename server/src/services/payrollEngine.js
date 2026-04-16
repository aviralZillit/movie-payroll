import Decimal from 'decimal.js';
import { calculateDayHours } from './overtimeCalculator.js';
import { calculateMealPenalty } from './mealPenaltyCalculator.js';
import { checkTurnaround } from './turnaroundCalculator.js';
import { calculateFringes } from './fringeCalculator.js';
import { calculateUSFringes } from './usFringeCalculator.js';
import { calculateUSTax } from './usTaxCalculator.js';
import { getOvertimeRules } from './rateEngine.js';
import { calculateTerritoryFringes } from './territoryFringeCalculator.js';
import { calculateTerritoryTax } from './territoryTaxCalculator.js';
import { calculateAllowanceProRating } from './allowanceCalculator.js';
import { getDefaultDayTypes } from '../config/dayTypeDefaults.js';

/**
 * Get the daily rate for an entry based on its dayType and the deal memo rates.
 * When separateRates is enabled on the deal memo, routes to the correct rate
 * (prep/shoot/wrap/travel) and applies the day type premium multiplier.
 */
function getDailyRateForEntry(entry, dealMemo, dayTypeConfig) {
  if (!dealMemo.separateRates) {
    return dealMemo.dailyRate || (dealMemo.weeklyRate / 5) || 0;
  }

  const rateKey = dayTypeConfig?.rateKey || 'shoot';
  const rateMap = {
    prep: dealMemo.prepRate,
    shoot: dealMemo.shootRate || dealMemo.dailyRate,
    wrap: dealMemo.wrapRate,
    travel: dealMemo.travelRate,
  };

  const baseRate = rateMap[rateKey] || dealMemo.dailyRate || (dealMemo.weeklyRate / 5) || 0;
  const premium = dayTypeConfig?.premiumMultiplier || 1.0;
  return baseRate * premium;
}

/**
 * Resolve the dayTypeConfig for an entry from the production day types or defaults.
 */
function resolveDayTypeConfig(entry, dayTypes) {
  const dayTypeName = entry.dayType || 'Shoot';
  return dayTypes.find((dt) => dt.name === dayTypeName) || dayTypes[0] || null;
}

/**
 * Calculate a full payroll item for a timecard + deal memo.
 * Routes to V1 (country-based) or V2 (territory-based) based on schemaVersion.
 *
 * @param {Object} timecard - Timecard document (with entries populated)
 * @param {Object} dealMemo - DealMemo document
 * @returns {Object} payroll item breakdown
 */
export const calculatePayrollItem = async (timecard, dealMemo) => {
  // V2 routing: use territory-aware calculators for schemaVersion >= 2
  if ((dealMemo.schemaVersion || 1) >= 2 && dealMemo.territory) {
    return calculatePayrollItemV2(timecard, dealMemo);
  }
  // V1: existing country-based calculation (unchanged)
  return calculatePayrollItemV1(timecard, dealMemo);
};

/**
 * V2: Territory-aware payroll calculation.
 * Uses multi-tier OT, golden time, H&W per hour, HP modes, cap-aware allowances.
 */
const calculatePayrollItemV2 = async (timecard, dealMemo) => {
  const hourlyRate = new Decimal(dealMemo.hourlyRate || 0);
  const dailyRate = new Decimal(dealMemo.dailyRate || 0);
  const weeklyRate = new Decimal(dealMemo.weeklyRate || 0);

  // --- Resolve day type configurations ---
  const productionDayTypes = timecard.productionId?.dayTypes
    || getDefaultDayTypes(dealMemo.territory || 'UK');

  // --- Base pay ---
  let basePay;
  const payBasis = dealMemo.payBasis || 'weekly';
  if (payBasis === 'weekly') {
    basePay = weeklyRate;
  } else if (dealMemo.separateRates) {
    // When separate rates are enabled, sum per-entry daily rates
    let entryBasePay = new Decimal(0);
    for (const entry of timecard.entries || []) {
      if (!entry.callTime || !entry.wrapTime) continue;
      const dtConfig = resolveDayTypeConfig(entry, productionDayTypes);
      const entryRate = getDailyRateForEntry(entry, dealMemo, dtConfig);
      entryBasePay = entryBasePay.plus(entryRate);
    }
    basePay = entryBasePay;
  } else {
    basePay = dailyRate.times(timecard.daysWorked || 0);
  }

  // HP inclusive adjustment: basic = quoted / (1 + hpPct)
  if (dealMemo.hpMode === 'incl') {
    const hpPct = dealMemo.holidayPayPct != null ? dealMemo.holidayPayPct / 100 : 0.1207;
    basePay = basePay.div(1 + hpPct);
  }

  // --- Deal type, rate type, and employment type flags ---
  const isBuyout = dealMemo.rateType === 'buyout' || dealMemo.rateType === 'all_in';
  const isFlatDeal = ['flat', 'picture', 'per_film', 'flat_fee'].includes(dealMemo.dealType);

  // Employment type rules — determines which payroll features apply
  let empRules;
  try {
    const { getEmploymentRules } = await import('../config/employmentTypeRules.js');
    empRules = getEmploymentRules(dealMemo.employmentStatus);
  } catch {
    empRules = { payroll: { overtime: true, mealPenalties: true, nightPremium: true, dayPremiums: true, turnaroundPenalties: true } };
  }
  const noOT = !empRules.payroll.overtime || isBuyout || isFlatDeal;
  const noPremiums = !empRules.payroll.dayPremiums || isFlatDeal || isBuyout;

  // For flat deals, base pay is the fixed amount — no per-day multiplication
  if (isFlatDeal) {
    basePay = weeklyRate; // flat fee stored as weeklyRate
  }

  // --- OT calculation (skip for buyout and flat deals) ---
  let totalOt1x5 = new Decimal(0);
  let totalOt2x = new Decimal(0);
  let totalGoldenTime = new Decimal(0);

  if (!noOT) {
    const otRate1x5 = new Decimal(dealMemo.otRate1x5 || hourlyRate.times(1.5).toNumber());
    const otRate2x = new Decimal(dealMemo.otRate2x || hourlyRate.times(2).toNumber());

    // Apply OT rate cap if set (e.g. UK Camera £81.82)
    const otCap = dealMemo.otRateCap ? new Decimal(dealMemo.otRateCap) : null;
    const effectiveOt1x5 = otCap ? Decimal.min(otRate1x5, otCap) : otRate1x5;
    const effectiveOt2x = otCap ? Decimal.min(otRate2x, otCap) : otRate2x;

    totalOt1x5 = new Decimal(timecard.totalOt1x5Hrs || 0).times(effectiveOt1x5);
    totalOt2x = new Decimal(timecard.totalOt2xHrs || 0).times(effectiveOt2x);

    // Golden time (IATSE: 2x from hour 14)
    if (dealMemo.goldenTimeEnabled && dealMemo.goldenTimeMultiplier) {
      const gtHrs = new Decimal(timecard.totalGoldenTimeHrs || 0);
      totalGoldenTime = gtHrs.times(hourlyRate).times(dealMemo.goldenTimeMultiplier);
    }
  }

  // --- Meal penalties (skip if disabled or flat/buyout deal) ---
  let mealPenaltyPay = new Decimal(0);
  for (const entry of timecard.entries || []) {
    if (dealMemo.mealPenaltyEnabled === false || !empRules.payroll.mealPenalties || isFlatDeal) break;
    if (entry.mealPenaltyCount > 0) {
      const dtConfig = resolveDayTypeConfig(entry, productionDayTypes);
      // Skip meal penalty if day type config says it doesn't apply
      if (dtConfig?.mealPenaltyApplies === false) continue;

      const amounts = dealMemo.mealPenaltyAmounts || [dealMemo.mealPenaltyRate || 0];
      for (let i = 0; i < entry.mealPenaltyCount; i++) {
        const amount = amounts[Math.min(i, amounts.length - 1)] || 0;
        mealPenaltyPay = mealPenaltyPay.plus(amount);
      }
    }
  }

  // --- Day premiums (skip for flat/buyout deals) ---
  let sixthDayPay = new Decimal(0);
  let seventhDayPay = new Decimal(0);
  if (!noPremiums) {
    for (const entry of timecard.entries || []) {
      if (entry.isSixthDay && entry.callTime && entry.wrapTime && !entry.isRestDay) {
        sixthDayPay = sixthDayPay.plus(dailyRate.times((dealMemo.sixthDayMultiplier || 1.5) - 1));
      }
      if (entry.isSeventhDay && entry.callTime && entry.wrapTime && !entry.isRestDay) {
        seventhDayPay = seventhDayPay.plus(dailyRate.times((dealMemo.seventhDayMultiplier || 2.0) - 1));
      }
    }
  }

  // --- Night premium (skip if disabled or flat deal) ---
  const nightHrs = new Decimal(timecard.totalNightHrs || 0);
  const nightPct = (dealMemo.nightPremiumEnabled !== false && empRules.payroll.nightPremium && !isFlatDeal)
    ? (dealMemo.nightPremiumPct != null ? dealMemo.nightPremiumPct / 100 : 0)
    : 0;
  const nightPremiumPay = nightHrs.times(hourlyRate).times(nightPct);

  // --- Turnaround penalties ---
  let turnaroundPenaltyPay = new Decimal(0);
  for (const entry of timecard.entries || []) {
    if (entry.turnaroundViolation) {
      turnaroundPenaltyPay = turnaroundPenaltyPay.plus(
        new Decimal(entry.turnaroundShortfallHrs || 0).times(hourlyRate).times(dealMemo.turnaroundPenaltyMultiplier || 1.5)
      );
    }
  }

  // --- Allowances (v2 cap-aware, split taxable vs non-taxable) ---
  let taxableAllowances = new Decimal(0);
  let nonTaxableAllowances = new Decimal(0);
  if (dealMemo.allowances && dealMemo.allowances.length > 0) {
    const breakdown = calculateAllowanceProRating(dealMemo.allowances, timecard.entries, timecard.daysWorked);
    for (const a of breakdown) {
      const amt = new Decimal(a.weeklyTotal || 0);
      if (a.taxTreatment === 'non-taxable' || a.taxTreatment === 'non_taxable' || a.taxTreatment === 'reimbursement' || a.taxTreatment === 'partly-exempt') {
        nonTaxableAllowances = nonTaxableAllowances.plus(amt);
      } else {
        taxableAllowances = taxableAllowances.plus(amt);
      }
    }
  } else {
    // Fallback to v1 flat allowances (all treated as taxable)
    taxableAllowances = new Decimal(dealMemo.kitAllowance || 0)
      .plus(dealMemo.phoneAllowance || 0)
      .plus(dealMemo.computerAllowance || 0)
      .plus(dealMemo.carAllowance || 0)
      .plus(new Decimal(dealMemo.travelAllowance || 0).times(timecard.daysWorked || 0))
      .plus(new Decimal(dealMemo.perDiemRate || 0).times(timecard.daysWorked || 0));
  }
  const totalAllowances = taxableAllowances.plus(nonTaxableAllowances);

  // --- Fringeable base (excludes non-taxable allowances) ---
  const fringeableGross = basePay
    .plus(totalOt1x5).plus(totalOt2x).plus(totalGoldenTime)
    .plus(mealPenaltyPay).plus(turnaroundPenaltyPay)
    .plus(sixthDayPay).plus(seventhDayPay).plus(nightPremiumPay)
    .plus(taxableAllowances);

  // --- Gross pay (includes all allowances) ---
  const grossPay = fringeableGross.plus(nonTaxableAllowances);

  // --- Territory-aware fringes (calculated on fringeable base, not full gross) ---
  const totalWorkedHrs = (timecard.totalStraightHrs || 0) + (timecard.totalOt1x5Hrs || 0) + (timecard.totalOt2xHrs || 0);
  const fringes = calculateTerritoryFringes(fringeableGross.toNumber(), totalWorkedHrs, dealMemo);

  // --- Territory-aware employee deductions ---
  const taxes = calculateTerritoryTax(grossPay.toNumber(), dealMemo);

  const netPay = grossPay.minus(taxes.totalDeductions);
  const totalCost = grossPay.plus(fringes.totalFringes);

  // --- Build calculation breakdown for every derived value ---
  const territory = dealMemo.territory || dealMemo.country || 'UK';
  const cSym = territory === 'US' ? '$' : territory === 'AU' ? 'A$' : territory === 'CA' ? 'C$' : '£';
  const fmtAmt = (v) => `${cSym}${v.toDecimalPlaces(2).toNumber().toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
  const fmtNum = (v) => typeof v === 'number' ? v : v.toDecimalPlaces(2).toNumber();

  const breakdown = {};

  // Base pay formula
  if (isFlatDeal) {
    breakdown.basePay = { formula: `Flat fee (weekly rate)`, value: fmtNum(basePay) };
  } else if (payBasis === 'weekly') {
    breakdown.basePay = { formula: `Weekly rate`, rate: fmtNum(weeklyRate), value: fmtNum(basePay) };
  } else {
    breakdown.basePay = { formula: `Daily rate × days worked`, rate: fmtNum(dailyRate), days: timecard.daysWorked || 0, value: fmtNum(basePay) };
  }
  if (dealMemo.hpMode === 'incl') {
    const hpPct = dealMemo.holidayPayPct != null ? dealMemo.holidayPayPct : 12.07;
    breakdown.basePay.hpAdjustment = `HP inclusive — base = quoted ÷ ${(1 + hpPct / 100).toFixed(4)}`;
  }

  // OT breakdown
  if (!noOT) {
    const ot1x5Hrs = timecard.totalOt1x5Hrs || 0;
    const ot2xHrs = timecard.totalOt2xHrs || 0;
    const otCap = dealMemo.otRateCap ? dealMemo.otRateCap : null;
    const effectiveOt1x5Rate = otCap ? Math.min((dealMemo.otRate1x5 || hourlyRate.times(1.5).toNumber()), otCap) : (dealMemo.otRate1x5 || hourlyRate.times(1.5).toNumber());
    const effectiveOt2xRate = otCap ? Math.min((dealMemo.otRate2x || hourlyRate.times(2).toNumber()), otCap) : (dealMemo.otRate2x || hourlyRate.times(2).toNumber());

    if (ot1x5Hrs > 0) {
      breakdown.overtime1x5Pay = {
        formula: `${ot1x5Hrs}hrs × ${cSym}${effectiveOt1x5Rate.toFixed(2)}/hr`,
        hours: ot1x5Hrs, rate: effectiveOt1x5Rate, value: fmtNum(totalOt1x5),
        ...(otCap ? { cap: `OT rate capped at ${cSym}${otCap}/hr` } : {}),
      };
    }
    if (ot2xHrs > 0) {
      breakdown.overtime2xPay = {
        formula: `${ot2xHrs}hrs × ${cSym}${effectiveOt2xRate.toFixed(2)}/hr`,
        hours: ot2xHrs, rate: effectiveOt2xRate, value: fmtNum(totalOt2x),
        ...(otCap ? { cap: `OT rate capped at ${cSym}${otCap}/hr` } : {}),
      };
    }
  } else {
    breakdown.overtimeNote = isBuyout ? 'Buyout/All-In — OT absorbed' : isFlatDeal ? 'Flat deal — no OT' : 'Employment type excludes OT';
  }

  // Meal penalty breakdown
  if (mealPenaltyPay.gt(0)) {
    const mealDetails = [];
    for (const entry of timecard.entries || []) {
      if (entry.mealPenaltyCount > 0) {
        mealDetails.push({ day: entry.dayOfWeek || entry.date, increments: entry.mealPenaltyCount });
      }
    }
    const rateUsed = dealMemo.mealPenaltyAmounts?.[0] || dealMemo.mealPenaltyRate || 0;
    breakdown.mealPenaltyPay = {
      formula: `${mealDetails.reduce((s, d) => s + d.increments, 0)} increments × ${cSym}${rateUsed}/increment`,
      details: mealDetails, rate: rateUsed, value: fmtNum(mealPenaltyPay),
    };
  }

  // Turnaround penalty
  if (turnaroundPenaltyPay.gt(0)) {
    const btaDetails = [];
    for (const entry of timecard.entries || []) {
      if (entry.turnaroundViolation) {
        btaDetails.push({ day: entry.dayOfWeek || entry.date, shortfall: entry.turnaroundShortfallHrs || 0 });
      }
    }
    const btaMultiplier = dealMemo.turnaroundPenaltyMultiplier || 1.5;
    const totalShortfallHrs = btaDetails.reduce((s, d) => s + (d.shortfall || 0), 0).toFixed(1);
    breakdown.turnaroundPenaltyPay = {
      formula: `${totalShortfallHrs}hrs shortfall × ${cSym}${hourlyRate.toNumber().toFixed(2)}/hr × ${btaMultiplier} = ${cSym}${fmtNum(turnaroundPenaltyPay)}`,
      details: btaDetails, hourlyRate: fmtNum(hourlyRate), multiplier: btaMultiplier, value: fmtNum(turnaroundPenaltyPay),
    };
  }

  // Day premiums
  if (sixthDayPay.gt(0)) {
    const mult = dealMemo.sixthDayMultiplier || 1.5;
    breakdown.sixthDayPremium = {
      formula: `Daily rate ${cSym}${fmtNum(dailyRate)} × (${mult} - 1) premium`,
      multiplier: mult, dailyRate: fmtNum(dailyRate), value: fmtNum(sixthDayPay),
    };
  }
  if (seventhDayPay.gt(0)) {
    const mult = dealMemo.seventhDayMultiplier || 2.0;
    breakdown.seventhDayPremium = {
      formula: `Daily rate ${cSym}${fmtNum(dailyRate)} × (${mult} - 1) premium`,
      multiplier: mult, dailyRate: fmtNum(dailyRate), value: fmtNum(seventhDayPay),
    };
  }

  // Night premium
  if (nightPremiumPay.gt(0)) {
    const nightHrsVal = timecard.totalNightHrs || 0;
    const nightPctVal = dealMemo.nightPremiumPct != null ? dealMemo.nightPremiumPct : 0;
    breakdown.nightPremium = {
      formula: `${nightHrsVal}hrs × ${cSym}${fmtNum(hourlyRate)}/hr × ${nightPctVal}%`,
      hours: nightHrsVal, hourlyRate: fmtNum(hourlyRate), pct: nightPctVal, value: fmtNum(nightPremiumPay),
    };
  }

  // Gross pay
  const grossComponents = [`Base ${cSym}${fmtNum(basePay)}`];
  if (totalOt1x5.gt(0)) grossComponents.push(`OT 1.5× ${cSym}${fmtNum(totalOt1x5)}`);
  if (totalOt2x.gt(0)) grossComponents.push(`OT 2× ${cSym}${fmtNum(totalOt2x)}`);
  if (mealPenaltyPay.gt(0)) grossComponents.push(`Meal penalties ${cSym}${fmtNum(mealPenaltyPay)}`);
  if (turnaroundPenaltyPay.gt(0)) grossComponents.push(`BTA ${cSym}${fmtNum(turnaroundPenaltyPay)}`);
  if (sixthDayPay.gt(0)) grossComponents.push(`6th day ${cSym}${fmtNum(sixthDayPay)}`);
  if (seventhDayPay.gt(0)) grossComponents.push(`7th day ${cSym}${fmtNum(seventhDayPay)}`);
  if (nightPremiumPay.gt(0)) grossComponents.push(`Night ${cSym}${fmtNum(nightPremiumPay)}`);
  if (totalAllowances.gt(0)) grossComponents.push(`Allowances ${cSym}${fmtNum(totalAllowances)}`);
  breakdown.grossPay = { formula: grossComponents.join(' + '), value: fmtNum(grossPay) };

  // Fringes breakdown (from territory calculator) — territory-aware labels & currency
  const fringeableBase = fringeableGross.toDecimalPlaces(2).toNumber();
  const isUS = territory === 'US';

  // US returns separate fringe fields; map them to breakdown for UI
  if (isUS) {
    if (fringes.vacationHoliday > 0) {
      const vacPct = dealMemo.vacationHolidayPct ?? dealMemo.holidayPayPct ?? 8.583;
      breakdown.holidayPay = {
        label: 'Vacation & Holiday',
        formula: `${vacPct}% × ${cSym}${fringeableBase.toFixed(2)}`,
        pct: vacPct, base: fringeableBase, value: fringes.vacationHoliday,
      };
    }
    if (fringes.socialSecurity > 0 || fringes.medicare > 0) {
      const ficaTotal = (fringes.socialSecurity || 0) + (fringes.medicare || 0);
      breakdown.employerNi = {
        label: 'FICA (SS + Medicare)',
        formula: `SS 6.2% + Med 1.45% × ${cSym}${fringeableBase.toFixed(2)}`,
        value: ficaTotal,
      };
    }
    if (fringes.pensionHealth > 0) {
      const penPct = dealMemo.unionPensionPct ?? dealMemo.pensionPct ?? 7.5;
      breakdown.employerPension = {
        label: 'Union P&H',
        formula: `${penPct}% × ${cSym}${fringeableBase.toFixed(2)}`,
        pct: penPct, base: fringeableBase, value: fringes.pensionHealth,
      };
    }
    if (fringes.workersComp > 0) {
      const wcPct = dealMemo.workersCompPct ?? 3.5;
      breakdown.workersComp = {
        label: "Workers' Comp",
        formula: `${wcPct}% × ${cSym}${fringeableBase.toFixed(2)}`,
        value: fringes.workersComp,
      };
    }
    if (fringes.futa > 0) {
      breakdown.futa = {
        label: 'FUTA',
        formula: `0.6% × min(${cSym}${fringeableBase.toFixed(2)}, ${cSym}${(7000/52).toFixed(2)}/wk cap)`,
        value: fringes.futa,
      };
    }
    if (fringes.hwContribution > 0) {
      breakdown.hwContribution = {
        label: 'H&W Per Hour',
        formula: `${cSym}${(dealMemo.hwPerHour || 0).toFixed(2)}/hr × ${totalWorkedHrs.toFixed(1)}hrs`,
        value: fringes.hwContribution,
      };
    }
    breakdown.totalFringes = {
      formula: 'Vacation + FICA + P&H + WC + FUTA + H&W',
      value: fringes.totalFringes,
    };
  } else {
    // UK / other territories
    if (fringes.holidayPay > 0) {
      const hpPctUsed = dealMemo.holidayPayPct ?? dealMemo.rfHolidayPayPct ?? 12.07;
      breakdown.holidayPay = {
        label: 'Holiday Pay',
        formula: `${hpPctUsed}% × ${cSym}${fringeableBase.toFixed(2)} (fringeable base)`,
        pct: hpPctUsed, base: fringeableBase, value: fringes.holidayPay,
      };
    }
    if (fringes.employerNi > 0) {
      const niPct = dealMemo.employerNiPct ?? dealMemo.rfNicPct ?? 13.8;
      const threshold = dealMemo.employerNiThresholdWeekly ?? dealMemo.rfNicThreshold ?? 175;
      breakdown.employerNi = {
        label: 'Employer NI',
        formula: `${niPct}% × max(${cSym}${fringeableBase.toFixed(2)} - ${cSym}${threshold}, 0)`,
        pct: niPct, base: fringeableBase, threshold, value: fringes.employerNi,
      };
    }
    if (fringes.employerPension > 0) {
      const penPct = dealMemo.unionPensionPct ?? dealMemo.pensionPct ?? 3;
      breakdown.employerPension = {
        label: 'Employer Pension',
        formula: `${penPct}% × ${cSym}${fringeableBase.toFixed(2)}`,
        pct: penPct, base: fringeableBase, value: fringes.employerPension,
      };
    }
    breakdown.totalFringes = {
      formula: `Holiday Pay + Employer NI + Pension${fringes.apprenticeshipLevy > 0 ? ' + Apprenticeship Levy' : ''}`,
      value: fringes.totalFringes,
    };
  }

  // Employee deductions (zero for corporate entities)
  const taxLabel = isUS ? 'Federal/State Tax' : 'PAYE';
  const empTaxLabel = isUS ? 'Employee FICA' : 'Employee NI';
  if (taxes.breakdown?.note) {
    breakdown.deductionsNote = taxes.breakdown.note;
  }
  if (taxes.incomeTax > 0) {
    breakdown.incomeTax = { label: taxLabel, formula: taxes.breakdown?.incomeTax || `${taxLabel} on gross ${cSym}${fmtNum(grossPay)}`, value: taxes.incomeTax };
  }
  if (taxes.employeeNi > 0) {
    breakdown.employeeNi = { label: empTaxLabel, formula: taxes.breakdown?.employeeNi || `${empTaxLabel} on gross ${cSym}${fmtNum(grossPay)}`, value: taxes.employeeNi };
  }

  // Net pay
  breakdown.netPay = {
    formula: `Gross ${cSym}${fmtNum(grossPay)} - Tax ${cSym}${fmtNum(new Decimal(taxes.incomeTax || 0))} - ${empTaxLabel} ${cSym}${fmtNum(new Decimal(taxes.employeeNi || 0))}${taxes.employeePension > 0 ? ` - Pension ${cSym}${fmtNum(new Decimal(taxes.employeePension))}` : ''}`,
    value: fmtNum(netPay),
  };

  // Total cost
  breakdown.totalCost = {
    formula: `Gross ${cSym}${fmtNum(grossPay)} + Fringes ${cSym}${fringes.totalFringes.toFixed(2)}`,
    value: fmtNum(totalCost),
  };

  return {
    basePay: basePay.toDecimalPlaces(2).toNumber(),
    overtime1x5Pay: totalOt1x5.toDecimalPlaces(2).toNumber(),
    overtime2xPay: totalOt2x.toDecimalPlaces(2).toNumber(),
    goldenTimePay: totalGoldenTime.toDecimalPlaces(2).toNumber(),
    mealPenaltyPay: mealPenaltyPay.toDecimalPlaces(2).toNumber(),
    turnaroundPenaltyPay: turnaroundPenaltyPay.toDecimalPlaces(2).toNumber(),
    sixthDayPremium: sixthDayPay.toDecimalPlaces(2).toNumber(),
    seventhDayPremium: seventhDayPay.toDecimalPlaces(2).toNumber(),
    nightPremium: nightPremiumPay.toDecimalPlaces(2).toNumber(),
    kitAllowance: dealMemo.kitAllowance || 0,
    travelAllowance: dealMemo.travelAllowance || 0,
    perDiem: dealMemo.perDiemRate || 0,
    phoneAllowance: dealMemo.phoneAllowance || 0,
    computerAllowance: dealMemo.computerAllowance || 0,
    carAllowance: dealMemo.carAllowance || 0,
    otherEarnings: totalAllowances.toDecimalPlaces(2).toNumber(),
    grossPay: grossPay.toDecimalPlaces(2).toNumber(),
    holidayPay: fringes.holidayPay || 0,
    employerNi: fringes.employerNi || 0,
    employerPension: fringes.employerPension || 0,
    apprenticeshipLevy: fringes.apprenticeshipLevy || 0,
    hwContribution: fringes.hwContribution || 0,
    totalFringes: fringes.totalFringes || 0,
    employeeNi: taxes.employeeNi || 0,
    incomeTax: taxes.incomeTax || 0,
    employeePension: taxes.employeePension || 0,
    studentLoan: 0,
    otherDeductions: 0,
    totalDeductions: taxes.totalDeductions || 0,
    netPay: netPay.toDecimalPlaces(2).toNumber(),
    totalCost: totalCost.toDecimalPlaces(2).toNumber(),
    breakdown,
    // Meta
    daysWorked: timecard.daysWorked,
    totalHours: totalWorkedHrs,
    otHours: (timecard.totalOt1x5Hrs || 0) + (timecard.totalOt2xHrs || 0),
    territory: dealMemo.territory,
    schemaVersion: 2,
  };
};

/**
 * V1: Original country-based payroll calculation (unchanged for backward compat).
 */
const calculatePayrollItemV1 = async (timecard, dealMemo) => {
  const hourlyRate = new Decimal(dealMemo.hourlyRate || 0);
  const dailyRate = new Decimal(dealMemo.dailyRate || 0);
  const weeklyRate = new Decimal(dealMemo.weeklyRate || 0);
  const otRate1x5 = new Decimal(dealMemo.otRate1x5 || hourlyRate.times(1.5));
  const otRate2x = new Decimal(dealMemo.otRate2x || hourlyRate.times(2));
  const payBasis = dealMemo.payBasis || 'weekly';

  // --- Resolve day type configurations ---
  const territory = dealMemo.country === 'US' ? 'US' : 'UK';
  const productionDayTypes = timecard.productionId?.dayTypes
    || getDefaultDayTypes(territory);

  // Fetch OT rules for the union/dept
  const overtimeRules = await getOvertimeRules(
    dealMemo.unionId._id || dealMemo.unionId,
    dealMemo.departmentId._id || dealMemo.departmentId
  );

  let totalStraightHrs = new Decimal(0);
  let totalOt1x5Hrs = new Decimal(0);
  let totalOt2xHrs = new Decimal(0);
  let totalNightHrs = new Decimal(0);
  let totalMealPenalties = new Decimal(0);
  let totalMealPenaltyAmount = new Decimal(0);
  let totalTurnaroundPenaltyHrs = new Decimal(0);
  let sixthDayPremiumPay = new Decimal(0);
  let seventhDayPremiumPay = new Decimal(0);
  let nightPremiumPay = new Decimal(0);
  let daysWorked = 0;

  const entries = timecard.entries || [];
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];

    if (!entry.callTime || !entry.wrapTime) {
      continue;
    }

    daysWorked++;

    // Resolve day type config for this entry
    const dayTypeConfig = resolveDayTypeConfig(entry, productionDayTypes);

    // Calculate day hours — pass standardHoursOverride from day type config
    const otOptions = {};
    if (dayTypeConfig?.standardHours) {
      otOptions.standardHoursOverride = dayTypeConfig.standardHours;
    }

    let hours;
    if (dayTypeConfig?.otApplies === false) {
      // No OT for this day type — all hours are straight
      hours = calculateDayHours(entry, dealMemo, overtimeRules, otOptions);
      // Override: put all hours into straight, zero out OT
      hours.straightHrs = hours.totalWorkedHrs;
      hours.ot1x5Hrs = 0;
      hours.ot2xHrs = 0;
    } else {
      hours = calculateDayHours(entry, dealMemo, overtimeRules, otOptions);
    }

    totalStraightHrs = totalStraightHrs.plus(hours.straightHrs);
    totalOt1x5Hrs = totalOt1x5Hrs.plus(hours.ot1x5Hrs);
    totalOt2xHrs = totalOt2xHrs.plus(hours.ot2xHrs);
    totalNightHrs = totalNightHrs.plus(hours.nightHrs);

    // Meal penalty — skip if day type config says it doesn't apply
    if (dayTypeConfig?.mealPenaltyApplies === false) {
      // No meal penalty for this day type
    } else {
      const mealPenalty = calculateMealPenalty(entry, dealMemo);
      totalMealPenalties = totalMealPenalties.plus(mealPenalty.count);
      totalMealPenaltyAmount = totalMealPenaltyAmount.plus(mealPenalty.amount);
    }

    // Turnaround violation check
    if (i > 0) {
      const prevEntry = sortedEntries[i - 1];
      if (prevEntry.wrapTime) {
        const turnaround = checkTurnaround(
          prevEntry.wrapTime,
          prevEntry.date,
          entry.callTime,
          entry.date,
          dealMemo.turnaroundMinHrs || 11
        );

        if (turnaround.violation) {
          totalTurnaroundPenaltyHrs = totalTurnaroundPenaltyHrs.plus(turnaround.penaltyHrs);
        }
      }
    }

    // 6th/7th day premiums
    if (entry.isSixthDay) {
      const sixthMultiplier = new Decimal(dealMemo.sixthDayMultiplier || 1.5);
      const dayBasePay = payBasis === 'daily' ? dailyRate : dailyRate;
      const premium = dayBasePay.times(sixthMultiplier.minus(1));
      sixthDayPremiumPay = sixthDayPremiumPay.plus(premium);
    }
    if (entry.isSeventhDay) {
      const seventhMultiplier = new Decimal(dealMemo.seventhDayMultiplier || 2.0);
      const dayBasePay = dailyRate;
      const premium = dayBasePay.times(seventhMultiplier.minus(1));
      seventhDayPremiumPay = seventhDayPremiumPay.plus(premium);
    }
  }

  // Night premium on total night hours
  const nightPremiumPct = new Decimal(dealMemo.nightPremiumPct || 0.5);
  nightPremiumPay = totalNightHrs.times(hourlyRate).times(nightPremiumPct);

  // Base pay calculation
  let basePay;
  if (payBasis === 'weekly') {
    basePay = weeklyRate;
  } else {
    // daily basis
    basePay = dailyRate.times(daysWorked);
  }

  // Overtime pay
  const overtime1x5Pay = totalOt1x5Hrs.times(otRate1x5);
  const overtime2xPay = totalOt2xHrs.times(otRate2x);

  // Meal penalty pay
  const mealPenaltyPay = totalMealPenaltyAmount;

  // Turnaround penalty pay
  const turnaroundPenaltyMultiplier = new Decimal(dealMemo.turnaroundPenaltyMultiplier || 1.5);
  const turnaroundPenaltyPay = totalTurnaroundPenaltyHrs.times(hourlyRate).times(turnaroundPenaltyMultiplier);

  // Allowances (weekly amounts; if daily, multiply by daysWorked)
  const kitAllowance = dealMemo.kitAllowancePeriod === 'daily'
    ? new Decimal(dealMemo.kitAllowance || 0).times(daysWorked)
    : new Decimal(dealMemo.kitAllowance || 0);
  const travelAllowance = new Decimal(dealMemo.travelAllowance || 0).times(daysWorked);
  const perDiem = new Decimal(dealMemo.perDiemRate || 0).times(daysWorked);
  const phoneAllowance = new Decimal(dealMemo.phoneAllowance || 0);
  const computerAllowance = new Decimal(dealMemo.computerAllowance || 0);
  const carAllowance = new Decimal(dealMemo.carAllowance || 0);

  // Gross pay
  const grossPay = basePay
    .plus(overtime1x5Pay)
    .plus(overtime2xPay)
    .plus(mealPenaltyPay)
    .plus(turnaroundPenaltyPay)
    .plus(sixthDayPremiumPay)
    .plus(seventhDayPremiumPay)
    .plus(nightPremiumPay)
    .plus(kitAllowance)
    .plus(travelAllowance)
    .plus(perDiem)
    .plus(phoneAllowance)
    .plus(computerAllowance)
    .plus(carAllowance);

  // Country-based fringes and deductions
  let holidayPayVal, employerNiVal, employerPensionVal, apprenticeshipLevyVal, totalFringesVal;
  let employeeNiVal, incomeTaxVal, employeePensionVal, totalDeductionsVal;
  // US-specific fields
  let usFringeDetail = null;
  let usTaxDetail = null;

  if (dealMemo.country === 'US') {
    // --- US fringes ---
    const usFringes = calculateUSFringes(grossPay.toNumber(), dealMemo);
    usFringeDetail = usFringes;

    holidayPayVal = new Decimal(usFringes.vacationHoliday);
    employerNiVal = new Decimal(usFringes.socialSecurity).plus(new Decimal(usFringes.medicare));
    employerPensionVal = new Decimal(usFringes.pensionHealth);
    apprenticeshipLevyVal = new Decimal(usFringes.workersComp).plus(new Decimal(usFringes.futa));
    totalFringesVal = new Decimal(usFringes.totalFringes);

    // --- US employee deductions ---
    const usTax = calculateUSTax(grossPay.toNumber(), dealMemo);
    usTaxDetail = usTax;

    employeeNiVal = new Decimal(usTax.employeeSS).plus(new Decimal(usTax.employeeMedicare));
    incomeTaxVal = new Decimal(usTax.federalTax);
    employeePensionVal = new Decimal(usTax.stateTax);
    totalDeductionsVal = new Decimal(usTax.totalDeductions);
  } else {
    // --- UK fringes (default) ---
    const fringes = calculateFringes(grossPay.toNumber(), dealMemo);

    holidayPayVal = new Decimal(fringes.holidayPay);
    employerNiVal = new Decimal(fringes.employerNi);
    employerPensionVal = new Decimal(fringes.employerPension);
    apprenticeshipLevyVal = new Decimal(fringes.apprenticeshipLevy);
    totalFringesVal = new Decimal(fringes.totalFringes);

    // --- UK employee deductions ---
    // Employee NI: 8% of earnings above GBP 242/week (primary threshold 2024/25)
    const employeeNiThreshold = new Decimal(242);
    const employeeNiable = Decimal.max(grossPay.minus(employeeNiThreshold), 0);
    employeeNiVal = employeeNiable.times(0.08);

    // PAYE placeholder: ~20% basic rate on earnings above GBP 242/week
    const payeThreshold = new Decimal(242);
    const taxable = Decimal.max(grossPay.minus(payeThreshold), 0);
    incomeTaxVal = taxable.times(0.20);

    // Employee pension (default 5%)
    employeePensionVal = grossPay.times(0.05);

    totalDeductionsVal = employeeNiVal.plus(incomeTaxVal).plus(employeePensionVal);
  }

  const netPay = grossPay.minus(totalDeductionsVal);
  const totalCost = grossPay.plus(totalFringesVal);

  return {
    basePay: basePay.toDecimalPlaces(2).toNumber(),
    overtime1x5Pay: overtime1x5Pay.toDecimalPlaces(2).toNumber(),
    overtime2xPay: overtime2xPay.toDecimalPlaces(2).toNumber(),
    mealPenaltyPay: mealPenaltyPay.toDecimalPlaces(2).toNumber(),
    turnaroundPenaltyPay: turnaroundPenaltyPay.toDecimalPlaces(2).toNumber(),
    sixthDayPremium: sixthDayPremiumPay.toDecimalPlaces(2).toNumber(),
    seventhDayPremium: seventhDayPremiumPay.toDecimalPlaces(2).toNumber(),
    nightPremium: nightPremiumPay.toDecimalPlaces(2).toNumber(),
    kitAllowance: kitAllowance.toDecimalPlaces(2).toNumber(),
    travelAllowance: travelAllowance.toDecimalPlaces(2).toNumber(),
    perDiem: perDiem.toDecimalPlaces(2).toNumber(),
    phoneAllowance: phoneAllowance.toDecimalPlaces(2).toNumber(),
    computerAllowance: computerAllowance.toDecimalPlaces(2).toNumber(),
    carAllowance: carAllowance.toDecimalPlaces(2).toNumber(),
    otherEarnings: 0,
    grossPay: grossPay.toDecimalPlaces(2).toNumber(),
    // Fringes
    holidayPay: holidayPayVal.toDecimalPlaces(2).toNumber(),
    employerNi: employerNiVal.toDecimalPlaces(2).toNumber(),
    employerPension: employerPensionVal.toDecimalPlaces(2).toNumber(),
    apprenticeshipLevy: apprenticeshipLevyVal.toDecimalPlaces(2).toNumber(),
    totalFringes: totalFringesVal.toDecimalPlaces(2).toNumber(),
    // Employee deductions
    employeeNi: employeeNiVal.toDecimalPlaces(2).toNumber(),
    incomeTax: incomeTaxVal.toDecimalPlaces(2).toNumber(),
    employeePension: employeePensionVal.toDecimalPlaces(2).toNumber(),
    studentLoan: 0,
    otherDeductions: 0,
    totalDeductions: totalDeductionsVal.toDecimalPlaces(2).toNumber(),
    // US-specific detail (null for UK)
    usFringeDetail,
    usTaxDetail,
    netPay: netPay.toDecimalPlaces(2).toNumber(),
    totalCost: totalCost.toDecimalPlaces(2).toNumber(),
    // Summary hours
    totalStraightHrs: totalStraightHrs.toDecimalPlaces(2).toNumber(),
    totalOt1x5Hrs: totalOt1x5Hrs.toDecimalPlaces(2).toNumber(),
    totalOt2xHrs: totalOt2xHrs.toDecimalPlaces(2).toNumber(),
    totalNightHrs: totalNightHrs.toDecimalPlaces(2).toNumber(),
    totalMealPenalties: totalMealPenalties.toNumber(),
    totalTurnaroundPenalties: totalTurnaroundPenaltyHrs.toDecimalPlaces(2).toNumber(),
    daysWorked,
  };
};
