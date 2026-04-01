// Budget tiers for US film and TV production
// Sources: SAG-AFTRA Codified Basic Agreement budget tiers,
//          IATSE Basic Agreement, DGA Basic Agreement
export const usBudgetTiers = [
  // ─── THEATRICAL FEATURE FILM TIERS ────────────────
  {
    name: 'High Budget ($11M+)',
    code: 'US_HIGH_BUDGET',
    country: 'US',
    unionCode: null, // Applies to all US unions
    productionType: 'feature_film',
    currency: 'USD',
    minBudget: 11000000,
    maxBudget: null,
    description:
      'High budget theatrical features with budgets of $11,000,000 and above. Full SAG-AFTRA rates, IATSE Basic Agreement scale, DGA full rates.',
    sortOrder: 1,
  },
  {
    name: 'Level 4C ($8.5M-$11M)',
    code: 'US_LEVEL_4C',
    country: 'US',
    unionCode: null,
    productionType: 'feature_film',
    currency: 'USD',
    minBudget: 8500000,
    maxBudget: 11000000,
    description:
      'SAG-AFTRA Theatrical Level 4C. Modified low budget agreement with full scale day/weekly rates.',
    sortOrder: 2,
  },
  {
    name: 'Level 4B ($5.5M-$8.5M)',
    code: 'US_LEVEL_4B',
    country: 'US',
    unionCode: null,
    productionType: 'feature_film',
    currency: 'USD',
    minBudget: 5500000,
    maxBudget: 8500000,
    description:
      'SAG-AFTRA Theatrical Level 4B. Modified low budget with reduced pension/health contribution percentages.',
    sortOrder: 3,
  },
  {
    name: 'Level 4A ($3.75M-$5.5M)',
    code: 'US_LEVEL_4A',
    country: 'US',
    unionCode: null,
    productionType: 'feature_film',
    currency: 'USD',
    minBudget: 3750000,
    maxBudget: 5500000,
    description:
      'SAG-AFTRA Theatrical Level 4A. Modified low budget with reduced overtime provisions.',
    sortOrder: 4,
  },
  {
    name: 'Level 3 ($2.6M-$3.75M)',
    code: 'US_LEVEL_3',
    country: 'US',
    unionCode: null,
    productionType: 'feature_film',
    currency: 'USD',
    minBudget: 2600000,
    maxBudget: 3750000,
    description:
      'SAG-AFTRA Modified Low Budget. Reduced performer rates and flexible work rules.',
    sortOrder: 5,
  },
  {
    name: 'Level 2 ($1.1M-$2.6M)',
    code: 'US_LEVEL_2',
    country: 'US',
    unionCode: null,
    productionType: 'feature_film',
    currency: 'USD',
    minBudget: 1100000,
    maxBudget: 2600000,
    description:
      'SAG-AFTRA Low Budget Agreement. Significantly reduced day and weekly rates with simplified overtime.',
    sortOrder: 6,
  },
  {
    name: 'Level 1B ($500K-$1.1M)',
    code: 'US_LEVEL_1B',
    country: 'US',
    unionCode: null,
    productionType: 'feature_film',
    currency: 'USD',
    minBudget: 500000,
    maxBudget: 1100000,
    description:
      'SAG-AFTRA Ultra Low Budget Tier B. Further reduced minimums with deferred compensation permitted.',
    sortOrder: 7,
  },
  {
    name: 'Level 1A (Under $500K)',
    code: 'US_LEVEL_1A',
    country: 'US',
    unionCode: null,
    productionType: 'feature_film',
    currency: 'USD',
    minBudget: 0,
    maxBudget: 500000,
    description:
      'SAG-AFTRA Ultra Low Budget Tier A. Minimum day rate with no pension/health contribution. Deferred compensation allowed.',
    sortOrder: 8,
  },

  // ─── TV TIERS ─────────────────────────────────────
  {
    name: 'Network Prime (ABC/CBS/FOX/NBC)',
    code: 'US_TV_NETWORK',
    country: 'US',
    unionCode: null,
    productionType: 'tv_drama',
    currency: 'USD',
    minBudget: 3000000,
    maxBudget: null,
    description:
      'Network primetime television (ABC, CBS, FOX, NBC). Full SAG-AFTRA TV Agreement scale, DGA and IATSE full rates apply.',
    sortOrder: 9,
  },
  {
    name: 'Cable/Streaming High ($3M+/episode)',
    code: 'US_TV_CABLE_HIGH',
    country: 'US',
    unionCode: null,
    productionType: 'tv_drama',
    currency: 'USD',
    minBudget: 3000000,
    maxBudget: null,
    description:
      'High-budget cable and streaming series (e.g. HBO, Netflix, Apple TV+). Per-episode budgets of $3,000,000 and above. Full scale rates.',
    sortOrder: 10,
  },
  {
    name: 'Cable/Streaming Mid ($1.2M-$3M/episode)',
    code: 'US_TV_CABLE_MID',
    country: 'US',
    unionCode: null,
    productionType: 'tv_drama',
    currency: 'USD',
    minBudget: 1200000,
    maxBudget: 3000000,
    description:
      'Mid-budget cable and streaming series. Per-episode budgets of $1,200,000 to $3,000,000.',
    sortOrder: 11,
  },
  {
    name: 'Cable/Streaming Low ($550K-$1.2M/episode)',
    code: 'US_TV_CABLE_LOW',
    country: 'US',
    unionCode: null,
    productionType: 'tv_drama',
    currency: 'USD',
    minBudget: 550000,
    maxBudget: 1200000,
    description:
      'Low-budget cable and streaming series. Per-episode budgets of $550,000 to $1,200,000. Reduced scale rates.',
    sortOrder: 12,
  },
  {
    name: 'Pilot Episodes',
    code: 'US_TV_PILOT',
    country: 'US',
    unionCode: null,
    productionType: 'tv_drama',
    currency: 'USD',
    minBudget: 0,
    maxBudget: null,
    description:
      'Pilot episodes for network, cable, and streaming. DGA pilot premiums apply. SAG-AFTRA pilot rates (typically 150% of episodic rate).',
    sortOrder: 13,
  },

  // ─── COMMERCIAL ───────────────────────────────────
  {
    name: 'Commercial',
    code: 'US_COMMERCIAL',
    country: 'US',
    unionCode: null,
    productionType: 'commercial',
    currency: 'USD',
    minBudget: 0,
    maxBudget: null,
    description:
      'TV commercials, digital/new media commercials, industrial films, and corporate videos. SAG-AFTRA Commercials Contract rates with session fees and use cycles.',
    sortOrder: 14,
  },
];
