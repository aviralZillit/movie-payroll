import { Production, DealMemo, Timecard, PayrollRun } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * GET /api/dashboard/overview
 * Returns aggregate stats: total productions, active deals, pending timecards, payroll stats
 */
export const getOverview = asyncHandler(async (req, res) => {
  const [
    totalProductions,
    activeProductions,
    totalDealMemos,
    activeDealMemos,
    draftTimecards,
    submittedTimecards,
    deptApprovedTimecards,
    payrollApprovedTimecards,
    totalPayrollRuns,
    paidPayrollRuns,
    payrollAggregates,
  ] = await Promise.all([
    Production.countDocuments(),
    Production.countDocuments({ status: { $in: ['pre_production', 'production', 'post_production'] } }),
    DealMemo.countDocuments(),
    DealMemo.countDocuments({ status: { $in: ['signed', 'active'] } }),
    Timecard.countDocuments({ status: 'draft' }),
    Timecard.countDocuments({ status: 'submitted' }),
    Timecard.countDocuments({ status: 'dept_approved' }),
    Timecard.countDocuments({ status: 'payroll_approved' }),
    PayrollRun.countDocuments(),
    PayrollRun.countDocuments({ status: 'paid' }),
    PayrollRun.aggregate([
      { $match: { status: { $in: ['approved', 'exported', 'paid'] } } },
      {
        $group: {
          _id: null,
          totalGross: { $sum: '$totalGross' },
          totalNet: { $sum: '$totalNet' },
          totalCost: { $sum: '$totalCost' },
          totalFringes: { $sum: '$totalFringes' },
          totalHeadcount: { $sum: '$headcount' },
        },
      },
    ]),
  ]);

  const payrollStats = payrollAggregates[0] || {
    totalGross: 0,
    totalNet: 0,
    totalCost: 0,
    totalFringes: 0,
    totalHeadcount: 0,
  };

  res.json({
    success: true,
    data: {
      productions: {
        total: totalProductions,
        active: activeProductions,
      },
      dealMemos: {
        total: totalDealMemos,
        active: activeDealMemos,
      },
      timecards: {
        draft: draftTimecards,
        submitted: submittedTimecards,
        deptApproved: deptApprovedTimecards,
        payrollApproved: payrollApprovedTimecards,
        pendingApproval: submittedTimecards + deptApprovedTimecards,
      },
      payroll: {
        totalRuns: totalPayrollRuns,
        paidRuns: paidPayrollRuns,
        totalGross: payrollStats.totalGross,
        totalNet: payrollStats.totalNet,
        totalCost: payrollStats.totalCost,
        totalFringes: payrollStats.totalFringes,
        totalHeadcount: payrollStats.totalHeadcount,
      },
    },
  });
});

/**
 * GET /api/dashboard/production/:productionId
 * Returns stats for a specific production
 */
export const getProductionDashboard = asyncHandler(async (req, res) => {
  const { productionId } = req.params;

  const production = await Production.findById(productionId)
    .populate('createdBy', 'firstName lastName email')
    .populate('members.userId', 'firstName lastName email role');

  if (!production) {
    throw new AppError('Production not found.', 404);
  }

  const [
    dealMemos,
    timecardStats,
    payrollRuns,
    dealStatusBreakdown,
  ] = await Promise.all([
    DealMemo.find({ productionId })
      .populate('personId', 'firstName lastName')
      .populate('departmentId', 'code name')
      .populate('designationId', 'code name')
      .select('dealNumber personId departmentId designationId status weeklyRate dailyRate'),
    Timecard.aggregate([
      { $match: { productionId: production._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalStraightHrs: { $sum: '$totalStraightHrs' },
          totalOtHrs: { $sum: { $add: ['$totalOt1x5Hrs', '$totalOt2xHrs'] } },
        },
      },
    ]),
    PayrollRun.find({ productionId })
      .select('runNumber weekStarting weekEnding status totalGross totalNet totalCost headcount')
      .sort({ weekStarting: -1 })
      .limit(10),
    DealMemo.aggregate([
      { $match: { productionId: production._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  // Convert timecard stats array to object
  const timecardsByStatus = {};
  for (const s of timecardStats) {
    timecardsByStatus[s._id] = {
      count: s.count,
      totalStraightHrs: s.totalStraightHrs,
      totalOtHrs: s.totalOtHrs,
    };
  }

  // Convert deal status breakdown to object
  const dealsByStatus = {};
  for (const d of dealStatusBreakdown) {
    dealsByStatus[d._id] = d.count;
  }

  res.json({
    success: true,
    data: {
      production,
      dealMemos: {
        items: dealMemos,
        total: dealMemos.length,
        byStatus: dealsByStatus,
      },
      timecards: {
        byStatus: timecardsByStatus,
      },
      payrollRuns,
    },
  });
});
