// ============================================================
// ZILLIT CODA — Step 6: Nominal Coding
// Sections: 6A Labour Nominals, 6B Cost Centre, 6C HETV Tax Credit
// ============================================================

import { useState, useEffect } from 'react';
import { useDealMemoStore } from '../../../store/kate/useDealMemoStore';
import { Card, CardHeader, CardBody, Field, Select, Toggle, Badge, Alert } from '../../kate-ui/index';
import { NOMINAL_DEFAULTS } from '../../../data/kate/nominalDefaults';
import { ALL_DEPARTMENTS } from '../../../data/kate/territories';

// ── Helpers ──────────────────────────────────────────────────

interface NominalRow {
  id: string;
  /** e.g. "Basic Labour" */
  element: string;
  /** e.g. "4420 — Lighting Labour" */
  nominal: string;
  hp: boolean;
  override: boolean;
}

function parseNominalDefaults(department: string): NominalRow[] {
  const entries = NOMINAL_DEFAULTS[department] ?? NOMINAL_DEFAULTS.default;
  return entries.map((e, i) => ({
    id: `nom-${i}`,
    element: e.el,
    nominal: e.nom,
    hp: !!e.hp,
    override: false,
  }));
}

// Kate's HTML — strictly these 4 set codes, in this order, with these labels
const DEPT_NOMINAL_CODES = [
  { value: '1400', label: '1400 — Lighting' },
  { value: '1300', label: '1300 — Camera' },
  { value: '1500', label: '1500 — Grip' },
  { value: '1600', label: '1600 — Sound' },
];

// Kate's HTML — strictly these 4 departments (label only, no id)
const COST_CENTRE_DEPARTMENTS = [
  { value: 'Lighting / Electrical', label: 'Lighting / Electrical' },
  { value: 'Camera',                label: 'Camera' },
  { value: 'Grip',                  label: 'Grip' },
  { value: 'Sound',                 label: 'Sound' },
];

// Kate's HTML — strictly 3 budget line categories
const BUDGET_LINES = [
  { value: 'Below-the-Line Labour',  label: 'Below-the-Line Labour' },
  { value: 'Above-the-Line Labour',  label: 'Above-the-Line Labour' },
  { value: 'Post Production Labour', label: 'Post Production Labour' },
];

const HETV_CLASSIFICATIONS = [
  { value: 'G', label: 'G — Qualifying (HETVC)' },
  { value: 'B', label: 'B — Borderline' },
  { value: 'N', label: 'N — Non-qualifying' },
];

const UK_SPEND_OPTIONS = [
  { value: 'yes', label: 'Yes — UK Qualifying' },
  { value: 'no',  label: 'No — Non-UK' },
];

const TAX_CREDIT_RATE_OPTIONS = [
  { value: '25', label: '25% (High-end TV)' },
  { value: '45', label: '45% (Animation)' },
  { value: '20', label: '20% (Film)' },
  { value: 'na', label: 'N/A' },
];

// ── Component ────────────────────────────────────────────────

export default function Step6NominalCoding() {
  const store = useDealMemoStore();
  const department = store.department || 'default';
  const territory = store.territory;

  const [rows, setRows] = useState<NominalRow[]>(() => parseNominalDefaults(department));
  // Kate's HTML pre-selects the first option in each of the 3 selects.
  const [setCode, setSetCode] = useState((store as any).setCode ?? '1400');
  const [costCentreDept, setCostCentreDept] = useState<string>((store as any).costCentreDept ?? 'Lighting / Electrical');
  const [budgetLine, setBudgetLine] = useState((store as any).budgetLine ?? 'Below-the-Line Labour');
  const [hetvClassification, setHetvClassification] = useState((store as any).hetvClassification ?? '');
  const [ukSpend, setUkSpend] = useState<string>((store as any).ukSpend ?? 'yes');
  const [taxCreditRate, setTaxCreditRate] = useState((store as any).taxCreditRate ?? '25');

  // Reload nominals when department changes
  useEffect(() => {
    setRows(parseNominalDefaults(department));
  }, [department]);

  // Sync to store
  useEffect(() => {
    const codes: Record<string, string> = {};
    rows.forEach(r => {
      codes[r.element] = r.nominal;
    });
    store.update({ nominalCodes: codes });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  // Sync local fields to store
  useEffect(() => {
    store.update({ setCode, costCentreDept, budgetLine, hetvClassification, ukSpend, taxCreditRate } as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCode, costCentreDept, budgetLine, hetvClassification, ukSpend, taxCreditRate]);

  function updateRow(id: string, field: keyof NominalRow, value: string | number | boolean) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  function addRow() {
    setRows(prev => [
      ...prev,
      { id: `nom-${Date.now()}`, element: '', nominal: '', hp: false, override: false },
    ]);
  }

  function removeRow(id: string) {
    setRows(prev => prev.filter(r => r.id !== id));
  }

  const deptLabel = ALL_DEPARTMENTS.find(d => d.id === department)?.label ?? department;

  return (
    <div className="space-y-6">
      {/* ── Auto-sync alert ─────────────────────────── */}
      <Alert variant="green">
        Nominal codes auto-synced from the <strong>{deptLabel}</strong> department defaults. Override individual lines below if required.
      </Alert>

      {/* ── 6A: Labour Nominals Table ─────────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-text-3 text-[11px] font-mono">6A</span>
            <span className="text-text-1 text-[13px] font-display font-bold">Labour Nominals</span>
            <Badge variant="gold">{deptLabel}</Badge>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="px-2.5 py-1 text-[11px] font-display font-bold text-gold border border-gold/20 rounded-lg bg-gold/10 hover:bg-gold/20 transition-colors"
          >
            + Add Row
          </button>
        </CardHeader>
        <CardBody className="p-0">
          {/* Table header — Kate's 4 columns: Element | Default Nominal | HP? | Override */}
          <div className="grid grid-cols-[160px_1fr_60px_80px_40px] gap-3 px-4 py-2 border-b border-border bg-bg-elevated/50">
            <span className="text-[10px] text-text-4 font-display font-bold uppercase tracking-wide">Element</span>
            <span className="text-[10px] text-text-4 font-display font-bold uppercase tracking-wide">Default Nominal</span>
            <span className="text-[10px] text-text-4 font-display font-bold uppercase tracking-wide text-center">HP?</span>
            <span className="text-[10px] text-text-4 font-display font-bold uppercase tracking-wide text-center">Override</span>
            <span />
          </div>

          {/* Table rows */}
          {rows.map(row => (
            <div
              key={row.id}
              className="grid grid-cols-[160px_1fr_60px_80px_40px] gap-3 px-4 py-2 border-b border-border last:border-b-0 items-center hover:bg-bg-hover/30 transition-colors"
            >
              <input
                type="text"
                value={row.element}
                onChange={e => updateRow(row.id, 'element', e.target.value)}
                placeholder="Element"
                className="bg-bg-elevated border border-border rounded-lg px-2.5 py-1.5 text-[12px] text-text-1 focus:outline-none focus:border-border-light transition-colors w-full"
              />
              <input
                type="text"
                value={row.nominal}
                onChange={e => updateRow(row.id, 'nominal', e.target.value)}
                placeholder="0000 — Description"
                className="bg-bg-elevated border border-border rounded-lg px-2.5 py-1.5 text-[12px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors w-full"
              />
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={row.hp}
                  onChange={e => updateRow(row.id, 'hp', e.target.checked)}
                  className="accent-gold w-3.5 h-3.5 cursor-pointer"
                  title="Holiday Pay applies"
                />
              </div>
              <div className="flex items-center justify-center">
                <Toggle on={row.override} onToggle={() => updateRow(row.id, 'override', !row.override)} />
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="text-text-4 hover:text-red-400 transition-colors text-[14px] text-center"
                title="Remove row"
              >
                x
              </button>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="px-4 py-6 text-center text-text-4 text-[12px]">
              No nominal codes configured. Click "Add Row" to begin.
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── 6B: Cost Centre & Set Code ────────────────────────── */}
      <Card>
        <CardHeader>
          <span className="text-text-3 text-[11px] font-mono">6B</span>
          <span className="text-text-1 text-[13px] font-display font-bold ml-2">Cost Centre & Set Code</span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Primary Set Code">
              <Select
                value={setCode}
                onChange={setSetCode}
                options={DEPT_NOMINAL_CODES}
              />
            </Field>

            <Field label="Department">
              <Select
                value={costCentreDept}
                onChange={setCostCentreDept}
                options={COST_CENTRE_DEPARTMENTS}
              />
            </Field>

            <Field label="Budget Line">
              <Select
                value={budgetLine}
                onChange={setBudgetLine}
                options={BUDGET_LINES}
              />
            </Field>
          </div>
        </CardBody>
      </Card>

      {/* ── 6C: HETV Tax Credit Tagging (UK only) ─────────────── */}
      {territory === 'uk' && (
        <Card accent="purple">
          <CardHeader>
            <span className="text-text-3 text-[11px] font-mono">6C</span>
            <span className="text-text-1 text-[13px] font-display font-bold ml-2">HETV Tax Credit Tagging</span>
            <Badge variant="purple" className="ml-2">Section 1216</Badge>
          </CardHeader>
          <CardBody>
            <Alert variant="purple" className="mb-4">
              Tag this engagement for High-End Television Tax Relief (HETV). Ensure the Classification is
              accurate for Section 1216 qualifying expenditure.
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Core Creative Classification">
                <Select
                  value={hetvClassification}
                  onChange={setHetvClassification}
                  options={HETV_CLASSIFICATIONS}
                  placeholder="Select classification..."
                />
              </Field>

              <Field label="UK Spend?">
                <Select
                  value={ukSpend}
                  onChange={setUkSpend}
                  options={UK_SPEND_OPTIONS}
                  placeholder="Select..."
                />
              </Field>

              <Field label="Tax Credit Rate" hint="Current HETV rate for qualifying expenditure">
                <Select
                  value={taxCreditRate}
                  onChange={setTaxCreditRate}
                  options={TAX_CREDIT_RATE_OPTIONS}
                  placeholder="Select rate..."
                />
              </Field>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
