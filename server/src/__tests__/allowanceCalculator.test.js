import { describe, it, expect } from 'vitest';
import { calculateAllowanceProRating } from '../services/allowanceCalculator.js';

const makeEntries = (daysWorked, dayTypes = {}) => {
  return Array.from({ length: 7 }, (_, i) => {
    const dayOfWeek = i + 1;
    const isWork = dayOfWeek <= daysWorked;
    return {
      dayOfWeek,
      callTime: isWork ? '06:00' : '',
      wrapTime: isWork ? '19:00' : '',
      isRestDay: !isWork,
      isHoliday: false,
      dayType: dayTypes[dayOfWeek] || 'shoot',
    };
  });
};

describe('calculateAllowanceProRating', () => {
  it('weekly kit £500, 5 days worked = £500 (full week)', () => {
    const result = calculateAllowanceProRating(
      [{ name: 'Kit', amount: 500, period: 'weekly', caps: {} }],
      makeEntries(5),
      5
    );
    expect(result[0].weeklyTotal).toBe(500);
    expect(result[0].applicableDays).toBe(5);
  });

  it('weekly kit £500, 2 days, min 3 days, proRate=true', () => {
    const result = calculateAllowanceProRating(
      [{ name: 'Kit', amount: 500, period: 'weekly', caps: { minDaysForFullRate: 3, proRateShortWeeks: true } }],
      makeEntries(2),
      2
    );
    expect(result[0].weeklyTotal).toBeCloseTo(333.33, 1);
  });

  it('weekly kit £500, 3 days, min 3 days = full amount', () => {
    const result = calculateAllowanceProRating(
      [{ name: 'Kit', amount: 500, period: 'weekly', caps: { minDaysForFullRate: 3, proRateShortWeeks: true } }],
      makeEntries(3),
      3
    );
    expect(result[0].weeklyTotal).toBe(500);
  });

  it('daily car £25, exclude Sundays, 6 days worked', () => {
    const entries = makeEntries(7); // All 7 days
    entries[6].dayOfWeek = 7; // Sunday
    const result = calculateAllowanceProRating(
      [{ name: 'Car', amount: 25, period: 'daily', caps: { excludeSundays: true } }],
      entries,
      7
    );
    expect(result[0].applicableDays).toBe(6); // 7 - 1 Sunday
    expect(result[0].weeklyTotal).toBe(150);
  });

  it('daily, payableOnTravelDays=false excludes travel days', () => {
    const entries = makeEntries(5, { 3: 'travel', 4: 'travel' });
    const result = calculateAllowanceProRating(
      [{ name: 'Kit', amount: 100, period: 'daily', caps: { payableOnTravelDays: false } }],
      entries,
      5
    );
    expect(result[0].applicableDays).toBe(3); // 5 - 2 travel
    expect(result[0].weeklyTotal).toBe(300);
  });

  it('weekly cap £300 limits total', () => {
    const result = calculateAllowanceProRating(
      [{ name: 'Kit', amount: 500, period: 'weekly', caps: { weeklyCap: 300 } }],
      makeEntries(5),
      5
    );
    expect(result[0].weeklyTotal).toBe(300);
  });

  it('maxDaysPerWeek=5, 7 days worked', () => {
    const result = calculateAllowanceProRating(
      [{ name: 'Kit', amount: 50, period: 'daily', caps: { maxDaysPerWeek: 5 } }],
      makeEntries(7),
      7
    );
    expect(result[0].applicableDays).toBe(5);
    expect(result[0].weeklyTotal).toBe(250);
  });

  it('empty allowances returns empty array', () => {
    const result = calculateAllowanceProRating([], makeEntries(5), 5);
    expect(result).toEqual([]);
  });

  it('tracks tax treatment', () => {
    const result = calculateAllowanceProRating(
      [{ name: 'Kit', amount: 500, period: 'weekly', caps: {}, taxTreatment: 'non-taxable', nominalCode: '2350' }],
      makeEntries(5),
      5
    );
    expect(result[0].taxTreatment).toBe('non-taxable');
    expect(result[0].nominalCode).toBe('2350');
  });
});
