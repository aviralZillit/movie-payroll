/**
 * Parse a time string like "07:00" to total minutes from midnight.
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes to decimal hours.
 */
const minutesToHours = (minutes) => {
  return Math.round((minutes / 60) * 100) / 100;
};

/**
 * Calculate hours breakdown for a single timecard entry day.
 *
 * @param {Object} entry - timecard entry { callTime, wrapTime, lunchStart, lunchEnd, secondMealStart, secondMealEnd, isSixthDay, isSeventhDay }
 * @param {Object} dealMemo - deal memo { standardWorkDayHrs, nightStartTime, lunchBreakHrs }
 * @param {Array} overtimeRules - sorted OT rules from rateEngine
 * @param {Object} [options] - optional overrides
 * @param {number} [options.standardHoursOverride] - override for standardWorkDayHrs (from dayTypeConfig.standardHours)
 * @returns {Object} { totalWorkedHrs, straightHrs, ot1x5Hrs, ot2xHrs, nightHrs }
 */
export const calculateDayHours = (entry, dealMemo, overtimeRules = [], options = {}) => {
  const result = {
    totalWorkedHrs: 0,
    straightHrs: 0,
    ot1x5Hrs: 0,
    ot2xHrs: 0,
    nightHrs: 0,
  };

  if (!entry.callTime || !entry.wrapTime) {
    return result;
  }

  const callMin = parseTimeToMinutes(entry.callTime);
  let wrapMin = parseTimeToMinutes(entry.wrapTime);

  // Handle overnight wrap (e.g. call 18:00, wrap 02:00 next day)
  if (wrapMin <= callMin) {
    wrapMin += 24 * 60;
  }

  // Calculate lunch duration in minutes
  let lunchDurationMin = 0;
  if (entry.lunchStart && entry.lunchEnd) {
    let lunchStartMin = parseTimeToMinutes(entry.lunchStart);
    let lunchEndMin = parseTimeToMinutes(entry.lunchEnd);
    if (lunchStartMin > callMin + 12 * 60) {
      // likely same-day
    }
    if (lunchEndMin < lunchStartMin) {
      lunchEndMin += 24 * 60;
    }
    lunchDurationMin = lunchEndMin - lunchStartMin;
  }

  // Calculate second meal break
  let secondMealDurationMin = 0;
  if (entry.secondMealStart && entry.secondMealEnd) {
    let sm2Start = parseTimeToMinutes(entry.secondMealStart);
    let sm2End = parseTimeToMinutes(entry.secondMealEnd);
    if (sm2End < sm2Start) {
      sm2End += 24 * 60;
    }
    secondMealDurationMin = sm2End - sm2Start;
  }

  // Total worked = (wrap - call) - lunch - second meal
  const totalWorkedMin = (wrapMin - callMin) - lunchDurationMin - secondMealDurationMin;
  const totalWorkedHrs = minutesToHours(Math.max(0, totalWorkedMin));
  result.totalWorkedHrs = totalWorkedHrs;

  const standardHrs = options.standardHoursOverride || dealMemo.standardWorkDayHrs || 11;
  const nightStartTime = dealMemo.nightStartTime || '23:00';
  const nightStartMin = parseTimeToMinutes(nightStartTime);

  // Straight hours = min(totalWorked, standardWorkDayHrs)
  result.straightHrs = Math.min(totalWorkedHrs, standardHrs);

  // Remaining hours after straight time
  const remainingHrs = Math.max(0, totalWorkedHrs - standardHrs);

  if (remainingHrs > 0) {
    // Calculate how many hours fall after nightStartTime
    // Night hours are from nightStartTime to wrapTime (minus breaks in that window)
    let nightMinutes = 0;
    if (wrapMin > nightStartMin) {
      // Effective work minutes after night start
      const nightWorkStart = Math.max(callMin, nightStartMin);
      let nightWorkEnd = wrapMin;

      let nightBreakMin = 0;
      // Subtract lunch if it falls in night window
      if (entry.lunchStart && entry.lunchEnd) {
        const ls = parseTimeToMinutes(entry.lunchStart);
        const le = parseTimeToMinutes(entry.lunchEnd);
        if (ls >= nightStartMin) {
          nightBreakMin += (le > ls ? le - ls : le + 24 * 60 - ls);
        }
      }
      // Subtract second meal if in night window
      if (entry.secondMealStart && entry.secondMealEnd) {
        const ss = parseTimeToMinutes(entry.secondMealStart);
        const se = parseTimeToMinutes(entry.secondMealEnd);
        if (ss >= nightStartMin) {
          nightBreakMin += (se > ss ? se - ss : se + 24 * 60 - ss);
        }
      }

      nightMinutes = Math.max(0, (nightWorkEnd - nightWorkStart) - nightBreakMin);
    }

    result.nightHrs = minutesToHours(nightMinutes);

    // OT hours split: 1.5x is remaining hours before night, 2x is remaining hours during night
    // Night hours that exceed standard time go to 2x
    const nightOtHrs = Math.min(result.nightHrs, remainingHrs);
    result.ot2xHrs = Math.round(nightOtHrs * 100) / 100;
    result.ot1x5Hrs = Math.round((remainingHrs - nightOtHrs) * 100) / 100;

    // Ensure non-negative
    result.ot1x5Hrs = Math.max(0, result.ot1x5Hrs);
    result.ot2xHrs = Math.max(0, result.ot2xHrs);
  }

  return result;
};
