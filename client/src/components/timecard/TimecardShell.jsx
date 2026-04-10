import { useState, useMemo, useCallback } from "react";
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
  MapPin, FileText, Pencil, Check, X,
} from "lucide-react";
import TimeInput from "./TimeInput";

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
        <Button variant="ghost" size="icon" className="size-8" onClick={onPrev}><ChevronLeft className="size-4" /></Button>
        <span className="text-sm font-semibold">{weekLabel}</span>
        <Button variant="ghost" size="icon" className="size-8" onClick={onNext}><ChevronRight className="size-4" /></Button>
      </div>
      <Badge variant="outline" className={cn("text-xs",
        status === 'draft' && "text-yellow-500 border-yellow-500/30",
        status === 'submitted' && "text-blue-500 border-blue-500/30",
        status === 'approved' && "text-emerald-500 border-emerald-500/30",
      )}>{status || "Draft"}</Badge>
    </div>
  );
}

// ── Crew Header ──────────────────────────────────────────────────────
function CrewHeader({ crew, dealMemo }) {
  const initials = crew?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  return (
    <div className="px-6 py-4 border-b bg-card/30">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary border-2 border-primary/20">
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-bold">{crew?.name || "Crew Member"}</h2>
          <p className="text-sm text-muted-foreground">
            {crew?.role} · {crew?.department} · {dealMemo?.dealType || "Weekly"} · Week {crew?.weekNumber || "—"}
          </p>
        </div>
        {dealMemo?.overtimeApplicable !== false && (
          <Badge variant="outline" className="ml-auto text-red-400 border-red-500/30 bg-red-500/5 text-[10px]">
            <Lock className="size-3 mr-1" /> OT is auto-calculated from your times
          </Badge>
        )}
      </div>
    </div>
  );
}

// ── Week Summary Strip ───────────────────────────────────────────────
function WeekSummaryStrip({ summary = {}, cs = "£" }) {
  const cards = [
    { label: "Basic", value: summary.basic || 0, color: "text-blue-400" },
    { label: "Pre-Call OT", value: summary.preCallOT || 0, color: "text-teal-400" },
    { label: "Wrap OT", value: summary.wrapOT || 0, color: "text-teal-400" },
    { label: "Cam/Film OT", value: summary.filmOT || 0, color: "text-red-400" },
    { label: "Meal Delay", value: summary.mealDelay || 0, color: "text-yellow-400" },
    { label: "Allowances", value: summary.allowances || 0, color: "text-teal-400" },
    { label: "Est. Gross", value: summary.gross || 0, color: "text-amber-400" },
  ];
  return (
    <div className="grid grid-cols-7 gap-2 px-6 py-3 border-b bg-card/20">
      {cards.map(c => (
        <div key={c.label} className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{c.label}</p>
          <p className={cn("text-sm font-bold tabular-nums font-mono", c.color)}>{cs}{c.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

// ── New Day Row ──────────────────────────────────────────────────────
function DayRowNew({ entry, dayIndex, date, onChange, disabled, dealMemo, prevEntry, cs = "£" }) {
  const [expanded, setExpanded] = useState(false);
  const dayLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex] || '';
  const dateStr = date ? format(new Date(date), 'dd/MM') : '';
  const isOff = ['OFF', 'HOL', 'SICK', 'Rest'].includes(entry?.dayType);

  const handleChange = (field, value) => onChange?.({ ...entry, [field]: value });

  return (
    <div className={cn("border-b border-border/30 transition-colors",
      expanded && "bg-card/30",
      isOff && "opacity-60",
    )}>
      {/* Collapsed Row */}
      <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted/10 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* Day */}
        <div className="w-16 shrink-0">
          <p className="text-sm font-bold">{dayLabel}</p>
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

        {/* Unit Wrap (locked) */}
        <div className="w-20 shrink-0" onClick={(e) => e.stopPropagation()}>
          <TimeInput value={entry?.unitWrap || ''} onChange={(v) => handleChange('unitWrap', v)} disabled={disabled || isOff} placeholder="18:00" />
        </div>

        {/* Release */}
        <div className="w-20 shrink-0" onClick={(e) => e.stopPropagation()}>
          <TimeInput value={entry?.release || entry?.wrapTime || ''} onChange={(v) => { handleChange('release', v); handleChange('wrapTime', v); }} disabled={disabled || isOff} placeholder="19:00" />
        </div>

        {/* OT Tags */}
        <div className="flex-1 flex flex-wrap gap-1 min-w-0">
          {entry?.preCallOTMins > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">Pre {Math.round(entry.preCallOTMins)}m · {cs}{(entry.preCallOTPay || 0).toFixed(0)}</span>}
          {entry?.filmingOTMins > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">Film {Math.round(entry.filmingOTMins)}m · {cs}{(entry.filmingOTPay || 0).toFixed(0)}</span>}
          {entry?.wrapOTMins > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">Wrap {Math.round(entry.wrapOTMins)}m · {cs}{(entry.wrapOTPay || 0).toFixed(0)}</span>}
          {entry?.btaMins > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">BTA {Math.round(entry.btaMins)}m · {cs}{(entry.btaPay || 0).toFixed(0)}</span>}
          {entry?.mealDelayMins > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Meal {Math.round(entry.mealDelayMins)}m</span>}
          {entry?.nightShoot && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Night</span>}
          {!entry?.preCallOTMins && !entry?.filmingOTMins && !entry?.wrapOTMins && !isOff && <span className="text-[10px] text-muted-foreground">—</span>}
        </div>

        {/* Allowance pills (from deal memo) */}
        <div className="flex gap-1 shrink-0 max-w-[140px] overflow-hidden">
          {dmAllowances.slice(0, 2).map((a, ai) => (
            <span key={ai} className="inline-flex items-center px-1 py-0 rounded text-[7px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20 whitespace-nowrap">
              {cs}{a.amount} {a.name?.split(' ')[0]}
            </span>
          ))}
          {dmAllowances.length > 2 && <span className="text-[8px] text-muted-foreground">+{dmAllowances.length - 2}</span>}
        </div>

        {/* Day Total */}
        <div className="w-20 text-right shrink-0">
          <span className="text-sm font-bold tabular-nums font-mono text-amber-400">
            {entry?.dayTotal > 0 ? `${cs}${entry.dayTotal.toFixed(0)}` : '—'}
          </span>
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
            <div className="px-4 pb-4 pt-2 grid grid-cols-3 gap-3 border-t border-border/20">
              {/* Times Card */}
              <Card className="bg-card/50">
                <CardContent className="p-3 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Times</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Crew Call</span><span className="font-mono">{entry?.callTime || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Unit Call <Lock className="inline size-2.5" /></span><span className="font-mono text-emerald-400">{entry?.unitCall || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Unit Wrap <Lock className="inline size-2.5" /></span><span className="font-mono text-emerald-400">{entry?.unitWrap || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">M1 Out</span>
                      <TimeInput value={entry?.lunchStart || ''} onChange={(v) => handleChange(dayIndex, 'lunchStart', v)} disabled={disabled} placeholder="13:00" />
                    </div>
                    <div className="flex justify-between"><span className="text-muted-foreground">M1 In</span>
                      <TimeInput value={entry?.lunchEnd || ''} onChange={(v) => handleChange(dayIndex, 'lunchEnd', v)} disabled={disabled} placeholder="14:00" />
                    </div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Release</span><span className="font-mono">{entry?.release || entry?.wrapTime || '—'}</span></div>
                    {/* M2 fields — auto-show when >5hrs after M1 end */}
                    {(() => {
                      const m1End = entry?.lunchEnd;
                      const rel = entry?.release || entry?.wrapTime;
                      if (!m1End || !rel) return null;
                      const [m1h, m1m] = m1End.split(':').map(Number);
                      const [rh, rm] = rel.split(':').map(Number);
                      const elapsed = (rh * 60 + rm) - (m1h * 60 + m1m);
                      if (elapsed < 300) return null; // < 5 hours
                      return (
                        <>
                          <Separator className="my-1" />
                          <div className="flex justify-between"><span className="text-muted-foreground">M2 Out</span>
                            <TimeInput value={entry?.secondMealStart || ''} onChange={(v) => handleChange(dayIndex, 'secondMealStart', v)} disabled={disabled} placeholder="19:00" />
                          </div>
                          <div className="flex justify-between"><span className="text-muted-foreground">M2 In</span>
                            <TimeInput value={entry?.secondMealEnd || ''} onChange={(v) => handleChange(dayIndex, 'secondMealEnd', v)} disabled={disabled} placeholder="19:30" />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* OT Breakdown Card */}
              <Card className="bg-card/50">
                <CardContent className="p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">OT Breakdown</p>
                    <Lock className="size-3 text-red-400" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Basic</span><span className="font-mono">{entry?.straightHrs || 0}h</span></div>
                    {entry?.preCallOTPay > 0 && <div className="flex justify-between"><span className="text-teal-400">Pre-Call OT</span><span className="font-mono text-teal-400">{cs}{entry.preCallOTPay.toFixed(2)}</span></div>}
                    {entry?.filmingOTPay > 0 && <div className="flex justify-between"><span className="text-red-400">Film OT</span><span className="font-mono text-red-400">{cs}{entry.filmingOTPay.toFixed(2)}</span></div>}
                    {entry?.wrapOTPay > 0 && <div className="flex justify-between"><span className="text-teal-400">Wrap OT</span><span className="font-mono text-teal-400">{cs}{entry.wrapOTPay.toFixed(2)}</span></div>}
                    {entry?.mealDelayPay > 0 && <div className="flex justify-between"><span className="text-yellow-400">Meal Delay</span><span className="font-mono text-yellow-400">{cs}{entry.mealDelayPay.toFixed(2)}</span></div>}
                    {entry?.btaPay > 0 && <div className="flex justify-between"><span className="text-red-400">BTA</span><span className="font-mono text-red-400">{cs}{entry.btaPay.toFixed(2)}</span></div>}
                    {entry?.nightPremPay > 0 && <div className="flex justify-between"><span className="text-blue-400">Night Prem</span><span className="font-mono text-blue-400">{cs}{entry.nightPremPay.toFixed(2)}</span></div>}
                    <Separator className="my-1" />
                    <div className="flex justify-between font-bold"><span className="text-amber-400">Day Total</span><span className="font-mono text-amber-400">{cs}{(entry?.dayTotal || 0).toFixed(2)}</span></div>
                  </div>
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
function CrewAside({ summary = {}, dealMemo, cs = "£" }) {
  return (
    <div className="w-[268px] shrink-0 border-l overflow-y-auto bg-card/30">
      {/* Pay Estimate */}
      <div className="p-4 border-b">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Pay Estimate</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Basic Pay</span><span className="font-mono">{cs}{(summary.basic || 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Holiday Pay</span><span className="font-mono">{cs}{(summary.holidayPay || 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Pre-Call OT</span><span className="font-mono text-teal-400">{cs}{(summary.preCallOT || 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Film/Cam OT</span><span className="font-mono text-red-400">{cs}{(summary.filmOT || 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Wrap OT</span><span className="font-mono text-teal-400">{cs}{(summary.wrapOT || 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">BTA</span><span className="font-mono text-red-400">{cs}{(summary.bta || 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Meal Delays</span><span className="font-mono text-yellow-400">{cs}{(summary.mealDelay || 0).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Allowances</span><span className="font-mono">{cs}{(summary.allowances || 0).toLocaleString()}</span></div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold text-sm"><span className="text-amber-400">Est. Gross</span><span className="font-mono text-amber-400">{cs}{(summary.gross || 0).toLocaleString()}</span></div>
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
function ColumnHeaders() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/20 text-[9px] font-bold uppercase tracking-wider text-muted-foreground sticky top-0 z-10">
      <div className="w-16 shrink-0">Day</div>
      <div className="w-20 shrink-0">Day Type</div>
      <div className="w-20 shrink-0">Crew Call</div>
      <div className="w-20 shrink-0">Unit Call</div>
      <div className="w-20 shrink-0">Unit Wrap</div>
      <div className="w-20 shrink-0">Release</div>
      <div className="flex-1">OT Breakdown</div>
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
  disabled = false,
  crew = {},
  dealMemo = {},
}) {
  const country = dealMemo?.territory || dealMemo?.country || timecard?.productionId?.country || 'UK';
  const cs = currencySymbol(country);
  const [allowanceModalOpen, setAllowanceModalOpen] = useState(false);

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
    s.holidayPay = Math.round(s.basic * (dealMemo?.holidayPayPct || 0) / 100 * 100) / 100;
    s.allowances = weeklyAllowanceTotal;
    s.gross += s.holidayPay + s.allowances;
    return s;
  }, [entries, dealMemo, weeklyAllowanceTotal]);

  return (
    <div className="flex flex-col h-full">
      {/* Week Nav */}
      <WeekNav weekLabel={weekLabel} status={timecard?.status} />

      {/* Crew Header */}
      <CrewHeader crew={crew} dealMemo={dealMemo} />

      {/* Week Summary */}
      <WeekSummaryStrip summary={summary} cs={cs} />

      {/* Main Area: Grid + Aside */}
      <div className="flex flex-1 min-h-0">
        {/* Grid */}
        <div className="flex-1 overflow-y-auto">
          <ColumnHeaders />
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
            />
          ))}
        </div>

        {/* Aside */}
        <CrewAside summary={summary} dealMemo={dealMemo} cs={cs} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t bg-card/50">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSave}><Save className="size-3.5 mr-1.5" /> Save</Button>
          <Button variant="outline" size="sm" onClick={onCalculate}><Calculator className="size-3.5 mr-1.5" /> Calculate</Button>
          <Button variant="outline" size="sm"><Sparkles className="size-3.5 mr-1.5" /> AI Fill</Button>
        </div>
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold" onClick={onSubmit}>
          <Send className="size-3.5 mr-1.5" /> Submit for Approval
        </Button>
      </div>

      {/* Allowance Modal */}
      <AllowanceModal
        open={allowanceModalOpen}
        onOpenChange={setAllowanceModalOpen}
        onAdd={(allowance) => {
          console.log('Allowance added:', allowance);
          // TODO: save to timecard or deal memo
        }}
        dealMemo={dealMemo}
        currencySymbol={cs}
      />
    </div>
  );
}
