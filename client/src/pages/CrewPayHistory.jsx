import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar, ChevronDown, ChevronRight, DollarSign, Download,
  AlertTriangle, CheckCircle2, Clock, TrendingUp, Users, Film,
} from "lucide-react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";

// ── Status Badge ─────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    paid: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", label: "Paid" },
    approved: { color: "bg-teal-500/10 text-teal-500 border-teal-500/30", label: "Approved" },
    submitted: { color: "bg-blue-500/10 text-blue-500 border-blue-500/30", label: "Submitted" },
    in_progress: { color: "bg-amber-500/10 text-amber-500 border-amber-500/30", label: "In Progress" },
    draft: { color: "bg-muted text-muted-foreground", label: "Draft" },
    queried: { color: "bg-red-500/10 text-red-500 border-red-500/30", label: "Queried" },
  };
  const c = config[status] || config.draft;
  return <Badge variant="outline" className={cn("text-[10px]", c.color)}>{c.label}</Badge>;
}

// ── Phase Timeline ───────────────────────────────────────────────────
function PhaseTimeline({ phases = [], currentPhase }) {
  return (
    <div className="flex gap-1 overflow-x-auto py-2">
      {phases.map((phase, i) => (
        <div
          key={phase.id}
          className={cn(
            "flex-1 min-w-[120px] rounded-lg border px-3 py-2 text-center transition-colors",
            phase.status === 'active' && "border-amber-500/50 bg-amber-500/5",
            phase.status === 'complete' && "border-emerald-500/30 bg-emerald-500/5",
            phase.status === 'upcoming' && "border-border opacity-50",
          )}
        >
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{phase.label}</p>
          <p className="text-xs text-muted-foreground">W{phase.weekRange?.[0]}–{phase.weekRange?.[1]}</p>
          {phase.status === 'active' && <Badge className="bg-amber-500 text-white text-[8px] mt-1">Current</Badge>}
          {phase.status === 'complete' && <CheckCircle2 className="size-3 text-emerald-500 mx-auto mt-1" />}
        </div>
      ))}
    </div>
  );
}

// ── Week Card ────────────────────────────────────────────────────────
function WeekCard({ week, onExpand, expanded, currencySymbol = "£" }) {
  const cs = currencySymbol;
  return (
    <Card className={cn(expanded && "ring-1 ring-primary/50")}>
      <button
        onClick={onExpand}
        className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-muted/20 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Week {week.weekNumber}</span>
            <span className="text-xs text-muted-foreground">{week.dateRange}</span>
            <StatusBadge status={week.status} />
          </div>
          {/* Day type chips */}
          <div className="flex gap-0.5 mt-1">
            {(week.dayTypes || []).map((dt, i) => (
              <span key={i} className={cn(
                "inline-flex items-center px-1 py-px rounded text-[7px] font-bold border",
                dt === 'SWD' && "bg-blue-950/40 text-blue-400 border-blue-500/20",
                dt === 'CWD' && "bg-teal-950/40 text-teal-400 border-teal-500/20",
                dt === 'OFF' && "bg-muted text-muted-foreground border-border",
              )}>{dt}</span>
            ))}
          </div>
        </div>
        <div className="text-right space-y-0.5">
          <p className="text-xs text-muted-foreground">Basic: {cs}{(week.basicPay || 0).toLocaleString()}</p>
          <p className="text-xs text-amber-500">OT: {cs}{(week.otPay || 0).toLocaleString()}</p>
          <p className="text-sm font-bold tabular-nums">Gross: {cs}{(week.gross || 0).toLocaleString()}</p>
        </div>
        {expanded ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
      </button>

      {expanded && (
        <CardContent className="border-t pt-4 space-y-4">
          {/* 4-Card Pay Breakdown */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Core Pay</p>
              <p className="text-lg font-bold tabular-nums">{cs}{(week.basicPay || 0).toLocaleString()}</p>
              {week.holidayPay > 0 && <p className="text-xs text-muted-foreground">+ HP: {cs}{week.holidayPay.toLocaleString()}</p>}
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Overtime & BTA</p>
              <p className="text-lg font-bold tabular-nums text-amber-500">{cs}{((week.otPay || 0) + (week.btaPay || 0)).toLocaleString()}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Penalties & Premiums</p>
              <p className="text-lg font-bold tabular-nums text-red-500">{cs}{((week.mealPenalty || 0) + (week.nightPrem || 0)).toLocaleString()}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Allowances</p>
              <p className="text-lg font-bold tabular-nums text-teal-500">{cs}{(week.allowances || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* 4-Stage Payment Pipeline */}
          <div className="flex gap-2">
            {['Submitted', 'Approved', 'Processed', 'Paid'].map((stage, i) => {
              const pipeline = week.pipeline || {};
              const done = pipeline[stage.toLowerCase()];
              return (
                <div key={stage} className="flex-1 flex items-center gap-2">
                  <div className={cn("size-6 rounded-full flex items-center justify-center text-xs",
                    done ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"
                  )}>
                    {done ? <CheckCircle2 className="size-3.5" /> : i + 1}
                  </div>
                  <div>
                    <p className="text-[10px] font-medium">{stage}</p>
                    {done && <p className="text-[9px] text-muted-foreground">{done.date}</p>}
                  </div>
                  {i < 3 && <div className={cn("flex-1 h-px", done ? "bg-emerald-500/30" : "bg-border border-dashed")} />}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {week.status === 'paid' && (
              <Button size="sm" variant="outline"><Download className="size-3.5 mr-1" /> Payslip</Button>
            )}
            {week.status !== 'paid' && (
              <Button size="sm" variant="outline" className="text-red-500 border-red-500/30">
                <AlertTriangle className="size-3.5 mr-1" /> Raise Dispute
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ── Main Crew Pay History Page ────────────────────────────────────────
export default function CrewPayHistory() {
  const { crewId, productionId } = useParams();
  const user = useAuthStore((s) => s.user);
  const [expandedWeek, setExpandedWeek] = useState(null);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["crew-pay-history", crewId, productionId],
    queryFn: async () => {
      const { data } = await api.get(`/portal/${crewId || user?._id}/production/${productionId}`);
      return data.data || data;
    },
    enabled: !!(crewId || user?._id) && !!productionId,
  });

  const crew = historyData?.crew || {};
  const weeks = historyData?.weeks || [];
  const phases = historyData?.phases || [];
  const stats = historyData?.stats || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      {/* Hero Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {crew.initials || "??"}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{crew.name || "Crew Member"}</h1>
              <p className="text-sm text-muted-foreground">{crew.role} — {crew.department}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{crew.agreement || "Agreement"}</Badge>
                <Badge variant="outline">{crew.employmentType}</Badge>
                {crew.dailyRate && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">£{crew.dailyRate}/day</Badge>}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div><p className="text-2xl font-bold">{stats.weeksWorked || 0}</p><p className="text-xs text-muted-foreground">Weeks</p></div>
              <div><p className="text-2xl font-bold">{stats.shootDays || 0}</p><p className="text-xs text-muted-foreground">Shoot Days</p></div>
              <div><p className="text-2xl font-bold text-emerald-500">£{(stats.totalPaid || 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Paid</p></div>
              <div><p className="text-2xl font-bold text-amber-500">£{(stats.outstanding || 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Outstanding</p></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Timeline */}
      {phases.length > 0 && <PhaseTimeline phases={phases} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Week List (Main Content — 2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Weekly Timecards</h2>
          {weeks.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-12">No timecards found for this production.</p>
          )}
          {weeks.map((week) => (
            <WeekCard
              key={week.weekNumber}
              week={week}
              expanded={expandedWeek === week.weekNumber}
              onExpand={() => setExpandedWeek(expandedWeek === week.weekNumber ? null : week.weekNumber)}
            />
          ))}
        </div>

        {/* Right Aside */}
        <div className="space-y-4">
          {/* Payment Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-500">Paid to bank</span>
                <span className="font-bold tabular-nums">£{(stats.totalPaid || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-teal-500">Approved pending</span>
                <span className="font-bold tabular-nums">£{(stats.approvedPending || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-500">Submitted</span>
                <span className="font-bold tabular-nums">£{(stats.submitted || 0).toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-bold">
                <span>Total</span>
                <span className="tabular-nums">£{((stats.totalPaid || 0) + (stats.approvedPending || 0) + (stats.submitted || 0)).toLocaleString()}</span>
              </div>
              {/* Progress bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.paidPct || 0}%` }} />
              </div>
              <p className="text-xs text-muted-foreground text-center">{stats.paidPct || 0}% paid</p>
            </CardContent>
          </Card>

          {/* Production Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Production</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Production</span><span className="font-medium">{historyData?.production?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Company</span><span className="font-medium">{historyData?.production?.company}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Bureau</span><span className="font-medium">{historyData?.production?.bureau}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pay Schedule</span><span className="font-medium">{historyData?.production?.paySchedule || "Weekly"}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
