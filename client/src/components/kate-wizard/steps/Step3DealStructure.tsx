// ============================================================
// ZILLIT CODA — Step 3: Deal Structure
// Deal type, dates, notice, credit, location, idle days
// ============================================================

import { useState } from 'react';
import { useDealMemoStore } from '../../../store/kate/useDealMemoStore';
import { Card, CardHeader, CardBody, Alert, Badge, Field, Select, Toggle } from '../kate-ui/index';
import type { UnionId, DealType, NoticeType } from '../../../types/kate/dealMemo';

// ── Deal Type Cards ──────────────────────────────────────────

interface DealTypeCard {
  type: DealType;
  icon: string;
  label: string;
  desc: string;
}

const DEAL_TYPES: DealTypeCard[] = [
  { type: 'weekly',    icon: '\u{1F4C5}', label: 'Weekly',      desc: 'Per Week \u2014 rolling engagement, notice period applies' },
  { type: 'fixed',     icon: '\u{1F4CC}', label: 'Fixed Term',  desc: 'Per Week \u2014 fixed term (start & end date)' },
  { type: 'dayplayer', icon: '\u{1F3AC}', label: 'Day Player',  desc: 'Per Day \u2014 day-rate engagement' },
  { type: 'buyout',    icon: '\u{1F4BC}', label: 'Buyout',      desc: 'Flat Deal \u2014 all-in fee, no OT' },
  { type: 'picture',   icon: '\u{1F39E}\u{FE0F}', label: 'Per Picture', desc: 'Per Production \u2014 flat production fee' },
  { type: 'boxrental', icon: '\u{1F4E6}', label: 'Box Rental',  desc: 'Equipment rental fee' },
];

const DEAL_TYPE_ALERTS: Record<DealType, string> = {
  weekly:    'Standard weekly rolling deal. Day rate \u00d7 5-day week. Full overtime structure applies.',
  fixed:     'Fixed-term engagement with set start and end dates. Notice period may not apply.',
  dayplayer: 'Single-day or multi-day engagement. Each day is a separate booking.',
  buyout:    'Flat fee covers all hours. No overtime generated. HP may still apply.',
  picture:   'Per-production flat fee. Long-form contract upload available below.',
  boxrental: 'Equipment rental agreement. Not an employment engagement.',
};

// ── Notice Chips ─────────────────────────────────────────────

interface NoticeChip {
  type: NoticeType;
  label: string;
}

const ALL_NOTICE_CHIPS: NoticeChip[] = [
  { type: 'statutory',  label: 'Statutory Min' },
  { type: '1week',      label: '1 Week' },
  { type: '2week',      label: '2 Weeks' },
  { type: '1month',     label: '1 Month' },
  { type: 'negotiated', label: 'Negotiated' },
  { type: 'none',       label: 'N/A (Fixed Term)' },
];

// Notice period options vary by deal type per Kate's prototype
const NOTICE_OPTIONS_BY_DEAL: Record<DealType, NoticeType[]> = {
  weekly:    ['statutory', '1week', '2week', '1month', 'negotiated'],
  fixed:     ['none', 'negotiated'],
  dayplayer: ['none', 'statutory', 'negotiated'],
  buyout:    ['none'],
  picture:   [],   // notice card hidden entirely
  boxrental: [],   // notice card hidden entirely
};

// ── Billing Basis ────────────────────────────────────────────

const BILLING_BASIS_OPTIONS = [
  { value: 'per-week', label: 'Per Week' },
  { value: 'per-day', label: 'Per Day' },
  { value: 'flat-deal', label: 'Flat Deal' },
  { value: 'per-episode', label: 'Per Episode' },
  { value: 'per-production', label: 'Per Production' },
];

// ── Accommodation Options ────────────────────────────────────

const ACCOMMODATION_OPTIONS = [
  { value: 'hotel-provided', label: 'Hotel provided by production' },
  { value: 'allowance', label: 'Accommodation allowance paid to crew' },
  { value: 'actuals', label: 'Actuals reimbursed on receipt' },
];

// ── Travel Options ───────────────────────────────────────────

const TRAVEL_OPTIONS = [
  { value: 'production-arranged', label: 'Production arranged' },
  { value: 'self-drive-mileage', label: 'Self-drive (mileage reimbursed)' },
  { value: 'rail-class', label: 'Rail (standard class)' },
  { value: 'air-economy', label: 'Air (economy)' },
];

// ── Travel Days ──────────────────────────────────────────────

const TRAVEL_DAYS_OPTIONS = [
  { value: 'flat', label: 'Paid at flat daily rate (not 6th/7th uplift)' },
  { value: 'negotiated', label: 'Negotiated — specify below' },
  { value: 'none', label: 'Not paid — crew travel on own time' },
];

// ── Idle Days Fringes ────────────────────────────────────────

const IDLE_FRINGES_OPTIONS = [
  { value: 'benefits-only', label: 'Benefits / pension contributions only (IATSE standard)' },
  { value: 'full', label: 'Full fringes apply' },
  { value: 'none', label: 'No fringes — flat allowance (SAG-AFTRA pre-employment)' },
];

// ── Unions WITHOUT work location card ────────────────────────

const HIDE_LOCATION_UNIONS: UnionId[] = ['wggb', 'wga-west', 'wga-east' as UnionId, 'pact-equity', 'bectu-anim'];

// ── Unions WITH idle days section ────────────────────────────

const IDLE_DAY_UNIONS: UnionId[] = ['iatse-600', 'iatse-728', 'iatse-80', 'iatse-695', 'dga', 'sag-aftra', 'teamsters-399'];

// ── Long-Form Contract Upload Sub-Component ─────────────────

function LongFormContractCard() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.type === 'application/pdf' || dropped.name.endsWith('.docx'))) {
      setFile(dropped);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  return (
    <Card accent="gold">
      <CardHeader>
        <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">Long-Form Contract</span>
      </CardHeader>
      <CardBody className="space-y-4">
        <Alert variant="blue">
          Per-production and box rental deals typically use a long-form contract. Upload the signed contract here -- payment schedule milestones can be extracted or entered manually.
        </Alert>

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragOver ? 'border-gold bg-gold/5' : 'border-border bg-bg-elevated hover:border-border-light'
          }`}
          onClick={() => document.getElementById('longform-upload')?.click()}
        >
          <input
            id="longform-upload"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileInput}
            className="hidden"
          />
          {file ? (
            <div className="space-y-1">
              <div className="text-[12px] text-text-1 font-display font-semibold">{file.name}</div>
              <div className="text-[10px] text-text-3">{(file.size / 1024).toFixed(0)} KB -- Click to replace</div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-[20px]">&#128196;</div>
              <div className="text-[12px] text-text-2 font-display">Drop PDF or DOCX here, or click to browse</div>
              <div className="text-[10px] text-text-4">Accepted formats: PDF, DOCX</div>
            </div>
          )}
        </div>

        {/* Payment schedule milestones (manual entry) */}
        <div className="space-y-2">
          <div className="text-[10px] font-display font-bold text-text-3 uppercase tracking-wider">Payment Schedule Milestones</div>
          {['On signing', 'On commencement', 'On delivery'].map((milestone) => (
            <div key={milestone} className="flex items-center gap-3">
              <span className="text-[11px] text-text-2 w-32 flex-shrink-0">{milestone}</span>
              <input
                type="number"
                placeholder="0.00"
                className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-1.5 text-[12px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Override payment date */}
        <Field label="Override / Add Payment Date" hint="Add a custom milestone if not listed above">
          <input
            type="date"
            className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
          />
        </Field>
      </CardBody>
    </Card>
  );
}

export default function Step3DealStructure() {
  const store = useDealMemoStore();
  const union = store.union as UnionId;
  const territory = store.territory;

  const showLocation = !HIDE_LOCATION_UNIONS.includes(union);
  const showIdleDays = IDLE_DAY_UNIONS.includes(union);
  const isUkPactBectu = territory === 'uk' && (union === 'pact-bectu' || union === 'pact-mmp');

  // Filter notice chips based on deal type
  const allowedNoticeTypes = NOTICE_OPTIONS_BY_DEAL[(store.dealType as DealType) || 'weekly'] ?? NOTICE_OPTIONS_BY_DEAL.weekly;
  const noticeChips = ALL_NOTICE_CHIPS.filter((c) => allowedNoticeTypes.includes(c.type));

  // Deal type cascade handler
  const handleDealTypeSelect = (type: DealType) => {
    // Determine default billing basis for the deal type
    const billingBasisMap: Record<DealType, string> = {
      weekly: 'per-week',
      fixed: 'per-week',
      dayplayer: 'per-day',
      buyout: 'flat-deal',
      picture: 'per-production',
      boxrental: 'per-week',
    };
    // Fixed term → notice N/A; buyout/picture/boxrental → notice N/A
    const noticeMap: Record<DealType, NoticeType> = {
      weekly: store.noticeType || 'statutory',
      fixed: 'none',
      dayplayer: store.noticeType || 'statutory',
      buyout: 'none',
      picture: 'none',
      boxrental: 'none',
    };
    store.update({
      dealType: type,
      billingBasis: billingBasisMap[type],
      noticeType: noticeMap[type],
      customNotice: noticeMap[type] === 'none' ? '' : store.customNotice,
    });
  };

  return (
    <div className="space-y-4">
      {/* Page heading */}
      <div>
        <div className="text-[10px] font-display font-bold text-text-4 uppercase tracking-widest mb-1">Step 3 of 10</div>
        <h1 className="text-[22px] font-display font-bold text-text-1 mb-1">Deal Structure</h1>
        <p className="text-[13px] text-text-2">Engagement type, dates, notice period, credit, and work location.</p>
      </div>

      {/* AI Deal Import alert */}
      <Alert variant="gold">
        <strong>AI Deal Import</strong> — Drop an agent's offer letter or previous deal memo PDF and Zillit will extract deal terms and pre-fill this step. <span className="text-gold cursor-pointer underline">Upload document →</span>
      </Alert>

      {/* ── 3A: Deal Type Cards ───────────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">3A. Deal Type</span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
            {DEAL_TYPES.map((dt) => {
              const isSelected = store.dealType === dt.type;
              return (
                <button
                  key={dt.type}
                  type="button"
                  onClick={() => handleDealTypeSelect(dt.type)}
                  className={`text-left px-4 py-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-gold bg-gold/10'
                      : 'border-border bg-bg-elevated hover:border-border-light'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{dt.icon}</span>
                    <span className="text-[12px] font-display font-semibold text-text-1">{dt.label}</span>
                  </div>
                  <div className="text-[10px] text-text-3 leading-relaxed">{dt.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Deal type contextual alert */}
          {store.dealType && DEAL_TYPE_ALERTS[store.dealType as DealType] && (
            <Alert variant="blue" className="mt-3">
              {DEAL_TYPE_ALERTS[store.dealType as DealType]}
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* ── 3B: Dates ─────────────────────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">3B. Dates</span>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" required>
              <input
                type="date"
                value={store.startDate || ''}
                onChange={(e) => store.update({ startDate: e.target.value })}
                className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
              />
            </Field>
            {store.dealType !== 'fixed' && (
              <Field label="Estimated End Date">
                <input
                  type="date"
                  value={store.endDate || ''}
                  onChange={(e) => store.update({ endDate: e.target.value })}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
                />
              </Field>
            )}
            {store.dealType === 'fixed' && (
              <Field label="Estimated End Date" required>
                <input
                  type="date"
                  value={store.endDate || ''}
                  onChange={(e) => store.update({ endDate: e.target.value })}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
                />
              </Field>
            )}
            <Field label="Billing Basis">
              <Select
                value={store.billingBasis || ''}
                onChange={(v) => store.update({ billingBasis: v })}
                options={BILLING_BASIS_OPTIONS}
                placeholder="Select..."
              />
            </Field>
          </div>

          {/* Computed duration */}
          {store.startDate && store.endDate && (
            <div className="mt-3 border-t border-border pt-3 flex items-center justify-between">
              <span className="text-[11px] text-text-3">Duration (est.)</span>
              <span className="text-[13px] font-mono text-gold">
                {(() => {
                  const start = new Date(store.startDate);
                  const end = new Date(store.endDate);
                  const diffMs = end.getTime() - start.getTime();
                  const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
                  return `${(diffDays / 7).toFixed(1)} weeks`;
                })()}
              </span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── 3C: Notice Period (hidden for picture / boxrental) ── */}
      {noticeChips.length > 0 && (
        <Card accent="gold">
          <CardHeader>
            <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">3C. Notice Period</span>
          </CardHeader>
          <CardBody className="space-y-3">
            {/* Currently selected notice badge */}
            {store.noticeType && (
              <div className="mb-1">
                <Badge variant="gold">
                  {ALL_NOTICE_CHIPS.find((c) => c.type === store.noticeType)?.label || store.noticeType}
                </Badge>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {noticeChips.map((chip) => {
                const isSelected = store.noticeType === chip.type;
                return (
                  <button
                    key={chip.type}
                    type="button"
                    onClick={() => store.update({ noticeType: chip.type })}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-display font-semibold border transition-all ${
                      isSelected
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-border bg-bg-elevated text-text-3 hover:border-border-light'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] text-text-4">
              Statutory minimum: 1 week per year of service (max 12 weeks)
            </div>

            {store.noticeType === 'negotiated' && (
              <Field label="Negotiated Notice Terms">
                <input
                  type="text"
                  value={store.customNotice || ''}
                  onChange={(e) => store.update({ customNotice: e.target.value })}
                  placeholder="e.g. 3 weeks from end of current block"
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none focus:border-border-light transition-colors"
                />
              </Field>
            )}
          </CardBody>
        </Card>
      )}

      {/* ── Long-Form Contract Upload (picture / boxrental only) ── */}
      {(store.dealType === 'picture' || store.dealType === 'boxrental') && (
        <LongFormContractCard />
      )}

      {/* ── 3D: Credit & Conditions ───────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">3D. Credit & Conditions</span>
        </CardHeader>
        <CardBody className="space-y-4">
          <Field label="Screen Credit">
            <input
              type="text"
              value={store.screenCredit || ''}
              onChange={(e) => store.update({ screenCredit: e.target.value })}
              placeholder="As it appears on screen"
              className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none focus:border-border-light transition-colors"
            />
          </Field>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-[11px] text-text-2 font-display">Exclusivity clause</div>
                <div className="text-[9px] text-text-4">Worker cannot work on other productions during engagement</div>
              </div>
              <Toggle on={store.exclusivity ?? false} onToggle={() => store.update({ exclusivity: !store.exclusivity })} />
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-[11px] text-text-2 font-display">Travel day paid at full rate</div>
                <div className="text-[9px] text-text-4">Travel days compensated at standard day rate</div>
              </div>
              <Toggle on={store.travelDayFullRate ?? true} onToggle={() => store.update({ travelDayFullRate: !(store.travelDayFullRate ?? true) })} />
            </div>

            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-[11px] text-text-2 font-display">Rest day worked \u2014 double time</div>
                <div className="text-[9px] text-text-4">2x rate applies when working on scheduled rest days</div>
              </div>
              <Toggle on={store.restDayDoubleTime ?? false} onToggle={() => store.update({ restDayDoubleTime: !store.restDayDoubleTime })} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── 3E: Work Location (union-gated) ───────────────── */}
      {showLocation && (
        <Card accent="gold">
          <CardHeader>
            <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">3E. Work Location</span>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* UK PACT/BECTU travel zone */}
            {isUkPactBectu && (
              <Field label="Travel Zone Election (Clause 8.3 — mandatory on Deal Memo)" required hint="One option must be elected per Worker for the duration of the engagement. Travel beyond the selected zone: compensated at Overtime Rate in 15-min increments.">
                <Select
                  value={store.ukTravelZone || ''}
                  onChange={(v) => store.update({ ukTravelZone: v })}
                  options={[
                    { value: '30mile', label: '30 Mile Radius (Clause 8.3a)' },
                    { value: 'm25', label: 'Within M25 (Clause 8.3b — Production Base within M25 only)' },
                  ]}
                  placeholder="Select travel zone…"
                />
              </Field>
            )}

            {/* DGA Distant Allowance note */}
            {territory === 'us' && union === 'dga' && (
              <Alert variant="blue">
                DGA Basic Agreement: Distant Location Allowance $24.00/day (2024 rate). Automatically applied when Distant Location is toggled on.
              </Alert>
            )}

            {/* Distant location toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-[11px] text-text-2 font-display">Distant Location</div>
                <div className="text-[9px] text-text-4">Work location beyond base zone threshold</div>
              </div>
              <Toggle
                on={store.distantLocation}
                onToggle={() => store.update({ distantLocation: !store.distantLocation })}
              />
            </div>

            {/* Distant location details */}
            {store.distantLocation && (
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Per Diem / Meal Allowance" hint="Daily subsistence allowance">
                    <input
                      type="number"
                      value={store.distantPerDiem || ''}
                      onChange={(e) => store.update({ distantPerDiem: Number(e.target.value) })}
                      placeholder="0.00"
                      className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
                    />
                  </Field>
                  <Field label="Accommodation">
                    <Select
                      value={store.distantAccommodation}
                      onChange={(v) => store.update({ distantAccommodation: v })}
                      options={ACCOMMODATION_OPTIONS}
                    />
                  </Field>
                  <Field label="Travel Arrangement">
                    <Select
                      value={store.distantTravelOption || ''}
                      onChange={(v) => store.update({ distantTravelOption: v })}
                      options={TRAVEL_OPTIONS}
                      placeholder="Select..."
                    />
                  </Field>
                  <Field label="Travel Days">
                    <Select
                      value={store.distantTravelDays || ''}
                      onChange={(v) => store.update({ distantTravelDays: v })}
                      options={TRAVEL_DAYS_OPTIONS}
                      placeholder="Select..."
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* IATSE distant location note */}
            {['iatse-600', 'iatse-728', 'iatse-80', 'iatse-695'].includes(union) && store.distantLocation && (
              <Alert variant="blue">
                IATSE distant location guarantee: 5-day week minimum on distant. Per diem is non-taxable up to IRS limit. Travel days paid at full rate.
              </Alert>
            )}

            {/* High-cost cities alert */}
            {store.distantLocation && (
              <Alert variant="gold">
                High-cost cities (NYC, LA, SF, Chicago, London) may trigger enhanced per diem rates. Check applicable union agreement for current thresholds.
              </Alert>
            )}
          </CardBody>
        </Card>
      )}

      {/* ── 3F: Idle Days (union-gated) ───────────────────── */}
      {showIdleDays && (
        <Card accent="gold">
          <CardHeader>
            <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">3F. Idle Days</span>
          </CardHeader>
          <CardBody className="space-y-4">
            <Field label="Idle Days in This Contract?">
              <Select
                value={store.idleDaysApplicable}
                onChange={(v) => store.update({ idleDaysApplicable: v })}
                options={[
                  { value: 'no', label: 'No idle day provisions stipulated' },
                  { value: 'agreement', label: 'Per agreement — rates shown above' },
                  { value: 'negotiated', label: 'Negotiated — enter rate below' },
                ]}
              />
            </Field>

            {store.idleDaysApplicable === 'negotiated' && (
              <Field label="Negotiated Idle Day Rate">
                <input
                  type="text"
                  value={store.idleDaysRate || ''}
                  onChange={(e) => store.update({ idleDaysRate: e.target.value })}
                  placeholder="e.g. $250/day or 1/5 weekly rate"
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none focus:border-border-light transition-colors"
                />
              </Field>
            )}

            {store.idleDaysApplicable !== 'no' && (
              <>
                <Field label="Max Idle Days per Week">
                  <input
                    type="number"
                    value={store.idleDaysMax}
                    onChange={(e) => store.update({ idleDaysMax: Number(e.target.value) })}
                    min={0}
                    max={7}
                    className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] font-mono text-text-1 focus:outline-none focus:border-border-light transition-colors"
                  />
                </Field>
                <Field label="Fringes on Idle Days">
                  <Select
                    value={store.idleDaysFringes}
                    onChange={(v) => store.update({ idleDaysFringes: v })}
                    options={IDLE_FRINGES_OPTIONS}
                  />
                </Field>
              </>
            )}

            {store.idleDaysApplicable !== 'no' && (
              <Alert variant="blue">
                Idle day provisions per {union.toUpperCase()} agreement. Consult the applicable CBA for full terms.
              </Alert>
            )}
          </CardBody>
        </Card>
      )}

      {/* ── 3G: Additional Notes ──────────────────────────── */}
      <Card accent="gold">
        <CardHeader>
          <span className="text-[11px] font-display font-semibold text-text-1 uppercase tracking-wider">3G. Additional Notes</span>
        </CardHeader>
        <CardBody>
          <textarea
            value={store.dealNotes || ''}
            onChange={(e) => store.update({ dealNotes: e.target.value })}
            rows={3}
            placeholder="Any deal-specific terms, agent instructions, or notes for the accountant…"
            className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-[12px] text-text-1 focus:outline-none focus:border-border-light transition-colors resize-y"
          />
        </CardBody>
      </Card>
    </div>
  );
}
