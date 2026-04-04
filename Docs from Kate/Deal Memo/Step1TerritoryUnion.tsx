'use client';
// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Contracting Entity · Department/Role · Territory · Agreement
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useDealMemoStore } from '../../store/dealMemoStore';
import { DEPT_ROLES, DEPT_UNION_MAP, DEPARTMENT_ICONS } from '../../data/deptRoles';
import { TERRITORY_RULES } from '../../data/territoryRules';
import type { TerritoryKey, UnionKey, DepartmentKey } from '../../types/dealMemo';

const TERRITORIES: Array<{ key: TerritoryKey; flag: string; name: string; sub: string }> = [
  { key: 'UK', flag: '🇬🇧', name: 'United Kingdom', sub: 'PACT · BECTU · Equity · MU' },
  { key: 'US', flag: '🇺🇸', name: 'United States', sub: 'IATSE · DGA · SAG · WGA · Teamsters' },
  { key: 'CA', flag: '🇨🇦', name: 'Canada', sub: 'DGC · NABET · IATSE · ACTRA' },
  { key: 'AU', flag: '🇦🇺', name: 'Australia', sub: 'MEAA · SPAA · SPA' },
  { key: 'NZ', flag: '🇳🇿', name: 'New Zealand', sub: 'MEAA NZ · SPADA' },
  { key: 'DE', flag: '🇩🇪', name: 'Germany', sub: 'ver.di · BFFS · VDD' },
  { key: 'FR', flag: '🇫🇷', name: 'France', sub: 'CGT-Spectacle · CFDT · SFP' },
  { key: 'IE', flag: '🇮🇪', name: 'Ireland', sub: 'SIPTU · Equity Ireland · BECTU' },
  { key: 'ES', flag: '🇪🇸', name: 'Spain', sub: 'UGT · CC.OO · AISGE' },
  { key: 'IT', flag: '🇮🇹', name: 'Italy', sub: 'SLC-CGIL · UIL · UNITA' },
  { key: 'NL', flag: '🇳🇱', name: 'Netherlands', sub: 'FNV Media · NVM' },
  { key: 'NO', flag: '🇳🇴', name: 'Norway', sub: 'Norsk filmforbund · Creo' },
  { key: 'SE', flag: '🇸🇪', name: 'Sweden', sub: 'Film & TV · Medieföretagen' },
  { key: 'ZA', flag: '🇿🇦', name: 'South Africa', sub: 'SAGA · SADA · SABC' },
  { key: 'INT', flag: '🌍', name: 'International', sub: 'Non-union / Custom rules' },
];

// ── UK Union data (other territories follow same pattern) ─────────────────────
const UK_UNIONS = {
  production: [
    { key: 'PACT-BECTU' as UnionKey, logo: 'PB', name: 'PACT / BECTU', desc: 'MMP Rate Card 2024. Feature & High-End TV. Most BECTU grades.', tags: ['Feature', 'HET TV', 'PAYE'], color: '#e8b84b' },
    { key: 'PACT-BECTU-ITV' as UnionKey, logo: 'IT', name: 'PACT / BECTU (ITV)', desc: 'ITV-specific rate card. Light Entertainment, Daytime, Factual.', tags: ['ITV'], color: '#fb923c' },
    { key: 'PACT-LB' as UnionKey, logo: 'LB', name: 'PACT / BECTU Low Budget', desc: 'Budget under £2M. Modified OT and turnaround rules.', tags: ['Low Budget', 'Feature'], color: '#4ade80' },
    { key: 'PACT-ULB' as UnionKey, logo: 'UL', name: 'PACT / BECTU Ultra Low Budget', desc: 'Budget under £500k. Significantly reduced minimums.', tags: ['Ultra LB'], color: '#2dd4bf' },
  ],
  performers: [
    { key: 'EQUITY' as UnionKey, logo: 'EQ', name: 'Equity', desc: 'Performers, actors, voice artists. ITV/BBC/Streaming TV/Film Production Agreement.', tags: [], color: '#c084fc' },
    { key: 'MU' as UnionKey, logo: 'MU', name: "Musicians' Union", desc: 'Session musicians, composers. BBC/ITV/Streaming agreements.', tags: [], color: '#2dd4bf' },
  ],
  broadcaster: [
    { key: 'BBC-BECTU' as UnionKey, logo: 'BBC', name: 'BBC / BECTU Staff Agreement', desc: 'BBC staff and long-term freelancers. BBC payroll rules apply.', tags: [], color: '#60a5fa' },
    { key: 'C4-BECTU' as UnionKey, logo: 'C4', name: 'Channel 4 / BECTU', desc: 'Channel 4 in-house productions and commissioned suppliers.', tags: [], color: '#f87171' },
  ],
  nonUnion: [
    { key: 'UK-NU' as UnionKey, logo: 'NU', name: 'Non-Union / Freelance', desc: 'No collective agreement. Custom rate and rules — all fields editable in Step 4.', tags: [], color: '#6b7280' },
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────

export function Step1TerritoryUnion() {
  const {
    contractingEntityId, setContractingEntity,
    department, setDepartment,
    role, setRole,
    territory, setTerritory,
    unionKey, setUnion,
    isCustomDeal,
    production,
  } = useDealMemoStore();

  const [roleValue, setRoleValue] = useState(role);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionHint, setSuggestionHint] = useState('');

  const activeDept = department || 'Camera';
  const roles = DEPT_ROLES[activeDept] || [];
  const rule = TERRITORY_RULES[unionKey] || TERRITORY_RULES.default;

  const handleDeptChange = (dept: DepartmentKey) => {
    setDepartment(dept);
    // Update suggestions
    const map = DEPT_UNION_MAP[dept];
    const terrMap = map?.[territory] || map?.['UK'];
    setSuggestions(terrMap?.keys || []);
    setSuggestionHint(terrMap?.hint || '');
  };

  const handleRoleChange = (newRole: string) => {
    setRoleValue(newRole);
    setRole(newRole);
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-[9px] font-mono tracking-[2px] uppercase text-[#e8b84b] mb-1">Step 1 of 10</p>
        <h2 className="text-[22px] font-['Syne'] font-bold text-white leading-tight">Territory &amp; Union Agreement</h2>
        <p className="text-[12px] text-[#6b7280] mt-2 leading-relaxed max-w-2xl">
          Select the contracting entity, department, employment territory and applicable collective agreement.
          The entity determines the legal contract, payroll registration and currency.
          Territory sets the tax treatment, employment law and available agreements.
        </p>
      </div>

      {/* ── 1. CONTRACTING ENTITY ─────────────────────────────────────────── */}
      <Card title="Contracting Entity" sub="Select the legal entity engaging this crew member. Determines the employment contract, payroll registration, VAT/tax treatment and applicable agreements.">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 mt-3">
          {production.entities.map((entity) => (
            <button
              key={entity.id}
              onClick={() => setContractingEntity(entity.id)}
              className={`text-left p-3 rounded-lg border transition-all ${
                contractingEntityId === entity.id
                  ? 'border-[rgba(232,184,75,.4)] bg-[rgba(232,184,75,.07)]'
                  : 'border-[#1e2030] bg-[#0b0c10] hover:bg-[#161820]'
              }`}
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center text-[11px] font-extrabold font-['Syne'] mb-2"
                style={{ background: 'rgba(232,184,75,.15)', color: '#e8b84b' }}
              >
                {entity.id.split('-')[1]}
              </div>
              <p className={`text-[12px] font-semibold leading-tight ${contractingEntityId === entity.id ? 'text-[#e8b84b]' : 'text-white'}`}>
                {entity.name}
              </p>
              <p className="text-[10px] text-[#6b7280] font-mono mt-0.5">
                {entity.registrationNumber} · {entity.defaultTerritory}
              </p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {entity.isPrimary && <Tag color="gold">Primary</Tag>}
                <Tag color="blue">{entity.defaultCurrency}</Tag>
              </div>
            </button>
          ))}
          <button className="text-left p-3 rounded-lg border border-dashed border-[#1e2030] opacity-50 cursor-default">
            <div className="w-9 h-9 rounded-md flex items-center justify-center text-[18px] mb-2 bg-[#1e2030] text-[#3d4257]">+</div>
            <p className="text-[12px] text-[#6b7280]">Add Entity</p>
            <p className="text-[10px] text-[#3d4257] mt-0.5">Configure in Production Settings</p>
          </button>
        </div>

        {/* Entity detail bar */}
        {(() => {
          const ent = production.entities.find((e) => e.id === contractingEntityId);
          if (!ent) return null;
          return (
            <div className="mt-3 p-3 rounded-lg bg-[#0b0c10] border border-[rgba(232,184,75,.2)]">
              <p className="text-[9px] font-mono tracking-[1.5px] uppercase text-[#3d4257] mb-2">
                Selected Entity — {ent.name}
              </p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  ['Registration', ent.registrationNumber],
                  ['VAT / Tax ID', ent.vatTaxId],
                  ['Payroll Bureau', ent.payrollBureau],
                  ['Currency', ent.defaultCurrency],
                  ['Employer Ref.', ent.employerReference],
                  ['Agreements', ent.applicableAgreements.join(' · ')],
                  ['Signatories', ent.signatoriesOf.join(' · ')],
                  ['Bank', ent.bankReference],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[9px] font-mono tracking-[1px] uppercase text-[#3d4257]">{label}</p>
                    <p className="text-[11px] text-white font-medium mt-0.5 leading-tight">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </Card>

      {/* ── 2. DEPARTMENT & ROLE ──────────────────────────────────────────── */}
      <Card title="Department & Role" sub="Select department first — the role determines which collective agreements and rate minimums apply. Suggestions highlight in the agreement panel below.">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-1.5 mt-3">
          {(Object.keys(DEPT_ROLES) as DepartmentKey[]).map((dept) => (
            <button
              key={dept}
              onClick={() => handleDeptChange(dept)}
              className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                activeDept === dept
                  ? 'border-[rgba(232,184,75,.4)] bg-[rgba(232,184,75,.07)]'
                  : 'border-[#1e2030] bg-[#0b0c10] hover:bg-[#161820]'
              }`}
            >
              <span className="text-base leading-none w-5 text-center">{DEPARTMENT_ICONS[dept] || '◆'}</span>
              <span className={`text-[11px] font-medium leading-tight ${activeDept === dept ? 'text-[#e8b84b]' : 'text-[#9ca3af]'}`}>
                {dept}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-3 items-end">
          <div className="flex-[2] flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#9ca3af]">Role / Job Title *</label>
            <select
              value={roleValue}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="bg-[#0b0c10] border border-[#1e2030] rounded-[6px] px-3 py-2 text-[12px] text-white focus:border-[rgba(232,184,75,.4)] outline-none"
            >
              <option value="">Select department first…</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[11px] font-medium text-[#9ca3af]">Screen Credit</label>
            <input
              defaultValue={role}
              className="bg-[#0b0c10] border border-[#1e2030] rounded-[6px] px-3 py-2 text-[12px] text-white focus:border-[rgba(232,184,75,.4)] outline-none"
              placeholder="e.g. 1st Assistant Camera"
            />
          </div>
        </div>

        {/* Suggestion banner */}
        {suggestionHint && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-[rgba(96,165,250,.07)] border border-[rgba(96,165,250,.2)] text-[11px] text-[#9ca3af]">
            <span className="text-[#e8b84b] font-semibold">💡 Suggested agreements</span>
            {' — '}
            {suggestionHint}
          </div>
        )}
      </Card>

      {/* ── 3. TERRITORY ──────────────────────────────────────────────────── */}
      <Card title="Production Territory" sub="Employment territory determines tax treatment, applicable employment law, and which collective agreements are available.">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-1.5 mt-3">
          {TERRITORIES.map((t) => (
            <button
              key={t.key}
              onClick={() => setTerritory(t.key)}
              className={`p-3 rounded-lg border text-left transition-all ${
                territory === t.key
                  ? 'border-[rgba(232,184,75,.4)] bg-[rgba(232,184,75,.07)]'
                  : 'border-[#1e2030] bg-[#0b0c10] hover:bg-[#161820]'
              }`}
            >
              <span className="text-[22px] block mb-1 leading-none">{t.flag}</span>
              <p className={`text-[11px] font-semibold ${territory === t.key ? 'text-[#e8b84b]' : 'text-white'}`}>{t.name}</p>
              <p className="text-[9px] text-[#6b7280] mt-0.5 leading-tight">{t.sub}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* ── 4. COLLECTIVE AGREEMENT ──────────────────────────────────────── */}
      {/* Only showing UK for brevity — other territories follow same pattern */}
      {(territory === 'UK' || territory === 'IE') && (
        <Card title="Collective Agreement" sub="Select the applicable agreement. Rules, OT structure, and timecard template load automatically.">

          {/* Non-union custom panel — shown when UK-NU selected */}
          {isCustomDeal && (
            <CustomDealPanel />
          )}

          {/* Standard agreement panel — hidden when custom */}
          {!isCustomDeal && (
            <>
              {[
                { label: 'Production Agreements', items: UK_UNIONS.production },
                { label: 'Performers & Talent', items: UK_UNIONS.performers },
                { label: 'Broadcaster Agreements', items: UK_UNIONS.broadcaster },
                { label: 'Non-Union', items: UK_UNIONS.nonUnion },
              ].map(({ label, items }) => (
                <div key={label} className="mb-4">
                  <p className="text-[9px] font-mono tracking-[1.5px] uppercase text-[#3d4257] mb-2">{label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {items.map((u) => {
                      const isSuggested = suggestions.includes(u.key);
                      return (
                        <button
                          key={u.key}
                          onClick={() => setUnion(u.key)}
                          className={`relative text-left p-3 rounded-lg border transition-all ${
                            unionKey === u.key
                              ? 'border-[rgba(232,184,75,.4)] bg-[rgba(232,184,75,.07)]'
                              : isSuggested
                              ? 'border-[rgba(232,184,75,.2)] bg-[rgba(232,184,75,.03)]'
                              : 'border-[#1e2030] bg-[#0b0c10] hover:bg-[#161820]'
                          }`}
                        >
                          {isSuggested && (
                            <span className="absolute -top-px right-2 bg-[#e8b84b] text-[#0b0c10] text-[8px] font-mono font-bold tracking-wider px-1.5 py-px rounded-b-sm">
                              Suggested
                            </span>
                          )}
                          <div className="flex gap-2.5 items-start">
                            <div
                              className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-extrabold font-['Syne'] flex-shrink-0"
                              style={{ background: `${u.color}18`, color: u.color }}
                            >
                              {u.logo}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-[11px] font-semibold leading-tight ${unionKey === u.key ? 'text-[#e8b84b]' : 'text-white'}`}>
                                {u.name}
                              </p>
                              <p className="text-[10px] text-[#6b7280] mt-0.5 leading-snug">{u.desc}</p>
                              {u.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {u.tags.map((tag) => (
                                    <Tag key={tag} color="gold">{tag}</Tag>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Loaded rules panel */}
              <div className="mt-4 rounded-xl border border-[#1e2030] overflow-hidden">
                <AgreementRulesPanel rule={rule} />
              </div>
            </>
          )}
        </Card>
      )}

      {/* TODO: Add US / CA / AU / other territory union panels following same pattern */}
      {territory === 'US' && (
        <Card title="Collective Agreement" sub="Select the applicable guild or union agreement for this crew member.">
          <p className="text-[12px] text-[#6b7280] italic">US union panels — see prototype HTML for full grid. Follows same pattern as UK above.</p>
        </Card>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0f1117] border border-[#1e2030] rounded-xl p-4 mb-3">
      <p className="text-[13px] font-semibold text-white">{title}</p>
      {sub && <p className="text-[11px] text-[#6b7280] mt-0.5 leading-relaxed">{sub}</p>}
      {children}
    </div>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: 'gold' | 'blue' | 'green' }) {
  const cls = {
    gold: 'bg-[rgba(232,184,75,.1)] text-[#e8b84b] border border-[rgba(232,184,75,.2)]',
    blue: 'bg-[rgba(96,165,250,.1)] text-[#60a5fa] border border-[rgba(96,165,250,.2)]',
    green: 'bg-[rgba(74,222,128,.1)] text-[#4ade80] border border-[rgba(74,222,128,.2)]',
  }[color];
  return (
    <span className={`inline-flex px-1.5 py-px text-[9px] font-mono font-medium rounded ${cls}`}>
      {children}
    </span>
  );
}

function CustomDealPanel() {
  const { production, applyProductionTemplate } = useDealMemoStore();
  const cr = production.customRules;
  return (
    <div className="border border-[rgba(232,184,75,.3)] rounded-xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-3 bg-[rgba(232,184,75,.07)]">
        <div>
          <span className="text-[9px] font-mono tracking-[1.5px] uppercase text-[#e8b84b] font-bold mr-2">CUSTOM</span>
          <span className="text-[12px] font-semibold text-white">Production Template — all values editable per deal</span>
        </div>
        <button
          onClick={applyProductionTemplate}
          className="px-3 py-1.5 text-[11px] font-semibold bg-[#e8b84b] text-[#0b0c10] rounded-lg hover:bg-[#f0c96a] transition-colors"
        >
          Apply to this deal →
        </button>
      </div>
      <div className="p-4">
        <p className="text-[9px] font-mono tracking-[1.5px] uppercase text-[#3d4257] mb-3">OT Structure (editable)</p>
        <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-[#3d4257] uppercase tracking-wider mb-2 px-2">
          <span>Code</span><span>Description</span><span>Trigger</span><span className="text-right">Multiplier</span>
        </div>
        {[
          { code: 'OT1', desc: cr.ot1Desc, trigger: cr.ot1Trigger, mult: cr.ot1Mult, color: '#fb923c' },
          { code: 'OT2', desc: cr.ot2Desc, trigger: cr.ot2Trigger, mult: cr.ot2Mult, color: '#f87171' },
          { code: '6TH', desc: cr.sixthDesc, trigger: cr.sixthTrigger, mult: cr.sixthMult, color: '#2dd4bf' },
          { code: '7TH', desc: cr.seventhDesc, trigger: cr.seventhTrigger, mult: cr.seventhMult, color: '#c084fc' },
        ].map((row) => (
          <div key={row.code} className="grid grid-cols-4 gap-1 items-center py-2 px-2 border-b border-[#1e2030] last:border-0">
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded w-fit" style={{ background: `${row.color}18`, color: row.color }}>{row.code}</span>
            <input defaultValue={row.desc} className="bg-[#0b0c10] border border-[#1e2030] rounded px-2 py-1 text-[11px] text-white focus:border-[rgba(232,184,75,.4)] outline-none" />
            <input defaultValue={row.trigger} className="bg-[#0b0c10] border border-[#1e2030] rounded px-2 py-1 text-[10px] text-[#9ca3af] focus:border-[rgba(232,184,75,.4)] outline-none" />
            <input type="number" defaultValue={row.mult} step="0.25" className="bg-[#0b0c10] border border-[#1e2030] rounded px-2 py-1 text-[11px] font-mono text-[#e8b84b] text-right focus:border-[rgba(232,184,75,.4)] outline-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AgreementRulesPanel({ rule }: { rule: ReturnType<typeof useDealMemoStore>['getCurrentRule'] extends () => infer R ? R : never }) {
  const [tab, setTab] = useState<'pay' | 'meal' | 'fringes' | 'special'>('pay');
  return (
    <div>
      <div className="flex items-center px-4 py-2.5 border-b border-[#1e2030] bg-[#0b0c10]">
        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[rgba(232,184,75,.1)] text-[#e8b84b] border border-[rgba(232,184,75,.2)] mr-3">{rule.badge}</span>
        <span className="text-[11px] font-semibold text-white">Loaded Agreement Rules — auto-applied to this deal</span>
      </div>
      <div className="flex border-b border-[#1e2030]">
        {(['pay', 'meal', 'fringes', 'special'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[11px] font-semibold transition-colors border-b-2 ${
              tab === t ? 'text-[#e8b84b] border-[#e8b84b]' : 'text-[#6b7280] border-transparent hover:text-[#9ca3af]'
            }`}
          >
            {t === 'pay' ? 'Pay Structure' : t === 'meal' ? 'Meals & Rest' : t === 'fringes' ? 'Fringes & On-costs' : 'Special Provisions'}
          </button>
        ))}
      </div>
      <div className="p-4 text-[11px]">
        {tab === 'pay' && (
          <div className="space-y-2">
            <RuleRow label="Basic Day Length" value={rule.basic} sub={rule.basicS} highlight />
            <RuleRow label="OT Tier 1" value={rule.ot1} sub={rule.ot1S} valueColor="text-[#fb923c]" />
            <RuleRow label="OT Tier 2" value={rule.ot2} sub={rule.ot2S} valueColor="text-[#f87171]" />
            {rule.golden && <RuleRow label="Golden Time" value={rule.golden} sub={rule.goldenS || ''} valueColor="text-[#f87171]" />}
            <RuleRow label="6th Day" value={rule.sixth} sub={rule.sixthS} />
            <RuleRow label="7th Day" value={rule.seventh} sub={rule.seventhS} valueColor="text-[#f87171]" />
            {rule.hp !== 'N/A' && <RuleRow label="Holiday Pay" value={rule.hp} sub={rule.hpS} valueColor="text-[#4ade80]" />}
            {rule.vacation && <RuleRow label="Vacation" value={rule.vacation} sub={rule.vacationS || ''} valueColor="text-[#4ade80]" />}
          </div>
        )}
        {tab === 'meal' && (
          <div className="space-y-2">
            <RuleRow label="First Meal Due" value={rule.meal} sub={rule.mealS} highlight />
            <RuleRow label="Turnaround" value={rule.rest} sub={rule.restS} highlight />
            <RuleRow label="Meal Duration" value={rule.mealDur} sub={rule.mealPaid} />
            <RuleRow label="Meal Penalty" value={rule.mp} sub={rule.mpS} valueColor="text-[#fb923c]" />
            <RuleRow label="Subsequent Meal" value={rule.mealSubseq} sub={rule.mealGrace ? `Grace: ${rule.mealGrace}` : ''} />
            <RuleRow label="Turnaround Violation" value={rule.taPen} sub="" />
          </div>
        )}
        {tab === 'fringes' && (
          <div className="space-y-2">
            <RuleRow label="Holiday / Vacation Pay" value={rule.rfHp} sub={rule.rfHpS} valueColor="text-[#e8b84b]" />
            <RuleRow label="Employer Tax / NIC" value={rule.rfNic} sub={rule.rfNicS} valueColor="text-[#e8b84b]" />
            <RuleRow label="Pension / Retirement" value={rule.rfPension} sub={rule.rfPensionS} valueColor="text-[#e8b84b]" />
            {rule.rfHw && <RuleRow label="Health & Welfare" value={rule.rfHw} sub={rule.rfHwS || ''} valueColor="text-[#60a5fa]" />}
            <RuleRow label="Total employer cost above basic" value={rule.rfEmployerTotal} sub="All fringes combined" valueColor="text-[#fb923c]" />
            <RuleRow label="Mileage rate" value={rule.rfMileage} sub="" />
            <RuleRow label="Tax credit qualification" value={rule.rfTaxcredit} sub="" valueColor="text-[#4ade80]" />
          </div>
        )}
        {tab === 'special' && (
          <div className="space-y-2">
            {rule.special.map((item, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-1 h-1 rounded-full bg-[#e8b84b] flex-shrink-0 mt-[6px]" />
                <p className="text-[#9ca3af] leading-relaxed" dangerouslySetInnerHTML={{ __html: item }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RuleRow({ label, value, sub, highlight, valueColor = 'text-white' }: {
  label: string; value: string; sub: string; highlight?: boolean; valueColor?: string;
}) {
  return (
    <div className={`flex items-center justify-between py-2 border-b border-[#1e2030] last:border-0 ${highlight ? 'bg-[#161820] -mx-4 px-4 rounded' : ''}`}>
      <div>
        <p className="text-[#9ca3af]">{label}</p>
        {sub && <p className="text-[10px] text-[#3d4257] mt-0.5">{sub}</p>}
      </div>
      <span className={`font-mono font-semibold text-[12px] ${valueColor}`}>{value}</span>
    </div>
  );
}
