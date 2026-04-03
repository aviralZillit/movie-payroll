import { describe, it, expect } from 'vitest';
import { calculateTerritoryFringes } from '../services/territoryFringeCalculator.js';

describe('calculateTerritoryFringes', () => {
  // ─── UK ──────────────────────────────────
  it('UK: HP exclusive 12.07% on £5,000 gross', () => {
    const result = calculateTerritoryFringes(5000, 55, { territory: 'UK', hpMode: 'excl', holidayPayPct: 0.1207, employerNiPct: 0.138, employerNiThresholdWeekly: 967, pensionPct: 0.03 });
    expect(result.holidayPay).toBeCloseTo(603.50, 1);
    expect(result.employerNi).toBeGreaterThan(0);
    expect(result.employerPension).toBeCloseTo(150, 1);
    expect(result.territory).toBe('UK');
  });

  it('UK: HP inclusive = 0 holiday pay', () => {
    const result = calculateTerritoryFringes(5000, 55, { territory: 'UK', hpMode: 'incl' });
    expect(result.holidayPay).toBe(0);
  });

  it('UK: NI only on amount above threshold', () => {
    const result = calculateTerritoryFringes(1000, 50, { territory: 'UK', hpMode: 'na', employerNiPct: 0.138, employerNiThresholdWeekly: 967 });
    expect(result.employerNi).toBeCloseTo((1000 - 967) * 0.138, 1);
  });

  // ─── US ──────────────────────────────────
  it('US: P&H 20% on $5,000 gross', () => {
    const result = calculateTerritoryFringes(5000, 50, { territory: 'US', unionPensionPct: 0.20 });
    expect(result.pensionHealth).toBeCloseTo(1000, 1);
    expect(result.territory).toBe('US');
  });

  it('US: H&W at $26.76/hr for 50hrs', () => {
    const result = calculateTerritoryFringes(5000, 50, { territory: 'US', hwPerHour: 26.76, unionPensionPct: 0.075 });
    expect(result.hwContribution).toBeCloseTo(1338, 0);
  });

  it('US: SAG pension 18.5%', () => {
    const result = calculateTerritoryFringes(5000, 50, { territory: 'US', unionPensionPct: 0.185 });
    expect(result.pensionHealth).toBeCloseTo(925, 0);
  });

  it('US: WGA pension 21% (highest)', () => {
    const result = calculateTerritoryFringes(5000, 50, { territory: 'US', unionPensionPct: 0.21 });
    expect(result.pensionHealth).toBeCloseTo(1050, 0);
  });

  // ─── AU ──────────────────────────────────
  it('AU: Super 11.5% on gross', () => {
    const result = calculateTerritoryFringes(5000, 50, { territory: 'AU' });
    expect(result.employerPension).toBeCloseTo(575, 0);
    expect(result.territory).toBe('AU');
  });

  // ─── DE ──────────────────────────────────
  it('DE: Social ~21% + KSK 5% + pension 4%', () => {
    const result = calculateTerritoryFringes(5000, 50, { territory: 'DE' });
    expect(result.employerNi).toBeCloseTo(1050, 0); // 21%
    expect(result.ksk).toBeCloseTo(250, 0); // 5%
    expect(result.territory).toBe('DE');
  });

  // ─── FR ──────────────────────────────────
  it('FR: ~45% employer charges + 10% holiday', () => {
    const result = calculateTerritoryFringes(5000, 50, { territory: 'FR' });
    expect(result.employerNi).toBeCloseTo(2250, 0); // 45%
    expect(result.holidayPay).toBeCloseTo(500, 0); // 10%
    expect(result.territory).toBe('FR');
  });
});
