// ============================================================
// ZILLIT CODA — DEAL MEMO WIZARD
// Step 5: Allowances & Rentals (Complete)
// ============================================================

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDealMemoStore } from '../../../store/kate/useDealMemoStore';
import {
  Card, CardHeader, CardBody, Alert, Badge, Toggle,
  CurrencyInput, Field, Select,
} from '../../kate-ui/index';
import { CURRENCY_SYMBOLS } from '../../../data/kate/territories';
import { formatCurrency, parseCurrency } from '../../../utils/kate/calculations';
import type { CurrencyCode, TerritoryCode } from '../../../types/kate/dealMemo';

// ── TYPES ────────────────────────────────────────────────────

interface AllowanceItem {
  id: string;
  name: string;
  active: boolean;
  rate: number;
  rate2?: number;            // secondary rate (e.g. non-shoot per diem)
  /** How to render/interpret the rate: 'currency' (£10.00), 'percent' (10%), 'multiplier' (×1.5). Default 'currency'. */
  rateUnit?: 'currency' | 'percent' | 'multiplier';
  frequency: string;
  nominal: string;
  mandatory: boolean;
  isRental?: boolean;
  isCustom?: boolean;
  note?: string;
}

// ── FREQUENCY OPTIONS ────────────────────────────────────────

// Generic fallback set (custom rows only)
const FREQUENCY_OPTIONS = [
  { value: 'per-day',        label: 'Per Day' },
  { value: 'per-shoot',      label: 'Per Shoot Day' },
  { value: 'per-non-shoot',  label: 'Per Non-Shoot Day' },
  { value: 'per-week',       label: 'Per Week' },
  { value: 'pro-rated',      label: 'Per Week (pro-rated)' },
  { value: 'custom',         label: 'Custom days/wk' },
];

// Per-row option sets — Kate's HTML exactly
const MEAL_FREQ = [
  { value: 'per-day',       label: 'Per Day' },
  { value: 'per-shoot',     label: 'Per Shoot Day' },
  { value: 'per-non-shoot', label: 'Per Non-Shoot Day' },
  { value: 'per-week',      label: 'Per Week' },
  { value: 'pro-rated',     label: 'Per Week (pro-rated)' },
  { value: 'custom',        label: 'Custom days/wk' },
];

const MILEAGE_FREQUENCY_OPTIONS = [
  { value: 'per-mile', label: 'Per Mile' },
  { value: 'per-km',   label: 'Per Km' },
  { value: 'per-day',  label: 'Per Day' },
  { value: 'actuals',  label: 'Actuals' },
];

const ACCOMMODATION_FREQUENCY_OPTIONS = [
  { value: 'per-night', label: 'Per Night' },
  { value: 'actuals',   label: 'Actuals' },
  { value: 'capped',    label: 'Capped' },
];

const SUBSISTENCE_FREQ = [
  { value: 'per-day',       label: 'Per Day' },
  { value: 'per-shoot',     label: 'Per Shoot Day' },
  { value: 'per-non-shoot', label: 'Per Non-Shoot Day' },
  { value: 'per-week',      label: 'Per Week' },
];

// Per Diem uses an applies-to scope (not a frequency) — Kate's freq select for this row
const PER_DIEM_FREQ = [
  { value: 'location-only', label: 'Location days only' },
  { value: 'all-days',      label: 'All working days' },
  { value: 'distant-only',  label: 'Distant location only' },
];

// Per-row option sets for Rentals
const KIT_RENTAL_FREQ = [
  { value: 'per-week',  label: 'Per Week' },
  { value: 'per-day',   label: 'Per Day' },
  { value: 'pro-rated', label: 'Per Week (pro-rated)' },
  { value: 'flat',      label: 'Flat (production)' },
];
const VEHICLE_RENTAL_FREQ = [
  { value: 'per-week',  label: 'Per Week' },
  { value: 'per-day',   label: 'Per Day' },
  { value: 'pro-rated', label: 'Per Week (pro-rated)' },
];
const MOBILE_FREQUENCY_OPTIONS = [
  { value: 'per-week',  label: 'Per Week' },
  { value: 'per-month', label: 'Per Month' },
];

// Legacy alias kept for custom rental rows
const RENTAL_FREQUENCY_OPTIONS = KIT_RENTAL_FREQ;

// Per-row frequency option sets for Work Premiums (match Kate's HTML exactly)
const NIGHT_PREMIUM_FREQ = [
  { value: 'per-shoot', label: 'Per Night Shoot Day' },
  { value: 'per-hour',  label: 'Per Hour (after midnight)' },
  { value: 'flat',      label: 'Flat per call' },
];
const HAZARD_PREMIUM_FREQ = [
  { value: 'per-day',  label: 'Per Day (wet/hazard work)' },
  { value: 'per-hour', label: 'Per Hour exposed' },
  { value: 'flat',     label: 'Flat per call' },
];
const SIXTH_DAY_FREQ = [
  { value: 'per-day', label: 'Per 6th day worked' },
];
const DISTANT_PER_DIEM_FREQ = [
  { value: 'per-day',   label: 'Per Location Day' },
  { value: 'per-shoot', label: 'Per Shoot Day' },
  { value: 'per-week',  label: 'Per Week' },
];

function getFrequencyOptionsForPremium(itemId: string) {
  if (itemId === 'wp-night')          return NIGHT_PREMIUM_FREQ;
  if (itemId === 'wp-hazard')         return HAZARD_PREMIUM_FREQ;
  if (itemId === 'wp-sixth')          return SIXTH_DAY_FREQ;
  if (itemId === 'distant-per-diem')  return DISTANT_PER_DIEM_FREQ;
  return FREQUENCY_OPTIONS;
}

function getFrequencyOptionsForItem(itemId: string) {
  if (itemId === 'meal')           return MEAL_FREQ;
  if (itemId === 'mileage')        return MILEAGE_FREQUENCY_OPTIONS;
  if (itemId === 'accommodation')  return ACCOMMODATION_FREQUENCY_OPTIONS;
  if (itemId === 'subsistence')    return SUBSISTENCE_FREQ;
  if (itemId === 'per-diem')       return PER_DIEM_FREQ;
  return FREQUENCY_OPTIONS;
}

function getFrequencyOptionsForRental(itemId: string) {
  if (itemId === 'camera-rental')   return KIT_RENTAL_FREQ;
  if (itemId === 'vehicle-rental')  return VEHICLE_RENTAL_FREQ;
  if (itemId === 'it-rental')       return MOBILE_FREQUENCY_OPTIONS;
  return RENTAL_FREQUENCY_OPTIONS;
}

// Rate format/parse helpers — respect Kate's rate units (currency / percent / multiplier)
function formatRate(item: { rate: number; rateUnit?: 'currency' | 'percent' | 'multiplier'; active: boolean }, sym = '£'): string {
  if (!item.active || !item.rate) return '';
  switch (item.rateUnit) {
    case 'percent':    return `${item.rate}%`;
    case 'multiplier': return `×${item.rate}`;
    case 'currency':
    default:           return item.rate < 1 ? `${item.rate}` : `${sym}${item.rate.toFixed(2)}`;
  }
}

function parseRateByUnit(raw: string, unit?: 'currency' | 'percent' | 'multiplier'): number {
  if (!raw) return 0;
  // Strip any of: % sign, × × X x, currency symbols, whitespace
  const cleaned = raw.replace(/[%×xX£$€A$C$NZ$R\sFtKrkrFr,]/g, '').trim();
  const n = parseFloat(cleaned);
  if (!isFinite(n)) return 0;
  // unit is purely for UI — numeric value stays as-is (10 means 10 whether %, × or £)
  void unit;
  return n;
}

function placeholderForUnit(unit: 'currency' | 'percent' | 'multiplier' | undefined, sym = '£'): string {
  switch (unit) {
    case 'percent':    return '0%';
    case 'multiplier': return '×0';
    case 'currency':
    default:           return `${sym}0.00`;
  }
}

// ── DEFAULT ALLOWANCES ───────────────────────────────────────

function getDefaultAllowances(): AllowanceItem[] {
  return [
    { id: 'meal',          name: 'Meal Allowance',      active: true,  rate: 8.50, rateUnit: 'currency', frequency: 'per-day',        nominal: '4424', mandatory: false },
    { id: 'mileage',       name: 'Travel / Mileage',    active: false, rate: 0.45, rateUnit: 'currency', frequency: 'per-mile',       nominal: '4425', mandatory: false, note: '45p/mile (HMRC approved)' },
    { id: 'accommodation', name: 'Hotel Accommodation', active: false, rate: 0,    rateUnit: 'currency', frequency: 'per-night',      nominal: '4426', mandatory: false },
    { id: 'subsistence',   name: 'Daily Subsistence',   active: false, rate: 25,   rateUnit: 'currency', frequency: 'per-day',        nominal: '4427', mandatory: false },
    { id: 'per-diem',      name: 'Per Diem',            active: false, rate: 35,   rate2: 25, rateUnit: 'currency', frequency: 'location-only', nominal: '4428', mandatory: false, note: 'Shoot day / Non-shoot day split' },
  ];
}

function getDefaultRentals(): AllowanceItem[] {
  return [
    { id: 'camera-rental',  name: 'Kit / Box Rental',        active: false, rate: 350, rateUnit: 'currency', frequency: 'per-week', nominal: '4423', mandatory: false, isRental: true },
    { id: 'vehicle-rental', name: 'Vehicle / Car Allowance', active: false, rate: 75,  rateUnit: 'currency', frequency: 'per-week', nominal: '4429', mandatory: false, isRental: true },
    { id: 'it-rental',      name: 'Mobile Phone Allowance',  active: false, rate: 20,  rateUnit: 'currency', frequency: 'per-week', nominal: '4430', mandatory: false, isRental: true },
  ];
}

// ── SUPER PAYMENT FREQUENCY ──────────────────────────────────

const SUPER_FREQUENCY_OPTIONS = [
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'each-payroll', label: 'Each Payroll Run' },
];

// ── MAIN COMPONENT ───────────────────────────────────────────

export default function Step5Allowances() {
  const store = useDealMemoStore();
  const { territory, union, rates } = store;
  const terr = territory as unknown as TerritoryCode;
  const sym = CURRENCY_SYMBOLS[rates.currency as CurrencyCode] ?? '£';
  const isNonUnion = (union as string).startsWith('nu-');
  const isAustralia = terr === 'au';

  // Local state for allowances and rentals, initialized from store if available
  const [allowances, setAllowances] = useState<AllowanceItem[]>(() => {
    const s = (store as any).allowances;
    const defaults = getDefaultAllowances();
    if (!Array.isArray(s) || s.length === 0) return defaults;
    // Upgrade persisted rows missing rateUnit (pre-parity data) with defaults keyed by id
    return s.map((row: AllowanceItem) => {
      const def = defaults.find((d) => d.id === row.id);
      if (!def) return row;
      return {
        ...row,
        rateUnit: row.rateUnit ?? def.rateUnit,
        // Patch nominal only if it matches an earlier wrong default (e.g. subsistence was 4425, should be 4427)
        nominal: row.nominal && row.nominal !== '4425' ? row.nominal : (row.id === 'subsistence' ? '4427' : row.nominal || def.nominal),
      };
    });
  });
  const [rentals, setRentals] = useState<AllowanceItem[]>(() => {
    const s = (store as any).rentals;
    const defaults = getDefaultRentals();
    if (!Array.isArray(s) || s.length === 0) return defaults;
    return s.map((row: AllowanceItem) => {
      const def = defaults.find((d) => d.id === row.id);
      return def && !row.rateUnit ? { ...row, rateUnit: def.rateUnit ?? 'currency' } : row;
    });
  });

  // Per Diem applies-to
  const [perDiemAppliesTo, setPerDiemAppliesTo] = useState((store as any).perDiemAppliesTo ?? 'location');

  // Penalty toggles (all deal types)
  // Kate's HTML has exactly 3 penalty rows (no 6th/7th Day Penalty here — those are handled in Work Premiums).
  // Rates are free-text strings ("×1.5/hr", "£45.00", "×2.0") to match Kate's UX.
  const [turnaroundPenalty, setTurnaroundPenalty] = useState((store as any).turnaroundPenalty ?? true);
  const [turnaroundPenaltyRate, setTurnaroundPenaltyRate] = useState<string>((store as any).turnaroundPenaltyRate ?? '\u00d71.5/hr');
  const [turnaroundPenaltyNominal, setTurnaroundPenaltyNominal] = useState<string>((store as any).turnaroundPenaltyNominal ?? '4431');
  const [mealBreakPenalty, setMealBreakPenalty] = useState((store as any).mealBreakPenalty ?? true);
  const [mealBreakPenaltyRate, setMealBreakPenaltyRate] = useState<string>((store as any).mealBreakPenaltyRate ?? '\u00a345.00');
  const [mealBreakPenaltyNominal, setMealBreakPenaltyNominal] = useState<string>((store as any).mealBreakPenaltyNominal ?? '4432');
  const [restDayPenalty, setRestDayPenalty] = useState((store as any).restDayPenalty ?? false);
  const [restDayPenaltyRate, setRestDayPenaltyRate] = useState<string>((store as any).restDayPenaltyRate ?? '\u00d72.0');
  const [restDayPenaltyNominal, setRestDayPenaltyNominal] = useState<string>((store as any).restDayPenaltyNominal ?? '4433');

  // Australia superannuation
  const [superFund, setSuperFund] = useState((store as any).superFund ?? '');
  const [superFrequency, setSuperFrequency] = useState((store as any).superFrequency ?? 'quarterly');

  // Sync local state to store
  useEffect(() => {
    store.update({ allowances } as any);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowances]);

  useEffect(() => {
    store.update({ rentals } as any);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rentals]);

  useEffect(() => {
    store.update({
      turnaroundPenalty, turnaroundPenaltyRate, turnaroundPenaltyNominal,
      mealBreakPenalty, mealBreakPenaltyRate, mealBreakPenaltyNominal,
      restDayPenalty, restDayPenaltyRate, restDayPenaltyNominal,
    } as any);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnaroundPenalty, turnaroundPenaltyRate, turnaroundPenaltyNominal, mealBreakPenalty, mealBreakPenaltyRate, mealBreakPenaltyNominal, restDayPenalty, restDayPenaltyRate, restDayPenaltyNominal]);

  useEffect(() => {
    store.update({ superFund, superFrequency } as any);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [superFund, superFrequency]);

  useEffect(() => {
    store.update({ perDiemAppliesTo } as any);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perDiemAppliesTo]);

  // ── HANDLERS ─────────────────────────────────────────────

  const updateAllowance = useCallback((id: string, patch: Partial<AllowanceItem>) => {
    setAllowances((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const updateRental = useCallback((id: string, patch: Partial<AllowanceItem>) => {
    setRentals((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const removeAllowance = useCallback((id: string) => {
    setAllowances((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const removeRental = useCallback((id: string) => {
    setRentals((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addCustomAllowance = useCallback(() => {
    const newId = `custom-allow-${Date.now()}`;
    setAllowances((prev) => [
      ...prev,
      { id: newId, name: '', active: true, rate: 0, frequency: 'per-day', nominal: '', mandatory: false, isCustom: true },
    ]);
  }, []);

  const addCustomRental = useCallback(() => {
    const newId = `custom-rental-${Date.now()}`;
    setRentals((prev) => [
      ...prev,
      { id: newId, name: '', active: true, rate: 0, frequency: 'per-week', nominal: '', mandatory: false, isRental: true, isCustom: true },
    ]);
  }, []);

  // Work premiums — values match Kate's HTML exactly (rate unit + per-row frequency + nominal)
  const [workPremiums, setWorkPremiums] = useState<AllowanceItem[]>(() => {
    const s = (store as any).workPremiums;
    const defaults: AllowanceItem[] = [
      { id: 'wp-night',         name: 'Night Shoot Premium',             active: false, rate: 10,  rateUnit: 'percent',    frequency: 'per-shoot', nominal: '4435', mandatory: false },
      { id: 'wp-hazard',        name: 'Wet / Hazardous Work Premium',    active: false, rate: 25,  rateUnit: 'percent',    frequency: 'per-day',   nominal: '4436', mandatory: false },
      { id: 'wp-sixth',         name: '6th Day Supplement (where not in OT)', active: false, rate: 1.5, rateUnit: 'multiplier', frequency: 'per-day', nominal: '4437', mandatory: false },
      { id: 'distant-per-diem', name: 'Distant Location Per Diem',       active: false, rate: 35,  rateUnit: 'currency',   frequency: 'per-day',   nominal: '4438', mandatory: false },
    ];
    if (!Array.isArray(s) || s.length === 0) return defaults;
    // Upgrade any persisted row missing rateUnit (pre-parity rows) by matching id
    return s.map((row: AllowanceItem) => {
      const def = defaults.find((d) => d.id === row.id);
      return def && !row.rateUnit ? { ...row, rateUnit: def.rateUnit, nominal: row.nominal || def.nominal } : row;
    });
  });

  useEffect(() => {
    store.update({ workPremiums } as any);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workPremiums]);

  const updatePremium = useCallback((id: string, patch: Partial<AllowanceItem>) => {
    setWorkPremiums((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const removePremium = useCallback((id: string) => {
    setWorkPremiums((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addCustomPremium = useCallback(() => {
    const newId = `custom-wp-${Date.now()}`;
    setWorkPremiums((prev) => [
      ...prev,
      { id: newId, name: '', active: true, rate: 0, frequency: 'per-day', nominal: '', mandatory: false, isCustom: true },
    ]);
  }, []);

  // Active totals
  const activeAllowanceCount = allowances.filter((a) => a.active).length;
  const activeRentalCount = rentals.filter((r) => r.active).length;
  const activePremiumCount = workPremiums.filter((p) => p.active).length;

  // ── RENDER ─────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-[10px] font-display font-bold text-text-4 uppercase tracking-widest mb-1">
          Step 5 of 10
        </div>
        <h1 className="text-[22px] font-display font-bold text-text-1 mb-1">
          Allowances &amp; Rentals
        </h1>
        <p className="text-[13px] text-text-2">
          Configure per diem, meal allowances, equipment rentals, and other supplementary payments. Toggle items on/off as applicable to this deal.
        </p>
      </div>

      {/* ── 5A: ALLOWANCES GRID ── */}
      <Card accent="gold" className="mb-4">
        <CardHeader>
          <span className="text-sm font-display font-bold text-text-1">Allowances</span>
          <Badge variant="gold" className="ml-2">{activeAllowanceCount} active</Badge>
        </CardHeader>
        <CardBody>
          <div className="space-y-1">
            {/* Header row */}
            <div className="grid grid-cols-[40px_1fr_120px_140px_90px_36px_32px] gap-2 px-2 py-1.5 text-[9px] font-display font-bold text-text-4 uppercase tracking-widest">
              <div></div>
              <div>Allowance</div>
              <div>Rate</div>
              <div>Frequency</div>
              <div>Nominal</div>
              <div>Req'd</div>
              <div></div>
            </div>

            {allowances.map((item) => (
              <AllowanceRow
                key={item.id}
                item={item}
                sym={sym}
                frequencyOptions={getFrequencyOptionsForItem(item.id)}
                onUpdate={(patch) => updateAllowance(item.id, patch)}
                onRemove={item.isCustom ? () => removeAllowance(item.id) : undefined}
                onToggleMandatory={() => updateAllowance(item.id, { mandatory: !item.mandatory })}
                perDiemAppliesTo={item.id === 'per-diem' ? perDiemAppliesTo : undefined}
                onPerDiemAppliesTo={item.id === 'per-diem' ? setPerDiemAppliesTo : undefined}
              />
            ))}
          </div>

          {/* Add custom */}
          <button
            onClick={addCustomAllowance}
            className="mt-3 flex items-center gap-1.5 text-[11px] text-gold hover:text-gold/80 transition-colors"
          >
            <span className="text-[14px]">+</span> Add Custom Allowance
          </button>
        </CardBody>
      </Card>

      {/* ── 5B: EQUIPMENT RENTALS ── */}
      <Card accent="blue" className="mb-4">
        <CardHeader>
          <span className="text-sm font-display font-bold text-text-1">Equipment Rentals / Box Rental</span>
          <Badge variant="blue" className="ml-2">{activeRentalCount} active</Badge>
        </CardHeader>
        <CardBody>
          <div className="space-y-1">
            {/* Header row */}
            <div className="grid grid-cols-[40px_1fr_120px_140px_90px_36px_32px] gap-2 px-2 py-1.5 text-[9px] font-display font-bold text-text-4 uppercase tracking-widest">
              <div></div>
              <div>Item</div>
              <div>Rate</div>
              <div>Frequency</div>
              <div>Nominal</div>
              <div>Req'd</div>
              <div></div>
            </div>

            {rentals.map((item) => (
              <AllowanceRow
                key={item.id}
                item={item}
                sym={sym}
                frequencyOptions={getFrequencyOptionsForRental(item.id)}
                onUpdate={(patch) => updateRental(item.id, patch)}
                onRemove={item.isCustom ? () => removeRental(item.id) : undefined}
                onToggleMandatory={() => updateRental(item.id, { mandatory: !item.mandatory })}
              />
            ))}
          </div>

          <button
            onClick={addCustomRental}
            className="mt-3 flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span className="text-[14px]">+</span> Add Custom Rental
          </button>
        </CardBody>
      </Card>

      {/* ── 5B2: WORK PREMIUMS ── */}
      <Card accent="orange" className="mb-4">
        <CardHeader>
          <span className="text-sm font-display font-bold text-text-1">Work Premiums</span>
          <Badge variant="orange" className="ml-2">{activePremiumCount} active</Badge>
        </CardHeader>
        <CardBody>
          <div className="space-y-1">
            {/* Header row */}
            <div className="grid grid-cols-[40px_1fr_120px_140px_90px_36px_32px] gap-2 px-2 py-1.5 text-[9px] font-display font-bold text-text-4 uppercase tracking-widest">
              <div></div>
              <div>Premium</div>
              <div>Rate</div>
              <div>Basis</div>
              <div>Nominal</div>
              <div>Req'd</div>
              <div></div>
            </div>

            {workPremiums.map((item) => (
              <AllowanceRow
                key={item.id}
                item={item}
                sym={sym}
                frequencyOptions={getFrequencyOptionsForPremium(item.id)}
                onUpdate={(patch) => updatePremium(item.id, patch)}
                onRemove={item.isCustom ? () => removePremium(item.id) : undefined}
                onToggleMandatory={() => updatePremium(item.id, { mandatory: !item.mandatory })}
              />
            ))}
          </div>

          <button
            onClick={addCustomPremium}
            className="mt-3 flex items-center gap-1.5 text-[11px] text-orange-400 hover:text-orange-300 transition-colors"
          >
            <span className="text-[14px]">+</span> Add Custom Premium
          </button>
        </CardBody>
      </Card>

      {/* ── 5C: PENALTIES ── (matches Kate's HTML: 3 rows, toggle on LEFT, free-text rate) */}
      <Card accent="orange" className="mb-4">
        <CardHeader>
          <span className="text-sm font-display font-bold text-text-1">Penalties</span>
          <span className="ml-auto text-[11px] text-text-3">
            Penalties are separate from allowances &mdash; auto-calculated on timecards
          </span>
        </CardHeader>
        <CardBody>
          <div className="divide-y divide-border">
            {/* Turnaround Violation Penalty */}
            <PenaltyRow
              active={turnaroundPenalty}
              onToggle={() => setTurnaroundPenalty(!turnaroundPenalty)}
              name="Turnaround Violation Penalty"
              description="Auto-calc on timecard when turnaround < contracted minimum"
              rate={turnaroundPenaltyRate}
              onRate={setTurnaroundPenaltyRate}
              nominal={turnaroundPenaltyNominal}
              onNominal={setTurnaroundPenaltyNominal}
              ratePlaceholder="Rate"
            />

            {/* Meal Break Penalty (MPE) */}
            <PenaltyRow
              active={mealBreakPenalty}
              onToggle={() => setMealBreakPenalty(!mealBreakPenalty)}
              name="Meal Break Penalty (MPE)"
              description="Per violation when meal break exceeds contracted trigger"
              rate={mealBreakPenaltyRate}
              onRate={setMealBreakPenaltyRate}
              nominal={mealBreakPenaltyNominal}
              onNominal={setMealBreakPenaltyNominal}
              ratePlaceholder="Per violation"
            />

            {/* Rest Day Penalty */}
            <PenaltyRow
              active={restDayPenalty}
              onToggle={() => setRestDayPenalty(!restDayPenalty)}
              name="Rest Day Penalty"
              description="If 7th consecutive day is worked (above agreed rate)"
              rate={restDayPenaltyRate}
              onRate={setRestDayPenaltyRate}
              nominal={restDayPenaltyNominal}
              onNominal={setRestDayPenaltyNominal}
              ratePlaceholder="Rate"
            />
          </div>
        </CardBody>
      </Card>

      {/* ── 5D: AUSTRALIA SUPERANNUATION ── */}
      {isAustralia && (
        <Card accent="green" className="mb-4">
          <CardHeader>
            <span className="text-sm font-display font-bold text-text-1">Superannuation</span>
            <Badge variant="green" className="ml-2">Mandatory</Badge>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <Field label="SG Rate" hint="FY2024-25. Rises to 12% from 1 July 2025.">
                <div className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-green-400">
                  11.5%
                </div>
              </Field>
              <Field label="Superannuation Fund">
                <input
                  type="text"
                  value={superFund}
                  onChange={(e) => setSuperFund(e.target.value)}
                  placeholder="e.g. AustralianSuper"
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none focus:border-border-light transition-colors"
                />
              </Field>
              <Field label="Payment Frequency">
                <Select
                  value={superFrequency}
                  onChange={setSuperFrequency}
                  options={SUPER_FREQUENCY_OPTIONS}
                />
              </Field>
            </div>
            <Alert variant="green" className="text-[11px]">
              Superannuation Guarantee is a mandatory employer cost IN ADDITION to agreed rate. Late payments attract SGC at 10% p.a. Super must be paid to the nominated fund by the quarterly due date.
            </Alert>
            <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-border">
              <span className="text-[11px] text-text-2">Estimated Weekly Super Cost</span>
              <span className="font-mono text-[13px] text-green-400">{formatCurrency((rates.weeklyRate ?? 0) * 11.5 / 100, sym)}</span>
            </div>
          </CardBody>
        </Card>
      )}

    </div>
  );
}

// ── ALLOWANCE ROW COMPONENT ──────────────────────────────────

function AllowanceRow({
  item,
  sym,
  frequencyOptions,
  onUpdate,
  onRemove,
  onToggleMandatory,
  perDiemAppliesTo,
  onPerDiemAppliesTo,
}: {
  item: AllowanceItem;
  sym: string;
  frequencyOptions: { value: string; label: string }[];
  onUpdate: (patch: Partial<AllowanceItem>) => void;
  onRemove?: () => void;
  onToggleMandatory?: () => void;
  perDiemAppliesTo?: string;
  onPerDiemAppliesTo?: (val: string) => void;
}) {
  return (
    <div
      className={`grid grid-cols-[40px_1fr_120px_140px_90px_36px_32px] gap-2 px-2 py-2 rounded-lg transition-colors ${
        item.active ? 'bg-bg-surface border border-border' : 'bg-bg opacity-60 border border-transparent'
      }`}
    >
      {/* Toggle */}
      <div className="flex items-center justify-center">
        <Toggle on={item.active} onToggle={() => onUpdate({ active: !item.active })} />
      </div>

      {/* Name */}
      <div className="flex flex-col justify-center">
        {item.isCustom ? (
          <input
            type="text"
            value={item.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Allowance name..."
            className="bg-transparent text-[12px] text-text-1 focus:outline-none border-b border-border-light pb-0.5"
          />
        ) : (
          <div className="text-[12px] text-text-1 font-medium">
            {item.name}
          </div>
        )}
        {item.note && <div className="text-[9px] text-text-4 mt-0.5">{item.note}</div>}
        {/* Per Diem split display */}
        {item.id === 'per-diem' && item.active && item.rate2 !== undefined && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[9px] text-text-4">Shoot:</span>
            <input
              type="number"
              value={item.rate}
              onChange={(e) => onUpdate({ rate: parseFloat(e.target.value) || 0 })}
              className="w-16 bg-bg-elevated border border-border rounded px-1.5 py-0.5 text-[11px] font-mono text-text-1 focus:outline-none focus:border-border-light"
            />
            <span className="text-[9px] text-text-4">Non-shoot:</span>
            <input
              type="number"
              value={item.rate2}
              onChange={(e) => onUpdate({ rate2: parseFloat(e.target.value) || 0 })}
              className="w-16 bg-bg-elevated border border-border rounded px-1.5 py-0.5 text-[11px] font-mono text-text-1 focus:outline-none focus:border-border-light"
            />
          </div>
        )}
      </div>

      {/* Rate */}
      <div className="flex items-center">
        {item.id !== 'per-diem' ? (
          <input
            type="text"
            value={formatRate(item, sym)}
            onChange={(e) => onUpdate({ rate: parseRateByUnit(e.target.value, item.rateUnit) })}
            placeholder={placeholderForUnit(item.rateUnit, sym)}
            disabled={!item.active}
            className="w-full bg-bg-elevated border border-border rounded-lg px-2 py-1.5 text-[11px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors disabled:opacity-40"
          />
        ) : (
          <span className="text-[11px] font-mono text-text-3">Split rate</span>
        )}
      </div>

      {/* Frequency */}
      <div className="flex items-center">
        <select
          value={item.frequency}
          onChange={(e) => onUpdate({ frequency: e.target.value })}
          disabled={!item.active}
          className="w-full bg-bg-elevated border border-border rounded-lg px-2 py-1.5 text-[10px] text-text-1 focus:outline-none focus:border-border-light transition-colors disabled:opacity-40"
        >
          {frequencyOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Nominal Code */}
      <div className="flex items-center">
        <input
          type="text"
          value={item.nominal}
          onChange={(e) => onUpdate({ nominal: e.target.value })}
          placeholder="Code"
          disabled={!item.active}
          className="w-full bg-bg-elevated border border-border rounded-lg px-2 py-1.5 text-[10px] font-mono text-text-2 focus:outline-none focus:border-border-light transition-colors disabled:opacity-40"
        />
      </div>

      {/* REQ toggle */}
      <div className="flex items-center justify-center">
        {onToggleMandatory ? (
          <button
            onClick={onToggleMandatory}
            className={`px-1.5 py-1 rounded text-[8px] font-bold uppercase tracking-wide transition-colors ${
              item.mandatory
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'bg-bg-elevated text-text-4 border border-transparent hover:text-text-3 hover:border-border'
            }`}
            title={item.mandatory ? 'Mandatory — click to make optional' : 'Optional — click to make mandatory'}
          >
            REQ
          </button>
        ) : (
          <span className="w-4" />
        )}
      </div>

      {/* Delete button */}
      <div className="flex items-center justify-center">
        {onRemove ? (
          <button
            onClick={onRemove}
            className="text-red-400/60 hover:text-red-400 transition-colors text-[14px]"
            title="Remove"
          >
            x
          </button>
        ) : (
          <span className="w-4" />
        )}
      </div>
    </div>
  );
}

// ── PENALTY ROW ──────────────────────────────────────────────
// Kate's HTML: [toggle-on-left] [name] [description (flex)] [free-text rate] [nominal]

function PenaltyRow({
  active, onToggle, name, description,
  rate, onRate, nominal, onNominal, ratePlaceholder,
}: {
  active: boolean;
  onToggle: () => void;
  name: string;
  description: string;
  rate: string;
  onRate: (v: string) => void;
  nominal: string;
  onNominal: (v: string) => void;
  ratePlaceholder?: string;
}) {
  return (
    <div className={`flex items-center gap-3 px-2 py-3 transition-opacity ${active ? '' : 'opacity-60'}`}>
      <Toggle on={active} onToggle={onToggle} />
      <span className="text-[12px] text-text-1 font-medium flex-shrink-0">{name}</span>
      <span className="text-[10px] text-text-3 flex-1">{description}</span>
      <input
        type="text"
        value={rate}
        onChange={(e) => onRate(e.target.value)}
        placeholder={ratePlaceholder ?? 'Rate'}
        disabled={!active}
        className="w-20 bg-bg-elevated border border-border rounded-lg px-2 py-1.5 text-[11px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors disabled:opacity-50"
      />
      <input
        type="text"
        value={nominal}
        onChange={(e) => onNominal(e.target.value)}
        placeholder="Nom."
        disabled={!active}
        className="w-16 bg-bg-elevated border border-border rounded-lg px-2 py-1.5 text-[10px] font-mono text-text-2 focus:outline-none focus:border-border-light transition-colors disabled:opacity-50"
      />
    </div>
  );
}
