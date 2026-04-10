import { useState, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, Search,
  Download, Users, BarChart3, Info,
} from "lucide-react";
import api from "@/lib/axios";

function IntelCard({ title, value, subtitle, color = "text-foreground", icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
            <p className={cn("text-xl font-bold tabular-nums mt-1", color)}>{value}</p>
            {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {Icon && <Icon className="size-4 text-muted-foreground" />}
        </div>
      </CardContent>
    </Card>
  );
}

export default function HotCost() {
  const { productionId } = useParams();
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  // Fetch productions for selector if no productionId
  const { data: productions } = useQuery({
    queryKey: ["productions"],
    queryFn: async () => { const { data } = await api.get("/productions"); return data.data || []; },
  });

  const activeProductionId = productionId || productions?.[0]?._id;

  // Fetch hot cost data
  const { data: hotCostData, isLoading } = useQuery({
    queryKey: ["hot-cost", activeProductionId],
    queryFn: async () => {
      const { data } = await api.get(`/payroll/production/${activeProductionId}/hot-cost`);
      return data.data || data;
    },
    enabled: !!activeProductionId,
  });

  const crew = hotCostData?.crew || [];
  const currency = hotCostData?.currency || "£";

  // Filter
  const filtered = useMemo(() => {
    let result = crew;
    if (selectedDept !== "all") result = result.filter(c => c.department === selectedDept);
    if (search) result = result.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [crew, selectedDept, search]);

  // Departments
  const departments = useMemo(() => {
    const depts = {};
    crew.forEach(c => { depts[c.department || "Unknown"] = (depts[c.department || "Unknown"] || 0) + 1; });
    return Object.entries(depts).sort(([a], [b]) => a.localeCompare(b));
  }, [crew]);

  // Totals
  const totals = useMemo(() => ({
    estimated: filtered.reduce((s, c) => s + (c.estTotal || 0), 0),
    budgeted: filtered.reduce((s, c) => s + (c.budgeted || 0), 0),
    variance: filtered.reduce((s, c) => s + ((c.estTotal || 0) - (c.budgeted || 0)), 0),
    headcount: filtered.length,
    overBudget: filtered.filter(c => (c.estTotal || 0) > (c.budgeted || 0)).length,
  }), [filtered]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hot Cost Report</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
              ESTIMATE — subject to payroll bureau calculation
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!productionId && productions?.length > 0 && (
            <Select value={activeProductionId} onValueChange={() => {}}>
              <SelectTrigger className="w-48 h-8 text-sm"><SelectValue placeholder="Production" /></SelectTrigger>
              <SelectContent>
                {productions.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm"><Download className="size-3.5 mr-1.5" /> Export CSV</Button>
        </div>
      </div>

      {/* Intel Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <IntelCard title="Est. Total Cost" value={`${currency}${totals.estimated.toLocaleString()}`} icon={DollarSign} color="text-foreground" />
        <IntelCard title="Budgeted" value={`${currency}${totals.budgeted.toLocaleString()}`} icon={BarChart3} color="text-muted-foreground" />
        <IntelCard
          title="Variance"
          value={`${totals.variance >= 0 ? '+' : ''}${currency}${totals.variance.toLocaleString()}`}
          icon={totals.variance > 0 ? TrendingUp : TrendingDown}
          color={totals.variance > 0 ? "text-red-500" : "text-emerald-500"}
          subtitle={totals.variance > 0 ? "Over budget" : "Under budget"}
        />
        <IntelCard title="Headcount" value={totals.headcount} icon={Users} />
        <IntelCard
          title="Over Budget"
          value={totals.overBudget}
          icon={AlertTriangle}
          color={totals.overBudget > 0 ? "text-red-500" : "text-emerald-500"}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedDept("all")}
          className={cn("px-3 py-1.5 rounded-full text-xs font-medium", selectedDept === "all" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted")}
        >All ({crew.length})</button>
        {departments.map(([name, count]) => (
          <button
            key={name}
            onClick={() => setSelectedDept(name)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap", selectedDept === name ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted")}
          >{name} ({count})</button>
        ))}
        <div className="ml-auto relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input placeholder="Search crew..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 w-52 text-sm" />
        </div>
      </div>

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Crew</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Dept</th>
                  <th className="text-right px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Daily Rate</th>
                  <th className="text-right px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Days</th>
                  <th className="text-right px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Basic</th>
                  <th className="text-right px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Est. OT</th>
                  <th className="text-right px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Est. Fringes</th>
                  <th className="text-right px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground font-bold">Est. Total</th>
                  <th className="text-right px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Budget</th>
                  <th className="text-right px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Variance</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={10} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-12 text-muted-foreground">No crew data found</td></tr>
                ) : (
                  filtered.map((c, i) => {
                    const variance = (c.estTotal || 0) - (c.budgeted || 0);
                    const isOver = variance > 0;
                    return (
                      <tr key={c.id || i} className={cn("border-t hover:bg-muted/10", isOver && "bg-red-500/5")}>
                        <td className="px-4 py-2.5">
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.role}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">{c.department}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{currency}{(c.dailyRate || 0).toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{c.daysWorked || 0}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{currency}{(c.basic || 0).toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-amber-500">{c.estOT > 0 ? `${currency}${c.estOT.toLocaleString()}` : "—"}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{currency}{(c.estFringes || 0).toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-bold">{currency}{(c.estTotal || 0).toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{c.budgeted ? `${currency}${c.budgeted.toLocaleString()}` : "—"}</td>
                        <td className={cn("px-3 py-2.5 text-right tabular-nums font-medium", isOver ? "text-red-500" : "text-emerald-500")}>
                          {variance !== 0 ? `${isOver ? '+' : ''}${currency}${variance.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
                {/* Totals row */}
                {filtered.length > 0 && (
                  <tr className="border-t-2 font-bold bg-muted/20">
                    <td className="px-4 py-3" colSpan={4}>TOTAL ({filtered.length} crew)</td>
                    <td className="px-3 py-3 text-right tabular-nums">{currency}{filtered.reduce((s, c) => s + (c.basic || 0), 0).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-amber-500">{currency}{filtered.reduce((s, c) => s + (c.estOT || 0), 0).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{currency}{filtered.reduce((s, c) => s + (c.estFringes || 0), 0).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{currency}{totals.estimated.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{currency}{totals.budgeted.toLocaleString()}</td>
                    <td className={cn("px-3 py-3 text-right tabular-nums", totals.variance > 0 ? "text-red-500" : "text-emerald-500")}>
                      {totals.variance >= 0 ? '+' : ''}{currency}{totals.variance.toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="size-4 shrink-0 mt-0.5" />
        <p>
          This Hot Cost Report is an <strong>estimate only</strong> based on current timecard data and deal memo rates.
          Final payroll figures are calculated by the payroll bureau (Sargent-Disc / Cast & Crew / EP) and may differ
          due to rounding, tax calculations, and bureau-specific processing rules.
        </p>
      </div>
    </motion.div>
  );
}
