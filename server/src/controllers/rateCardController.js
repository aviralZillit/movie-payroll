import { Union, Department, Designation, BudgetTier } from '../models/index.js';
import * as rateEngine from '../services/rateEngine.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * GET /api/rate-cards/unions
 */
export const getUnions = asyncHandler(async (_req, res) => {
  const unions = await Union.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, data: unions });
});

/**
 * GET /api/rate-cards/unions/:unionId/departments
 */
export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({
    unionId: req.params.unionId,
    isActive: true,
  })
    .sort({ sortOrder: 1, name: 1 })
    .populate('unionId', 'code name');

  res.json({ success: true, data: departments });
});

/**
 * GET /api/rate-cards/departments/:departmentId/designations
 */
export const getDesignations = asyncHandler(async (req, res) => {
  const designations = await Designation.find({
    departmentId: req.params.departmentId,
    isActive: true,
  })
    .sort({ level: 1, name: 1 })
    .populate('departmentId', 'code name');

  res.json({ success: true, data: designations });
});

/**
 * GET /api/rate-cards/budget-tiers
 * Query params: unionId, productionType
 */
export const getBudgetTiers = asyncHandler(async (req, res) => {
  const filter = { isActive: true };

  if (req.query.unionId) {
    filter.$or = [{ unionId: req.query.unionId }, { unionId: null }];
  }
  if (req.query.productionType) {
    filter.$or = filter.$or || [];
    const ptFilter = [
      { productionType: req.query.productionType },
      { productionType: null },
    ];
    if (filter.$or.length) {
      // combine with existing $or using $and
      const existingOr = filter.$or;
      delete filter.$or;
      filter.$and = [{ $or: existingOr }, { $or: ptFilter }];
    } else {
      filter.$or = ptFilter;
    }
  }

  const tiers = await BudgetTier.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .populate('unionId', 'code name');

  res.json({ success: true, data: tiers });
});

/**
 * POST /api/rate-cards/lookup
 * Body: { unionId, departmentId, designationId, budgetTierId, date }
 */
export const lookupRate = asyncHandler(async (req, res) => {
  const { unionId, departmentId, designationId, budgetTierId, date } = req.body;

  if (!unionId || !departmentId || !designationId || !budgetTierId) {
    throw new AppError('unionId, departmentId, designationId, and budgetTierId are required.', 400);
  }

  const rateCard = await rateEngine.lookupRate({
    unionId,
    departmentId,
    designationId,
    budgetTierId,
    date,
  });

  if (!rateCard) {
    throw new AppError('No active rate card found for the given criteria.', 404);
  }

  res.json({ success: true, data: rateCard });
});

/**
 * GET /api/rate-cards/unions/:unionId/overtime-rules
 * Query param: departmentId (optional)
 */
export const getOvertimeRules = asyncHandler(async (req, res) => {
  const rules = await rateEngine.getOvertimeRules(
    req.params.unionId,
    req.query.departmentId || null
  );

  res.json({ success: true, data: rules });
});

/**
 * POST /api/rate-cards/validate
 * Body: { proposedRate, minimumRate }
 */
export const validateRate = asyncHandler(async (req, res) => {
  const { proposedRate, minimumRate } = req.body;

  if (proposedRate == null || minimumRate == null) {
    throw new AppError('proposedRate and minimumRate are required.', 400);
  }

  const result = rateEngine.validateRate(proposedRate, minimumRate);

  res.json({ success: true, data: result });
});
