import { describe, it, expect } from 'vitest';
import { calculateMealPenalty } from '../services/mealPenaltyCalculator.js';

const makeDealMemo = (overrides = {}) => ({
  mealPenaltyAfterHrs: 6,
  mealPenaltyIncrementMin: 15,
  mealPenaltyRate: 25, // GBP 25 per increment
  ...overrides,
});

describe('calculateMealPenalty', () => {
  // ---- No penalty: lunch at 5.5hrs after call ----
  it('no penalty when lunch is taken within the threshold (5.5hrs)', () => {
    const entry = { callTime: '07:00', lunchStart: '12:30' }; // 5.5hrs gap
    const deal = makeDealMemo();

    const result = calculateMealPenalty(entry, deal);

    expect(result.count).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.amount).toBe(0);
  });

  // ---- Penalty: lunch at 6.5hrs after call = 2 x 15-min increments ----
  it('penalty: lunch at 6.5hrs = 30min excess = 2 increments', () => {
    // Call 07:00, lunch at 13:30 = 6.5hrs = 390min; threshold = 360min; excess = 30min
    const entry = { callTime: '07:00', lunchStart: '13:30' };
    const deal = makeDealMemo();

    const result = calculateMealPenalty(entry, deal);

    expect(result.count).toBe(2);
    expect(result.minutes).toBe(30);
    expect(result.amount).toBe(50); // 2 * 25
  });

  // ---- Penalty: lunch at 7hrs after call = 4 x 15-min increments ----
  it('penalty: lunch at 7hrs = 60min excess = 4 increments', () => {
    // Call 07:00, lunch at 14:00 = 7hrs = 420min; threshold = 360; excess = 60min
    const entry = { callTime: '07:00', lunchStart: '14:00' };
    const deal = makeDealMemo();

    const result = calculateMealPenalty(entry, deal);

    expect(result.count).toBe(4);
    expect(result.minutes).toBe(60);
    expect(result.amount).toBe(100); // 4 * 25
  });

  // ---- No lunch entered: returns zero (no lunchStart) ----
  it('no lunch entered: returns zero when lunchStart is missing', () => {
    const entry = { callTime: '07:00', lunchStart: null };
    const deal = makeDealMemo();

    const result = calculateMealPenalty(entry, deal);

    expect(result.count).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.amount).toBe(0);
  });

  // ---- Exact 6hr boundary: no penalty ----
  it('exact 6hr boundary: no penalty (gap equals threshold)', () => {
    // Call 07:00, lunch at 13:00 = exactly 6hrs = 360min = threshold
    const entry = { callTime: '07:00', lunchStart: '13:00' };
    const deal = makeDealMemo();

    const result = calculateMealPenalty(entry, deal);

    expect(result.count).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.amount).toBe(0);
  });

  // ---- 1 minute over threshold = 1 increment ----
  it('1 minute over threshold triggers 1 increment', () => {
    // Call 07:00, lunch at 13:01 = 361 min; threshold = 360; excess = 1min => ceil(1/15) = 1
    const entry = { callTime: '07:00', lunchStart: '13:01' };
    const deal = makeDealMemo();

    const result = calculateMealPenalty(entry, deal);

    expect(result.count).toBe(1);
    expect(result.minutes).toBe(1);
    expect(result.amount).toBe(25);
  });

  // ---- Missing callTime returns zero ----
  it('returns zero when callTime is missing', () => {
    const entry = { callTime: null, lunchStart: '13:00' };
    const deal = makeDealMemo();

    const result = calculateMealPenalty(entry, deal);

    expect(result.count).toBe(0);
  });

  // ---- Overnight lunch scenario ----
  it('handles overnight lunch (lunch after midnight)', () => {
    // Call 20:00, lunch at 02:30 next day = 6.5hrs
    const entry = { callTime: '20:00', lunchStart: '02:30' };
    const deal = makeDealMemo();

    const result = calculateMealPenalty(entry, deal);

    // 02:30 < 20:00 so it adds 24*60: lunchStart becomes 26:30*60=1590 min
    // gap = 1590 - 1200 = 390 min = 6.5hrs; excess = 30 min => 2 increments
    expect(result.count).toBe(2);
    expect(result.minutes).toBe(30);
    expect(result.amount).toBe(50);
  });

  // ---- Custom threshold and increment ----
  it('respects custom threshold and increment values', () => {
    // 5hr threshold, 30min increments, GBP 50 per increment
    const entry = { callTime: '07:00', lunchStart: '13:00' }; // 6hr gap
    const deal = makeDealMemo({
      mealPenaltyAfterHrs: 5,
      mealPenaltyIncrementMin: 30,
      mealPenaltyRate: 50,
    });

    const result = calculateMealPenalty(entry, deal);

    // excess = 60 min; ceil(60/30) = 2 increments
    expect(result.count).toBe(2);
    expect(result.minutes).toBe(60);
    expect(result.amount).toBe(100);
  });

  // ---- Zero penalty rate: count is nonzero but amount is zero ----
  it('zero penalty rate: penalties counted but amount is zero', () => {
    const entry = { callTime: '07:00', lunchStart: '14:00' }; // 7hrs, 60min excess
    const deal = makeDealMemo({ mealPenaltyRate: 0 });

    const result = calculateMealPenalty(entry, deal);

    expect(result.count).toBe(4);
    expect(result.amount).toBe(0);
  });
});
