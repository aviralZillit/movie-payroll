import { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  ChevronDown, ChevronRight, Calendar, Clock, Banknote, TrendingUp,
  FileText, AlertTriangle, Moon, UtensilsCrossed, Timer, Eye,
  Download, MessageSquareWarning, CheckCircle2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/lib/utils";
import useAuthStore from "@/store/authStore";
import { useCrewTimeline, useCrewProductions } from "@/hooks/useCrewTimeline";

// ── Status Config ──────────────────────────────────────────────
const STATUS = {
  paid:             { label: "Paid",        color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500" },
  payroll_approved: { label: "Payroll OK",  color: "bg-teal-500/10 text-teal-400 border-teal-500/20", dot: "bg-teal-500" },
  approved:         { label: "Approved",    color: "bg-teal-500/10 text-teal-400 border-teal-500/20", dot: "bg-teal-500" },
  dept_approved:    { label: "Dept OK",     color: "bg-teal-500/10 text-teal-400 border-teal-500/20", dot: "bg-teal-500" },
  submitted:        { label: "Submitted",   color: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-500" },
  rejected:         { label: "Queried",     color: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-500" },
  draft:            { label: "Draft",       color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", dot: "bg-zinc-500" },
  current:          { label: "In Progress", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-500" },
  upcoming:         { label: "Upcoming",    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", dot: "bg-zinc-600" },
};

const cs = "£";
const fmtP = (v) => v > 0 ? `${cs}${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";

// ── Crew Hero Card ─────────────────────────────────────────────
function CrewHeroCard({ crew, stats }) {
  const statCards = [
    { label: "Weeks Worked", value: stats?.weeksWorked ?? 0, icon: Calendar },
    { label: "Shoot Days", value: stats?.shootDays ?? 0, icon: Clock },
    { label: "Total Paid", value: fmtP(stats?.totalPaid ?? 0), icon: Banknote, color: "text-emerald-400" },
    { label: "Outstanding", value: fmtP(stats?.outstanding ?? 0), icon: TrendingUp, color: "text-amber-400" },
  ];
  return (
    <div className="flex items-start gap-4 p-5 border-b bg-card/50">
      <div className="w-13 h-13 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-lg font-extrabold text-amber-500 shrink-0 font-[Syne]">
        {crew?.initials || "??"}
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-extrabold tracking-tight">{crew?.name || "—"}</h1>
        <p className="text-sm text-muted-foreground">{crew?.role} · {crew?.department}</p>
        <div className="flex gap-1.5 mt-1.5 flex-wrap">
          {crew?.employmentType && <Badge variant="outline" className="text-[9px]">{crew.employmentType.toUpperCase()}</Badge>}
          {crew?.dealType && <Badge variant="outline" className="text-[9px]">{crew.dealType}</Badge>}
          {crew?.agreement && <Badge variant="outline" className="text-[9px]">{crew.agreement}</Badge>}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2.5 shrink-0">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border rounded-lg px-3.5 py-2.5 text-center min-w-[90px]">
            <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
            <p className={cn("text-base font-bold tabular-nums font-mono", color)}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Phase Timeline ─────────────────────────────────────────────
function PhaseTimeline({ phases = [] }) {
  if (phases.length === 0) return null;
  return (
    <div className="flex items-center gap-0 px-5 py-2.5 border-b bg-card/30 overflow-x-auto">
      {phases.map((p, i) => (
        <div key={p.id} className="flex flex-col items-center shrink-0 min-w-[64px] relative">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full border-[1.5px] mb-1",
            p.done ? "bg-emerald-500 border-emerald-500" : p.active ? "bg-amber-500 border-amber-500 shadow-[0_0_8px_rgba(232,184,75,0.5)]" : "bg-muted border-border"
          )}>
            {i < phases.length - 1 && (
              <div className={cn("absolute top-[4px] left-[10px] w-[54px] h-px", p.done ? "bg-emerald-500" : "bg-border")} />
            )}
          </div>
          <span className={cn("text-[8px] font-bold tracking-wide uppercase text-center", p.done ? "text-emerald-400" : p.active ? "text-amber-400" : "text-muted-foreground")}>{p.label}</span>
          <span className="text-[9px] text-muted-foreground font-mono">{p.wkRange}</span>
        </div>
      ))}
    </div>
  );
}

// ── Calendar Strip ─────────────────────────────────────────────
function CalendarStrip({ weeks = [], onWeekClick }) {
  return (
    <div className="flex gap-1 px-5 py-2 border-b bg-card/20 overflow-x-auto">
      {weeks.map((w) => {
        const s = STATUS[w.status] || STATUS.draft;
        return (
          <button
            key={w.weekNumber}
            onClick={() => onWeekClick(w.weekNumber)}
            className={cn(
              "shrink-0 w-7 h-7 rounded text-[10px] font-bold border transition-all hover:scale-110",
              s.color,
            )}
            title={`Week ${w.weekNumber} · ${w.dateRange}`}
          >
            {w.weekNumber}
          </button>
        );
      })}
    </div>
  );
}

// ── Filter Bar ─────────────────────────────────────────────────
function FilterBar({ filter, onFilterChange, search, onSearchChange }) {
  const filters = [
    { key: "all", label: "All" },
    { key: "paid", label: "Paid" },
    { key: "pending", label: "Pending" },
    { key: "draft", label: "Draft" },
  ];
  return (
    <div className="flex items-center gap-2 px-5 py-2 border-b bg-card/30">
      <span className="text-[11px] text-muted-foreground">Filter:</span>
      <div className="flex gap-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wide border transition-all",
              filter === f.key
                ? "border-amber-500 bg-amber-500/10 text-amber-400"
                : "border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="ml-auto">
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search week..."
          className="h-7 w-40 text-xs bg-card border-border"
        />
      </div>
    </div>
  );
}

// ── Pipeline Bar ───────────────────────────────────────────────
function PipelineBar({ pipeline = {}, status }) {
  const steps = [
    { key: "submittedAt", label: "Submitted", icon: "📋" },
    { key: "approvedAt", label: "Approved", icon: "✓" },
    { key: "payrollApprovedAt", label: "Payroll", icon: "⚙" },
    { key: "paidAt", label: "Paid", icon: "£" },
  ];
  return (
    <div className="flex rounded-lg border overflow-hidden mt-2.5">
      {steps.map((s) => {
        const date = pipeline[s.key];
        const isDone = !!date;
        const isActive = !isDone && s.key === "submittedAt" && status === "draft";
        return (
          <div
            key={s.key}
            className={cn(
              "flex-1 flex flex-col items-center py-1.5 px-2 border-r last:border-r-0 text-center",
              isDone ? "bg-emerald-500/5" : isActive ? "bg-amber-500/5" : ""
            )}
          >
            <span className="text-xs">{s.icon}</span>
            <span className={cn("text-[8px] font-bold tracking-wide", isDone ? "text-emerald-400" : isActive ? "text-amber-400" : "text-muted-foreground")}>{s.label}</span>
            <span className="text-[8px] font-mono text-muted-foreground">
              {isDone ? format(new Date(date), "dd MMM") : isActive ? "Pending" : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Week Row ───────────────────────────────────────────────────
function WeekRow({ week, navigate, cs = "£" }) {
  const [expanded, setExpanded] = useState(false);
  const rowRef = useRef(null);
  const s = STATUS[week.status] || STATUS.draft;

  // Day type chips (count duplicates)
  const typeCounts = {};
  (week.dayTypes || []).forEach((t) => { typeCounts[t] = (typeCounts[t] || 0) + 1; });

  // Flag pills
  const flags = [
    week.hasCamOT && { label: `Cam OT`, color: "bg-red-500/10 text-red-400 border-red-500/20" },
    week.btaCount > 0 && { label: `${week.btaCount} BTA`, color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    week.nightShoots > 0 && { label: `${week.nightShoots}× Night`, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    week.hasMealDelay && { label: "Meal delay", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  ].filter(Boolean);

  return (
    <div ref={rowRef} className={cn("border-b transition-colors", expanded && "bg-card/30")} id={`wr-${week.weekNumber}`}>
      {/* Collapsed Row */}
      <div className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-muted/10 transition-colors" onClick={() => setExpanded(!expanded)}>
        {/* Week Badge */}
        <div className={cn("w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0 border", s.color)}>
          <span className="text-sm font-extrabold leading-none">{week.weekNumber}</span>
          <span className="text-[7px] font-bold uppercase tracking-wide text-muted-foreground">WK</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono font-medium">{week.dateRange}</p>
          <div className="flex gap-1 mt-0.5 flex-wrap items-center">
            <span className="text-[11px] text-muted-foreground">{week.daysWorked} days</span>
            {Object.entries(typeCounts).map(([t, c]) => (
              <span key={t} className="text-[9px] bg-muted/50 border rounded px-1 py-px font-bold text-muted-foreground">{t}{c > 1 ? ` ×${c}` : ''}</span>
            ))}
            {flags.map((f, i) => (
              <span key={i} className={cn("text-[8px] font-bold px-1.5 py-px rounded-full border", f.color)}>{f.label}</span>
            ))}
          </div>
        </div>

        {/* Pay Figures */}
        {week.gross > 0 && (
          <div className="flex gap-2 shrink-0 items-center">
            <div className="text-right min-w-[56px]">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">Basic</p>
              <p className="text-xs font-mono text-muted-foreground">{fmtP(week.basicPay)}</p>
            </div>
            {week.otPay > 0 && (
              <div className="text-right min-w-[56px]">
                <p className="text-[9px] font-bold uppercase text-muted-foreground">OT</p>
                <p className="text-xs font-mono text-teal-400">{fmtP(week.otPay)}</p>
              </div>
            )}
            <div className="text-right min-w-[56px]">
              <p className="text-[9px] font-bold uppercase text-muted-foreground">Gross</p>
              <p className="text-xs font-mono font-semibold text-amber-400">{fmtP(week.gross)}</p>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold tracking-wide border shrink-0", s.color)}>
          {s.label}
        </span>

        {/* Chevron */}
        <span className={cn("text-muted-foreground transition-transform", expanded && "rotate-180")}>▾</span>
      </div>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1 border-t border-border/30">
              {/* 4-Card Pay Grid */}
              <div className="grid grid-cols-4 gap-2 mb-2.5">
                {/* Core Pay */}
                <Card className="bg-card/50">
                  <CardContent className="p-2.5">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Core Pay</p>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between"><span className="text-muted-foreground">Days worked</span><span className="font-mono">{week.daysWorked}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Basic</span><span className="font-mono text-amber-400">{fmtP(week.basicPay)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Holiday pay (12.07%)</span><span className="font-mono">{fmtP(week.holidayPay)}</span></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Overtime */}
                <Card className="bg-card/50">
                  <CardContent className="p-2.5">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Overtime</p>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between"><span className="text-muted-foreground">Pre-call OT</span><span className="font-mono text-teal-400">{fmtP(week.preCallOT)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Wrap OT</span><span className="font-mono text-teal-400">{fmtP(week.wrapOT)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Camera OT</span><span className="font-mono text-red-400">{fmtP(week.filmOT)}</span></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Penalties */}
                <Card className="bg-card/50">
                  <CardContent className="p-2.5">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Penalties & Premiums</p>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between"><span className="text-muted-foreground">Meal delay</span><span className="font-mono text-yellow-400">{fmtP(week.mealPenalty)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Night premium</span><span className="font-mono text-blue-400">{week.nightPrem > 0 ? `£${week.nightPrem} (${week.nightShoots}× £20)` : "—"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">BTA</span><span className="font-mono text-orange-400">{fmtP(week.btaPay)}</span></div>
                    </div>
                  </CardContent>
                </Card>

                {/* Allowances & Gross */}
                <Card className="bg-card/50">
                  <CardContent className="p-2.5">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Allowances & Gross</p>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between"><span className="text-muted-foreground">Allowances</span><span className="font-mono text-teal-400">{fmtP(week.allowances)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Day types</span><span className="font-mono text-[10px]">{(week.dayTypes || []).join(" · ") || "—"}</span></div>
                      <Separator className="my-1" />
                      <div className="flex justify-between font-semibold"><span>Est. Gross</span><span className="font-mono text-amber-400 text-xs">{fmtP(week.gross)}</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pipeline */}
              <PipelineBar pipeline={week.pipeline} status={week.status} />

              {/* Actions */}
              <div className="flex gap-2 mt-2.5 justify-end">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate(`/timecards/${week.timecardId}`)}>
                  <Eye className="mr-1 h-3 w-3" /> View Full Timecard →
                </Button>
                {!["paid", "payroll_approved"].includes(week.status) && (
                  <Button variant="outline" size="sm" className="text-xs text-red-400 border-red-500/20 hover:bg-red-500/10">
                    <MessageSquareWarning className="mr-1 h-3 w-3" /> Raise Dispute
                  </Button>
                )}
                {["paid", "payroll_approved"].includes(week.status) && (
                  <Button variant="outline" size="sm" className="text-xs">
                    <Download className="mr-1 h-3 w-3" /> Payslip
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Earnings Aside ─────────────────────────────────────────────
function EarningsAside({ cumulative = {}, crew = {}, stats = {} }) {
  const categories = [
    { label: "Basic Pay", value: cumulative.basic || 0, color: "bg-blue-500" },
    { label: "Holiday Pay", value: cumulative.holidayPay || 0, color: "bg-purple-500" },
    { label: "Pre-Call OT", value: cumulative.preCallOT || 0, color: "bg-teal-500" },
    { label: "Wrap OT", value: cumulative.wrapOT || 0, color: "bg-teal-400" },
    { label: "Camera OT", value: cumulative.filmOT || 0, color: "bg-red-500" },
    { label: "Meal Penalties", value: cumulative.mealPenalty || 0, color: "bg-yellow-500" },
    { label: "Night Premium", value: cumulative.nightPrem || 0, color: "bg-blue-400" },
    { label: "BTA", value: cumulative.bta || 0, color: "bg-orange-500" },
    { label: "Allowances", value: cumulative.allowances || 0, color: "bg-emerald-500" },
  ].filter((c) => c.value > 0);

  return (
    <div className="w-[280px] shrink-0 border-l bg-card/30 overflow-y-auto">
      {/* Total Earnings */}
      <div className="p-4 border-b text-center">
        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Earned to Date</p>
        <p className="text-3xl font-bold font-mono text-amber-400">{fmtP(cumulative.totalGross || 0)}</p>
        <p className="text-[11px] text-muted-foreground mt-1">
          {stats.paidPct || 0}% paid to bank · {stats.weeksWorked || 0} weeks
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="p-4 border-b">
        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Earnings Breakdown</p>
        <div className="space-y-1.5">
          {categories.map((c) => (
            <div key={c.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", c.color)} />
                <span className="text-muted-foreground">{c.label}</span>
              </div>
              <span className="font-mono text-[11px]">{fmtP(c.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deal Memo Summary */}
      <div className="p-4 border-b">
        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Deal Memo</p>
        <div className="space-y-1.5 text-xs">
          {[
            ["Role", crew.role],
            ["Department", crew.department],
            ["Employment", crew.employmentType?.toUpperCase()],
            ["Deal Type", crew.dealType],
            ["Rate Type", crew.rateType],
            ["Weekly Rate", crew.weeklyRate ? `£${crew.weeklyRate.toLocaleString()}` : null],
            ["Daily Rate", crew.dailyRate ? `£${crew.dailyRate.toLocaleString()}` : null],
            ["Hourly Rate", crew.hourlyRate ? `£${crew.hourlyRate.toLocaleString()}/hr` : null],
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="p-4">
        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Documents</p>
        <div className="space-y-1.5">
          {[
            { label: "Deal Memo", icon: FileText },
            { label: "Contract", icon: FileText },
          ].map(({ label, icon: Icon }) => (
            <button key={label} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left">
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function MyTimecards() {
  const { crewId: paramCrewId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const crewId = paramCrewId || user?._id || user?.id;

  // Production selector
  const { data: productions = [], isLoading: prodsLoading } = useCrewProductions(crewId);
  const [selectedProdId, setSelectedProdId] = useState(null);

  // Auto-select first production
  useEffect(() => {
    if (productions.length > 0 && !selectedProdId) {
      setSelectedProdId(productions[0].id);
    }
  }, [productions, selectedProdId]);

  // Timeline data
  const { data, isLoading, isError } = useCrewTimeline(crewId, selectedProdId);

  // Filter state
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Filter weeks
  const filteredWeeks = useMemo(() => {
    let weeks = data?.weeks || [];
    if (filter === "paid") weeks = weeks.filter((w) => ["paid", "payroll_approved"].includes(w.status));
    else if (filter === "pending") weeks = weeks.filter((w) => ["submitted", "dept_approved", "approved"].includes(w.status));
    else if (filter === "draft") weeks = weeks.filter((w) => ["draft"].includes(w.status));
    if (search) weeks = weeks.filter((w) => w.dateRange?.toLowerCase().includes(search.toLowerCase()) || String(w.weekNumber).includes(search));
    return weeks;
  }, [data?.weeks, filter, search]);

  // Group by phase
  const groupedWeeks = useMemo(() => {
    const phases = data?.phases || [];
    if (phases.length === 0) return [{ label: "All Weeks", weeks: [...filteredWeeks].reverse() }];
    return phases.map((p) => ({
      ...p,
      weeks: filteredWeeks.filter((w) => p.weeks.includes(w.weekNumber)).reverse(),
      totalGross: filteredWeeks.filter((w) => p.weeks.includes(w.weekNumber)).reduce((s, w) => s + w.gross, 0),
    })).reverse(); // newest phase first
  }, [filteredWeeks, data?.phases]);

  const handleWeekClick = (weekNum) => {
    const el = document.getElementById(`wr-${weekNum}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Loading
  if (prodsLoading || (isLoading && selectedProdId)) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Production Selector (if multiple) */}
      {productions.length > 1 && (
        <div className="flex items-center gap-3 px-5 py-2 border-b bg-card/40">
          <span className="text-xs text-muted-foreground">Production:</span>
          <Select value={selectedProdId || ""} onValueChange={setSelectedProdId}>
            <SelectTrigger className="h-7 w-64 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {productions.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {data ? (
        <>
          <CrewHeroCard crew={data.crew} stats={data.stats} />
          <PhaseTimeline phases={data.phases} />
          <CalendarStrip weeks={data.weeks} onWeekClick={handleWeekClick} />
          <FilterBar filter={filter} onFilterChange={setFilter} search={search} onSearchChange={setSearch} />

          <div className="flex flex-1 min-h-0">
            {/* Week List */}
            <div className="flex-1 overflow-y-auto">
              {groupedWeeks.map((group) => (
                <div key={group.label || group.id}>
                  {/* Phase Group Header */}
                  <div className="flex items-center gap-2 px-5 py-1.5 bg-background border-b sticky top-0 z-10">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{group.label}</span>
                    <div className="flex-1 h-px bg-border" />
                    {group.totalGross > 0 && <span className="text-[11px] font-mono text-muted-foreground">{fmtP(group.totalGross)}</span>}
                  </div>
                  {group.weeks.length > 0 ? (
                    group.weeks.map((w) => <WeekRow key={w.weekNumber} week={w} navigate={navigate} />)
                  ) : (
                    <div className="px-5 py-3 text-xs text-muted-foreground">No timecards in this period.</div>
                  )}
                </div>
              ))}
              {filteredWeeks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No timecards found</p>
                </div>
              )}
            </div>

            {/* Earnings Aside */}
            <EarningsAside cumulative={data.cumulative} crew={data.crew} stats={data.stats} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24">
          <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium">Select a production to view timecards</p>
        </div>
      )}
    </div>
  );
}
