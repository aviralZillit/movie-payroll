import Decimal from 'decimal.js';
import { getEmploymentCategory } from '../config/employmentTypeRules.js';

// Zero deductions result
function zeroDeductions(territory) {
  return {
    incomeTax: 0, employeeNi: 0, employeePension: 0, stateTax: 0,
    totalDeductions: 0, territory,
    breakdown: { note: 'Corporate entity — no PAYE deductions (invoiced)' },
  };
}

/**
 * Territory-aware employee tax/deductions calculator.
 * Dispatches by territory.
 * Corporate entities (Ltd, Loan-out, etc.) get zero deductions — they invoice.
 */
export function calculateTerritoryTax(grossPay, dealMemo) {
  const gross = new Decimal(grossPay || 0);
  const territory = dealMemo.territory || dealMemo.country || 'UK';

  // Corporate entities don't go through PAYE — they invoice and handle own taxes
  const empCategory = getEmploymentCategory(dealMemo.employmentStatus);
  if (empCategory === 'corporate') {
    return zeroDeductions(territory);
  }

  switch (territory) {
    case 'US': return calculateUSTaxV2(gross, dealMemo);
    case 'CA': return calculateCATax(gross, dealMemo);
    case 'AU': return calculateAUTax(gross, dealMemo);
    case 'DE': return calculateDETax(gross, dealMemo);
    case 'FR': return calculateFRTax(gross, dealMemo);
    default: return calculateUKTaxV2(gross, dealMemo);
  }
}

// ─── UK ──────────────────────────────────────────────────────────────
function calculateUKTaxV2(gross, dm) {
  const weeklyAllowance = new Decimal(242);
  const taxable = Decimal.max(gross.minus(weeklyAllowance), 0);
  const incomeTax = taxable.times(0.20);

  const niThreshold = new Decimal(242);
  const niable = Decimal.max(gross.minus(niThreshold), 0);
  const employeeNi = niable.times(0.08);

  const pensionPct = dm.employeePensionPct ?? 0.05;
  const employeePension = gross.times(pensionPct);

  const totalDeductions = incomeTax.plus(employeeNi).plus(employeePension);

  return {
    incomeTax: incomeTax.toDecimalPlaces(2).toNumber(),
    employeeNi: employeeNi.toDecimalPlaces(2).toNumber(),
    employeePension: employeePension.toDecimalPlaces(2).toNumber(),
    stateTax: 0,
    totalDeductions: totalDeductions.toDecimalPlaces(2).toNumber(),
    territory: 'UK',
    breakdown: {
      incomeTax: `20% × max(£${gross.toFixed(2)} - £242, 0) = £${incomeTax.toDecimalPlaces(2)}`,
      employeeNi: `8% × max(£${gross.toFixed(2)} - £242, 0) = £${employeeNi.toDecimalPlaces(2)}`,
    },
  };
}

// ─── US ──────────────────────────────────────────────────────────────
function calculateUSTaxV2(gross, dm) {
  // Federal progressive tax (2025 weekly brackets)
  const weeklyDeduction = new Decimal(288.46);
  const taxableIncome = Decimal.max(gross.minus(weeklyDeduction), 0);

  const brackets = [
    { limit: 230, rate: 0.10 },
    { limit: 923, rate: 0.12 },
    { limit: 2021, rate: 0.22 },
    { limit: 3846, rate: 0.24 },
    { limit: 6154, rate: 0.32 },
    { limit: 13654, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ];

  let federalTax = new Decimal(0);
  let remaining = taxableIncome;
  let prevLimit = new Decimal(0);

  for (const bracket of brackets) {
    const bracketLimit = new Decimal(bracket.limit);
    const bracketWidth = bracketLimit.minus(prevLimit);
    const taxableInBracket = Decimal.min(remaining, bracketWidth);
    if (taxableInBracket.lte(0)) break;
    federalTax = federalTax.plus(taxableInBracket.times(bracket.rate));
    remaining = remaining.minus(taxableInBracket);
    prevLimit = bracketLimit;
  }

  // Employee SS (6.2% on first $168,600/yr)
  const ssThreshold = new Decimal(168600).div(52);
  const employeeSS = Decimal.min(gross, ssThreshold).times(0.062);

  // Employee Medicare (1.45%)
  const employeeMedicare = gross.times(0.0145);

  // State tax
  let stateTax = new Decimal(0);
  const state = dm.state;
  if (state === 'CA') {
    stateTax = gross.times(0.08).plus(gross.times(0.011)); // 8% + 1.1% SDI
  } else if (state === 'NY') {
    stateTax = gross.times(0.07).plus(gross.times(0.005)); // 7% + 0.5% SDI
  } else if (state === 'GA') {
    stateTax = gross.times(0.055);
  } else if (state === 'NM') {
    stateTax = gross.times(0.049);
  }

  const totalDeductions = federalTax.plus(employeeSS).plus(employeeMedicare).plus(stateTax);

  return {
    incomeTax: federalTax.toDecimalPlaces(2).toNumber(),
    employeeNi: employeeSS.plus(employeeMedicare).toDecimalPlaces(2).toNumber(),
    employeePension: 0,
    stateTax: stateTax.toDecimalPlaces(2).toNumber(),
    totalDeductions: totalDeductions.toDecimalPlaces(2).toNumber(),
    territory: 'US',
  };
}

// ─── CANADA ──────────────────────────────────────────────────────────
function calculateCATax(gross, dm) {
  // Federal tax (simplified progressive)
  const fedExemption = new Decimal(298); // weekly
  const taxable = Decimal.max(gross.minus(fedExemption), 0);
  const federalTax = taxable.times(0.15); // simplified first bracket

  // CPP employee (5.95%)
  const cpp = gross.times(0.0595);

  // EI employee (1.63%)
  const ei = gross.times(0.0163);

  // Provincial (BC ~5%, ON ~5.05%)
  const province = dm.state || dm.province;
  let provTax = new Decimal(0);
  if (province === 'BC') provTax = gross.times(0.05);
  else if (province === 'ON') provTax = gross.times(0.0505);
  else if (province === 'QC') provTax = gross.times(0.15);

  const totalDeductions = federalTax.plus(cpp).plus(ei).plus(provTax);

  return {
    incomeTax: federalTax.toDecimalPlaces(2).toNumber(),
    employeeNi: cpp.plus(ei).toDecimalPlaces(2).toNumber(),
    employeePension: 0,
    stateTax: provTax.toDecimalPlaces(2).toNumber(),
    totalDeductions: totalDeductions.toDecimalPlaces(2).toNumber(),
    territory: 'CA',
  };
}

// ─── AUSTRALIA ───────────────────────────────────────────────────────
function calculateAUTax(gross, dm) {
  // PAYG withholding (simplified)
  const annualized = gross.times(52);
  let tax = new Decimal(0);

  if (annualized.gt(180000)) tax = annualized.minus(180000).times(0.45).plus(51667);
  else if (annualized.gt(120000)) tax = annualized.minus(120000).times(0.37).plus(29467);
  else if (annualized.gt(45000)) tax = annualized.minus(45000).times(0.325).plus(5092);
  else if (annualized.gt(18200)) tax = annualized.minus(18200).times(0.19);

  const weeklyTax = tax.div(52);

  // Super employee contribution (optional, usually 0% unless salary sacrifice)
  const empSuper = new Decimal(0);

  // Medicare levy 2%
  const medicareLevey = gross.times(0.02);

  const totalDeductions = weeklyTax.plus(medicareLevey);

  return {
    incomeTax: weeklyTax.toDecimalPlaces(2).toNumber(),
    employeeNi: medicareLevey.toDecimalPlaces(2).toNumber(),
    employeePension: empSuper.toDecimalPlaces(2).toNumber(),
    stateTax: 0,
    totalDeductions: totalDeductions.toDecimalPlaces(2).toNumber(),
    territory: 'AU',
  };
}

// ─── GERMANY ─────────────────────────────────────────────────────────
function calculateDETax(gross, dm) {
  // Lohnsteuer (simplified ~25% effective)
  const incomeTax = gross.times(0.25);
  const socialEmployee = gross.times(0.20); // ~20% employee social
  const totalDeductions = incomeTax.plus(socialEmployee);

  return {
    incomeTax: incomeTax.toDecimalPlaces(2).toNumber(),
    employeeNi: socialEmployee.toDecimalPlaces(2).toNumber(),
    employeePension: 0,
    stateTax: 0,
    totalDeductions: totalDeductions.toDecimalPlaces(2).toNumber(),
    territory: 'DE',
  };
}

// ─── FRANCE ──────────────────────────────────────────────────────────
function calculateFRTax(gross, dm) {
  // Prélèvement à la source (~10-15% effective)
  const incomeTax = gross.times(0.12);
  const employeeCharges = gross.times(0.108); // ~10.8% ASSEDIC employee
  const totalDeductions = incomeTax.plus(employeeCharges);

  return {
    incomeTax: incomeTax.toDecimalPlaces(2).toNumber(),
    employeeNi: employeeCharges.toDecimalPlaces(2).toNumber(),
    employeePension: 0,
    stateTax: 0,
    totalDeductions: totalDeductions.toDecimalPlaces(2).toNumber(),
    territory: 'FR',
  };
}
