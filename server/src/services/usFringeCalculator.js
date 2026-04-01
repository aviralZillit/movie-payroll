import Decimal from 'decimal.js';

/**
 * Calculate US employer fringes on gross pay.
 *
 * @param {number} grossPay - the gross pay amount
 * @param {Object} dealMemo - fringe parameters from deal memo
 * @returns {Object} { pensionHealth, vacationHoliday, socialSecurity, medicare, futa, workersComp, totalFringes }
 */
export const calculateUSFringes = (grossPay, dealMemo) => {
  const gross = new Decimal(grossPay);

  // Pension & Health: 20% of covered earnings (DGA/SAG/IATSE standard)
  const phPct = new Decimal(dealMemo.pensionHealthPct ?? 0.20);
  const pensionHealth = gross.times(phPct);

  // Vacation & Holiday: 8.583% (4% vacation + 4.583% holidays)
  const vacHolPct = new Decimal(dealMemo.vacationHolidayPct ?? 0.08583);
  const vacationHoliday = gross.times(vacHolPct);

  // FICA - Social Security: 6.2% employer on first $168,600/yr (2025)
  const ssThresholdAnnual = new Decimal(168600);
  const ssThresholdWeekly = ssThresholdAnnual.dividedBy(52);
  const ssPct = new Decimal(0.062);
  const socialSecurity = Decimal.min(gross, ssThresholdWeekly).times(ssPct);

  // Medicare: 1.45% employer (no cap)
  const medicarePct = new Decimal(0.0145);
  const medicare = gross.times(medicarePct);

  // FUTA: 6% on first $7,000/yr, minus state credit (effective ~0.6%)
  const futaEffectiveRate = new Decimal(0.006);
  const futaThresholdWeekly = new Decimal(7000).dividedBy(52);
  const futa = Decimal.min(gross, futaThresholdWeekly).times(futaEffectiveRate);

  // Workers Comp: varies (CA film ~3.5%)
  const workersCompPct = new Decimal(dealMemo.workersCompPct ?? 0.035);
  const workersComp = gross.times(workersCompPct);

  const totalFringes = pensionHealth
    .plus(vacationHoliday)
    .plus(socialSecurity)
    .plus(medicare)
    .plus(futa)
    .plus(workersComp);

  return {
    pensionHealth: pensionHealth.toDecimalPlaces(2).toNumber(),
    vacationHoliday: vacationHoliday.toDecimalPlaces(2).toNumber(),
    socialSecurity: socialSecurity.toDecimalPlaces(2).toNumber(),
    medicare: medicare.toDecimalPlaces(2).toNumber(),
    futa: futa.toDecimalPlaces(2).toNumber(),
    workersComp: workersComp.toDecimalPlaces(2).toNumber(),
    totalFringes: totalFringes.toDecimalPlaces(2).toNumber(),
  };
};
