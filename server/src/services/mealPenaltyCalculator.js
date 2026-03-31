import { parseTimeToMinutes } from './overtimeCalculator.js';

/**
 * Calculate meal penalty for a single timecard entry.
 *
 * If the gap from callTime to lunchStart exceeds mealPenaltyAfterHrs,
 * penalties accrue in increments of mealPenaltyIncrementMin.
 *
 * @param {Object} entry - { callTime, lunchStart }
 * @param {Object} dealMemo - { mealPenaltyAfterHrs, mealPenaltyIncrementMin, mealPenaltyRate }
 * @returns {Object} { count, minutes, amount }
 */
export const calculateMealPenalty = (entry, dealMemo) => {
  const result = { count: 0, minutes: 0, amount: 0 };

  if (!entry.callTime || !entry.lunchStart) {
    return result;
  }

  const callMin = parseTimeToMinutes(entry.callTime);
  let lunchStartMin = parseTimeToMinutes(entry.lunchStart);

  // Handle overnight
  if (lunchStartMin < callMin) {
    lunchStartMin += 24 * 60;
  }

  const gapMinutes = lunchStartMin - callMin;
  const thresholdMinutes = (dealMemo.mealPenaltyAfterHrs || 6) * 60;
  const incrementMin = dealMemo.mealPenaltyIncrementMin || 15;
  const penaltyRate = dealMemo.mealPenaltyRate || 0;

  if (gapMinutes <= thresholdMinutes) {
    return result;
  }

  const excessMinutes = gapMinutes - thresholdMinutes;
  const penaltyCount = Math.ceil(excessMinutes / incrementMin);

  result.count = penaltyCount;
  result.minutes = excessMinutes;
  result.amount = penaltyCount * penaltyRate;

  return result;
};
