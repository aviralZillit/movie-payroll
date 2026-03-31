import { describe, it, expect } from 'vitest';
import { checkTurnaround } from '../services/turnaroundCalculator.js';

describe('checkTurnaround', () => {
  // ---- Good turnaround: wrap 19:00, next call 07:00 = 12hrs (OK for 11hr min) ----
  it('no violation: wrap 19:00, next call 07:00 = 12hrs rest (11hr minimum)', () => {
    const result = checkTurnaround(
      '19:00',
      '2024-06-10',
      '07:00',
      '2024-06-11',
      11
    );

    expect(result.violation).toBe(false);
    expect(result.shortfallHrs).toBe(0);
    expect(result.penaltyHrs).toBe(0);
  });

  // ---- Violation: wrap 23:00, next call 07:00 = 8hrs (3hr shortfall) ----
  it('violation: wrap 23:00, next call 07:00 = 8hrs rest, 3hr shortfall', () => {
    const result = checkTurnaround(
      '23:00',
      '2024-06-10',
      '07:00',
      '2024-06-11',
      11
    );

    expect(result.violation).toBe(true);
    expect(result.shortfallHrs).toBe(3);
    expect(result.penaltyHrs).toBe(3);
  });

  // ---- Exact minimum: wrap 20:00, next call 07:00 = 11hrs (exactly met) ----
  it('no violation: wrap 20:00, next call 07:00 = exactly 11hrs', () => {
    const result = checkTurnaround(
      '20:00',
      '2024-06-10',
      '07:00',
      '2024-06-11',
      11
    );

    expect(result.violation).toBe(false);
    expect(result.shortfallHrs).toBe(0);
    expect(result.penaltyHrs).toBe(0);
  });

  // ---- Overnight wrap to next day call ----
  it('overnight wrap: wrap 02:00 on 6/11, call 09:00 on 6/11 = 7hrs rest', () => {
    // Wrap at 02:00 on June 11, next call 09:00 on June 11
    const result = checkTurnaround(
      '02:00',
      '2024-06-11',
      '09:00',
      '2024-06-11',
      11
    );

    expect(result.violation).toBe(true);
    expect(result.shortfallHrs).toBe(4);
    expect(result.penaltyHrs).toBe(4);
  });

  // ---- Equity turnaround: 12hr minimum ----
  it('Equity turnaround: 12hr minimum, 11hr rest = 1hr shortfall', () => {
    const result = checkTurnaround(
      '20:00',
      '2024-06-10',
      '07:00',
      '2024-06-11',
      12
    );

    expect(result.violation).toBe(true);
    expect(result.shortfallHrs).toBe(1);
    expect(result.penaltyHrs).toBe(1);
  });

  // ---- Generous turnaround: no violation even with 12hr min ----
  it('no violation with 12hr minimum when rest is 13hrs', () => {
    const result = checkTurnaround(
      '18:00',
      '2024-06-10',
      '07:00',
      '2024-06-11',
      12
    );

    expect(result.violation).toBe(false);
    expect(result.shortfallHrs).toBe(0);
  });

  // ---- Missing wrap time returns no violation ----
  it('returns no violation when previousDayWrapTime is missing', () => {
    const result = checkTurnaround(
      null,
      '2024-06-10',
      '07:00',
      '2024-06-11',
      11
    );

    expect(result.violation).toBe(false);
    expect(result.shortfallHrs).toBe(0);
  });

  // ---- Missing call time returns no violation ----
  it('returns no violation when currentDayCallTime is missing', () => {
    const result = checkTurnaround(
      '22:00',
      '2024-06-10',
      null,
      '2024-06-11',
      11
    );

    expect(result.violation).toBe(false);
  });

  // ---- Missing dates returns no violation ----
  it('returns no violation when dates are missing', () => {
    const result = checkTurnaround('22:00', null, '07:00', null, 11);
    expect(result.violation).toBe(false);
  });

  // ---- Default minimum is 11 hours ----
  it('defaults to 11hr minimum when not specified', () => {
    // 10hr rest should violate the default 11hr minimum
    const result = checkTurnaround(
      '21:00',
      '2024-06-10',
      '07:00',
      '2024-06-11'
    );

    expect(result.violation).toBe(true);
    expect(result.shortfallHrs).toBe(1);
  });

  // ---- Fractional shortfall ----
  it('calculates fractional shortfall correctly', () => {
    // Wrap 22:30, call 07:00 = 8.5hrs rest, 11hr min => 2.5hr shortfall
    const result = checkTurnaround(
      '22:30',
      '2024-06-10',
      '07:00',
      '2024-06-11',
      11
    );

    expect(result.violation).toBe(true);
    expect(result.shortfallHrs).toBe(2.5);
    expect(result.penaltyHrs).toBe(2.5);
  });
});
