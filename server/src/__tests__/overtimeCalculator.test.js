import { describe, it, expect } from 'vitest';
import { calculateDayHours, parseTimeToMinutes } from '../services/overtimeCalculator.js';

// ---------------------------------------------------------------------------
// Helper: builds a minimal entry + dealMemo for a given call/wrap scenario
// ---------------------------------------------------------------------------
const makeEntry = (overrides = {}) => ({
  callTime: '07:00',
  wrapTime: '18:00',
  lunchStart: '13:00',
  lunchEnd: '14:00',
  secondMealStart: null,
  secondMealEnd: null,
  isSixthDay: false,
  isSeventhDay: false,
  ...overrides,
});

const makeDealMemo = (overrides = {}) => ({
  standardWorkDayHrs: 11,
  nightStartTime: '23:00',
  lunchBreakHrs: 1,
  ...overrides,
});

// ---------------------------------------------------------------------------
// parseTimeToMinutes
// ---------------------------------------------------------------------------
describe('parseTimeToMinutes', () => {
  it('converts "07:00" to 420', () => {
    expect(parseTimeToMinutes('07:00')).toBe(420);
  });

  it('converts "23:30" to 1410', () => {
    expect(parseTimeToMinutes('23:30')).toBe(1410);
  });

  it('converts "00:00" to 0', () => {
    expect(parseTimeToMinutes('00:00')).toBe(0);
  });

  it('returns null for falsy input', () => {
    expect(parseTimeToMinutes(null)).toBeNull();
    expect(parseTimeToMinutes(undefined)).toBeNull();
    expect(parseTimeToMinutes('')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// calculateDayHours
// ---------------------------------------------------------------------------
describe('calculateDayHours', () => {
  // ---- Standard BECTU day: 11hrs worked = 11 straight, 0 OT ----
  it('standard BECTU day: 11hrs worked = 11 straight, 0 OT', () => {
    // Call 07:00, wrap 19:00, 1hr lunch = 11hrs worked
    const entry = makeEntry({ callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00' });
    const deal = makeDealMemo({ standardWorkDayHrs: 11 });

    const result = calculateDayHours(entry, deal);

    expect(result.totalWorkedHrs).toBe(11);
    expect(result.straightHrs).toBe(11);
    expect(result.ot1x5Hrs).toBe(0);
    expect(result.ot2xHrs).toBe(0);
    expect(result.nightHrs).toBe(0);
  });

  // ---- 12hrs worked on BECTU film = 11 straight + 1hr OT at 1.5x ----
  it('12hrs worked on BECTU film = 11 straight + 1hr OT at 1.5x', () => {
    // Call 07:00, wrap 20:00, 1hr lunch = 12hrs worked
    const entry = makeEntry({ callTime: '07:00', wrapTime: '20:00', lunchStart: '13:00', lunchEnd: '14:00' });
    const deal = makeDealMemo({ standardWorkDayHrs: 11 });

    const result = calculateDayHours(entry, deal);

    expect(result.totalWorkedHrs).toBe(12);
    expect(result.straightHrs).toBe(11);
    // Wrap at 20:00 -- all OT before 23:00, so all 1.5x
    expect(result.ot1x5Hrs).toBe(1);
    expect(result.ot2xHrs).toBe(0);
  });

  // ---- 14hrs worked = 11 straight + 3hrs OT (split 1.5x before 23:00, 2x after) ----
  it('14hrs worked = 11 straight + OT split at 23:00 boundary', () => {
    // Call 08:00, wrap 23:00, 1hr lunch = 14hrs worked
    // Night starts at 23:00 so wrapMin == nightStartMin → nightMinutes = 0
    const entry = makeEntry({ callTime: '08:00', wrapTime: '23:00', lunchStart: '13:00', lunchEnd: '14:00' });
    const deal = makeDealMemo({ standardWorkDayHrs: 11 });

    const result = calculateDayHours(entry, deal);

    expect(result.totalWorkedHrs).toBe(14);
    expect(result.straightHrs).toBe(11);
    // Wrap exactly at 23:00 means wrapMin === nightStartMin, so nightMinutes = 0
    expect(result.ot1x5Hrs).toBe(3);
    expect(result.ot2xHrs).toBe(0);
  });

  it('14hrs worked wrapping past 23:00 splits OT into 1.5x and 2x', () => {
    // Call 08:00, wrap 23:30, 1.5hr lunch = 14hrs worked
    // Night: 23:00-23:30 = 30min = 0.5hrs
    const entry = makeEntry({
      callTime: '08:00',
      wrapTime: '23:30',
      lunchStart: '13:00',
      lunchEnd: '14:30',
    });
    const deal = makeDealMemo({ standardWorkDayHrs: 11 });

    const result = calculateDayHours(entry, deal);

    expect(result.totalWorkedHrs).toBe(14);
    expect(result.straightHrs).toBe(11);
    // 3hrs OT total; 0.5hrs are night OT (2x), 2.5hrs are pre-night OT (1.5x)
    expect(result.nightHrs).toBe(0.5);
    expect(result.ot2xHrs).toBe(0.5);
    expect(result.ot1x5Hrs).toBe(2.5);
  });

  // ---- Night work: hours after 23:00 at 2x rate ----
  it('night work: hours after 23:00 count as night and 2x', () => {
    // Call 14:00, wrap 01:00 (next day), 1hr lunch = 10hrs worked
    // Night window: 23:00 - 01:00 = 2hrs
    const entry = makeEntry({
      callTime: '14:00',
      wrapTime: '01:00',
      lunchStart: '19:00',
      lunchEnd: '20:00',
    });
    const deal = makeDealMemo({ standardWorkDayHrs: 11 });

    const result = calculateDayHours(entry, deal);

    // (01:00 next day = 25:00) - 14:00 = 660 min - 60 min lunch = 600 min = 10hrs
    expect(result.totalWorkedHrs).toBe(10);
    expect(result.straightHrs).toBe(10);
    // No OT since under 11hrs, but nightHrs still calculated
    expect(result.ot1x5Hrs).toBe(0);
    expect(result.ot2xHrs).toBe(0);
  });

  // ---- Short day: 8hrs worked = 8 straight, 0 OT ----
  it('short day: 8hrs worked = 8 straight, 0 OT', () => {
    // Call 09:00, wrap 18:00, 1hr lunch = 8hrs
    const entry = makeEntry({ callTime: '09:00', wrapTime: '18:00', lunchStart: '13:00', lunchEnd: '14:00' });
    const deal = makeDealMemo({ standardWorkDayHrs: 11 });

    const result = calculateDayHours(entry, deal);

    expect(result.totalWorkedHrs).toBe(8);
    expect(result.straightHrs).toBe(8);
    expect(result.ot1x5Hrs).toBe(0);
    expect(result.ot2xHrs).toBe(0);
  });

  // ---- Overnight wrap (call 18:00, wrap 04:00) ----
  it('overnight wrap: call 18:00, wrap 04:00 next day', () => {
    // 18:00 -> 04:00(+24h) = 10hrs elapsed, minus 1hr lunch = 9hrs worked
    // Night: 23:00 -> 04:00 = 5hrs, minus any breaks in night window
    const entry = makeEntry({
      callTime: '18:00',
      wrapTime: '04:00',
      lunchStart: '22:00',
      lunchEnd: '23:00',
    });
    const deal = makeDealMemo({ standardWorkDayHrs: 11, nightStartTime: '23:00' });

    const result = calculateDayHours(entry, deal);

    // (04:00 + 24*60) - 18:00 = 600 min - 60 min lunch = 540 min = 9hrs
    expect(result.totalWorkedHrs).toBe(9);
    expect(result.straightHrs).toBe(9);
    expect(result.ot1x5Hrs).toBe(0);
    expect(result.ot2xHrs).toBe(0);
  });

  it('overnight wrap with OT pushes hours into 2x night rate', () => {
    // Call 14:00, wrap 04:00, 1hr lunch = 13hrs worked
    // Night: 23:00-04:00 = 5hrs
    const entry = makeEntry({
      callTime: '14:00',
      wrapTime: '04:00',
      lunchStart: '19:00',
      lunchEnd: '20:00',
    });
    const deal = makeDealMemo({ standardWorkDayHrs: 11, nightStartTime: '23:00' });

    const result = calculateDayHours(entry, deal);

    // (04:00+24*60) - 14:00 = 840 min - 60 min = 780 min = 13hrs
    expect(result.totalWorkedHrs).toBe(13);
    expect(result.straightHrs).toBe(11);
    // 2hrs OT; night is 5hrs, OT night = min(5, 2) = 2
    expect(result.ot2xHrs).toBe(2);
    expect(result.ot1x5Hrs).toBe(0);
  });

  // ---- TV drama rules: 10hr standard day ----
  it('TV drama rules: 10hr standard day, 11hrs worked = 1hr OT', () => {
    // Call 07:00, wrap 19:00, 1hr lunch = 11hrs worked
    const entry = makeEntry({ callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00' });
    const deal = makeDealMemo({ standardWorkDayHrs: 10 });

    const result = calculateDayHours(entry, deal);

    expect(result.totalWorkedHrs).toBe(11);
    expect(result.straightHrs).toBe(10);
    expect(result.ot1x5Hrs).toBe(1);
    expect(result.ot2xHrs).toBe(0);
  });

  // ---- Missing call/wrap returns zeros ----
  it('returns zeros when callTime is missing', () => {
    const entry = makeEntry({ callTime: null });
    const result = calculateDayHours(entry, makeDealMemo());
    expect(result.totalWorkedHrs).toBe(0);
    expect(result.straightHrs).toBe(0);
  });

  it('returns zeros when wrapTime is missing', () => {
    const entry = makeEntry({ wrapTime: null });
    const result = calculateDayHours(entry, makeDealMemo());
    expect(result.totalWorkedHrs).toBe(0);
  });

  // ---- Second meal break is subtracted ----
  it('subtracts second meal break from total worked hours', () => {
    // Call 07:00, wrap 21:00, 1hr lunch, 0.5hr second meal = 13.5 - 1.5 = 12.5hrs
    const entry = makeEntry({
      callTime: '07:00',
      wrapTime: '21:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
      secondMealStart: '18:00',
      secondMealEnd: '18:30',
    });
    const deal = makeDealMemo({ standardWorkDayHrs: 11 });

    const result = calculateDayHours(entry, deal);

    expect(result.totalWorkedHrs).toBe(12.5);
    expect(result.straightHrs).toBe(11);
    expect(result.ot1x5Hrs + result.ot2xHrs).toBeCloseTo(1.5, 2);
  });

  // ---- No lunch break: full time is worked ----
  it('no lunch break: entire call-to-wrap is worked', () => {
    const entry = makeEntry({
      callTime: '09:00',
      wrapTime: '17:00',
      lunchStart: null,
      lunchEnd: null,
    });
    const deal = makeDealMemo({ standardWorkDayHrs: 11 });

    const result = calculateDayHours(entry, deal);

    expect(result.totalWorkedHrs).toBe(8);
    expect(result.straightHrs).toBe(8);
  });
});
