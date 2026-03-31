import {
  RateCard,
  Timecard,
  DealMemo,
  PayrollRun,
  Union,
  Department,
  Designation,
  BudgetTier,
} from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// ---------------------------------------------------------------------------
// CSV helper
// ---------------------------------------------------------------------------
function toCSV(headers, rows) {
  const escape = (val) => {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(row.map(escape).join(','));
  }
  return lines.join('\n');
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toISOString().split('T')[0];
}

function sendExport(res, filename, headers, rows, format) {
  if (format === 'json') {
    const data = rows.map((row) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });
    return res.json({ count: data.length, data });
  }

  const csv = toCSV(headers, rows);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(csv);
}

// ---------------------------------------------------------------------------
// Rate Cards Export
// ---------------------------------------------------------------------------
export const exportRateCards = asyncHandler(async (req, res) => {
  const { unionCode, deptCode, format = 'csv' } = req.query;

  const filter = { isActive: true };

  if (unionCode) {
    const union = await Union.findOne({ code: unionCode.toUpperCase() });
    if (!union) throw new AppError(`Union with code "${unionCode}" not found.`, 404);
    filter.unionId = union._id;
  }

  if (deptCode) {
    const dept = await Department.findOne({ code: deptCode.toUpperCase() });
    if (!dept) throw new AppError(`Department with code "${deptCode}" not found.`, 404);
    filter.departmentId = dept._id;
  }

  const rateCards = await RateCard.find(filter)
    .populate('unionId', 'name code')
    .populate('departmentId', 'name code')
    .populate('designationId', 'name code')
    .populate('budgetTierId', 'name code')
    .sort({ effectiveFrom: -1 })
    .lean();

  const headers = [
    'Union',
    'Department',
    'Designation',
    'Budget Tier',
    'Weekly Rate',
    'Daily Rate',
    'Hourly Rate',
    'OT 1.5x',
    'OT 2x',
    '6th Day Rate',
    '7th Day Rate',
    'Night Premium %',
    'Holiday Pay Inclusive',
    'Source Document',
    'Source URL',
    'Effective From',
  ];

  const rows = rateCards.map((rc) => [
    rc.unionId?.name ?? '',
    rc.departmentId?.name ?? '',
    rc.designationId?.name ?? '',
    rc.budgetTierId?.name ?? '',
    rc.weeklyRate,
    rc.dailyRate,
    rc.hourlyRate,
    rc.overtimeRate1x5 ?? '',
    rc.overtimeRate2x ?? '',
    rc.sixthDayRate ?? '',
    rc.seventhDayRate ?? '',
    rc.nightPremiumPct ?? '',
    rc.holidayPayInclusive ? 'Yes' : 'No',
    rc.sourceDocument ?? '',
    rc.sourceUrl ?? '',
    fmtDate(rc.effectiveFrom),
  ]);

  sendExport(res, 'rate-cards.csv', headers, rows, format);
});

// ---------------------------------------------------------------------------
// Timecards Export
// ---------------------------------------------------------------------------
export const exportTimecards = asyncHandler(async (req, res) => {
  const { productionId, weekStarting, status, format = 'csv' } = req.query;

  const filter = {};
  if (productionId) filter.productionId = productionId;
  if (weekStarting) filter.weekStarting = new Date(weekStarting);
  if (status) filter.status = status;

  const timecards = await Timecard.find(filter)
    .populate('productionId', 'name code')
    .populate('ownerId', 'firstName lastName email')
    .sort({ weekStarting: -1 })
    .lean();

  const headers = [
    'Timecard #',
    'Production',
    'Person',
    'Week Starting',
    'Week Ending',
    'Day',
    'Date',
    'Call Time',
    'Wrap Time',
    'Lunch Start',
    'Lunch End',
    'Total Hrs',
    'Straight Hrs',
    'OT 1.5x Hrs',
    'OT 2x Hrs',
    'Night Hrs',
    'Meal Penalties',
    'Turnaround Violation',
    'Is Travel Day',
    'Is 6th Day',
    'Is 7th Day',
    'Status',
  ];

  const rows = [];
  for (const tc of timecards) {
    const prodName = tc.productionId?.name ?? '';
    const personName = tc.ownerId
      ? `${tc.ownerId.firstName ?? ''} ${tc.ownerId.lastName ?? ''}`.trim()
      : '';

    for (const entry of tc.entries || []) {
      rows.push([
        tc.timecardNumber,
        prodName,
        personName,
        fmtDate(tc.weekStarting),
        fmtDate(tc.weekEnding),
        entry.dayOfWeek,
        fmtDate(entry.date),
        entry.callTime ?? '',
        entry.wrapTime ?? '',
        entry.lunchStart ?? '',
        entry.lunchEnd ?? '',
        entry.totalWorkedHrs ?? 0,
        entry.straightHrs ?? 0,
        entry.ot1x5Hrs ?? 0,
        entry.ot2xHrs ?? 0,
        entry.nightHrs ?? 0,
        entry.mealPenaltyCount ?? 0,
        entry.turnaroundViolation ? 'Yes' : 'No',
        entry.isTravelDay ? 'Yes' : 'No',
        entry.isSixthDay ? 'Yes' : 'No',
        entry.isSeventhDay ? 'Yes' : 'No',
        tc.status,
      ]);
    }
  }

  sendExport(res, 'timecards.csv', headers, rows, format);
});

// ---------------------------------------------------------------------------
// Deal Memos Export
// ---------------------------------------------------------------------------
export const exportDealMemos = asyncHandler(async (req, res) => {
  const { productionId, status, format = 'csv' } = req.query;

  const filter = {};
  if (productionId) filter.productionId = productionId;
  if (status) filter.status = status;

  const memos = await DealMemo.find(filter)
    .populate('productionId', 'name code')
    .populate('personId', 'firstName lastName email')
    .populate('unionId', 'name code')
    .populate('departmentId', 'name code')
    .populate('designationId', 'name code')
    .populate('budgetTierId', 'name code')
    .sort({ createdAt: -1 })
    .lean();

  const headers = [
    'Deal #',
    'Production',
    'Person',
    'Union',
    'Department',
    'Designation',
    'Budget Tier',
    'Status',
    'Start Date',
    'End Date',
    'Weekly Rate',
    'Daily Rate',
    'Hourly Rate',
    'OT 1.5x',
    'OT 2x',
    'Holiday Pay %',
    'Employer NI %',
    'Pension %',
    '6th Day Mult',
    '7th Day Mult',
    'Kit Allowance',
    'Travel Allowance',
    'Per Diem',
    'Phone Allowance',
    'Car Allowance',
  ];

  const rows = memos.map((dm) => [
    dm.dealNumber,
    dm.productionId?.name ?? '',
    dm.personId
      ? `${dm.personId.firstName ?? ''} ${dm.personId.lastName ?? ''}`.trim()
      : '',
    dm.unionId?.name ?? '',
    dm.departmentId?.name ?? '',
    dm.designationId?.name ?? '',
    dm.budgetTierId?.name ?? '',
    dm.status,
    fmtDate(dm.startDate),
    fmtDate(dm.endDate),
    dm.weeklyRate,
    dm.dailyRate,
    dm.hourlyRate,
    dm.otRate1x5 ?? '',
    dm.otRate2x ?? '',
    dm.holidayPayPct ?? '',
    dm.employerNiPct ?? '',
    dm.pensionPct ?? '',
    dm.sixthDayMultiplier ?? '',
    dm.seventhDayMultiplier ?? '',
    dm.kitAllowance ?? 0,
    dm.travelAllowance ?? 0,
    dm.perDiemRate ?? 0,
    dm.phoneAllowance ?? 0,
    dm.carAllowance ?? 0,
  ]);

  sendExport(res, 'deal-memos.csv', headers, rows, format);
});

// ---------------------------------------------------------------------------
// Payroll Export
// ---------------------------------------------------------------------------
export const exportPayroll = asyncHandler(async (req, res) => {
  const { runId } = req.params;
  const { format = 'csv' } = req.query;

  const run = await PayrollRun.findById(runId).lean();
  if (!run) throw new AppError('Payroll run not found.', 404);

  const headers = [
    'Person',
    'Union',
    'Department',
    'Designation',
    'Base Pay',
    'OT 1.5x Pay',
    'OT 2x Pay',
    'Meal Penalty Pay',
    'Turnaround Penalty Pay',
    '6th Day Premium',
    '7th Day Premium',
    'Night Premium',
    'Kit Allow.',
    'Travel Allow.',
    'Per Diem',
    'Phone Allow.',
    'Car Allow.',
    'Gross Pay',
    'Holiday Pay',
    'Employer NI',
    'Employer Pension',
    'Total Fringes',
    'Employee NI',
    'Income Tax',
    'Employee Pension',
    'Total Deductions',
    'Net Pay',
    'Total Cost',
  ];

  const rows = (run.items || []).map((item) => [
    item.personName ?? '',
    item.unionCode ?? '',
    item.departmentName ?? '',
    item.designationName ?? '',
    item.basePay ?? 0,
    item.overtime1x5Pay ?? 0,
    item.overtime2xPay ?? 0,
    item.mealPenaltyPay ?? 0,
    item.turnaroundPenaltyPay ?? 0,
    item.sixthDayPremium ?? 0,
    item.seventhDayPremium ?? 0,
    item.nightPremium ?? 0,
    item.kitAllowance ?? 0,
    item.travelAllowance ?? 0,
    item.perDiem ?? 0,
    item.phoneAllowance ?? 0,
    item.carAllowance ?? 0,
    item.grossPay ?? 0,
    item.holidayPay ?? 0,
    item.employerNi ?? 0,
    item.employerPension ?? 0,
    item.totalFringes ?? 0,
    item.employeeNi ?? 0,
    item.incomeTax ?? 0,
    item.employeePension ?? 0,
    item.totalDeductions ?? 0,
    item.netPay ?? 0,
    item.totalCost ?? 0,
  ]);

  sendExport(res, `payroll-run-${run.runNumber}.csv`, headers, rows, format);
});
