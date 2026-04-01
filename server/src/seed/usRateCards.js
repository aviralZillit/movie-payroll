// DGA Rate Cards — 2025-2026 rates from DGA Minimum Salary Schedule
//
// Source: https://www.dga.org/Contracts/Rates-2025-to-2026
// Document: DGA Minimum Salary Schedule 2025-2026
// Effective: July 1, 2025
//
// Theatrical (Feature Film) rates by budget tier
// TV rates by network/cable/streaming tier
// Commercial rates
//
// hourlyRate = weeklyRate / 60 (12hr day x 5 days) for theatrical weekly deals
// For per_episode deals: weeklyRate = programFee (compatibility), dailyRate = overageRate

const SRC_URL = 'https://www.dga.org/Contracts/Rates-2025-to-2026';
const SRC_DOC = 'DGA Minimum Salary Schedule 2025-2026';
const EFF = '2025-07-01';

export const usRateCards = [

  // ════════════════════════════════════════════════════════════════════════
  // HIGH BUDGET ($11M+) — US_HIGH_BUDGET
  // ════════════════════════════════════════════════════════════════════════

  // Director (Feature Film) — 50hr week deal
  {
    unionCode: 'DGA', deptCode: 'DIR', desigCode: 'DIR_FEAT', tierCode: 'US_HIGH_BUDGET',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 24599, dailyRate: 6150, hourlyRate: Math.round(24599 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // UPM (studio) — High Budget
  {
    unionCode: 'DGA', deptCode: 'UPM', desigCode: 'UPM', tierCode: 'US_HIGH_BUDGET',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 7021, dailyRate: 1755, hourlyRate: Math.round(7021 / 60 * 100) / 100,
    studioRate: 7021, locationRate: 9830,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // 1st AD — High Budget
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: '1AD', tierCode: 'US_HIGH_BUDGET',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 6676, dailyRate: 1669, hourlyRate: Math.round(6676 / 60 * 100) / 100,
    studioRate: 6676, locationRate: 9338,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // Key 2nd AD — High Budget
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: 'KEY_2AD', tierCode: 'US_HIGH_BUDGET',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 4473, dailyRate: 1118, hourlyRate: Math.round(4473 / 60 * 100) / 100,
    studioRate: 4473, locationRate: 6251,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // 2nd 2nd AD — High Budget
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: '2ND_2AD', tierCode: 'US_HIGH_BUDGET',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 4223, dailyRate: 1056, hourlyRate: Math.round(4223 / 60 * 100) / 100,
    studioRate: 4223, locationRate: 5905,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // Additional 2nd AD — High Budget
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: 'ADD_2AD', tierCode: 'US_HIGH_BUDGET',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 2571, dailyRate: 643, hourlyRate: Math.round(2571 / 60 * 100) / 100,
    studioRate: 2571, locationRate: 3606,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // ════════════════════════════════════════════════════════════════════════
  // LEVEL 4C ($8.5-11M) — US_LEVEL_4C
  // ════════════════════════════════════════════════════════════════════════

  // Director — Level 4C
  {
    unionCode: 'DGA', deptCode: 'DIR', desigCode: 'DIR_FEAT', tierCode: 'US_LEVEL_4C',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 22139, dailyRate: 5535, hourlyRate: Math.round(22139 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // ════════════════════════════════════════════════════════════════════════
  // LEVEL 4A ($3.75-5.5M) — US_LEVEL_4A
  // ════════════════════════════════════════════════════════════════════════

  // Director — Level 4A
  {
    unionCode: 'DGA', deptCode: 'DIR', desigCode: 'DIR_FEAT', tierCode: 'US_LEVEL_4A',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 18449, dailyRate: 4612, hourlyRate: Math.round(18449 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // UPM — Level 4A
  {
    unionCode: 'DGA', deptCode: 'UPM', desigCode: 'UPM', tierCode: 'US_LEVEL_4A',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 4915, dailyRate: Math.round(4915 / 5), hourlyRate: Math.round(4915 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // 1st AD — Level 4A
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: '1AD', tierCode: 'US_LEVEL_4A',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 4673, dailyRate: Math.round(4673 / 5), hourlyRate: Math.round(4673 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // Key 2nd AD — Level 4A
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: 'KEY_2AD', tierCode: 'US_LEVEL_4A',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 3131, dailyRate: Math.round(3131 / 5), hourlyRate: Math.round(3131 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // ════════════════════════════════════════════════════════════════════════
  // LEVEL 3 ($2.6-3.75M) — US_LEVEL_3
  // ════════════════════════════════════════════════════════════════════════

  // Director — Level 3 ($75,000 / 13 weeks)
  {
    unionCode: 'DGA', deptCode: 'DIR', desigCode: 'DIR_FEAT', tierCode: 'US_LEVEL_3',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 5769, dailyRate: Math.round(5769 / 5), hourlyRate: Math.round(5769 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
    notes: '$75,000 guaranteed over 13 weeks ($5,769/week)',
  },

  // UPM — Level 3
  {
    unionCode: 'DGA', deptCode: 'UPM', desigCode: 'UPM', tierCode: 'US_LEVEL_3',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 4213, dailyRate: Math.round(4213 / 5), hourlyRate: Math.round(4213 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // 1st AD — Level 3
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: '1AD', tierCode: 'US_LEVEL_3',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 4006, dailyRate: Math.round(4006 / 5), hourlyRate: Math.round(4006 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // Key 2nd AD — Level 3
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: 'KEY_2AD', tierCode: 'US_LEVEL_3',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 2684, dailyRate: Math.round(2684 / 5), hourlyRate: Math.round(2684 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // Additional 2nd AD — Level 3
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: 'ADD_2AD', tierCode: 'US_LEVEL_3',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 1543, dailyRate: Math.round(1543 / 5), hourlyRate: Math.round(1543 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // ════════════════════════════════════════════════════════════════════════
  // LEVEL 2 ($1.1-2.6M) — US_LEVEL_2
  // ════════════════════════════════════════════════════════════════════════

  // UPM — Level 2
  {
    unionCode: 'DGA', deptCode: 'UPM', desigCode: 'UPM', tierCode: 'US_LEVEL_2',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 3511, dailyRate: Math.round(3511 / 5), hourlyRate: Math.round(3511 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // 1st AD — Level 2
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: '1AD', tierCode: 'US_LEVEL_2',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 3338, dailyRate: Math.round(3338 / 5), hourlyRate: Math.round(3338 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // Key 2nd AD — Level 2
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: 'KEY_2AD', tierCode: 'US_LEVEL_2',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 2237, dailyRate: Math.round(2237 / 5), hourlyRate: Math.round(2237 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // Additional 2nd AD — Level 2
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: 'ADD_2AD', tierCode: 'US_LEVEL_2',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 1286, dailyRate: Math.round(1286 / 5), hourlyRate: Math.round(1286 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // ════════════════════════════════════════════════════════════════════════
  // LEVEL 1B ($500K-1.1M) — US_LEVEL_1B
  // ════════════════════════════════════════════════════════════════════════

  // UPM — Level 1B
  {
    unionCode: 'DGA', deptCode: 'UPM', desigCode: 'UPM', tierCode: 'US_LEVEL_1B',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 2317, dailyRate: Math.round(2317 / 5), hourlyRate: Math.round(2317 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // 1st AD — Level 1B
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: '1AD', tierCode: 'US_LEVEL_1B',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 2203, dailyRate: Math.round(2203 / 5), hourlyRate: Math.round(2203 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // Key 2nd AD — Level 1B
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: 'KEY_2AD', tierCode: 'US_LEVEL_1B',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 1476, dailyRate: Math.round(1476 / 5), hourlyRate: Math.round(1476 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // Additional 2nd AD — Level 1B
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: 'ADD_2AD', tierCode: 'US_LEVEL_1B',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 1007, dailyRate: Math.round(1007 / 5), hourlyRate: Math.round(1007 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // ════════════════════════════════════════════════════════════════════════
  // DGA TV DIRECTOR RATES (per-episode)
  // ════════════════════════════════════════════════════════════════════════

  // ── Network Prime (US_TV_NETWORK) ─────────────────────────────────────

  // Director TV 30min — Network
  {
    unionCode: 'DGA', deptCode: 'DIR', desigCode: 'DIR_TV30', tierCode: 'US_TV_NETWORK',
    dealType: 'per_episode', effectiveFrom: EFF,
    weeklyRate: 33784, dailyRate: 4826, hourlyRate: Math.round(33784 / 60 * 100) / 100,
    episodeLength: '30min', prepDays: 3, shootDays: 4, overageRate: 4826,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
    notes: 'Program fee $33,784 per episode; overage $4,826/day',
  },

  // Director TV 60min — Network
  {
    unionCode: 'DGA', deptCode: 'DIR', desigCode: 'DIR_TV60', tierCode: 'US_TV_NETWORK',
    dealType: 'per_episode', effectiveFrom: EFF,
    weeklyRate: 57374, dailyRate: 3825, hourlyRate: Math.round(57374 / 60 * 100) / 100,
    episodeLength: '60min', prepDays: 7, shootDays: 8, overageRate: 3825,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
    notes: 'Program fee $57,374 per episode; overage $3,825/day',
  },

  // Director TV 90min — Network
  {
    unionCode: 'DGA', deptCode: 'DIR', desigCode: 'DIR_TV90', tierCode: 'US_TV_NETWORK',
    dealType: 'per_episode', effectiveFrom: EFF,
    weeklyRate: 95627, dailyRate: 3825, hourlyRate: Math.round(95627 / 60 * 100) / 100,
    episodeLength: '90min', prepDays: 12, shootDays: 13, overageRate: 3825,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
    notes: 'Program fee $95,627 per episode; overage $3,825/day',
  },

  // Director TV 120min — Network
  {
    unionCode: 'DGA', deptCode: 'DIR', desigCode: 'DIR_TV120', tierCode: 'US_TV_NETWORK',
    dealType: 'per_episode', effectiveFrom: EFF,
    weeklyRate: 160645, dailyRate: 3825, hourlyRate: Math.round(160645 / 60 * 100) / 100,
    episodeLength: '120min', prepDays: 15, shootDays: 27, overageRate: 3825,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
    notes: 'Program fee $160,645 per episode; overage $3,825/day',
  },

  // ── Cable/Streaming High ($3M+) — US_TV_CABLE_HIGH ────────────────────

  // Director TV 30min — Cable/Streaming High
  {
    unionCode: 'DGA', deptCode: 'DIR', desigCode: 'DIR_TV30', tierCode: 'US_TV_CABLE_HIGH',
    dealType: 'per_episode', effectiveFrom: EFF,
    weeklyRate: 22352, dailyRate: Math.round(22352 / 7), hourlyRate: Math.round(22352 / 60 * 100) / 100,
    episodeLength: '30min',
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
    notes: 'Program fee $22,352 per episode',
  },

  // Director TV 60min — Cable/Streaming High
  {
    unionCode: 'DGA', deptCode: 'DIR', desigCode: 'DIR_TV60', tierCode: 'US_TV_CABLE_HIGH',
    dealType: 'per_episode', effectiveFrom: EFF,
    weeklyRate: 43399, dailyRate: Math.round(43399 / 15), hourlyRate: Math.round(43399 / 60 * 100) / 100,
    episodeLength: '60min',
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
    notes: 'Program fee $43,399 per episode',
  },

  // ── Pilot (US_TV_PILOT) ───────────────────────────────────────────────

  // Director Pilot 30min
  {
    unionCode: 'DGA', deptCode: 'DIR', desigCode: 'DIR_PILOT', tierCode: 'US_TV_PILOT',
    dealType: 'per_episode', effectiveFrom: EFF,
    weeklyRate: 95627, dailyRate: 6830, hourlyRate: Math.round(95627 / 60 * 100) / 100,
    episodeLength: 'pilot', prepDays: 14, overageRate: 6830,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
    notes: 'Pilot 30min program fee $95,627; overage $6,830/day',
  },

  // Director Pilot 60min
  {
    unionCode: 'DGA', deptCode: 'DIR', desigCode: 'DIR_PILOT', tierCode: 'US_TV_PILOT',
    dealType: 'per_film', effectiveFrom: EFF,
    weeklyRate: 127496, dailyRate: 5312, hourlyRate: Math.round(127496 / 60 * 100) / 100,
    episodeLength: 'pilot', prepDays: 24, overageRate: 5312,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
    notes: 'Pilot 60min program fee $127,496; overage $5,312/day',
  },

  // ════════════════════════════════════════════════════════════════════════
  // DGA COMMERCIAL RATES — US_COMMERCIAL
  // ════════════════════════════════════════════════════════════════════════

  // Director — Commercial
  {
    unionCode: 'DGA', deptCode: 'DIR', desigCode: 'DIR_COMM', tierCode: 'US_COMMERCIAL',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 7364, dailyRate: 1841, hourlyRate: Math.round(7364 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // UPM — Commercial
  {
    unionCode: 'DGA', deptCode: 'UPM', desigCode: 'UPM', tierCode: 'US_COMMERCIAL',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 4209, dailyRate: 1052, hourlyRate: Math.round(4209 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // 1st AD — Commercial
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: '1AD', tierCode: 'US_COMMERCIAL',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 5119, dailyRate: 1280, hourlyRate: Math.round(5119 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // Key 2nd AD — Commercial
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: 'KEY_2AD', tierCode: 'US_COMMERCIAL',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 2999, dailyRate: 750, hourlyRate: Math.round(2999 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // 2nd 2nd AD — Commercial
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: '2ND_2AD', tierCode: 'US_COMMERCIAL',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 2550, dailyRate: 637, hourlyRate: Math.round(2550 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },

  // Additional 2nd AD — Commercial
  {
    unionCode: 'DGA', deptCode: 'AD', desigCode: 'ADD_2AD', tierCode: 'US_COMMERCIAL',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: EFF,
    weeklyRate: 2100, dailyRate: 525, hourlyRate: Math.round(2100 / 60 * 100) / 100,
    holidayPayInclusive: false, isVerified: true,
    sourceUrl: SRC_URL, sourceDocument: SRC_DOC,
  },
];
