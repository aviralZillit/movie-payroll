// ============================================================
// DealMemoPreview — shared read-only memo-grid used in both
// Step 10 wizard preview and DealMemoDetail page.
// ============================================================

import type { ReactNode } from 'react';

function fmt(value: unknown, fallback = '--'): string {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}

function currency(amount: unknown, sym = '£'): string {
  const n = typeof amount === 'number' ? amount : Number(amount);
  if (!isFinite(n) || n === 0) return '--';
  return `${sym}${n.toFixed(2)}`;
}

interface MemoData {
  fullName?: string;
  preferredName?: string;
  jobTitle?: string;
  customJobTitle?: string;
  department?: string;
  territory?: string;
  union?: string;
  employmentStatusId?: string;
  dealType?: string;
  startDate?: string;
  endDate?: string;
  payrollBureau?: string;
  rates?: any;
  productionId?: any;
  kitRental?: number;
  nominalCodes?: any;
  costCentre?: string;
  hetvClassification?: string;
  [key: string]: unknown;
}

export default function DealMemoPreview({
  memo,
  sym = '£',
  editableFields,
}: {
  memo: MemoData;
  sym?: string;
  /** Optional — if provided, render the matching field as an inline input with onChange */
  editableFields?: Record<string, { value: string; onChange: (v: string) => void }>;
}) {
  const productionName =
    typeof memo.productionId === 'object' && memo.productionId !== null
      ? (memo.productionId as any).name
      : (memo as any)._productionName || 'Production';

  const rates = memo.rates ?? {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center pb-4 border-b border-border space-y-1">
        <div className="text-[13px] font-display font-bold text-gold tracking-[0.18em] uppercase">Zillit Coda</div>
        <div className="text-[12px] text-text-2">{productionName}</div>
        <div className="text-[18px] font-display font-bold text-text-1 tracking-wide uppercase">Crew Deal Memo</div>
      </div>

      {/* 8-field metadata grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MemoField label="Crew Member" value={fmt(memo.fullName, 'Pending crew submission')} />
        <MemoField label="Job Title" value={fmt(memo.jobTitle)} />
        <MemoField label="Department" value={fmt(memo.department)} />
        <MemoField label="Agreement" value={`${fmt(memo.territory)} / ${fmt(memo.union)}`} />
        <MemoField label="Start Date" value={fmt(memo.startDate)} />
        <MemoField label="Deal Type" value={fmt(memo.dealType)} />
        <MemoField label="Employment Status" value={fmt(memo.employmentStatusId)} />
        <MemoField label="Payroll Bureau" value={fmt(memo.payrollBureau)} />
      </div>

      {/* Rates */}
      <MemoSection title="Rates">
        <MemoField label="Day Rate (agreed)" value={currency(rates.dayRate, sym)} mono />
        <MemoField
          label="HP Treatment"
          value={
            rates.hpMode
              ? `${rates.hpMode === 'incl' ? 'Inclusive' : 'Exclusive'}`
              : '--'
          }
        />
        <MemoField
          label="Phase Rates"
          value={rates.phaseRatesOn ? 'Per phase (Prep / Shoot / Wrap)' : 'Single rate (all phases)'}
        />
        <MemoField
          label="Kit Rental"
          value={memo.kitRental ? `${currency(memo.kitRental, sym)}/wk` : '--'}
          mono
        />
      </MemoSection>

      {/* Nominal Coding */}
      <MemoSection title="Nominal Coding">
        <MemoField label="Basic Labour" value={fmt(memo.nominalCodes?.labour)} mono />
        <MemoField label="Cost Centre" value={fmt(memo.costCentre)} mono />
        <MemoField label="HETVC" value={fmt(memo.hetvClassification)} />
      </MemoSection>

      {/* Crew-completed personal + bank (these are what the crew can fill in) */}
      <MemoSection title="Personal Details">
        <EditableOrStatic
          label="Full Legal Name"
          fieldKey="fullName"
          editableFields={editableFields}
          fallback={fmt(memo.fullName)}
        />
        <EditableOrStatic
          label="Preferred Name"
          fieldKey="preferredName"
          editableFields={editableFields}
          fallback={fmt(memo.preferredName)}
        />
        <EditableOrStatic
          label="Date of Birth"
          fieldKey="dob"
          editableFields={editableFields}
          fallback={fmt((memo as any).dob)}
        />
        <EditableOrStatic
          label="National Insurance"
          fieldKey="nationalInsurance"
          editableFields={editableFields}
          fallback={fmt((memo as any).nationalInsurance)}
        />
        <EditableOrStatic
          label="Tax Code"
          fieldKey="taxCode"
          editableFields={editableFields}
          fallback={fmt((memo as any).taxCode)}
        />
        <EditableOrStatic
          label="Right to Work"
          fieldKey="rightToWork"
          editableFields={editableFields}
          fallback={fmt((memo as any).rightToWork)}
        />
      </MemoSection>

      <MemoSection title="Bank Details (crew to complete)">
        <EditableOrStatic
          label="Sort Code"
          fieldKey="bankSortCode"
          editableFields={editableFields}
          fallback={fmt((memo as any).bankSortCode)}
        />
        <EditableOrStatic
          label="Account Number"
          fieldKey="bankAccountNumber"
          editableFields={editableFields}
          fallback={fmt((memo as any).bankAccountNumber)}
        />
        <EditableOrStatic
          label="Bank Name"
          fieldKey="bankName"
          editableFields={editableFields}
          fallback={fmt((memo as any).bankName)}
        />
        <EditableOrStatic
          label="IBAN"
          fieldKey="bankIban"
          editableFields={editableFields}
          fallback={fmt((memo as any).bankIban)}
        />
      </MemoSection>
    </div>
  );
}

function MemoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="pt-4 border-t border-border">
      <h4 className="text-[11px] text-text-3 font-display font-bold uppercase tracking-wide mb-3">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function MemoField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-text-4 uppercase tracking-wide">{label}</span>
      <span className={`text-[12px] text-text-1 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function EditableOrStatic({
  label,
  fieldKey,
  editableFields,
  fallback,
}: {
  label: string;
  fieldKey: string;
  editableFields?: Record<string, { value: string; onChange: (v: string) => void }>;
  fallback: string;
}) {
  const editable = editableFields?.[fieldKey];
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-text-4 uppercase tracking-wide">{label}</span>
      {editable ? (
        <input
          type="text"
          value={editable.value}
          onChange={(e) => editable.onChange(e.target.value)}
          placeholder="—"
          className="text-[12px] text-text-1 bg-bg-elevated border border-border rounded px-2 py-1 focus:outline-none focus:border-gold transition-colors"
        />
      ) : (
        <span className="text-[12px] text-text-1">{fallback}</span>
      )}
    </div>
  );
}
