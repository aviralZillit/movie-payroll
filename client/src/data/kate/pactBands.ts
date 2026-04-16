// ============================================================
// PACT/BECTU Scripted TV Budget Bands
// Extracted from Zillit Deal Memo v21 HTML prototype
// ============================================================

export interface PactBand {
  /** Band number (1-4) */
  band: number;
  /** Display label */
  label: string;
  /** Budget range description */
  budgetRange: string;
  /** Minimum budget per broadcast hour (GBP) */
  minBudget: number;
  /** Maximum budget per broadcast hour (GBP), null = unlimited */
  maxBudget: number | null;
  /** OT minimum hourly rate (GBP) */
  otMin: number;
  /** OT maximum hourly rate (GBP) */
  otMax: number;
  /** Whether bank holidays are paid even when not working */
  bankHolidayStandbyPay: boolean;
  /** Description text */
  description: string;
}

export const PACT_BANDS: PactBand[] = [
  {
    band: 1,
    label: 'Band 1',
    budgetRange: 'Up to \u00a31.25m per broadcast hour',
    minBudget: 0,
    maxBudget: 1_250_000,
    otMin: 35,
    otMax: 55,
    bankHolidayStandbyPay: false,
    description: 'Band 1 (up to \u00a31.25m/hr): Minimum rates apply. Standard OT structure. No bank holiday standby pay. Meal penalty: min \u00a335/hr.',
  },
  {
    band: 2,
    label: 'Band 2',
    budgetRange: '\u00a31.25m \u2013 \u00a33m per broadcast hour',
    minBudget: 1_250_000,
    maxBudget: 3_000_000,
    otMin: 35,
    otMax: 60,
    bankHolidayStandbyPay: false,
    description: 'Band 2 (\u00a31.25m-\u00a33m/hr): Minimum rates apply. Standard OT structure. Bank holiday: 2T if worked. Meal penalty: min \u00a335/hr.',
  },
  {
    band: 3,
    label: 'Band 3',
    budgetRange: '\u00a33m \u2013 \u00a38m per broadcast hour',
    minBudget: 3_000_000,
    maxBudget: 8_000_000,
    otMin: 35,
    otMax: 65,
    bankHolidayStandbyPay: false,
    description: 'Band 3 (\u00a33m-\u00a38m/hr): Above-minimum rates expected at this budget level. Full OT structure applies.',
  },
  {
    band: 4,
    label: 'Band 4',
    budgetRange: 'Above \u00a38m per broadcast hour',
    minBudget: 8_000_000,
    maxBudget: null,
    otMin: 35,
    otMax: 70,
    bankHolidayStandbyPay: true,
    description: 'Band 4 (above \u00a38m/hr): Worker paid at Basic Daily Rate on UK Bank Holidays even if not required to work. All OT provisions apply. Rates typically well above scale minimums.',
  },
];

/** Get the PACT band for a given budget per broadcast hour */
export function getPactBandForBudget(budgetPerHour: number): PactBand | undefined {
  return PACT_BANDS.find(
    (b) => budgetPerHour >= b.minBudget && (b.maxBudget === null || budgetPerHour < b.maxBudget)
  );
}
