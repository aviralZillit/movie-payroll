// ============================================================
// ZILLIT CODA — Step 9: Payroll Start Form
// Sections: 9A Bureau Selection, 9B Export/Sync, 9C Bank Details
// ============================================================

import { useState, useEffect } from 'react';
import { useDealMemoStore } from '../../../store/kate/useDealMemoStore';
import { Card, CardHeader, CardBody, Field, Select, Toggle } from '../../kate-ui/index';

// ── Bureau options ───────────────────────────────────────────

interface BureauOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const BUREAU_OPTIONS: BureauOption[] = [
  {
    id: 'sargent-disc',
    name: 'Sargent-Disc (Wrapbook UK)',
    icon: '\uD83D\uDFE6',
    description: 'Auto-export via SFTP — deal memo maps to Sargent-Disc rate card format',
  },
  {
    id: 'ep',
    name: 'Entertainment Partners (EP)',
    icon: '\uD83D\uDFE9',
    description: 'EP SmartStart integration — digital start packet auto-populated',
  },
  {
    id: 'cast-crew',
    name: 'Cast & Crew (C2W)',
    icon: '\uD83D\uDFE7',
    description: 'C2W Smart Start compatible export',
  },
  {
    id: 'internal-bacs',
    name: 'Internal BACS Processing',
    icon: '\uD83D\uDFEA',
    description: 'Zillit Coda payroll — BACS Standard 18 generated at weekly close',
  },
  {
    id: 'external',
    name: 'External / Manual',
    icon: '\u2B1C',
    description: 'Download CSV / JSON — manual upload to bureau system',
  },
];

const PAY_FREQUENCY_OPTIONS = [
  { value: 'weekly',    label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly',   label: 'Monthly' },
];

// ── Component ────────────────────────────────────────────────

export default function Step9PayrollStart() {
  const store = useDealMemoStore();

  const [selectedBureau, setSelectedBureau] = useState((store as any).payrollBureau ?? '');
  const [firstPayPeriod, setFirstPayPeriod] = useState((store as any).payrollStartDate ?? '');
  const [payFrequency, setPayFrequency] = useState((store as any).payFrequency ?? 'weekly');

  // Sync pay frequency to store
  useEffect(() => {
    store.update({ payFrequency } as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payFrequency]);

  function selectBureau(id: string) {
    setSelectedBureau(id);
    store.update({ payrollBureau: id });
  }

  function handleFirstPayChange(val: string) {
    setFirstPayPeriod(val);
    store.update({ payrollStartDate: val });
  }

  return (
    <div className="space-y-6">
      {/* ── 9A: Payroll Bureau Selection ────────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <span className="text-text-3 text-[11px] font-mono">9A</span>
          <span className="text-text-1 text-[13px] font-display font-bold ml-2">Payroll Bureau Selection</span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BUREAU_OPTIONS.map(bureau => (
              <label
                key={bureau.id}
                className={`flex items-start gap-3 px-4 py-3.5 rounded-lg border cursor-pointer transition-colors ${
                  selectedBureau === bureau.id
                    ? 'bg-gold/10 border-gold/20'
                    : 'bg-bg-elevated border-border hover:border-border-light'
                }`}
              >
                <input
                  type="radio"
                  name="payroll-bureau"
                  value={bureau.id}
                  checked={selectedBureau === bureau.id}
                  onChange={() => selectBureau(bureau.id)}
                  className="accent-gold w-3.5 h-3.5 mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px]">{bureau.icon}</span>
                    <span className="text-[12px] text-text-1 font-medium">{bureau.name}</span>
                  </div>
                  <p className="text-[11px] text-text-3 mt-1 leading-relaxed">{bureau.description}</p>
                </div>
              </label>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ── 9B: Export & Sync Settings ──────────────────────────── */}
      <Card>
        <CardHeader>
          <span className="text-text-3 text-[11px] font-mono">9B</span>
          <span className="text-text-1 text-[13px] font-display font-bold ml-2">Export & Sync Settings</span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Pay Period Start" hint="When the first pay period begins for this crew member">
              <input
                type="date"
                value={firstPayPeriod}
                onChange={e => handleFirstPayChange(e.target.value)}
                className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none focus:border-border-light transition-colors"
              />
            </Field>

            <Field label="Pay Frequency" hint="How often this crew member is paid">
              <Select
                value={payFrequency}
                onChange={setPayFrequency}
                options={PAY_FREQUENCY_OPTIONS}
              />
            </Field>
          </div>

          <div className="space-y-3 mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-text-2 font-display">Auto-sync deal memo changes to payroll</div>
                <div className="text-[9px] text-text-4">Amendments automatically pushed to bureau</div>
              </div>
              <Toggle on={(store as any).payrollAutoSync ?? true} onToggle={() => store.update({ payrollAutoSync: !((store as any).payrollAutoSync ?? true) } as any)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-text-2 font-display">Notify payroll contact on issue</div>
                <div className="text-[9px] text-text-4">Email notification sent when deal memo is issued</div>
              </div>
              <Toggle on={(store as any).payrollNotifyOnIssue ?? true} onToggle={() => store.update({ payrollNotifyOnIssue: !((store as any).payrollNotifyOnIssue ?? true) } as any)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-text-2 font-display">Include deal memo PDF in bureau export</div>
                <div className="text-[9px] text-text-4">Attach full PDF to payroll submission package</div>
              </div>
              <Toggle on={(store as any).payrollIncludePdf ?? false} onToggle={() => store.update({ payrollIncludePdf: !(store as any).payrollIncludePdf } as any)} />
            </div>
          </div>
        </CardBody>
      </Card>

    </div>
  );
}
