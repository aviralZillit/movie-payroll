import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";
import {
  DollarSign, Clock, AlertTriangle, Users, Search,
  ChevronRight, Filter, BarChart3, Calendar, TrendingUp,
  CheckCircle2, XCircle, Info,
} from "lucide-react";
import api from "@/lib/axios";

// ── Intel Card ───────────────────────────────────────────────────────
function IntelCard({ title, value, subtitle, icon: Icon, color = "text-foreground", trend }) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
            <p className={cn("text-2xl font-bold tabular-nums mt-1", color)}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <div className={cn("p-2 rounded-lg bg-muted/50")}>
            <Icon className="size-5 text-muted-foreground" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            <TrendingUp className="size-3" />
            <span className={trend > 0 ? "text-emerald-500" : "text-red-500"}>{trend > 0 ? "+" : ""}{trend}% vs last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── View Mode Tabs ───────────────────────────────────────────────────
function ViewTabs({ current, onChange }) {
  const views = [
    { key: "weekly", label: "Weekly Total", icon: BarChart3 },
    { key: "daily", label: "Daily View", icon: Calendar },
    { key: "wtd", label: "Week to Date", icon: TrendingUp },
  ];
  return (
    <div className="flex gap-1 p-1 rounded-lg bg-muted/50">
      {views.map(v => (
        <button
          key={v.key}
          onClick={() => onChange(v.key)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            current === v.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <v.icon className="size-3.5" />
          {v.label}
        </button>
      ))}
    </div>
  );
}

// ── Department Tab ───────────────────────────────────────────────────
function DeptTab({ name, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/50 text-muted-foreground hover:bg-muted"
      )}
    >
      {name} <span className="opacity-60">({count})</span>
    </button>
  );
}

// ── Crew Row ─────────────────────────────────────────────────────────
function CrewRow({ crew, onClick, currencySymbol = "£" }) {
  const cs = currencySymbol;
  return (
    <tr
      className="border-b border-border/30 hover:bg-muted/20 cursor-pointer transition-colors"
      onClick={() => onClick?.(crew)}
    >
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {crew.initials || crew.name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{crew.name}</p>
            <p className="text-xs text-muted-foreground">{crew.role}</p>
          </div>
        </div>
      </td>
      <td className="px-2 py-2.5">
        <Badge variant="outline" className="text-[10px]">{crew.dealType || "weekly"}</Badge>
      </td>
      <td className="px-2 py-2.5">
        <div className="flex gap-0.5">
          {(crew.dayTypes || []).map((dt, i) => (
            <span key={i} className={cn(
              "inline-flex items-center px-1 py-px rounded text-[7px] font-bold tracking-wide border",
              dt === 'SWD' && "bg-blue-950/40 text-blue-400 border-blue-500/20",
              dt === 'CWD' && "bg-teal-950/40 text-teal-400 border-teal-500/20",
              dt === 'TRVL' && "bg-yellow-950/40 text-yellow-400 border-yellow-500/20",
              dt === 'OFF' && "bg-muted text-muted-foreground border-border",
              !['SWD', 'CWD', 'TRVL', 'OFF'].includes(dt) && "bg-purple-950/40 text-purple-400 border-purple-500/20",
            )}>{dt}</span>
          ))}
        </div>
      </td>
      <td className="px-2 py-2.5 text-right tabular-nums text-sm">{crew.daysWorked || 0}</td>
      <td className="px-2 py-2.5 text-right tabular-nums text-sm font-medium">{cs}{(crew.basicPay || 0).toLocaleString()}</td>
      <td className="px-2 py-2.5 text-right tabular-nums text-sm text-amber-500">{crew.otPay > 0 ? `${cs}${crew.otPay.toLocaleString()}` : "—"}</td>
      <td className="px-2 py-2.5 text-right tabular-nums text-sm text-red-500">{crew.btaPay > 0 ? `${cs}${crew.btaPay.toLocaleString()}` : "—"}</td>
      <td className="px-2 py-2.5 text-right tabular-nums text-sm text-yellow-500">{crew.mealPenalty > 0 ? `${cs}${crew.mealPenalty.toLocaleString()}` : "—"}</td>
      <td className="px-2 py-2.5 text-right tabular-nums text-sm font-bold">{cs}{(crew.gross || 0).toLocaleString()}</td>
      <td className="px-2 py-2.5">
        <div className="flex items-center gap-1">
          {crew.hasBTA && <span className="size-2 rounded-full bg-red-500" title="BTA" />}
          {crew.hasMealPenalty && <span className="size-2 rounded-full bg-yellow-500" title="Meal Penalty" />}
          {crew.hasNight && <span className="size-2 rounded-full bg-blue-500" title="Night Shoot" />}
        </div>
      </td>
      <td className="px-2 py-2.5">
        <Badge variant="outline" className={cn("text-[10px]",
          crew.status === 'approved' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
          crew.status === 'submitted' && "bg-blue-500/10 text-blue-500 border-blue-500/30",
          crew.status === 'exception' && "bg-red-500/10 text-red-500 border-red-500/30",
          crew.status === 'draft' && "bg-muted text-muted-foreground",
        )}>{crew.status || "pending"}</Badge>
      </td>
      <td className="px-2 py-2.5">
        <ChevronRight className="size-4 text-muted-foreground" />
      </td>
    </tr>
  );
}

// ── Department Header Row ────────────────────────────────────────────
function DeptHeaderRow({ name, count, total, currencySymbol = "£" }) {
  return (
    <tr className="bg-muted/30 border-b border-border">
      <td colSpan={4} className="px-3 py-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{name}</span>
        <span className="text-xs text-muted-foreground ml-2">({count} crew)</span>
      </td>
      <td colSpan={4} />
      <td className="px-2 py-2 text-right">
        <span className="text-xs font-bold tabular-nums">{currencySymbol}{total?.toLocaleString()}</span>
      </td>
      <td colSpan={3} />
    </tr>
  );
}

// ── Main Payroll Grid Page ───────────────────────────────────────────
export default function PayrollGrid() {
  const { productionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState(searchParams.get("view") || "weekly");
  const [selectedDept, setSelectedDept] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedCrew, setSelectedCrew] = useState(null);

  // Fetch production payroll data
  const { data: payrollData, isLoading } = useQuery({
    queryKey: ["payroll-grid", productionId, view],
    queryFn: async () => {
      const { data } = await api.get(`/payroll/production/${productionId}/grid`, { params: { view } });
      return data.data || data;
    },
    enabled: !!productionId,
  });

  const departments = useMemo(() => {
    if (!payrollData?.crew) return [];
    const depts = {};
    payrollData.crew.forEach(c => {
      const d = c.department || "Unknown";
      depts[d] = (depts[d] || 0) + 1;
    });
    return Object.entries(depts).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
  }, [payrollData]);

  const filteredCrew = useMemo(() => {
    let crew = payrollData?.crew || [];
    if (selectedDept !== "all") crew = crew.filter(c => c.department === selectedDept);
    if (search) crew = crew.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.role?.toLowerCase().includes(search.toLowerCase()));
    return crew;
  }, [payrollData, selectedDept, search]);

  // Group by department
  const groupedCrew = useMemo(() => {
    const groups = {};
    filteredCrew.forEach(c => {
      const d = c.department || "Unknown";
      if (!groups[d]) groups[d] = [];
      groups[d].push(c);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredCrew]);

  const totals = useMemo(() => {
    const crew = payrollData?.crew || [];
    return {
      gross: crew.reduce((s, c) => s + (c.gross || 0), 0),
      ot: crew.reduce((s, c) => s + (c.otPay || 0), 0),
      bta: crew.reduce((s, c) => s + (c.btaPay || 0), 0),
      meals: crew.reduce((s, c) => s + (c.mealPenalty || 0), 0),
      exceptions: crew.filter(c => c.status === 'exception').length,
      headcount: crew.length,
    };
  }, [payrollData]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll Grid</h1>
          <p className="text-sm text-muted-foreground">{payrollData?.production?.name || "Production"} — Week {payrollData?.weekNumber || "—"}</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewTabs current={view} onChange={(v) => { setView(v); setSearchParams({ view: v }); }} />
          <Button variant="outline" size="sm"><Filter className="size-3.5 mr-1.5" /> Export</Button>
        </div>
      </div>

      {/* Intel Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <IntelCard title="Gross Payroll" value={`£${totals.gross.toLocaleString()}`} icon={DollarSign} color="text-foreground" />
        <IntelCard title="OT Total" value={`£${totals.ot.toLocaleString()}`} icon={Clock} color="text-amber-500" />
        <IntelCard title="BTA" value={`£${totals.bta.toLocaleString()}`} icon={AlertTriangle} color="text-red-500" />
        <IntelCard title="Meal Penalties" value={`£${totals.meals.toLocaleString()}`} icon={AlertTriangle} color="text-yellow-500" />
        <IntelCard title="Exceptions" value={totals.exceptions} icon={XCircle} color={totals.exceptions > 0 ? "text-red-500" : "text-emerald-500"} />
        <IntelCard title="Headcount" value={totals.headcount} icon={Users} />
      </div>

      {/* Department Tabs + Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <DeptTab name="All" count={payrollData?.crew?.length || 0} active={selectedDept === "all"} onClick={() => setSelectedDept("all")} />
        {departments.map(d => (
          <DeptTab key={d.name} name={d.name} count={d.count} active={selectedDept === d.name} onClick={() => setSelectedDept(d.name)} />
        ))}
        <div className="ml-auto relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search crew..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 w-60 text-sm"
          />
        </div>
      </div>

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground min-w-[200px]">Crew</th>
                  <th className="text-left px-2 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Deal</th>
                  <th className="text-left px-2 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground min-w-[140px]">Day Types</th>
                  <th className="text-right px-2 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Days</th>
                  <th className="text-right px-2 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Basic</th>
                  <th className="text-right px-2 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">OT</th>
                  <th className="text-right px-2 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">BTA</th>
                  <th className="text-right px-2 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Meal</th>
                  <th className="text-right px-2 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Gross</th>
                  <th className="px-2 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Flags</th>
                  <th className="px-2 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-2 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={12} className="text-center py-12 text-muted-foreground">Loading payroll data...</td></tr>
                ) : groupedCrew.length === 0 ? (
                  <tr><td colSpan={12} className="text-center py-12 text-muted-foreground">No crew found for this week</td></tr>
                ) : (
                  groupedCrew.map(([dept, crew]) => (
                    <>
                      <DeptHeaderRow
                        key={`dept-${dept}`}
                        name={dept}
                        count={crew.length}
                        total={crew.reduce((s, c) => s + (c.gross || 0), 0)}
                      />
                      {crew.map(c => (
                        <CrewRow key={c.id || c._id} crew={c} onClick={setSelectedCrew} />
                      ))}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Panel placeholder */}
      {selectedCrew && (
        <Card className="fixed right-0 top-0 bottom-0 w-[560px] z-50 shadow-2xl overflow-y-auto">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>{selectedCrew.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCrew(null)}>Close</Button>
            </div>
            <p className="text-sm text-muted-foreground">{selectedCrew.role} — {selectedCrew.department}</p>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Basic Pay</p>
                <p className="text-lg font-bold tabular-nums">£{(selectedCrew.basicPay || 0).toLocaleString()}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">OT Pay</p>
                <p className="text-lg font-bold tabular-nums text-amber-500">£{(selectedCrew.otPay || 0).toLocaleString()}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">BTA</p>
                <p className="text-lg font-bold tabular-nums text-red-500">£{(selectedCrew.btaPay || 0).toLocaleString()}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Gross</p>
                <p className="text-lg font-bold tabular-nums">£{(selectedCrew.gross || 0).toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Day-by-day breakdown will be shown here when API is connected.</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
