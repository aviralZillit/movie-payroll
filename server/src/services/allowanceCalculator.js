import Decimal from 'decimal.js';

/**
 * Calculate allowance pro-rating based on days worked and allowance cap rules.
 * Implements Kate's full allowance cap model.
 *
 * @param {Array} allowances - Deal memo allowances with caps
 * @param {Array} entries - Timecard entries (7 days)
 * @param {Number} daysWorked - Total days worked
 * @returns {Array} Breakdown per allowance
 */
export function calculateAllowanceProRating(allowances, entries, daysWorked) {
  if (!allowances || allowances.length === 0) return [];

  const breakdown = [];

  for (const allowance of allowances) {
    const caps = allowance.caps || {};
    const amount = new Decimal(allowance.amount || 0);
    const frequency = caps.frequency || allowance.period || 'weekly';

    // Count applicable days
    let applicableDays = 0;
    for (const entry of entries) {
      if (!entry) continue;
      if (entry.isRestDay || entry.isHoliday) continue;

      // Check day exclusions
      const dayOfWeek = entry.dayOfWeek || 0;
      if (caps.excludeSundays && dayOfWeek === 7) continue;
      if (caps.excludeSaturdays && dayOfWeek === 6) continue;

      // Check day type exclusions
      const dayType = entry.dayType || 'shoot';
      if (!caps.payableOnTravelDays && dayType === 'travel') continue;
      if (!caps.payableOnPrepDays && dayType === 'prep') continue;

      // Only count if there's actual work (callTime + wrapTime)
      if (entry.callTime && entry.wrapTime) {
        applicableDays++;
      }
    }

    // Apply maxDaysPerWeek cap
    if (caps.maxDaysPerWeek && applicableDays > caps.maxDaysPerWeek) {
      applicableDays = caps.maxDaysPerWeek;
    }

    // Calculate weekly total based on frequency
    let weeklyTotal = new Decimal(0);

    if (frequency === 'weekly') {
      // Pro-rate if short week
      if (caps.proRateShortWeeks && caps.minDaysForFullRate && applicableDays < caps.minDaysForFullRate) {
        weeklyTotal = amount.times(applicableDays).div(caps.minDaysForFullRate);
      } else {
        weeklyTotal = amount;
      }
    } else if (frequency === 'daily') {
      weeklyTotal = amount.times(applicableDays);
    } else if (frequency === 'monthly') {
      weeklyTotal = amount.div(4.33); // Monthly to weekly approximation
    } else if (frequency === 'per-engagement') {
      weeklyTotal = amount; // Full amount once per engagement
    }

    // Apply weekly cap
    if (caps.weeklyCap && weeklyTotal.gt(caps.weeklyCap)) {
      weeklyTotal = new Decimal(caps.weeklyCap);
    }

    // Apply daily cap (total cannot exceed dailyCap × applicableDays)
    if (caps.dailyCap) {
      const dailyMax = new Decimal(caps.dailyCap).times(applicableDays);
      if (weeklyTotal.gt(dailyMax)) {
        weeklyTotal = dailyMax;
      }
    }

    breakdown.push({
      name: allowance.name,
      amount: amount.toNumber(),
      frequency,
      applicableDays,
      dailyAmount: applicableDays > 0 ? weeklyTotal.div(applicableDays).toDecimalPlaces(2).toNumber() : 0,
      weeklyTotal: weeklyTotal.toDecimalPlaces(2).toNumber(),
      capsApplied: !!(caps.weeklyCap || caps.dailyCap || caps.maxDaysPerWeek || caps.proRateShortWeeks),
      taxTreatment: allowance.taxTreatment || 'non-taxable',
      nominalCode: allowance.nominalCode || '2340',
    });
  }

  return breakdown;
}
