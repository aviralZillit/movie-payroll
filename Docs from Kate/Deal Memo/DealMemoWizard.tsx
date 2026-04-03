'use client';
// ─────────────────────────────────────────────────────────────────────────────
// Zillit Coda — Deal Memo Wizard — Main Shell
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { useDealMemoStore } from '../store/dealMemoStore';
import { StepNav } from './StepNav';
import { SummaryPanel } from './SummaryPanel';
import { ProductionSettingsDrawer } from './ProductionSettingsDrawer';

// Step components
import { Step1TerritoryUnion } from './steps/Step1TerritoryUnion';
import { Step2CrewDetails } from './steps/Step2CrewDetails';
import { Step3DealStructure } from './steps/Step3DealStructure';
import { Step4Rates } from './steps/Step4Rates';
import { Step5Allowances } from './steps/Step5Allowances';
import { Step6NominalCoding } from './steps/Step6NominalCoding';
import { Step7Compliance } from './steps/Step7Compliance';
import { Step8AdditionalDocs } from './steps/Step8AdditionalDocs';
import { Step9PayrollStartForm } from './steps/Step9PayrollStartForm';
import { Step10PreviewIssue } from './steps/Step10PreviewIssue';

// ── Step labels ───────────────────────────────────────────────────────────────

const STEP_LABELS = [
  'Territory & Union',
  'Crew Details',
  'Deal Structure',
  'Rates & Compensation',
  'Allowances & Rentals',
  'Nominal Coding',
  'Compliance & Onboarding',
  'Additional Documents',
  'Payroll Start Form',
  'Preview & Issue',
] as const;

const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  1: Step1TerritoryUnion,
  2: Step2CrewDetails,
  3: Step3DealStructure,
  4: Step4Rates,
  5: Step5Allowances,
  6: Step6NominalCoding,
  7: Step7Compliance,
  8: Step8AdditionalDocs,
  9: Step9PayrollStartForm,
  10: Step10PreviewIssue,
};

// ── Component ─────────────────────────────────────────────────────────────────

interface DealMemoWizardProps {
  /** Pre-populated production ID from route params */
  productionId?: string;
  /** Pre-populated deal memo ID when editing existing */
  dealMemoId?: string;
}

export function DealMemoWizard({ productionId, dealMemoId }: DealMemoWizardProps) {
  const {
    currentStep,
    nextStep,
    prevStep,
    issueDealMemo,
    status,
  } = useDealMemoStore();

  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [issuing, setIssuing] = React.useState(false);

  // Scroll main content to top on step change
  const mainRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleIssue = async () => {
    setIssuing(true);
    try {
      await issueDealMemo();
    } finally {
      setIssuing(false);
    }
  };

  const StepComponent = STEP_COMPONENTS[currentStep];
  const progressPct = (currentStep / 10) * 100;

  return (
    // Full-viewport layout — three columns with independent scroll
    // Topbar is rendered by the parent layout (app/payroll/deal-memos/new/layout.tsx)
    <div className="fixed inset-0 top-[52px] flex overflow-hidden bg-[#0b0c10]">

      {/* ── LEFT NAV ─────────────────────────────────────────────────────── */}
      <aside className="w-[232px] flex-shrink-0 flex flex-col border-r border-[#1e2030] bg-[#0f1117] overflow-hidden">
        <div className="flex-1 overflow-y-auto py-4">
          {/* Section label */}
          <p className="px-[18px] pb-2 text-[9px] font-mono tracking-[2px] uppercase text-[#3d4257]">
            Deal Memo — 10 Steps
          </p>

          {/* Step items */}
          {STEP_LABELS.map((label, idx) => {
            const step = idx + 1;
            const isActive = step === currentStep;
            const isDone = step < currentStep;
            return (
              <StepNav
                key={step}
                step={step}
                label={label}
                sublabel={getStepSublabel(step)}
                isActive={isActive}
                isDone={isDone}
                onClick={() => useDealMemoStore.getState().goToStep(step)}
              />
            );
          })}
        </div>

        {/* Footer: selected agreement chip + production settings */}
        <div className="flex-shrink-0 border-t border-[#1e2030] p-[14px_18px]">
          <UnionChip />
          <button
            onClick={() => setSettingsOpen(true)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 text-[10px] text-[#6b7280] hover:text-[#e8b84b] border border-[#1e2030] hover:border-[#3a3020] rounded-[6px] py-1.5 transition-colors"
          >
            ⚙ Production Default Rules
          </button>
        </div>
      </aside>

      {/* ── MAIN COLUMN ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Scrollable step content */}
        <div ref={mainRef} className="flex-1 overflow-y-auto px-7 py-6 min-h-0">
          {StepComponent && <StepComponent />}
        </div>

        {/* Step footer — progress + navigation */}
        <div className="flex-shrink-0 border-t border-[#1e2030] bg-[#0f1117] px-7 py-3 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-[#6b7280] mb-1.5">
              Step {currentStep} of 10 — {STEP_LABELS[currentStep - 1]}
            </p>
            <div className="h-[3px] bg-[#1e2030] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#e8b84b] rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="px-3 py-1.5 text-[12px] font-medium text-[#9ca3af] border border-[#1e2030] rounded-[6px] hover:bg-[#1e2030] transition-colors"
            >
              ← Back
            </button>
          )}

          {currentStep < 10 ? (
            <button
              onClick={nextStep}
              className="px-4 py-1.5 text-[12px] font-semibold bg-[#e8b84b] text-[#0b0c10] rounded-[6px] hover:bg-[#f0c96a] transition-colors"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleIssue}
              disabled={issuing}
              className="px-4 py-1.5 text-[12px] font-semibold bg-[#e8b84b] text-[#0b0c10] rounded-[6px] hover:bg-[#f0c96a] disabled:opacity-60 transition-colors"
            >
              {issuing ? '⏳ Issuing…' : '🚀 Issue Deal Memo'}
            </button>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <aside className="w-[330px] flex-shrink-0 flex flex-col border-l border-[#1e2030] bg-[#0f1117] overflow-hidden">
        <SummaryPanel />
      </aside>

      {/* ── PRODUCTION SETTINGS DRAWER ───────────────────────────────────── */}
      <ProductionSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UnionChip() {
  const { unionKey, territory } = useDealMemoStore();
  const { TERRITORY_RULES } = require('../data/territoryRules');
  const rule = TERRITORY_RULES[unionKey] || TERRITORY_RULES.default;
  const flagMap: Record<string, string> = {
    UK: '🇬🇧', US: '🇺🇸', CA: '🇨🇦', AU: '🇦🇺',
    NZ: '🇳🇿', DE: '🇩🇪', FR: '🇫🇷', IE: '🇮🇪',
  };
  return (
    <div className="bg-[#161820] border border-[#1e2030] rounded-lg p-[10px_12px]">
      <p className="text-[9px] font-mono tracking-[1.5px] uppercase text-[#3d4257] mb-1">Selected Agreement</p>
      <p className="text-[12px] font-semibold text-[#e8b84b] leading-tight">{rule.badge}</p>
      <p className="text-[10px] text-[#6b7280] mt-0.5">{flagMap[territory] || '🌍'} {territory}</p>
    </div>
  );
}

function getStepSublabel(step: number): string {
  const subs: Record<number, string> = {
    1: 'Entity, dept & agreement',
    2: 'Identity & employment',
    3: 'Type, dates & guarantees',
    4: 'OT tiers, HP, currency',
    5: 'Kit, car, caps & rules',
    6: 'Auto-synced from deal',
    7: 'Union & territory rules',
    8: 'NDA, policies, contract',
    9: 'Bureau export',
    10: 'Sign & activate',
  };
  return subs[step] || '';
}
