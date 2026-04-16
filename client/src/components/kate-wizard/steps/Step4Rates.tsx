// ============================================================
// ZILLIT CODA — DEAL MEMO WIZARD
// Step 4: Rates & Compensation (Complete)
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDealMemoStore } from '../../../store/kate/useDealMemoStore';
import {
  Card, CardHeader, CardBody, Alert, Badge, Toggle,
  CurrencyInput, Field, Select,
} from '../../kate-ui/index';
import {
  calcHP, isHPVisible, isRateBelowOTMinimum, getOTConstraints,
  getHourlyDivisor, TERRITORY_HP_RATES, calcDGAProductionFee, calcDGACOA,
  formatCurrency, parseCurrency, DGA_PRODUCTION_FEES, calcFringeTotal,
} from '../../../utils/kate/calculations';
import { CURRENCY_SYMBOLS } from '../../../data/kate/territories';
import { OT_SCHEDULES } from '../../../data/kate/otSchedules';
import { US_SCALE_MINIMUMS, UK_PACT_MINIMUMS } from '../../../data/kate/scaleMinimums';
import { FRINGE_PACKAGES } from '../../../data/kate/fringePackages';
import type { CurrencyCode, TerritoryCode, UnionId, HPMode, COABasis } from '../../../types/kate/dealMemo';

// ── CONSTANTS ────────────────────────────────────────────────

const ALL_CURRENCIES: { value: string; label: string }[] = [
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'NZD', label: 'NZD (NZ$)' },
  { value: 'ZAR', label: 'ZAR (R)' },
  { value: 'HUF', label: 'HUF (Ft)' },
  { value: 'DKK', label: 'DKK (kr)' },
  { value: 'SEK', label: 'SEK (kr)' },
  { value: 'NOK', label: 'NOK (kr)' },
  { value: 'CHF', label: 'CHF (Fr)' },
];

const FX_MECHANISMS = [
  { value: 'spot',       label: 'Spot rate at payment date' },
  { value: 'ecb',        label: 'ECB/BoE reference rate (monthly)' },
  { value: 'fixed',      label: 'Fixed rate (enter below)' },
  { value: 'production', label: "Production's treasury rate" },
];

const TERRITORY_RULES: Record<string, {
  badge: string;
  turnaround: string;
  mealTrigger: string;
  mealPenalty: string;
  maxWeek: string;
  sixthDay: string;
  seventhDay: string;
  publicHolidays: string;
  mileageRate: string;
  mileageNote: string;
  goldTime: boolean;
  goldTimeNote?: string;
  fiftyFourHourRest: boolean;
  superannuation: boolean;
  superNote?: string;
  notes: string;
}> = {
  uk: {
    badge: 'UK \u2014 WTR 1998',
    turnaround: '11 hrs min',
    mealTrigger: 'Within 6 hrs of call',
    mealPenalty: '\u00A330 / \u00A350 / \u00A375 (escalating)',
    maxWeek: '48 hrs avg (WTR 1998)',
    sixthDay: '\u00D71.5 (hrs 1-10) / \u00D72.0 (OT)',
    seventhDay: '\u00D72.0 all hours',
    publicHolidays: '8 (England & Wales) / 9 (Scotland)',
    mileageRate: '45p/mile',
    mileageNote: 'HMRC approved rate. 45p/mile up to 10,000 miles p.a.; 25p/mile beyond.',
    goldTime: false, fiftyFourHourRest: false, superannuation: false,
    notes: 'WTR 1998 applies. Opt-out of 48-hr average must be voluntary and in writing. Turnaround violation \u2014 crew paid at OT rate for each hour within 11-hr turnaround.',
  },
  us: {
    badge: 'US \u2014 FLSA + Union Agreements',
    turnaround: '9 hrs (studio) / 10 hrs (location)',
    mealTrigger: 'Within 6 hrs of general crew call',
    mealPenalty: '$38 / $58 / $100 (escalating)',
    maxWeek: 'No federal cap \u2014 union agreements govern',
    sixthDay: '\u00D71.5 (hrs 1-8 studio / 1-10 location) / \u00D72.0 (OT)',
    seventhDay: '\u00D72.0 all hours (+ California 7th day provisions)',
    publicHolidays: '11 Federal \u2014 state holidays vary',
    mileageRate: '67\u00A2/mile',
    mileageNote: 'IRS standard rate 2024. Review annually.',
    goldTime: true, goldTimeNote: 'After 14 hrs from general crew call \u2014 all hours \u00D72.0. IATSE steward must be notified.',
    fiftyFourHourRest: true, superannuation: false,
    notes: 'No federal max hours. California Labor Code: 7th day double time, 54-hr weekend rest. State laws vary \u2014 confirm shooting state.',
  },
  ie: {
    badge: 'IE \u2014 OWT Act 1997',
    turnaround: '11 hrs min',
    mealTrigger: 'Within 4.5 hrs (break), 6 hrs (meal)',
    mealPenalty: '\u20AC25 / \u20AC50 (escalating)',
    maxWeek: '48 hrs avg (EU WTD)',
    sixthDay: '\u00D71.5 standard',
    seventhDay: '\u00D72.0 all hours',
    publicHolidays: '10 Irish public holidays',
    mileageRate: '\u20AC0.26/km',
    mileageNote: 'Revenue approved mileage rate.',
    goldTime: false, fiftyFourHourRest: false, superannuation: false,
    notes: 'Organisation of Working Time Act 1997. EU Working Time Directive applies.',
  },
  au: {
    badge: 'AU \u2014 Fair Work Act 2009',
    turnaround: '10 hrs min',
    mealTrigger: 'Crib time within 5 hrs',
    mealPenalty: 'A$50 / A$75 (escalating)',
    maxWeek: '38 hrs ordinary (NES)',
    sixthDay: '\u00D71.5 (first 2 hrs) / \u00D72.0 (after)',
    seventhDay: '\u00D72.0 all hours',
    publicHolidays: '8 national + state holidays vary',
    mileageRate: 'A$0.85/km',
    mileageNote: 'ATO rate 2024-25.',
    goldTime: false, fiftyFourHourRest: false,
    superannuation: true, superNote: '11.5% employer contribution mandatory (FY2024-25). Rises to 12% from 1 July 2025.',
    notes: 'Fair Work Act 2009. NES applies. Super must be paid to nominated fund.',
  },
  fr: {
    badge: 'FR \u2014 Code du Travail',
    turnaround: '11 hrs min',
    mealTrigger: '1-hour break',
    mealPenalty: 'Verify locally',
    maxWeek: '39 hrs (entertainment sector)',
    sixthDay: '\u00D71.25 (hrs 1-8) / \u00D71.5 (after)',
    seventhDay: '\u00D72.0 all hours',
    publicHolidays: '11 French public holidays',
    mileageRate: '\u20AC0.55/km',
    mileageNote: 'Bar\u00E8me fiscal 2024.',
    goldTime: false, fiftyFourHourRest: false, superannuation: false,
    notes: 'Code du Travail + Convention Collective IDCC 2412.',
  },
  de: {
    badge: 'DE \u2014 ArbZG',
    turnaround: '11 hrs min',
    mealTrigger: '30 min after 6 hrs, 45 min after 9 hrs',
    mealPenalty: 'Verify locally',
    maxWeek: '48 hrs max (ArbZG)',
    sixthDay: '\u00D71.5 standard',
    seventhDay: '\u00D72.0 all hours',
    publicHolidays: '9\u201313 (varies by state)',
    mileageRate: '\u20AC0.30/km',
    mileageNote: 'Bundesreisekostengesetz rate.',
    goldTime: false, fiftyFourHourRest: false, superannuation: false,
    notes: 'Arbeitszeitgesetz. 10 hrs/day is an absolute legal maximum.',
  },
  es: {
    badge: 'ES \u2014 Estatuto de los Trabajadores',
    turnaround: '12 hrs min',
    mealTrigger: '15-min break after 6 continuous hrs',
    mealPenalty: 'Verify locally',
    maxWeek: '40 hrs/week (max 80 hrs OT/year)',
    sixthDay: '\u00D71.5 standard',
    seventhDay: '\u00D72.0 all hours',
    publicHolidays: '14 (national + regional)',
    mileageRate: '\u20AC0.26/km',
    mileageNote: 'Standard rate.',
    goldTime: false, fiftyFourHourRest: false, superannuation: false,
    notes: 'Estatuto de los Trabajadores. Max 80 hrs OT/year.',
  },
  it: {
    badge: 'IT \u2014 D.Lgs. 66/2003',
    turnaround: '11 hrs min',
    mealTrigger: '1-hour break within 6 hrs',
    mealPenalty: 'Verify locally',
    maxWeek: '48 hrs avg (CCNL Cinema)',
    sixthDay: '\u00D71.5 standard',
    seventhDay: '\u00D72.0 all hours',
    publicHolidays: '12 Italian public holidays',
    mileageRate: '\u20AC0.26/km',
    mileageNote: 'ACI tables.',
    goldTime: false, fiftyFourHourRest: false, superannuation: false,
    notes: 'D.Lgs. 66/2003 + CCNL Cinema e Audiovisivo.',
  },
  ca: {
    badge: 'CA \u2014 Provincial Standards',
    turnaround: '8\u201310 hrs (varies by province)',
    mealTrigger: 'Meal within 5 hrs',
    mealPenalty: 'Verify locally',
    maxWeek: '40\u201344 hrs (varies by province)',
    sixthDay: '\u00D71.5 standard',
    seventhDay: '\u00D72.0 all hours',
    publicHolidays: '5 federal + provincial vary',
    mileageRate: 'C$0.70/km',
    mileageNote: 'CRA rate 2024.',
    goldTime: false, fiftyFourHourRest: false, superannuation: false,
    notes: 'Provincial employment standards apply (BC/ON/QC differ).',
  },
  hu: {
    badge: 'HU \u2014 Labour Code',
    turnaround: '11 hrs min',
    mealTrigger: '20 min after 6 hrs',
    mealPenalty: 'Verify locally',
    maxWeek: '48 hrs max',
    sixthDay: '\u00D71.5 standard',
    seventhDay: '\u00D72.0 all hours',
    publicHolidays: '11 Hungarian public holidays',
    mileageRate: 'HUF 15/km',
    mileageNote: 'Standard Hungarian rate.',
    goldTime: false, fiftyFourHourRest: false, superannuation: false,
    notes: 'Labour Code (Munka T\u00F6rv\u00E9nyk\u00F6nyve).',
  },
  nz: {
    badge: 'NZ \u2014 Employment Relations Act',
    turnaround: 'No statutory minimum',
    mealTrigger: 'Per Employment Relations Act',
    mealPenalty: 'Verify locally',
    maxWeek: '40 hrs ordinary',
    sixthDay: '\u00D71.5 standard',
    seventhDay: '\u00D72.0 all hours',
    publicHolidays: '11 NZ public holidays',
    mileageRate: 'NZ$0.99/km',
    mileageNote: 'IRD rate 2024.',
    goldTime: false, fiftyFourHourRest: false, superannuation: false,
    notes: 'Employment Relations Act 2000. Screen Industry Workers Act 2022.',
  },
  za: {
    badge: 'ZA \u2014 BCEA',
    turnaround: '12 hrs min',
    mealTrigger: '1 hour after 5 hrs',
    mealPenalty: 'Verify locally',
    maxWeek: '45 hrs (max 10 hrs OT/week)',
    sixthDay: '\u00D71.5 standard',
    seventhDay: '\u00D72.0 all hours',
    publicHolidays: '12 South African public holidays',
    mileageRate: 'R4.64/km',
    mileageNote: 'SARS rate 2024.',
    goldTime: false, fiftyFourHourRest: false, superannuation: false,
    notes: 'Basic Conditions of Employment Act (BCEA). Max 10 hrs OT/week.',
  },
};

const TERRITORY_RULES_FALLBACK = {
  badge: 'Verify locally',
  turnaround: 'Verify locally',
  mealTrigger: 'Verify locally',
  mealPenalty: 'Verify locally',
  maxWeek: 'Verify locally',
  sixthDay: 'Verify locally',
  seventhDay: 'Verify locally',
  publicHolidays: 'Verify locally',
  mileageRate: 'Verify locally',
  mileageNote: 'Confirm with local employment counsel.',
  goldTime: false, fiftyFourHourRest: false, superannuation: false,
  notes: 'Confirm with local employment counsel.',
};

// ── FRINGE KEY RESOLVER ──────────────────────────────────────

function getFringeKey(territory: string, union: string, empStatusId: string): string {
  if (territory === 'uk') {
    if (['paye', 'self', 'ltd-inside'].includes(empStatusId)) return 'uk-paye';
    if (['ltd', 'agency'].includes(empStatusId)) return 'uk-psc';
    return 'uk-paye';
  }
  if (territory === 'us') {
    if (union.startsWith('iatse')) return 'us-iatse';
    if (union === 'dga') return 'us-dga';
    if (union === 'sag-aftra') return 'us-sag';
    return 'us-w2';
  }
  const territoryMap: Record<string, string> = {
    ie: 'ie-paye', fr: 'fr-salarie', de: 'de-employee', au: 'au-payg',
    ca: 'ca-t4', hu: 'hu-employee', es: 'es-employee', it: 'it-employee',
    nz: 'nz-paye', za: 'za-employee',
  };
  return territoryMap[territory] ?? 'default';
}

// ── SCALE MINIMUM LOOKUP ─────────────────────────────────────

function getScaleMinimum(territory: string, union: string, jobTitle: string): { weekly: number | null; daily: number | null; note: string } | null {
  if (territory === 'us' && US_SCALE_MINIMUMS[union]) {
    const roles = US_SCALE_MINIMUMS[union];
    if (roles[jobTitle]) return roles[jobTitle];
  }
  if (territory === 'uk') {
    const pactData = UK_PACT_MINIMUMS[union] as Record<string, any> | undefined;
    if (pactData && pactData[jobTitle]) return pactData[jobTitle];
  }
  return null;
}

// ── MAIN COMPONENT ───────────────────────────────────────────

export default function Step4Rates() {
  const store = useDealMemoStore();
  const { rates, territory, union, dealType, employmentStatusId, jobTitle, schedShootDays } = store;
  const update = store.update;

  const sym = CURRENCY_SYMBOLS[rates.currency as CurrencyCode] ?? '£';
  const terr = territory as unknown as TerritoryCode;
  const uni = union as unknown as UnionId;
  const hpData = TERRITORY_HP_RATES[terr] ?? TERRITORY_HP_RATES.uk;
  const divisor = getHourlyDivisor(uni);
  const constraints = getOTConstraints(uni);
  const isDGA = uni === 'dga' && terr === 'us';
  const showProdFee = isDGA && DGA_PRODUCTION_FEES[jobTitle] !== undefined;

  // HP visibility: 3-gated
  const hpShowFromStatus = !['ltd', 'ltd-inside', 'agency'].includes(employmentStatusId);
  const hpVisible = isHPVisible({
    hpShow: hpShowFromStatus,
    dealType: dealType as any,
    territory: terr,
    union: uni,
  });

  // Rate calc
  const [rateSrc, setRateSrc] = useState<'day' | 'weekly'>('day');
  const calc = calcHP(rates.dayRate, terr, uni, rates.hpMode as HPMode);
  const belowMin = isRateBelowOTMinimum(calc.hourlyRate, uni);

  // Scale minimum
  const scaleMin = useMemo(() => getScaleMinimum(terr, uni as string, jobTitle), [terr, uni, jobTitle]);
  const scaleStatus = useMemo(() => {
    if (!scaleMin) return null;
    const ref = scaleMin.daily ?? (scaleMin.weekly ? scaleMin.weekly / 5 : null);
    if (!ref) return null;
    if (rates.dayRate === ref) return 'at' as const;
    if (rates.dayRate > ref) return 'above' as const;
    return 'below' as const;
  }, [scaleMin, rates.dayRate]);

  // Payment currency options
  const paymentCurrencyOpts = useMemo(() => {
    return [{ value: rates.currency, label: 'Same as contract' }, ...ALL_CURRENCIES];
  }, [rates.currency]);

  const showFx = rates.paymentCurrency !== rates.currency;

  // ── HANDLERS ─────────────────────────────────────────────

  const handleDayRateChange = useCallback((val: string) => {
    const raw = parseCurrency(val);
    setRateSrc('day');
    update({ rates: { ...rates, dayRate: raw, weeklyRate: raw * 5 } });
  }, [rates, update]);

  const handleWeeklyRateChange = useCallback((val: string) => {
    const raw = parseCurrency(val);
    setRateSrc('weekly');
    update({ rates: { ...rates, weeklyRate: raw, dayRate: raw / 5 } });
  }, [rates, update]);

  // DGA auto-populate
  useEffect(() => {
    if (isDGA && jobTitle && DGA_PRODUCTION_FEES[jobTitle]) {
      const fee = DGA_PRODUCTION_FEES[jobTitle];
      if (fee && !(store as any).dgaProductionFee?.weeklyFee) {
        const shootWeeks = Math.ceil(schedShootDays / 5);
        update({
          dgaProductionFee: {
            weeklyFee: fee,
            ppWeeks: shootWeeks,
            totalPPFee: fee * shootWeeks,
            totalPPSalary: rates.weeklyRate * shootWeeks,
            totalCompensation: (rates.weeklyRate + fee) * shootWeeks,
          },
        } as any);
      }
    }
  }, [jobTitle, uni]);

  // ── RENDER ─────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-[10px] font-display font-bold text-text-4 uppercase tracking-widest mb-1">
          Step 4 of 10
        </div>
        <h1 className="text-[22px] font-display font-bold text-text-1 mb-1">
          Rates &amp; Compensation
        </h1>
        <p className="text-[13px] text-text-2">
          Set the agreed day rate and weekly rate. Holiday pay, overtime, fringes, and production fee are shown based on your territory, union, and employment status.
        </p>
      </div>

      {/* ── 4A: CURRENCY SELECTORS ── */}
      <Card className="mb-4">
        <CardHeader>
          <span className="text-sm font-display font-bold text-text-1">Currency &amp; Payment</span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Contract Currency" required>
              <Select
                value={rates.currency}
                onChange={(val) => update({ rates: { ...rates, currency: val } })}
                options={ALL_CURRENCIES}
              />
            </Field>
            <Field label="Payment Currency">
              <Select
                value={rates.paymentCurrency}
                onChange={(val) => update({ rates: { ...rates, paymentCurrency: val } })}
                options={paymentCurrencyOpts}
              />
            </Field>
          </div>
          {showFx && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="FX Rate Mechanism" required>
                  <Select
                    value={(rates as any).fxMechanism ?? 'spot'}
                    onChange={(val) => update({ rates: { ...rates, fxMechanism: val } as any })}
                    options={FX_MECHANISMS}
                  />
                </Field>
              </div>
              <Alert variant="gold" className="mb-3 text-[11px]">
                Contract denominated in {rates.currency}, payment in {rates.paymentCurrency}. Exchange rate risk: confirm mechanism and which party bears rate movement risk before signing.
              </Alert>
              {(rates as any).fxMechanism === 'fixed' && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Field label="Fixed FX Rate" required>
                    <input
                      type="number"
                      step="0.0001"
                      value={(rates as any).fixedFxRate ?? ''}
                      onChange={(e) => update({ rates: { ...rates, fixedFxRate: parseFloat(e.target.value) || 0 } as any })}
                      className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
                      placeholder="e.g. 1.2750"
                    />
                  </Field>
                  <Field label="Lock Date">
                    <input
                      type="date"
                      value={(store as any).fxLockDate ?? ''}
                      onChange={(e) => update({ fxLockDate: e.target.value } as any)}
                      className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none focus:border-border-light transition-colors"
                    />
                  </Field>
                </div>
              )}
              {(rates as any).fxMechanism === 'fixed' && (rates as any).fixedFxRate > 0 && (
                <Alert variant="gold" className="text-[11px]">
                  Fixed FX rate locked at {(rates as any).fixedFxRate}. Exchange rate risk sits with {rates.currency === 'GBP' ? 'production' : 'the contracting party'}. Rate will be reviewed on the lock date.
                </Alert>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* ── 4B: PICTURE FEE MODE ── */}
      {dealType === 'picture' && (() => {
        const pictureFee = rates.dayRate;
        const totalDays = (store.schedPrepDays || 0) + (store.schedShootDays || 0) + (store.schedWrapDays || 0);
        const totalWeeks = totalDays / 5;
        const weeklyEquiv = totalWeeks > 0 ? pictureFee / totalWeeks : 0;
        const picCalc = calcHP(pictureFee, terr, uni, rates.hpMode as HPMode);
        return (
          <Card accent="gold" className="mb-4">
            <CardHeader>
              <span className="text-sm font-display font-bold text-text-1">Picture Deal -- All-In Fee</span>
              <Badge variant="purple" className="ml-2">Picture Deal</Badge>
            </CardHeader>
            <CardBody>
              <Alert variant="purple" className="mb-4 text-[11px]">
                <strong>Picture Deal</strong> -- Enter a single all-in fee for the entire production. No phase breakdowns, no OT calculation. HP treatment still applies.
              </Alert>
              <div className="flex justify-center mb-4">
                <div className="flex flex-col items-center p-5 bg-bg-hover border border-border-medium rounded-xl text-center">
                  <label className="text-[11px] font-display font-bold text-text-2 uppercase tracking-wide mb-2">
                    Total Production Fee (All-In)
                  </label>
                  <CurrencyInput
                    value={pictureFee}
                    symbol={sym}
                    onChange={(val) => update({ rates: { ...rates, dayRate: parseCurrency(val), weeklyRate: 0 } })}
                    className="text-center text-[22px] font-mono"
                  />
                  <div className="text-[11px] text-text-3 mt-2">
                    Payable across the full production schedule · {totalWeeks.toFixed(1)} weeks · {formatCurrency(weeklyEquiv, sym)}/wk equiv.
                  </div>
                </div>
              </div>

              {/* HP Toggle */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] text-text-3">HP Treatment:</span>
                <div className="flex bg-bg-elevated rounded-lg overflow-hidden border border-border">
                  <button
                    onClick={() => update({ rates: { ...rates, hpMode: 'excl' } })}
                    className={`px-3 py-1.5 text-[11px] transition-all ${rates.hpMode === 'excl' ? 'bg-gold/20 text-gold' : 'text-text-3 hover:text-text-2'}`}
                  >
                    HP Exclusive
                  </button>
                  <button
                    onClick={() => update({ rates: { ...rates, hpMode: 'incl' } })}
                    className={`px-3 py-1.5 text-[11px] transition-all ${rates.hpMode === 'incl' ? 'bg-gold/20 text-gold' : 'text-text-3 hover:text-text-2'}`}
                  >
                    HP Inclusive
                  </button>
                </div>
              </div>

              {/* HP breakdown alert */}
              {hpVisible && (
                <Alert variant="blue" className="text-[11px]">
                  HP is {rates.hpMode === 'incl' ? 'included within' : 'added on top of'} the picture fee. Base fee: {formatCurrency(picCalc.baseRate, sym)} · HP element: {formatCurrency(picCalc.hpElement, sym)}.
                </Alert>
              )}
            </CardBody>
          </Card>
        );
      })()}

      {/* ── 4C: BUYOUT RATE MODE ── */}
      {dealType === 'buyout' && (() => {
        const buyoutRate = rates.dayRate;
        const buyoutCovers = (store as any).buyoutCovers ?? '10';
        const buyoutCalc = calcHP(buyoutRate, terr, uni, rates.hpMode as HPMode);
        return (
          <Card accent="gold" className="mb-4">
            <CardHeader>
              <span className="text-sm font-display font-bold text-text-1">Buy-Out -- Flat Fee</span>
              <Badge variant="teal" className="ml-2">Buy-Out</Badge>
            </CardHeader>
            <CardBody>
              <Alert variant="teal" className="mb-4 text-[11px]">
                <strong>Buy-Out Deal</strong> -- Flat fee covers all hours worked. <strong>No overtime will be generated.</strong> Ensure the buy-out rate genuinely compensates for expected hours.
              </Alert>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Field label="Buy-Out Rate" required>
                  <CurrencyInput
                    value={buyoutRate}
                    symbol={sym}
                    onChange={(val) => update({ rates: { ...rates, dayRate: parseCurrency(val) } })}
                    hint="Flat fee covers all hours. No overtime generated."
                  />
                </Field>
                <Field label="Covers (hours/day assumed)">
                  <Select
                    value={buyoutCovers}
                    onChange={(val) => update({ buyoutCovers: val } as any)}
                    options={[
                      { value: '8', label: '8 hrs/day' },
                      { value: '10', label: '10 hrs/day' },
                      { value: '12', label: '12 hrs/day' },
                      { value: 'unlimited', label: 'Unlimited' },
                    ]}
                  />
                </Field>
                <Field label="Currency">
                  <Select
                    value={rates.currency}
                    onChange={(val) => update({ rates: { ...rates, currency: val } })}
                    options={ALL_CURRENCIES}
                  />
                </Field>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] text-text-3">HP Treatment:</span>
                <div className="flex bg-bg-elevated rounded-lg overflow-hidden border border-border">
                  <button
                    onClick={() => update({ rates: { ...rates, hpMode: 'excl' } })}
                    className={`px-3 py-1.5 text-[11px] transition-all ${rates.hpMode === 'excl' ? 'bg-gold/20 text-gold' : 'text-text-3 hover:text-text-2'}`}
                  >
                    HP Exclusive
                  </button>
                  <button
                    onClick={() => update({ rates: { ...rates, hpMode: 'incl' } })}
                    className={`px-3 py-1.5 text-[11px] transition-all ${rates.hpMode === 'incl' ? 'bg-gold/20 text-gold' : 'text-text-3 hover:text-text-2'}`}
                  >
                    HP Inclusive
                  </button>
                </div>
              </div>
              <Alert variant="blue" className="text-[11px]">
                Buy-out covers {buyoutCovers === 'unlimited' ? 'unlimited' : buyoutCovers} hrs/day. Weekly equivalent: {formatCurrency(buyoutRate * 5, sym)}/wk.{hpVisible ? ` HP ${rates.hpMode === 'incl' ? 'inclusive' : 'exclusive'} at ${hpData.pct}%. Base ${formatCurrency(buyoutCalc.baseRate, sym)} + HP ${formatCurrency(buyoutCalc.hpElement, sym)}.` : ''} No overtime payable.
              </Alert>
            </CardBody>
          </Card>
        );
      })()}

      {/* ── 4D: STANDARD RATE ENTRY ── */}
      {dealType !== 'picture' && dealType !== 'buyout' && (
        <Card accent="gold" className="mb-4">
          <CardHeader>
            <span className="text-sm font-display font-bold text-text-1">Rate Entry</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[11px] text-text-3">Phase rates</span>
              <Toggle
                on={rates.phaseRatesOn}
                onToggle={() => update({ rates: { ...rates, phaseRatesOn: !rates.phaseRatesOn } })}
              />
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field
                label={`Day Rate ${rateSrc === 'weekly' ? '(auto)' : ''}`}
                required
                hint={rateSrc === 'day' ? 'Source rate -- weekly auto-calculates' : 'Auto from weekly (div 5)'}
              >
                <CurrencyInput
                  value={rates.dayRate}
                  symbol={sym}
                  onChange={handleDayRateChange}
                />
              </Field>
              <Field
                label={`Weekly Rate ${rateSrc === 'day' ? '(auto)' : ''}`}
                hint={rateSrc === 'weekly' ? 'Source rate -- daily auto-calculates' : 'Auto from day rate (x5)'}
              >
                <CurrencyInput
                  value={rates.weeklyRate}
                  symbol={sym}
                  onChange={handleWeeklyRateChange}
                />
              </Field>
            </div>

            {/* Scale minimum badge */}
            {scaleStatus && scaleMin && (
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={scaleStatus === 'at' ? 'gold' : scaleStatus === 'above' ? 'green' : 'red'}>
                  {scaleStatus === 'at' ? 'AT SCALE MINIMUM' : scaleStatus === 'above' ? 'ABOVE SCALE' : 'BELOW SCALE'}
                </Badge>
                <span className="text-[10px] text-text-4">
                  Scale: {scaleMin.daily ? `${sym}${scaleMin.daily}/day` : ''}{scaleMin.weekly ? ` | ${sym}${scaleMin.weekly}/wk` : ''}
                </span>
              </div>
            )}

            {/* Agreement constraints bar */}
            <div className="flex items-center gap-4 flex-wrap bg-bg-hover border border-border rounded-lg px-3.5 py-2.5 mb-4 text-[11px]">
              <span className="text-[9px] font-display font-bold text-text-4 uppercase tracking-widest flex-shrink-0">
                Agreement Constraints
              </span>
              <span className="text-text-2">
                Hourly: <span className="font-mono text-gold">{formatCurrency(calc.hourlyRate, sym)}/hr</span>
                <span className="text-text-4 ml-1">(div {divisor})</span>
              </span>
              {constraints.otMin && (
                <span className="text-text-2">
                  OT Min: <span className="font-mono text-teal-400">{sym}{constraints.otMin}/hr</span>
                </span>
              )}
              {constraints.otMax && (
                <span className="text-text-2">
                  OT Max: <span className="font-mono text-teal-400">{sym}{constraints.otMax}/hr</span>
                </span>
              )}
              <span className="text-text-2 font-mono text-teal-400">{constraints.otRate}</span>
              {belowMin && (
                <Badge variant="orange" className="ml-auto">
                  Hourly rate below OT minimum -- minimum applies to all OT
                </Badge>
              )}
            </div>

            {/* ── 4F: Phase Rates ── */}
            {rates.phaseRatesOn && <PhaseRates sym={sym} />}

            {/* ── 4E: HP Section ── */}
            {hpVisible && <HPSection hpData={hpData} calc={calc} sym={sym} divisor={divisor} />}
          </CardBody>
        </Card>
      )}

      {/* ── RATE SUMMARY ── */}
      {dealType !== 'picture' && dealType !== 'buyout' && (
        <Card className="mb-4">
          <CardHeader>
            <span className="text-sm font-display font-bold text-text-1">Rate Summary</span>
          </CardHeader>
          <CardBody className="divide-y divide-border">
            <RateRow label="Agreed Day Rate">
              <div className="flex items-center gap-2">
                <span className="font-mono text-text-1">{formatCurrency(calc.dayRate, sym)}</span>
                {scaleMin?.daily && (
                  <span className="text-[10px] text-text-3">min {formatCurrency(scaleMin.daily, sym)}</span>
                )}
              </div>
            </RateRow>
            {hpVisible && (
              <>
                <RateRow label="Base Rate (ex HP)">
                  <span className="font-mono text-teal-400">{formatCurrency(calc.baseRate, sym)}</span>
                </RateRow>
                <RateRow label={`HP Element (${calc.hpPct}%)`}>
                  <span className="font-mono text-teal-400">{formatCurrency(calc.hpElement, sym)}</span>
                </RateRow>
              </>
            )}
            <RateRow label="Weekly (5-day basis)">
              <span className="font-mono text-text-1">{formatCurrency(calc.weeklyRate, sym)}</span>
            </RateRow>
            <RateRow label={`Hourly Rate (div ${divisor})`}>
              <span className="font-mono text-gold">{formatCurrency(calc.hourlyRate, sym)}/hr</span>
            </RateRow>
          </CardBody>
        </Card>
      )}

      {/* ── 4G: DGA PRODUCTION FEE ── */}
      {showProdFee && <DGAProductionFeeCard />}

      {/* ── 4H: OT SCHEDULE ── */}
      <OTScheduleCard />

      {/* ── 4I: TERRITORY WORKING RULES ── */}
      <TerritoryWorkingRulesCard />

      {/* ── 4J: FRINGES ── */}
      <FringesCard weeklyRate={calc.weeklyRate} sym={sym} />
    </div>
  );
}

// ── SUB-COMPONENTS ───────────────────────────────────────────

function RateRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[12px] text-text-2">{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

// ── HP SECTION ───────────────────────────────────────────────

function HPSection({ hpData, calc, sym, divisor }: { hpData: any; calc: any; sym: string; divisor: number }) {
  const { rates, update } = useDealMemoStore();

  return (
    <div className="border border-border rounded-lg p-4 mb-3 bg-bg-hover">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] font-display font-bold text-text-2 uppercase tracking-wide">
            Holiday Pay -- {hpData.pct}%
          </div>
          <div className="text-[10px] text-text-4 mt-0.5">{hpData.label} -- {hpData.note?.split('.')[0]}</div>
          {hpData.rolledUpWarning && (
            <div className="text-[10px] text-amber-400 mt-0.5">
              Warning: Rolling-up HP into rate may be unlawful in this territory
            </div>
          )}
        </div>
        <div className="flex bg-bg-elevated rounded-lg overflow-hidden border border-border">
          <button
            onClick={() => update({ rates: { ...rates, hpMode: 'excl' } })}
            className={`px-3 py-1.5 text-[11px] transition-all ${rates.hpMode === 'excl' ? 'bg-gold/20 text-gold' : 'text-text-3 hover:text-text-2'}`}
          >
            Exclusive (paid on top)
          </button>
          <button
            onClick={() => update({ rates: { ...rates, hpMode: 'incl' } })}
            className={`px-3 py-1.5 text-[11px] transition-all ${rates.hpMode === 'incl' ? 'bg-gold/20 text-gold' : 'text-text-3 hover:text-text-2'}`}
          >
            Inclusive (within rate)
          </button>
        </div>
      </div>

      {/* HP Breakdown */}
      <div className="grid grid-cols-5 gap-3 mb-3">
        <div className="bg-bg-surface border border-border rounded-lg p-2.5 text-center">
          <div className="text-[9px] text-text-4 uppercase tracking-wide mb-1">Agreed Day Rate</div>
          <div className="font-mono text-[13px] text-text-1">{formatCurrency(calc.dayRate, sym)}</div>
        </div>
        <div className="bg-bg-surface border border-border rounded-lg p-2.5 text-center">
          <div className="text-[9px] text-text-4 uppercase tracking-wide mb-1">Base Rate (ex HP)</div>
          <div className="font-mono text-[13px] text-teal-400">{formatCurrency(calc.baseRate, sym)}</div>
        </div>
        <div className="bg-bg-surface border border-border rounded-lg p-2.5 text-center">
          <div className="text-[9px] text-text-4 uppercase tracking-wide mb-1">HP Element ({calc.hpPct}%)</div>
          <div className="font-mono text-[13px] text-teal-400">{formatCurrency(calc.hpElement, sym)}</div>
        </div>
        <div className="bg-bg-surface border border-border rounded-lg p-2.5 text-center">
          <div className="text-[9px] text-text-4 uppercase tracking-wide mb-1">Weekly (5-day)</div>
          <div className="font-mono text-[13px] text-text-1">{formatCurrency(calc.weeklyRate, sym)}</div>
        </div>
        <div className="bg-bg-surface border border-border rounded-lg p-2.5 text-center">
          <div className="text-[9px] text-text-4 uppercase tracking-wide mb-1">Hourly Rate (div {divisor})</div>
          <div className="font-mono text-[13px] text-gold">{formatCurrency(calc.hourlyRate, sym)}/hr</div>
        </div>
      </div>

      <Alert variant="blue" className="text-[11px]">
        {rates.hpMode === 'incl'
          ? `HP included within agreed day rate (div ${(1 + hpData.pct / 100).toFixed(4)}). Base ${formatCurrency(calc.baseRate, sym)}/day + HP ${formatCurrency(calc.hpElement, sym)}/day.`
          : `HP paid in addition to day rate. Total per day: ${formatCurrency(calc.dayRate + calc.hpElement, sym)}.`}
      </Alert>
    </div>
  );
}

// ── PHASE RATES ──────────────────────────────────────────────

function PhaseRates({ sym }: { sym: string }) {
  const { rates, update, schedPrepDays, schedShootDays, schedWrapDays } = useDealMemoStore();

  const phases = [
    { key: 'prepRate', daysKey: 'prep', days: schedPrepDays, label: 'Prep Day Rate', badge: 'Prep', variant: 'blue' as const, color: 'bg-blue-500/20 text-blue-400' },
    { key: 'shootRate', daysKey: 'shoot', days: schedShootDays, label: 'Shoot Day Rate', badge: 'Shoot', variant: 'orange' as const, color: 'bg-orange-500/20 text-orange-400' },
    { key: 'wrapRate', daysKey: 'wrap', days: schedWrapDays, label: 'Wrap Day Rate', badge: 'Wrap', variant: 'purple' as const, color: 'bg-purple-500/20 text-purple-400' },
  ];

  // Compute phase totals
  const phaseTotals = phases.map((p) => {
    const rate = (rates as any)[p.key] ?? rates.dayRate;
    return { ...p, rate, total: rate * p.days };
  });
  const totalPhaseLabour = phaseTotals.reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="mb-4 p-3 bg-bg-elevated rounded-lg border border-border">
      <div className="text-[11px] font-display font-bold text-text-2 mb-3">Phase-Specific Rates</div>
      {phases.map(({ key, label, badge, color }) => (
        <div key={key} className="flex items-center gap-3 mb-2">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${color}`}>
            {badge}
          </span>
          <span className="text-[11px] text-text-3 w-28">{label}</span>
          <CurrencyInput
            value={(rates as any)[key] ?? rates.dayRate}
            symbol={sym}
            onChange={(val) => update({ rates: { ...rates, [key]: parseCurrency(val) } })}
            className="flex-1"
          />
        </div>
      ))}

      {/* Computed phase totals */}
      <div className="mt-3 pt-3 border-t border-border space-y-1.5">
        <div className="text-[9px] font-display font-bold text-text-4 uppercase tracking-widest mb-2">Phase Totals</div>
        {phaseTotals.map((p) => (
          <div key={p.key} className="flex items-center justify-between text-[11px]">
            <span className="text-text-3">{p.badge} total: {formatCurrency(p.rate, sym)}/day x {p.days} days</span>
            <span className="font-mono text-text-1">{formatCurrency(p.total, sym)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-[12px] font-semibold pt-2 border-t border-border">
          <span className="text-text-1">Total Phase Labour</span>
          <span className="font-mono text-gold">{formatCurrency(totalPhaseLabour, sym)}</span>
        </div>
      </div>
    </div>
  );
}

// ── DGA PRODUCTION FEE ───────────────────────────────────────

function DGAProductionFeeCard() {
  const store = useDealMemoStore();
  const { rates, jobTitle, schedShootDays, update } = store;
  const fee = (store as any).dgaProductionFee ?? {};
  const weeklyFee = fee.weeklyFee ?? DGA_PRODUCTION_FEES[jobTitle] ?? 0;
  const ppWeeks = fee.ppWeeks ?? Math.ceil(schedShootDays / 5);
  const result = calcDGAProductionFee({ weeklyFee, ppWeeks, weeklyRate: rates.weeklyRate });

  const updateFee = (patch: any) => {
    const merged = { ...fee, ...patch };
    const updated = calcDGAProductionFee({ weeklyFee: merged.weeklyFee, ppWeeks: merged.ppWeeks, weeklyRate: rates.weeklyRate });
    update({ dgaProductionFee: { ...merged, ...updated } } as any);
  };

  const dgaCOA = (store as any).dgaCOA;
  const coaBasis = dgaCOA?.basis ?? '1week';
  const coaAmt = calcDGACOA({ basis: coaBasis, weeklyRate: rates.weeklyRate, negotiatedAmount: dgaCOA?.negotiatedAmount });

  return (
    <Card accent="purple" className="mb-4">
      <CardHeader>
        <span className="text-sm font-display font-bold text-text-1">DGA Production Fee &amp; COA</span>
        <Badge variant="purple" className="ml-2">DGA Basic Agreement -- US Only</Badge>
      </CardHeader>
      <CardBody>
        <Alert variant="blue" className="mb-4 text-[11px]">
          Under the DGA Basic Agreement, UPMs and ADs receive a weekly salary plus a separate weekly Production Fee during principal photography. Scale minimums from EP Paymaster 2025-26 are pre-populated.
        </Alert>

        <div className="text-[9px] font-display font-bold text-text-4 uppercase tracking-widest mb-2">
          Production Fee (during Principal Photography)
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Field label="Weekly Production Fee" required hint="EP Paymaster 07/01/2025: UPM $1,644 | 1st AD $1,384 | Key 2nd $1,120">
            <CurrencyInput
              value={weeklyFee}
              symbol="$"
              onChange={(val) => updateFee({ weeklyFee: parseCurrency(val) })}
            />
          </Field>
          <Field label="PP Weeks">
            <input
              type="number"
              value={ppWeeks}
              min={1}
              onChange={(e) => updateFee({ ppWeeks: parseInt(e.target.value) || 1 })}
              className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none focus:border-border-light transition-colors"
            />
          </Field>
        </div>

        {/* Summary box */}
        <div className="bg-bg-hover border border-purple-400/20 rounded-lg p-3 mb-4 space-y-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-text-2">Weekly Salary x {ppWeeks} PP Weeks</span>
            <span className="font-mono text-text-1">{formatCurrency(result.totalPPSalary, '$')}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-text-2">Weekly Production Fee x {ppWeeks} PP Weeks</span>
            <span className="font-mono text-purple-400">{formatCurrency(result.totalPPFee, '$')}</span>
          </div>
          <div className="flex justify-between text-[13px] font-semibold pt-2 border-t border-border">
            <span className="text-text-1">Total Compensation (PP period)</span>
            <span className="font-mono text-gold">{formatCurrency(result.totalCompensation, '$')}</span>
          </div>
        </div>

        {/* COA */}
        <div className="h-px bg-border mb-4" />
        <div className="text-[9px] font-display font-bold text-text-4 uppercase tracking-widest mb-2">
          Completion of Assignment (COA)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="COA Basis">
            <Select
              value={coaBasis}
              onChange={(val) => update({ dgaCOA: { ...dgaCOA, basis: val } } as any)}
              options={[
                { value: '1week', label: "1 week's salary (standard — employed ≥ 2 consecutive weeks)" },
                { value: '2.5days', label: "2.5 days' salary (employed ≥ 5 days but < 2 weeks)" },
                { value: '50pct', label: '50% weekly rate per hiatus (Article 24 multi-camera)' },
                { value: '100pct', label: '100% weekly rate — final completion (Article 24)' },
                { value: 'negotiated', label: 'Negotiated — enter amount below' },
                { value: 'none', label: 'No COA applicable to this engagement' },
              ]}
            />
          </Field>
          <div className="flex items-end">
            {coaBasis === 'negotiated' ? (
              <Field label="Negotiated COA Amount">
                <CurrencyInput
                  value={dgaCOA?.negotiatedAmount ?? 0}
                  symbol="$"
                  onChange={(val) => update({ dgaCOA: { ...dgaCOA, negotiatedAmount: parseCurrency(val) } } as any)}
                />
              </Field>
            ) : (
              <div className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2.5 flex justify-between">
                <span className="text-[12px] text-text-2">Estimated COA</span>
                <span className="font-mono text-teal-400 text-[13px]">
                  {coaAmt > 0 ? formatCurrency(coaAmt, '$') : 'N/A'}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ── OT SCHEDULE CARD ─────────────────────────────────────────

function OTScheduleCard() {
  const { union, territory, rates } = useDealMemoStore();
  const uni = union as unknown as UnionId;
  const terr = territory as unknown as TerritoryCode;
  const isNonUnion = (uni as string).startsWith('nu-');
  const schedule = OT_SCHEDULES[uni as string] ?? OT_SCHEDULES['default'];
  const sym = CURRENCY_SYMBOLS[rates.currency as CurrencyCode] ?? '£';
  const divisor = getHourlyDivisor(uni);
  const hourlyRate = rates.dayRate / divisor;

  // Non-union custom OT state
  const [contractedHours, setContractedHours] = useState(10);
  const [otApplies, setOtApplies] = useState('yes');
  const [rateDivisor, setRateDivisor] = useState('10');
  const [mealPenaltyRate, setMealPenaltyRate] = useState(50);
  const [mealBreakTrigger, setMealBreakTrigger] = useState(6);
  const [minTurnaround, setMinTurnaround] = useState(11);
  const [turnaroundViolationRate, setTurnaroundViolationRate] = useState(0);
  const [sixthDayPremium, setSixthDayPremium] = useState(true);
  const [seventhDayDouble, setSeventhDayDouble] = useState(true);
  const [mealPenaltyToggle, setMealPenaltyToggle] = useState(true);
  const [turnaroundViolation, setTurnaroundViolation] = useState(true);

  // OT bands for non-union custom builder
  const [otBands, setOtBands] = useState([
    { from: 0, to: 10, mult: 1.0, note: 'Straight time' },
    { from: 10, to: 12, mult: 1.5, note: 'Time and a half' },
    { from: 12, to: 99, mult: 2.0, note: 'Double time' },
  ]);

  const addOtBand = () => {
    const lastBand = otBands[otBands.length - 1];
    setOtBands([...otBands, { from: lastBand?.to ?? 0, to: (lastBand?.to ?? 0) + 2, mult: 2.0, note: '' }]);
  };

  const removeOtBand = (idx: number) => {
    setOtBands(otBands.filter((_, i) => i !== idx));
  };

  const updateOtBand = (idx: number, field: string, value: number | string) => {
    setOtBands(otBands.map((b, i) => i === idx ? { ...b, [field]: value } : b));
  };

  return (
    <Card accent="teal" className="mb-4">
      <CardHeader>
        <span className="text-sm font-display font-bold text-text-1">Overtime Structure</span>
        <Badge variant="teal" className="ml-2">{(uni as string).toUpperCase()}</Badge>
      </CardHeader>
      <CardBody>
        {!isNonUnion ? (
          <>
            {/* Union OT table */}
            {schedule.note && (
              <div className="text-[11px] text-text-3 mb-3 leading-relaxed">{schedule.note}</div>
            )}
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-bg-elevated">
                    <th className="text-left px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px]">Period</th>
                    <th className="text-left px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px]">Hours</th>
                    <th className="text-left px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px]">Multiplier</th>
                    <th className="text-right px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px]">Effective Rate</th>
                    <th className="text-left px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px]">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.rows.map((row, i) => {
                    // Parse multiplier to compute effective rate
                    const multiplierMatch = row.m.match(/([\d.]+)/);
                    const multiplier = multiplierMatch ? parseFloat(multiplierMatch[1]) : 1;
                    const effectiveRate = hourlyRate * multiplier;
                    return (
                      <tr key={i} className={i % 2 === 0 ? 'bg-bg-surface' : 'bg-bg-elevated'}>
                        <td className="px-3 py-2 text-text-1 font-medium">{row.p}</td>
                        <td className="px-3 py-2 text-text-2">{row.h}</td>
                        <td className="px-3 py-2 font-mono text-gold">{row.m}</td>
                        <td className="px-3 py-2 text-right font-mono text-teal-400">{formatCurrency(effectiveRate, sym)}/hr</td>
                        <td className="px-3 py-2 text-text-4 text-[10px]">{row.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-[10px] text-text-4">
              Hourly rate for OT: <span className="font-mono text-gold">{formatCurrency(hourlyRate, sym)}/hr</span> (day rate div {divisor})
            </div>
          </>
        ) : (
          <>
            {/* Non-union custom OT builder */}
            <div className="text-[11px] text-text-3 mb-3">
              Custom overtime structure for non-union engagement. Configure working rules below.
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="Contracted Hours/Day">
                <input
                  type="number"
                  value={contractedHours}
                  min={6}
                  max={16}
                  onChange={(e) => setContractedHours(parseInt(e.target.value) || 10)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none focus:border-border-light transition-colors"
                />
              </Field>
              <Field label="OT Applies?">
                <Select
                  value={otApplies}
                  onChange={setOtApplies}
                  options={[
                    { value: 'yes',     label: 'Yes — defined structure below' },
                    { value: 'buyout',  label: 'No — buy-out (all hours included)' },
                    { value: 'twostep', label: 'Yes — simple time + half / double' },
                  ]}
                />
              </Field>
              <Field label="Rate Divisor">
                <Select
                  value={rateDivisor}
                  onChange={setRateDivisor}
                  options={[
                    { value: '10',     label: 'Day rate ÷ 10 hrs' },
                    { value: '8',      label: 'Day rate ÷ 8 hrs' },
                    { value: '12',     label: 'Day rate ÷ 12 hrs' },
                    { value: 'custom', label: 'Custom hourly rate' },
                  ]}
                />
              </Field>
              <Field label="Meal Penalty Rate">
                <CurrencyInput
                  value={mealPenaltyRate}
                  symbol={sym}
                  onChange={(val) => setMealPenaltyRate(parseCurrency(val))}
                  hint="Per 15-min increment"
                />
              </Field>
              <Field label="Meal Break Trigger (hours)">
                <input
                  type="number"
                  value={mealBreakTrigger}
                  min={4}
                  max={8}
                  onChange={(e) => setMealBreakTrigger(parseInt(e.target.value) || 6)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none focus:border-border-light transition-colors"
                />
              </Field>
              <Field label="Minimum Turnaround (hours)">
                <input
                  type="number"
                  value={minTurnaround}
                  min={6}
                  max={16}
                  onChange={(e) => setMinTurnaround(parseInt(e.target.value) || 11)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none focus:border-border-light transition-colors"
                />
              </Field>
              <Field label="Turnaround Violation Rate" hint="Per 15-min increment">
                <CurrencyInput
                  value={turnaroundViolationRate}
                  symbol={sym}
                  onChange={(val) => setTurnaroundViolationRate(parseCurrency(val))}
                />
              </Field>
            </div>

            {/* OT Bands Table */}
            {otApplies !== 'buyout' && (
              <div className="mb-4">
                <div className="text-[9px] font-display font-bold text-text-4 uppercase tracking-widest mb-2">
                  OT Bands
                </div>
                <div className="rounded-lg border border-border overflow-hidden mb-2">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-bg-elevated">
                        <th className="text-left px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px]">From (hrs)</th>
                        <th className="text-left px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px]">To (hrs)</th>
                        <th className="text-left px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px]">Multiplier</th>
                        <th className="text-left px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px]">Notes</th>
                        <th className="text-center px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px] w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {otBands.map((band, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-bg-surface' : 'bg-bg-elevated'}>
                          <td className="px-2 py-1.5">
                            <input
                              type="number"
                              value={band.from}
                              min={0}
                              onChange={(e) => updateOtBand(i, 'from', parseFloat(e.target.value) || 0)}
                              className="w-full bg-bg-hover border border-border rounded px-2 py-1 text-[11px] font-mono text-text-1 focus:outline-none focus:border-border-light"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="number"
                              value={band.to}
                              min={0}
                              onChange={(e) => updateOtBand(i, 'to', parseFloat(e.target.value) || 0)}
                              className="w-full bg-bg-hover border border-border rounded px-2 py-1 text-[11px] font-mono text-text-1 focus:outline-none focus:border-border-light"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="number"
                              step="0.25"
                              value={band.mult}
                              min={0}
                              onChange={(e) => updateOtBand(i, 'mult', parseFloat(e.target.value) || 1)}
                              className="w-full bg-bg-hover border border-border rounded px-2 py-1 text-[11px] font-mono text-gold focus:outline-none focus:border-border-light"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={band.note}
                              onChange={(e) => updateOtBand(i, 'note', e.target.value)}
                              className="w-full bg-bg-hover border border-border rounded px-2 py-1 text-[11px] text-text-3 focus:outline-none focus:border-border-light"
                              placeholder="Description"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <button
                              onClick={() => removeOtBand(i)}
                              className="text-red-400 hover:text-red-300 text-[11px] font-bold"
                              title="Remove band"
                            >
                              x
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={addOtBand}
                  className="px-3 py-1.5 text-[11px] font-display font-bold rounded border border-border-medium bg-bg-hover text-text-2 hover:border-gold hover:text-gold transition-colors"
                >
                  + Add OT Band
                </button>
              </div>
            )}

            {/* Penalty toggles */}
            <div className="border border-border rounded-lg p-3 space-y-3">
              <div className="text-[9px] font-display font-bold text-text-4 uppercase tracking-widest mb-1">
                Penalty Toggles
              </div>
              {[
                { label: '6th Day Premium', value: sixthDayPremium, setter: setSixthDayPremium },
                { label: '7th Day / Bank Holiday Double Time', value: seventhDayDouble, setter: setSeventhDayDouble },
                { label: 'Meal Penalty', value: mealPenaltyToggle, setter: setMealPenaltyToggle },
                { label: 'Turnaround Violation', value: turnaroundViolation, setter: setTurnaroundViolation },
              ].map((t) => (
                <div key={t.label} className="flex items-center justify-between">
                  <span className="text-[11px] text-text-2">{t.label}</span>
                  <Toggle on={t.value} onToggle={() => t.setter(!t.value)} />
                </div>
              ))}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

// ── TERRITORY WORKING RULES CARD ─────────────────────────────

function TerritoryWorkingRulesCard() {
  const { territory } = useDealMemoStore();
  const terr = territory as unknown as TerritoryCode;
  const rules = TERRITORY_RULES[terr] ?? TERRITORY_RULES_FALLBACK;

  const gridCells: { label: string; value: string }[] = [
    { label: 'TURNAROUND', value: rules.turnaround },
    { label: 'MEAL BREAK TRIGGER', value: rules.mealTrigger },
    { label: 'MEAL PENALTY RATE', value: rules.mealPenalty },
    { label: 'MAX AVG WEEK', value: rules.maxWeek },
    { label: '6TH DAY RATE', value: rules.sixthDay },
    { label: '7TH DAY / PUBLIC HOLIDAYS', value: rules.seventhDay },
    { label: 'PUBLIC HOLIDAYS', value: rules.publicHolidays },
    { label: 'MILEAGE RATE', value: rules.mileageRate },
  ];

  return (
    <Card accent="teal" className="mb-4">
      <CardHeader>
        <span className="text-sm font-display font-bold text-text-1">Territory Working Rules</span>
        <Badge variant="teal" className="ml-2">{rules.badge}</Badge>
      </CardHeader>
      <CardBody>
        {/* 2x4 Grid */}
        <div className="grid grid-cols-2 gap-px bg-border rounded-lg overflow-hidden mb-3">
          {gridCells.map((cell) => (
            <div key={cell.label} className="bg-bg-surface px-3 py-2.5">
              <div className="text-[9px] font-display font-bold text-text-4 uppercase tracking-wide mb-1">
                {cell.label}
              </div>
              <div className="text-[12px] font-mono text-teal-400">
                {cell.value}
              </div>
            </div>
          ))}
        </div>

        {/* Notes row */}
        {rules.notes && (
          <div className="bg-bg-hover rounded-lg px-3 py-2 mb-3 text-[11px] text-text-3 leading-relaxed">
            {rules.notes}
          </div>
        )}

        {/* Conditional highlighted rows */}
        <div className="space-y-2">
          {rules.goldTime && (
            <div className="flex items-start gap-3 rounded-lg px-3 py-2.5 bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-[10px] font-display font-bold text-yellow-400 uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">
                Gold Time
              </span>
              <span className="text-[12px] text-yellow-300">{rules.goldTimeNote ?? 'After 14 hrs \u2014 all hours \u00D72.0'}</span>
            </div>
          )}
          {rules.fiftyFourHourRest && (
            <div className="flex items-start gap-3 rounded-lg px-3 py-2.5 bg-blue-500/10 border border-blue-500/20">
              <span className="text-[10px] font-display font-bold text-blue-400 uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">
                54-Hour Rest
              </span>
              <span className="text-[12px] text-blue-300">California crew entitled to 54 consecutive hours off per week</span>
            </div>
          )}
          {rules.superannuation && (
            <div className="flex items-start gap-3 rounded-lg px-3 py-2.5 bg-green-500/10 border border-green-500/20">
              <span className="text-[10px] font-display font-bold text-green-400 uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">
                Superannuation
              </span>
              <span className="text-[12px] text-green-300">{rules.superNote ?? '11.5% employer contribution mandatory'}</span>
            </div>
          )}
        </div>

        {/* Mileage footnote */}
        {rules.mileageNote && (
          <div className="mt-2 text-[9px] text-text-4 italic leading-relaxed">
            Mileage: {rules.mileageNote}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ── FRINGES CARD ─────────────────────────────────────────────

function FringesCard({ weeklyRate, sym }: { weeklyRate: number; sym: string }) {
  const { territory, union, employmentStatusId, rates } = useDealMemoStore();
  const fringeKey = getFringeKey(territory, union, employmentStatusId);
  const pkg = FRINGE_PACKAGES[fringeKey] ?? FRINGE_PACKAGES['default'];
  const hpMode = rates.hpMode as HPMode;

  const visibleItems = pkg.items.filter((item) => {
    if (item.hpExclOnly && hpMode !== 'excl') return false;
    return true;
  });

  const totals = calcFringeTotal({
    weeklyRate,
    fringeItems: visibleItems,
    hpMode,
  });

  return (
    <Card accent="orange" className="mb-4">
      <CardHeader>
        <span className="text-sm font-display font-bold text-text-1">Fringes &amp; Employer Costs</span>
        <Badge variant="orange" className="ml-2">{pkg.badge}</Badge>
      </CardHeader>
      <CardBody>
        {/* Fringe items table */}
        <div className="rounded-lg border border-border overflow-hidden mb-3">
          <table className="w-full text-[11px] table-fixed">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[12%]" />
              <col className="w-[45%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead>
              <tr className="bg-bg-elevated">
                <th className="text-left px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px]">Cost</th>
                <th className="text-right px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px]">Rate / Amount</th>
                <th className="text-left px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px]">Basis</th>
                <th className="text-center px-3 py-2 text-text-3 font-display font-bold uppercase tracking-wide text-[9px]">Type</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-bg-surface' : 'bg-bg-elevated'}>
                  <td className="px-3 py-2 text-text-1">
                    {item.name}
                    {item.hpExclOnly && <span className="ml-1 text-[9px] text-gold">(HP excl only)</span>}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-text-2">
                    {item.rate !== 0 ? `${item.rate}%` : item.flat > 0 ? formatCurrency(item.flat, sym) : '--'}
                  </td>
                  <td className="px-3 py-2 text-text-4 text-[10px] leading-relaxed">
                    {item.basis}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {item.statutory ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-teal-400/15 text-teal-400">
                        Statutory
                      </span>
                    ) : (
                      <span className="text-[9px] text-text-4">Contractual</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="bg-bg-hover border border-border rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-text-2">Percentage-based costs (on {formatCurrency(weeklyRate, sym)}/wk)</span>
            <span className="font-mono text-orange-400">{formatCurrency(totals.pctCost, sym)}/wk</span>
          </div>
          {totals.flatCost > 0 && (
            <div className="flex justify-between text-[12px]">
              <span className="text-text-2">Flat costs per week</span>
              <span className="font-mono text-orange-400">{formatCurrency(totals.flatCost, sym)}/wk</span>
            </div>
          )}
          <div className="flex justify-between text-[13px] font-semibold pt-2 border-t border-border">
            <span className="text-text-1">Total Employer Cost (weekly)</span>
            <span className="font-mono text-gold">{formatCurrency(totals.total, sym)}/wk</span>
          </div>
        </div>

        {/* Total Weekly Cost to Production — breakdown */}
        {(() => {
          const hpCost = hpMode === 'excl' ? weeklyRate * ((TERRITORY_HP_RATES[territory as TerritoryCode]?.pct ?? 12.07) / 100) : 0;
          const totalWeeklyCost = weeklyRate + hpCost + totals.total;
          return (
            <div className="mt-3 bg-bg-surface border-2 border-gold/30 rounded-lg px-4 py-3">
              <div className="flex items-center justify-between text-[11px] text-text-3 mb-1">
                <span>Base weekly rate</span>
                <span className="font-mono">{formatCurrency(weeklyRate, sym)}</span>
              </div>
              {hpCost > 0 && (
                <div className="flex items-center justify-between text-[11px] text-text-3 mb-1">
                  <span>+ HP ({TERRITORY_HP_RATES[territory as TerritoryCode]?.pct ?? 12.07}%)</span>
                  <span className="font-mono">{formatCurrency(hpCost, sym)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[11px] text-text-3 mb-2">
                <span>+ Fringes</span>
                <span className="font-mono">{formatCurrency(totals.total, sym)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gold/20">
                <span className="text-[13px] font-display font-bold text-text-1">Total weekly cost to production</span>
                <span className="text-[16px] font-mono font-bold text-gold">{formatCurrency(totalWeeklyCost, sym)}</span>
              </div>
            </div>
          );
        })()}

        {pkg.note && (
          <div className="mt-3 text-[10px] text-text-4 leading-relaxed">{pkg.note}</div>
        )}
      </CardBody>
    </Card>
  );
}
