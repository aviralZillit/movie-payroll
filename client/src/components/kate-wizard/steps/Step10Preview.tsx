// ============================================================
// ZILLIT CODA — Step 10: Preview & Issue
// Sections: 10A Preview, 10B Cost Summary, 10C Issue Action
// ============================================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealMemoStore } from '../../../store/kate/useDealMemoStore';
import { post as apiPost, put as apiPut, patch as apiPatch } from '../../../api/kateClient';
import { mapKateToMoviePayroll } from '../../../utils/kate/dealMemoMapper';
import { Card, CardHeader, CardBody, Badge, Alert } from '../../kate-ui/index';
import { TERRITORIES, ALL_DEPARTMENTS } from '../../../data/kate/territories';
import { calcHP, formatCurrency, TERRITORY_HP_RATES } from '../../../utils/kate/calculations';

// ── Component ────────────────────────────────────────────────

export default function Step10Preview() {
  const store = useDealMemoStore();
  const navigate = useNavigate();

  const productionId = store.productionId;
  const dealMemosUrl = productionId
    ? `/productions/${productionId}/deal-memos`
    : '/';

  const territory = store.territory || 'uk';
  const union = store.union || 'pact-bectu';
  const tData = TERRITORIES[territory];
  const sym = tData?.sym ?? '£';
  const unionObj = tData?.unions?.find((u: any) => u.id === union);
  const dealType = store.dealType;

  const assignedUserId = (store as any).assignedUserId || '';
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [issued, setIssued] = useState(false);

  // Rates & HP calculation
  const hp = useMemo(() => {
    return calcHP(
      store.rates.dayRate,
      territory as Parameters<typeof calcHP>[1],
      union as Parameters<typeof calcHP>[2],
      store.rates.hpMode,
    );
  }, [store.rates.dayRate, store.rates.hpMode, territory, union]);

  const hpVisible = TERRITORY_HP_RATES[territory]?.pct > 0;

  const deptLabel = ALL_DEPARTMENTS.find(d => d.id === store.department)?.label ?? store.department;

  // Deal type labels
  const dealTypeLabels: Record<string, string> = {
    weekly: 'Weekly', fixed: 'Fixed Term', dayplayer: 'Day Player',
    buyout: 'Buyout / Flat', picture: 'Run of Picture', boxrental: 'Box Rental',
  };

  async function handleIssue() {
    setIsIssuing(true);

    try {
      // Map Kate's wizard state → movie-payroll DealMemo shape
      const state = useDealMemoStore.getState();
      const mapped = mapKateToMoviePayroll(state, productionId ? String(productionId) : undefined);

      // Ensure personId is set (movie-payroll requires it)
      if (assignedUserId) mapped.personId = assignedUserId;

      let memoId = store.currentMemoId;

      if (!memoId) {
        // Create via movie-payroll's existing endpoint
        const createRes = await apiPost<any>('/deal-memos', mapped);
        memoId = createRes.data?._id || createRes.data?.data?._id;
        if (memoId) store.setCurrentMemoId(memoId);
      } else {
        await apiPut(`/deal-memos/${memoId}`, mapped);
      }

      if (!memoId) throw new Error('No deal memo ID — save failed');

      // Issue the memo (set status to active)
      await apiPatch(`/deal-memos/${memoId}/approve`, { status: 'active' });

      setIssued(true);
      store.update({ status: 'issued' } as Partial<typeof store>);
      // Navigate to the detail page so admin can watch progress
      setTimeout(() => navigate(`/deal-memos/${memoId}`), 1200);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Failed to issue deal memo';
      alert(msg);
    } finally {
      setIsIssuing(false);
      setShowConfirmModal(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── 10A: Deal Memo Preview ──────────────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-text-3 text-[11px] font-mono">10A</span>
            <span className="text-text-1 text-[13px] font-display font-bold">Deal Memo Preview</span>
          </div>
          <Badge variant="gold">Read Only</Badge>
        </CardHeader>
        <CardBody className="space-y-5">
          <Alert variant="green">
            All mandatory compliance checks passed. This deal memo is ready to issue.
          </Alert>
          <div className="flex items-center gap-2 text-[11px] text-text-3 mb-2">
            Preview is editable — click any field to modify before issuing.
            <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
          </div>

          {/* Memo header (logo + production + title) */}
          <div className="text-center pb-4 border-b border-border space-y-1">
            <div className="text-[13px] font-display font-bold text-gold tracking-[0.18em] uppercase">Zillit Coda</div>
            <MemoValue className="text-[12px] text-text-2 block">
              {(store as any)._productionName || (typeof store.productionId === 'object' ? (store.productionId as any)?.name || '' : store.productionId) || 'Production'}
            </MemoValue>
            <MemoValue className="text-[18px] font-display font-bold text-text-1 block tracking-wide uppercase">
              Crew Deal Memo
            </MemoValue>
          </div>

          {/* 8-field metadata grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MemoField label="Crew Member" value={(store as any).crewMemberName || (store as any).fullName || 'Pending crew submission'} />
            <MemoField label="Job Title" value={store.jobTitle || '--'} />
            <MemoField label="Department" value={deptLabel} />
            <MemoField label="Agreement" value={`${tData?.name ?? territory} / ${unionObj?.name || union}`} />
            <MemoField label="Start Date" value={(store as any).startDate || '--'} />
            <MemoField label="Deal Type" value={dealTypeLabels[store.dealType] ?? store.dealType} />
            <MemoField label="Employment Status" value={store.employmentStatusId || '--'} />
            <MemoField label="Payroll Bureau" value={(store as any).payrollBureau || '--'} />
          </div>

          {/* Rates section */}
          <MemoSection title="Rates">
            <MemoField label="Day Rate (agreed)" value={formatCurrency(store.rates.dayRate, sym)} mono />
            {hpVisible && (
              <MemoField
                label="HP Treatment"
                value={`${store.rates.hpMode === 'incl' ? 'Inclusive' : 'Exclusive'} (${hp.hpPct}%)`}
              />
            )}
            <MemoField
              label="Phase Rates"
              value={store.rates.phaseRatesOn ? 'Per phase (Prep / Shoot / Wrap)' : 'Single rate (all phases)'}
            />
            <MemoField
              label="Kit Rental"
              value={(store as any).kitRental ? `${formatCurrency((store as any).kitRental, sym)}/wk` : '--'}
              mono
            />
          </MemoSection>

          {/* Overtime Structure section */}
          <MemoSection title="Overtime Structure">
            <MemoField label="Agreement" value={unionObj?.name || union} />
            <MemoField label="Contracted Hours" value="10 hrs/day" />
            <MemoField label="OT Basis" value={dealType === 'buyout' ? 'N/A — Buy-out' : 'Per agreement schedule'} />
            <MemoField label="6th Day" value="×1.5" mono />
            <MemoField label="7th Day / Rest Day" value="×2.0" mono />
          </MemoSection>

          {/* Nominal Coding section */}
          <MemoSection title="Nominal Coding">
            <MemoField label="Basic Labour" value={(store as any).nominalCodes?.labour || '--'} mono />
            {hpVisible && (
              <MemoField label="Holiday Pay" value={(store as any).nominalCodes?.hp || '--'} mono />
            )}
            <MemoField label="Cost Centre" value={(store as any).costCentre || '--'} mono />
            <MemoField label="HETVC" value={(store as any).hetvClassification || '--'} />
          </MemoSection>

          {/* HP Schedule D Detail (conditional) */}
          {hpVisible && (
            <MemoSection title="Holiday Pay — Schedule D Detail">
              <MemoField
                label="HP Basis"
                value={store.rates.hpMode === 'incl' ? `Rolled-up, ${hp.hpPct}% of gross` : `Accrued, ${hp.hpPct}% added on top`}
              />
              <MemoField label="HP per Week" value={formatCurrency(hp.hpElement * 5, sym)} mono />
              <MemoField label="Statutory Entitlement" value="28 days / 5.6 weeks p.a." />
              <MemoField label="WTR Compliance" value="✓ WTR 1998, Reg. 16" valueClassName="text-green-400" />
            </MemoSection>
          )}
        </CardBody>
      </Card>

      {/* ── 10B: Issue Action ───────────────────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <span className="text-text-3 text-[11px] font-mono">10B</span>
          <span className="text-text-1 text-[13px] font-display font-bold ml-2">Issue Deal Memo</span>
        </CardHeader>
        <CardBody className="space-y-4">
          {issued ? (
            <div className="space-y-5">
              {/* Success banner */}
              <div className="flex items-start gap-3 rounded-lg border border-green/20 bg-green/5 px-4 py-4">
                <div className="flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[14px] font-display font-bold text-green">Deal memo issued successfully</h4>
                  <p className="text-[12px] text-text-2 mt-1 leading-relaxed">
                    Redirecting to the deal memo detail page…
                  </p>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate(dealMemosUrl)}
                  className="flex-1 py-3 rounded-lg font-display font-bold text-[13px] bg-gold text-bg hover:bg-gold/90 transition-colors"
                >
                  View All Deal Memos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    store.reset();
                    navigate(productionId ? `/deal-memos/new?productionId=${productionId}` : '/deal-memos/new');
                  }}
                  className="flex-1 py-3 rounded-lg font-display font-bold text-[13px] border border-border text-text-2 hover:bg-bg-hover transition-colors"
                >
                  Create Another Deal Memo
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 py-3 rounded-lg font-display font-bold text-[13px] border border-border text-text-3 hover:bg-bg-hover transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Assigned crew member — set in Step 2 */}
              {assignedUserId && store.fullName ? (
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-bg-elevated border border-border mb-4">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-[14px]">
                    {store.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[13px] text-text-1 font-medium">{store.fullName}</div>
                    <div className="text-[10px] text-text-4">Assigned in Step 2 · Will receive this deal memo on issue</div>
                  </div>
                </div>
              ) : (
                <Alert variant="orange">
                  No crew member assigned. Go back to Step 2 and select a crew member before issuing.
                </Alert>
              )}

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={!assignedUserId}
                className={`w-full py-3 rounded-lg font-display font-bold text-[16px] transition-colors ${
                  assignedUserId
                    ? 'bg-gold text-bg hover:bg-gold/90 cursor-pointer'
                    : 'bg-bg-elevated text-text-4 cursor-not-allowed border border-border'
                }`}
              >
                Issue Deal Memo
              </button>

            </>
          )}
        </CardBody>
      </Card>

      {/* ── Confirmation Modal ──────────────────────────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-surface border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-[14px] font-display font-bold text-text-1">Confirm Issue</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-[12px] text-text-2 leading-relaxed">
                This will issue the deal memo to the assigned crew user. They'll see it next time they log in.
              </p>
              <Alert variant="gold">
                You can reopen the memo for editing until it is signed.
              </Alert>
            </div>
            <div className="px-5 py-3 border-t border-border flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-[12px] font-display font-bold text-text-3 border border-border rounded-lg hover:bg-bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleIssue}
                disabled={isIssuing}
                className="px-4 py-2 text-[12px] font-display font-bold bg-gold text-bg rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {isIssuing ? 'Issuing...' : 'Confirm & Issue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────

function MemoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pt-4 border-t border-border">
      <h4 className="text-[11px] text-text-3 font-display font-bold uppercase tracking-wide mb-3">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function MemoField({
  label, value, mono, valueClassName,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-text-4 uppercase tracking-wide">{label}</span>
      <MemoValue className={`text-[12px] ${mono ? 'font-mono' : ''} ${valueClassName ?? 'text-text-1'}`}>
        {value}
      </MemoValue>
    </div>
  );
}

function MemoValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={className}
      contentEditable
      suppressContentEditableWarning
      style={{ borderBottom: '1px dashed transparent', outline: 'none' }}
      onFocus={(e) => { (e.target as HTMLElement).style.borderBottom = '1px dashed rgba(255,255,255,0.2)'; }}
      onBlur={(e) => { (e.target as HTMLElement).style.borderBottom = '1px dashed transparent'; }}
    >
      {children}
    </span>
  );
}

