import { DealMemo, Timecard, Production, PayrollRun } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * GET /api/portal/:crewId/production/:productionId
 * Crew Pay History — all weeks for a crew member on a production.
 * Only accessible by the crew member themselves or admin.
 */
export const getCrewPayHistory = asyncHandler(async (req, res) => {
  const { crewId, productionId } = req.params;
  const userId = req.user._id.toString();
  const isAdmin = ['super_admin', 'payroll_admin', 'production_accountant'].includes(req.user.role);

  // Only the crew member or admin can view
  if (crewId !== userId && !isAdmin) {
    throw new AppError('You can only view your own pay history.', 403);
  }

  // Get production info
  const production = await Production.findById(productionId).lean();
  if (!production) throw new AppError('Production not found.', 404);

  // Get deal memo for this crew + production
  const dealMemo = await DealMemo.findOne({ productionId, personId: crewId })
    .populate('unionId', 'name code')
    .populate('departmentId', 'name')
    .populate('designationId', 'name')
    .lean();

  // Get all timecards for this crew + production, sorted by week
  const timecards = await Timecard.find({ productionId, ownerId: crewId })
    .sort({ weekStarting: 1 })
    .lean();

  // Build week summaries
  const weeks = timecards.map((tc, i) => ({
    weekNumber: i + 1,
    timecardId: tc._id,
    weekStarting: tc.weekStarting,
    weekEnding: tc.weekEnding,
    dateRange: tc.weekStarting ? `${new Date(tc.weekStarting).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${new Date(tc.weekEnding || tc.weekStarting).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : '',
    status: tc.status,
    daysWorked: tc.daysWorked || 0,
    dayTypes: (tc.entries || []).map(e => e.dayType || 'SWD'),
    basicPay: tc.wkBasicPay || 0,
    otPay: (tc.wkPreCallOTPay || 0) + (tc.wkFilmingOTPay || 0) + (tc.wkWrapOTPay || 0),
    btaPay: tc.wkBTAPay || 0,
    mealPenalty: tc.wkMealPenaltyPay || 0,
    nightPrem: tc.wkNightPremPay || 0,
    allowances: tc.wkAllowances || 0,
    gross: tc.wkGross || 0,
    holidayPay: dealMemo?.hpMode === 'excl' ? (tc.wkBasicPay || 0) * ((dealMemo?.holidayPayPct || 12.07) / 100) : 0,
  }));

  // Stats
  const totalPaid = weeks.filter(w => w.status === 'payroll_approved').reduce((s, w) => s + w.gross, 0);
  const totalSubmitted = weeks.filter(w => w.status === 'submitted' || w.status === 'dept_approved').reduce((s, w) => s + w.gross, 0);
  const totalDraft = weeks.filter(w => w.status === 'draft').reduce((s, w) => s + w.gross, 0);
  const totalGross = weeks.reduce((s, w) => s + w.gross, 0);

  res.json({
    success: true,
    data: {
      crew: {
        id: crewId,
        name: dealMemo?.personId?.fullName || '',
        role: dealMemo?.designationId?.name || dealMemo?.screenCredit || '',
        department: dealMemo?.departmentId?.name || '',
        agreement: dealMemo?.unionId?.name || '',
        employmentType: dealMemo?.employmentStatus || '',
        dailyRate: dealMemo?.dailyRate || 0,
        initials: '',
      },
      production: {
        name: production.name,
        company: production.productionCompany || '',
        bureau: 'Sargent-Disc',
        paySchedule: 'Weekly',
      },
      weeks,
      stats: {
        weeksWorked: weeks.filter(w => w.daysWorked > 0).length,
        shootDays: weeks.reduce((s, w) => s + w.daysWorked, 0),
        totalPaid,
        outstanding: totalSubmitted + totalDraft,
        approvedPending: totalSubmitted,
        submitted: totalDraft,
        paidPct: totalGross > 0 ? Math.round((totalPaid / totalGross) * 100) : 0,
      },
      phases: [], // TODO: integrate with production schedule
    },
  });
});
