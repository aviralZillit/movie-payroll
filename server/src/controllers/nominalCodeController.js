import { NominalCode, DesignationCodeMap, ProductionBudget } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/nominal-codes
 * List nominal codes with optional filters: ?type=labour&category=CAMERA
 */
export const getNominalCodes = asyncHandler(async (req, res) => {
  const filter = { isActive: true };

  if (req.query.type) {
    filter.type = req.query.type;
  }
  if (req.query.category) {
    filter.category = { $regex: new RegExp(req.query.category, 'i') };
  }
  if (req.query.categoryCode) {
    filter.categoryCode = req.query.categoryCode;
  }
  if (req.query.isCategory !== undefined) {
    filter.isCategory = req.query.isCategory === 'true';
  }

  const codes = await NominalCode.find(filter).sort({ code: 1 }).lean();
  res.json({ success: true, data: codes, count: codes.length });
});

/**
 * GET /api/nominal-codes/map?designation=X&department=Y
 * Look up the budget code mapping for a specific designation + department.
 */
export const getCodeMapping = asyncHandler(async (req, res) => {
  const { designation, department } = req.query;

  if (!designation) {
    return res.status(400).json({ success: false, message: 'designation query param is required' });
  }

  const filter = {
    designationName: { $regex: new RegExp(`^${designation}$`, 'i') },
    isActive: true,
  };
  if (department) {
    filter.departmentName = { $regex: new RegExp(department, 'i') };
  }

  const mapping = await DesignationCodeMap.findOne(filter).lean();

  if (!mapping) {
    return res.status(404).json({ success: false, message: 'No code mapping found for this designation' });
  }

  res.json({ success: true, data: mapping });
});

/**
 * GET /api/productions/:id/budget
 * Get the production budget (imported from Movie Magic or entered manually).
 */
export const getProductionBudget = asyncHandler(async (req, res) => {
  const budget = await ProductionBudget.findOne({
    productionId: req.params.id,
    isActive: true,
  }).lean();

  if (!budget) {
    return res.status(404).json({ success: false, message: 'No budget found for this production' });
  }

  res.json({ success: true, data: budget });
});
