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

  // Get crew user info for name/initials
  const { User } = await import('../models/index.js');
  const crewUser = await User.findById(crewId).select('firstName lastName').lean();

  // Build week summaries with enhanced data
  const weeks = timecards.map((tc, i) => {
    const entries = tc.entries || [];
    const nightShoots = entries.filter(e => e.nightShoot).length;
    const btaCount = entries.filter(e => e.turnaroundViolation).length;
    const hasMealDelay = entries.some(e => (e.mealDelayMins || 0) > 0);
    const hasCamOT = (tc.wkFilmingOTPay || 0) > 0;
    const preCallOT = tc.wkPreCallOTPay || 0;
    const wrapOT = tc.wkWrapOTPay || 0;
    const filmOT = tc.wkFilmingOTPay || 0;

    return {
      weekNumber: i + 1,
      timecardId: tc._id,
      weekStarting: tc.weekStarting,
      weekEnding: tc.weekEnding,
      dateRange: tc.weekStarting
        ? `${new Date(tc.weekStarting).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${new Date(tc.weekEnding || tc.weekStarting).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : '',
      status: tc.status,
      daysWorked: tc.daysWorked || 0,
      dayTypes: entries.filter(e => e.callTime || e.isRestDay || e.isHoliday).map(e => e.dayType || 'SWD'),
      // Pay breakdown
      basicPay: tc.wkBasicPay || 0,
      preCallOT,
      wrapOT,
      filmOT,
      otPay: preCallOT + wrapOT + filmOT,
      btaPay: tc.wkBTAPay || 0,
      mealPenalty: tc.wkMealPenaltyPay || 0,
      nightPrem: tc.wkNightPremPay || 0,
      allowances: tc.wkAllowances || 0,
      gross: tc.wkGross || 0,
      holidayPay: dealMemo?.hpMode === 'excl'
        ? Math.round((tc.wkBasicPay || 0) * ((dealMemo?.holidayPayPct || 12.07) / 100) * 100) / 100
        : 0,
      // Flags
      nightShoots,
      btaCount,
      hasMealDelay,
      hasCamOT,
      // Pipeline dates
      pipeline: {
        submittedAt: tc.submittedAt || null,
        approvedAt: tc.deptApprovedAt || tc.approvedAt || null,
        payrollApprovedAt: tc.payrollApprovedAt || null,
        paidAt: tc.paidAt || null,
      },
    };
  });

  // Stats
  const paidStatuses = ['payroll_approved', 'paid'];
  const pendingStatuses = ['submitted', 'dept_approved', 'approved'];
  const totalPaid = weeks.filter(w => paidStatuses.includes(w.status)).reduce((s, w) => s + w.gross, 0);
  const totalSubmitted = weeks.filter(w => pendingStatuses.includes(w.status)).reduce((s, w) => s + w.gross, 0);
  const totalDraft = weeks.filter(w => w.status === 'draft').reduce((s, w) => s + w.gross, 0);
  const totalGross = weeks.reduce((s, w) => s + w.gross, 0);

  // Cumulative earnings breakdown
  const cumulative = {
    basic: weeks.reduce((s, w) => s + w.basicPay, 0),
    holidayPay: weeks.reduce((s, w) => s + w.holidayPay, 0),
    preCallOT: weeks.reduce((s, w) => s + w.preCallOT, 0),
    wrapOT: weeks.reduce((s, w) => s + w.wrapOT, 0),
    filmOT: weeks.reduce((s, w) => s + w.filmOT, 0),
    mealPenalty: weeks.reduce((s, w) => s + w.mealPenalty, 0),
    nightPrem: weeks.reduce((s, w) => s + w.nightPrem, 0),
    bta: weeks.reduce((s, w) => s + w.btaPay, 0),
    allowances: weeks.reduce((s, w) => s + w.allowances, 0),
    totalGross,
  };

  // Derive phases from production date range (simple month-based grouping)
  const prodStart = production.startDate ? new Date(production.startDate) : (timecards[0]?.weekStarting ? new Date(timecards[0].weekStarting) : new Date());
  const phases = [];
  if (weeks.length > 0) {
    // Group weeks into phases by production month blocks
    let currentPhase = null;
    weeks.forEach((w, i) => {
      const wsDate = new Date(w.weekStarting);
      const monthKey = `${wsDate.getFullYear()}-${String(wsDate.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = wsDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      if (!currentPhase || currentPhase.monthKey !== monthKey) {
        currentPhase = { id: monthKey, monthKey, label: monthLabel, weeks: [], wkRange: '' };
        phases.push(currentPhase);
      }
      currentPhase.weeks.push(w.weekNumber);
    });
    // Set week ranges and done/active status
    const now = new Date();
    phases.forEach(p => {
      p.wkRange = p.weeks.length === 1 ? `W${p.weeks[0]}` : `W${p.weeks[0]}–${p.weeks[p.weeks.length - 1]}`;
      const phaseWeeks = weeks.filter(w => p.weeks.includes(w.weekNumber));
      const allPaid = phaseWeeks.every(w => paidStatuses.includes(w.status));
      const hasCurrent = phaseWeeks.some(w => w.status === 'draft' && new Date(w.weekStarting) <= now && new Date(w.weekEnding) >= now);
      const hasActive = phaseWeeks.some(w => !['paid', 'payroll_approved'].includes(w.status) && w.daysWorked > 0);
      p.done = allPaid && phaseWeeks.length > 0;
      p.active = !p.done && (hasCurrent || hasActive);
    });
  }

  const crewName = crewUser ? `${crewUser.firstName} ${crewUser.lastName}` : '';
  const initials = crewUser ? `${(crewUser.firstName || '')[0] || ''}${(crewUser.lastName || '')[0] || ''}`.toUpperCase() : '';

  res.json({
    success: true,
    data: {
      crew: {
        id: crewId,
        name: crewName,
        initials,
        role: dealMemo?.designationId?.name || dealMemo?.screenCredit || '',
        department: dealMemo?.departmentId?.name || '',
        agreement: dealMemo?.unionId?.name || '',
        employmentType: dealMemo?.employmentStatus || '',
        dealType: dealMemo?.dealType || '',
        rateType: dealMemo?.rateType || '',
        weeklyRate: dealMemo?.weeklyRate || 0,
        dailyRate: dealMemo?.dailyRate || 0,
        hourlyRate: dealMemo?.hourlyRate || 0,
      },
      production: {
        id: production._id,
        name: production.name,
        company: production.productionCompany || '',
        country: production.country || 'UK',
        currency: production.currency || 'GBP',
      },
      weeks,
      stats: {
        weeksWorked: weeks.filter(w => w.daysWorked > 0).length,
        totalWeeks: weeks.length,
        shootDays: weeks.reduce((s, w) => s + w.daysWorked, 0),
        totalPaid,
        outstanding: totalSubmitted + totalDraft,
        paidPct: totalGross > 0 ? Math.round((totalPaid / totalGross) * 100) : 0,
      },
      cumulative,
      phases,
    },
  });
});
