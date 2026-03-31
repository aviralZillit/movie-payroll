import Decimal from 'decimal.js';
import { calculateDayHours } from './overtimeCalculator.js';
import { calculateMealPenalty } from './mealPenaltyCalculator.js';
import { checkTurnaround } from './turnaroundCalculator.js';
import { calculateFringes } from './fringeCalculator.js';
import { getOvertimeRules } from './rateEngine.js';

/**
 * Calculate a full payroll item for a timecard + deal memo.
 *
 * @param {Object} timecard - Timecard document (with entries populated)
 * @param {Object} dealMemo - DealMemo document
 * @returns {Object} payroll item breakdown
 */
export const calculatePayrollItem = async (timecard, dealMemo) => {
  const hourlyRate = new Decimal(dealMemo.hourlyRate || 0);
  const dailyRate = new Decimal(dealMemo.dailyRate || 0);
  const weeklyRate = new Decimal(dealMemo.weeklyRate || 0);
  const otRate1x5 = new Decimal(dealMemo.otRate1x5 || hourlyRate.times(1.5));
  const otRate2x = new Decimal(dealMemo.otRate2x || hourlyRate.times(2));
  const payBasis = dealMemo.payBasis || 'weekly';

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

    // Calculate day hours
    const hours = calculateDayHours(entry, dealMemo, overtimeRules);

    totalStraightHrs = totalStraightHrs.plus(hours.straightHrs);
    totalOt1x5Hrs = totalOt1x5Hrs.plus(hours.ot1x5Hrs);
    totalOt2xHrs = totalOt2xHrs.plus(hours.ot2xHrs);
    totalNightHrs = totalNightHrs.plus(hours.nightHrs);

    // Meal penalty
    const mealPenalty = calculateMealPenalty(entry, dealMemo);
    totalMealPenalties = totalMealPenalties.plus(mealPenalty.count);
    totalMealPenaltyAmount = totalMealPenaltyAmount.plus(mealPenalty.amount);

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

  // Fringes
  const fringes = calculateFringes(grossPay.toNumber(), dealMemo);

  // Employee deductions (placeholder - real PAYE/NI calculations are complex)
  // Employee NI: 8% of earnings above GBP 242/week (primary threshold 2024/25)
  const employeeNiThreshold = new Decimal(242);
  const employeeNiable = Decimal.max(grossPay.minus(employeeNiThreshold), 0);
  const employeeNi = employeeNiable.times(0.08);

  // PAYE placeholder: ~20% basic rate on earnings above GBP 242/week (personal allowance split weekly)
  const payeThreshold = new Decimal(242);
  const taxable = Decimal.max(grossPay.minus(payeThreshold), 0);
  const incomeTax = taxable.times(0.20);

  // Employee pension (default 5%)
  const employeePension = grossPay.times(0.05);

  const totalDeductions = employeeNi.plus(incomeTax).plus(employeePension);
  const netPay = grossPay.minus(totalDeductions);
  const totalCost = grossPay.plus(new Decimal(fringes.totalFringes));

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
    holidayPay: fringes.holidayPay,
    employerNi: fringes.employerNi,
    employerPension: fringes.employerPension,
    apprenticeshipLevy: fringes.apprenticeshipLevy,
    totalFringes: fringes.totalFringes,
    // Employee deductions
    employeeNi: employeeNi.toDecimalPlaces(2).toNumber(),
    incomeTax: incomeTax.toDecimalPlaces(2).toNumber(),
    employeePension: employeePension.toDecimalPlaces(2).toNumber(),
    studentLoan: 0,
    otherDeductions: 0,
    totalDeductions: totalDeductions.toDecimalPlaces(2).toNumber(),
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
