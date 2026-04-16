// ============================================================
// ZILLIT CODA — Step 2: Crew Details
// Compact premium layout — Role + Status + Personal
// ============================================================

import { useState, useEffect } from 'react';
import { useDealMemoStore } from '../../../store/kate/useDealMemoStore';
import { ALL_DEPARTMENTS, getDeptsForUnion, getJobTitles } from '../../../data/kate/territories';
import { EMPLOYMENT_STATUSES } from '../../../data/kate/employmentStatus';
import { US_SCALE_MINIMUMS, UK_PACT_MINIMUMS } from '../../../data/kate/scaleMinimums';
import { Card, CardHeader, CardBody, Alert, Badge, Field, Select } from '../../kate-ui/index';
import { TERRITORIES } from '../../../data/kate/territories';
import { listUsers } from '../../../api/kateDealMemoApi';
import InviteCrewModal from '../InviteCrewModal';
import type { TerritoryCode, UnionId, DepartmentId } from '../../../types/kate/dealMemo';
import type { TerritoryCode as EmpTerritoryCode } from '../../../data/kate/employmentStatus';

const CALL_SHEET_TIERS = [
  { value: 'HOD',        label: 'HOD' },
  { value: 'Crew',       label: 'Crew' },
  { value: 'Day Player', label: 'Day Player' },
  { value: 'Background', label: 'Background' },
];

const RIGHT_TO_WORK_OPTIONS = [
  { value: 'uk-citizen',     label: 'UK Citizen / Settled Status' },
  { value: 'uk-visa',        label: 'UK Visa' },
  { value: 'eu-presettled',  label: 'EU Pre-Settled' },
  { value: 'work-permit',    label: 'Work Permit' },
];

export default function Step2CrewDetails() {
  const store = useDealMemoStore();
  const territory = store.territory as TerritoryCode;
  const union     = store.union as UnionId;
  const department = store.department as DepartmentId | '';

  // ── Crew user picker state ──
  const [crewUsers, setCrewUsers] = useState<Array<{ _id: string; name: string; email: string }>>([]);
  const [loadingCrew, setLoadingCrew] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    setLoadingCrew(true);
    listUsers('crew').then(d => setCrewUsers(Array.isArray(d) ? d : [])).catch(() => setCrewUsers([])).finally(() => setLoadingCrew(false));
  }, []);

  const handleCrewSelect = (userId: string) => {
    const user = crewUsers.find(u => u._id === userId);
    store.update({
      assignedUserId: userId,
      fullName: user?.name || '',
    });
  };

  const availableDeptIds = getDeptsForUnion(union);
  const deptOptions = ALL_DEPARTMENTS
    .filter((d) => availableDeptIds.includes(d.id))
    .map((d) => ({ value: d.id, label: d.label }));

  const jobTitleOptions = department
    ? getJobTitles(department as DepartmentId, union).map((t) => ({ value: t, label: t }))
    : [];

  const isCustomTitle = store.jobTitle === 'Custom...';

  const empStatuses = EMPLOYMENT_STATUSES[territory as EmpTerritoryCode] || EMPLOYMENT_STATUSES.other;
  const selectedEmpStatus = empStatuses.find((e) => e.id === store.employmentStatusId);

  const unionData = TERRITORIES[territory]?.unions.find((u) => u.id === union);

  const handleJobTitleChange = (title: string) => {
    const patch: Parameters<typeof store.update>[0] = { jobTitle: title };
    if (title !== 'Custom...') patch.customJobTitle = '';

    let scaleMin: { weekly: number | null; daily: number | null } | null = null;
    if (territory === 'us' && US_SCALE_MINIMUMS[union]) {
      const roles = US_SCALE_MINIMUMS[union];
      if (roles[title]) scaleMin = roles[title];
    }
    if (territory === 'uk') {
      const pactData = UK_PACT_MINIMUMS[union] as Record<string, any> | undefined;
      if (pactData?.[title]) scaleMin = pactData[title];
    }

    if (scaleMin) {
      const dayRate    = scaleMin.daily ?? (scaleMin.weekly ? scaleMin.weekly / 5 : store.rates.dayRate);
      const weeklyRate = scaleMin.weekly ?? dayRate * 5;
      patch.rates = { ...store.rates, dayRate, weeklyRate };
    }

    store.update(patch);
  };

  const cls = 'w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none focus:border-gold/60 transition-colors';

  return (
    <div className="space-y-4">

      {/* ── PAGE HEADING ────────────────────────────────────── */}
      <div>
        <div className="text-[10px] font-display font-bold text-text-4 uppercase tracking-widest mb-1">Step 2 of 10</div>
        <h1 className="text-[22px] font-display font-bold text-text-1 mb-1">Crew Details</h1>
        <p className="text-[13px] text-text-2">Production fills role and engagement type. Fields marked <span className="text-orange-400">Crew to complete</span> are sent via the Crew Portal for self-service entry.</p>
      </div>

      {/* Info alert — matches Kate's blue alert */}
      <Alert variant="blue">
        Department and job title options reflect the selected union agreement. Fields marked <span className="text-orange-400 font-semibold">Crew to complete</span> are sent via the Crew Portal.
      </Alert>

      {/* ── CARD 1: ROLE INFORMATION ────────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">Role Information</span>
            {unionData && <Badge variant="gold">{unionData.name}</Badge>}
          </div>
        </CardHeader>
        <CardBody className="space-y-0">

          {/* Row 0 — Crew User Picker */}
          <div className="mb-4 pb-4 border-b border-border">
            <Field label="Select Crew Member" required>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={store.assignedUserId || ''}
                    onChange={handleCrewSelect}
                    options={crewUsers.map(u => ({ value: u._id, label: `${u.name} — ${u.email}` }))}
                    placeholder={loadingCrew ? 'Loading crew…' : 'Select crew member…'}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setInviteOpen(true)}
                  className="px-3 py-2 text-[11px] font-display font-bold text-gold border border-gold/30 rounded-lg bg-gold/10 hover:bg-gold/20 transition-colors whitespace-nowrap"
                >
                  + Invite New
                </button>
              </div>
            </Field>
            {store.assignedUserId && store.fullName && (
              <div className="mt-2 text-[11px] text-text-3">
                Deal memo will be created for <span className="text-gold font-medium">{store.fullName}</span>
              </div>
            )}
          </div>

          <InviteCrewModal
            open={inviteOpen}
            onClose={() => setInviteOpen(false)}
            onInvited={(r) => {
              setCrewUsers(prev => {
                if (prev.find(u => u._id === r.userId)) return prev;
                return [...prev, { _id: r.userId, name: r.name, email: r.email }];
              });
              store.update({ assignedUserId: r.userId, fullName: r.name });
              setInviteOpen(false);
            }}
          />

          {/* Row 1 — Dept + Job Title */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Department" required hint={`Filtered for ${union}`}>
              <Select
                value={department}
                onChange={(v) => store.update({ department: v, jobTitle: '', customJobTitle: '' })}
                options={deptOptions}
                placeholder="Select department…"
              />
            </Field>

            <Field label="Job Title / Role" required>
              <Select
                value={store.jobTitle}
                onChange={handleJobTitleChange}
                options={jobTitleOptions}
                placeholder={department ? 'Select job title…' : 'Select dept first'}
                disabled={!department}
              />
            </Field>
          </div>

          {/* Custom title row — only when "Custom..." selected */}
          {isCustomTitle && (
            <div className="mb-3">
              <Field label="Custom Job Title" required>
                <input
                  type="text"
                  value={store.customJobTitle || ''}
                  onChange={(e) => store.update({ customJobTitle: e.target.value })}
                  placeholder="Enter job title / credit…"
                  className={cls}
                />
              </Field>
            </div>
          )}

          {/* Thin divider */}
          <div className="border-t border-border/50 my-3" />

          {/* Row 2 — Reports To + Call Sheet Tier */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Reports To">
              <input
                type="text"
                value={store.reportsTo || ''}
                onChange={(e) => store.update({ reportsTo: e.target.value })}
                placeholder="e.g. Director of Photography, Line Producer…"
                className={cls}
              />
            </Field>

            <Field label="Call Sheet Tier">
              <Select
                value={store.callSheetTier}
                onChange={(v) => store.update({ callSheetTier: v as any })}
                options={CALL_SHEET_TIERS}
              />
            </Field>
          </div>

        </CardBody>
      </Card>

      {/* ── CARD 2: PERSONAL DETAILS — matches Kate's order ──── */}
      <Card accent="none">
        <CardHeader>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">Personal Details</span>
            <Badge variant="orange">Crew to Complete</Badge>
          </div>
          <span className="text-[9px] text-text-4 font-display">Sent via Crew Portal for self-service entry</span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-3">

            <Field label="Full Legal Name" required crewCompleted>
              <input
                type="text"
                value={store.fullName || ''}
                readOnly
                placeholder={store.assignedUserId ? 'Auto-filled from crew selection' : 'Select crew member above'}
                className={`${cls} opacity-70 cursor-not-allowed`}
              />
            </Field>

            <Field label="Preferred Name" crewCompleted>
              <input
                type="text"
                value={store.preferredName || ''}
                onChange={(e) => store.update({ preferredName: e.target.value })}
                placeholder="Optional"
                className={cls}
              />
            </Field>

            <Field label="Date of Birth" crewCompleted>
              <input
                type="date"
                value={store.dob || ''}
                onChange={(e) => store.update({ dob: e.target.value })}
                className={cls}
              />
            </Field>

            <Field
              label={
                territory === 'uk' || territory === 'ie' ? 'National Insurance No.' :
                territory === 'us' ? 'Social Security No.' :
                territory === 'au' ? 'Tax File Number' :
                territory === 'ca' ? 'Social Insurance No.' : 'Tax ID / National ID'
              }
              crewCompleted
            >
              <input
                type="text"
                value={store.nationalInsurance || ''}
                onChange={(e) => store.update({ nationalInsurance: e.target.value })}
                placeholder={
                  territory === 'uk' || territory === 'ie' ? 'AB 12 34 56 C' :
                  territory === 'us' ? 'XXX-XX-XXXX' :
                  territory === 'au' ? '123 456 789' :
                  territory === 'ca' ? 'XXX-XXX-XXX' : 'Enter ID number'
                }
                className={`${cls} font-mono`}
              />
            </Field>

            {territory !== 'us' && (
              <Field
                label={territory === 'uk' ? 'Tax Code' : territory === 'ie' ? 'PPS Number' : 'Tax Reference'}
                crewCompleted
              >
                <input
                  type="text"
                  value={store.taxCode || ''}
                  onChange={(e) => store.update({ taxCode: e.target.value })}
                  placeholder={territory === 'uk' ? 'e.g. 1257L' : territory === 'ie' ? '1234567T' : 'Enter tax reference'}
                  className={`${cls} font-mono`}
                />
              </Field>
            )}

            <Field label="Right to Work" crewCompleted>
              <Select
                value={store.rightToWork || ''}
                onChange={(v) => store.update({ rightToWork: v })}
                options={RIGHT_TO_WORK_OPTIONS}
                placeholder="Select…"
              />
            </Field>

            <div className="col-span-2">
              <Field label="Home Address" crewCompleted>
                <input
                  type="text"
                  value={store.homeAddress || ''}
                  onChange={(e) => store.update({ homeAddress: e.target.value })}
                  placeholder="Full postal address"
                  className={cls}
                />
              </Field>
            </div>

            <div className="col-span-2">
              <Field label="Emergency Contact" crewCompleted>
                <input
                  type="text"
                  value={store.emergencyContact || ''}
                  onChange={(e) => store.update({ emergencyContact: e.target.value })}
                  placeholder="Name, relationship, phone number"
                  className={cls}
                />
              </Field>
            </div>

          </div>
        </CardBody>
      </Card>

      {/* ── CARD 3: EMPLOYMENT STATUS (blue accent — matches Kate) */}
      <Card accent="blue">
        <CardHeader>
          <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">Employment Status</span>
          <Badge variant="blue" className="ml-auto">{selectedEmpStatus?.badge || 'Select Status'}</Badge>
        </CardHeader>
        <CardBody className="space-y-2">

          {empStatuses.map((es) => {
            const isSelected = store.employmentStatusId === es.id;
            return (
              <button
                key={es.id}
                type="button"
                onClick={() => store.update({ employmentStatusId: es.id })}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-150 ${
                  isSelected
                    ? 'border-blue-400/60 bg-blue-400/10 shadow-[0_0_0_1px_rgba(96,165,250,0.15)]'
                    : 'border-border bg-bg-elevated hover:border-border-light hover:bg-bg-hover/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-all ${
                      isSelected ? 'border-blue-400 bg-blue-400' : 'border-border'
                    }`}>
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-bg-surface scale-50" />
                      )}
                    </div>
                    <span className="text-[12px] font-display font-semibold text-text-1">{es.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {es.hpShow && <Badge variant="green">HP</Badge>}
                    <Badge variant="default">{es.badge}</Badge>
                  </div>
                </div>
                <p className="text-[10px] text-text-3 leading-relaxed mt-1.5 ml-6">{es.sub}</p>
              </button>
            );
          })}

          {selectedEmpStatus?.alert && (
            <Alert variant={selectedEmpStatus.alertCls as any}>
              {selectedEmpStatus.alert}
            </Alert>
          )}

        </CardBody>
      </Card>

    </div>
  );
}
