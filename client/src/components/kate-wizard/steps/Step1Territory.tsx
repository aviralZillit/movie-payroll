// ============================================================
// ZILLIT CODA — Step 1: Territory & Union Selection
// Full implementation with all conditional sections
// ============================================================

import { useDealMemoStore } from '../../../store/kate/useDealMemoStore';
import { TERRITORIES } from '../../../data/kate/territories';
import { PACT_BANDS } from '../../../data/kate/pactBands';
import { EMPLOYMENT_STATUSES } from '../../../data/kate/employmentStatus';
import { Card, CardHeader, CardBody, Alert, Badge, Field, Select, Toggle } from '../kate-ui/index';
import type { TerritoryCode, UnionId } from '../../../types/kate/dealMemo';
import type { TerritoryCode as EmpTerritoryCode } from '../../../data/kate/employmentStatus';

// ── Territory grid data ──────────────────────────────────────

const TERRITORY_CARDS: { code: TerritoryCode; flag: string; curr: string }[] = [
  { code: 'uk', flag: '\u{1F1EC}\u{1F1E7}', curr: 'GBP' },
  { code: 'us', flag: '\u{1F1FA}\u{1F1F8}', curr: 'USD' },
  { code: 'ie', flag: '\u{1F1EE}\u{1F1EA}', curr: 'EUR' },
  { code: 'hu', flag: '\u{1F1ED}\u{1F1FA}', curr: 'EUR' },
  { code: 'au', flag: '\u{1F1E6}\u{1F1FA}', curr: 'AUD' },
  { code: 'ca', flag: '\u{1F1E8}\u{1F1E6}', curr: 'CAD' },
  { code: 'de', flag: '\u{1F1E9}\u{1F1EA}', curr: 'EUR' },
  { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', curr: 'EUR' },
  { code: 'it', flag: '\u{1F1EE}\u{1F1F9}', curr: 'EUR' },
  { code: 'fr', flag: '\u{1F1EB}\u{1F1F7}', curr: 'EUR' },
  { code: 'nz', flag: '\u{1F1F3}\u{1F1FF}', curr: 'NZD' },
  { code: 'za', flag: '\u{1F1FF}\u{1F1E6}', curr: 'ZAR' },
  { code: 'other', flag: '\u{1F310}', curr: 'Multi' },
];

const CONTRACTING_ENTITIES = [
  { value: 'gilded-uk', label: 'Gilded Hour Films Ltd (UK)' },
  { value: 'gilded-ie', label: 'Gilded Hour Films DAC (Ireland)' },
  { value: 'gilded-us', label: 'Gilded Hour Films LLC (US)' },
  { value: 'gilded-hu', label: 'Gilded Hour Kft (Hungary)' },
];

const PRODUCTION_TYPES = [
  { value: 'scripted-tv', label: 'Scripted TV (PACT/BECTU 2023)' },
  { value: 'drama', label: 'Drama / Long-form' },
  { value: 'factual', label: 'Factual / Documentary' },
  { value: 'feature', label: 'Feature Film' },
  { value: 'commercial', label: 'Commercial / Advertising' },
  { value: 'other', label: 'Other' },
];

const CANADA_PROVINCES = [
  { value: 'bc',       label: 'British Columbia' },
  { value: 'ontario',  label: 'Ontario' },
  { value: 'quebec',   label: 'Québec' },
  { value: 'alberta',  label: 'Alberta' },
  { value: 'other',    label: 'Other Province' },
];

const CANADA_PROVINCE_NOTES: Record<string, string> = {
  bc: 'IATSE Local 891 (BC). DGC BC. BC Employment Standards Act applies. OT after 8hrs/day.',
  ontario: 'IATSE Local 873 (Toronto). DGC Ontario. ESA 2000 applies. OT after 44hrs/week.',
  quebec: 'AQTIS (Quebec). CNT labour standards. French language requirements may apply.',
  alberta: 'IATSE Local 212 (Alberta). Alberta Employment Standards Code. OT after 8hrs/day.',
  other: 'Check applicable provincial employment standards and union locals.',
};

const MMP_COMPARISON_ROWS: { area: string; mmp: string; tv: string }[] = [
  { area: 'Camera OT',       mmp: '2T (min \u00a325, max \u00a381.82/hr)',               tv: 'All OT 1.5T (min \u00a335, max \u00a370/hr)' },
  { area: 'Pre-dawn',        mmp: 'Before 05:00 \u2192 2T',                         tv: 'Early Call before 06:00 \u2192 1.5T (not OT)' },
  { area: 'Night Work',      mmp: 'Past midnight \u2192 \u00a320 + turnaround day',      tv: 'Past 11pm \u2192 compensatory rest or +1T' },
  { area: 'Bank Holidays',   mmp: 'Paid when not working (all grades)',         tv: 'When not working: Band 4 only' },
  { area: 'Weekly Structure', mmp: '55-hr week, hourly = weekly \u00f7 55 (daily \u00f7 11)', tv: '10 contracted hrs, hourly = daily \u00f7 10' },
  { area: 'Meal Break',      mmp: 'After 5.5 hrs (30 min minimum)',            tv: 'After 6 hrs (30 min minimum)' },
  { area: '6th Day',         mmp: '6th consecutive \u2192 \u00d71.5 (shooting), min 8 hrs', tv: '6th consecutive \u2192 \u00d71.5, entire day rate' },
  { area: 'Turnaround',      mmp: '11 hrs (reduced to 9 hrs with consent)',     tv: '11 hrs continuous rest' },
];

const MMP_BUDGET_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed \u2265 \u00a330m (MMP agreement applies)' },
  { value: 'pending', label: 'Budget pending confirmation' },
  { value: 'below', label: 'Below \u00a330m threshold \u2014 MMP does not apply' },
];

export default function Step1Territory() {
  const store = useDealMemoStore();
  const territory = store.territory as TerritoryCode;
  const union = store.union as UnionId;
  const territoryData = TERRITORIES[territory] || TERRITORIES.uk;

  const handleTerritorySelect = (code: TerritoryCode) => {
    const t = TERRITORIES[code];
    const firstUnion = t.unions[0]?.id || ('nu-' + code) as UnionId;
    // Resolve default employment status for new territory
    const empStatuses = EMPLOYMENT_STATUSES[code as EmpTerritoryCode] || EMPLOYMENT_STATUSES.other;
    const firstEmpStatus = empStatuses[0]?.id || 'paye';

    store.update({
      territory: code,
      union: firstUnion,
      pactBand: '',
      pactSpecialDept: false,
      mmpBudgetConfirm: '',
      mmpHighEarner: false,
      department: '',
      jobTitle: '',
      customJobTitle: '',
      employmentStatusId: firstEmpStatus,
      ukTravelZone: code === 'uk' ? '30mile' : '',
      rates: {
        ...store.rates,
        currency: t.curr,
        paymentCurrency: t.curr,
      },
    });
  };

  const handleUnionSelect = (uid: UnionId) => {
    store.update({
      union: uid,
      pactBand: '',
      pactSpecialDept: false,
      mmpBudgetConfirm: '',
      mmpHighEarner: false,
      department: '',
      jobTitle: '',
      customJobTitle: '',
    });
  };

  return (
    <div className="space-y-4">
      {/* Page heading */}
      <div>
        <div className="text-[10px] font-display font-bold text-text-4 uppercase tracking-widest mb-1">Step 1 of 10</div>
        <h1 className="text-[22px] font-display font-bold text-text-1 mb-1">Territory &amp; Union</h1>
        <p className="text-[13px] text-text-2">Select the production entity, territory, union agreement, and schedule parameters.</p>
      </div>

      {/* ── 1A + 1B: Entity + Production Type (combined) ─── */}
      <Card accent="gold">
        <CardHeader>
          <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">Production Setup</span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contracting Entity" required>
              <Select
                value={store.entity || ''}
                onChange={(v) => store.update({ entity: v })}
                options={CONTRACTING_ENTITIES}
                placeholder="Select entity…"
              />
            </Field>
            <Field label="Production Type" required>
              <Select
                value={store.productionType || ''}
                onChange={(v) => store.update({ productionType: v })}
                options={PRODUCTION_TYPES}
                placeholder="Select type…"
              />
            </Field>
          </div>
        </CardBody>
      </Card>

      {/* ── 1C: Territory Grid ────────────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">1C. Territory</span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-2.5 lg:grid-cols-4">
            {TERRITORY_CARDS.map((tc) => {
              const tData = TERRITORIES[tc.code];
              const isSelected = territory === tc.code;
              return (
                <button
                  key={tc.code}
                  type="button"
                  onClick={() => handleTerritorySelect(tc.code)}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'border-gold bg-gold/10'
                      : 'border-border bg-bg-elevated hover:border-border-light'
                  }`}
                >
                  <span className="text-xl">{tc.flag}</span>
                  <span className="text-[10px] font-display text-text-1 leading-tight">{tData.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                    isSelected ? 'bg-gold/20 text-gold' : 'bg-bg-hover text-text-3'
                  }`}>
                    {tc.curr}
                  </span>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* ── 1D: Canada Province (conditional) ─────────────── */}
      {territory === 'ca' && (
        <Card accent="gold">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">Province</span>
              <Badge variant="blue">OT &amp; HP rates vary by province</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <Field label="Province of Work" required>
              <Select
                value={store.caProvince || ''}
                onChange={(v) => store.update({ caProvince: v })}
                options={CANADA_PROVINCES}
                placeholder="Select province…"
              />
            </Field>
            {store.caProvince && CANADA_PROVINCE_NOTES[store.caProvince] && (
              <div className="mt-2 text-[11px] text-text-2 leading-relaxed">
                {CANADA_PROVINCE_NOTES[store.caProvince]}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* ── Union / Agreement ─────────────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">Union / Agreement</span>
            <Badge variant="gold">{territoryData.badge}</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {territoryData.unions.map((u) => {
              const isSelected = union === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleUnionSelect(u.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 ${
                    isSelected
                      ? 'border-gold bg-gold/10 shadow-[0_0_0_1px_rgba(232,184,75,0.15)]'
                      : 'border-border bg-bg-elevated hover:border-border-light hover:bg-bg-hover/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-all ${
                      isSelected ? 'border-gold bg-gold' : 'border-border'
                    }`} />
                    <div>
                      <div className="text-[12px] font-display font-semibold text-text-1">{u.name}</div>
                      <div className="text-[10px] text-text-3 mt-0.5 leading-relaxed">{u.sub}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* ── 1F: PACT Budget Band (UK + pact-bectu) ────────── */}
      {territory === 'uk' && union === 'pact-bectu' && (
        <Card accent="gold">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">
                PACT/BECTU Budget Band
              </span>
              <Badge variant="red">Mandatory on deal memo &mdash; Clause 3.3</Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Info alert */}
            <Alert variant="blue">
              Budget Band is based on the budgeted cost per broadcast hour (excluding breakage). The Producer must notify each Worker of the applicable Band in their Deal Memo. Note: shooting day types (SWD / SCWD / CWD) are determined daily by the schedule and are not specified on the deal memo.
            </Alert>

            {/* Select dropdown for budget band */}
            <Field label="Budget Band" required hint={!store.pactBand ? 'Select a budget band to see its implications' : undefined}>
              <Select
                value={store.pactBand}
                onChange={(v) => store.update({ pactBand: v })}
                options={[
                  { value: '1', label: 'Band 1 — up to £1,250,000 per broadcast hour' },
                  { value: '2', label: 'Band 2 — £1,250,000 – £3,000,000 per broadcast hour' },
                  { value: '3', label: 'Band 3 — £3,000,000 – £8,000,000 per broadcast hour' },
                  { value: '4', label: 'Band 4 — above £8,000,000 per broadcast hour' },
                ]}
                placeholder="— Select Band —"
              />
            </Field>

            {/* Band cards grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {PACT_BANDS.map((band) => {
                const isSelected = store.pactBand === String(band.band);
                return (
                  <button
                    key={band.band}
                    type="button"
                    onClick={() => store.update({ pactBand: String(band.band) })}
                    className={`text-left px-3.5 py-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-gold bg-gold/10'
                        : 'border-border bg-bg-elevated hover:border-border-light'
                    }`}
                  >
                    <div className="text-[11px] font-display font-semibold text-text-1">{band.label}</div>
                    <div className="text-[9px] text-text-3 mt-0.5">{band.budgetRange}</div>
                    <div className="text-[9px] text-text-4 mt-1 font-mono">
                      OT: &pound;{band.otMin}&ndash;&pound;{band.otMax}/hr
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Special Department toggle */}
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-text-2 font-display">Special Department (enhanced rates apply)</div>
                  <div className="text-[10px] text-text-4 leading-relaxed mt-0.5">
                    ADs, Costume, Hair &amp; Make-Up, Locations, Production, Script Supervisors. Additional Contracted Hour paid at Hourly Rate &mdash; not OT. Guaranteed even if fewer hours worked.
                  </div>
                </div>
                <Toggle
                  on={!!store.pactSpecialDept}
                  onToggle={() => store.update({ pactSpecialDept: !store.pactSpecialDept })}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ── 1G: MMP Budget Confirmation (UK + pact-mmp) ───── */}
      {territory === 'uk' && union === 'pact-mmp' && (
        <Card accent="teal">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">
                PACT / BECTU — Major Motion Picture 2021
              </span>
              <Badge variant="teal">Feature Film / Single SVOD — Budget ≥ £30m</Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <Alert variant="blue">
              MMP 2021 applies to feature films for cinematic exhibition, or a single theatric-type piece for a global SVOD platform, with a total production budget of at least £30,000,000. Shooting day types (SWD / SCWD / CWD) are determined daily by the production schedule.
            </Alert>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Production Budget Confirmation" required>
                <Select
                  value={store.mmpBudgetConfirm || ''}
                  onChange={(v) => store.update({ mmpBudgetConfirm: v })}
                  options={MMP_BUDGET_OPTIONS}
                  placeholder="Select…"
                />
              </Field>
              <Field label="High Earner Grade?" required hint="Applies to: 1st AD, DOP, Editor, Producer, Production Designer, PM/UPM, Set Decorator, VFX Supervisor and others.">
                <Select
                  value={store.mmpHighEarner ? 'yes' : 'no'}
                  onChange={(v) => store.update({ mmpHighEarner: v === 'yes' })}
                  options={[
                    { value: 'no', label: 'Standard OT applies (weekly rate ≤ £3,000)' },
                    { value: 'yes', label: 'High Earner — OT negotiated case-by-case (weekly rate > £3,000)' },
                  ]}
                />
              </Field>
            </div>

            {/* MMP vs Scripted TV comparison grid */}
            <div className="mt-4 p-3 bg-bg-hover border border-border rounded-lg">
              <div className="text-[9px] font-display font-bold text-text-4 uppercase tracking-widest mb-2">
                Key differences — MMP vs Scripted TV
              </div>
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 pr-2 text-text-4 font-display font-semibold uppercase tracking-wider text-[9px]">Area</th>
                    <th className="text-left py-1.5 px-2 text-teal font-display font-semibold uppercase tracking-wider text-[9px]">MMP</th>
                    <th className="text-left py-1.5 pl-2 text-gold font-display font-semibold uppercase tracking-wider text-[9px]">Scripted TV</th>
                  </tr>
                </thead>
                <tbody>
                  {MMP_COMPARISON_ROWS.map((row) => (
                    <tr key={row.area} className="border-b border-border/50">
                      <td className="py-1.5 pr-2 text-text-2 font-semibold">{row.area}</td>
                      <td className="py-1.5 px-2 text-text-3 bg-teal/5 rounded-sm">{row.mmp}</td>
                      <td className="py-1.5 pl-2 text-text-3 bg-gold/5 rounded-sm">{row.tv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ── 1H: Non-Union Panel ───────────────────────────── */}
      {union.startsWith('nu-') && (
        <Card accent="orange">
          <CardHeader>
            <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">
              Non-Union &mdash; Production-Defined Rules
            </span>
          </CardHeader>
          <CardBody className="space-y-4">
            <Alert variant="gold">
              No collective agreement applies. Rates are production-defined. Ensure compliance with local minimum wage and working time regulations.
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Standard Day Rate (min)">
                <input
                  type="number"
                  value={store.nonUnionRules?.dayRate ?? 0}
                  onChange={(e) => store.update({ nonUnionRules: { ...store.nonUnionRules!, dayRate: Number(e.target.value), weeklyGuarantee: store.nonUnionRules?.weeklyGuarantee ?? 5, otStandard: store.nonUnionRules?.otStandard ?? 1.5, otEnhanced: store.nonUnionRules?.otEnhanced ?? 2.0, mealBreak: store.nonUnionRules?.mealBreak ?? 6, turnaround: store.nonUnionRules?.turnaround ?? 11 } })}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
                  placeholder={territory === 'uk' ? '138.60' : territory === 'ie' ? '86.40' : '0.00'}
                />
              </Field>
              <Field label="Weekly Guarantee">
                <input
                  type="number"
                  value={store.nonUnionRules?.weeklyGuarantee ?? 5}
                  onChange={(e) => store.update({ nonUnionRules: { ...store.nonUnionRules!, dayRate: store.nonUnionRules?.dayRate ?? 0, weeklyGuarantee: Number(e.target.value), otStandard: store.nonUnionRules?.otStandard ?? 1.5, otEnhanced: store.nonUnionRules?.otEnhanced ?? 2.0, mealBreak: store.nonUnionRules?.mealBreak ?? 6, turnaround: store.nonUnionRules?.turnaround ?? 11 } })}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
                />
              </Field>
              <Field label="OT Rate (standard)" hint="Multiplier e.g. 1.5">
                <input
                  type="number"
                  step="0.1"
                  value={store.nonUnionRules?.otStandard ?? 1.5}
                  onChange={(e) => store.update({ nonUnionRules: { ...store.nonUnionRules!, dayRate: store.nonUnionRules?.dayRate ?? 0, weeklyGuarantee: store.nonUnionRules?.weeklyGuarantee ?? 5, otStandard: Number(e.target.value), otEnhanced: store.nonUnionRules?.otEnhanced ?? 2.0, mealBreak: store.nonUnionRules?.mealBreak ?? 6, turnaround: store.nonUnionRules?.turnaround ?? 11 } })}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
                />
              </Field>
              <Field label="OT Rate (enhanced)" hint="Multiplier e.g. 2.0">
                <input
                  type="number"
                  step="0.1"
                  value={store.nonUnionRules?.otEnhanced ?? 2.0}
                  onChange={(e) => store.update({ nonUnionRules: { ...store.nonUnionRules!, dayRate: store.nonUnionRules?.dayRate ?? 0, weeklyGuarantee: store.nonUnionRules?.weeklyGuarantee ?? 5, otStandard: store.nonUnionRules?.otStandard ?? 1.5, otEnhanced: Number(e.target.value), mealBreak: store.nonUnionRules?.mealBreak ?? 6, turnaround: store.nonUnionRules?.turnaround ?? 11 } })}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
                />
              </Field>
              <Field label="Meal Break">
                <input
                  type="number"
                  value={store.nonUnionRules?.mealBreak ?? 6}
                  onChange={(e) => store.update({ nonUnionRules: { ...store.nonUnionRules!, dayRate: store.nonUnionRules?.dayRate ?? 0, weeklyGuarantee: store.nonUnionRules?.weeklyGuarantee ?? 5, otStandard: store.nonUnionRules?.otStandard ?? 1.5, otEnhanced: store.nonUnionRules?.otEnhanced ?? 2.0, mealBreak: Number(e.target.value), turnaround: store.nonUnionRules?.turnaround ?? 11 } })}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
                />
              </Field>
              <Field label="Turnaround">
                <input
                  type="number"
                  value={store.nonUnionRules?.turnaround ?? 11}
                  onChange={(e) => store.update({ nonUnionRules: { ...store.nonUnionRules!, dayRate: store.nonUnionRules?.dayRate ?? 0, weeklyGuarantee: store.nonUnionRules?.weeklyGuarantee ?? 5, otStandard: store.nonUnionRules?.otStandard ?? 1.5, otEnhanced: store.nonUnionRules?.otEnhanced ?? 2.0, mealBreak: store.nonUnionRules?.mealBreak ?? 6, turnaround: Number(e.target.value) } })}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
                />
              </Field>
            </div>

            <Alert variant="gold">
              Production rules apply to this deal memo only. These do not override local employment law minimums.
            </Alert>
          </CardBody>
        </Card>
      )}

      {/* ── 1I: Production Schedule ───────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">
              Production Schedule
            </span>
            <Badge variant="blue">Used for phase rate calculations & cost estimates</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Prep Days" required hint="Pre-production">
              <input
                type="number"
                value={store.schedPrepDays}
                onChange={(e) => store.update({ schedPrepDays: Number(e.target.value) })}
                min={0}
                className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
              />
            </Field>
            <Field label="Shoot Days" required hint="Principal photography">
              <input
                type="number"
                value={store.schedShootDays}
                onChange={(e) => store.update({ schedShootDays: Number(e.target.value) })}
                min={0}
                className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
              />
            </Field>
            <Field label="Wrap Days" required hint="Post wrap-out">
              <input
                type="number"
                value={store.schedWrapDays}
                onChange={(e) => store.update({ schedWrapDays: Number(e.target.value) })}
                min={0}
                className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
              />
            </Field>
          </div>

          {/* Computed rows */}
          <div className="mt-4 border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-3">Total Working Days</span>
              <span className="text-[13px] font-mono text-gold">{store.schedPrepDays + store.schedShootDays + store.schedWrapDays}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-3">Approximate Weeks</span>
              <span className="text-[13px] font-mono text-gold">{((store.schedPrepDays + store.schedShootDays + store.schedWrapDays) / 5).toFixed(1)}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
