// ============================================================
// Distant Location & Idle Day Rules
// Extracted from Zillit Deal Memo v21 HTML prototype
// ============================================================

export interface DistantLocationRule {
  thresholdMiles: number;
  thresholdLabel: string;
  travelOptions?: string[];
  defTravelOption?: string;
  perDiemNote?: string;
  perDiemRate: number;
  perDiemCurr: string;
  highCostPerDiem?: number;
  highCostCities?: string;
  hotel?: string;
  turnaround?: string;
  guarantee?: string;
  travelPay?: string;
  restDays?: string;
  showIdleDays: boolean;
  note: string;
}

export interface IdleDayRule {
  applicable: boolean;
  rate?: string;
  max?: number;
  fringes?: 'benefits-only' | 'full' | 'none';
  note: string;
}

/** Unions that show the distant location / work-location card */
export const UNIONS_WITH_DISTANT_LOCATION: string[] = [
  'pact-bectu', 'pact-mmp',
  'dga', 'iatse-600', 'iatse-728', 'iatse-80', 'iatse-695',
  'sag-aftra', 'teamsters-399',
  'siptu', 'meaa', 'iatse-ca', 'actra',
  'spiac-cgt', 'f3c-cfdt',
  'nu-uk', 'nu-us', 'nu-au', 'nu-ie', 'nu-ca', 'nu-de', 'nu-es', 'nu-it', 'nu-fr', 'nu-nz', 'nu-za', 'nu-hu',
];

/** Unions that do NOT show the distant location card */
export const UNIONS_WITHOUT_DISTANT_LOCATION: string[] = [
  'wggb', 'wga-west', 'pact-equity', 'bectu-anim',
];

export const DISTANT_LOCATION_RULES: Record<string, DistantLocationRule> = {
  uk: {
    thresholdMiles: 50,
    thresholdLabel: 'Over 50 road miles from Production Base (Resident Location \u2014 Clause 8.1)',
    travelOptions: ['30 Mile Radius (Clause 8.3a)', 'Within M25 (Clause 8.3b \u2014 Production Base within M25 only)'],
    defTravelOption: '30 Mile Radius (Clause 8.3a)',
    perDiemNote: 'Reasonable out-of-pocket expenses agreed and referenced in Deal Memo (Clause 8.11)',
    perDiemRate: 35,
    perDiemCurr: 'GBP',
    hotel: 'Production provides or agrees accommodation for Resident Location working',
    turnaround: '11 hours \u2014 same as local; distance does not extend turnaround requirement',
    travelPay: 'Travel beyond selected zone: Overtime Rate in 15-min increments. Production responsible for costs beyond 25 road miles (30-mile option).',
    restDays: 'Worker choosing to return home on rest day: travel not paid (Clause 8.6). Production-requested travel on rest day: agree separate compensation.',
    showIdleDays: false,
    note: 'PACT/BECTU Scripted TV 2023 Clause 8: travel zone must be elected on the Deal Memo \u2014 this is mandatory. Overseas locations: base of operations deemed Production Base; 30-mile option applies (Clause 8.8).',
  },

  us: {
    thresholdMiles: 30,
    thresholdLabel: 'Outside 30-mile Studio Zone \u2014 Distant Location (IATSE Basic Agreement)',
    travelOptions: ['Studio Zone (within 30 miles of studio center)', 'Distant Location (outside 30-mile zone)'],
    defTravelOption: 'Studio Zone (within 30 miles of studio center)',
    perDiemNote: 'EP Paymaster 2025-26 (IATSE/SAG): $75/day from 12/10/2025 \u2014 Breakfast $16 + Lunch $22 + Dinner $37. Prior rate (12/10/2023\u201312/09/2025): $70/day.',
    perDiemRate: 75,
    perDiemCurr: 'USD',
    highCostPerDiem: 135,
    highCostCities: 'NYC, Los Angeles (non-studio zone), San Francisco, Chicago, Boston, Washington DC, Seattle',
    hotel: 'Production provides hotel accommodation at Distant Location (contractual)',
    turnaround: '10 hours Distant Location (vs 9 hours Studio Zone) \u2014 IATSE Basic Agreement',
    guarantee: 'Distant minimum call: 10 hours. Studio minimum call: 8 hours.',
    travelPay: 'Travel days: flat daily rate, regardless of day type. Mileage from zone edge: current IRS rate. IATSE: travel subject to PH&W contributions, min 4 hrs max 8 hrs.',
    restDays: 'Rest days at Distant Location: not paid unless worked (pre-approval required).',
    showIdleDays: true,
    note: 'IATSE Basic Agreement: Distant Location defined as outside applicable Studio Zone. On-Call weekly employees: 6-day Distant workweek. 6th day: straight time. 7th day worked: 2x. Idle days: 4 hrs scale rate, max 2/workweek, benefits apply. Per diem: $75/day from 12/10/2025 (EP Paymaster 2025-26).',
  },

  ie: {
    thresholdMiles: 50,
    thresholdLabel: 'Over 50km from Production Base requiring overnight accommodation',
    perDiemNote: 'Revenue overnight subsistence 2024: EUR 167/night. Day rate for 10+ hours from base: EUR 33.61.',
    perDiemRate: 167,
    perDiemCurr: 'EUR',
    hotel: 'Production provides accommodation or reimburses actuals at Revenue-approved rates',
    turnaround: '11 hours \u2014 same as local',
    showIdleDays: false,
    note: 'Irish overnight subsistence rates set by Revenue Commissioners. Amounts above approved rates are taxable benefits.',
  },

  fr: {
    thresholdMiles: 0,
    thresholdLabel: 'Any location requiring overnight accommodation (Grand Deplacement)',
    perDiemNote: 'IDCC 2412 grand deplacement indemnity \u2014 rates vary by city and accommodation type',
    perDiemRate: 80,
    perDiemCurr: 'EUR',
    hotel: 'Production provides accommodation per agreed terms under applicable CBA',
    turnaround: 'Same as local \u2014 repos compensateur for worked rest days',
    showIdleDays: false,
    note: 'Grand deplacement governed by IDCC 2412 and applicable collective agreement. Repos compensateur (compensatory rest) applies for worked rest days.',
  },

  au: {
    thresholdMiles: 0,
    thresholdLabel: 'Location requiring overnight accommodation \u2014 LAFHA or travel allowance',
    perDiemNote: 'LAFHA (Living Away From Home Allowance) or ATO-approved travel allowance. ATO reasonable amounts 2024/25: varies by city.',
    perDiemRate: 120,
    perDiemCurr: 'AUD',
    hotel: 'Production provides accommodation or LAFHA paid (must be genuine additional expense)',
    turnaround: '10 hours \u2014 same as local',
    showIdleDays: false,
    note: 'LAFHA has specific ATO tax treatment \u2014 genuine additional expenses must be documented. WorkSafe obligations apply at all locations.',
  },

  default: {
    thresholdMiles: 0,
    thresholdLabel: 'Distant location threshold \u2014 verify locally',
    perDiemRate: 0,
    perDiemCurr: 'USD',
    showIdleDays: false,
    note: 'Distant location allowances, idle day provisions, and travel pay rules vary by territory. Confirm with local employment counsel.',
  },
};

export const IDLE_DAY_RULES: Record<string, IdleDayRule> = {
  'iatse-600': {
    applicable: true,
    rate: '4 hours at scale hourly rate per idle day (Distant Hire)',
    max: 2,
    fringes: 'benefits-only',
    note: 'Distant Hires: 4 hrs at scale hourly rate per idle day + benefit plan contributions. Max 2 idle days per workweek. 6th/7th day idle (on-call): 1/12 of distant weekly rate + pension. Source: EP Paymaster 2025-26, IATSE Basic Agreement.',
  },
  'iatse-728': {
    applicable: true,
    rate: '4 hours at scale hourly rate per idle day',
    max: 2,
    fringes: 'benefits-only',
    note: 'Same idle day structure as IATSE Basic Agreement. 4 hrs scale rate + benefits per idle day. Max 2 idle days per workweek. Source: EP Paymaster 2025-26.',
  },
  'iatse-80': {
    applicable: true,
    rate: '4 hours at scale hourly rate per idle day',
    max: 2,
    fringes: 'benefits-only',
    note: 'Same idle day structure as IATSE Basic Agreement. 4 hrs scale rate + benefits per idle day. Max 2 idle days per workweek. Source: EP Paymaster 2025-26.',
  },
  'iatse-695': {
    applicable: true,
    rate: '4 hours at scale hourly rate per idle day',
    max: 2,
    fringes: 'benefits-only',
    note: 'Same idle day structure as IATSE Basic Agreement. 4 hrs scale rate + benefits per idle day. Max 2 idle days per workweek. Source: EP Paymaster 2025-26.',
  },
  dga: {
    applicable: true,
    rate: '7th day idle: Weekly total = 7/5 of weekly salary. 6th day idle: standard distant rate.',
    max: 2,
    fringes: 'full',
    note: 'DGA 7th Day Idle (Distant): weekly compensation becomes 7/5 of weekly salary. DGA $24/day Distant Location Allowance applies on top of per diem. UPM/1st AD: production fee portion also applies on idle days. Source: EP Paymaster 2025-26.',
  },
  'sag-aftra': {
    applicable: true,
    rate: 'Pre-employment idle: $100/day (no fringe, max 2 days). During employment: no specific idle rate \u2014 rest day provisions apply.',
    max: 2,
    fringes: 'none',
    note: 'SAG-AFTRA: pre-employment idle allowance $100/day, no fringe, up to 2 days before employment commences. During employment, unworked days at Distant Location are rest days \u2014 not idle day payments. Source: EP Paymaster 2025-26, SAG-AFTRA TV Agreement.',
  },
  'teamsters-399': {
    applicable: true,
    rate: 'Per Teamsters Local 399 agreement \u2014 verify with payroll company',
    max: 2,
    fringes: 'benefits-only',
    note: 'Teamsters 399 distant location provisions mirror IATSE structure in most productions. Idle day rate: 4 hrs scale. Verify current Local 399 agreement with payroll company.',
  },
  'pact-bectu': {
    applicable: false,
    note: 'No formal "idle day" structure in PACT/BECTU Scripted TV Agreement. Rest days at Resident Location are simply rest days \u2014 not paid unless the worker is asked to travel for production purposes (Clause 8.6).',
  },
  'pact-mmp': {
    applicable: false,
    note: 'MMP 2021: rest days at Resident or Overseas Location are not paid unless worked (pre-approval required). Section 6.2(j). No IATSE-style idle day payment.',
  },
  default: {
    applicable: false,
    note: 'No specific idle day provisions identified for this union and territory. Confirm with local counsel whether hold day / idle day payments apply under the applicable agreement.',
  },
};
