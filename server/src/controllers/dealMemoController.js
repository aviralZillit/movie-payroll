import { DealMemo, Production } from '../models/index.js';
import * as rateEngine from '../services/rateEngine.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const VALID_TRANSITIONS = {
  draft: ['sent', 'cancelled'],
  sent: ['negotiating', 'signed', 'cancelled'],
  negotiating: ['sent', 'signed', 'cancelled'],
  signed: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/**
 * Generate a unique deal number in format DM-YYYY-NNN
 */
const generateDealNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `DM-${year}-`;

  const lastDeal = await DealMemo.findOne({ dealNumber: { $regex: `^${prefix}` } })
    .sort({ dealNumber: -1 })
    .select('dealNumber');

  let nextNumber = 1;
  if (lastDeal) {
    const parts = lastDeal.dealNumber.split('-');
    nextNumber = parseInt(parts[2], 10) + 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};

/**
 * POST /api/deal-memos
 */
export const create = asyncHandler(async (req, res) => {
  const {
    productionId,
    personId,
    unionId,
    departmentId,
    designationId,
    budgetTierId,
    startDate,
    ...rest
  } = req.body;

  // Verify production exists
  const production = await Production.findById(productionId);
  if (!production) {
    throw new AppError('Production not found.', 404);
  }

  // Auto-populate rates from rate engine
  const rateCard = await rateEngine.lookupRate({
    unionId,
    departmentId,
    designationId,
    budgetTierId,
    date: startDate,
  });

  // Map form field names to model field names
  if (rest.guaranteedHours != null) {
    rest.guaranteedHoursPerWeek = rest.guaranteedHours;
    rest.guaranteedHoursPerDay = Math.round(rest.guaranteedHours / 5);
    delete rest.guaranteedHours;
  }
  if (rest.apprenticeLevyPct != null) {
    rest.apprenticeshipLevyPct = rest.apprenticeLevyPct;
    delete rest.apprenticeLevyPct;
  }
  if (rest.mealPenaltyEnabled != null && rest.mealPenaltyAmount != null) {
    rest.mealPenaltyRate = rest.mealPenaltyAmount;
  }
  if (rest.mealPenaltyAfterHrs != null) {
    rest.mealPenaltyAfterHrs = rest.mealPenaltyAfterHrs;
  }

  const dealData = {
    dealNumber: await generateDealNumber(),
    productionId,
    personId,
    createdById: req.user._id,
    unionId,
    departmentId,
    designationId,
    budgetTierId,
    startDate,
    ...rest,
  };

  // If rate card found, populate defaults (can be overridden by rest)
  if (rateCard) {
    dealData.weeklyRate = dealData.weeklyRate ?? rateCard.weeklyRate;
    dealData.dailyRate = dealData.dailyRate ?? rateCard.dailyRate;
    dealData.hourlyRate = dealData.hourlyRate ?? rateCard.hourlyRate;
    dealData.otRate1x5 = dealData.otRate1x5 ?? rateCard.overtimeRate1x5;
    dealData.otRate2x = dealData.otRate2x ?? rateCard.overtimeRate2x;
    dealData.rateCardId = rateCard._id;
    dealData.rateCardSourceUrl = rateCard.sourceUrl;
    if (rateCard.holidayPayInclusive) {
      dealData.holidayPayInclusive = true;
    }
    if (rateCard.nightPremiumPct != null) {
      dealData.nightPremiumPct = dealData.nightPremiumPct ?? rateCard.nightPremiumPct;
    }
  }

  // Calculate OT rates from hourly if not provided
  if (!dealData.otRate1x5 && dealData.hourlyRate) {
    dealData.otRate1x5 = dealData.hourlyRate * 1.5;
  }
  if (!dealData.otRate2x && dealData.hourlyRate) {
    dealData.otRate2x = dealData.hourlyRate * 2;
  }

  const dealMemo = await DealMemo.create(dealData);

  const populated = await DealMemo.findById(dealMemo._id)
    .populate('productionId', 'name code')
    .populate('personId', 'firstName lastName email')
    .populate('createdById', 'firstName lastName email')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name');

  res.status(201).json({ success: true, data: populated });
});

/**
 * PUT /api/deal-memos/:id
 */
export const update = asyncHandler(async (req, res) => {
  const dealMemo = await DealMemo.findById(req.params.id);
  if (!dealMemo) {
    throw new AppError('Deal memo not found.', 404);
  }

  if (['completed', 'cancelled'].includes(dealMemo.status)) {
    throw new AppError(`Cannot update a ${dealMemo.status} deal memo.`, 400);
  }

  // If rates are being updated, validate against minimum
  if (req.body.weeklyRate || req.body.dailyRate || req.body.hourlyRate) {
    const rateCard = await rateEngine.lookupRate({
      unionId: dealMemo.unionId,
      departmentId: dealMemo.departmentId,
      designationId: dealMemo.designationId,
      budgetTierId: dealMemo.budgetTierId,
      date: dealMemo.startDate,
    });

    if (rateCard) {
      if (req.body.weeklyRate) {
        const validation = rateEngine.validateRate(req.body.weeklyRate, rateCard.weeklyRate);
        if (!validation.isValid) {
          throw new AppError(validation.warningMessage, 400);
        }
      }
      if (req.body.dailyRate) {
        const validation = rateEngine.validateRate(req.body.dailyRate, rateCard.dailyRate);
        if (!validation.isValid) {
          throw new AppError(validation.warningMessage, 400);
        }
      }
      if (req.body.hourlyRate) {
        const validation = rateEngine.validateRate(req.body.hourlyRate, rateCard.hourlyRate);
        if (!validation.isValid) {
          throw new AppError(validation.warningMessage, 400);
        }
      }
    }
  }

  Object.assign(dealMemo, req.body);
  await dealMemo.save();

  const populated = await DealMemo.findById(dealMemo._id)
    .populate('productionId', 'name code')
    .populate('personId', 'firstName lastName email')
    .populate('createdById', 'firstName lastName email')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name');

  res.json({ success: true, data: populated });
});

/**
 * GET /api/deal-memos
 */
export const getAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.productionId) filter.productionId = req.query.productionId;

  // Crew members only see their own deal memos
  if (req.user.role === 'crew_member') {
    filter.personId = req.user._id;
  }
  // Dept heads see deals for their department's productions
  // (for now, they see all — can be scoped later)

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [deals, total] = await Promise.all([
    DealMemo.find(filter)
      .populate('productionId', 'name code')
      .populate('personId', 'firstName lastName email')
      .populate('createdById', 'firstName lastName email')
      .populate('unionId', 'code name')
      .populate('departmentId', 'code name')
      .populate('designationId', 'code name')
      .populate('budgetTierId', 'code name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DealMemo.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: deals,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/deal-memos/:id
 */
export const getById = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id)
    .populate('productionId', 'name code')
    .populate('personId', 'firstName lastName email')
    .populate('createdById', 'firstName lastName email')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name')
    .populate('rateCardId')
    .populate('statusHistory.changedBy', 'firstName lastName email');

  if (!deal) {
    throw new AppError('Deal memo not found.', 404);
  }

  // Crew members can only view their own deal memos
  if (
    req.user.role === 'crew_member' &&
    deal.personId._id.toString() !== req.user._id.toString()
  ) {
    throw new AppError('You do not have permission to view this deal memo.', 403);
  }

  res.json({ success: true, data: deal });
});

/**
 * GET /api/deal-memos/production/:productionId
 */
export const getByProduction = asyncHandler(async (req, res) => {
  const deals = await DealMemo.find({ productionId: req.params.productionId })
    .populate('personId', 'firstName lastName email')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: deals });
});

/**
 * GET /api/deal-memos/my-deals
 */
export const getMyDeals = asyncHandler(async (req, res) => {
  const deals = await DealMemo.find({ personId: req.user._id })
    .populate('productionId', 'name code')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: deals });
});

/**
 * PATCH /api/deal-memos/:id/transition
 * Body: { toStatus, note }
 */
export const transitionStatus = asyncHandler(async (req, res) => {
  const { toStatus, note } = req.body;

  const deal = await DealMemo.findById(req.params.id);
  if (!deal) {
    throw new AppError('Deal memo not found.', 404);
  }

  const allowed = VALID_TRANSITIONS[deal.status];
  if (!allowed || !allowed.includes(toStatus)) {
    throw new AppError(
      `Cannot transition from '${deal.status}' to '${toStatus}'. Allowed: ${(allowed || []).join(', ') || 'none'}.`,
      400
    );
  }

  const role = req.user.role;
  const isAdmin = ['super_admin', 'payroll_admin', 'production_accountant'].includes(role);
  const isPersonOnDeal = deal.personId.toString() === req.user._id.toString();

  // Per-transition authorization
  const from = deal.status;

  if (from === 'draft' && toStatus === 'sent') {
    // Only admin/accountant can send
    if (!isAdmin) {
      throw new AppError('Only admins or accountants can send deal memos.', 403);
    }
  } else if (from === 'sent' && toStatus === 'signed') {
    // The crew member who is the personId on the deal, or admin
    if (!isAdmin && !isPersonOnDeal) {
      throw new AppError('Only the assigned crew member or an admin can sign this deal memo.', 403);
    }
  } else if (from === 'signed' && toStatus === 'active') {
    // Only admin/accountant can activate
    if (!isAdmin) {
      throw new AppError('Only admins or accountants can activate deal memos.', 403);
    }
  } else if (toStatus === 'cancelled') {
    // Only admin can cancel
    if (!['super_admin', 'payroll_admin'].includes(role)) {
      throw new AppError('Only admins can cancel deal memos.', 403);
    }
  } else if (from === 'negotiating' || toStatus === 'negotiating') {
    // Negotiating transitions: either party (admin or the person on the deal)
    if (!isAdmin && !isPersonOnDeal) {
      throw new AppError('Only the assigned crew member or an admin can transition negotiating deals.', 403);
    }
  }

  const fromStatus = deal.status;
  deal.status = toStatus;

  if (toStatus === 'signed') {
    deal.signedAt = new Date();
  }

  deal.statusHistory.push({
    fromStatus,
    toStatus,
    changedBy: req.user._id,
    note,
  });

  await deal.save();

  const populated = await DealMemo.findById(deal._id)
    .populate('productionId', 'name code')
    .populate('personId', 'firstName lastName email')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name')
    .populate('statusHistory.changedBy', 'firstName lastName email');

  res.json({ success: true, data: populated });
});

/**
 * PATCH /api/deal-memos/:id/crew-complete
 * Crew member updates their own fields (NI, bank, DOB, etc.)
 * Only the assigned person can update. Only CREW_FIELDS allowed.
 */
const CREW_FIELDS = [
  'dateOfBirth', 'address', 'emergencyContact',
  'niNumber', 'taxCode', 'starterDeclaration', 'p45Received',
  'bankSortCode', 'bankAccountNumber',
  'ssn', 'w4FilingStatus', 'stateWithholding', 'achRoutingNumber', 'achAccountNumber',
  'tfn', 'superFund', 'superMemberNumber', 'bsb',
  'sin', 'province',
  'taxId', 'iban', 'swift',
  'ltdCompanyName', 'ltdCompanyReg',
  'corpName', 'corpEin',
];

export const crewComplete = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id);
  if (!deal) throw new AppError('Deal memo not found.', 404);

  // Only the assigned crew member can update their fields
  if (deal.personId.toString() !== req.user._id.toString()) {
    throw new AppError('Only the assigned crew member can complete these fields.', 403);
  }

  // Filter to only allowed crew fields
  const updates = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (CREW_FIELDS.includes(key)) {
      updates[key] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid crew fields provided.', 400);
  }

  Object.assign(deal, updates);
  await deal.save();

  const populated = await DealMemo.findById(deal._id)
    .populate('productionId', 'name code country currency')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name');

  res.json({ success: true, data: populated });
});
