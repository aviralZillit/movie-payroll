import { Territory, TerritoryRule } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * GET /api/territories
 * List all active territories
 */
export const getAll = asyncHandler(async (req, res) => {
  const territories = await Territory.find({ isActive: true }).sort({ region: 1, name: 1 }).lean();

  // Attach agreement count per territory
  const ruleCounts = await TerritoryRule.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$territoryCode', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(ruleCounts.map((r) => [r._id, r.count]));

  const result = territories.map((t) => ({
    ...t,
    agreementCount: countMap[t.code] || 0,
  }));

  res.json({ success: true, data: result });
});

/**
 * GET /api/territories/:code
 * Get a single territory with its rules
 */
export const getByCode = asyncHandler(async (req, res) => {
  const territory = await Territory.findOne({ code: req.params.code.toUpperCase(), isActive: true }).lean();
  if (!territory) throw new AppError('Territory not found', 404);

  const rules = await TerritoryRule.find({ territoryCode: territory.code, isActive: true })
    .sort({ unionKey: 1 })
    .lean();

  res.json({ success: true, data: { ...territory, rules } });
});

/**
 * GET /api/territories/:code/rules
 * Get all rules for a territory
 */
export const getRules = asyncHandler(async (req, res) => {
  const rules = await TerritoryRule.find({
    territoryCode: req.params.code.toUpperCase(),
    isActive: true,
  })
    .sort({ unionKey: 1 })
    .lean();

  res.json({ success: true, data: rules });
});

/**
 * GET /api/territories/:code/rules/:unionKey
 * Get a specific agreement's rules
 */
export const getRule = asyncHandler(async (req, res) => {
  const territory = req.params.code.toUpperCase();
  const unionKey = req.params.unionKey;

  // Try exact match first
  let rule = await TerritoryRule.findOne({
    territoryCode: territory,
    unionKey: unionKey,
    isActive: true,
  }).lean();

  // Fuzzy match: BECTU → PACT-BECTU, SAG_AFTRA → SAG-THEATRICAL, etc.
  if (!rule) {
    const allRules = await TerritoryRule.find({ territoryCode: territory, isActive: true }).lean();
    rule = allRules.find(r =>
      r.unionKey.toUpperCase().includes(unionKey.toUpperCase()) ||
      unionKey.toUpperCase().includes(r.unionKey.replace('PACT-', '').replace('-BASIC', '').replace('-THEATRICAL', '').toUpperCase())
    );
  }

  if (!rule) throw new AppError('Territory rule not found', 404);

  res.json({ success: true, data: rule });
});
