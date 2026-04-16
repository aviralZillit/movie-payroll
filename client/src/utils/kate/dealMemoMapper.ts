// ============================================================
// DEAL MEMO MAPPER
// Kate's wizard state → movie-payroll DealMemo API shape
//
// Kate's wizard stores data in a flat Zustand store with nested
// `rates: { dayRate, weeklyRate, hpMode, ... }`. Movie-payroll's
// DealMemo.js expects top-level fields like `dailyRate`, `weeklyRate`,
// `hourlyRate`, `hpMode`, etc.
//
// This mapper bridges the two without changing either schema.
// ============================================================

const HOURLY_DIVISORS: Record<string, number> = {
  'pact-mmp': 11,
  'pact-bectu': 10,
  'iatse-600': 8, 'iatse-728': 8, 'iatse-80': 8, 'iatse-695': 8,
  'teamsters-399': 8, 'dga': 8, 'sag-aftra': 8,
};

const OT_CAPS: Record<string, number> = {
  'pact-bectu': 70,
  'pact-mmp': 81.82,
};

const TURNAROUND_HRS: Record<string, number> = {
  uk: 11, us: 10, ie: 11, au: 10, ca: 10, de: 11,
};

const UNION_TO_KEY: Record<string, string> = {
  'pact-bectu': 'PACT-BECTU',
  'pact-mmp': 'PACT-BECTU-MMP',
  'iatse-600': 'IATSE-BASIC',
  'dga': 'DGA',
  'sag-aftra': 'SAG-THEATRICAL',
};

const DEAL_TYPE_MAP: Record<string, string> = {
  weekly: '55hr_week',
  fixed: 'flat_fee',
  dayplayer: 'daily',
  buyout: 'flat_fee',
  picture: 'per_film',
  boxrental: 'flat_fee',
};

function parsePenaltyRate(s: unknown): number {
  if (typeof s === 'number') return s;
  if (typeof s !== 'string') return 0;
  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  return isFinite(n) ? n : 0;
}

export function mapKateToMoviePayroll(ws: Record<string, any>, productionId?: string): Record<string, any> {
  const union = ws.union || 'pact-bectu';
  const territory = ws.territory || 'uk';
  const dept = ws.department || '';
  const divisor = HOURLY_DIVISORS[union] ?? 10;
  const dayRate = ws.rates?.dayRate ?? 0;
  const weeklyRate = ws.rates?.weeklyRate ?? dayRate * 5;
  const hourlyRate = dayRate / divisor;

  // Flatten allowances from Kate's 3 arrays → movie-payroll's v2 allowances[]
  const v2Allowances: any[] = [];
  for (const a of (ws.allowances || [])) {
    if (!a.active) continue;
    v2Allowances.push({
      key: a.id, name: a.name, amount: a.rate || 0,
      taxTreatment: 'non-taxable', nominalCode: a.nominal || '',
      isVisible: true,
      caps: { frequency: a.frequency === 'per-week' ? 'weekly' : 'daily' },
    });
  }
  for (const r of (ws.rentals || [])) {
    if (!r.active) continue;
    v2Allowances.push({
      key: r.id, name: r.name, amount: r.rate || 0,
      taxTreatment: 'non-taxable', nominalCode: r.nominal || '',
      isVisible: true,
      caps: { frequency: r.frequency === 'per-week' ? 'weekly' : 'daily' },
    });
  }

  // Nominal lines from Kate's nominalCodes map
  const nominalLines: any[] = [];
  if (ws.nominalCodes && typeof ws.nominalCodes === 'object') {
    for (const [el, nom] of Object.entries(ws.nominalCodes)) {
      nominalLines.push({
        lineKey: el.toLowerCase().replace(/\s+/g, '_'),
        label: el,
        description: nom as string,
        nominalCode: ((nom as string) || '').split(' ')[0] || '',
        isCore: el === 'Basic Labour',
      });
    }
  }

  return {
    productionId: productionId || ws.productionId || undefined,
    territory,
    unionKey: UNION_TO_KEY[union] || union.toUpperCase(),
    country: territory.toUpperCase(),
    currency: ws.rates?.currency || 'GBP',
    employmentStatus: ws.employmentStatusId || 'paye',
    role: ws.jobTitle || ws.customJobTitle || '',
    reportsTo: ws.reportsTo || '',
    screenCredit: ws.screenCredit || '',
    costCentre: ws.costCentre || ws.setCode || '',

    // Rates
    dailyRate: dayRate,
    weeklyRate,
    hourlyRate,
    payBasis: 'daily',
    rateBasis: 'daily',
    rateType: ws.dealType === 'buyout' ? 'buyout' : 'negotiated',
    hpMode: ws.rates?.hpMode || 'excl',
    holidayPayPct: territory === 'uk' || territory === 'ie' ? 0.1207 : 0,
    holidayPayInclusive: ws.rates?.hpMode === 'incl',

    // Deal structure
    dealType: DEAL_TYPE_MAP[ws.dealType] || ws.dealType || '55hr_week',
    startDate: ws.startDate || new Date().toISOString(),
    endDate: ws.endDate || undefined,
    prepDays: ws.schedPrepDays || 0,
    shootDays: ws.schedShootDays || 0,
    wrapDays: ws.schedWrapDays || 0,

    // OT (auto-derived from union — server hook will fill calculator fields)
    standardWorkDayHrs: divisor,
    lunchBreakHrs: 1,
    otRateCap: OT_CAPS[union] || undefined,
    otMultiplier: dept === 'cam' ? 2.0 : 1.5,
    isCameraDept: dept === 'cam',
    contractedHoursPerDayType: {
      SWD: divisor,
      CWD: divisor === 11 ? 10 : divisor,
      SCWD: divisor === 11 ? 10 : divisor,
      default: divisor,
    },

    // Day premiums
    sixthDayMultiplier: 1.5,
    seventhDayMultiplier: 2.0,
    nightPremiumEnabled: true,
    nightPremiumFlat: territory === 'uk' ? 20 : 0,
    nightPremiumPct: 0,

    // Meals + turnaround (from Kate's Step 5 penalties)
    mealPenaltyEnabled: !!ws.mealBreakPenalty,
    mealPenaltyRate: parsePenaltyRate(ws.mealBreakPenaltyRate),
    mealPenaltyAfterHrs: 6,
    mealPenaltyIncrementMin: 15,
    mealDeductible: !union.startsWith('iatse') && !union.startsWith('sag') && !union.startsWith('dga'),
    turnaroundMinHrs: TURNAROUND_HRS[territory] ?? 11,
    turnaroundPenaltyMultiplier: 1.5,
    btaEnabled: !!ws.turnaroundPenalty,
    btaRate: parsePenaltyRate(ws.turnaroundPenaltyRate),

    // Employer fringes (UK defaults)
    employerNiPct: 0.15,
    employerNiThresholdWeekly: 96.15,
    pensionPct: 0.03,

    // Allowances (v2)
    allowances: v2Allowances,
    // Also populate v1 fields for backward compat
    kitAllowance: v2Allowances.find(a => a.key === 'camera-rental')?.amount || 0,
    travelAllowance: v2Allowances.find(a => a.key === 'mileage')?.amount || 0,
    perDiemRate: v2Allowances.find(a => a.key === 'per-diem')?.amount || 0,
    phoneAllowance: v2Allowances.find(a => a.key === 'it-rental')?.amount || 0,
    carAllowance: v2Allowances.find(a => a.key === 'vehicle-rental')?.amount || 0,

    // Nominal coding
    nominalLines,
    taxCreditScheme: ws.hetvClassification ? 'HETVC' : 'NONE',

    // Payroll
    payrollBureau: ws.payrollBureau || '',
    payFrequency: ws.payFrequency || 'weekly',

    // Notes
    notes: ws.dealNotes || '',

    // Per-field required
    crewRequiredFields: ws.fieldRequired
      ? Object.entries(ws.fieldRequired)
          .filter(([, v]) => v)
          .map(([k]) => ({ fieldKey: k, label: k, isCompleted: false }))
      : [],

    // Schema version
    schemaVersion: 2,
    status: 'draft',
  };
}
