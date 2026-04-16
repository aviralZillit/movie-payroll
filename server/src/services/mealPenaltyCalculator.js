import { parseTimeToMinutes } from './overtimeCalculator.js';

/**
 * Calculate meal penalty for a single timecard entry.
 *
 * Checks ALL gaps between work periods and meal breaks:
 *   1. Crew Call → first qualifying meal
 *   2. End of Meal 1 → start of Meal 2
 *   3. End of Meal 2 → start of Meal 3
 *   4. End of last meal → Release
 *
 * A meal break must be at least minMealDurationMin (default 30) to count as
 * a qualifying meal. Shorter breaks (tea breaks, etc.) are ignored.
 *
 * Penalties accrue in increments (default 15 min) for each gap that exceeds
 * the threshold (default 6 hours).
 *
 * @param {Object} entry - timecard entry with time fields
 * @param {Object} dealMemo - deal memo with penalty config
 * @returns {Object} { count, minutes, amount, details[] }
 */
export const calculateMealPenalty = (entry, dealMemo) => {
  const result = { count: 0, minutes: 0, amount: 0, details: [] };

  if (!entry.callTime) return result;

  // PACT/BECTU §5.4(a): meal penalty clock starts from UNIT CALL, not crew call.
  // "crew members should be entitled to take their lunch break no later than 6 hours after unit call"
  // Fall back to crew call only if unit call is not set.
  const mealClockStart = parseTimeToMinutes(entry.unitCall || entry.callTime);
  const callMin = parseTimeToMinutes(entry.callTime);
  const releaseMin = parseTimeToMinutes(entry.release || entry.wrapTime);

  const thresholdMin = (dealMemo.mealPenaltyAfterHrs || 6) * 60;
  const incrementMin = dealMemo.mealPenaltyIncrementMin || 15;
  // PACT/BECTU §5.4(b): penalty at crew's hourly rate per increment if no fixed rate set
  // When mealPenaltyRate is not explicitly set, fall back to the crew's hourly rate
  // (weekly ÷ 55 per PACT/BECTU §3.3a). This is the standard for UK productions.
  const hourlyRate = dealMemo.hourlyRate || (dealMemo.weeklyRate ? dealMemo.weeklyRate / 55 : 0);
  const penaltyRate = dealMemo.mealPenaltyRate > 0
    ? dealMemo.mealPenaltyRate
    : dealMemo.mealPenaltyAmounts?.[0] > 0
      ? dealMemo.mealPenaltyAmounts[0]
      : hourlyRate; // fallback: crew's own hourly rate
  const minMealDuration = dealMemo.minMealBreakMins || 30; // minimum duration for a qualifying meal

  if (penaltyRate <= 0) return result;

  // Collect all meal breaks with their start/end times
  const meals = [
    { start: entry.lunchStart, end: entry.lunchEnd },
    { start: entry.secondMealStart, end: entry.secondMealEnd },
    { start: entry.thirdMealStart, end: entry.thirdMealEnd },
    { start: entry.fourthMealStart, end: entry.fourthMealEnd },
  ]
    .filter(m => m.start && m.end)
    .map(m => {
      let s = parseTimeToMinutes(m.start);
      let e = parseTimeToMinutes(m.end);
      // Handle overnight
      if (s < callMin) s += 1440;
      if (e < s) e += 1440;
      return { start: s, end: e, duration: e - s };
    })
    // Only count qualifying meals (at least minMealDuration minutes)
    .filter(m => m.duration >= minMealDuration)
    .sort((a, b) => a.start - b.start);

  // Build work periods — gaps between unit call (or crew call) and qualifying meals
  // §5.4(a): "6 hours after unit call" — first gap measured from unit call
  const checkpoints = [mealClockStart]; // start from unit call per §5.4(a)
  for (const meal of meals) {
    checkpoints.push(meal.start); // work period ends at meal start
    checkpoints.push(meal.end);   // next work period starts at meal end
  }
  if (releaseMin !== null) {
    let rel = releaseMin;
    if (rel < callMin) rel += 1440;
    checkpoints.push(rel); // work ends at release
  }

  // Check each work period (pairs: period_start → period_end)
  // Work periods are: [callMin, meal1.start], [meal1.end, meal2.start], [meal2.end, release]
  for (let i = 0; i < checkpoints.length - 1; i += 2) {
    const periodStart = checkpoints[i];
    const periodEnd = checkpoints[i + 1];
    if (periodEnd === undefined) break;

    const gap = periodEnd - periodStart;
    if (gap > thresholdMin) {
      const excess = gap - thresholdMin;
      const increments = Math.ceil(excess / incrementMin);
      const amount = increments * penaltyRate;
      result.count += increments;
      result.minutes += excess;
      result.amount += amount;
      result.details.push({
        from: formatMins(periodStart),
        to: formatMins(periodEnd),
        gap: Math.round(gap / 60 * 10) / 10,
        excess: Math.round(excess / 60 * 10) / 10,
        increments,
        amount,
      });
    }
  }

  return result;
};

function formatMins(m) {
  const h = Math.floor((m % 1440) / 60);
  const min = (m % 1440) % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}
