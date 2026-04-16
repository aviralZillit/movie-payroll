// ============================================================
// ZILLIT CODA — Step 7: Compliance
// Sections: 7A Compliance Checks, 7B Payroll Methods
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { useDealMemoStore } from '../../../store/kate/useDealMemoStore';
import { Card, CardHeader, CardBody, Badge, Alert } from '../kate-ui/index';
import { COMPLIANCE_CHECKS, TERRITORY_ONBOARDING } from '../../../data/kate/compliance';
import { TERRITORIES } from '../../../data/kate/territories';

// ── Status badge mapping ─────────────────────────────────────

type CheckStatus = 'pass' | 'pending' | 'required' | 'warning' | 'na';

const STATUS_CONFIG: Record<CheckStatus, { label: string; variant: 'green' | 'gold' | 'red' | 'orange' | 'default' }> = {
  pass:     { label: 'Pass',     variant: 'green' },
  pending:  { label: 'Pending',  variant: 'gold' },
  required: { label: 'Required', variant: 'red' },
  warning:  { label: 'Warning',  variant: 'orange' },
  na:       { label: 'N/A',      variant: 'default' },
};

type Priority = 'mandatory' | 'recommended' | 'info';

interface ComplianceItem {
  id: string;
  icon: string;
  title: string;
  detail: string;
  status: CheckStatus;
  priority: Priority;
}

function mapStatusToCheck(s: string): CheckStatus {
  if (s === 'pass') return 'pass';
  if (s === 'fail') return 'required';
  if (s === 'warn') return 'pending';
  if (s === 'info') return 'pending';
  return 'na';
}

function mapStatusToPriority(s: string): Priority {
  if (s === 'fail') return 'mandatory';
  if (s === 'warn') return 'mandatory';
  if (s === 'pass') return 'recommended';
  return 'info';
}

// ── Component ────────────────────────────────────────────────

export default function Step7Compliance() {
  const store = useDealMemoStore();
  const territory = store.territory || 'uk';
  const territoryData = TERRITORIES[territory];
  const onboarding = TERRITORY_ONBOARDING[territory] ?? TERRITORY_ONBOARDING.default;

  // Build checklist from compliance data + territory onboarding docs
  const checks = useMemo<ComplianceItem[]>(() => {
    const items: ComplianceItem[] = [];

    // Global compliance checks
    COMPLIANCE_CHECKS.forEach((c, i) => {
      items.push({
        id: `cc-${i}`,
        icon: c.icon,
        title: c.title,
        detail: c.detail,
        status: mapStatusToCheck(c.status),
        priority: mapStatusToPriority(c.status),
      });
    });

    // Territory-specific document requirements
    if (onboarding.docs) {
      onboarding.docs.forEach((doc, i) => {
        let status: CheckStatus = 'pending';
        let priority: Priority = 'recommended';
        if (doc.req === 'mandatory') {
          status = 'required';
          priority = 'mandatory';
        } else if (doc.req === 'conditional') {
          status = 'warning';
          priority = 'recommended';
        } else {
          status = 'na';
          priority = 'info';
        }
        items.push({
          id: `doc-${i}`,
          icon: '\uD83D\uDCC4',
          title: doc.name,
          detail: doc.desc,
          status,
          priority,
        });
      });
    }

    return items;
  }, [onboarding]);

  // Group by priority
  const mandatory = checks.filter(c => c.priority === 'mandatory');
  const recommended = checks.filter(c => c.priority === 'recommended');
  const info = checks.filter(c => c.priority === 'info');

  return (
    <div className="space-y-6">
      {/* ── 7A: Compliance Checks ──────────────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-text-3 text-[11px] font-mono">7A</span>
            <span className="text-text-1 text-[13px] font-display font-bold">Compliance Checks</span>
          </div>
          <Badge variant="gold">
            {territoryData?.flag ?? ''} {territoryData?.name ?? territory.toUpperCase()}
          </Badge>
        </CardHeader>
        <CardBody className="space-y-5">
          {/* Mandatory */}
          {mandatory.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="red">Mandatory</Badge>
                <span className="text-[10px] text-text-4">{mandatory.length} items</span>
              </div>
              <div className="space-y-2">
                {mandatory.map(item => (
                  <CheckRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Recommended */}
          {recommended.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="gold">Recommended</Badge>
                <span className="text-[10px] text-text-4">{recommended.length} items</span>
              </div>
              <div className="space-y-2">
                {recommended.map(item => (
                  <CheckRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          {info.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="default">Info</Badge>
                <span className="text-[10px] text-text-4">{info.length} items</span>
              </div>
              <div className="space-y-2">
                {info.map(item => (
                  <CheckRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── 7B: Onboarding Checklist ─────────────────────────────── */}
      <OnboardingChecklist territory={territory} territoryData={territoryData} />
    </div>
  );
}

// ── Onboarding Checklist sub-component ──────────────────────

function OnboardingChecklist({ territory, territoryData }: { territory: string; territoryData: any }) {
  const onboarding = TERRITORY_ONBOARDING[territory] ?? TERRITORY_ONBOARDING.default;
  const docs = (onboarding?.docs ?? []).map(d => d.name);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = useCallback((idx: number) => {
    setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <Card accent="blue">
      <CardHeader>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-text-3 text-[11px] font-mono">7C</span>
          <span className="text-text-1 text-[13px] font-display font-bold">Onboarding Checklist</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-3">Sent via Crew Portal</span>
          <Badge variant="blue">
            {territoryData?.flag ?? ''} {territoryData?.name ?? territory.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-1">
          {docs.map((doc, idx) => (
            <label
              key={idx}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                checked[idx]
                  ? 'bg-blue-500/10 border-blue-500/20'
                  : 'bg-bg-elevated border-border hover:border-border-light'
              }`}
            >
              <input
                type="checkbox"
                checked={!!checked[idx]}
                onChange={() => toggle(idx)}
                className="accent-blue-400 w-3.5 h-3.5 flex-shrink-0"
              />
              <span className={`text-[12px] ${checked[idx] ? 'text-text-3 line-through' : 'text-text-1'}`}>
                {doc}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-text-3">
            {checkedCount} of {docs.length} documents collected
          </span>
          {checkedCount === docs.length && (
            <Badge variant="green">Complete</Badge>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ── CheckRow sub-component ───────────────────────────────────

function CheckRow({ item }: { item: ComplianceItem }) {
  const cfg = STATUS_CONFIG[item.status];

  return (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-bg-elevated border border-border">
      <span className="text-[16px] mt-0.5 flex-shrink-0">{item.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-text-1 font-medium">{item.title}</span>
          {item.priority === 'mandatory' && (
            <span className="text-red-400 text-[9px] font-display font-bold uppercase tracking-wide">Required</span>
          )}
        </div>
        {item.detail && (
          <p className="text-[11px] text-text-3 mt-0.5 leading-relaxed">{item.detail}</p>
        )}
      </div>
      <Badge variant={cfg.variant} className="flex-shrink-0">
        {cfg.label}
      </Badge>
    </div>
  );
}
