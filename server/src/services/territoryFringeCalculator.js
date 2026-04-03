import Decimal from 'decimal.js';

/**
 * Territory-aware fringe calculator.
 * Dispatches to territory-specific logic based on dealMemo.territory.
 * Returns itemized fringe breakdown + total.
 */
export function calculateTerritoryFringes(grossPay, totalWorkedHrs, dealMemo) {
  const gross = new Decimal(grossPay || 0);
  const territory = dealMemo.territory || dealMemo.country || 'UK';

  switch (territory) {
    case 'US': return calculateUSFringesV2(gross, totalWorkedHrs, dealMemo);
    case 'CA': return calculateCAFringes(gross, dealMemo);
    case 'AU': return calculateAUFringes(gross, dealMemo);
    case 'DE': return calculateDEFringes(gross, dealMemo);
    case 'FR': return calculateFRFringes(gross, dealMemo);
    case 'IE': return calculateIEFringes(gross, dealMemo);
    default: return calculateUKFringesV2(gross, dealMemo); // UK + fallback
  }
}

// ─── UK ──────────────────────────────────────────────────────────────
function calculateUKFringesV2(gross, dm) {
  const hpMode = dm.hpMode || 'excl';
  let holidayPay = new Decimal(0);

  if (hpMode === 'excl') {
    const hpPct = dm.holidayPayPct ?? dm.rfHolidayPayPct ?? 0.1207;
    holidayPay = gross.times(hpPct);
  }
  // 'incl': HP already embedded in rate (basic = quoted/1.1207)
  // 'na': no HP

  const niPct = dm.employerNiPct ?? dm.rfNicPct ?? 0.138;
  const niThreshold = new Decimal(dm.employerNiThresholdWeekly ?? dm.rfNicThreshold ?? 967);
  const niable = Decimal.max(gross.minus(niThreshold), 0);
  const employerNi = niable.times(niPct);

  const pensionPct = dm.unionPensionPct ?? dm.pensionPct ?? 0.03;
  const employerPension = gross.times(pensionPct);

  const levyPct = dm.apprenticeshipLevyPct ?? 0;
  const apprenticeshipLevy = gross.times(levyPct);

  const totalFringes = holidayPay.plus(employerNi).plus(employerPension).plus(apprenticeshipLevy);

  return {
    holidayPay: holidayPay.toDecimalPlaces(2).toNumber(),
    employerNi: employerNi.toDecimalPlaces(2).toNumber(),
    employerPension: employerPension.toDecimalPlaces(2).toNumber(),
    apprenticeshipLevy: apprenticeshipLevy.toDecimalPlaces(2).toNumber(),
    hwContribution: 0,
    totalFringes: totalFringes.toDecimalPlaces(2).toNumber(),
    territory: 'UK',
  };
}

// ─── US ──────────────────────────────────────────────────────────────
function calculateUSFringesV2(gross, totalWorkedHrs, dm) {
  // Union-specific pension (SAG:18.5%, WGA:21%, DGA:6%, IATSE:7.5%)
  const pensionPct = dm.unionPensionPct ?? dm.rfPensionPct ?? 0.20;
  const pensionHealth = gross.times(pensionPct);

  // Vacation & Holiday (8.583%)
  const vacPct = dm.vacationHolidayPct ?? 0.08583;
  const vacationHoliday = gross.times(vacPct);

  // FICA - Social Security (6.2% employer on first $168,600/yr)
  const ssThresholdWeekly = new Decimal(168600).div(52);
  const socialSecurity = Decimal.min(gross, ssThresholdWeekly).times(0.062);

  // Medicare (1.45% employer, no cap)
  const medicare = gross.times(0.0145);

  // FUTA (effective 0.6% on first $7,000/yr)
  const futaThresholdWeekly = new Decimal(7000).div(52);
  const futa = Decimal.min(gross, futaThresholdWeekly).times(0.006);

  // Workers Comp (CA film ~3.5%)
  const wcPct = dm.workersCompPct ?? dm.rfWorkersCompPct ?? 0.035;
  const workersComp = gross.times(wcPct);

  // H&W per hour (IATSE $26-34/hr, Teamsters $28-34/hr)
  const hwRate = new Decimal(dm.hwPerHour ?? dm.rfHwPerHour ?? 0);
  const hwContribution = hwRate.times(totalWorkedHrs || 0);

  const totalFringes = pensionHealth.plus(vacationHoliday).plus(socialSecurity)
    .plus(medicare).plus(futa).plus(workersComp).plus(hwContribution);

  return {
    pensionHealth: pensionHealth.toDecimalPlaces(2).toNumber(),
    vacationHoliday: vacationHoliday.toDecimalPlaces(2).toNumber(),
    socialSecurity: socialSecurity.toDecimalPlaces(2).toNumber(),
    medicare: medicare.toDecimalPlaces(2).toNumber(),
    futa: futa.toDecimalPlaces(2).toNumber(),
    workersComp: workersComp.toDecimalPlaces(2).toNumber(),
    hwContribution: hwContribution.toDecimalPlaces(2).toNumber(),
    holidayPay: 0,
    employerNi: socialSecurity.plus(medicare).toDecimalPlaces(2).toNumber(),
    employerPension: pensionHealth.toDecimalPlaces(2).toNumber(),
    totalFringes: totalFringes.toDecimalPlaces(2).toNumber(),
    territory: 'US',
  };
}

// ─── CANADA ──────────────────────────────────────────────────────────
function calculateCAFringes(gross, dm) {
  const cpp = gross.times(0.0595);      // CPP
  const ei = gross.times(0.0237);       // EI
  const vacPay = gross.times(0.04);     // 4% vacation
  const pensionPct = dm.unionPensionPct ?? 0.05;
  const pension = gross.times(pensionPct);
  const wc = gross.times(dm.workersCompPct ?? 0.02);
  const totalFringes = cpp.plus(ei).plus(vacPay).plus(pension).plus(wc);

  return {
    holidayPay: vacPay.toDecimalPlaces(2).toNumber(),
    employerNi: cpp.plus(ei).toDecimalPlaces(2).toNumber(),
    employerPension: pension.toDecimalPlaces(2).toNumber(),
    hwContribution: 0,
    totalFringes: totalFringes.toDecimalPlaces(2).toNumber(),
    territory: 'CA',
  };
}

// ─── AUSTRALIA ───────────────────────────────────────────────────────
function calculateAUFringes(gross, dm) {
  const superPct = dm.unionPensionPct ?? dm.rfPensionPct ?? 0.115; // 11.5%, rising to 12% July 2026
  const superannuation = gross.times(superPct);
  const wc = gross.times(dm.workersCompPct ?? 0.02);
  const totalFringes = superannuation.plus(wc);

  return {
    holidayPay: 0,
    employerNi: 0,
    employerPension: superannuation.toDecimalPlaces(2).toNumber(),
    hwContribution: 0,
    totalFringes: totalFringes.toDecimalPlaces(2).toNumber(),
    territory: 'AU',
  };
}

// ─── GERMANY ─────────────────────────────────────────────────────────
function calculateDEFringes(gross, dm) {
  const socialPct = dm.rfNicPct ?? 0.21;         // ~21% employer social
  const social = gross.times(socialPct);
  const pensionPct = dm.rfPensionPct ?? 0.04;    // 4% mandatory from Jan 2025
  const pension = gross.times(pensionPct);
  const ksk = gross.times(0.05);                  // KSK 5% on self-employed
  const totalFringes = social.plus(pension).plus(ksk);

  return {
    holidayPay: 0,
    employerNi: social.toDecimalPlaces(2).toNumber(),
    employerPension: pension.toDecimalPlaces(2).toNumber(),
    hwContribution: 0,
    ksk: ksk.toDecimalPlaces(2).toNumber(),
    totalFringes: totalFringes.toDecimalPlaces(2).toNumber(),
    territory: 'DE',
  };
}

// ─── FRANCE ──────────────────────────────────────────────────────────
function calculateFRFringes(gross, dm) {
  const employerCharges = gross.times(dm.rfNicPct ?? 0.45); // ~45% total
  const holidayPay = gross.times(dm.rfHolidayPayPct ?? 0.10); // 10% congés payés
  const totalFringes = employerCharges.plus(holidayPay);

  return {
    holidayPay: holidayPay.toDecimalPlaces(2).toNumber(),
    employerNi: employerCharges.toDecimalPlaces(2).toNumber(),
    employerPension: 0,
    hwContribution: 0,
    totalFringes: totalFringes.toDecimalPlaces(2).toNumber(),
    territory: 'FR',
  };
}

// ─── IRELAND ─────────────────────────────────────────────────────────
function calculateIEFringes(gross, dm) {
  const hpMode = dm.hpMode || 'excl';
  let holidayPay = new Decimal(0);
  if (hpMode === 'excl') {
    holidayPay = gross.times(dm.rfHolidayPayPct ?? 0.1207);
  }
  const prsi = gross.times(dm.rfNicPct ?? 0.1105);   // PRSI employer ~11.05%
  const totalFringes = holidayPay.plus(prsi);

  return {
    holidayPay: holidayPay.toDecimalPlaces(2).toNumber(),
    employerNi: prsi.toDecimalPlaces(2).toNumber(),
    employerPension: 0,
    hwContribution: 0,
    totalFringes: totalFringes.toDecimalPlaces(2).toNumber(),
    territory: 'IE',
  };
}
