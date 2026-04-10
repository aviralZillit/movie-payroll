import { Timecard, DealMemo } from '../models/index.js';
import { calculateWeek } from '../services/timecardCalculator.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * Generate a unique timecard number: TC-YYYY-NNNNN
 */
const generateTimecardNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `TC-${year}-`;

  const last = await Timecard.findOne({ timecardNumber: { $regex: `^${prefix}` } })
    .sort({ timecardNumber: -1 })
    .select('timecardNumber');

  let next = 1;
  if (last) {
    const parts = last.timecardNumber.split('-');
    next = parseInt(parts[2], 10) + 1;
  }

  return `${prefix}${String(next).padStart(5, '0')}`;
};

/**
 * POST /api/timecards
 */
export const create = asyncHandler(async (req, res) => {
  const { dealMemoId, productionId, weekStarting, weekEnding, entries } = req.body;

  const dealMemo = await DealMemo.findById(dealMemoId);
  if (!dealMemo) {
    throw new AppError('Deal memo not found.', 404);
  }

  if (!['active', 'signed'].includes(dealMemo.status)) {
    throw new AppError('Deal memo must be active or signed to create timecards.', 400);
  }

  const timecard = await Timecard.create({
    timecardNumber: await generateTimecardNumber(),
    productionId,
    dealMemoId,
    ownerId: req.user._id,
    weekStarting,
    weekEnding,
    entries: entries || [],
    // Snapshot territory from deal memo for calculation routing
    schemaVersion: dealMemo.schemaVersion || 1,
  });

  const populated = await Timecard.findById(timecard._id)
    .populate('productionId', 'name code country')
    .populate('dealMemoId')
    .populate('ownerId', 'firstName lastName email');

  res.status(201).json({ success: true, data: populated });
});

/**
 * PUT /api/timecards/:id/entries
 */
export const updateEntries = asyncHandler(async (req, res) => {
  const timecard = await Timecard.findById(req.params.id);
  if (!timecard) {
    throw new AppError('Timecard not found.', 404);
  }

  if (!['draft', 'rejected', 'revision_requested'].includes(timecard.status)) {
    throw new AppError(`Cannot edit entries on a ${timecard.status} timecard.`, 400);
  }

  timecard.entries = req.body.entries;
  await timecard.save();

  const populated = await Timecard.findById(timecard._id)
    .populate('productionId', 'name code country')
    .populate('dealMemoId')
    .populate('ownerId', 'firstName lastName email');

  res.json({ success: true, data: populated });
});

/**
 * Reusable calculation logic — uses the universal timecardCalculator.
 * ALL rates come from the deal memo. No hardcoded values.
 * Mutates the timecard in-place (entries + weekly totals) but does NOT save.
 */
async function runCalculation(timecard) {
  const dealMemo = await DealMemo.findById(timecard.dealMemoId);
  if (!dealMemo) {
    throw new AppError('Associated deal memo not found.', 404);
  }

  const sortedEntries = [...timecard.entries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Run the universal calculator — reads all rates from deal memo
  const { days, weekly } = calculateWeek(sortedEntries, dealMemo);

  // Merge calculated values back into entries
  for (let i = 0; i < sortedEntries.length; i++) {
    const calc = days[i];
    if (!calc) continue;

    // Hours
    sortedEntries[i].totalWorkedHrs = calc.totalWorkedHrs;
    sortedEntries[i].straightHrs = calc.straightHrs;
    sortedEntries[i].ot1x5Hrs = calc.ot1x5Hrs;
    sortedEntries[i].ot2xHrs = calc.ot2xHrs;
    sortedEntries[i].nightHrs = calc.nightHrs || 0;

    // OT breakdown (minutes)
    sortedEntries[i].preCallOTMins = calc.preCallMins || 0;
    sortedEntries[i].filmingOTMins = calc.filmingOTMins || 0;
    sortedEntries[i].wrapOTMins = calc.wrapMins || 0;
    sortedEntries[i].btaMins = calc.btaMins || 0;
    sortedEntries[i].mealDelayMins = calc.mealDelayMins || 0;

    // Pay breakdown
    sortedEntries[i].basicPay = calc.basicPay || 0;
    sortedEntries[i].preCallOTPay = calc.preCallOTPay || 0;
    sortedEntries[i].filmingOTPay = calc.filmingOTPay || 0;
    sortedEntries[i].wrapOTPay = calc.wrapOTPay || 0;
    sortedEntries[i].btaPay = calc.btaPay || 0;
    sortedEntries[i].mealDelayPay = calc.mealDelayPay || 0;
    sortedEntries[i].nightPremPay = calc.nightPremPay || 0;
    sortedEntries[i].dayTotal = calc.dayTotal || 0;

    // Penalties & flags
    sortedEntries[i].nightShoot = calc.nightShoot || false;
    sortedEntries[i].turnaroundViolation = calc.turnaroundViolation || false;
    sortedEntries[i].turnaroundHrs = calc.turnaroundHrs || 0;
    sortedEntries[i].turnaroundShortfallHrs = calc.turnaroundShortfallHrs || 0;
    if (calc.mealDelayMins > 0) {
      sortedEntries[i].mealPenaltyCount = Math.ceil(calc.mealDelayMins / 15);
      sortedEntries[i].mealPenaltyMinutes = calc.mealDelayMins;
    }
  }

  // Update timecard
  timecard.entries = sortedEntries;

  // Weekly hour totals
  timecard.totalStraightHrs = weekly.totalStraightHrs;
  timecard.totalOt1x5Hrs = weekly.totalOtHrs;
  timecard.totalNightHrs = weekly.totalNightHrs;
  timecard.daysWorked = weekly.daysWorked;
  timecard.totalMealPenalties = sortedEntries.filter(e => e.mealPenaltyCount > 0).length;
  timecard.totalTurnaroundPenalties = sortedEntries.filter(e => e.turnaroundViolation).length;

  // Weekly pay totals
  timecard.wkBasicPay = weekly.wkBasicPay;
  timecard.wkPreCallOTPay = weekly.wkPreCallOTPay;
  timecard.wkFilmingOTPay = weekly.wkFilmingOTPay;
  timecard.wkWrapOTPay = weekly.wkWrapOTPay;
  timecard.wkBTAPay = weekly.wkBTAPay;
  timecard.wkMealPenaltyPay = weekly.wkMealPenaltyPay;
  timecard.wkNightPremPay = weekly.wkNightPremPay;
  timecard.wkGross = weekly.wkGross;
}

/**
 * POST /api/timecards/:id/calculate
 * Triggers server-side OT / penalty calculation on entries
 */
export const calculate = asyncHandler(async (req, res) => {
  const timecard = await Timecard.findById(req.params.id);
  if (!timecard) {
    throw new AppError('Timecard not found.', 404);
  }

  await runCalculation(timecard);
  await timecard.save();

  const populated = await Timecard.findById(timecard._id)
    .populate('productionId', 'name code country')
    .populate('dealMemoId')
    .populate('ownerId', 'firstName lastName email');

  res.json({ success: true, data: populated });
});

/**
 * PATCH /api/timecards/:id/submit
 */
export const submit = asyncHandler(async (req, res) => {
  const timecard = await Timecard.findById(req.params.id);
  if (!timecard) throw new AppError('Timecard not found.', 404);

  if (!['draft', 'rejected', 'revision_requested'].includes(timecard.status)) {
    throw new AppError(`Cannot submit a ${timecard.status} timecard.`, 400);
  }

  if (!timecard.entries.length) {
    throw new AppError('Cannot submit a timecard with no entries.', 400);
  }

  // Auto-calculate before submitting so totals are always up to date
  await runCalculation(timecard);

  timecard.status = 'submitted';
  timecard.submittedAt = new Date();
  await timecard.save();

  const populated = await Timecard.findById(timecard._id)
    .populate('productionId', 'name code country')
    .populate('dealMemoId')
    .populate('ownerId', 'firstName lastName email');

  res.json({ success: true, data: populated });
});

/**
 * PATCH /api/timecards/:id/dept-approve
 */
export const deptApprove = asyncHandler(async (req, res) => {
  const timecard = await Timecard.findById(req.params.id);
  if (!timecard) throw new AppError('Timecard not found.', 404);

  if (timecard.status !== 'submitted') {
    throw new AppError('Only submitted timecards can be department-approved.', 400);
  }

  timecard.status = 'dept_approved';
  timecard.deptApprovedById = req.user._id;
  timecard.deptApprovedAt = new Date();
  await timecard.save();

  res.json({ success: true, data: timecard });
});

/**
 * PATCH /api/timecards/:id/payroll-approve
 */
export const payrollApprove = asyncHandler(async (req, res) => {
  const timecard = await Timecard.findById(req.params.id);
  if (!timecard) throw new AppError('Timecard not found.', 404);

  if (timecard.status !== 'dept_approved') {
    throw new AppError('Only department-approved timecards can be payroll-approved.', 400);
  }

  timecard.status = 'payroll_approved';
  timecard.payrollApprovedById = req.user._id;
  timecard.payrollApprovedAt = new Date();
  await timecard.save();

  res.json({ success: true, data: timecard });
});

/**
 * PATCH /api/timecards/:id/reject
 * Body: { reason }
 */
export const reject = asyncHandler(async (req, res) => {
  const timecard = await Timecard.findById(req.params.id);
  if (!timecard) throw new AppError('Timecard not found.', 404);

  if (!['submitted', 'dept_approved'].includes(timecard.status)) {
    throw new AppError('Only submitted or dept_approved timecards can be rejected.', 400);
  }

  timecard.status = 'rejected';
  timecard.rejectionReason = req.body.reason || '';
  await timecard.save();

  res.json({ success: true, data: timecard });
});

/**
 * GET /api/timecards
 */
export const getAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.productionId) filter.productionId = req.query.productionId;
  if (req.query.weekStarting) filter.weekStarting = new Date(req.query.weekStarting);

  // Crew members only see their own timecards
  if (req.user.role === 'crew_member') {
    filter.ownerId = req.user._id;
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [timecards, total] = await Promise.all([
    Timecard.find(filter)
      .populate('productionId', 'name code country')
      .populate('dealMemoId')
      .populate('ownerId', 'firstName lastName email')
      .populate('deptApprovedById', 'firstName lastName')
      .populate('payrollApprovedById', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Timecard.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: timecards,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/timecards/:id
 */
export const getById = asyncHandler(async (req, res) => {
  const timecard = await Timecard.findById(req.params.id)
    .populate('productionId', 'name code country')
    .populate('dealMemoId')
    .populate('ownerId', 'firstName lastName email')
    .populate('deptApprovedById', 'firstName lastName')
    .populate('payrollApprovedById', 'firstName lastName');

  if (!timecard) throw new AppError('Timecard not found.', 404);

  res.json({ success: true, data: timecard });
});

/**
 * GET /api/timecards/my-timecards
 */
export const getMyTimecards = asyncHandler(async (req, res) => {
  const filter = { ownerId: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const timecards = await Timecard.find(filter)
    .populate('productionId', 'name code country')
    .populate('dealMemoId')
    .sort({ weekStarting: -1 });

  res.json({ success: true, data: timecards });
});

/**
 * GET /api/timecards/approvals
 * For dept heads and payroll admins to see timecards awaiting their approval
 */
export const getApprovals = asyncHandler(async (req, res) => {
  let filter = {};

  if (['department_head'].includes(req.user.role)) {
    filter.status = 'submitted';
  } else if (['payroll_admin', 'super_admin', 'production_accountant'].includes(req.user.role)) {
    filter.status = req.query.status || 'dept_approved';
  }

  if (req.query.productionId) {
    filter.productionId = req.query.productionId;
  }

  const timecards = await Timecard.find(filter)
    .populate('productionId', 'name code country')
    .populate('dealMemoId')
    .populate('ownerId', 'firstName lastName email')
    .sort({ submittedAt: -1 });

  res.json({ success: true, data: timecards });
});
