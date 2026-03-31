import { describe, it, expect, vi } from 'vitest';

// Mock rateEngine.getOvertimeRules before importing payrollEngine
vi.mock('../services/rateEngine.js', () => ({
  getOvertimeRules: vi.fn().mockResolvedValue([]),
}));

import { calculatePayrollItem } from '../services/payrollEngine.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeEntry = (date, callTime, wrapTime, overrides = {}) => ({
  date,
  callTime,
  wrapTime,
  lunchStart: '13:00',
  lunchEnd: '14:00',
  secondMealStart: null,
  secondMealEnd: null,
  isSixthDay: false,
  isSeventhDay: false,
  ...overrides,
});

const makeDealMemo = (overrides = {}) => ({
  hourlyRate: 25,
  dailyRate: 275,
  weeklyRate: 1375,
  otRate1x5: 37.5,  // 25 * 1.5
  otRate2x: 50,     // 25 * 2
  payBasis: 'weekly',
  standardWorkDayHrs: 11,
  nightStartTime: '23:00',
  nightPremiumPct: 0.5,
  turnaroundMinHrs: 11,
  turnaroundPenaltyMultiplier: 1.5,
  sixthDayMultiplier: 1.5,
  seventhDayMultiplier: 2.0,
  mealPenaltyAfterHrs: 6,
  mealPenaltyIncrementMin: 15,
  mealPenaltyRate: 25,
  kitAllowance: 0,
  kitAllowancePeriod: 'weekly',
  travelAllowance: 0,
  perDiemRate: 0,
  phoneAllowance: 0,
  computerAllowance: 0,
  carAllowance: 0,
  // Fringe defaults
  holidayPayInclusive: false,
  holidayPayPct: 0.1207,
  employerNiPct: 0.15,
  employerNiThresholdWeekly: 96.15,
  pensionPct: 0.03,
  apprenticeshipLevyPct: 0,
  // union/dept IDs (strings for mock)
  unionId: 'union-1',
  departmentId: 'dept-1',
  ...overrides,
});

describe('calculatePayrollItem', () => {
  // ---- Simple week: 5 days x 11hrs straight = correct base pay ----
  it('simple week: 5 days x 11hrs straight time, weekly pay basis', async () => {
    const entries = [];
    for (let d = 10; d <= 14; d++) {
      entries.push(makeEntry(`2024-06-${d}`, '07:00', '19:00'));
    }
    const timecard = { entries };
    const deal = makeDealMemo();

    const result = await calculatePayrollItem(timecard, deal);

    expect(result.daysWorked).toBe(5);
    expect(result.totalStraightHrs).toBe(55); // 5 * 11
    expect(result.totalOt1x5Hrs).toBe(0);
    expect(result.totalOt2xHrs).toBe(0);
    expect(result.basePay).toBe(1375); // weekly rate
    expect(result.overtime1x5Pay).toBe(0);
    expect(result.overtime2xPay).toBe(0);
    expect(result.grossPay).toBe(1375);
  });

  // ---- Week with OT ----
  it('week with overtime: some days with OT hours', async () => {
    const entries = [
      // 3 standard 11hr days
      makeEntry('2024-06-10', '07:00', '19:00'),
      makeEntry('2024-06-11', '07:00', '19:00'),
      makeEntry('2024-06-12', '07:00', '19:00'),
      // 2 days with 1hr OT each (12hrs worked)
      makeEntry('2024-06-13', '07:00', '20:00'),
      makeEntry('2024-06-14', '07:00', '20:00'),
    ];
    const timecard = { entries };
    const deal = makeDealMemo();

    const result = await calculatePayrollItem(timecard, deal);

    expect(result.daysWorked).toBe(5);
    expect(result.totalStraightHrs).toBe(55); // 5*11
    expect(result.totalOt1x5Hrs).toBe(2); // 2 days * 1hr
    expect(result.overtime1x5Pay).toBe(75); // 2 * 37.5
    expect(result.basePay).toBe(1375);
    expect(result.grossPay).toBe(1375 + 75); // 1450
  });

  // ---- Week with meal penalties and turnaround violations ----
  it('week with meal penalties', async () => {
    const entries = [
      // Day with late lunch: call 07:00, lunch at 14:00 = 7hrs gap, 60min excess = 4 increments
      makeEntry('2024-06-10', '07:00', '19:00', { lunchStart: '14:00', lunchEnd: '15:00' }),
      makeEntry('2024-06-11', '07:00', '19:00'),
    ];
    const timecard = { entries };
    const deal = makeDealMemo();

    const result = await calculatePayrollItem(timecard, deal);

    expect(result.totalMealPenalties).toBe(4); // 4 increments on day 1
    expect(result.mealPenaltyPay).toBe(100); // 4 * 25
  });

  it('week with turnaround violation', async () => {
    const entries = [
      // Day 1: wrap late at 23:00
      makeEntry('2024-06-10', '07:00', '23:00', { lunchStart: '13:00', lunchEnd: '14:00' }),
      // Day 2: call at 07:00 = only 8hrs rest (3hr shortfall)
      makeEntry('2024-06-11', '07:00', '19:00'),
    ];
    const timecard = { entries };
    const deal = makeDealMemo();

    const result = await calculatePayrollItem(timecard, deal);

    expect(result.totalTurnaroundPenalties).toBe(3);
    // Penalty pay: 3hrs * 25 hourly * 1.5 multiplier = 112.50
    expect(result.turnaroundPenaltyPay).toBe(112.5);
  });

  // ---- 6th and 7th day worked ----
  it('6th day premium calculated correctly', async () => {
    const entries = [
      makeEntry('2024-06-10', '07:00', '19:00', { isSixthDay: true }),
    ];
    const timecard = { entries };
    const deal = makeDealMemo();

    const result = await calculatePayrollItem(timecard, deal);

    // 6th day premium: dailyRate * (1.5 - 1) = 275 * 0.5 = 137.50
    expect(result.sixthDayPremium).toBe(137.5);
  });

  it('7th day premium calculated correctly', async () => {
    const entries = [
      makeEntry('2024-06-10', '07:00', '19:00', { isSeventhDay: true }),
    ];
    const timecard = { entries };
    const deal = makeDealMemo();

    const result = await calculatePayrollItem(timecard, deal);

    // 7th day premium: dailyRate * (2.0 - 1) = 275 * 1.0 = 275.00
    expect(result.seventhDayPremium).toBe(275);
  });

  // ---- Gross-to-net calculation ----
  it('full gross-to-net deductions are calculated', async () => {
    const entries = [
      makeEntry('2024-06-10', '07:00', '19:00'),
    ];
    const timecard = { entries };
    const deal = makeDealMemo();

    const result = await calculatePayrollItem(timecard, deal);

    expect(result.grossPay).toBe(1375);

    // Employee NI: max(1375 - 242, 0) * 0.08 = 1133 * 0.08 = 90.64
    expect(result.employeeNi).toBe(90.64);

    // PAYE: max(1375 - 242, 0) * 0.20 = 1133 * 0.20 = 226.60
    expect(result.incomeTax).toBe(226.6);

    // Employee pension: 1375 * 0.05 = 68.75
    expect(result.employeePension).toBe(68.75);

    // Total deductions
    expect(result.totalDeductions).toBe(385.99);

    // Net pay
    expect(result.netPay).toBe(989.01);
  });

  // ---- Allowances added correctly ----
  it('allowances are added to gross pay', async () => {
    const entries = [
      makeEntry('2024-06-10', '07:00', '19:00'),
      makeEntry('2024-06-11', '07:00', '19:00'),
    ];
    const timecard = { entries };
    const deal = makeDealMemo({
      kitAllowance: 50,
      kitAllowancePeriod: 'weekly',
      travelAllowance: 20,    // per day
      perDiemRate: 30,         // per day
      phoneAllowance: 15,     // weekly
      computerAllowance: 10,  // weekly
      carAllowance: 25,       // weekly
    });

    const result = await calculatePayrollItem(timecard, deal);

    expect(result.kitAllowance).toBe(50);       // weekly flat
    expect(result.travelAllowance).toBe(40);    // 20 * 2 days
    expect(result.perDiem).toBe(60);            // 30 * 2 days
    expect(result.phoneAllowance).toBe(15);
    expect(result.computerAllowance).toBe(10);
    expect(result.carAllowance).toBe(25);

    // Gross = basePay + allowances
    const expectedGross = 1375 + 50 + 40 + 60 + 15 + 10 + 25;
    expect(result.grossPay).toBe(expectedGross);
  });

  // ---- Fringes calculated on gross ----
  it('fringes are calculated on gross pay', async () => {
    const entries = [
      makeEntry('2024-06-10', '07:00', '19:00'),
    ];
    const timecard = { entries };
    const deal = makeDealMemo();

    const result = await calculatePayrollItem(timecard, deal);

    // Holiday: 1375 * 0.1207 = 166.0 (approx)
    expect(result.holidayPay).toBeGreaterThan(0);
    expect(result.employerNi).toBeGreaterThan(0);
    expect(result.employerPension).toBeGreaterThan(0);
    expect(result.totalFringes).toBeGreaterThan(0);

    // Total cost = gross + fringes
    expect(result.totalCost).toBe(result.grossPay + result.totalFringes);
  });

  // ---- Daily pay basis ----
  it('daily pay basis multiplies daily rate by days worked', async () => {
    const entries = [
      makeEntry('2024-06-10', '07:00', '19:00'),
      makeEntry('2024-06-11', '07:00', '19:00'),
      makeEntry('2024-06-12', '07:00', '19:00'),
    ];
    const timecard = { entries };
    const deal = makeDealMemo({ payBasis: 'daily' });

    const result = await calculatePayrollItem(timecard, deal);

    expect(result.daysWorked).toBe(3);
    expect(result.basePay).toBe(825); // 275 * 3
  });

  // ---- Empty timecard ----
  it('empty timecard returns zero values', async () => {
    const timecard = { entries: [] };
    const deal = makeDealMemo();

    const result = await calculatePayrollItem(timecard, deal);

    expect(result.daysWorked).toBe(0);
    expect(result.totalStraightHrs).toBe(0);
    expect(result.basePay).toBe(1375); // weekly rate regardless
    expect(result.grossPay).toBe(1375);
  });

  // ---- Entries with missing call/wrap are skipped ----
  it('entries with missing call/wrap are skipped', async () => {
    const entries = [
      makeEntry('2024-06-10', '07:00', '19:00'),
      makeEntry('2024-06-11', null, null), // skipped
      makeEntry('2024-06-12', '07:00', '19:00'),
    ];
    const timecard = { entries };
    const deal = makeDealMemo();

    const result = await calculatePayrollItem(timecard, deal);

    expect(result.daysWorked).toBe(2);
    expect(result.totalStraightHrs).toBe(22); // 2 * 11
  });
});
