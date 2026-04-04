'use client';
// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Rates & Compensation
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { useDealMemoStore } from '../../store/dealMemoStore';
import type { CurrencyCode, HPMode } from '../../types/dealMemo';

const CURRENCIES: Array<{ code: CurrencyCode; symbol: string; label: string }> = [
  { code: 'GBP', symbol: '£', label: 'GBP £' },
  { code: 'USD', symbol: '$', label: 'USD $' },
  { code: 'CAD', symbol: 'C$', label: 'CAD C$' },
  { code: 'AUD', symbol: 'A$', label: 'AUD A$' },
  { code: 'EUR', symbol: '€', label: 'EUR €' },
  { code: 'NZD', symbol: 'NZ$', label: 'NZD NZ$' },
  { code: 'SEK', symbol: 'kr', label: 'SEK kr' },
  { code: 'NOK', symbol: 'kr', label: 'NOK kr' },
  { code: 'ZAR', symbol: 'R', label: 'ZAR R' },
];

export function Step4Rates() {
  const {
    rates, updateRates, setHPMode, setCurrency,
    territory, isCustomDeal, production,
    getCurrentRule, getCurrencySymbol, getDailyRate, getHourlyRate,
    applyProductionTemplate,
  } = useDealMemoStore();

  const rule = getCurrentRule();
  const sym = getCurrencySymbol();
  const daily = getDailyRate();
  const hrRate = getHourlyRate();
  const showHP = (territory === 'UK' || territory === 'IE') && rule.hp !== 'N/A';
  const hpRate = parseFloat(rule.hp) || 12.07;
  const hpPer = rates.hpMode === 'incl'
    ? daily - daily / (1 + hpRate / 100)
    : daily * hpRate / 100;

  const cr = production.customRules;

  const ot1m = parseFloat((rule.ot1 || '×1.25').replace('×', '')) || 1.25;
  const ot2m = parseFloat((rule.ot2 || '×1.50').replace('×', '')) || 1.50;
  const sixthM = parseFloat((rule.sixth || '×1.5').split(' ')[0].replace('×', '')) || 1.5;
  const seventhM = parseFloat((rule.seventh || '×2.0').split(' ')[0].replace('×', '')) || 2.0;

  // Rate comparison
  const minRate = 440; // TODO: derive from rule + role
  const isCompliant = daily >= minRate;

  return (
    <div>
      <StepHeader
        step={4}
        title="Rates & Compensation"
        desc={isCustomDeal
          ? `Custom deal — OT structure loaded from your production template (${cr.basicHrs}-hour basic day, OT1 ×${cr.ot1Mult}, OT2 ×${cr.ot2Mult}). Adjust any line for this specific crew member.`
          : `Set the agreed rate. Currency and OT structure load from ${rule.badge} automatically. Override any line for negotiated terms.`
        }
      />

      {/* Custom mode banner */}
      {isCustomDeal && (
        <div className="mb-3 px-4 py-3 rounded-xl bg-[rgba(232,184,75,.07)] border border-[rgba(232,184,75,.3)] flex items-center justify-between">
          <div>
            <span className="text-[#e8b84b] font-semibold text-[12px]">Custom Deal — all rate fields editable.</span>
            <span className="text-[#9ca3af] text-[12px] ml-2">Production template applied.</span>
          </div>
          <button
            onClick={() => {}} // open production settings
            className="text-[10px] text-[#e8b84b] hover:underline font-mono"
          >
            ⚙ Edit Production Template
          </button>
        </div>
      )}

      {/* Basic Rate Card */}
      <Card title="Basic Rate">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Field label="Currency">
            <select
              value={rates.currency || 'GBP'}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className={select}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Rate Basis">
            <select
              value={rates.rateBasis || 'daily'}
              onChange={(e) => updateRates({ rateBasis: e.target.value as 'daily' | 'weekly' | 'hourly' })}
              className={select}
            >
              <option value="daily">Per Day</option>
              <option value="weekly">Per Week</option>
              <option value="hourly">Per Hour</option>
            </select>
          </Field>
          <Field label="Rate Amount *">
            <div className="flex border border-[#1e2030] rounded-[6px] overflow-hidden focus-within:border-[rgba(232,184,75,.4)]">
              <span className="px-2.5 py-2 text-[12px] text-[#6b7280] bg-[#161820] border-r border-[#1e2030] select-none">{sym}</span>
              <input
                type="number"
                value={rates.rateAmount ?? 550}
                onChange={(e) => updateRates({ rateAmount: parseFloat(e.target.value) || 0 })}
                className="flex-1 px-3 py-2 text-[12px] text-white bg-[#0b0c10] outline-none text-right"
              />
            </div>
          </Field>
          <Field label="Rate Type">
            <select
              value={rates.rateType || 'negotiated'}
              onChange={(e) => updateRates({ rateType: e.target.value as any })}
              className={select}
            >
              <option value="negotiated">Negotiated</option>
              <option value="scale">Scale minimum</option>
              <option value="scale_plus_10">Scale + 10%</option>
              <option value="scale_plus_15">Scale + 15%</option>
            </select>
          </Field>
        </div>

        {/* Rate vs union minimum bar — hidden for custom deals */}
        {!isCustomDeal && (
          <div className="mt-2 p-3 rounded-lg bg-[#0b0c10] border border-[#1e2030]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-semibold text-white">Rate vs Union Minimum</span>
              <span className="text-[10px] text-[#6b7280]">{rule.badge} — 1st AC</span>
            </div>
            <div className="relative h-2 bg-[#1e2030] rounded-full overflow-hidden">
              <div className="absolute h-full bg-[#60a5fa] rounded-full" style={{ width: `${(minRate / (minRate * 1.6)) * 100}%` }} />
              <div className={`absolute h-full rounded-full transition-all ${isCompliant ? 'bg-[#4ade80]' : 'bg-[#f87171]'}`}
                style={{ width: `${Math.min(100, (daily / (minRate * 1.6)) * 100)}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-[#6b7280] mt-1.5">
              <span>{sym}0</span>
              <span>Min: {sym}{minRate}/day</span>
              <span>Offered: {sym}{daily.toFixed(0)}/day</span>
            </div>
            <div className={`flex items-center gap-1.5 mt-2 text-[11px] ${isCompliant ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'currentColor' }} />
              {isCompliant
                ? `✓ Rate is ${sym}${(daily - minRate).toFixed(0)} above ${rule.badge} minimum — compliant`
                : `⚠ Rate is ${sym}${(minRate - daily).toFixed(0)} BELOW union minimum — non-compliant`
              }
            </div>
          </div>
        )}
      </Card>

      {/* HP Treatment Card — UK/IE only */}
      {showHP && (
        <Card title="Holiday Pay Treatment" badge="UK / IE">
          <p className="text-[11px] text-[#6b7280] mt-1 mb-3 leading-relaxed">
            Critical accounting decision — affects how the cost report reads. Check the offer letter carefully.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(['excl', 'incl'] as HPMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setHPMode(mode)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  rates.hpMode === mode
                    ? 'border-[rgba(232,184,75,.4)] bg-[rgba(232,184,75,.07)]'
                    : 'border-[#1e2030] hover:bg-[#161820]'
                }`}
              >
                <p className={`text-[12px] font-semibold ${rates.hpMode === mode ? 'text-[#e8b84b]' : 'text-white'}`}>
                  {mode === 'excl' ? 'Exclusive of Holiday Pay' : 'Inclusive of Holiday Pay'}
                </p>
                <p className="text-[10px] text-[#6b7280] mt-1 leading-relaxed">
                  {mode === 'excl'
                    ? 'Quoted rate does NOT include HP. 12.07% uplift added on top and posted separately to 2302.'
                    : 'Quoted rate already includes HP. Basic element back-calculated: rate ÷ 1.1207.'
                  }
                </p>
                <p className="text-[10px] font-mono text-[#e8b84b] mt-2">
                  {mode === 'excl'
                    ? `${sym}${daily.toFixed(2)}/day + HP → ${sym}${(daily + hpPer).toFixed(2)} total`
                    : `${sym}${daily.toFixed(2)}/day all-in → ${sym}${(daily - hpPer).toFixed(2)} basic + ${sym}${hpPer.toFixed(2)} HP`
                  }
                </p>
              </button>
            ))}
          </div>
          <div className="mt-3 p-3 rounded-lg bg-[#0b0c10] border border-[#1e2030] text-[11px] text-[#9ca3af]">
            <strong className="text-white">Currently: {rates.hpMode === 'excl' ? 'Exclusive' : 'Inclusive'}.</strong>{' '}
            {rates.hpMode === 'excl'
              ? `HP uplift (${hpRate.toFixed(2)}%) added on top. Total daily cost: `
              : `Basic back-calc: ${sym}${(daily - hpPer).toFixed(2)} + HP ${sym}${hpPer.toFixed(2)} = `
            }
            <span className="text-[#e8b84b] font-mono">
              {sym}{(rates.hpMode === 'excl' ? daily + hpPer : daily).toFixed(2)}
            </span>
          </div>
        </Card>
      )}

      {/* OT Table */}
      <Card title="Overtime & Premium Structure"
        sub={isCustomDeal
          ? `Custom deal — Production template applied. Edit any value for this deal. Rate calculations based on ${cr.basicHrs}-hour day.`
          : `Auto-calculated from ${rule.badge}. Override individually if specific terms have been negotiated.`
        }
      >
        <table className="w-full mt-2 text-[11px]">
          <thead>
            <tr className="text-[#3d4257] font-mono text-[9px] uppercase tracking-wider">
              <th className="text-left pb-2 font-medium">Code</th>
              <th className="text-left pb-2 font-medium">Description</th>
              <th className="text-left pb-2 font-medium">Trigger</th>
              <th className="text-left pb-2 font-medium">Mult.</th>
              <th className="text-right pb-2 font-medium">Rate</th>
              <th className="text-center pb-2 w-10 font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {[
              { code: 'BASIC', label: 'Basic Day Rate', trigger: `Hours 1–${cr.basicHrs}`, mult: '×1.000', rate: sym + hrRate.toFixed(2) + '/hr', codeColor: '#e8b84b', rateColor: '#e8b84b' },
              { code: 'OT1', label: rule.ot1 !== 'N/A' ? 'Overtime Tier 1' : 'N/A', trigger: rule.ot1S, mult: rule.ot1, rate: sym + (hrRate * ot1m).toFixed(2) + '/hr', codeColor: '#fb923c', rateColor: '#fb923c' },
              { code: 'OT2', label: rule.ot2 !== 'N/A' ? 'Overtime Tier 2' : 'N/A', trigger: rule.ot2S, mult: rule.ot2, rate: sym + (hrRate * ot2m).toFixed(2) + '/hr', codeColor: '#f87171', rateColor: '#f87171' },
              { code: '6TH', label: '6th Day Premium', trigger: rule.sixthS, mult: rule.sixth.split(' ')[0], rate: sym + (hrRate * sixthM).toFixed(2) + '/hr', codeColor: '#2dd4bf', rateColor: '#2dd4bf' },
              { code: '7TH', label: '7th Day Premium', trigger: rule.seventhS, mult: rule.seventh.split(' ')[0], rate: sym + (hrRate * seventhM).toFixed(2) + '/hr', codeColor: '#c084fc', rateColor: '#c084fc' },
              ...(showHP ? [{ code: 'HP', label: 'Holiday Pay Uplift', trigger: 'All earnings', mult: rule.hp, rate: sym + hpPer.toFixed(2) + '/day', codeColor: '#4ade80', rateColor: '#4ade80' }] : []),
              { code: 'MEAL', label: 'Meal Penalty', trigger: 'Per breach', mult: 'Fixed', rate: rule.mp, codeColor: '#fb923c', rateColor: '#fb923c' },
            ].map((row, i) => (
              <tr key={i} className="border-t border-[#1e2030]">
                <td className="py-2">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: `${row.codeColor}18`, color: row.codeColor }}>
                    {row.code}
                  </span>
                </td>
                <td className="py-2 text-[#9ca3af]">
                  {isCustomDeal && row.code !== 'BASIC' && row.code !== 'HP' && row.code !== 'MEAL' ? (
                    <input defaultValue={row.label}
                      className="bg-[#161820] border border-[#1e2030] rounded px-2 py-1 text-[11px] text-white focus:border-[rgba(232,184,75,.4)] outline-none w-full"
                    />
                  ) : row.label}
                </td>
                <td className="py-2 text-[10px] text-[#6b7280]">
                  {isCustomDeal && row.code !== 'BASIC' && row.code !== 'HP' && row.code !== 'MEAL' ? (
                    <input defaultValue={row.trigger}
                      className="bg-[#161820] border border-[#1e2030] rounded px-2 py-1 text-[10px] text-[#9ca3af] focus:border-[rgba(232,184,75,.4)] outline-none"
                    />
                  ) : row.trigger}
                </td>
                <td className="py-2 font-mono text-[#9ca3af]">{row.mult}</td>
                <td className="py-2 text-right">
                  {isCustomDeal ? (
                    <input defaultValue={row.rate}
                      className="bg-[#161820] border border-[#1e2030] rounded px-2 py-1 text-[11px] font-mono text-right focus:border-[rgba(232,184,75,.4)] outline-none w-28"
                      style={{ color: row.rateColor }}
                    />
                  ) : (
                    <span className="font-mono" style={{ color: row.rateColor }}>{row.rate}</span>
                  )}
                </td>
                <td className="py-2 text-center">
                  <button className="text-[#3d4257] hover:text-[#e8b84b] text-[12px] transition-colors">✎</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StepHeader({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="mb-6">
      <p className="text-[9px] font-mono tracking-[2px] uppercase text-[#e8b84b] mb-1">Step {step} of 10</p>
      <h2 className="text-[22px] font-['Syne'] font-bold text-white">{title}</h2>
      <p className="text-[12px] text-[#6b7280] mt-1.5 leading-relaxed max-w-2xl">{desc}</p>
    </div>
  );
}

function Card({ title, sub, badge, children }: { title: string; sub?: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0f1117] border border-[#1e2030] rounded-xl p-4 mb-3">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-[13px] font-semibold text-white">{title}</p>
        {badge && <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[rgba(232,184,75,.1)] text-[#e8b84b] border border-[rgba(232,184,75,.2)]">{badge}</span>}
      </div>
      {sub && <p className="text-[11px] text-[#6b7280] leading-relaxed mb-2">{sub}</p>}
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-[#9ca3af]">{label}</label>
      {children}
    </div>
  );
}

const select = "bg-[#0b0c10] border border-[#1e2030] rounded-[6px] px-3 py-2 text-[12px] text-white focus:border-[rgba(232,184,75,.4)] outline-none";
