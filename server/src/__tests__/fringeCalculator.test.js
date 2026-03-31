import { describe, it, expect } from 'vitest';
import { calculateFringes } from '../services/fringeCalculator.js';
import Decimal from 'decimal.js';

const makeDealMemo = (overrides = {}) => ({
  holidayPayInclusive: false,
  holidayPayPct: 0.1207,
  employerNiPct: 0.15,
  employerNiThresholdWeekly: 96.15,
  pensionPct: 0.03,
  apprenticeshipLevyPct: 0,
  ...overrides,
});

describe('calculateFringes', () => {
  // ---- Standard fringes on GBP 2,000 gross ----
  it('standard fringes: GBP 2000 gross with holiday, NI, pension', () => {
    const gross = 2000;
    const deal = makeDealMemo();

    const result = calculateFringes(gross, deal);

    // Holiday pay: 2000 * 0.1207 = 241.40
    expect(result.holidayPay).toBe(241.40);

    // Employer NI: (2000 - 96.15) * 0.15 = 1903.85 * 0.15 = 285.5775 -> 285.58
    const expectedNi = new Decimal(2000).minus(96.15).times(0.15).toDecimalPlaces(2).toNumber();
    expect(result.employerNi).toBe(expectedNi);

    // Pension: 2000 * 0.03 = 60.00
    expect(result.employerPension).toBe(60.00);

    // Apprenticeship levy: 0
    expect(result.apprenticeshipLevy).toBe(0);

    // Total
    const expectedTotal = new Decimal(241.40)
      .plus(expectedNi)
      .plus(60)
      .plus(0)
      .toDecimalPlaces(2)
      .toNumber();
    expect(result.totalFringes).toBe(expectedTotal);
  });

  // ---- Holiday pay inclusive: skip holiday pay ----
  it('holiday pay inclusive: holidayPay should be 0', () => {
    const gross = 2000;
    const deal = makeDealMemo({ holidayPayInclusive: true });

    const result = calculateFringes(gross, deal);

    expect(result.holidayPay).toBe(0);
    // Other fringes still calculated
    expect(result.employerNi).toBeGreaterThan(0);
    expect(result.employerPension).toBe(60.00);
  });

  // ---- Low gross below NI threshold: employer NI = 0 ----
  it('low gross below NI threshold: employer NI = 0', () => {
    const gross = 80; // below 96.15
    const deal = makeDealMemo();

    const result = calculateFringes(gross, deal);

    expect(result.employerNi).toBe(0);
    // Holiday pay still applies
    expect(result.holidayPay).toBeCloseTo(80 * 0.1207, 2);
    // Pension still applies
    expect(result.employerPension).toBeCloseTo(80 * 0.03, 2);
  });

  // ---- Zero pension rate ----
  it('zero pension rate: pension = 0', () => {
    const gross = 2000;
    const deal = makeDealMemo({ pensionPct: 0 });

    const result = calculateFringes(gross, deal);

    expect(result.employerPension).toBe(0);
    // Holiday and NI still apply
    expect(result.holidayPay).toBe(241.40);
    expect(result.employerNi).toBeGreaterThan(0);
  });

  // ---- Full calculation verification with exact Decimal math ----
  it('full calculation with exact Decimal math on GBP 1500', () => {
    const gross = 1500;
    const deal = makeDealMemo({ apprenticeshipLevyPct: 0.005 });

    const result = calculateFringes(gross, deal);

    const g = new Decimal(1500);

    const expectedHoliday = g.times(0.1207).toDecimalPlaces(2).toNumber();
    const expectedNi = Decimal.max(g.minus(96.15), 0).times(0.15).toDecimalPlaces(2).toNumber();
    const expectedPension = g.times(0.03).toDecimalPlaces(2).toNumber();
    const expectedLevy = g.times(0.005).toDecimalPlaces(2).toNumber();

    expect(result.holidayPay).toBe(expectedHoliday);
    expect(result.employerNi).toBe(expectedNi);
    expect(result.employerPension).toBe(expectedPension);
    expect(result.apprenticeshipLevy).toBe(expectedLevy);

    const expectedTotal = new Decimal(expectedHoliday)
      .plus(expectedNi)
      .plus(expectedPension)
      .plus(expectedLevy)
      .toDecimalPlaces(2)
      .toNumber();
    expect(result.totalFringes).toBe(expectedTotal);
  });

  // ---- Zero gross ----
  it('zero gross: all fringes are zero', () => {
    const result = calculateFringes(0, makeDealMemo());

    expect(result.holidayPay).toBe(0);
    expect(result.employerNi).toBe(0);
    expect(result.employerPension).toBe(0);
    expect(result.apprenticeshipLevy).toBe(0);
    expect(result.totalFringes).toBe(0);
  });

  // ---- Gross exactly at NI threshold ----
  it('gross exactly at NI threshold: employer NI = 0', () => {
    const result = calculateFringes(96.15, makeDealMemo());
    expect(result.employerNi).toBe(0);
  });

  // ---- Gross just above NI threshold ----
  it('gross just above NI threshold: tiny employer NI', () => {
    const result = calculateFringes(100, makeDealMemo());
    // (100 - 96.15) * 0.15 = 3.85 * 0.15 = 0.5775 -> 0.58
    const expectedNi = new Decimal(100).minus(96.15).times(0.15).toDecimalPlaces(2).toNumber();
    expect(result.employerNi).toBe(expectedNi);
  });

  // ---- Uses defaults when deal memo fields are undefined ----
  it('uses defaults when deal memo fields are undefined', () => {
    const result = calculateFringes(1000, {});

    // Should use defaults: 12.07% holiday, 15% NI, 3% pension, 0% levy
    expect(result.holidayPay).toBe(120.70);
    expect(result.employerPension).toBe(30.00);
    expect(result.apprenticeshipLevy).toBe(0);
  });
});
