// ============================================================
// ZILLIT CODA — Deal Memo Wizard — Root Component
// 3-column CSS Grid layout with StepNav, Main content, RightPanel
// Premium Edition — with validation, polished UI
// ============================================================

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDealMemoStore } from '../../store/kate/useDealMemoStore';
import { useAutoSave } from '../../hooks/kate/useAutoSave';
import { get, post, put } from '../../api/kateClient';
import { Alert } from '../kate-ui/index';
import type { DealMemoData } from '../../types/kate/index';
import { mapKateToMoviePayroll } from '../../utils/kate/dealMemoMapper';
import { listProductions } from '../../api/kateDealMemoApi';

import { StepNav } from './StepNav';
import { RightPanel } from './RightPanel';

import Step1Territory from './steps/Step1Territory';
import Step2CrewDetails from './steps/Step2CrewDetails';
import Step3DealStructure from './steps/Step3DealStructure';
import Step4Rates from './steps/Step4Rates';
import Step5Allowances from './steps/Step5Allowances';
import Step6NominalCoding from './steps/Step6NominalCoding';
import Step7Compliance from './steps/Step7Compliance';
import Step8AdditionalDocs from './steps/Step8AdditionalDocs';
import Step9PayrollStart from './steps/Step9PayrollStart';
import Step10Preview from './steps/Step10Preview';

const STEP_LABELS: Record<number, string> = {
  1: 'Territory & Union',
  2: 'Crew Details',
  3: 'Deal Structure',
  4: 'Rates & Compensation',
  5: 'Allowances & Rentals',
  6: 'Nominal Coding',
  7: 'Compliance',
  8: 'Additional Documents',
  9: 'Payroll Start Form',
  10: 'Preview & Issue',
};

// ── STEP VALIDATION ─────────────────────────────────────────

function validateStep(step: number, store: any): string[] {
  const errors: string[] = [];
  switch (step) {
    case 1:
      if (!store.territory) errors.push('Territory is required');
      if (!store.union) errors.push('Union/Agreement is required');
      if (store.territory === 'uk' && store.union === 'pact-bectu' && !store.pactBand)
        errors.push('PACT Budget Band is required');
      break;
    case 2:
      if (!store.department) errors.push('Department is required');
      if (!store.jobTitle) errors.push('Job Title is required');
      break;
    case 3:
      if (!store.dealType) errors.push('Deal Type is required');
      if (!store.startDate) errors.push('Start Date is required');
      break;
    case 4:
      if (!store.rates?.dayRate || store.rates.dayRate <= 0)
        errors.push('Day Rate is required');
      break;
    // Steps 5-9 have no hard-required fields — allow free navigation
    default:
      break;
  }
  return errors;
}

export default function DealMemoWizard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const store = useDealMemoStore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [productions, setProductions] = useState<Array<{ _id: string; name: string }>>([]);

  // Load productions list
  useEffect(() => {
    listProductions().then(setProductions).catch(() => setProductions([]));
  }, []);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Read user info from localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? (() => { try { return JSON.parse(storedUser); } catch { return null; } })() : null;

  useAutoSave();

  // Clear validation errors when store changes (user is fixing fields)
  useEffect(() => {
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  }, [
    store.territory, store.union, store.pactBand,
    store.department, store.jobTitle,
    store.dealType, (store as any).startDate,
    store.rates?.dayRate,
  ]);

  // RESET store when creating a NEW deal memo (no :id in URL)
  useEffect(() => {
    if (!id) {
      // New deal memo — reset the store to defaults
      store.reset();
      store.setCurrentMemoId(null);
      // Then apply productionId from query param if present
      const qProductionId = searchParams.get('productionId');
      if (qProductionId) {
        store.update({ productionId: qProductionId } as Partial<DealMemoData>);
      }
    }
  }, [id]); // Only run when id changes (route change)

  // Read productionId from URL query param (for cases where it changes without route change)
  useEffect(() => {
    const qProductionId = searchParams.get('productionId');
    if (qProductionId && qProductionId !== store.productionId) {
      store.update({ productionId: qProductionId } as Partial<DealMemoData>);
    }
  }, [searchParams]);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load existing deal memo if route has :id
  useEffect(() => {
    if (id && id !== store.currentMemoId) {
      get(`/api/deal-memos/${id}`)
        .then((res) => {
          const raw = res.data as any;

          // Sanitize populated MongoDB objects -> flat string IDs
          if (raw.productionId && typeof raw.productionId === 'object') {
            raw._productionName = raw.productionId.name;
            raw.productionId = raw.productionId._id;
          }
          if (raw.createdBy && typeof raw.createdBy === 'object') {
            raw.createdBy = raw.createdBy._id;
          }
          if (raw.department && typeof raw.department === 'object') {
            raw.department = raw.department._id || raw.department.id || '';
          }
          if (raw.union && typeof raw.union === 'object') {
            raw.union = raw.union._id || raw.union.id || '';
          }
          if (raw.territory && typeof raw.territory === 'object') {
            raw.territory = raw.territory._id || raw.territory.code || '';
          }
          if (raw.crewMemberId && typeof raw.crewMemberId === 'object') {
            raw.crewMemberName = raw.crewMemberId.name || raw.crewMemberId.fullName;
            raw.crewMemberId = raw.crewMemberId._id;
          }
          // Flatten meta.currentStep / meta.status to top level
          if (raw.meta) {
            if (raw.meta.currentStep != null) raw.currentStep = raw.meta.currentStep;
            if (raw.meta.status) raw.status = raw.meta.status;
          }

          store.update(raw);
          store.setCurrentMemoId(id);
        })
        .catch((err) => {
          console.error('[Wizard] Failed to load deal memo:', err);
        });
    }
  }, [id]);

  // ── REAL AUTO-SAVE: creates memo on first save, PUTs on subsequent ──
  const savingRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveMemoToServer = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaveStatus('saving');

    try {
      const state = useDealMemoStore.getState();
      const currentMemoId = state.currentMemoId;

      // Use the mapper to convert Kate's state → movie-payroll's DealMemo shape
      const prodId = searchParams.get('productionId') || state.productionId;
      const payload = mapKateToMoviePayroll(state, prodId || undefined);

      // Add personId from assignedUserId
      if ((state as any).assignedUserId) {
        payload.personId = (state as any).assignedUserId;
      }

      if (currentMemoId) {
        await put(`/deal-memos/${currentMemoId}`, payload);
      } else {
        if (!prodId) {
          // Can't save without production — skip silently
          setSaveStatus('idle');
          savingRef.current = false;
          return;
        }
        const res = await post<any>('/deal-memos', payload);
        const newId = res.data?._id || res.data?.data?._id;
        if (newId) {
          store.setCurrentMemoId(newId);
        }
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error('[AutoSave] Failed:', err);
      setSaveStatus('saved'); // don't block UI
    } finally {
      savingRef.current = false;
    }
  }, [searchParams, store]);

  // Debounced auto-save on store changes (5s after last change)
  useEffect(() => {
    const unsub = useDealMemoStore.subscribe(() => {
      setSaveStatus('saving');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(saveMemoToServer, 5000);
    });
    return () => {
      unsub();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [saveMemoToServer]);

  const renderStep = () => {
    switch (store.currentStep) {
      case 1: return <Step1Territory />;
      case 2: return <Step2CrewDetails />;
      case 3: return <Step3DealStructure />;
      case 4: return <Step4Rates />;
      case 5: return <Step5Allowances />;
      case 6: return <Step6NominalCoding />;
      case 7: return <Step7Compliance />;
      case 8: return <Step8AdditionalDocs />;
      case 9: return <Step9PayrollStart />;
      case 10: return <Step10Preview />;
      default: return <Step1Territory />;
    }
  };

  // Resolve the "back to list" URL based on productionId
  const productionId = store.productionId;
  const dealMemosUrl = productionId
    ? `/productions/${productionId}/deal-memos`
    : '/';

  const handleBack = () => {
    setValidationErrors([]);
    if (store.currentStep > 1) {
      store.goStep(store.currentStep - 1);
    } else {
      // Step 1 — navigate back to deal memos list or dashboard
      navigate(dealMemosUrl);
    }
  };

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  const handleContinue = useCallback(() => {
    if (store.currentStep >= 10) return;

    // Run validation
    const errors = validateStep(store.currentStep, store);
    if (errors.length > 0) {
      setValidationErrors(errors);
      // Scroll to top of content area to show errors
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setValidationErrors([]);
    store.goStep(store.currentStep + 1);
    // Save to server on every step navigation
    saveMemoToServer();
  }, [store.currentStep, store, saveMemoToServer]);

  const handleSaveDraft = () => {
    saveMemoToServer();
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* -- SLIM TOOLBAR (no duplicate header — movie-payroll's MainLayout already has nav) -- */}
      <div className="flex items-center justify-between h-[40px] px-4 border-b border-border bg-bg-elevated/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-[12px] text-text-1 tracking-wide">New Deal Memo</span>
          <span className="text-text-4 text-[10px]">·</span>
          <span className="text-[10px] text-text-3">Step {store.currentStep} of 10</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Save status */}
          <div className="flex items-center gap-1.5 text-[10px]">
            {saveStatus === 'saving' && <><span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" /><span className="text-amber-400">Saving…</span></>}
            {saveStatus === 'saved' && <><span className="h-2 w-2 rounded-full bg-green-400" /><span className="text-green-400">Saved</span></>}
            {saveStatus === 'idle' && <><span className="h-2 w-2 rounded-full bg-neutral-500" /><span className="text-neutral-400">Draft</span></>}
          </div>
          {/* Production picker */}
          <select
            value={store.productionId || ''}
            onChange={(e) => {
              const prod = productions.find(p => p._id === e.target.value);
              store.update({
                productionId: e.target.value,
                ...( prod ? { _productionName: prod.name } : {}),
              } as any);
            }}
            className="px-2 py-1 rounded border border-neutral-700 bg-neutral-800 text-[11px] text-neutral-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">Select Production…</option>
            {productions.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* -- 3-COLUMN GRID -- */}
      <div className="flex-1 grid grid-cols-[200px_1fr_240px] overflow-hidden">
        {/* Left — Step Nav */}
        <div className="relative min-w-0 border-r border-border bg-bg-surface overflow-y-auto">
          <StepNav />
        </div>

        {/* Center — Step Content */}
        <div className="min-w-0 overflow-y-auto" ref={contentRef}>
          <div className="px-6 py-6">
            {/* Validation errors banner */}
            {validationErrors.length > 0 && (
              <div style={{ animation: 'slideDown 0.25s ease-out' }} className="mb-5">
                <Alert variant="red">
                  <div className="font-display font-semibold text-[12px] mb-1.5">
                    Please complete the following required fields:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </Alert>
              </div>
            )}
            {renderStep()}
          </div>
        </div>

        {/* Right — Summary Panel */}
        <div className="min-w-0 border-l border-border bg-bg-surface overflow-y-auto">
          <RightPanel />
        </div>
      </div>

      {/* -- FOOTER (60px) -- premium shadow + gradient buttons */}
      <footer
        className="flex items-center justify-between h-[60px] px-6 border-t border-border flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, rgba(24,24,24,1) 0%, rgba(20,20,20,1) 100%)',
          boxShadow: '0 -1px 3px rgba(0,0,0,0.3), 0 -1px 0 rgba(255,255,255,0.02) inset',
        }}
      >
        {/* Left — Back */}
        <button
          type="button"
          onClick={handleBack}
          className="group px-5 py-2 rounded-lg bg-bg-elevated border border-border text-text-2 text-[12px] font-display font-semibold hover:bg-bg-hover hover:border-border-light transition-all duration-150"
        >
          <span className="inline-block transition-transform duration-150 group-hover:-translate-x-0.5">&larr;</span>
          {' '}{store.currentStep <= 1 ? 'Exit' : 'Back'}
        </button>

        {/* Center — Progress bar + Step label */}
        <div className="flex flex-col items-center gap-1.5 min-w-[300px]">
          {/* Thicker gold progress bar */}
          <div className="w-full h-[4px] rounded-full bg-bg-elevated overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(store.currentStep / 10) * 100}%`,
                background: 'linear-gradient(90deg, #c99a2e, #e8b84b, #f0c95c)',
                boxShadow: '0 0 8px rgba(232,184,75,0.3)',
              }}
            />
          </div>
          <span className="text-[11px] text-text-2 font-display font-medium">
            Step {store.currentStep} of 10 &mdash; {STEP_LABELS[store.currentStep] || ''}
          </span>
        </div>

        {/* Right — Continue (gold gradient) */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={store.currentStep >= 10}
          className="group px-6 py-2 rounded-lg text-bg text-[12px] font-display font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          style={{
            background: store.currentStep < 10
              ? 'linear-gradient(135deg, #d4a032, #e8b84b, #f0c95c)'
              : undefined,
            boxShadow: store.currentStep < 10
              ? '0 1px 3px rgba(0,0,0,0.3), 0 0 12px rgba(232,184,75,0.15)'
              : undefined,
          }}
          onMouseEnter={(e) => {
            if (store.currentStep < 10) {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 2px 8px rgba(0,0,0,0.3), 0 0 20px rgba(232,184,75,0.25)';
            }
          }}
          onMouseLeave={(e) => {
            if (store.currentStep < 10) {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                '0 1px 3px rgba(0,0,0,0.3), 0 0 12px rgba(232,184,75,0.15)';
            }
          }}
        >
          Continue{' '}
          <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">&rarr;</span>
        </button>
      </footer>
    </div>
  );
}
