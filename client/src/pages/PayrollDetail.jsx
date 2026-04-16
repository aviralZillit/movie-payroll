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

/* ── Employment type badge colors ───────────────────────── */
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

/* ── Formula tooltip badge ──────────────────────────────── */
function FormulaTag({ breakdown, field, children }) {
  const bd = breakdown?.[field];
  if (!bd?.formula) return children;
  return (
    <span className="group relative cursor-help">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-[100] hidden group-hover:flex flex-col items-center">
        <span className="whitespace-nowrap rounded-md bg-zinc-900 dark:bg-zinc-100 px-2.5 py-1.5 text-[10px] font-mono text-white dark:text-zinc-900 shadow-lg ring-1 ring-zinc-700/20">
          {bd.formula}
          {bd.cap && <span className="block text-amber-300 dark:text-amber-600 mt-0.5">{bd.cap}</span>}
          {bd.hpAdjustment && <span className="block text-blue-300 dark:text-blue-600 mt-0.5">{bd.hpAdjustment}</span>}
        </span>
        <span className="h-0 w-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-zinc-900 dark:border-t-zinc-100" />
      </span>
    </span>
  );
}

/* ── Breakdown line item with formula ──────────────────── */
function BreakdownLine({ label, value, formula, indent = false, bold = false, borderTop = false }) {
  return (
    <div className={cn(
      indent && "pl-3",
      borderTop && "border-t pt-1.5 mt-1",
    )}>
      <div className="flex justify-between items-start gap-2">
        <dt className={cn("text-muted-foreground", bold && "font-medium text-foreground")}>{label}</dt>
        <dd className={cn("font-medium tabular-nums shrink-0 text-right", bold && "font-bold")}>{value}</dd>
      </div>
      {formula && (
        <dd className="text-[9px] font-mono text-muted-foreground/70 leading-snug mt-0.5" title={formula}>
          {formula}
        </dd>
      )}
    </div>
  );
}

/* ── Compact expandable row ──────────────────────────────── */
function ExpandableRow({ item, index, fmt }) {
  const [expanded, setExpanded] = useState(false);
  const bd = item.breakdown || {};

  // Compute combined OT for the collapsed row
  const overtimePay = (item.overtime1x5Pay || 0) + (item.overtime2xPay || 0);

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
        <TableCell className="font-medium py-1.5">{item.personName || "-"}</TableCell>
        <TableCell className="py-1.5">
          <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold border", EMP_BADGE[item.employmentType] || EMP_BADGE.paye)}>
            {EMP_LABEL[item.employmentType] || item.employmentType?.toUpperCase() || "PAYE"}
          </span>
        </TableCell>
        <TableCell className="text-muted-foreground py-1.5">{item.departmentName || "-"}</TableCell>
        <TableCell className="text-right tabular-nums py-1.5">
          <FormulaTag breakdown={bd} field="basePay">{fmt(item.basePay)}</FormulaTag>
        </TableCell>
        <TableCell className="text-right tabular-nums py-1.5">
          <FormulaTag breakdown={bd} field="overtime1x5Pay">{fmt(overtimePay)}</FormulaTag>
        </TableCell>
        <TableCell className="text-right tabular-nums font-semibold py-1.5">
          <FormulaTag breakdown={bd} field="grossPay">{fmt(item.grossPay)}</FormulaTag>
        </TableCell>
        <TableCell className="text-right tabular-nums py-1.5">
          <FormulaTag breakdown={bd} field="totalFringes">{fmt(item.totalFringes)}</FormulaTag>
        </TableCell>
        <TableCell className="text-right tabular-nums py-1.5">{fmt(item.incomeTax || item.tax)}</TableCell>
        <TableCell className="text-right tabular-nums font-bold text-emerald-600 dark:text-emerald-400 py-1.5">
          <FormulaTag breakdown={bd} field="netPay">{fmt(item.netPay)}</FormulaTag>
        </TableCell>
      </motion.tr>

      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <TableCell colSpan={10} className="bg-muted/20 p-0">
              <div className="grid gap-3 p-3 md:grid-cols-[1fr_1fr_minmax(200px,1.2fr)]">
                {/* Column 1: Earnings with formulas */}
                <Card>
                  <CardHeader className="border-b py-2 px-3">
                    <CardTitle className="text-xs flex items-center gap-1.5">
                      <Banknote className="h-3 w-3 text-emerald-500" />
                      Earnings Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 px-3 pb-3">
                    <dl className="space-y-1.5 text-xs">
                      <BreakdownLine label="Role" value={item.designationName || "-"} />
                      <BreakdownLine label="Days Worked" value={item.daysWorked ?? "-"} />
                      <BreakdownLine label="Total Hours" value={item.totalHours?.toFixed(1) || "-"} />
                      <BreakdownLine
                        label="Base Pay"
                        value={fmt(item.basePay)}
                        formula={bd.basePay?.formula}
                        bold
                      />
                      {bd.basePay?.hpAdjustment && (
                        <div className="pl-3 text-[9px] font-mono text-blue-500">{bd.basePay.hpAdjustment}</div>
                      )}

                      {/* OT section */}
                      {(item.overtime1x5Pay > 0 || item.overtime2xPay > 0) && (
                        <>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 pt-1">Overtime</div>
                          {item.overtime1x5Pay > 0 && (
                            <BreakdownLine
                              label="OT 1.5×"
                              value={fmt(item.overtime1x5Pay)}
                              formula={bd.overtime1x5Pay?.formula}
                              indent
                            />
                          )}
                          {item.overtime2xPay > 0 && (
                            <BreakdownLine
                              label="OT 2×"
                              value={fmt(item.overtime2xPay)}
                              formula={bd.overtime2xPay?.formula}
                              indent
                            />
                          )}
                          {bd.overtime1x5Pay?.cap && (
                            <div className="pl-3 text-[9px] font-mono text-amber-500">{bd.overtime1x5Pay.cap}</div>
                          )}
                        </>
                      )}
                      {bd.overtimeNote && (
                        <div className="text-[9px] italic text-muted-foreground/60">{bd.overtimeNote}</div>
                      )}

                      {/* Penalties */}
                      {(item.mealPenaltyPay > 0 || item.turnaroundPenaltyPay > 0) && (
                        <>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 pt-1">Penalties</div>
                          {item.mealPenaltyPay > 0 && (
                            <BreakdownLine
                              label="Meal Delay"
                              value={fmt(item.mealPenaltyPay)}
                              formula={bd.mealPenaltyPay?.formula}
                              indent
                            />
                          )}
                          {item.turnaroundPenaltyPay > 0 && (
                            <BreakdownLine
                              label="BTA (Turnaround)"
                              value={fmt(item.turnaroundPenaltyPay)}
                              formula={bd.turnaroundPenaltyPay?.formula}
                              indent
                            />
                          )}
                        </>
                      )}

                      {/* Premiums */}
                      {(item.sixthDayPremium > 0 || item.seventhDayPremium > 0 || item.nightPremium > 0) && (
                        <>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 pt-1">Premiums</div>
                          {item.sixthDayPremium > 0 && (
                            <BreakdownLine label="6th Day" value={fmt(item.sixthDayPremium)} formula={bd.sixthDayPremium?.formula} indent />
                          )}
                          {item.seventhDayPremium > 0 && (
                            <BreakdownLine label="7th Day" value={fmt(item.seventhDayPremium)} formula={bd.seventhDayPremium?.formula} indent />
                          )}
                          {item.nightPremium > 0 && (
                            <BreakdownLine label="Night Premium" value={fmt(item.nightPremium)} formula={bd.nightPremium?.formula} indent />
                          )}
                        </>
                      )}

                      {/* Gross */}
                      <BreakdownLine
                        label="Gross Pay"
                        value={fmt(item.grossPay)}
                        formula={bd.grossPay?.formula}
                        bold
                        borderTop
                      />
                    </dl>
                  </CardContent>
                </Card>

                {/* Column 2: Employer fringes with formulas */}
                <Card>
                  <CardHeader className="border-b py-2 px-3">
                    <CardTitle className="text-xs flex items-center gap-1.5">
                      <Receipt className="h-3 w-3 text-amber-500" />
                      Employer Fringes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 px-3 pb-3">
                    <dl className="space-y-1.5 text-xs">
                      {item.holidayPay > 0 && (
                        <BreakdownLine
                          label={bd.holidayPay?.label || "Holiday Pay"}
                          value={fmt(item.holidayPay)}
                          formula={bd.holidayPay?.formula}
                        />
                      )}
                      {(item.employerNi || item.employerNI) > 0 && (
                        <BreakdownLine
                          label={bd.employerNi?.label || "Employer NI"}
                          value={fmt(item.employerNi || item.employerNI)}
                          formula={bd.employerNi?.formula}
                        />
                      )}
                      {(item.employerPension || 0) > 0 && (
                        <BreakdownLine
                          label={bd.employerPension?.label || "Employer Pension"}
                          value={fmt(item.employerPension)}
                          formula={bd.employerPension?.formula}
                        />
                      )}
                      {(item.apprenticeshipLevy || 0) > 0 && (
                        <BreakdownLine
                          label="Apprenticeship Levy"
                          value={fmt(item.apprenticeshipLevy)}
                          formula={bd.apprenticeshipLevy?.formula}
                          indent
                        />
                      )}
                      {/* US-specific fringe lines */}
                      {bd.workersComp && (
                        <BreakdownLine
                          label={bd.workersComp.label || "Workers' Comp"}
                          value={fmt(bd.workersComp.value)}
                          formula={bd.workersComp.formula}
                          indent
                        />
                      )}
                      {bd.futa && (
                        <BreakdownLine
                          label={bd.futa.label || "FUTA"}
                          value={fmt(bd.futa.value)}
                          formula={bd.futa.formula}
                          indent
                        />
                      )}
                      {bd.hwContribution && bd.hwContribution.value > 0 && (
                        <BreakdownLine
                          label={bd.hwContribution.label || "H&W Per Hour"}
                          value={fmt(bd.hwContribution.value)}
                          formula={bd.hwContribution.formula}
                          indent
                        />
                      )}
                      <BreakdownLine
                        label="Total Fringes"
                        value={fmt(item.totalFringes)}
                        formula={bd.totalFringes?.formula}
                        bold
                        borderTop
                      />

                      {/* Employee Deductions section */}
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 pt-2">Employee Deductions</div>
                      {bd.deductionsNote ? (
                        <div className="text-[9px] italic text-muted-foreground/60">{bd.deductionsNote}</div>
                      ) : (
                        <>
                          {(item.incomeTax || item.tax || 0) > 0 && (
                            <BreakdownLine
                              label={bd.incomeTax?.label || "Income Tax (PAYE)"}
                              value={`-${fmt(item.incomeTax || item.tax)}`}
                              formula={bd.incomeTax?.formula}
                            />
                          )}
                          {(item.employeeNi || item.employeeNI || 0) > 0 && (
                            <BreakdownLine
                              label={bd.employeeNi?.label || "Employee NI"}
                              value={`-${fmt(item.employeeNi || item.employeeNI)}`}
                              formula={bd.employeeNi?.formula}
                            />
                          )}
                          {(item.employeePension || 0) > 0 && (
                            <BreakdownLine
                              label="Employee Pension"
                              value={`-${fmt(item.employeePension)}`}
                              indent
                            />
                          )}
                        </>
                      )}
                    </dl>
                  </CardContent>
                </Card>

                {/* Column 3: Net pay + total cost summary */}
                <Card>
                  <CardHeader className="border-b py-2 px-3">
                    <CardTitle className="text-xs flex items-center gap-1.5">
                      <Landmark className="h-3 w-3 text-emerald-500" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 px-3 pb-3">
                    <dl className="space-y-1.5 text-xs">
                      <BreakdownLine
                        label="Net Pay"
                        value={fmt(item.netPay)}
                        formula={bd.netPay?.formula}
                        bold
                      />
                      <BreakdownLine
                        label="Total Cost"
                        value={fmt(item.totalCost)}
                        formula={bd.totalCost?.formula}
                        bold
                        borderTop
                      />
                    </dl>

                    {/* Visual gross→net bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                        <span>Gross</span>
                        <span>Net</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: item.grossPay > 0 ? `${((item.netPay / item.grossPay) * 100).toFixed(0)}%` : "0%" }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-medium tabular-nums mt-0.5">
                        <span>{fmt(item.grossPay)}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">{fmt(item.netPay)}</span>
                      </div>
                    </div>

                    {/* Stacked cost breakdown mini chart */}
                    <div className="mt-4 space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Cost Composition</p>
                      {[
                        { label: "Base Pay", value: item.basePay || 0, color: "bg-blue-500" },
                        { label: "OT", value: (item.overtime1x5Pay || 0) + (item.overtime2xPay || 0), color: "bg-indigo-500" },
                        { label: "Penalties", value: (item.mealPenaltyPay || 0) + (item.turnaroundPenaltyPay || 0), color: "bg-amber-500" },
                        { label: "Premiums", value: (item.sixthDayPremium || 0) + (item.seventhDayPremium || 0) + (item.nightPremium || 0), color: "bg-purple-500" },
                        { label: "Fringes", value: item.totalFringes || 0, color: "bg-orange-500" },
                      ].filter(c => c.value > 0).map(({ label, value, color }) => {
                        const pct = item.totalCost > 0 ? (value / item.totalCost * 100) : 0;
                        return (
                          <div key={label} className="flex items-center gap-2 text-[10px]">
                            <div className={cn("h-1.5 rounded-full shrink-0", color)} style={{ width: `${Math.max(pct, 2)}%`, maxWidth: "60%" }} />
                            <span className="text-muted-foreground">{label}</span>
                            <span className="ml-auto font-medium tabular-nums">{fmt(value)}</span>
                            <span className="text-muted-foreground/50 w-8 text-right">{pct.toFixed(0)}%</span>
                          </div>
                        );
                      })}
                    </div>
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
      t.overtimePay += (item.overtime1x5Pay || 0) + (item.overtime2xPay || 0);
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
      <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
        {/* Payroll items table (compact) */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-[10px]">
                    <TableHead className="w-6" />
                    <TableHead>Person</TableHead>
                    <TableHead>Type</TableHead>
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
                  { icon: TrendingDown, label: country === 'US' ? "Federal/State Tax" : "Tax (PAYE)", value: `-${fmt(totals.tax)}`, color: "text-red-500" },
                  { icon: TrendingDown, label: country === 'US' ? "Employee FICA" : "Employee NI", value: `-${fmt(totals.employeeNI)}`, color: "text-red-500" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{label}</span>
                    </div>
                    <span className={cn("font-medium tabular-nums shrink-0 whitespace-nowrap", color)}>{value}</span>
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
