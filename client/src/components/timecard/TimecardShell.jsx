import { useState, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, parseISO } from "date-fns";
import { cn, formatCurrency, currencySymbol } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AllowanceModal from "./AllowanceModal";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Lock, Clock, DollarSign, AlertTriangle, Info,
  Plus, Save, Calculator, Sparkles, Send, Settings,
  MapPin, FileText, Pencil, Check, X, Zap,
} from "lucide-react";
import TimeInput from "./TimeInput";
import { getEmploymentRules } from "@/lib/employmentTypeRules";

// ── Source Badge ──────────────────────────────────────────────────────
const SOURCE_COLORS = {
  GPS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  BP: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Manual: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Override: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Locked: "bg-red-500/10 text-red-400 border-red-500/20",
  manual: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  call_sheet: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  gps: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  override: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  locked: "bg-red-500/10 text-red-400 border-red-500/20",
};

function SourceBadge({ source }) {
  if (!source) return null;
  const label = { gps: "GPS", call_sheet: "CS", manual: "Manual", override: "Override", locked: "🔒" }[source] || source;
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide border", SOURCE_COLORS[source] || SOURCE_COLORS.Manual)}>
      {label}
    </span>
  );
}

// ── Day Type Chip ────────────────────────────────────────────────────
const DAY_TYPE_STYLES = {
  SWD: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CWD: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  SCWD: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Shoot: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Prep: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Wrap: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  RIG: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  TRVL: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Travel: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  HOL: "bg-green-500/10 text-green-400 border-green-500/20",
  SICK: "bg-red-500/10 text-red-400 border-red-500/20",
  OFF: "bg-muted text-muted-foreground border-border",
  Rest: "bg-muted text-muted-foreground border-border",
};

// ── Week Navigation ──────────────────────────────────────────────────
function WeekNav({ weekLabel, status, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between px-6 py-2.5 border-b bg-card/50">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="size-8" onClick={onPrev} disabled={!onPrev}><ChevronLeft className="size-4" /></Button>
        <span className="text-sm font-semibold">{weekLabel}</span>
        <Button variant="ghost" size="icon" className="size-8" onClick={onNext} disabled={!onNext}><ChevronRight className="size-4" /></Button>
      </div>
      <Badge variant="outline" className={cn("text-xs",
        status === 'draft' && "text-yellow-500 border-yellow-500/30",
        status === 'submitted' && "text-blue-500 border-blue-500/30",
        status === 'approved' && "text-emerald-500 border-emerald-500/30",
      )}>{status || "Draft"}</Badge>
    </div>
  );
}

// ── Employment Badge Colors ──────────────────────────────────────────
const EMP_BADGE = {
  paye: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  w2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ltd: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  loanout: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  loan_out: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "1099": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  sole_trader: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  self_employed: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};
const EMP_LABEL = {
  paye: "PAYE", w2: "W-2", ltd: "LTD", loanout: "LOAN-OUT", loan_out: "LOAN-OUT",
  "1099": "1099", sole_trader: "SOLE TRADER", self_employed: "SELF-EMP",
};

// ── Hover Tooltip ───────────────────────────────────────────────────
function HoverCalc({ formula, color, className, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  if (!formula) return <span className={cn(className, color)}>{children}</span>;

  const handleEnter = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: rect.left, y: rect.top - 6 });
    setShow(true);
  };

  return (
    <span
      ref={ref}
      className={cn("inline-flex cursor-help", className, color)}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && createPortal(
        <span
          style={{ position: 'fixed', left: pos.x, top: pos.y, transform: 'translateY(-100%)' }}
          className="pointer-events-none z-[9999] w-max max-w-[500px] whitespace-nowrap rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-2 text-[9px] leading-relaxed font-mono text-white dark:text-zinc-900 shadow-xl ring-1 ring-zinc-700/20"
        >
          {formula}
        </span>,
        document.body,
      )}
    </span>
  );
}

// ── Crew Header ──────────────────────────────────────────────────────
function CrewHeader({ crew, dealMemo }) {
  const initials = crew?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  const empType = dealMemo?.employmentStatus || crew?.employmentType || 'paye';
  return (
    <div className="px-6 py-4 border-b bg-card/30">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary border-2 border-primary/20">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold truncate">{crew?.name || "Crew Member"}</h2>
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border shrink-0", EMP_BADGE[empType] || EMP_BADGE.paye)}>
              {EMP_LABEL[empType] || empType?.toUpperCase() || "PAYE"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {crew?.role} · {crew?.department} · {dealMemo?.dealType || "weekly"} · Week {crew?.weekNumber || "—"}
          </p>
        </div>
        {dealMemo?.overtimeApplicable !== false && (
          <Badge variant="outline" className="ml-auto text-red-400 border-red-500/30 bg-red-500/5 text-[10px] shrink-0">
            <Lock className="size-3 mr-1" /> OT is auto-calculated from your times
          </Badge>
        )}
      </div>
    </div>
  );
}

// ── Week Summary Strip ───────────────────────────────────────────────
function WeekSummaryStrip({ summary = {}, entries = [], dealMemo, cs = "£" }) {
  const otRate = dealMemo?.otRate || dealMemo?.otRate1x5 || (dealMemo?.hourlyRate ? dealMemo.hourlyRate * (dealMemo?.otMultiplier || 1.5) : 0);
  const otCap = dealMemo?.otRateCap;
  const effectiveRate = otCap ? Math.min(otRate, otCap) : otRate;
  const hpPct = dealMemo?.holidayPayPct || 12.07;
  const mealRate = dealMemo?.mealPenaltyRate || dealMemo?.mealPenaltyAmounts?.[0] || dealMemo?.hourlyRate || (dealMemo?.weeklyRate ? Math.round(dealMemo.weeklyRate / 55 * 100) / 100 : 35);

  // Build per-day breakdown strings for tooltips
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  // Helper: sum hours and build "Mon 0.5h + Tue 0.3h = 0.8hrs × $X/hr = $Y"
  const buildOTTip = (field, payField, rate, label) => {
    const parts = [];
    entries.forEach((e, i) => { if (e?.[payField] > 0) parts.push({ day: dayNames[i], hrs: (e[field] || 0) / 60, pay: e[payField] }); });
    if (!parts.length) return null;
    const totalHrs = parts.reduce((s, p) => s + p.hrs, 0);
    const totalPay = parts.reduce((s, p) => s + p.pay, 0);
    const dayList = parts.map(p => `${p.day} ${p.hrs.toFixed(1)}h`).join(' + ');
    return `${dayList} = ${totalHrs.toFixed(1)}hrs × ${cs}${rate.toFixed(2)}/hr = ${cs}${totalPay.toFixed(2)}`;
  };

  const preCallTip = buildOTTip('preCallOTMins', 'preCallOTPay', effectiveRate);
  const wrapTip = buildOTTip('wrapOTMins', 'wrapOTPay', effectiveRate);
  const filmRate = dealMemo?.otRate2x || effectiveRate * (4/3); // film OT often at 2x
  const filmTip = buildOTTip('filmingOTMins', 'filmingOTPay', filmRate);

  // Meal: per-day $ amounts
  const mealParts = [];
  entries.forEach((e, i) => { if (e?.mealDelayPay > 0) mealParts.push({ day: dayNames[i], pay: e.mealDelayPay }); });
  const mealTip = mealParts.length
    ? `${mealParts.map(p => `${p.day} ${cs}${p.pay.toFixed(0)}`).join(' + ')} = ${cs}${mealParts.reduce((s, p) => s + p.pay, 0).toFixed(2)} (${cs}${mealRate}/15min)`
    : null;

  // Basic: show days × daily rate = total or weekly rate
  const basicTip = dealMemo?.payBasis === 'daily'
    ? `${summary.daysWorked || 0} days × ${cs}${(dealMemo?.dailyRate || 0).toFixed(2)}/day = ${cs}${(summary.basic || 0).toFixed(2)}`
    : `weekly rate ${cs}${(dealMemo?.weeklyRate || 0).toLocaleString()} (${cs}${(dealMemo?.dailyRate || dealMemo?.weeklyRate / 5 || 0).toFixed(2)}/day × ${summary.daysWorked || 5} days)`;

  // Allowances: list each
  const allowParts = (dealMemo?.allowances || []).filter(a => Number(a.amount) > 0);
  const allowTip = allowParts.length
    ? `${allowParts.map(a => `${a.name} ${cs}${Number(a.amount).toFixed(2)}`).join(' + ')} = ${cs}${(summary.allowances || 0).toFixed(2)}/wk`
    : null;

  // Est Gross: full line-item breakdown
  const totalOT = (summary.preCallOT || 0) + (summary.wrapOT || 0) + (summary.filmOT || 0);
  const totalPenalties = (summary.mealDelay || 0) + (summary.bta || 0);
  const grossTip = `Basic ${cs}${(summary.basic||0).toLocaleString()} + HP ${cs}${(summary.holidayPay||0).toFixed(0)} + OT ${cs}${totalOT.toFixed(0)} + Penalties ${cs}${totalPenalties.toFixed(0)} + Allows ${cs}${(summary.allowances||0).toFixed(0)} = ${cs}${(summary.gross||0).toLocaleString()}`;

  const cards = [
    { label: "Basic", value: summary.basic || 0, color: "text-blue-400", tip: basicTip },
    { label: "Pre-Call OT", value: summary.preCallOT || 0, color: "text-teal-400", tip: preCallTip },
    { label: "Wrap OT", value: summary.wrapOT || 0, color: "text-teal-400", tip: wrapTip },
    { label: "Cam/Film OT", value: summary.filmOT || 0, color: "text-red-400", tip: filmTip },
    { label: "Meal Delay", value: summary.mealDelay || 0, color: "text-yellow-400", tip: mealTip },
    { label: "Allowances", value: summary.allowances || 0, color: "text-teal-400", tip: allowTip },
    { label: "Est. Gross", value: summary.gross || 0, color: "text-amber-400", tip: grossTip },
  ];
  return (
    <div className="grid grid-cols-7 gap-2 px-6 py-3 border-b bg-card/20">
      {cards.map(c => (
        <div key={c.label} className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{c.label}</p>
          <HoverCalc formula={c.tip && c.value > 0 ? c.tip : null} color={c.color}>
            <span className={cn("text-sm font-bold tabular-nums font-mono", c.color)}>{cs}{c.value.toLocaleString()}</span>
          </HoverCalc>
        </div>
      ))}
    </div>
  );
}

// ── Meal helpers ─────────────────────────────────────────────────────
const MEAL_FIELDS = [
  { startField: 'lunchStart', endField: 'lunchEnd', nameField: 'meal1Name', label: 'Meal 1' },
  { startField: 'secondMealStart', endField: 'secondMealEnd', nameField: 'meal2Name', label: 'Meal 2' },
  { startField: 'thirdMealStart', endField: 'thirdMealEnd', nameField: 'meal3Name', label: 'Meal 3' },
  { startField: 'fourthMealStart', endField: 'fourthMealEnd', nameField: 'meal4Name', label: 'Meal 4' },
];

function getActiveMeals(entry) {
  let count = 0;
  for (const m of MEAL_FIELDS) {
    if (entry?.[m.startField] || entry?.[m.endField]) count++;
    else break;
  }
  return MEAL_FIELDS.slice(0, Math.max(count + 1, 1)).map((m, i) => ({
    ...m,
    start: entry?.[m.startField] || '',
    end: entry?.[m.endField] || '',
    name: entry?.[m.nameField] || null,
    index: i,
  }));
}

function computeMaxMeals(entries) {
  let max = 1;
  (entries || []).forEach(e => {
    if (e?.fourthMealStart || e?.fourthMealEnd) max = Math.max(max, 4);
    else if (e?.thirdMealStart || e?.thirdMealEnd) max = Math.max(max, 3);
    else if (e?.secondMealStart || e?.secondMealEnd) max = Math.max(max, 2);
  });
  return max;
}

// ── OT Mini Bar (stacked proportional bar) ───────────────────────────
function OTMiniBar({ entry }) {
  const segments = [
    { val: entry?.preCallOTPay || 0, color: 'bg-teal-400' },
    { val: entry?.filmingOTPay || 0, color: 'bg-red-400' },
    { val: entry?.wrapOTPay || 0, color: 'bg-teal-600' },
    { val: entry?.mealDelayPay || 0, color: 'bg-yellow-400' },
    { val: entry?.btaPay || 0, color: 'bg-orange-400' },
  ].filter(s => s.val > 0);
  const total = segments.reduce((s, seg) => s + seg.val, 0);
  if (total <= 0) return null;
  return (
    <div className="h-1.5 w-12 rounded-full overflow-hidden flex bg-muted/30">
      {segments.map((seg, i) => (
        <div key={i} className={cn("h-full", seg.color)} style={{ width: `${(seg.val / total * 100).toFixed(0)}%` }} />
      ))}
    </div>
  );
}

// ── New Day Row ──────────────────────────────────────────────────────
// Fields to copy when using "copy down"
const COPYABLE_TIME_FIELDS = [
  'dayType', 'callTime', 'unitCall', 'unitWrap', 'release', 'wrapTime',
  'lunchStart', 'lunchEnd', 'secondMealStart', 'secondMealEnd',
  'thirdMealStart', 'thirdMealEnd', 'fourthMealStart', 'fourthMealEnd',
  'meal1Name', 'meal2Name', 'meal3Name', 'meal4Name',
];

function DayRowNew({ entry, dayIndex, date, onChange, disabled, dealMemo, prevEntry, cs = "£", allowanceModalOpen, setAllowanceModalOpen, maxMeals = 1, otExpanded = false, onToggleOT, onCopyDown, mealsExpanded = false, onToggleMeals, allowsExpanded = false, onToggleAllows }) {
  const [expanded, setExpanded] = useState(false);
  const dayLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex] || '';
  const dateStr = date ? format(new Date(date), 'dd/MM') : '';
  const isOff = ['OFF', 'HOL', 'SICK', 'Rest'].includes(entry?.dayType);
  const dmAllowances = dealMemo?.allowances || [];
  const weeklyAllowanceTotal = dmAllowances.reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const isForcedCall = entry?.turnaroundViolation === true;
  const isNDM = dealMemo?.mealDeductible === false;
  const hasTimeData = entry?.callTime || entry?.unitCall;

  const handleChange = (field, value) => onChange?.({ ...entry, [field]: value });

  return (
    <div className={cn("border-b border-border/30 transition-colors",
      expanded && "bg-card/30",
      isOff && "opacity-60",
    )}>
      {/* Collapsed Row */}
      <div className="group/row flex items-center gap-2 px-4 py-2.5 hover:bg-muted/10 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* Day + Copy Down */}
        <div className="w-16 shrink-0">
          <div className="flex items-center gap-1">
            <p className="text-sm font-bold">{dayLabel}</p>
            {hasTimeData && dayIndex < 6 && !disabled && (
              <button
                className="hidden group-hover/row:flex items-center justify-center size-4 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                title={dayIndex === 0 ? "Copy to Mon–Fri" : "Copy to days below"}
                onClick={(e) => { e.stopPropagation(); onCopyDown?.(dayIndex, dayIndex === 0 ? 4 : 6); }}
              >
                <ChevronDown className="size-3" />
              </button>
            )}
            {isForcedCall && (() => {
              const minTA = dealMemo?.turnaroundMinHrs || 11;
              const actualTA = entry.turnaroundHrs || 0;
              const shortfall = entry.turnaroundShortfallHrs || (minTA - actualTA);
              const btaRate = dealMemo?.btaRate || dealMemo?.otRate1x5 || 0;
              const cost = entry.btaPay || Math.round(shortfall * btaRate * 100) / 100;
              return (
                <HoverCalc formula={`Turnaround: ${actualTA.toFixed(1)}h (min ${minTA}h) — shortfall ${shortfall.toFixed(1)}h × ${cs}${btaRate}/hr = ${cs}${cost.toFixed(2)} penalty`}>
                  <span className="inline-flex items-center gap-0.5 px-1 py-0 rounded text-[7px] font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
                    <Zap className="size-2.5" />FC {shortfall.toFixed(1)}h
                  </span>
                </HoverCalc>
              );
            })()}
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">{dateStr}</p>
        </div>

        {/* Day Type */}
        <div className="w-20 shrink-0">
          <select
            value={entry?.dayType || 'SWD'}
            onChange={(e) => { e.stopPropagation(); handleChange('dayType', e.target.value); }}
            disabled={disabled}
            className="h-7 w-full rounded border border-border bg-background px-1.5 text-[10px] font-bold"
            onClick={(e) => e.stopPropagation()}
          >
            {['SWD', 'CWD', 'SCWD', 'Shoot', 'Prep', 'Wrap', 'RIG', 'TRVL', 'HOL', 'SICK', 'OFF'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Crew Call */}
        <div className="w-20 shrink-0" onClick={(e) => e.stopPropagation()}>
          <TimeInput value={entry?.callTime || ''} onChange={(v) => handleChange('callTime', v)} disabled={disabled || isOff} placeholder="06:00" />
        </div>

        {/* Unit Call (locked) */}
        <div className="w-20 shrink-0" onClick={(e) => e.stopPropagation()}>
          <TimeInput value={entry?.unitCall || ''} onChange={(v) => handleChange('unitCall', v)} disabled={disabled || isOff} placeholder="07:00" />
        </div>

        {/* ── MEALS Column (subdivisions — progressive reveal) ── */}
        <div className="shrink-0 flex flex-col justify-center w-[160px]" onClick={(e) => e.stopPropagation()}>
          {(() => {
            const filledCount = MEAL_FIELDS.filter(m => entry?.[m.startField] && entry?.[m.endField]).length;
            const meals = getActiveMeals(entry);
            return meals.map((m, mi) => {
              const hasTimes = entry?.[m.startField] || entry?.[m.endField];
              const isNextEmpty = mi === filledCount;
              const customName = entry?.[m.nameField];
              const label = customName || `Meal ${mi + 1}`;
              const isFaded = !hasTimes;

              if (!hasTimes && !isNextEmpty) return null;
              if (isOff && !hasTimes) return null;

              return (
                <div key={`meal-${mi}`} className={cn("flex items-center gap-px py-px", isFaded && "opacity-40 hover:opacity-70 transition-opacity")}>
                  <span
                    className={cn("text-[8px] font-semibold shrink-0 truncate cursor-pointer", hasTimes ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground/60")}
                    title={`Click to rename: ${customName || `Meal ${mi + 1}`}`}
                    onClick={() => {
                      const name = prompt(`Name for meal ${mi + 1}:`, customName || '');
                      if (name !== null) handleChange(m.nameField, name || null);
                    }}
                  >{label}</span>
                  <TimeInput
                    value={entry?.[m.startField] || ''}
                    onChange={(v) => handleChange(m.startField, v)}
                    disabled={disabled || isOff}
                    placeholder="—"
                    className="!w-[44px] !h-5 !text-[9px] !px-0.5 !rounded-sm !border-0 !bg-muted/30 focus:!bg-background focus:!border focus:!border-ring"
                  />
                  <span className="text-muted-foreground/30 text-[8px] mx-px">–</span>
                  <TimeInput
                    value={entry?.[m.endField] || ''}
                    onChange={(v) => handleChange(m.endField, v)}
                    disabled={disabled || isOff}
                    placeholder="—"
                    className="!w-[44px] !h-5 !text-[9px] !px-0.5 !rounded-sm !border-0 !bg-muted/30 focus:!bg-background focus:!border focus:!border-ring"
                  />
                </div>
              );
            });
          })()}
        </div>

        {/* Unit Wrap (locked) */}
        <div className="w-20 shrink-0" onClick={(e) => e.stopPropagation()}>
          <TimeInput value={entry?.unitWrap || ''} onChange={(v) => handleChange('unitWrap', v)} disabled={disabled || isOff} placeholder="18:00" />
        </div>

        {/* Release */}
        <div className="w-20 shrink-0" onClick={(e) => e.stopPropagation()}>
          <TimeInput value={entry?.release || entry?.wrapTime || ''} onChange={(v) => onChange?.({ ...entry, release: v, wrapTime: v })} disabled={disabled || isOff} placeholder="19:00" />
        </div>

        {/* ── OT Column (collapsible) ── */}
        {(() => {
          const otRate = dealMemo?.otRate || dealMemo?.otRate1x5 || (dealMemo?.hourlyRate ? dealMemo.hourlyRate * (dealMemo?.otMultiplier || 1.5) : 0);
          const otCap = dealMemo?.otRateCap;
          const effRate = otCap ? Math.min(otRate, otCap) : otRate;
          const mealRate = dealMemo?.mealPenaltyRate || dealMemo?.mealPenaltyAmounts?.[0] || dealMemo?.hourlyRate || (dealMemo?.weeklyRate ? Math.round(dealMemo.weeklyRate / 55 * 100) / 100 : 35);
          const btaRate = dealMemo?.btaRate || 45;

          const totalOT = (entry?.preCallOTPay || 0) + (entry?.filmingOTPay || 0) + (entry?.wrapOTPay || 0) + (entry?.mealDelayPay || 0) + (entry?.btaPay || 0);
          const otTip = [
            entry?.preCallOTPay > 0 && `Pre-Call ${cs}${entry.preCallOTPay.toFixed(0)}`,
            entry?.filmingOTPay > 0 && `Film ${cs}${entry.filmingOTPay.toFixed(0)}`,
            entry?.wrapOTPay > 0 && `Wrap ${cs}${entry.wrapOTPay.toFixed(0)}`,
            entry?.mealDelayPay > 0 && `Meal ${cs}${entry.mealDelayPay.toFixed(0)}`,
            entry?.btaPay > 0 && `BTA ${cs}${entry.btaPay.toFixed(0)}`,
          ].filter(Boolean).join(' + ');

          if (!otExpanded) {
            // Collapsed OT: single cell with total + mini bar
            return (
              <div
                className="w-28 shrink-0 flex items-center justify-end gap-1.5 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); onToggleOT?.(); }}
              >
                {totalOT > 0 ? (
                  <>
                    <OTMiniBar entry={entry} />
                    <HoverCalc formula={otTip} color="text-amber-400">
                      <span className="text-[10px] font-bold tabular-nums font-mono text-amber-400">
                        {cs}{totalOT.toFixed(0)}
                      </span>
                    </HoverCalc>
                    <ChevronRight className="size-3 text-muted-foreground/40" />
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-muted-foreground/30">—</span>
                    <ChevronRight className="size-3 text-muted-foreground/20" />
                  </>
                )}
              </div>
            );
          }

          // Expanded OT: 5 sub-columns + collapse button
          const cols = [
            { val: entry?.preCallOTPay, mins: entry?.preCallOTMins, color: "text-teal-400",
              formula: entry?.preCallOTMins > 0 ? `${(entry.preCallOTMins/60).toFixed(1)}h × ${cs}${effRate.toFixed(2)}/hr${otCap ? ' (capped)' : ''}` : null },
            { val: entry?.filmingOTPay, mins: entry?.filmingOTMins, color: "text-red-400",
              formula: entry?.filmingOTMins > 0 ? `${(entry.filmingOTMins/60).toFixed(1)}h × ${cs}${effRate.toFixed(2)}/hr` : null },
            { val: entry?.wrapOTPay, mins: entry?.wrapOTMins, color: "text-teal-400",
              formula: entry?.wrapOTMins > 0 ? `${(entry.wrapOTMins/60).toFixed(1)}h × ${cs}${effRate.toFixed(2)}/hr${otCap ? ' (capped)' : ''}` : null },
            { val: entry?.mealDelayPay, mins: entry?.mealDelayMins, color: "text-yellow-400",
              formula: entry?.mealDelayMins > 0 ? `${Math.ceil(entry.mealDelayMins/15)} × 15min × ${cs}${mealRate}` : null },
            { val: entry?.btaPay, mins: entry?.btaMins, color: "text-orange-400",
              formula: entry?.btaMins > 0 ? `${(entry.btaMins/60).toFixed(1)}h × ${cs}${btaRate}/hr` : null },
          ];

          return (
            <>
              {cols.map((c, ci) => (
                <div key={ci} className="w-14 text-right shrink-0">
                  {c.val > 0 ? (
                    <HoverCalc formula={c.formula} color={c.color}>
                      <span className={cn("text-[10px] font-bold tabular-nums font-mono", c.color)}>
                        {cs}{c.val.toFixed(0)}
                      </span>
                    </HoverCalc>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/30">—</span>
                  )}
                </div>
              ))}
              <div className="w-5 shrink-0 flex items-center" onClick={(e) => { e.stopPropagation(); onToggleOT?.(); }}>
                <ChevronLeft className="size-3 text-muted-foreground/40 cursor-pointer hover:text-foreground" />
              </div>
            </>
          );
        })()}

        {/* Allowances (collapsible) */}
        {(() => {
          const dailyAllow = !isOff ? dmAllowances.reduce((s, a) => s + (Number(a.amount) || 0), 0) : 0;
          if (!allowsExpanded) {
            return (
              <div
                className="w-20 text-right shrink-0 flex items-center justify-end gap-1 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); onToggleAllows?.(); }}
              >
                {dailyAllow > 0 ? (
                  <span className="text-[10px] font-bold tabular-nums font-mono text-teal-400">{cs}{dailyAllow.toFixed(0)}</span>
                ) : (
                  <span className="text-[10px] text-muted-foreground/30">—</span>
                )}
                <ChevronRight className="size-3 text-muted-foreground/40" />
              </div>
            );
          }
          // Expanded: show each allowance (blank on OFF days)
          return (
            <>
              {dmAllowances.map((a, ai) => (
                <div key={ai} className="w-16 text-right shrink-0">
                  {!isOff ? (
                    <>
                      <span className="text-[10px] font-bold tabular-nums font-mono text-teal-400">{cs}{Number(a.amount || 0).toFixed(0)}</span>
                      <div className="text-[7px] text-muted-foreground/50 truncate">{a.name}</div>
                    </>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/30">—</span>
                  )}
                </div>
              ))}
              <div className="w-4 shrink-0 flex items-center" onClick={(e) => { e.stopPropagation(); onToggleAllows?.(); }}>
                <ChevronLeft className="size-3 text-muted-foreground/40 cursor-pointer hover:text-foreground" />
              </div>
            </>
          );
        })()}

        {/* Day Total */}
        <div className="w-20 text-right shrink-0">
          {entry?.dayTotal > 0 ? (
            <HoverCalc
              formula={`basic ${cs}${(entry.basicPay||0).toFixed(0)} + pre ${cs}${(entry.preCallOTPay||0).toFixed(0)} + film ${cs}${(entry.filmingOTPay||0).toFixed(0)} + wrap ${cs}${(entry.wrapOTPay||0).toFixed(0)} + meal ${cs}${(entry.mealDelayPay||0).toFixed(0)} + bta ${cs}${(entry.btaPay||0).toFixed(0)}${entry.nightPremPay > 0 ? ` + night ${cs}${entry.nightPremPay.toFixed(0)}` : ''}`}
              color="text-amber-400"
            >
              <span className="text-sm font-bold tabular-nums font-mono text-amber-400">
                {cs}{entry.dayTotal.toFixed(0)}
              </span>
            </HoverCalc>
          ) : (
            <span className="text-sm font-bold tabular-nums font-mono text-muted-foreground/30">—</span>
          )}
        </div>

        {/* Chevron */}
        <div className="w-6 shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </div>
      </div>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 grid grid-cols-2 gap-3 border-t border-border/20">
              {/* OT Breakdown Card */}
              <Card className="bg-card/50">
                <CardContent className="p-3 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">OT Breakdown</p>
                    <Lock className="size-3 text-red-400" />
                    {isForcedCall && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
                        <Zap className="size-2.5" /> Forced Call
                      </span>
                    )}
                    {isNDM && !isOff && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25">
                        <Info className="size-2.5" /> NDM
                      </span>
                    )}
                  </div>
                  {(() => {
                    const otRate = dealMemo?.otRate || dealMemo?.otRate1x5 || (dealMemo?.hourlyRate ? dealMemo.hourlyRate * (dealMemo?.otMultiplier || 1.5) : 0);
                    const otCap = dealMemo?.otRateCap;
                    const effectiveRate = otCap ? Math.min(otRate, otCap) : otRate;
                    const mealRate = dealMemo?.mealPenaltyRate || dealMemo?.mealPenaltyAmounts?.[0] || dealMemo?.hourlyRate || (dealMemo?.weeklyRate ? Math.round(dealMemo.weeklyRate / 55 * 100) / 100 : 35);
                    const btaRate = dealMemo?.btaRate || dealMemo?.turnaroundPenaltyRate || 45;
                    const nightFlat = dealMemo?.nightPremiumFlat || 20;
                    const contractedHrs = dealMemo?.contractedHoursPerDay || dealMemo?.contractedHours || 10;

                    return (
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Basic</span>
                          <span className="font-mono">{entry?.straightHrs || 0}h</span>
                        </div>
                        {entry?.straightHrs > 0 && (
                          <div className="text-[9px] font-mono text-muted-foreground/60 text-right">
                            contracted {contractedHrs}h/day
                          </div>
                        )}

                        {entry?.preCallOTPay > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-teal-400">Pre-Call OT</span>
                              <span className="font-mono text-teal-400">{cs}{entry.preCallOTPay.toFixed(2)}</span>
                            </div>
                            <div className="text-[9px] font-mono text-muted-foreground/60 text-right">
                              {(entry.preCallOTMins / 60).toFixed(1)}h × {cs}{effectiveRate.toFixed(2)}/hr
                              {otCap ? ` (capped)` : ''}
                            </div>
                          </>
                        )}

                        {entry?.filmingOTPay > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-red-400">Film OT</span>
                              <span className="font-mono text-red-400">{cs}{entry.filmingOTPay.toFixed(2)}</span>
                            </div>
                            <div className="text-[9px] font-mono text-muted-foreground/60 text-right">
                              {(entry.filmingOTMins / 60).toFixed(1)}h × {cs}{effectiveRate.toFixed(2)}/hr
                            </div>
                          </>
                        )}

                        {entry?.wrapOTPay > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-teal-400">Wrap OT</span>
                              <span className="font-mono text-teal-400">{cs}{entry.wrapOTPay.toFixed(2)}</span>
                            </div>
                            <div className="text-[9px] font-mono text-muted-foreground/60 text-right">
                              {(entry.wrapOTMins / 60).toFixed(1)}h × {cs}{effectiveRate.toFixed(2)}/hr
                              {otCap ? ` (capped)` : ''}
                            </div>
                          </>
                        )}

                        {entry?.mealDelayPay > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-yellow-400">Meal Delay</span>
                              <span className="font-mono text-yellow-400">{cs}{entry.mealDelayPay.toFixed(2)}</span>
                            </div>
                            <div className="text-[9px] font-mono text-muted-foreground/60 text-right">
                              {Math.ceil(entry.mealDelayMins / 15)} × 15min × {cs}{mealRate}/increment
                            </div>
                          </>
                        )}

                        {entry?.btaPay > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-red-400">BTA</span>
                              <span className="font-mono text-red-400">{cs}{entry.btaPay.toFixed(2)}</span>
                            </div>
                            <div className="text-[9px] font-mono text-muted-foreground/60 text-right">
                              {(entry.btaMins / 60).toFixed(1)}h shortfall × {cs}{btaRate}/hr
                            </div>
                          </>
                        )}

                        {isForcedCall && (() => {
                          const minTA = dealMemo?.turnaroundMinHrs || 11;
                          const actualTA = entry.turnaroundHrs || 0;
                          const shortfall = entry.turnaroundShortfallHrs || (minTA - actualTA);
                          const bRate = dealMemo?.btaRate || dealMemo?.otRate1x5 || btaRate;
                          const cost = entry.btaPay || Math.round(shortfall * bRate * 100) / 100;
                          return (
                            <div className="mt-1 px-2 py-1.5 rounded bg-yellow-500/10 border border-yellow-500/20">
                              <div className="flex items-center gap-1.5">
                                <Zap className="size-3 text-yellow-400 shrink-0" />
                                <span className="text-[9px] font-bold text-yellow-400">Forced Call</span>
                              </div>
                              <div className="text-[9px] text-muted-foreground mt-0.5 ml-[18px] space-y-0.5">
                                <div>Turnaround: <span className="text-yellow-400 font-mono">{actualTA.toFixed(1)}h</span> (min {minTA}h required)</div>
                                <div>Shortfall: <span className="text-red-400 font-mono">{shortfall.toFixed(1)}h</span></div>
                                <div>Penalty: <span className="text-red-400 font-mono">{shortfall.toFixed(1)}h × {cs}{bRate}/hr = {cs}{cost.toFixed(2)}</span></div>
                              </div>
                            </div>
                          );
                        })()}

                        {entry?.nightPremPay > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-blue-400">Night Prem</span>
                              <span className="font-mono text-blue-400">{cs}{entry.nightPremPay.toFixed(2)}</span>
                            </div>
                            <div className="text-[9px] font-mono text-muted-foreground/60 text-right">
                              flat {cs}{nightFlat}
                            </div>
                          </>
                        )}

                        {otCap && (entry?.preCallOTPay > 0 || entry?.wrapOTPay > 0 || entry?.filmingOTPay > 0) && (
                          <div className="text-[9px] font-mono text-amber-500/80 mt-0.5">
                            OT rate capped at {cs}{otCap}/hr
                          </div>
                        )}

                        <Separator className="my-1" />
                        {(() => {
                          const otTotal = (entry?.preCallOTPay || 0) + (entry?.filmingOTPay || 0) + (entry?.wrapOTPay || 0) + (entry?.mealDelayPay || 0) + (entry?.btaPay || 0) + (entry?.nightPremPay || 0);
                          return (
                            <>
                              <div className="flex justify-between font-bold">
                                <span className="text-amber-400">OT Total</span>
                                <span className="font-mono text-amber-400">{cs}{otTotal.toFixed(2)}</span>
                              </div>
                              {otTotal > 0 && (
                                <div className="text-[9px] font-mono text-muted-foreground/60 text-right">
                                  pre-call + film + wrap + penalties
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Allowances Card */}
              <Card className="bg-card/50">
                <CardContent className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Allowances</p>
                    <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => setAllowanceModalOpen(true)}>
                      <Plus className="size-3 mr-0.5" /> Add
                    </Button>
                  </div>
                  {dmAllowances.length > 0 ? (
                    <div className="space-y-1">
                      {dmAllowances.map((a, ai) => (
                        <div key={ai} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border",
                              a.name?.toLowerCase().includes('per diem') && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                              a.name?.toLowerCase().includes('kit') && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                              a.name?.toLowerCase().includes('mileage') && "bg-teal-500/10 text-teal-400 border-teal-500/20",
                              a.name?.toLowerCase().includes('phone') && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                              a.name?.toLowerCase().includes('car') && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                              !['per diem', 'kit', 'mileage', 'phone', 'car'].some(k => a.name?.toLowerCase().includes(k)) && "bg-muted text-muted-foreground border-border",
                            )}>
                              {a.name}
                            </span>
                          </div>
                          <span className="font-mono font-medium">{cs}{Number(a.amount).toFixed(2)}</span>
                        </div>
                      ))}
                      <Separator className="my-1" />
                      <div className="flex justify-between text-xs font-medium">
                        <span>Total</span>
                        <span className="font-mono text-teal-400">{cs}{weeklyAllowanceTotal.toFixed(2)}/wk</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No allowances on deal memo</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Crew Aside Panel ─────────────────────────────────────────────────
function CrewAside({ summary = {}, entries = [], dealMemo, cs = "£" }) {
  const otRate = dealMemo?.otRate || dealMemo?.otRate1x5 || (dealMemo?.hourlyRate ? dealMemo.hourlyRate * (dealMemo?.otMultiplier || 1.5) : 0);
  const otCap = dealMemo?.otRateCap;
  const effectiveRate = otCap ? Math.min(otRate, otCap) : otRate;
  const hpPct = dealMemo?.holidayPayPct || 12.07;
  const mealRate = dealMemo?.mealPenaltyRate || dealMemo?.mealPenaltyAmounts?.[0] || dealMemo?.hourlyRate || (dealMemo?.weeklyRate ? Math.round(dealMemo.weeklyRate / 55 * 100) / 100 : 35);

  // Sum actual hours from entries for display
  const totalPreCallHrs = entries.reduce((s, e) => s + ((e?.preCallOTMins || 0) / 60), 0);
  const totalFilmOTHrs = entries.reduce((s, e) => s + ((e?.filmingOTMins || 0) / 60), 0);
  const totalWrapHrs = entries.reduce((s, e) => s + ((e?.wrapOTMins || 0) / 60), 0);
  const totalBTAHrs = entries.reduce((s, e) => s + ((e?.btaMins || 0) / 60), 0);
  const totalMealIncrements = entries.reduce((s, e) => s + (e?.mealPenaltyCount || Math.ceil((e?.mealDelayMins || 0) / 15)), 0);
  const daysWorked = entries.filter(e => e?.callTime && !['OFF', 'HOL', 'SICK', 'Rest'].includes(e?.dayType)).length;

  // Helper for estimate line with formula
  const EstLine = ({ label, value, color, formula }) => (
    <div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-mono", color)}>{cs}{(value || 0).toLocaleString()}</span>
      </div>
      {formula && value > 0 && (
        <div className="text-[8px] font-mono text-muted-foreground/50 text-right">{formula}</div>
      )}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-card/30">
      {/* Pay Estimate */}
      <div className="p-4 border-b">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Pay Estimate</p>
        <div className="space-y-1.5 text-xs">
          <EstLine label="Basic Pay" value={summary.basic}
            formula={dealMemo?.payBasis === 'daily' ? `${daysWorked} days × ${cs}${(dealMemo?.dailyRate || 0).toFixed(2)}/day` : `weekly rate`} />
          <EstLine label="Holiday Pay" value={summary.holidayPay}
            formula={`${hpPct}% × ${cs}${(summary.basic || 0).toLocaleString()}`} />
          <EstLine label="Pre-Call OT" value={summary.preCallOT} color="text-teal-400"
            formula={effectiveRate ? `${totalPreCallHrs.toFixed(1)}hrs × ${cs}${effectiveRate.toFixed(2)}/hr` : undefined} />
          <EstLine label="Film/Cam OT" value={summary.filmOT} color="text-red-400"
            formula={effectiveRate ? `${totalFilmOTHrs.toFixed(1)}hrs × ${cs}${effectiveRate.toFixed(2)}/hr` : undefined} />
          <EstLine label="Wrap OT" value={summary.wrapOT} color="text-teal-400"
            formula={effectiveRate ? `${totalWrapHrs.toFixed(1)}hrs × ${cs}${effectiveRate.toFixed(2)}/hr` : undefined} />
          <EstLine label="BTA" value={summary.bta} color="text-red-400"
            formula={totalBTAHrs > 0 ? `${totalBTAHrs.toFixed(1)}hrs × ${cs}${(dealMemo?.btaRate || effectiveRate).toFixed(2)}/hr` : undefined} />
          <EstLine label="Meal Delays" value={summary.mealDelay} color="text-yellow-400"
            formula={totalMealIncrements > 0 ? `${totalMealIncrements} × 15min × ${cs}${mealRate}/increment` : undefined} />
          <EstLine label="Allowances" value={summary.allowances}
            formula={`weekly deal memo allowances`} />
          <Separator className="my-2" />
          <div className="flex justify-between font-bold text-sm"><span className="text-amber-400">Est. Gross</span><span className="font-mono text-amber-400">{cs}{(summary.gross || 0).toLocaleString()}</span></div>
          <div className="text-[8px] font-mono text-muted-foreground/50 text-right">
            basic + HP + OT + penalties + allowances
          </div>
          {otCap && (
            <div className="text-[8px] font-mono text-amber-500/70">
              OT rate capped at {cs}{otCap}/hr
            </div>
          )}
        </div>
        <p className="text-[9px] text-muted-foreground mt-2">Estimate only · subject to payroll bureau calculation.</p>
      </div>

      {/* Preferences */}
      <div className="p-4 border-b">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Preferences</p>
        <div className="space-y-3">
          {[
            { label: "GPS auto-fill", desc: "Pre-fill times from clock-in logs" },
            { label: "Override alerts", desc: "Notify if a time is changed" },
            { label: "Show pay estimates", desc: "Display gross estimate in summary" },
            { label: "Kit rental auto-apply", desc: "Add daily kit from deal memo" },
          ].map(p => (
            <div key={p.label} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">{p.label}</p>
                <p className="text-[9px] text-muted-foreground">{p.desc}</p>
              </div>
              <Switch defaultChecked className="scale-75" />
            </div>
          ))}
        </div>
      </div>

      {/* Source Key */}
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Source Key</p>
        <div className="space-y-2">
          {[
            { badge: "GPS", color: "bg-emerald-500/10 text-emerald-400", desc: "Verified GPS clock-in/out" },
            { badge: "CS", color: "bg-blue-500/10 text-blue-400", desc: "Call sheet" },
            { badge: "BP", color: "bg-teal-500/10 text-teal-400", desc: "Back pages / AD report" },
            { badge: "Manual", color: "bg-yellow-500/10 text-yellow-400", desc: "Your amendment" },
            { badge: "Override", color: "bg-orange-500/10 text-orange-400", desc: "Producer override" },
            { badge: "🔒", color: "bg-red-500/10 text-red-400", desc: "Set by production" },
          ].map(s => (
            <div key={s.badge} className="flex items-center gap-2">
              <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold border", s.color, `border-${s.color.split(' ')[1]?.replace('text-', '')}/20`)}>{s.badge}</span>
              <span className="text-[10px] text-muted-foreground">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Column Headers ───────────────────────────────────────────────────
function ColumnHeaders({ otExpanded = false, onToggleOT, allowsExpanded = false, onToggleAllows, allowanceNames = [] }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/20 text-[8px] font-bold uppercase tracking-wider text-muted-foreground sticky top-0 z-10">
      <div className="w-16 shrink-0">Day</div>
      <div className="w-20 shrink-0">Day Type</div>
      <div className="w-20 shrink-0">Crew Call</div>
      <div className="w-20 shrink-0">Unit Call</div>
      <div className="w-[160px] shrink-0 text-center text-blue-600 dark:text-blue-400">Meals</div>
      <div className="w-20 shrink-0">Unit Wrap</div>
      <div className="w-20 shrink-0">Release</div>
      {otExpanded ? (
        <>
          <div className="w-14 text-right shrink-0 text-teal-600 dark:text-teal-400">Pre-Call</div>
          <div className="w-14 text-right shrink-0 text-red-600 dark:text-red-400">Film OT</div>
          <div className="w-14 text-right shrink-0 text-teal-600 dark:text-teal-400">Wrap OT</div>
          <div className="w-14 text-right shrink-0 text-yellow-600 dark:text-yellow-400">Meal</div>
          <div className="w-14 text-right shrink-0 text-orange-600 dark:text-orange-400">BTA</div>
          <div className="w-5 shrink-0 cursor-pointer" onClick={onToggleOT}>
            <ChevronLeft className="size-3 text-muted-foreground" />
          </div>
        </>
      ) : (
        <div className="w-28 text-right shrink-0 text-amber-600 dark:text-amber-400 cursor-pointer flex items-center justify-end gap-1" onClick={onToggleOT}>
          <span>OT Total</span>
          <ChevronRight className="size-3 text-muted-foreground" />
        </div>
      )}
      {allowsExpanded ? (
        <>
          {allowanceNames.map((name, ai) => (
            <div key={ai} className="w-16 text-right shrink-0 text-teal-600 dark:text-teal-400">
              <span className="truncate text-[7px]">{name}</span>
            </div>
          ))}
          <div className="w-4 shrink-0 cursor-pointer" onClick={onToggleAllows}>
            <ChevronLeft className="size-3 text-muted-foreground" />
          </div>
        </>
      ) : (
        <div className="w-20 text-right shrink-0 text-teal-600 dark:text-teal-400 cursor-pointer flex items-center justify-end gap-1" onClick={onToggleAllows}>
          <span>Allowances</span>
          <ChevronRight className="size-3 text-muted-foreground" />
        </div>
      )}
      <div className="w-20 text-right shrink-0">Day Total</div>
      <div className="w-6 shrink-0" />
    </div>
  );
}

// ── Main TimecardShell ───────────────────────────────────────────────
export default function TimecardShell({
  timecard,
  entries = [],
  weekStartDate,
  onEntryChange,
  onSave,
  onCalculate,
  onSubmit,
  onApprove,
  onPayrollApprove,
  onReject,
  disabled = false,
  crew = {},
  dealMemo = {},
  onPrevWeek,
  onNextWeek,
}) {
  const country = dealMemo?.territory || dealMemo?.country || timecard?.productionId?.country || 'UK';
  const cs = currencySymbol(country);
  const [allowanceModalOpen, setAllowanceModalOpen] = useState(false);
  const [otExpanded, setOtExpanded] = useState(false);
  const toggleOT = useCallback(() => setOtExpanded(prev => !prev), []);
  const [allowsExpanded, setAllowsExpanded] = useState(false);
  const toggleAllows = useCallback(() => setAllowsExpanded(prev => !prev), []);

  // Copy one day's times to all days below it
  const handleCopyDown = useCallback((fromIndex, toIndex) => {
    const source = entries[fromIndex];
    if (!source) return;
    const copied = {};
    for (const f of COPYABLE_TIME_FIELDS) {
      if (source[f] !== undefined && source[f] !== null && source[f] !== '') {
        copied[f] = source[f];
      }
    }
    for (let i = fromIndex + 1; i <= Math.min(toIndex, 6); i++) {
      onEntryChange?.(i, { ...entries[i], ...copied });
    }
  }, [entries, onEntryChange]);
  const [asideOpen, setAsideOpen] = useState(() => {
    try { return localStorage.getItem('tc-aside-open') !== 'false'; } catch { return true; }
  });
  const toggleAside = () => {
    const next = !asideOpen;
    setAsideOpen(next);
    try { localStorage.setItem('tc-aside-open', String(next)); } catch {}
  };

  // Allowances from deal memo
  const dmAllowances = dealMemo?.allowances || [];
  const weeklyAllowanceTotal = dmAllowances.reduce((s, a) => s + (Number(a.amount) || 0), 0);

  const weekLabel = weekStartDate
    ? `Week · ${format(parseISO(weekStartDate), 'dd MMM')} – ${format(addDays(parseISO(weekStartDate), 6), 'dd MMM yyyy')}`
    : 'Week';

  // Build 7 days
  const days = useMemo(() => {
    const start = weekStartDate ? parseISO(weekStartDate) : new Date();
    return Array.from({ length: 7 }, (_, i) => ({
      date: addDays(start, i).toISOString(),
      entry: entries[i] || {},
      index: i,
    }));
  }, [weekStartDate, entries]);

  // Max number of meal columns across all entries
  const maxMeals = useMemo(() => computeMaxMeals(entries), [entries]);

  // Weekly summary from entries
  const summary = useMemo(() => {
    const s = { basic: 0, preCallOT: 0, wrapOT: 0, filmOT: 0, mealDelay: 0, allowances: 0, gross: 0, bta: 0, holidayPay: 0 };
    entries.forEach(e => {
      s.basic += e?.basicPay || 0;
      s.preCallOT += e?.preCallOTPay || 0;
      s.wrapOT += e?.wrapOTPay || 0;
      s.filmOT += e?.filmingOTPay || 0;
      s.mealDelay += e?.mealDelayPay || 0;
      s.bta += e?.btaPay || 0;
      s.gross += e?.dayTotal || 0;
    });
    // Holiday pay: check employment type rules (fringes.holidayPay flag)
    const empRules = getEmploymentRules(dealMemo?.employmentStatus);
    const hpApplies = empRules?.fringes?.holidayPay === true;
    s.holidayPay = hpApplies ? Math.round(s.basic * (dealMemo?.holidayPayPct || 0) / 100 * 100) / 100 : 0;
    s.allowances = weeklyAllowanceTotal;
    s.gross += s.holidayPay + s.allowances;
    return s;
  }, [entries, dealMemo, weeklyAllowanceTotal]);

  return (
    <div className="flex flex-col h-full">
      {/* Week Nav */}
      <WeekNav weekLabel={weekLabel} status={timecard?.status} onPrev={onPrevWeek} onNext={onNextWeek} />

      {/* Crew Header */}
      <CrewHeader crew={crew} dealMemo={dealMemo} />

      {/* Week Summary */}
      <WeekSummaryStrip summary={summary} entries={entries} dealMemo={dealMemo} cs={cs} />

      {/* Main Area: Grid + Aside */}
      <div className="flex flex-1 min-h-0">
        {/* Grid */}
        <div className="flex-1 overflow-auto">
          <ColumnHeaders otExpanded={otExpanded} onToggleOT={toggleOT} allowsExpanded={allowsExpanded} onToggleAllows={toggleAllows} allowanceNames={dmAllowances.map(a => a.name)} />
          {days.map(({ date, entry, index }) => (
            <DayRowNew
              key={index}
              entry={entry}
              dayIndex={index}
              date={date}
              onChange={(updated) => onEntryChange?.(index, updated)}
              disabled={disabled}
              dealMemo={dealMemo}
              prevEntry={index > 0 ? entries[index - 1] : null}
              cs={cs}
              allowanceModalOpen={allowanceModalOpen}
              setAllowanceModalOpen={setAllowanceModalOpen}
              maxMeals={maxMeals}
              otExpanded={otExpanded}
              onToggleOT={toggleOT}
              onCopyDown={handleCopyDown}
              allowsExpanded={allowsExpanded}
              onToggleAllows={toggleAllows}
            />
          ))}
        </div>

        {/* Aside — collapsible */}
        <div className={cn("shrink-0 border-l transition-all duration-200", asideOpen ? "w-[268px]" : "w-5 cursor-pointer hover:bg-muted/20 hover:w-6")} onClick={!asideOpen ? toggleAside : undefined}>
          {asideOpen ? (
            <div className="flex h-full">
              <button
                onClick={toggleAside}
                className="w-5 shrink-0 flex items-center justify-center hover:bg-muted/20 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronRight className="size-3.5 text-muted-foreground" />
              </button>
              <CrewAside summary={summary} entries={entries} dealMemo={dealMemo} cs={cs} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <ChevronLeft className="size-3 text-muted-foreground/40" />
            </div>
          )}
        </div>
      </div>

      {/* Footer — context-aware based on status */}
      <div className="flex items-center justify-between px-6 py-3 border-t bg-card/50">
        <div className="flex gap-2">
          {!disabled && (
            <>
              <Button variant="outline" size="sm" onClick={onSave}><Save className="size-3.5 mr-1.5" /> Save</Button>
              <Button variant="outline" size="sm" onClick={onCalculate}><Calculator className="size-3.5 mr-1.5" /> Calculate</Button>
              <Button variant="outline" size="sm"><Sparkles className="size-3.5 mr-1.5" /> AI Fill</Button>
            </>
          )}
          {disabled && onCalculate && (
            <Button variant="outline" size="sm" onClick={onCalculate}><Calculator className="size-3.5 mr-1.5" /> Recalculate</Button>
          )}
        </div>
        <div className="flex gap-2">
          {/* Draft → Submit */}
          {!disabled && onSubmit && (
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold" onClick={onSubmit}>
              <Send className="size-3.5 mr-1.5" /> Submit for Approval
            </Button>
          )}
          {/* Submitted → Dept Approve / Reject */}
          {timecard?.status === 'submitted' && onApprove && (
            <>
              {onReject && (
                <Button variant="outline" size="sm" className="text-red-500 border-red-500/30" onClick={onReject}>
                  Reject
                </Button>
              )}
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold" onClick={onApprove}>
                <Check className="size-3.5 mr-1.5" /> Dept Approve
              </Button>
            </>
          )}
          {/* Dept Approved → Payroll Approve */}
          {timecard?.status === 'dept_approved' && onPayrollApprove && (
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white font-bold" onClick={onPayrollApprove}>
              <Check className="size-3.5 mr-1.5" /> Payroll Approve
            </Button>
          )}
          {/* Already approved */}
          {timecard?.status === 'payroll_approved' && (
            <span className="text-xs text-emerald-500 font-medium">✓ Payroll Approved</span>
          )}
        </div>
      </div>

      {/* Allowance Modal */}
      <AllowanceModal
        open={allowanceModalOpen}
        onOpenChange={setAllowanceModalOpen}
        onAdd={(allowance) => {
          const dmId = dealMemo?._id || timecard?.dealMemoId?._id || timecard?.dealMemoId;
          if (!dmId) return;
          const currentAllowances = dealMemo?.allowances || [];
          const updated = [...currentAllowances, { name: allowance.name, amount: allowance.amount, type: allowance.type, notes: allowance.notes }];
          fetch(`/api/deal-memos/${dmId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ allowances: updated }),
          }).then(r => r.json()).then(data => {
            if (data.success) window.location.reload();
          }).catch(() => {});
        }}
        dealMemo={dealMemo}
        currencySymbol={cs}
      />
    </div>
  );
}
