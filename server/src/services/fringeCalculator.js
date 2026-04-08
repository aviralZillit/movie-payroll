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

  // DB stores percentages as whole numbers (12.07 = 12.07%, 0.5 = 0.5%)
  // Always divide DB values by 100; fallbacks are already decimals
  const pct = (dbVal, fallback) => dbVal != null ? dbVal / 100 : fallback;

  // Holiday pay
  let holidayPay = new Decimal(0);
  if (!dealMemo.holidayPayInclusive) {
    const holidayPct = new Decimal(pct(dealMemo.holidayPayPct, 0.1207));
    holidayPay = gross.times(holidayPct);
  }

  // Employer NI: 13.8% of (grossPay - weeklyThreshold), floor at 0
  const niPct = new Decimal(pct(dealMemo.employerNiPct, 0.138));
  const weeklyThreshold = new Decimal(dealMemo.employerNiThresholdWeekly ?? 96.15);
  const niableAmount = Decimal.max(gross.minus(weeklyThreshold), 0);
  const employerNi = niableAmount.times(niPct);

  // Pension
  const pensionPct = new Decimal(pct(dealMemo.pensionPct, 0.03));
  const employerPension = gross.times(pensionPct);

  // Apprenticeship levy
  const levyPct = new Decimal(pct(dealMemo.apprenticeshipLevyPct, 0));
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
