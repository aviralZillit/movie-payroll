// ============================================================
// ZILLIT CODA — Deal Memo Wizard — Right Summary Panel
// Each section subscribes to granular Zustand selectors
// so every keystroke / select / toggle updates immediately.
// ============================================================

import { useState } from 'react';
import { useDealMemoStore } from '../../store/kate/useDealMemoStore';
import { TERRITORIES, ALL_DEPARTMENTS, CURRENCY_SYMBOLS } from '../../data/kate/territories';
import { EMPLOYMENT_STATUSES } from '../../data/kate/employmentStatus';
import type { TerritoryCode } from '../../types/kate/dealMemo';
import type { TerritoryCode as EmpTerritoryCode } from '../../data/kate/employmentStatus';

type Tab = 'summary' | 'timecard' | 'cost';

const DEAL_TYPE_LABELS: Record<string, string> = {
  weekly: 'Weekly Rolling',
  fixed: 'Fixed Term',
  dayplayer: 'Day Player',
  buyout: 'Buyout / Flat',
  picture: 'Per Production',
  boxrental: 'Box Rental',
};

const HP_LABELS: Record<string, string> = {
  incl: 'Inclusive',
  excl: 'Exclusive',
};

function getCurrencySymbol(curr: string): string {
  return (CURRENCY_SYMBOLS as Record<string, string>)[curr] || curr;
}

function fmt(amount: number, curr: string): string {
  if (!amount || amount <= 0) return '--';
  const sym = getCurrencySymbol(curr);
  return `${sym}${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDays(n: number): string {
  if (!n || n <= 0) return '--';
  return `${n} days`;
}

function fmtDate(dateStr?: string): string {
  if (!dateStr) return '--';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ── TAB BAR STATE ─────────────────────────────────────────────
// Kept at the top level so tab selection survives step navigation
let _activeTab: Tab = 'summary';

// ── ROOT ──────────────────────────────────────────────────────

export function RightPanel() {
  const [activeTab, setActiveTab] = useState<Tab>(_activeTab);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'summary',  label: 'Summary' },
    { id: 'timecard', label: 'Timecard' },
    { id: 'cost',     label: 'Cost Est.' },
  ];

  const handleTab = (t: Tab) => {
    _activeTab = t;
    setActiveTab(t);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-border flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTab(tab.id)}
            className={`flex-1 py-3 text-[10px] font-display font-semibold uppercase tracking-wider transition-colors ${
              activeTab === tab.id
                ? 'text-gold border-b-2 border-gold'
                : 'text-text-4 hover:text-text-3'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0">
        {activeTab === 'summary'  && <SummaryTab />}
        {activeTab === 'timecard' && <TimecardTab />}
        {activeTab === 'cost'     && <CostEstimateTab />}
      </div>
    </div>
  );
}

// ── SHARED PRIMITIVES ─────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="text-[10px] text-text-3 font-display font-bold uppercase tracking-widest mb-2 pb-1.5 border-b border-border/50">
      {title}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-border my-2.5" />;
}

function Row({ label, value, mono, dim }: { label: string; value: string; mono?: boolean; dim?: boolean }) {
  return (
    <div className="flex justify-between items-baseline gap-2 py-[3px]">
      <span className="text-[10px] text-text-3 font-medium shrink-0">{label}</span>
      <span className={`text-[11px] text-right min-w-0 break-words ${mono ? 'font-mono' : ''} ${dim ? 'text-text-4 italic' : 'text-text-1'}`}>
        {value}
      </span>
    </div>
  );
}

// ── SUMMARY TAB ───────────────────────────────────────────────
// Each field uses its own selector — guaranteed immediate reactivity

function SummaryTab() {
  // Individual selectors — each one triggers its own re-render
  const fullName        = useDealMemoStore((s) => (s as any).fullName as string | undefined);
  const jobTitle        = useDealMemoStore((s) => s.jobTitle);
  const department      = useDealMemoStore((s) => s.department);
  const empStatusId     = useDealMemoStore((s) => s.employmentStatusId);
  const territory       = useDealMemoStore((s) => s.territory) as TerritoryCode;
  const union           = useDealMemoStore((s) => s.union);
  const dealType        = useDealMemoStore((s) => s.dealType);
  const startDate       = useDealMemoStore((s) => (s as any).startDate as string | undefined);
  const dayRate         = useDealMemoStore((s) => s.rates.dayRate);
  const weeklyRate      = useDealMemoStore((s) => s.rates.weeklyRate);
  const hpMode          = useDealMemoStore((s) => s.rates.hpMode);
  const currency        = useDealMemoStore((s) => s.rates.currency);
  const schedPrepDays   = useDealMemoStore((s) => s.schedPrepDays);
  const schedShootDays  = useDealMemoStore((s) => s.schedShootDays);
  const schedWrapDays   = useDealMemoStore((s) => s.schedWrapDays);
  const allowances      = useDealMemoStore((s) => (s as any).allowances as Array<{ id: string; name: string; active: boolean; rate: number; frequency: string }> | undefined);
  const nominalCodes    = useDealMemoStore((s) => (s as any).nominalCodes as Record<string, string> | undefined);
  const hetvClass       = useDealMemoStore((s) => (s as any).hetvClassification as string | undefined);
  const hetvLabelMap: Record<string, string> = { G: 'G — Qualifying (HETVC)', B: 'B — Borderline', N: 'N — Non-qualifying' };
  const hetvLabel       = hetvClass ? (hetvLabelMap[hetvClass] || hetvClass) : '--';

  // Derived values
  const tData     = TERRITORIES[territory] || TERRITORIES.uk;
  const dept      = ALL_DEPARTMENTS.find((d) => d.id === department);
  const empStats  = EMPLOYMENT_STATUSES[territory as EmpTerritoryCode] || [];
  const empStatus = empStats.find((e) => e.id === empStatusId);
  const unionObj  = tData.unions.find((u) => u.id === union);
  const curr      = currency || tData.curr;

  const kitRental = allowances?.find((a) => a.active && (a.id === 'kit-rental' || a.name.toLowerCase().includes('kit')));

  return (
    <div className="space-y-0">
      {/* CREW */}
      <SectionHeader title="Crew" />
      <Row label="Name"   value={fullName || 'Pending'} dim={!fullName} />
      <Row label="Role"   value={jobTitle || '--'} />
      {dept && <Row label="Dept" value={dept.label} />}
      {empStatus && <Row label="Status" value={empStatus.badge} />}

      <Divider />

      {/* AGREEMENT */}
      <SectionHeader title="Agreement" />
      <Row label="Union"     value={unionObj?.name || '--'} />
      <Row label="Territory" value={`${tData.flag} ${(territory as string).toUpperCase()}`} />
      <Row label="Deal Type" value={DEAL_TYPE_LABELS[dealType] || dealType} />
      <Row label="Start"     value={fmtDate(startDate)} />

      <Divider />

      {/* RATES */}
      <SectionHeader title="Rates" />
      <Row label="Day Rate" value={fmt(dayRate, curr)} mono />
      <Row label="Weekly"   value={fmt(weeklyRate, curr)} mono />
      {kitRental && (
        <Row
          label="Kit Rental"
          value={`${fmt(kitRental.rate, curr)}/${kitRental.frequency === 'per-week' ? 'wk' : kitRental.frequency === 'per-day' ? 'day' : kitRental.frequency}`}
          mono
        />
      )}
      <Row label="HP" value={dayRate > 0 ? (HP_LABELS[hpMode] || hpMode) : '--'} />

      <Divider />

      {/* NOMINAL */}
      <SectionHeader title="Nominal" />
      {nominalCodes && Object.keys(nominalCodes).length > 0 ? (
        <>
          {nominalCodes.labour     && <Row label="Labour"      value={nominalCodes.labour}     mono />}
          {nominalCodes.costCentre && <Row label="Cost Centre" value={nominalCodes.costCentre} mono />}
          {!nominalCodes.labour && !nominalCodes.costCentre && (
            Object.entries(nominalCodes).slice(0, 3).map(([k, v]) => (
              <Row key={k} label={k} value={v} mono />
            ))
          )}
        </>
      ) : (
        <>
          <Row label="Labour"      value="--" mono />
          <Row label="Cost Centre" value="--" mono />
        </>
      )}

      {/* HETV — UK only */}
      {territory === 'uk' && (
        <>
          <Divider />
          <SectionHeader title="HETV" />
          <Row label="Tax Credit" value={hetvLabel} />
        </>
      )}

      {/* SCHEDULE */}
      <Divider />
      <SectionHeader title="Schedule" />
      <Row label="Prep"  value={fmtDays(schedPrepDays)}  mono />
      <Row label="Shoot" value={fmtDays(schedShootDays)} mono />
      <Row label="Wrap"  value={fmtDays(schedWrapDays)}  mono />
      <Row label="Total" value={fmtDays(schedPrepDays + schedShootDays + schedWrapDays)} mono />
    </div>
  );
}

// ── TIMECARD TAB ─────────────────────────────────────────────

function TimecardTab() {
  const dealType = useDealMemoStore((s) => s.dealType);
  const union    = useDealMemoStore((s) => s.union);
  const territory = useDealMemoStore((s) => s.territory) as TerritoryCode;

  const tData    = TERRITORIES[territory] || TERRITORIES.uk;
  const unionObj = tData.unions.find((u) => u.id === union);
  const showOT   = dealType !== 'buyout' && dealType !== 'picture' && dealType !== 'boxrental';

  return (
    <div className="space-y-0">
      <SectionHeader title="Working Day" />
      <Row label="Contracted Hours" value="10 hrs/day" mono />
      <Row label="OT Structure"     value={unionObj?.name || 'Production-defined'} />
      <Row label="Meal Break"       value="Within 6 hrs" />
      <Row label="Turnaround"       value="11 hrs min" />

      {showOT && (
        <>
          <Divider />
          <SectionHeader title="Overtime Tiers" />
          <div className="space-y-1.5 mt-1">
            {[
              { label: 'Hours 1–10', mult: '1.0×', color: 'text-text-2' },
              { label: 'Hours 11–12', mult: '1.5×', color: 'text-gold' },
              { label: 'Hours 12+',  mult: '2.0×', color: 'text-gold' },
            ].map((t) => (
              <div key={t.label} className="flex justify-between items-baseline">
                <span className="text-[10px] text-text-3">{t.label}</span>
                <span className={`font-mono text-[11px] ${t.color}`}>{t.mult}</span>
              </div>
            ))}
          </div>

          <Divider />
          <SectionHeader title="Premium Days" />
          <Row label="6th Day"             value="1.5×" mono />
          <Row label="7th Day / Rest Day"  value="2.0×" mono />
        </>
      )}

      {!showOT && (
        <>
          <Divider />
          <div className="text-[11px] text-text-3 italic">
            No OT — {dealType === 'buyout' ? 'all-in flat deal' : 'flat production fee'}
          </div>
        </>
      )}
    </div>
  );
}

// ── COST ESTIMATE TAB ────────────────────────────────────────

function CostEstimateTab() {
  const territory      = useDealMemoStore((s) => s.territory) as TerritoryCode;
  const weeklyRate     = useDealMemoStore((s) => s.rates.weeklyRate);
  const hpMode         = useDealMemoStore((s) => s.rates.hpMode);
  const currency       = useDealMemoStore((s) => s.rates.currency);
  const schedPrepDays  = useDealMemoStore((s) => s.schedPrepDays);
  const schedShootDays = useDealMemoStore((s) => s.schedShootDays);
  const schedWrapDays  = useDealMemoStore((s) => s.schedWrapDays);
  const allowances     = useDealMemoStore((s) => (s as any).allowances as Array<{ active: boolean; rate: number; frequency: string }> | undefined);

  const tData = TERRITORIES[territory] || TERRITORIES.uk;
  const curr  = currency || tData.curr;

  const hpAmount   = hpMode === 'excl' ? Math.round(weeklyRate * 0.1207) : 0;
  const fringeEst  = Math.round(weeklyRate * 0.138);

  let allowanceWeekly = 0;
  if (allowances) {
    for (const a of allowances) {
      if (!a.active) continue;
      if (a.frequency === 'per-week' || a.frequency === 'weekly') allowanceWeekly += a.rate;
      else if (a.frequency === 'per-day' || a.frequency === 'daily') allowanceWeekly += a.rate * 5;
    }
  }

  const totalWeekly   = weeklyRate + hpAmount + fringeEst + allowanceWeekly;
  const dayRate       = totalWeekly / 5;
  const prepCost      = Math.round(dayRate * schedPrepDays);
  const shootCost     = Math.round(dayRate * schedShootDays);
  const wrapCost      = Math.round(dayRate * schedWrapDays);
  const totalEng      = prepCost + shootCost + wrapCost;

  return (
    <div className="space-y-0">
      <SectionHeader title="Weekly Breakdown" />

      <CostRow label="Base Rate"           value={fmt(weeklyRate, curr)} />
      {hpMode === 'incl'
        ? <CostRow label="HP (12.07% incl.)"   value="Included"                    muted />
        : <CostRow label="+ Holiday Pay 12.07%" value={fmt(hpAmount, curr)} />
      }
      <CostRow label="+ Fringes ~13.8%"    value={fmt(fringeEst, curr)} />
      <CostRow
        label="+ Allowances"
        value={allowanceWeekly > 0 ? fmt(allowanceWeekly, curr) : '--'}
        muted={allowanceWeekly === 0}
      />

      <div className="border-t border-border mt-2 pt-2">
        <div className="flex justify-between items-baseline">
          <span className="text-[11px] font-display text-text-1">= Total / Week</span>
          <span className="text-[14px] font-mono font-bold text-gold">{fmt(totalWeekly, curr)}</span>
        </div>
      </div>

      <Divider />
      <SectionHeader title="Phase Estimates" />

      <CostRow label={`Prep ×${schedPrepDays}d`}   value={fmt(prepCost, curr)} />
      <CostRow label={`Shoot ×${schedShootDays}d`} value={fmt(shootCost, curr)} />
      <CostRow label={`Wrap ×${schedWrapDays}d`}   value={fmt(wrapCost, curr)} />

      <div className="border-t border-border mt-2 pt-2">
        <div className="flex justify-between items-baseline">
          <span className="text-[11px] font-display text-text-1">Total Engagement</span>
          <span className="text-[13px] font-mono font-bold text-gold">{fmt(totalEng, curr)}</span>
        </div>
      </div>

      <div className="mt-3 text-[9px] text-text-4 leading-relaxed">
        Estimate only. Final cost subject to OT, allowances, and actual fringes.
      </div>
    </div>
  );
}

function CostRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between items-baseline py-0.5">
      <span className="text-[10px] text-text-3">{label}</span>
      <span className={`text-[12px] font-mono ${muted ? 'text-text-4' : 'text-text-1'}`}>{value}</span>
    </div>
  );
}
