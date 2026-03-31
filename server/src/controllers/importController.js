import {
  RateCard,
  Timecard,
  DealMemo,
  Union,
  Department,
  Designation,
  BudgetTier,
} from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a unique timecard number: TC-YYYYMMDD-XXXXX */
function generateTimecardNumber() {
  const d = new Date();
  const datePart = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TC-${datePart}-${rand}`;
}

// ---------------------------------------------------------------------------
// Rate Cards Import
// ---------------------------------------------------------------------------
export const importRateCards = asyncHandler(async (req, res) => {
  const items = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Request body must be a non-empty array of rate card objects.', 400);
  }

  // Pre-load lookup maps for unions, departments, designations, budget tiers
  const unions = await Union.find().lean();
  const departments = await Department.find().lean();
  const designations = await Designation.find().lean();
  const budgetTiers = await BudgetTier.find().lean();

  const unionByCode = Object.fromEntries(unions.map((u) => [u.code, u]));
  const deptByCode = Object.fromEntries(departments.map((d) => [d.code, d]));
  const desigByCode = Object.fromEntries(designations.map((d) => [d.code, d]));
  const tierByCode = Object.fromEntries(budgetTiers.map((t) => [t.code, t]));

  let created = 0;
  let updated = 0;
  const errors = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      // Resolve references
      const union = unionByCode[item.unionCode?.toUpperCase()];
      if (!union) {
        errors.push({ index: i, message: `Union code "${item.unionCode}" not found.` });
        continue;
      }

      const dept = deptByCode[item.deptCode?.toUpperCase()];
      if (!dept) {
        errors.push({ index: i, message: `Department code "${item.deptCode}" not found.` });
        continue;
      }

      const desig = desigByCode[item.desigCode?.toUpperCase()];
      if (!desig) {
        errors.push({ index: i, message: `Designation code "${item.desigCode}" not found.` });
        continue;
      }

      const tier = tierByCode[item.tierCode?.toUpperCase()];
      if (!tier) {
        errors.push({ index: i, message: `Budget tier code "${item.tierCode}" not found.` });
        continue;
      }

      // Validate required numeric fields
      const numericFields = ['weeklyRate', 'dailyRate', 'hourlyRate'];
      let hasError = false;
      for (const field of numericFields) {
        if (typeof item[field] !== 'number' || item[field] <= 0) {
          errors.push({ index: i, message: `${field} must be a number greater than 0.` });
          hasError = true;
          break;
        }
      }
      if (hasError) continue;

      // Validate optional numeric fields if provided
      const optionalNumeric = [
        'overtimeRate1x5',
        'overtimeRate2x',
        'sixthDayRate',
        'seventhDayRate',
        'nightPremiumPct',
      ];
      for (const field of optionalNumeric) {
        if (item[field] != null && (typeof item[field] !== 'number' || item[field] <= 0)) {
          errors.push({ index: i, message: `${field} must be a number greater than 0 when provided.` });
          hasError = true;
          break;
        }
      }
      if (hasError) continue;

      if (!item.effectiveFrom) {
        errors.push({ index: i, message: 'effectiveFrom is required.' });
        continue;
      }

      const effectiveFrom = new Date(item.effectiveFrom);

      const upsertFilter = {
        unionId: union._id,
        departmentId: dept._id,
        designationId: desig._id,
        budgetTierId: tier._id,
        effectiveFrom,
      };

      const data = {
        weeklyRate: item.weeklyRate,
        dailyRate: item.dailyRate,
        hourlyRate: item.hourlyRate,
        overtimeRate1x5: item.overtimeRate1x5 ?? null,
        overtimeRate2x: item.overtimeRate2x ?? null,
        sixthDayRate: item.sixthDayRate ?? null,
        seventhDayRate: item.seventhDayRate ?? null,
        nightPremiumPct: item.nightPremiumPct ?? null,
        holidayPayInclusive: item.holidayPayInclusive ?? false,
        sourceUrl: item.sourceUrl ?? '',
        sourceDocument: item.sourceDocument ?? '',
        isActive: true,
        // Imported rates come from official sources, so mark as verified
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: req.user?._id || req.user?.id || null,
      };

      const result = await RateCard.findOneAndUpdate(
        upsertFilter,
        { $set: data },
        { upsert: true, new: true, rawResult: true }
      );

      if (result.lastErrorObject?.updatedExisting) {
        updated++;
      } else {
        created++;
      }
    } catch (err) {
      errors.push({ index: i, message: err.message });
    }
  }

  res.status(200).json({ created, updated, errors });
});

// ---------------------------------------------------------------------------
// Timecards Import
// ---------------------------------------------------------------------------
export const importTimecards = asyncHandler(async (req, res) => {
  const items = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Request body must be a non-empty array of timecard objects.', 400);
  }

  let created = 0;
  const errors = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      if (!item.dealMemoNumber) {
        errors.push({ index: i, message: 'dealMemoNumber is required.' });
        continue;
      }

      const dealMemo = await DealMemo.findOne({ dealNumber: item.dealMemoNumber })
        .populate('productionId')
        .lean();

      if (!dealMemo) {
        errors.push({ index: i, message: `Deal memo "${item.dealMemoNumber}" not found.` });
        continue;
      }

      if (!item.weekStarting) {
        errors.push({ index: i, message: 'weekStarting is required.' });
        continue;
      }

      if (!Array.isArray(item.entries) || item.entries.length === 0) {
        errors.push({ index: i, message: 'entries must be a non-empty array.' });
        continue;
      }

      const weekStarting = new Date(item.weekStarting);
      const weekEnding = new Date(weekStarting);
      weekEnding.setDate(weekEnding.getDate() + 6);

      const entries = item.entries.map((e) => {
        const entryDate = new Date(e.date);
        return {
          date: entryDate,
          dayOfWeek: entryDate.getDay(),
          callTime: e.callTime ?? null,
          wrapTime: e.wrapTime ?? null,
          lunchStart: e.lunchStart ?? null,
          lunchEnd: e.lunchEnd ?? null,
          isTravelDay: e.isTravelDay ?? false,
          isRestDay: e.isRestDay ?? false,
          isHoliday: e.isHoliday ?? false,
          notes: e.notes ?? '',
        };
      });

      const timecard = await Timecard.create({
        timecardNumber: generateTimecardNumber(),
        productionId: dealMemo.productionId._id || dealMemo.productionId,
        dealMemoId: dealMemo._id,
        ownerId: dealMemo.personId,
        weekStarting,
        weekEnding,
        status: 'draft',
        entries,
      });

      if (timecard) created++;
    } catch (err) {
      errors.push({ index: i, message: err.message });
    }
  }

  res.status(200).json({ created, errors });
});
