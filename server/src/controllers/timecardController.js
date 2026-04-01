import { Timecard, DealMemo } from '../models/index.js';
import { calculateDayHours } from '../services/overtimeCalculator.js';
import { calculateMealPenalty } from '../services/mealPenaltyCalculator.js';
import { checkTurnaround } from '../services/turnaroundCalculator.js';
import { getOvertimeRules } from '../services/rateEngine.js';
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
  });

  const populated = await Timecard.findById(timecard._id)
    .populate('productionId', 'name code')
    .populate('dealMemoId', 'dealNumber personId unionId departmentId designationId')
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
    .populate('productionId', 'name code')
    .populate('dealMemoId', 'dealNumber')
    .populate('ownerId', 'firstName lastName email');

  res.json({ success: true, data: populated });
});

/**
 * POST /api/timecards/:id/calculate
 * Triggers server-side OT / penalty calculation on entries
 */
export const calculate = asyncHandler(async (req, res) => {
  const timecard = await Timecard.findById(req.params.id);
  if (!timecard) {
    throw new AppError('Timecard not found.', 404);
  }

  const dealMemo = await DealMemo.findById(timecard.dealMemoId);
  if (!dealMemo) {
    throw new AppError('Associated deal memo not found.', 404);
  }

  const overtimeRules = await getOvertimeRules(
    dealMemo.unionId,
    dealMemo.departmentId
  );

  let totalStraight = 0;
  let totalOt1x5 = 0;
  let totalOt2x = 0;
  let totalNight = 0;
  let totalMealPen = 0;
  let totalTurnaround = 0;
  let daysWorked = 0;

  const sortedEntries = [...timecard.entries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];

    if (!entry.callTime || !entry.wrapTime) continue;
    daysWorked++;

    // OT hours
    const hours = calculateDayHours(entry, dealMemo, overtimeRules);
    entry.totalWorkedHrs = hours.totalWorkedHrs;
    entry.straightHrs = hours.straightHrs;
    entry.ot1x5Hrs = hours.ot1x5Hrs;
    entry.ot2xHrs = hours.ot2xHrs;
    entry.nightHrs = hours.nightHrs;

    totalStraight += hours.straightHrs;
    totalOt1x5 += hours.ot1x5Hrs;
    totalOt2x += hours.ot2xHrs;
    totalNight += hours.nightHrs;

    // Meal penalties
    const meal = calculateMealPenalty(entry, dealMemo);
    entry.mealPenaltyCount = meal.count;
    entry.mealPenaltyMinutes = meal.minutes;
    totalMealPen += meal.count;

    // Turnaround
    if (i > 0) {
      const prev = sortedEntries[i - 1];
      if (prev.wrapTime) {
        const ta = checkTurnaround(
          prev.wrapTime,
          prev.date,
          entry.callTime,
          entry.date,
          dealMemo.turnaroundMinHrs || 11
        );
        entry.turnaroundViolation = ta.violation;
        entry.turnaroundShortfallHrs = ta.shortfallHrs;
        if (ta.violation) totalTurnaround++;
      }
    }
  }

  // Write back sorted entries
  timecard.entries = sortedEntries;
  timecard.totalStraightHrs = Math.round(totalStraight * 100) / 100;
  timecard.totalOt1x5Hrs = Math.round(totalOt1x5 * 100) / 100;
  timecard.totalOt2xHrs = Math.round(totalOt2x * 100) / 100;
  timecard.totalNightHrs = Math.round(totalNight * 100) / 100;
  timecard.totalMealPenalties = totalMealPen;
  timecard.totalTurnaroundPenalties = totalTurnaround;
  timecard.daysWorked = daysWorked;

  await timecard.save();

  const populated = await Timecard.findById(timecard._id)
    .populate('productionId', 'name code')
    .populate('dealMemoId', 'dealNumber')
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

  timecard.status = 'submitted';
  timecard.submittedAt = new Date();
  await timecard.save();

  res.json({ success: true, data: timecard });
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
      .populate('productionId', 'name code')
      .populate('dealMemoId', 'dealNumber personId')
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
    .populate('productionId', 'name code')
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
    .populate('productionId', 'name code')
    .populate('dealMemoId', 'dealNumber')
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
    .populate('productionId', 'name code')
    .populate('dealMemoId', 'dealNumber personId')
    .populate('ownerId', 'firstName lastName email')
    .sort({ submittedAt: -1 });

  res.json({ success: true, data: timecards });
});
