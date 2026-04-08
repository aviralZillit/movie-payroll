import { RateBibleEntry } from '../models/index.js';

/**
 * Verify a proposed rate against the Global Rates Bible.
 * Returns compliance status with source details.
 */
/**
 * Fuzzy match a grade name against a rate row grade.
 * Handles: "1st Assistant Director" matching "1st AD (Studio)"
 */
/**
 * Score how well a rate grade matches a search grade.
 * Returns 0 (no match) to 100 (exact match).
 * Uses scoring instead of boolean to pick the BEST match.
 */
// Grade aliases: maps designation names → rate bible grade names
const GRADE_ALIASES = {
  // Camera
  'director of photography': 'dop / cinematographer',
  '1st assistant camera (focus puller)': 'focus puller / 1st ac',
  '2nd assistant camera (clapper loader)': '2nd ac / clapper loader',
  'drone operator': 'camera operator',
  // ADs
  'floor runner': 'set runner',
  'crowd ad': '3rd ad',
  // Sound
  'sound trainee': 'sound assistant',
  // Lighting
  'best boy electric': 'best boy (electric)',
  'electrician (spark)': 'spark',
  'rigging electrician': 'rigger electrician',
  // Art
  'production designer': 'art director',
  'art department assistant': 'art department trainee',
  'draughtsperson': 'standby art director',
  'art department trainee': 'art dept trainee',
  // Costume
  'costume standby': 'stand-by costume',
  'costume maker / cutter': 'cutter / maker',
  'costume daily / dresser': 'crowd costume',
  // HMU
  'hair & makeup assistant': 'makeup artist',
  'hair & makeup trainee': 'hmu trainee',
  // Props
  'standby props': 'stand-by props',
  'props buyer': 'assistant property master',
  'chargehand props': 'chargehand dressing props',
  // Construction
  'hod plasterer': 'plasterer',
  // SFX
  'sfx assistant': 'sfx floor technician',
  // Set Crafts
  'standby rigger': 'drapes hand',
  'standby stagehand': 'drapes hand',
  // Graphics
  'graphics trainee': 'graphic assistant',
  // VFX
  'cg artist': '3d artist',
  // Runners
  'rushes runner': 'rushes / post runner',
  // Drivers
  'minibus driver': 'minibus / car driver',
  'hgv driver': 'hgv / artic driver',
  // Riggers
  'rigging supervisor': 'rigging gaffer',
  'rigging assistant': 'rigger electrician',
  // US Camera
  'still photographer': 'camera operator',
  // US Costume
  'key costumer': 'costume supervisor',
  'costumer': 'assistant costume designer',
  'costume coordinator': 'assistant costume designer',
  // US HMU
  'department head - makeup': 'makeup / hair designer',
  'department head - hair': 'makeup / hair designer',
  'key makeup artist': 'key makeup artist',
  'key hairstylist': 'key hair artist',
  'hairstylist': 'hair artist',
  'special makeup effects artist': 'prosthetics supervisor',
  // US Sound
  'sound utility': 'sound assistant',
  'video assist operator': 'playback operator',
  // US Props
  'props buyer': 'assistant property master',
  'props person': 'dressing props',
  // US Art
  'art department coordinator': 'art dept trainee',
  'model maker': 'props maker',
  // Production Office
  'script supervisor': 'production coordinator',
  'production office coordinator': 'production coordinator',
  'assistant production office coordinator': 'asst production coordinator',
  'first assistant accountant': '1st assistant accountant',
  'second assistant accountant': '2nd assistant accountant',
  'payroll accountant': '1st assistant accountant',
};

function gradeMatchScore(rateGrade, searchGrade) {
  if (!rateGrade || !searchGrade) return 0;
  const a = rateGrade.toLowerCase().trim();
  const b = searchGrade.toLowerCase().trim();

  // Exact match
  if (a === b) return 100;

  // Check aliases — if the search grade has a known alias, also check that
  const alias = GRADE_ALIASES[b];
  if (alias && a.includes(alias.toLowerCase())) return 95;
  if (alias && alias.toLowerCase().includes(a)) return 92;

  // Direct includes (one contains the other fully)
  if (a.includes(b)) return 90;
  if (b.includes(a)) return 85;

  // Expand abbreviations for comparison
  const ABBREVS = {
    'ad': 'assistant director', 'ac': 'assistant camera', 'dop': 'director of photography',
    'upm': 'unit production manager', 'hmu': 'hair make-up', 'sfx': 'special effects',
    'dit': 'digital imaging technician', 'hod': 'head of department',
    'best boy': 'best boy', 'vfx': 'visual effects', 'cg': 'computer graphics',
  };
  let aExpanded = a;
  let bExpanded = b;
  for (const [abbr, full] of Object.entries(ABBREVS)) {
    aExpanded = aExpanded.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
    bExpanded = bExpanded.replace(new RegExp(`\\b${abbr}\\b`, 'g'), full);
  }

  // After expansion, check includes again
  if (aExpanded.includes(bExpanded) || bExpanded.includes(aExpanded)) return 80;

  // Also check alias after expansion
  if (alias) {
    const aliasExpanded = alias.toLowerCase();
    if (aExpanded.includes(aliasExpanded) || aliasExpanded.includes(aExpanded)) return 78;
  }

  // Token-based scoring
  const aTokens = aExpanded.replace(/[()\/,\-&]/g, ' ').split(/\s+/).filter(t => t.length > 1);
  const bTokens = bExpanded.replace(/[()\/,\-&]/g, ' ').split(/\s+/).filter(t => t.length > 1);
  const matching = bTokens.filter(bt => aTokens.some(at => at === bt));
  const matchRatio = bTokens.length > 0 ? matching.length / bTokens.length : 0;

  // Allow single-token match if the token is highly specific (not a generic word)
  const GENERIC = new Set(['assistant', 'senior', 'junior', 'head', 'key', 'lead', 'trainee', 'department', 'the', 'and', 'of']);
  const specificMatching = matching.filter(m => !GENERIC.has(m));

  // If at least 1 specific token matches and ratio is decent
  if (specificMatching.length >= 1 && matchRatio >= 0.4) return Math.round(40 + matchRatio * 40);

  // Fallback: at least 2 tokens match with 50%+
  if (matching.length >= 2 && matchRatio >= 0.5) return Math.round(40 + matchRatio * 40);

  return 0;
}

// Boolean wrapper for backward compat
function gradeMatches(rateGrade, searchGrade) {
  return gradeMatchScore(rateGrade, searchGrade) >= 40;
}

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

    // Search across all entries — pick the BEST scoring match
    let bestMatch = null;
    let bestEntry = null;
    let bestScore = 0;
    for (const e of entries) {
      for (const r of e.rates) {
        if (!r.grade || r.isHeader) continue;
        const score = gradeMatchScore(r.grade, grade);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = r;
          bestEntry = e;
        }
      }
    }
    if (bestMatch && bestScore >= 40) {
      return buildResult(result, bestMatch, bestEntry, proposedWeeklyRate);
    }

    result.warning = `No verified minimum found for "${grade}" in ${territoryCode}`;
    return result;
  }

  result.agreementName = entry.agreementName;
  result.source = entry.sourceUrl;
  result.pdfUrl = entry.pdfUrl;

  // Find BEST matching rate row (by score, not first match)
  let bestRow = null;
  let bestRowScore = 0;
  for (const r of entry.rates) {
    if (!r.grade || r.isHeader) continue;
    const score = gradeMatchScore(r.grade, grade);
    const tierMatch = !budgetTier || !r.budgetTier || r.budgetTier.toLowerCase().includes(budgetTier?.toLowerCase());
    // Boost score if budget tier matches
    const adjustedScore = tierMatch ? score + 10 : score;
    if (adjustedScore > bestRowScore) {
      bestRowScore = adjustedScore;
      bestRow = r;
    }
  }

  if (!bestRow || bestRowScore < 40) {
    result.warning = `No rate row found for "${grade}" in ${entry.agreementName}`;
    return result;
  }

  const matchingRows = [bestRow];

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
