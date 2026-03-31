/**
 * Check turnaround compliance between two consecutive work days.
 *
 * @param {string} previousDayWrapTime - e.g. "22:30"
 * @param {string|Date} previousDayDate - the date of the previous work day
 * @param {string} currentDayCallTime - e.g. "07:00"
 * @param {string|Date} currentDayDate - the date of the current work day
 * @param {number} minTurnaroundHrs - minimum required rest hours (default 11)
 * @returns {Object} { violation, shortfallHrs, penaltyHrs }
 */
export const checkTurnaround = (
  previousDayWrapTime,
  previousDayDate,
  currentDayCallTime,
  currentDayDate,
  minTurnaroundHrs = 11
) => {
  const result = { violation: false, shortfallHrs: 0, penaltyHrs: 0 };

  if (!previousDayWrapTime || !currentDayCallTime || !previousDayDate || !currentDayDate) {
    return result;
  }

  // Build full Date objects
  const prevDate = new Date(previousDayDate);
  const currDate = new Date(currentDayDate);

  const [wrapH, wrapM] = previousDayWrapTime.split(':').map(Number);
  const [callH, callM] = currentDayCallTime.split(':').map(Number);

  const wrapDateTime = new Date(prevDate);
  wrapDateTime.setHours(wrapH, wrapM, 0, 0);

  const callDateTime = new Date(currDate);
  callDateTime.setHours(callH, callM, 0, 0);

  // If wrap time appears to be after midnight (i.e. wrap on next calendar day)
  // and dates are the same, add a day to call
  if (callDateTime <= wrapDateTime) {
    // wrap was after midnight scenario already handled by different dates
    // This shouldn't normally happen if dates are correct
    return result;
  }

  const restMs = callDateTime.getTime() - wrapDateTime.getTime();
  const restHrs = restMs / (1000 * 60 * 60);

  if (restHrs < minTurnaroundHrs) {
    result.violation = true;
    result.shortfallHrs = Math.round((minTurnaroundHrs - restHrs) * 100) / 100;
    // Penalty hours = the shortfall
    result.penaltyHrs = result.shortfallHrs;
  }

  return result;
};
