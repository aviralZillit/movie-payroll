import Decimal from 'decimal.js';

/**
 * Universal Timecard Calculator.
 *
 * ALL rates, caps, toggles, and multipliers come from the deal memo.
 * NO hardcoded territory-specific logic.
 * The deal memo was populated with territory defaults + admin overrides at creation time.
 */

// ── Time Parsing ─────────────────────────────────────────────────────
function parseTime(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

function formatMinsToHrs(mins) {
  return Math.round((mins / 60) * 100) / 100;
}

// ── Calculate a Single Day ───────────────────────────────────────────
/**
 * @param {object} entry - Timecard day entry (crewCall, unitCall, unitWrap, release, lunchStart, lunchEnd, dayType, etc.)
 * @param {object} dm - Deal memo (all rates, caps, toggles)
 * @param {object|null} prevEntry - Previous day's entry (for turnaround/BTA calc)
 * @returns {object} Calculated breakdown for this day
 */
export function calculateDay(entry, dm, prevEntry = null) {
  const result = {
    preCallOTMins: 0, filmingOTMins: 0, wrapOTMins: 0,
    btaMins: 0, mealDelayMins: 0,
    totalWorkedHrs: 0, straightHrs: 0, ot1x5Hrs: 0, ot2xHrs: 0, nightHrs: 0,
    nightShoot: false, turnaroundHrs: 0, turnaroundViolation: false, turnaroundShortfallHrs: 0,
    basicPay: 0, preCallOTPay: 0, filmingOTPay: 0, wrapOTPay: 0,
    btaPay: 0, mealDelayPay: 0, nightPremPay: 0, dayTotal: 0,
  };

  // Parse times (use release as wrap fallback)
  const crewCallM = parseTime(entry.callTime || entry.crewCall);
  const unitCallM = parseTime(entry.unitCall) || crewCallM;
  const unitWrapM = parseTime(entry.unitWrap) || parseTime(entry.wrapTime || entry.release);
  let releaseM = parseTime(entry.release || entry.wrapTime);

  if (crewCallM === null || releaseM === null) return result;

  // Handle overnight (wrap/release past midnight)
  if (unitWrapM !== null && unitWrapM < unitCallM) releaseM += 1440;
  if (releaseM < crewCallM) releaseM += 1440;

  // Lunch break duration
  const lunchStartM = parseTime(entry.lunchStart);
  const lunchEndM = parseTime(entry.lunchEnd);
  let lunchMins = 0;
  if (lunchStartM !== null && lunchEndM !== null) {
    let le = lunchEndM;
    if (le < lunchStartM) le += 1440;
    lunchMins = le - lunchStartM;
  }

  // ── Contracted hours from deal memo ────────────────────────────
  const dayType = entry.dayType || 'SWD';
  const contractedHrs = dm.contractedHoursPerDayType?.[dayType]
    || dm.contractedHoursPerDayType?.default
    || dm.standardWorkDayHrs || 11;
  const contractedMins = contractedHrs * 60;

  // ── Total worked hours ─────────────────────────────────────────
  const totalMins = Math.max(0, releaseM - crewCallM - lunchMins);
  result.totalWorkedHrs = formatMinsToHrs(totalMins);

  // ── OT Breakdown (only if deal memo says OT applicable) ────────
  const otApplicable = dm.overtimeApplicable !== false
    && dm.rateType !== 'buyout' && dm.rateType !== 'all_in'
    && !['flat', 'picture', 'per_film', 'flat_fee'].includes(dm.dealType);

  if (otApplicable && unitCallM !== null && unitWrapM !== null) {
    // Pre-Call OT: crewCall → unitCall
    result.preCallOTMins = Math.max(0, unitCallM - crewCallM);

    // Filming hours: unitCall → unitWrap minus lunch
    const filmingMins = Math.max(0, (unitWrapM < unitCallM ? unitWrapM + 1440 : unitWrapM) - unitCallM - lunchMins);
    result.filmingOTMins = Math.max(0, filmingMins - contractedMins);

    // Wrap OT: unitWrap → release
    const uwM = unitWrapM < unitCallM ? unitWrapM + 1440 : unitWrapM;
    result.wrapOTMins = Math.max(0, releaseM - uwM);

    // Straight hours
    const straightMins = totalMins - result.preCallOTMins - result.filmingOTMins - result.wrapOTMins;
    result.straightHrs = formatMinsToHrs(Math.max(0, straightMins));
    result.ot1x5Hrs = formatMinsToHrs(result.preCallOTMins + result.filmingOTMins + result.wrapOTMins);
  } else {
    result.straightHrs = result.totalWorkedHrs;
  }

  // ── BTA (Below Turnaround Allowance) ───────────────────────────
  if (dm.btaEnabled && prevEntry) {
    const prevReleaseM = parseTime(prevEntry.release || prevEntry.wrapTime);
    if (prevReleaseM !== null && crewCallM !== null) {
      let turnaround = crewCallM - prevReleaseM;
      if (turnaround < 0) turnaround += 1440; // overnight
      result.turnaroundHrs = formatMinsToHrs(turnaround);
      const minTA = (dm.turnaroundMinHrs || 11) * 60;
      if (turnaround < minTA) {
        result.btaMins = minTA - turnaround;
        result.turnaroundViolation = true;
        result.turnaroundShortfallHrs = formatMinsToHrs(result.btaMins);
      }
    }
  } else if (prevEntry) {
    // Even without BTA, track turnaround hours
    const prevReleaseM = parseTime(prevEntry.release || prevEntry.wrapTime);
    if (prevReleaseM !== null && crewCallM !== null) {
      let turnaround = crewCallM - prevReleaseM;
      if (turnaround < 0) turnaround += 1440;
      result.turnaroundHrs = formatMinsToHrs(turnaround);
      const minTA = (dm.turnaroundMinHrs || 11) * 60;
      if (turnaround < minTA) {
        result.turnaroundViolation = true;
        result.turnaroundShortfallHrs = formatMinsToHrs(minTA - turnaround);
      }
    }
  }

  // ── Meal Delay Penalty ─────────────────────────────────────────
  if (dm.mealPenaltyEnabled !== false && dayType !== 'CWD') {
    const mealWindow = (dm.mealPenaltyAfterHrs || 6) * 60;
    if (lunchStartM !== null && crewCallM !== null) {
      const mealDelay = lunchStartM - crewCallM;
      if (mealDelay > mealWindow) {
        result.mealDelayMins = mealDelay - mealWindow;
      }
    }
  }

  // ── Night Shoot Detection ──────────────────────────────────────
  if (dm.nightPremiumEnabled !== false) {
    // Night shoot = unit wrap past midnight (wrap time < call time)
    const rawWrap = parseTime(entry.unitWrap || entry.wrapTime || entry.release);
    const rawCall = parseTime(entry.unitCall || entry.callTime);
    if (rawWrap !== null && rawCall !== null && rawWrap < rawCall) {
      result.nightShoot = true;
    }
  }

  // ── Pay Calculation (ALL from deal memo rates) ─────────────────
  const hr = new Decimal(dm.hourlyRate || 0);
  const dailyRate = new Decimal(dm.dailyRate || 0);
  const otCap = dm.otRateCap ? new Decimal(dm.otRateCap) : null;

  // OT rate based on deal memo (camera dept may get 2x, others 1.5x)
  const otMult = new Decimal(dm.otMultiplier || 1.5);
  const otRate = otCap ? Decimal.min(hr.times(otMult), otCap) : hr.times(otMult);

  // Camera dept filming OT may use 2x
  const filmingOTMult = dm.isCameraDept ? new Decimal(2) : otMult;
  const filmingOTRate = otCap ? Decimal.min(hr.times(filmingOTMult), otCap) : hr.times(filmingOTMult);

  // Basic pay (daily rate or derived from separate rates)
  if (dm.separateRates) {
    const rateKey = { Prep: 'prepRate', Shoot: 'shootRate', Wrap: 'wrapRate', Travel: 'travelRate' };
    result.basicPay = Number(dm[rateKey[dayType]] || dm.shootRate || dm.dailyRate || 0);
  } else {
    result.basicPay = dailyRate.toNumber();
  }

  // OT pay
  if (otApplicable) {
    result.preCallOTPay = new Decimal(result.preCallOTMins).div(60).times(otRate).toDecimalPlaces(2).toNumber();
    result.filmingOTPay = new Decimal(result.filmingOTMins).div(60).times(filmingOTRate).toDecimalPlaces(2).toNumber();
    result.wrapOTPay = new Decimal(result.wrapOTMins).div(60).times(otRate).toDecimalPlaces(2).toNumber();
  }

  // BTA pay
  if (result.btaMins > 0) {
    const btaHrRate = dm.btaRate ? new Decimal(dm.btaRate) : otRate;
    result.btaPay = new Decimal(result.btaMins).div(60).times(btaHrRate).toDecimalPlaces(2).toNumber();
  }

  // Meal delay pay
  if (result.mealDelayMins > 0) {
    if (dm.mealPenaltyRate) {
      // Per-increment penalty (e.g., £35 per 15-min increment)
      const increments = Math.ceil(result.mealDelayMins / 15);
      result.mealDelayPay = increments * dm.mealPenaltyRate;
    } else {
      result.mealDelayPay = new Decimal(result.mealDelayMins).div(60).times(hr).toDecimalPlaces(2).toNumber();
    }
  }

  // Night premium pay
  if (result.nightShoot) {
    if (dm.nightPremiumFlat > 0) {
      result.nightPremPay = dm.nightPremiumFlat;
    } else if (dm.nightPremiumPct > 0) {
      result.nightPremPay = hr.times(dm.nightPremiumPct / 100).times(result.nightHrs || 1).toDecimalPlaces(2).toNumber();
    }
  }

  // 6th/7th day multiplier adjustments
  if (entry.isSixthDay && dm.sixthDayMultiplier > 1) {
    result.basicPay = dailyRate.times(dm.sixthDayMultiplier).toDecimalPlaces(2).toNumber();
  }
  if (entry.isSeventhDay && dm.seventhDayMultiplier > 1) {
    result.basicPay = dailyRate.times(dm.seventhDayMultiplier).toDecimalPlaces(2).toNumber();
  }

  // Day total
  result.dayTotal = result.basicPay + result.preCallOTPay + result.filmingOTPay
    + result.wrapOTPay + result.btaPay + result.mealDelayPay + result.nightPremPay;

  return result;
}

// ── Calculate Full Week ──────────────────────────────────────────────
/**
 * Calculate all 7 days and aggregate weekly totals.
 * @param {object[]} entries - 7 day entries
 * @param {object} dm - Deal memo
 * @returns {object} { days: calculatedDays[], weekly: weeklyTotals }
 */
export function calculateWeek(entries, dm) {
  const days = [];
  let wkBasicPay = 0, wkPreCallOTPay = 0, wkFilmingOTPay = 0, wkWrapOTPay = 0;
  let wkBTAPay = 0, wkMealPenaltyPay = 0, wkNightPremPay = 0, wkGross = 0;
  let totalStraightHrs = 0, totalOtHrs = 0, totalNightHrs = 0;
  let daysWorked = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const prevEntry = i > 0 ? entries[i - 1] : null;
    const calc = calculateDay(entry, dm, prevEntry);
    days.push(calc);

    if (entry.callTime || entry.crewCall) daysWorked++;
    wkBasicPay += calc.basicPay;
    wkPreCallOTPay += calc.preCallOTPay;
    wkFilmingOTPay += calc.filmingOTPay;
    wkWrapOTPay += calc.wrapOTPay;
    wkBTAPay += calc.btaPay;
    wkMealPenaltyPay += calc.mealDelayPay;
    wkNightPremPay += calc.nightPremPay;
    wkGross += calc.dayTotal;
    totalStraightHrs += calc.straightHrs;
    totalOtHrs += calc.ot1x5Hrs;
    totalNightHrs += calc.nightHrs;
  }

  return {
    days,
    weekly: {
      wkBasicPay: Math.round(wkBasicPay * 100) / 100,
      wkPreCallOTPay: Math.round(wkPreCallOTPay * 100) / 100,
      wkFilmingOTPay: Math.round(wkFilmingOTPay * 100) / 100,
      wkWrapOTPay: Math.round(wkWrapOTPay * 100) / 100,
      wkBTAPay: Math.round(wkBTAPay * 100) / 100,
      wkMealPenaltyPay: Math.round(wkMealPenaltyPay * 100) / 100,
      wkNightPremPay: Math.round(wkNightPremPay * 100) / 100,
      wkGross: Math.round(wkGross * 100) / 100,
      totalStraightHrs: Math.round(totalStraightHrs * 100) / 100,
      totalOtHrs: Math.round(totalOtHrs * 100) / 100,
      totalNightHrs: Math.round(totalNightHrs * 100) / 100,
      daysWorked,
    },
  };
}
