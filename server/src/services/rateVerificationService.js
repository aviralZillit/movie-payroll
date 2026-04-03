import { RateBibleEntry } from '../models/index.js';

/**
 * Verify a proposed rate against the Global Rates Bible.
 * Returns compliance status with source details.
 */
export async function verifyRate({ territoryCode, agreementId, grade, budgetTier, proposedWeeklyRate }) {
  const result = {
    isCompliant: true,
    minimum: null,
    proposed: proposedWeeklyRate,
    difference: 0,
    percentAboveMinimum: null,
    source: null,
    pdfUrl: null,
    warning: null,
    isIndividuallyNegotiated: false,
    agreementName: null,
  };

  // Find matching bible entry
  const entry = await RateBibleEntry.findOne({
    agreementId,
    isActive: true,
    status: 'confirmed',
  }).lean();

  if (!entry) {
    // Try by territory + grade search
    const entries = await RateBibleEntry.find({
      territoryCode: territoryCode?.toLowerCase(),
      isActive: true,
      status: 'confirmed',
    }).lean();

    if (entries.length === 0) {
      result.warning = 'No verified rate data found for this territory';
      return result;
    }

    // Search across all entries for the grade
    for (const e of entries) {
      const match = e.rates.find(
        (r) => r.grade && !r.isHeader && r.grade.toLowerCase().includes(grade?.toLowerCase())
      );
      if (match) {
        return buildResult(result, match, e, proposedWeeklyRate);
      }
    }

    result.warning = `No verified minimum found for "${grade}" in ${territoryCode}`;
    return result;
  }

  result.agreementName = entry.agreementName;
  result.source = entry.sourceUrl;
  result.pdfUrl = entry.pdfUrl;

  // Find matching rate row
  const matchingRows = entry.rates.filter(
    (r) => r.grade && !r.isHeader &&
    r.grade.toLowerCase().includes(grade?.toLowerCase()) &&
    (!budgetTier || !r.budgetTier || r.budgetTier.toLowerCase().includes(budgetTier?.toLowerCase()))
  );

  if (matchingRows.length === 0) {
    // Try broader search without budget tier
    const broadMatch = entry.rates.find(
      (r) => r.grade && !r.isHeader && r.grade.toLowerCase().includes(grade?.toLowerCase())
    );
    if (broadMatch) {
      return buildResult(result, broadMatch, entry, proposedWeeklyRate);
    }
    result.warning = `No rate row found for "${grade}" in ${entry.agreementName}`;
    return result;
  }

  const bestMatch = matchingRows[0];
  return buildResult(result, bestMatch, entry, proposedWeeklyRate);
}

function buildResult(result, rateRow, entry, proposedWeeklyRate) {
  result.agreementName = entry.agreementName;
  result.source = entry.sourceUrl;
  result.pdfUrl = entry.pdfUrl;

  if (rateRow.isIndividuallyNegotiated) {
    result.isIndividuallyNegotiated = true;
    result.warning = 'Individually Negotiated — no minimum rate applies';
    return result;
  }

  if (rateRow.isOwnNegotiation) {
    result.warning = 'Own Negotiation — rate is market-driven';
    return result;
  }

  const minimum = rateRow.weeklyRate || rateRow.dailyRate * 5 || 0;
  if (minimum === 0) {
    result.warning = 'Minimum rate not available in numeric format';
    return result;
  }

  result.minimum = minimum;
  result.difference = proposedWeeklyRate - minimum;
  result.isCompliant = proposedWeeklyRate >= minimum;
  result.percentAboveMinimum = minimum > 0 ? Math.round(((proposedWeeklyRate - minimum) / minimum) * 100) : null;

  if (!result.isCompliant) {
    result.warning = `Rate is ${Math.abs(result.difference).toFixed(2)} below the union minimum of ${minimum.toFixed(2)}/wk`;
  }

  return result;
}

/**
 * Verify all rates in a deal memo against the bible.
 */
export async function verifyDealMemoRates(dealMemo) {
  const checks = [];

  // Check base rate
  if (dealMemo.weeklyRate) {
    const baseCheck = await verifyRate({
      territoryCode: dealMemo.territory || dealMemo.country,
      agreementId: null, // Will search by territory
      grade: dealMemo.designationId?.name || '',
      budgetTier: dealMemo.budgetTierId?.name || '',
      proposedWeeklyRate: dealMemo.weeklyRate,
    });
    checks.push({ field: 'weeklyRate', ...baseCheck });
  }

  return checks;
}

/**
 * Search rates across all territories and agreements.
 */
export async function searchRates({ query, territoryCode, union, budgetTier, limit = 50 }) {
  const filter = { isActive: true, status: 'confirmed' };
  if (territoryCode) filter.territoryCode = territoryCode.toLowerCase();

  const entries = await RateBibleEntry.find(filter).lean();
  const results = [];

  for (const entry of entries) {
    if (union && !entry.union?.toLowerCase().includes(union.toLowerCase())) continue;

    for (const rate of entry.rates) {
      if (rate.isHeader) continue;
      if (!rate.grade) continue;

      const matchesQuery = !query || rate.grade.toLowerCase().includes(query.toLowerCase()) ||
        rate.primaryRate?.toLowerCase().includes(query.toLowerCase());
      const matchesTier = !budgetTier || !rate.budgetTier ||
        rate.budgetTier.toLowerCase().includes(budgetTier.toLowerCase());

      if (matchesQuery && matchesTier) {
        results.push({
          territory: entry.territoryCode,
          agreement: entry.agreementName,
          agreementId: entry.agreementId,
          grade: rate.grade,
          primaryRate: rate.primaryRate,
          secondaryRate: rate.secondaryRate,
          weeklyRate: rate.weeklyRate,
          dailyRate: rate.dailyRate,
          budgetTier: rate.budgetTier,
          isIndividuallyNegotiated: rate.isIndividuallyNegotiated,
          source: entry.sourceUrl,
          pdfUrl: entry.pdfUrl,
          holidayPayNote: entry.holidayPayNote,
        });
      }

      if (results.length >= limit) break;
    }
    if (results.length >= limit) break;
  }

  return results;
}
