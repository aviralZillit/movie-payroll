import {
  RateCard,
  Union,
  Department,
  Designation,
  BudgetTier,
} from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * GET /api/admin/rate-cards
 * Returns ALL rate cards with populated references.
 * Query params: unionCode, deptCode, budgetTierCode, search (designation name)
 * Sorted by union -> department -> designation -> budget tier.
 */
export const getAllRateCards = asyncHandler(async (req, res) => {
  const { unionCode, deptCode, budgetTierCode, search, page = 1, limit = 25 } = req.query;

  const filter = { isActive: true };

  // Build lookup filters for related collections
  if (unionCode) {
    const union = await Union.findOne({ code: unionCode.toUpperCase(), isActive: true });
    if (!union) throw new AppError(`Union with code "${unionCode}" not found.`, 404);
    filter.unionId = union._id;
  }

  if (deptCode) {
    const dept = await Department.findOne({ code: deptCode.toUpperCase(), isActive: true });
    if (!dept) throw new AppError(`Department with code "${deptCode}" not found.`, 404);
    filter.departmentId = dept._id;
  }

  if (budgetTierCode) {
    const tier = await BudgetTier.findOne({ code: budgetTierCode.toUpperCase(), isActive: true });
    if (!tier) throw new AppError(`Budget tier with code "${budgetTierCode}" not found.`, 404);
    filter.budgetTierId = tier._id;
  }

  if (search) {
    const designations = await Designation.find({
      name: { $regex: search, $options: 'i' },
      isActive: true,
    }).select('_id');
    filter.designationId = { $in: designations.map((d) => d._id) };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const skip = (pageNum - 1) * pageSize;

  const [rateCards, total] = await Promise.all([
    RateCard.find(filter)
      .populate({ path: 'unionId', select: 'code name country' })
      .populate({ path: 'departmentId', select: 'code name sortOrder' })
      .populate({ path: 'designationId', select: 'code name level' })
      .populate({ path: 'budgetTierId', select: 'code name sortOrder productionType' })
      .sort({
        'unionId.code': 1,
        'departmentId.sortOrder': 1,
        'designationId.level': 1,
        'budgetTierId.sortOrder': 1,
      })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    RateCard.countDocuments(filter),
  ]);

  // Post-sort since populate sort doesn't work on virtual paths
  rateCards.sort((a, b) => {
    const uA = a.unionId?.code || '';
    const uB = b.unionId?.code || '';
    if (uA !== uB) return uA.localeCompare(uB);

    const dSortA = a.departmentId?.sortOrder ?? 0;
    const dSortB = b.departmentId?.sortOrder ?? 0;
    if (dSortA !== dSortB) return dSortA - dSortB;

    const dNameA = a.departmentId?.name || '';
    const dNameB = b.departmentId?.name || '';
    if (dNameA !== dNameB) return dNameA.localeCompare(dNameB);

    const desLevelA = a.designationId?.level ?? 0;
    const desLevelB = b.designationId?.level ?? 0;
    if (desLevelA !== desLevelB) return desLevelA - desLevelB;

    const tSortA = a.budgetTierId?.sortOrder ?? 0;
    const tSortB = b.budgetTierId?.sortOrder ?? 0;
    return tSortA - tSortB;
  });

  res.json({
    success: true,
    data: rateCards,
    pagination: {
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

/**
 * GET /api/admin/rate-cards/summary
 * Returns aggregate stats: total rate cards, by union, by department, rate ranges.
 */
export const getRateCardsSummary = asyncHandler(async (_req, res) => {
  const [
    totalCount,
    byUnion,
    byDepartment,
    rateRanges,
    lastUpdated,
  ] = await Promise.all([
    RateCard.countDocuments({ isActive: true }),

    RateCard.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'unions',
          localField: 'unionId',
          foreignField: '_id',
          as: 'union',
        },
      },
      { $unwind: '$union' },
      {
        $group: {
          _id: '$unionId',
          code: { $first: '$union.code' },
          name: { $first: '$union.name' },
          count: { $sum: 1 },
        },
      },
      { $sort: { code: 1 } },
    ]),

    RateCard.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: '$department' },
      {
        $group: {
          _id: '$departmentId',
          code: { $first: '$department.code' },
          name: { $first: '$department.name' },
          count: { $sum: 1 },
        },
      },
      { $sort: { name: 1 } },
    ]),

    RateCard.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minWeekly: { $min: '$weeklyRate' },
          maxWeekly: { $max: '$weeklyRate' },
          avgWeekly: { $avg: '$weeklyRate' },
          minDaily: { $min: '$dailyRate' },
          maxDaily: { $max: '$dailyRate' },
          minHourly: { $min: '$hourlyRate' },
          maxHourly: { $max: '$hourlyRate' },
        },
      },
    ]),

    RateCard.findOne({ isActive: true })
      .sort({ updatedAt: -1 })
      .select('updatedAt')
      .lean(),
  ]);

  res.json({
    success: true,
    data: {
      totalRateCards: totalCount,
      unionCount: byUnion.length,
      departmentCount: byDepartment.length,
      lastUpdated: lastUpdated?.updatedAt || null,
      byUnion,
      byDepartment,
      rateRanges: rateRanges[0] || {
        minWeekly: 0,
        maxWeekly: 0,
        avgWeekly: 0,
        minDaily: 0,
        maxDaily: 0,
        minHourly: 0,
        maxHourly: 0,
      },
    },
  });
});

/**
 * PUT /api/admin/rate-cards/:id
 * Admin updates a rate card's rates and source info.
 */
export const updateRateCard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const allowedFields = [
    'weeklyRate',
    'dailyRate',
    'hourlyRate',
    'overtimeRate1x5',
    'overtimeRate2x',
    'sixthDayRate',
    'seventhDayRate',
    'nightPremiumPct',
    'holidayPayInclusive',
    'sourceUrl',
    'sourceDocument',
    'notes',
    'effectiveFrom',
    'effectiveTo',
    'isActive',
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields provided for update.', 400);
  }

  const rateCard = await RateCard.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })
    .populate({ path: 'unionId', select: 'code name' })
    .populate({ path: 'departmentId', select: 'code name' })
    .populate({ path: 'designationId', select: 'code name' })
    .populate({ path: 'budgetTierId', select: 'code name' });

  if (!rateCard) {
    throw new AppError('Rate card not found.', 404);
  }

  res.json({ success: true, data: rateCard });
});

/**
 * POST /api/admin/rate-cards
 * Admin creates a new rate card.
 */
export const createRateCard = asyncHandler(async (req, res) => {
  const {
    unionId,
    departmentId,
    designationId,
    budgetTierId,
    effectiveFrom,
    weeklyRate,
    dailyRate,
    hourlyRate,
    sourceUrl,
    sourceDocument,
  } = req.body;

  if (!unionId || !departmentId || !designationId || !budgetTierId) {
    throw new AppError(
      'unionId, departmentId, designationId, and budgetTierId are required.',
      400
    );
  }

  if (!effectiveFrom) {
    throw new AppError('effectiveFrom date is required.', 400);
  }

  if (weeklyRate == null || dailyRate == null || hourlyRate == null) {
    throw new AppError('weeklyRate, dailyRate, and hourlyRate are required.', 400);
  }

  if (!sourceUrl || !sourceDocument) {
    throw new AppError('sourceUrl and sourceDocument are required.', 400);
  }

  // Verify referenced documents exist
  const [union, dept, desig, tier] = await Promise.all([
    Union.findById(unionId),
    Department.findById(departmentId),
    Designation.findById(designationId),
    BudgetTier.findById(budgetTierId),
  ]);

  if (!union) throw new AppError('Union not found.', 404);
  if (!dept) throw new AppError('Department not found.', 404);
  if (!desig) throw new AppError('Designation not found.', 404);
  if (!tier) throw new AppError('Budget tier not found.', 404);

  const rateCard = await RateCard.create({
    unionId,
    departmentId,
    designationId,
    budgetTierId,
    effectiveFrom,
    effectiveTo: req.body.effectiveTo || null,
    weeklyRate,
    dailyRate,
    hourlyRate,
    overtimeRate1x5: req.body.overtimeRate1x5,
    overtimeRate2x: req.body.overtimeRate2x,
    sixthDayRate: req.body.sixthDayRate,
    seventhDayRate: req.body.seventhDayRate,
    nightPremiumPct: req.body.nightPremiumPct,
    holidayPayInclusive: req.body.holidayPayInclusive ?? false,
    sourceUrl,
    sourceDocument,
    notes: req.body.notes,
  });

  const populated = await RateCard.findById(rateCard._id)
    .populate({ path: 'unionId', select: 'code name' })
    .populate({ path: 'departmentId', select: 'code name' })
    .populate({ path: 'designationId', select: 'code name' })
    .populate({ path: 'budgetTierId', select: 'code name' });

  res.status(201).json({ success: true, data: populated });
});
