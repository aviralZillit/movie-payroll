import Decimal from 'decimal.js';

/**
 * Calculate employer fringes on gross pay.
 *
 * @param {number} grossPay - the gross pay amount
 * @param {Object} dealMemo - fringe parameters from deal memo
 * @returns {Object} { holidayPay, employerNi, employerPension, apprenticeshipLevy, totalFringes }
 */
export const calculateFringes = (grossPay, dealMemo) => {
  const gross = new Decimal(grossPay);

  // Holiday pay
  let holidayPay = new Decimal(0);
  if (!dealMemo.holidayPayInclusive) {
    const holidayPct = new Decimal(dealMemo.holidayPayPct ?? 0.1207);
    holidayPay = gross.times(holidayPct);
  }

  // Employer NI: 15% of (grossPay - weeklyThreshold), floor at 0
  // Weekly threshold = GBP 96.15 (GBP 5000/52)
  const niPct = new Decimal(dealMemo.employerNiPct ?? 0.15);
  const weeklyThreshold = new Decimal(dealMemo.employerNiThresholdWeekly ?? 96.15);
  const niableAmount = Decimal.max(gross.minus(weeklyThreshold), 0);
  const employerNi = niableAmount.times(niPct);

  // Pension
  const pensionPct = new Decimal(dealMemo.pensionPct ?? 0.03);
  const employerPension = gross.times(pensionPct);

  // Apprenticeship levy
  const levyPct = new Decimal(dealMemo.apprenticeshipLevyPct ?? 0);
  const apprenticeshipLevy = gross.times(levyPct);

  const totalFringes = holidayPay.plus(employerNi).plus(employerPension).plus(apprenticeshipLevy);

  return {
    holidayPay: holidayPay.toDecimalPlaces(2).toNumber(),
    employerNi: employerNi.toDecimalPlaces(2).toNumber(),
    employerPension: employerPension.toDecimalPlaces(2).toNumber(),
    apprenticeshipLevy: apprenticeshipLevy.toDecimalPlaces(2).toNumber(),
    totalFringes: totalFringes.toDecimalPlaces(2).toNumber(),
  };
};
