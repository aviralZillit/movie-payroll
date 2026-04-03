import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Download,
  CreditCard,
  Loader2,
  ChevronDown,
  ChevronRight,
  Banknote,
  Receipt,
  Users,
  Landmark,
  FileText,
  DollarSign,
  TrendingDown,
  Equal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/lib/utils";
import GrossToNetBreakdown from "@/components/payroll/GrossToNetBreakdown";
import {
  usePayrollRun,
  useCalculatePayroll,
  useApprovePayroll,
  useMarkPayrollPaid,
  useExportPayrollCSV,
} from "@/hooks/usePayroll";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  calculating: { label: "Calculating...", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  calculated: { label: "Calculated", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  paid: { label: "Paid", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" },
};

const DONUT_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
  "#f97316", "#06b6d4",
];

/* ── Compact expandable row ──────────────────────────────── */
function ExpandableRow({ item, index, fmt }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        className="border-b transition-colors hover:bg-muted/30 cursor-pointer text-xs"
        onClick={() => setExpanded((v) => !v)}
      >
        <TableCell className="px-1.5 py-1.5">
          <Button variant="ghost" size="icon-xs">
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        </TableCell>
        <TableCell className="font-medium py-1.5">{item.person?.name || item.personName || "-"}</TableCell>
        <TableCell className="text-muted-foreground py-1.5">{item.department || item.departmentName || "-"}</TableCell>
        <TableCell className="text-right tabular-nums py-1.5">{fmt(item.basePay)}</TableCell>
        <TableCell className="text-right tabular-nums py-1.5">{fmt(item.overtimePay || item.overtime1x5Pay)}</TableCell>
        <TableCell className="text-right tabular-nums font-semibold py-1.5">{fmt(item.grossPay)}</TableCell>
        <TableCell className="text-right tabular-nums py-1.5">{fmt(item.totalFringes)}</TableCell>
        <TableCell className="text-right tabular-nums py-1.5">{fmt(item.tax)}</TableCell>
        <TableCell className="text-right tabular-nums font-bold text-emerald-600 dark:text-emerald-400 py-1.5">
          {fmt(item.netPay)}
        </TableCell>
      </motion.tr>

      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <TableCell colSpan={9} className="bg-muted/20 p-0">
              <div className="grid gap-3 p-3 md:grid-cols-2">
                <GrossToNetBreakdown
                  basePay={item.basePay || 0}
                  overtimePay={item.overtimePay || item.overtime1x5Pay || 0}
                  penalties={item.penalties || item.mealPenaltyPay || 0}
                  allowances={item.allowances || 0}
                  grossPay={item.grossPay || 0}
                  tax={item.tax || 0}
                  employeeNI={item.employeeNI || 0}
                  pension={item.pension || 0}
                  netPay={item.netPay || 0}
                />
                <Card>
                  <CardHeader className="border-b py-2 px-3">
                    <CardTitle className="text-xs">Full Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 px-3 pb-3">
                    <dl className="space-y-1 text-xs">
                      {[
                        ["Role", item.role || item.designationName || "-"],
                        ["Days Worked", item.daysWorked ?? "-"],
                        ["Total Hours", item.totalHours?.toFixed(1) || "-"],
                        ["OT Hours", item.otHours?.toFixed(1) || "-"],
                        ["Penalties", fmt(item.penalties || item.mealPenaltyPay)],
                        ["Holiday Pay", fmt(item.holidayPay)],
                        ["Emp'r NI", fmt(item.employerNI || item.employerNi)],
                        ["Pension", fmt(item.pension || item.employerPension)],
                        ["Employee NI", fmt(item.employeeNI || item.employeeNi)],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between">
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="font-medium tabular-nums">{val}</dd>
                        </div>
                      ))}
                      <div className="flex justify-between border-t pt-1.5 mt-1">
                        <dt className="font-medium">Total Cost</dt>
                        <dd className="font-bold tabular-nums">{fmt(item.totalCost)}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </TableCell>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function PayrollDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: run, isLoading, isError } = usePayrollRun(id);
  const calculate = useCalculatePayroll(id);
  const approve = useApprovePayroll(id);
  const markPaid = useMarkPayrollPaid(id);
  const exportCSV = useExportPayrollCSV(id);

  const items = run?.items || [];
  const summary = run?.summary || {};
  const statusCfg = STATUS_CONFIG[run?.status] || STATUS_CONFIG.draft;
  const country = run?.productionId?.country || "UK";
  const fmt = (amount) => formatCurrency(amount || 0, country);

  const deptBreakdown = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      const dept = item.department || item.departmentName || "Other";
      if (!map[dept]) map[dept] = 0;
      map[dept] += item.totalCost || item.grossPay || 0;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  const totals = useMemo(() => {
    const t = {
      basePay: 0, overtimePay: 0, grossPay: 0,
      totalFringes: 0, tax: 0, netPay: 0, totalCost: 0,
      holidayPay: 0, employerNI: 0, pension: 0, employeeNI: 0, penalties: 0,
    };
    items.forEach((item) => {
      t.basePay += item.basePay || 0;
      t.overtimePay += item.overtimePay || item.overtime1x5Pay || 0;
      t.grossPay += item.grossPay || 0;
      t.totalFringes += item.totalFringes || 0;
      t.tax += item.tax || 0;
      t.netPay += item.netPay || 0;
      t.totalCost += item.totalCost || 0;
      t.holidayPay += item.holidayPay || 0;
      t.employerNI += item.employerNI || item.employerNi || 0;
      t.pension += item.pension || item.employerPension || 0;
      t.employeeNI += item.employeeNI || item.employeeNi || 0;
      t.penalties += item.penalties || item.mealPenaltyPay || 0;
    });
    return t;
  }, [items]);

  const handleCalculate = () => {
    calculate.mutate(undefined, {
      onSuccess: () => toast.success("Payroll calculated"),
      onError: () => toast.error("Calculation failed"),
    });
  };
  const handleApprove = () => {
    approve.mutate(undefined, {
      onSuccess: () => toast.success("Payroll approved"),
      onError: () => toast.error("Failed to approve"),
    });
  };
  const handleMarkPaid = () => {
    markPaid.mutate(undefined, {
      onSuccess: () => toast.success("Payroll marked as paid"),
      onError: () => toast.error("Failed to mark as paid"),
    });
  };
  const handleExport = () => {
    exportCSV.mutate(undefined, {
      onSuccess: () => toast.success("CSV exported"),
      onError: () => toast.error("Export failed"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3 grid-cols-5"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (isError || !run) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-medium">Payroll run not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/payroll")}>
          Back to Payroll
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 p-4"
    >
      {/* ── Header (compact single line) ───────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate("/payroll")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold tracking-tight">{run.runNumber || "Payroll Run"}</h1>
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", statusCfg.color)}>
            {statusCfg.label}
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            {run.productionId?.name}{run.weekEnding && ` \u2022 Week ending ${format(parseISO(run.weekEnding), "dd MMM yyyy")}`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {(run.status === "draft" || run.status === "calculated") && (
            <Button variant="outline" size="sm" onClick={handleCalculate} disabled={calculate.isPending}>
              {calculate.isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Calculator className="mr-1 h-3.5 w-3.5" />}
              Calculate
            </Button>
          )}
          {run.status === "calculated" && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove} disabled={approve.isPending}>
              {approve.isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1 h-3.5 w-3.5" />}
              Approve
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exportCSV.isPending}>
            {exportCSV.isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1 h-3.5 w-3.5" />}
            CSV
          </Button>
          {run.status === "approved" && (
            <Button size="sm" onClick={handleMarkPaid} disabled={markPaid.isPending}>
              {markPaid.isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <CreditCard className="mr-1 h-3.5 w-3.5" />}
              Mark Paid
            </Button>
          )}
        </div>
      </div>

      {/* ── Compact stat bar ───────────────────────────────── */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Gross Pay", value: fmt(summary.totalGross || totals.grossPay), icon: Banknote, color: "text-primary" },
          { label: "Fringes", value: fmt(summary.totalFringes || totals.totalFringes), icon: Receipt, color: "text-amber-500" },
          { label: "Deductions", value: fmt((totals.tax + totals.employeeNI + totals.pension) || 0), icon: TrendingDown, color: "text-red-500" },
          { label: "Net Pay", value: fmt(summary.totalNet || totals.netPay), icon: Landmark, color: "text-emerald-500" },
          { label: "Headcount", value: summary.headcount || items.length, icon: Users, color: "text-muted-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="py-2.5 px-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="text-lg font-bold tabular-nums mt-0.5">{value}</p>
              </div>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
          </Card>
        ))}
      </div>

      {/* ── Main grid: Table + Right sidebar ───────────────── */}
      <div className="grid gap-3 xl:grid-cols-[1fr_280px]">
        {/* Payroll items table (compact) */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-[10px]">
                    <TableHead className="w-6" />
                    <TableHead>Person</TableHead>
                    <TableHead>Dept</TableHead>
                    <TableHead className="text-right">Base Pay</TableHead>
                    <TableHead className="text-right">OT Pay</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Fringes</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Net Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <ExpandableRow key={item._id || i} item={item} index={i} fmt={fmt} />
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted/40 font-semibold text-xs">
                    <TableCell />
                    <TableCell>Totals</TableCell>
                    <TableCell />
                    <TableCell className="text-right tabular-nums">{fmt(totals.basePay)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(totals.overtimePay)}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{fmt(totals.grossPay)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(totals.totalFringes)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(totals.tax)}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold text-emerald-600 dark:text-emerald-400">{fmt(totals.netPay)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right sidebar: Donut + Gross-to-Net */}
        <div className="space-y-3">
          {/* Department donut */}
          <Card>
            <CardHeader className="border-b py-2 px-3">
              <CardTitle className="text-xs">Department Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 px-3 pb-3">
              {deptBreakdown.length > 0 ? (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={deptBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {deptBreakdown.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => fmt(value)}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--popover))",
                          color: "hsl(var(--popover-foreground))",
                          fontSize: "11px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-1 w-full space-y-1">
                    {deptBreakdown.map((dept, i) => (
                      <div key={dept.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                          <span className="text-muted-foreground">{dept.name}</span>
                        </div>
                        <span className="font-medium tabular-nums">{fmt(dept.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Gross-to-Net compact summary */}
          <Card>
            <CardHeader className="border-b py-2 px-3">
              <CardTitle className="text-xs">Gross to Net</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 px-3 pb-3">
              <div className="space-y-1.5 text-xs">
                {[
                  { icon: DollarSign, label: "Base Pay", value: fmt(totals.basePay), color: "" },
                  { icon: DollarSign, label: "OT Pay", value: fmt(totals.overtimePay), color: "" },
                  { icon: Equal, label: "Gross Pay", value: fmt(totals.grossPay), color: "font-bold" },
                  { icon: Receipt, label: "Fringes", value: fmt(totals.totalFringes), color: "text-amber-500" },
                  { icon: TrendingDown, label: "Tax (PAYE)", value: `-${fmt(totals.tax)}`, color: "text-red-500" },
                  { icon: TrendingDown, label: "Employee NI", value: `-${fmt(totals.employeeNI)}`, color: "text-red-500" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon className="h-3 w-3" />
                      <span>{label}</span>
                    </div>
                    <span className={cn("font-medium tabular-nums", color)}>{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t pt-1.5 mt-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Landmark className="h-3 w-3 text-emerald-500" />
                    <span>Net Pay</span>
                  </div>
                  <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{fmt(totals.netPay)}</span>
                </div>
              </div>

              {/* Mini bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                  <span>Gross</span>
                  <span>Net</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: totals.grossPay > 0 ? `${(totals.netPay / totals.grossPay * 100).toFixed(0)}%` : "0%" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-medium tabular-nums mt-0.5">
                  <span>{fmt(totals.grossPay)}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{fmt(totals.netPay)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
