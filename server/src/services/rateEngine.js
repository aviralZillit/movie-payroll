import { RateCard, OvertimeRule } from '../models/index.js';
import AppError from '../utils/AppError.js';

/**
 * Look up the active rate card matching the given criteria for a specific date.
 * Returns the full rate object including sourceUrl.
 */
/**
 * Look up a single rate card. If dealType is provided, returns that specific deal.
 * If not provided, defaults to '55hr_week'.
 */
export const lookupRate = async ({ unionId, departmentId, designationId, budgetTierId, dealType, date }) => {
  const queryDate = date ? new Date(date) : new Date();

  const query = {
    unionId,
    departmentId,
    designationId,
    budgetTierId,
    isActive: true,
    effectiveFrom: { $lte: queryDate },
    $or: [
      { effectiveTo: null },
      { effectiveTo: { $gte: queryDate } },
    ],
  };

  if (dealType) {
    query.dealType = dealType;
  }

  const rateCard = await RateCard.findOne(query)
    .sort({ effectiveFrom: -1 })
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name');

  if (!rateCard) {
    return null;
  }

  return rateCard;
};

/**
 * Look up ALL deal types for a given role+tier combination.
 * Returns an array of rate cards (one per deal type).
 */
export const lookupAllDealTypes = async ({ unionId, departmentId, designationId, budgetTierId, date }) => {
  const queryDate = date ? new Date(date) : new Date();

  const rateCards = await RateCard.find({
    unionId,
    departmentId,
    designationId,
    budgetTierId,
    isActive: true,
    effectiveFrom: { $lte: queryDate },
    $or: [
      { effectiveTo: null },
      { effectiveTo: { $gte: queryDate } },
    ],
  })
    .sort({ dealType: 1, effectiveFrom: -1 })
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name');

  // Deduplicate — keep only the most recent per dealType
  const seen = new Map();
  for (const rc of rateCards) {
    const dt = rc.dealType || '55hr_week';
    if (!seen.has(dt)) seen.set(dt, rc);
  }

  return Array.from(seen.values());
};

/**
 * Validate a proposed rate against a minimum rate.
 */
export const validateRate = (proposedRate, minimumRate) => {
  const proposed = Number(proposedRate);
  const minimum = Number(minimumRate);

  if (isNaN(proposed) || isNaN(minimum)) {
    throw new AppError('Rates must be valid numbers.', 400);
  }

  const isValid = proposed >= minimum;
  const difference = proposed - minimum;

  let warningMessage = null;
  if (!isValid) {
    warningMessage = `Proposed rate (${proposed.toFixed(2)}) is below the minimum union rate (${minimum.toFixed(2)}) by ${Math.abs(difference).toFixed(2)}.`;
  }

  return {
    isValid,
    minimum,
    proposed,
    difference,
    warningMessage,
  };
};

/**
 * Get overtime rules for a union/department combination.
 * Department-specific rules override general union rules based on priority.
 */
export const getOvertimeRules = async (unionId, departmentId) => {
  const query = {
    unionId,
    isActive: true,
    $or: [
      { departmentId: null },
      ...(departmentId ? [{ departmentId }] : []),
    ],
  };

  const rules = await OvertimeRule.find(query)
    .sort({ priority: -1 })
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name');

  // If department-specific rules exist, they take precedence for overlapping afterHours
  if (departmentId) {
    const deptRules = rules.filter(
      (r) => r.departmentId && r.departmentId._id.toString() === departmentId.toString()
    );
    const generalRules = rules.filter((r) => !r.departmentId);

    // Department rules override general rules at the same afterHours threshold
    const deptAfterHours = new Set(deptRules.map((r) => r.afterHours));
    const filteredGeneral = generalRules.filter(
      (r) => !deptAfterHours.has(r.afterHours)
    );

    return [...deptRules, ...filteredGeneral].sort((a, b) => b.priority - a.priority);
  }

  return rules;
};
