// ============================================================
// ZILLIT CODA — Deal Memo Wizard — Left Sidebar Step Nav
// Premium Edition — animated, polished, interactive
// ============================================================

import { useDealMemoStore } from '../../store/kate/useDealMemoStore';
import { TERRITORIES } from '../../data/kate/territories';
import type { TerritoryCode } from '../../types/dealMemo';

interface StepDef {
  num: number;
  label: string;
  sub: string;
}

const STEPS: StepDef[] = [
  { num: 1,  label: 'Territory & Union',      sub: 'Agreement & ruleset' },
  { num: 2,  label: 'Crew Details',            sub: 'Identity & employment' },
  { num: 3,  label: 'Deal Structure',          sub: 'Type, dates & guarantees' },
  { num: 4,  label: 'Rates & Compensation',    sub: 'OT tiers, HP treatment' },
  { num: 5,  label: 'Allowances & Rentals',    sub: 'Kit, car, per diem...' },
  { num: 6,  label: 'Nominal Coding',          sub: 'Accounts & cost centres' },
  { num: 7,  label: 'Compliance',              sub: 'IR35, RTW, docs' },
  { num: 8,  label: 'Additional Documents',    sub: 'Contract, NDA, annexes' },
  { num: 9,  label: 'Payroll Start Form',      sub: 'Bureau & export' },
  { num: 10, label: 'Preview & Issue',         sub: 'Sign & activate' },
];

export function StepNav() {
  const currentStep = useDealMemoStore((s) => s.currentStep);
  const territory = useDealMemoStore((s) => s.territory) as TerritoryCode;
  const union = useDealMemoStore((s) => s.union);
  const goStep = useDealMemoStore((s) => s.goStep);

  const t = TERRITORIES[territory] || TERRITORIES.uk;
  const unionObj = t.unions.find((u) => u.id === union);
  const progressPct = (currentStep / 10) * 100;

  return (
    <nav className="flex flex-col h-full px-4 py-5">
      {/* Title header */}
      <div className="font-display text-[10px] text-text-4 uppercase tracking-widest mb-1.5">
        DEAL MEMO &mdash; 10 STEPS
      </div>
      {/* Step counter */}
      <div className="font-display text-[9px] text-text-4/60 uppercase tracking-widest mb-3">
        STEP {currentStep} OF 10
      </div>

      {/* Progress bar — with glow on active segment */}
      <div className="relative h-1.5 rounded-full bg-bg-elevated mb-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold transition-all duration-500 ease-out"
          style={{
            width: `${progressPct}%`,
            boxShadow: '0 0 8px rgba(232,184,75,0.4)',
          }}
        />
      </div>

      {/* Step list */}
      <div className="flex-1 space-y-0.5">
        {STEPS.map((step) => {
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;

          return (
            <button
              key={step.num}
              type="button"
              onClick={() => goStep(step.num)}
              className={`group w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? 'bg-bg-hover border-l-2 border-l-gold'
                  : 'border-l-2 border-l-transparent hover:bg-bg-hover/50'
              }`}
            >
              {/* Numbered circle with tooltip */}
              <div
                className="flex-shrink-0 mt-px step-tooltip"
                data-tooltip={`Step ${step.num}`}
              >
                {isCompleted ? (
                  <div className="step-circle step-circle--completed">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="step-circle step-circle--active">
                    {step.num}
                  </div>
                ) : (
                  <div className="step-circle step-circle--pending group-hover:bg-white/[0.08] group-hover:text-white/50 transition-all duration-200">
                    {step.num}
                  </div>
                )}
              </div>

              {/* Labels */}
              <div className="min-w-0">
                <div className={`text-[11px] font-display font-semibold leading-tight transition-colors duration-150 ${
                  isActive ? 'text-text-1' : isCompleted ? 'text-text-2' : 'text-text-3 group-hover:text-text-2'
                }`}>
                  {step.label}
                </div>
                <div className="text-[9px] text-text-3/70 mt-0.5 leading-tight">
                  {step.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Scroll indicator — vertical line showing current position */}
      <div className="absolute right-0 top-[140px] bottom-[120px] w-[2px] opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div
          className="w-full rounded-full bg-gold/40 transition-all duration-500"
          style={{
            height: '10%',
            marginTop: `${((currentStep - 1) / 9) * 90}%`,
          }}
        />
      </div>

      {/* SELECTED AGREEMENT section at bottom */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-[8px] font-display font-semibold text-text-4 uppercase tracking-widest mb-2">
          Selected Agreement
        </div>
        <div className="px-2.5 py-2 rounded-lg bg-bg-elevated border border-border/50 transition-all duration-200 hover:border-gold/20">
          <div className="text-[11px] font-display font-bold text-gold leading-snug">
            {unionObj?.name || 'None selected'}
          </div>
          <div className="text-[9px] text-text-3 mt-0.5 leading-tight">
            {t.flag} {t.name} {'\u00b7'} {t.curr}
          </div>
        </div>
      </div>
    </nav>
  );
}
