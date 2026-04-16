import { PayrollRun, Timecard, DealMemo } from '../models/index.js';
import { calculatePayrollItem } from '../services/payrollEngine.js';
import Decimal from 'decimal.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * Generate a unique payroll run number: PR-YYYY-NNNNN
 */
const generateRunNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `PR-${year}-`;

  const last = await PayrollRun.findOne({ runNumber: { $regex: `^${prefix}` } })
    .sort({ runNumber: -1 })
    .select('runNumber');

  let next = 1;
  if (last) {
    const parts = last.runNumber.split('-');
    next = parseInt(parts[2], 10) + 1;
  }

  return `${prefix}${String(next).padStart(5, '0')}`;
};

/**
 * POST /api/payroll
 * Create a payroll run
 */
export const createRun = asyncHandler(async (req, res) => {
  const { productionId, weekStarting, weekEnding, notes } = req.body;

  if (!productionId || !weekStarting || !weekEnding) {
    throw new AppError('productionId, weekStarting, and weekEnding are required.', 400);
  }

  const run = await PayrollRun.create({
    runNumber: await generateRunNumber(),
    productionId,
    weekStarting: new Date(weekStarting),
    weekEnding: new Date(weekEnding),
    processedById: req.user._id,
    notes,
  });

  const populated = await PayrollRun.findById(run._id)
    .populate('productionId', 'name code country currency')
    .populate('processedById', 'firstName lastName email');

  res.status(201).json({ success: true, data: populated });
});

/**
 * POST /api/payroll/:id/calculate
 * Process all payroll-approved timecards for this run's production & week
 */
export const calculateRun = asyncHandler(async (req, res) => {
  const run = await PayrollRun.findById(req.params.id);
  if (!run) throw new AppError('Payroll run not found.', 404);

  if (!['draft', 'calculated'].includes(run.status)) {
    throw new AppError(`Cannot recalculate a ${run.status} payroll run.`, 400);
  }

  run.status = 'calculating';
  await run.save();

  // Find all payroll-approved timecards for this production & week
  const timecards = await Timecard.find({
    productionId: run.productionId,
    weekStarting: run.weekStarting,
    status: 'payroll_approved',
  }).populate('ownerId', 'firstName lastName email');

  const items = [];
  const warnings = [];
  let totalGross = new Decimal(0);
  let totalFringes = new Decimal(0);
  let totalDeductions = new Decimal(0);
  let totalNet = new Decimal(0);
  let totalCost = new Decimal(0);

  for (const tc of timecards) {
    const dealMemo = await DealMemo.findById(tc.dealMemoId)
      .populate('unionId', 'code name')
      .populate('departmentId', 'code name')
      .populate('designationId', 'code name');

    if (!dealMemo) continue;

    // Compliance warning (informational only — does not block payroll)
    if (dealMemo?.complianceChecklist?.length > 0) {
      const requiredItems = dealMemo.complianceChecklist.filter(c => c.isRequired);
      const incompleteItems = requiredItems.filter(c => !c.isChecked);
      if (incompleteItems.length > 0) {
        warnings.push({
          person: `${tc.ownerId?.firstName} ${tc.ownerId?.lastName}`,
          timecardNumber: tc.timecardNumber,
          reason: 'Compliance incomplete',
          missing: incompleteItems.map(c => c.name),
        });
      }
    }

    const payItem = await calculatePayrollItem(tc, dealMemo);

    items.push({
      timecardId: tc._id,
      dealMemoId: dealMemo._id,
      personName: `${tc.ownerId.firstName} ${tc.ownerId.lastName}`,
      employmentType: dealMemo.employmentStatus || 'paye',
      unionCode: dealMemo.unionId?.code || '',
      departmentName: dealMemo.departmentId?.name || '',
      designationName: dealMemo.designationId?.name || '',
      // Timecard summary fields
      daysWorked: tc.daysWorked || 0,
      totalHours: (tc.totalStraightHrs || 0) + (tc.totalOt1x5Hrs || 0) + (tc.totalOt2xHrs || 0),
      otHours: (tc.totalOt1x5Hrs || 0) + (tc.totalOt2xHrs || 0),
      penalties: payItem.mealPenaltyPay + (payItem.turnaroundPenaltyPay || 0),
      basePay: payItem.basePay,
      overtime1x5Pay: payItem.overtime1x5Pay,
      overtime2xPay: payItem.overtime2xPay,
      mealPenaltyPay: payItem.mealPenaltyPay,
      turnaroundPenaltyPay: payItem.turnaroundPenaltyPay,
      sixthDayPremium: payItem.sixthDayPremium,
      seventhDayPremium: payItem.seventhDayPremium,
      nightPremium: payItem.nightPremium,
      kitAllowance: payItem.kitAllowance,
      travelAllowance: payItem.travelAllowance,
      perDiem: payItem.perDiem,
      phoneAllowance: payItem.phoneAllowance,
      computerAllowance: payItem.computerAllowance,
      carAllowance: payItem.carAllowance,
      otherEarnings: payItem.otherEarnings,
      grossPay: payItem.grossPay,
      holidayPay: payItem.holidayPay,
      employerNi: payItem.employerNi,
      employerPension: payItem.employerPension,
      apprenticeshipLevy: payItem.apprenticeshipLevy,
      totalFringes: payItem.totalFringes,
      employeeNi: payItem.employeeNi,
      incomeTax: payItem.incomeTax,
      employeePension: payItem.employeePension,
      studentLoan: payItem.studentLoan,
      otherDeductions: payItem.otherDeductions,
      totalDeductions: payItem.totalDeductions,
      netPay: payItem.netPay,
      totalCost: payItem.totalCost,
      // Calculation breakdown formulas for UI display
      breakdown: payItem.breakdown || {},
    });

    totalGross = totalGross.plus(payItem.grossPay);
    totalFringes = totalFringes.plus(payItem.totalFringes);
    totalDeductions = totalDeductions.plus(payItem.totalDeductions);
    totalNet = totalNet.plus(payItem.netPay);
    totalCost = totalCost.plus(payItem.totalCost);
  }

  run.items = items;
  run.headcount = items.length;
  run.totalGross = totalGross.toDecimalPlaces(2).toNumber();
  run.totalFringes = totalFringes.toDecimalPlaces(2).toNumber();
  run.totalDeductions = totalDeductions.toDecimalPlaces(2).toNumber();
  run.totalNet = totalNet.toDecimalPlaces(2).toNumber();
  run.totalCost = totalCost.toDecimalPlaces(2).toNumber();
  run.status = 'calculated';
  run.processedAt = new Date();

  await run.save();

  const populated = await PayrollRun.findById(run._id)
    .populate('productionId', 'name code country currency')
    .populate('processedById', 'firstName lastName email');

  res.json({ success: true, data: populated, warnings: warnings.length > 0 ? warnings : undefined });
});

/**
 * PATCH /api/payroll/:id/approve
 */
export const approveRun = asyncHandler(async (req, res) => {
  const run = await PayrollRun.findById(req.params.id);
  if (!run) throw new AppError('Payroll run not found.', 404);

  if (!['calculated', 'reviewed'].includes(run.status)) {
    throw new AppError(`Cannot approve a ${run.status} payroll run.`, 400);
  }

  run.status = 'approved';
  await run.save();

  res.json({ success: true, data: run });
});

/**
 * PATCH /api/payroll/:id/export
 */
export const exportRun = asyncHandler(async (req, res) => {
  const run = await PayrollRun.findById(req.params.id)
    .populate('productionId', 'name code country currency')
    .populate('processedById', 'firstName lastName email');

  if (!run) throw new AppError('Payroll run not found.', 404);

  if (run.status !== 'approved') {
    throw new AppError('Only approved payroll runs can be exported.', 400);
  }

  run.status = 'exported';
  run.exportedAt = new Date();
  await run.save();

  res.json({ success: true, data: run });
});

/**
 * PATCH /api/payroll/:id/mark-paid
 */
export const markPaid = asyncHandler(async (req, res) => {
  const run = await PayrollRun.findById(req.params.id);
  if (!run) throw new AppError('Payroll run not found.', 404);

  if (run.status !== 'exported') {
    throw new AppError('Only exported payroll runs can be marked as paid.', 400);
  }

  run.status = 'paid';
  run.paidAt = new Date();
  await run.save();

  res.json({ success: true, data: run });
});

/**
 * GET /api/payroll
 */
export const getAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.productionId) filter.productionId = req.query.productionId;
  if (req.query.status) filter.status = req.query.status;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [runs, total] = await Promise.all([
    PayrollRun.find(filter)
      .populate('productionId', 'name code country currency')
      .populate('processedById', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PayrollRun.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: runs,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/payroll/:id
 */
export const getById = asyncHandler(async (req, res) => {
  const run = await PayrollRun.findById(req.params.id)
    .populate('productionId', 'name code country currency')
    .populate('processedById', 'firstName lastName email')
    .populate('items.timecardId', 'timecardNumber weekStarting')
    .populate('items.dealMemoId', 'dealNumber');

  if (!run) throw new AppError('Payroll run not found.', 404);

  res.json({ success: true, data: run });
});

/**
 * GET /api/payroll/:id/payslip/:itemIndex
 * Get a specific payroll item (payslip) from a run
 */
export const getPayslip = asyncHandler(async (req, res) => {
  const run = await PayrollRun.findById(req.params.id)
    .populate('productionId', 'name code country currency')
    .populate('items.timecardId', 'timecardNumber weekStarting entries')
    .populate('items.dealMemoId', 'dealNumber personId weeklyRate dailyRate hourlyRate');

  if (!run) throw new AppError('Payroll run not found.', 404);

  const index = parseInt(req.params.itemIndex, 10);
  if (isNaN(index) || index < 0 || index >= run.items.length) {
    throw new AppError('Invalid payslip index.', 400);
  }

  const item = run.items[index];

  res.json({
    success: true,
    data: {
      payrollRun: {
        runNumber: run.runNumber,
        weekStarting: run.weekStarting,
        weekEnding: run.weekEnding,
        productionName: run.productionId?.name,
      },
      payslip: item,
    },
  });
});
