import Decimal from 'decimal.js';

/**
 * Calculate US employee tax deductions.
 *
 * @param {number} grossPay - the gross pay amount
 * @param {Object} dealMemo - tax parameters from deal memo
 * @returns {Object} { federalTax, employeeSS, employeeMedicare, stateTax, stateName, totalDeductions }
 */
export const calculateUSTax = (grossPay, dealMemo) => {
  const gross = new Decimal(grossPay);
  const state = dealMemo.state || 'CA';

  // Federal Income Tax (2025 brackets, simplified weekly)
  // Standard deduction: $15,000/yr = $288.46/wk
  const weeklyStandardDeduction = new Decimal('288.46');
  const taxableIncome = Decimal.max(gross.minus(weeklyStandardDeduction), 0);

  // Simplified progressive brackets (weekly amounts)
  // 10% up to $230/wk, 12% to $923, 22% to $2021, 24% to $3846,
  // 32% to $6154, 35% to $13654, 37% above
  const brackets = [
    [new Decimal(230), new Decimal('0.10')],
    [new Decimal(923), new Decimal('0.12')],
    [new Decimal(2021), new Decimal('0.22')],
    [new Decimal(3846), new Decimal('0.24')],
    [new Decimal(6154), new Decimal('0.32')],
    [new Decimal(13654), new Decimal('0.35')],
    [null, new Decimal('0.37')], // null = Infinity
  ];

  let federalTax = new Decimal(0);
  let remaining = taxableIncome;
  let prevLimit = new Decimal(0);

  for (const [limit, rate] of brackets) {
    if (remaining.lte(0)) break;
    const bracketSize = limit !== null ? limit.minus(prevLimit) : remaining;
    const taxable = Decimal.min(remaining, bracketSize);
    federalTax = federalTax.plus(taxable.times(rate));
    remaining = remaining.minus(taxable);
    if (limit !== null) {
      prevLimit = limit;
    }
  }

  // Employee FICA - Social Security: 6.2% on first $168,600/yr
  const ssThresholdWeekly = new Decimal(168600).dividedBy(52);
  const ssPct = new Decimal('0.062');
  const employeeSS = Decimal.min(gross, ssThresholdWeekly).times(ssPct);

  // Employee Medicare: 1.45% (no cap)
  const medicarePct = new Decimal('0.0145');
  const employeeMedicare = gross.times(medicarePct);

  // State Tax
  let stateTax = new Decimal(0);
  if (state === 'CA') {
    // CA simplified: ~8% effective for film industry income
    stateTax = gross.times(new Decimal('0.08'));
    // CA SDI: 1.1%
    stateTax = stateTax.plus(gross.times(new Decimal('0.011')));
  } else if (state === 'NY') {
    // NY simplified: ~7% effective
    stateTax = gross.times(new Decimal('0.07'));
    // NY SDI: 0.5%
    stateTax = stateTax.plus(gross.times(new Decimal('0.005')));
  }
  // Other states: no state tax calculation (simplified)

  const totalDeductions = federalTax
    .plus(employeeSS)
    .plus(employeeMedicare)
    .plus(stateTax);

  return {
    federalTax: federalTax.toDecimalPlaces(2).toNumber(),
    employeeSS: employeeSS.toDecimalPlaces(2).toNumber(),
    employeeMedicare: employeeMedicare.toDecimalPlaces(2).toNumber(),
    stateTax: stateTax.toDecimalPlaces(2).toNumber(),
    stateName: state,
    totalDeductions: totalDeductions.toDecimalPlaces(2).toNumber(),
  };
};
