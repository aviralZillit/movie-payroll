// ============================================================
// ZILLIT CODA — DEAL MEMO WIZARD
// Rate & HP Calculation Utilities
// ============================================================

import type { TerritoryCode, UnionId, HPMode, DealType } from '../types/dealMemo';

// ── TERRITORY HP RATES ────────────────────────────────────────

interface TerritoryHPRate {
  pct: number;           // HP percentage (e.g. 12.07 for UK)
  label: string;
  rolledUpWarning?: boolean;
  note: string;
}

export const TERRITORY_HP_RATES: Record<TerritoryCode, TerritoryHPRate> = {
  uk:    { pct: 12.07, label: '12.07%', note: 'UK Working Time Regulations 1998. 5.6 weeks/year = 12.07%. Cannot be rolled up for workers on regular ongoing engagements (Harpur Trust v Brazel [2022] UKSC 21).' },
  ie:    { pct: 8.0,   label: '8%',     note: 'Ireland OWT Act 1997. Minimum 20 days/year = 8% of gross earnings.' },
  au:    { pct: 17.5,  label: '17.5%',  note: 'Australia: 4 weeks annual leave + 17.5% loading on payout. For casual workers: 8% rolled-up on each payment.' },
  ca:    { pct: 6.0,   label: '6%+',    note: 'Canada: varies by province (4-6% of gross earnings). Provincial employment standards govern.' },
  nz:    { pct: 8.0,   label: '8%',     note: 'New Zealand: 4 weeks annual leave = 8% of gross earnings for casual workers (rolled-up).' },
  us:    { pct: 0,     label: 'N/A',    note: 'No statutory holiday pay in the United States. Vacation at employer discretion. Union agreements may include vacation pay (e.g. IATSE 8% vacation pay).' },
  fr:    { pct: 10.0,  label: '10%',    rolledUpWarning: true, note: 'France ICP (Indemnité de Congés Payés): 10% of gross remuneration for CDDU/intermittent workers. Mandatory separate payment — NOT rolled into the cachet rate.' },
  de:    { pct: 9.6,   label: '~9.6%',  rolledUpWarning: true, note: 'Germany BUrlG: minimum 24 Werktage annual leave. Rolling-up into rate is ILLEGAL. Must accrue and pay separately. Approx. 9.6% of annual gross.' },
  es:    { pct: 0,     label: 'Accrual', rolledUpWarning: true, note: 'Spain: 30 calendar days annual leave. Cannot be monetised during employment. Paid on termination or on leave taken.' },
  it:    { pct: 0,     label: 'Accrual', rolledUpWarning: true, note: 'Italy: minimum 4 weeks (20 working days) per CCNL Cinema. Cannot be rolled into rate. Paid on termination.' },
  hu:    { pct: 0,     label: 'Accrual', rolledUpWarning: true, note: 'Hungary: 20-30 days depending on age. Cannot be rolled up. Accrues and is paid separately.' },
  za:    { pct: 6.92,  label: '~6.92%', note: 'South Africa BCEA: 15 working days per year = approx. 6.92% of annual gross. Paid on termination.' },
  other: { pct: 0,     label: 'Verify', note: 'Holiday pay treatment varies by territory. Confirm with local employment counsel.' },
};

// ── HP CALCULATION ────────────────────────────────────────────

export interface HPCalcResult {
  dayRate: number;
  baseRate: number;       // ex HP
  hpElement: number;      // HP amount per day
  weeklyRate: number;
  hpPct: number;
  hourlyRate: number;
  divisor: number;        // contracted hours (10 for PACT TV, 11 for MMP, etc.)
}

export function calcHP(
  dayRate: number,
  territory: TerritoryCode,
  union: UnionId,
  hpMode: HPMode,
): HPCalcResult {
  const hpData = TERRITORY_HP_RATES[territory] ?? TERRITORY_HP_RATES.uk;
  const factor = hpData.pct / 100;
  const divisor = getHourlyDivisor(union);

  const base = hpMode === 'incl' ? dayRate / (1 + factor) : dayRate;
  const hp = hpMode === 'incl' ? dayRate - base : dayRate * factor;

  return {
    dayRate,
    baseRate: base,
    hpElement: hp,
    weeklyRate: dayRate * 5,
    hpPct: hpData.pct,
    hourlyRate: dayRate / divisor,
    divisor,
  };
}

// ── CONTRACTED HOURS DIVISOR ──────────────────────────────────

export function getHourlyDivisor(union: UnionId): number {
  switch (union) {
    case 'pact-mmp':   return 11;  // MMP 2021: 55-hr week, 11hrs/day
    case 'iatse-600':
    case 'iatse-728':
    case 'iatse-80':
    case 'iatse-695':
    case 'iatse-ca':
    case 'teamsters-399':
    case 'dga':
    case 'sag-aftra':  return 8;   // US: standard 8-hr studio day
    default:           return 10;  // PACT/BECTU TV: 10 contracted hours
  }
}

// ── PACT/BECTU OT CALCULATION ─────────────────────────────────

interface OTConstraints {
  otMin: number | null;       // minimum OT rate (£/hr or $/hr)
  otMax: number | null;       // maximum OT rate
  otRate: string;             // description
  camOTMin: number | null;    // minimum camera OT (MMP only)
}

export const AGREEMENT_CONSTRAINTS: Partial<Record<UnionId, OTConstraints>> = {
  'pact-bectu': { otMin: 35, otMax: 70, otRate: '×1.5T all OT', camOTMin: null },
  'pact-mmp':   { otMin: 25, otMax: 81.82, otRate: '×2.0T Camera / ×1.5T Non-Camera', camOTMin: 25 },
  'iatse-600':  { otMin: null, otMax: null, otRate: '×1.5T daily / ×2.0T 12hr+', camOTMin: null },
  'dga':        { otMin: null, otMax: null, otRate: '×1.5T / ×2.0T', camOTMin: null },
  'sag-aftra':  { otMin: null, otMax: null, otRate: 'Per SAG-AFTRA TV Agreement', camOTMin: null },
};

export function getOTConstraints(union: UnionId): OTConstraints {
  return AGREEMENT_CONSTRAINTS[union] ?? { otMin: null, otMax: null, otRate: 'Verify agreement', camOTMin: null };
}

export function isRateBelowOTMinimum(hourlyRate: number, union: UnionId): boolean {
  const constraints = getOTConstraints(union);
  if (!constraints.otMin) return false;
  return hourlyRate < constraints.otMin;
}

// ── HP VISIBILITY ─────────────────────────────────────────────

/**
 * Determines whether HP should appear on the deal memo.
 * UK Ltd/PSC and Agency: NEVER show HP (B2B arrangement).
 * US unions: NEVER show HP (no statutory obligation).
 * PAYE/Self-Employed: show HP based on deal type.
 */
export function isHPVisible(params: {
  hpShow: boolean;          // from employment status data
  dealType: DealType;
  territory: TerritoryCode;
  union: UnionId;
}): boolean {
  const { hpShow, dealType, territory, union } = params;

  // US has no statutory HP
  if (territory === 'us') return false;

  // Employment status gating (false for Ltd/PSC, Agency)
  if (!hpShow) return false;

  // Only show on time-based deals
  return dealType === 'weekly' || dealType === 'fixed' || dealType === 'dayplayer';
}

// ── DGA PRODUCTION FEE CALCULATION ───────────────────────────

/** EP Paymaster 2025-26 DGA production fee scale (07/01/2025) */
export const DGA_PRODUCTION_FEES: Record<string, number> = {
  'Unit Production Manager (UPM)':    1644,
  'First Assistant Director':         1384,
  'Key Second Assistant Director':    1120,
  'Second Assistant Director':        0,
  'Second Second Assistant Director': 0,
};

export function calcDGAProductionFee(params: {
  weeklyFee: number;
  ppWeeks: number;
  weeklyRate: number;
}): { totalPPFee: number; totalPPSalary: number; totalCompensation: number } {
  const { weeklyFee, ppWeeks, weeklyRate } = params;
  const totalPPFee = weeklyFee * ppWeeks;
  const totalPPSalary = weeklyRate * ppWeeks;
  return {
    totalPPFee,
    totalPPSalary,
    totalCompensation: totalPPSalary + totalPPFee,
  };
}

export function calcDGACOA(params: {
  basis: string;
  weeklyRate: number;
  negotiatedAmount?: number;
}): number {
  const { basis, weeklyRate, negotiatedAmount } = params;
  switch (basis) {
    case '1week':      return weeklyRate;
    case '2.5days':    return (weeklyRate / 5) * 2.5;
    case '50pct':      return weeklyRate * 0.5;
    case '100pct':     return weeklyRate;
    case 'negotiated': return negotiatedAmount ?? 0;
    default:           return 0;
  }
}

// ── FRINGE TOTALS ─────────────────────────────────────────────

export function calcFringeTotal(params: {
  weeklyRate: number;
  fringeItems: Array<{ rate: number; flat: number; hpExclOnly?: boolean }>;
  hpMode: HPMode;
}): { pctCost: number; flatCost: number; total: number } {
  const { weeklyRate, fringeItems, hpMode } = params;
  let pctCost = 0;
  let flatCost = 0;

  for (const item of fringeItems) {
    if (item.hpExclOnly && hpMode !== 'excl') continue;
    if (item.flat > 0) {
      flatCost += item.flat;
    } else if (item.rate > 0) {
      pctCost += weeklyRate * (item.rate / 100);
    }
  }

  return { pctCost, flatCost, total: pctCost + flatCost };
}

// ── CURRENCY FORMATTING ───────────────────────────────────────

export function formatCurrency(amount: number, symbol: string): string {
  return symbol + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
}

// ── PACT BUDGET BAND VALIDATION ───────────────────────────────

export interface PactBandValidation {
  isValid: boolean;
  warning?: string;
}

export function validatePactBudgetBand(band: string, weeklyRate: number): PactBandValidation {
  if (!band) return { isValid: false, warning: 'Budget Band is mandatory on deal memo (PACT/BECTU Clause 3.3)' };

  // Band 4: bank holidays paid even when not working
  if (band === '4' && weeklyRate < 3000) {
    return {
      isValid: true,
      warning: 'Band 4: consider whether weekly rate reflects HOD level — Band 4 productions are budgeted above £8m/broadcast hour.',
    };
  }

  return { isValid: true };
}
