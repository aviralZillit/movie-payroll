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
