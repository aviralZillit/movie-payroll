import { RateBibleEntry } from '../models/index.js';
import { verifyRate, searchRates } from '../services/rateVerificationService.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * GET /api/rates-bible
 * List all bible entries, optionally filtered by territory
 */
export const getAll = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.territory) filter.territoryCode = req.query.territory.toLowerCase();
  if (req.query.status) filter.status = req.query.status;

  const entries = await RateBibleEntry.find(filter)
    .select('-rates') // Don't send all rate rows in list view
    .sort({ territoryCode: 1, agreementName: 1 })
    .lean();

  res.json({ success: true, data: entries });
});

/**
 * GET /api/rates-bible/:agreementId
 * Get full detail for a specific agreement including all rates
 */
export const getByAgreementId = asyncHandler(async (req, res) => {
  const entry = await RateBibleEntry.findOne({
    agreementId: req.params.agreementId,
    isActive: true,
  }).lean();

  if (!entry) throw new AppError('Agreement not found in Rates Bible', 404);

  res.json({ success: true, data: entry });
});

/**
 * GET /api/rates-bible/territory/:code
 * Get all agreements for a territory with full rate data
 */
export const getByTerritory = asyncHandler(async (req, res) => {
  const entries = await RateBibleEntry.find({
    territoryCode: req.params.code.toLowerCase(),
    isActive: true,
  })
    .sort({ agreementName: 1 })
    .lean();

  res.json({ success: true, data: entries });
});

/**
 * POST /api/rates-bible/verify
 * Verify a proposed rate against the bible
 */
export const verify = asyncHandler(async (req, res) => {
  const { territoryCode, agreementId, grade, budgetTier, proposedWeeklyRate } = req.body;

  if (!proposedWeeklyRate) {
    throw new AppError('proposedWeeklyRate is required', 400);
  }

  const result = await verifyRate({
    territoryCode,
    agreementId,
    grade,
    budgetTier,
    proposedWeeklyRate: Number(proposedWeeklyRate),
  });

  res.json({ success: true, data: result });
});

/**
 * GET /api/rates-bible/search?q=...&territory=...&union=...
 * Search rates across all agreements
 */
export const search = asyncHandler(async (req, res) => {
  const { q, territory, union, budgetTier, limit } = req.query;

  const results = await searchRates({
    query: q,
    territoryCode: territory,
    union,
    budgetTier,
    limit: limit ? parseInt(limit) : 50,
  });

  res.json({ success: true, data: results, count: results.length });
});
