import Decimal from 'decimal.js';
import { getEmploymentCategory as getCategory, getEmploymentRules } from '../config/employmentTypeRules.js';

// Re-export for backward compat
export function getEmploymentCategory(employmentStatus) {
  return getCategory(employmentStatus);
}

// Zero-fringe result template
function zeroFringes(territory) {
  return {
    holidayPay: 0, employerNi: 0, employerPension: 0, hwContribution: 0,
    totalFringes: 0, territory, note: 'Corporate entity — no employer fringes',
  };
}

/**
 * Territory-aware fringe calculator.
 * Dispatches to territory-specific logic based on dealMemo.territory.
 * Returns itemized fringe breakdown + total.
 */
export function calculateTerritoryFringes(grossPay, totalWorkedHrs, dealMemo) {
  const gross = new Decimal(grossPay || 0);
  const territory = dealMemo.territory || dealMemo.country || 'UK';
  const empCategory = getEmploymentCategory(dealMemo.employmentStatus);

  // Corporate entities (Ltd, Loan-out, GmbH, etc.) — zero fringes
  if (empCategory === 'corporate') {
    return zeroFringes(territory);
  }

  switch (territory) {
    case 'US': return calculateUSFringesV2(gross, totalWorkedHrs, dealMemo, empCategory);
    case 'CA': return calculateCAFringes(gross, dealMemo, empCategory);
    case 'AU': return calculateAUFringes(gross, dealMemo, empCategory);
    case 'DE': return calculateDEFringes(gross, dealMemo, empCategory);
    case 'FR': return calculateFRFringes(gross, dealMemo, empCategory);
    case 'IE': return calculateIEFringes(gross, dealMemo, empCategory);
    default: return calculateUKFringesV2(gross, dealMemo, empCategory); // UK + fallback
  }
}

// ─── UK ──────────────────────────────────────────────────────────────
function calculateUKFringesV2(gross, dm, empCategory = 'employee') {
  // DB stores percentages as whole numbers (12.07 = 12.07%, 0.5 = 0.5%)
  // Always divide DB values by 100; fallbacks are already decimals
  const pct = (dbVal, fallback) => dbVal != null ? dbVal / 100 : fallback;

  // Holiday pay — applies to employees AND self-employed (statutory entitlement)
  const hpMode = dm.hpMode || 'excl';
  let holidayPay = new Decimal(0);

  if (hpMode === 'excl') {
    const hpPct = pct(dm.holidayPayPct ?? dm.rfHolidayPayPct, 0.1207);
    holidayPay = gross.times(hpPct);
  }

  // Employer NIC — employees only (self-employed pay their own NI)
  let employerNi = new Decimal(0);
  if (empCategory === 'employee') {
    const niPct = pct(dm.employerNiPct ?? dm.rfNicPct, 0.138);
    const niThreshold = new Decimal(dm.employerNiThresholdWeekly ?? dm.rfNicThreshold ?? 967);
    const niable = Decimal.max(gross.minus(niThreshold), 0);
    employerNi = niable.times(niPct);
  }

  // Pension — employees only
  let employerPension = new Decimal(0);
  if (empCategory === 'employee') {
    const pensionPct = pct(dm.unionPensionPct ?? dm.pensionPct, 0.03);
    employerPension = gross.times(pensionPct);
  }

  // Apprenticeship levy — employees only
  let apprenticeshipLevy = new Decimal(0);
  if (empCategory === 'employee') {
    const levyPct = pct(dm.apprenticeshipLevyPct, 0);
    apprenticeshipLevy = gross.times(levyPct);
  }

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
function calculateUSFringesV2(gross, totalWorkedHrs, dm, empCategory = 'employee') {
  // Self-employed (1099): no employer FICA/FUTA/WC, but union P&H may still apply
  const isEmployee = empCategory === 'employee';

  // Union-specific pension (SAG:18.5%, WGA:21%, DGA:6%, IATSE:7.5%)
  const pensionPct = dm.unionPensionPct ?? dm.rfPensionPct ?? 0.20;
  const pensionHealth = gross.times(pensionPct); // union P&H applies regardless

  // Vacation & Holiday (8.583%) — employees only
  const vacPct = dm.vacationHolidayPct ?? 0.08583;
  const vacationHoliday = isEmployee ? gross.times(vacPct) : new Decimal(0);

  // FICA - Social Security (6.2% employer on first $168,600/yr) — employees only
  const ssThresholdWeekly = new Decimal(168600).div(52);
  const socialSecurity = isEmployee ? Decimal.min(gross, ssThresholdWeekly).times(0.062) : new Decimal(0);

  // Medicare (1.45% employer, no cap) — employees only
  const medicare = isEmployee ? gross.times(0.0145) : new Decimal(0);

  // FUTA (effective 0.6% on first $7,000/yr) — employees only
  const futaThresholdWeekly = new Decimal(7000).div(52);
  const futa = isEmployee ? Decimal.min(gross, futaThresholdWeekly).times(0.006) : new Decimal(0);

  // Workers Comp (CA film ~3.5%) — employees only
  const wcPct = dm.workersCompPct ?? dm.rfWorkersCompPct ?? 0.035;
  const workersComp = isEmployee ? gross.times(wcPct) : new Decimal(0);

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
function calculateCAFringes(gross, dm, empCategory = 'employee') {
  const isEmployee = empCategory === 'employee';
  const cpp = isEmployee ? gross.times(0.0595) : new Decimal(0);
  const ei = isEmployee ? gross.times(0.0237) : new Decimal(0);
  const vacPay = gross.times(0.04);     // 4% vacation — statutory, applies to all
  const pensionPct = dm.unionPensionPct ?? 0.05;
  const pension = isEmployee ? gross.times(pensionPct) : new Decimal(0);
  const wc = isEmployee ? gross.times(dm.workersCompPct ?? 0.02) : new Decimal(0);
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
function calculateAUFringes(gross, dm, empCategory = 'employee') {
  const isEmployee = empCategory === 'employee';
  // Super is mandatory for employees; contractors may negotiate it
  const superPct = dm.unionPensionPct ?? dm.rfPensionPct ?? 0.115;
  const superannuation = isEmployee ? gross.times(superPct) : new Decimal(0);
  const wc = isEmployee ? gross.times(dm.workersCompPct ?? 0.02) : new Decimal(0);
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
function calculateDEFringes(gross, dm, empCategory = 'employee') {
  const isEmployee = empCategory === 'employee';
  const isSelfEmployed = empCategory === 'self_employed';
  const socialPct = dm.rfNicPct ?? 0.21;
  const social = isEmployee ? gross.times(socialPct) : new Decimal(0);
  const pensionPct = dm.rfPensionPct ?? 0.04;
  const pension = isEmployee ? gross.times(pensionPct) : new Decimal(0);
  // KSK 5% only for self-employed artists/creatives
  const ksk = isSelfEmployed ? gross.times(0.05) : new Decimal(0);
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
function calculateFRFringes(gross, dm, empCategory = 'employee') {
  const isEmployee = empCategory === 'employee';
  // Employer charges — employees only; self-employed handle own cotisations
  const employerCharges = isEmployee ? gross.times(dm.rfNicPct ?? 0.45) : new Decimal(0);
  // Congés payés — statutory for all workers in France
  const holidayPay = gross.times(dm.rfHolidayPayPct ?? 0.10);
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
function calculateIEFringes(gross, dm, empCategory = 'employee') {
  const isEmployee = empCategory === 'employee';
  const hpMode = dm.hpMode || 'excl';
  let holidayPay = new Decimal(0);
  if (hpMode === 'excl') {
    holidayPay = gross.times(dm.rfHolidayPayPct ?? 0.1207);
  }
  // PRSI — employees only
  const prsi = isEmployee ? gross.times(dm.rfNicPct ?? 0.1105) : new Decimal(0);
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
