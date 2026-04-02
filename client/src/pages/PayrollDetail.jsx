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
  Legend,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import PayrollSummaryCard from "@/components/payroll/PayrollSummaryCard";
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
  calculated: { label: "Calculated", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  paid: { label: "Paid", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" },
};

const DONUT_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
  "#f97316", "#06b6d4",
];

function ExpandableRow({ item, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        className="border-b transition-colors hover:bg-muted/30 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <TableCell className="px-2">
          <Button variant="ghost" size="icon-xs">
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </Button>
        </TableCell>
        <TableCell className="font-medium">{item.person?.name || "-"}</TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {item.department || "-"}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatCurrency(item.basePay || 0)}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatCurrency(item.overtimePay || 0)}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatCurrency(item.penalties || 0)}
        </TableCell>
        <TableCell className="text-right tabular-nums font-semibold">
          {formatCurrency(item.grossPay || 0)}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatCurrency(item.holidayPay || 0)}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatCurrency(item.employerNI || 0)}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatCurrency(item.pension || 0)}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatCurrency(item.totalFringes || 0)}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatCurrency(item.employeeNI || 0)}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {formatCurrency(item.tax || 0)}
        </TableCell>
        <TableCell className="text-right tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(item.netPay || 0)}
        </TableCell>
        <TableCell className="text-right tabular-nums font-semibold">
          {formatCurrency(item.totalCost || 0)}
        </TableCell>
      </motion.tr>

      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <TableCell colSpan={15} className="bg-muted/20 p-0">
              <div className="grid gap-4 p-4 md:grid-cols-2">
                <GrossToNetBreakdown
                  basePay={item.basePay || 0}
                  overtimePay={item.overtimePay || 0}
                  penalties={item.penalties || 0}
                  allowances={item.allowances || 0}
                  grossPay={item.grossPay || 0}
                  tax={item.tax || 0}
                  employeeNI={item.employeeNI || 0}
                  pension={item.pension || 0}
                  netPay={item.netPay || 0}
                />
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="text-sm">Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Role</dt>
                        <dd className="font-medium">{item.role || "-"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Days Worked</dt>
                        <dd className="font-medium tabular-nums">{item.daysWorked ?? "-"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Total Hours</dt>
                        <dd className="font-medium tabular-nums">{item.totalHours?.toFixed(1) || "-"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">OT Hours</dt>
                        <dd className="font-medium tabular-nums">{item.otHours?.toFixed(1) || "-"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Holiday Pay</dt>
                        <dd className="font-medium tabular-nums">{formatCurrency(item.holidayPay || 0)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Employer NI</dt>
                        <dd className="font-medium tabular-nums">{formatCurrency(item.employerNI || 0)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Employer Pension</dt>
                        <dd className="font-medium tabular-nums">{formatCurrency(item.employerPension || 0)}</dd>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <dt className="font-medium">Total Cost to Production</dt>
                        <dd className="font-bold tabular-nums">{formatCurrency(item.totalCost || 0)}</dd>
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

  // Department breakdown for donut chart
  const deptBreakdown = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      const dept = item.department || "Other";
      if (!map[dept]) map[dept] = 0;
      map[dept] += item.totalCost || item.grossPay || 0;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  // Footer totals
  const totals = useMemo(() => {
    const t = {
      basePay: 0, overtimePay: 0, penalties: 0, grossPay: 0,
      holidayPay: 0, employerNI: 0, pension: 0, totalFringes: 0,
      employeeNI: 0, tax: 0, netPay: 0, totalCost: 0,
    };
    items.forEach((item) => {
      Object.keys(t).forEach((k) => {
        t[k] += item[k] || 0;
      });
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
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
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
      className="space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate("/payroll")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {run.runNumber || "Payroll Run"}
              </h1>
              <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusCfg.color)}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {run.productionId?.name || run.production?.title || run.production?.name}
              {run.weekEnding && ` - Week ending ${format(parseISO(run.weekEnding), "dd MMM yyyy")}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(run.status === "draft" || run.status === "calculated") && (
            <Button variant="outline" onClick={handleCalculate} disabled={calculate.isPending}>
              {calculate.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="mr-1.5 h-4 w-4" />
              )}
              Calculate
            </Button>
          )}
          {run.status === "calculated" && (
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove} disabled={approve.isPending}>
              {approve.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
              )}
              Approve
            </Button>
          )}
          <Button variant="outline" onClick={handleExport} disabled={exportCSV.isPending}>
            {exportCSV.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-4 w-4" />
            )}
            Export CSV
          </Button>
          {run.status === "approved" && (
            <Button onClick={handleMarkPaid} disabled={markPaid.isPending}>
              {markPaid.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-1.5 h-4 w-4" />
              )}
              Mark Paid
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <PayrollSummaryCard
          label="Gross Pay"
          value={formatCurrency(summary.totalGross || totals.grossPay)}
          icon={Banknote}
          variant="primary"
          delay={0}
        />
        <PayrollSummaryCard
          label="Total Fringes"
          value={formatCurrency(summary.totalFringes || totals.totalFringes)}
          icon={Receipt}
          variant="warning"
          delay={0.05}
        />
        <PayrollSummaryCard
          label="Deductions"
          value={formatCurrency((totals.tax + totals.employeeNI + totals.pension) || 0)}
          icon={Receipt}
          variant="danger"
          delay={0.1}
        />
        <PayrollSummaryCard
          label="Net Pay"
          value={formatCurrency(summary.totalNet || totals.netPay)}
          icon={Landmark}
          variant="success"
          delay={0.15}
        />
        <PayrollSummaryCard
          label="Headcount"
          value={summary.headcount || items.length}
          icon={Users}
          delay={0.2}
        />
      </div>

      {/* Department donut + Table */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Payroll items table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Person</TableHead>
                    <TableHead>Dept</TableHead>
                    <TableHead className="text-right">Base Pay</TableHead>
                    <TableHead className="text-right">OT Pay</TableHead>
                    <TableHead className="text-right">Penalties</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Holiday</TableHead>
                    <TableHead className="text-right">Emp'r NI</TableHead>
                    <TableHead className="text-right">Pension</TableHead>
                    <TableHead className="text-right">Fringes</TableHead>
                    <TableHead className="text-right">Emp NI</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Net Pay</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <ExpandableRow key={item._id || i} item={item} index={i} />
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted/40 font-semibold">
                    <TableCell />
                    <TableCell>Totals</TableCell>
                    <TableCell />
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.basePay)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.overtimePay)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.penalties)}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{formatCurrency(totals.grossPay)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.holidayPay)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.employerNI)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.pension)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.totalFringes)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.employeeNI)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(totals.tax)}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.netPay)}</TableCell>
                    <TableCell className="text-right tabular-nums font-bold">{formatCurrency(totals.totalCost)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Department breakdown donut */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {deptBreakdown.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={deptBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {deptBreakdown.map((_, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--popover))",
                        color: "hsl(var(--popover-foreground))",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-2 w-full space-y-1.5">
                  {deptBreakdown.map((dept, i) => (
                    <div
                      key={dept.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              DONUT_COLORS[i % DONUT_COLORS.length],
                          }}
                        />
                        <span className="text-muted-foreground">{dept.name}</span>
                      </div>
                      <span className="font-medium tabular-nums">
                        {formatCurrency(dept.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
