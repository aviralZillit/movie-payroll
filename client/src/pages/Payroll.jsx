import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  Banknote,
  Users,
  TrendingUp,
  Receipt,
  Plus,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Landmark,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency } from "@/lib/utils";
import PayrollSummaryCard from "@/components/payroll/PayrollSummaryCard";
import { usePayrollRuns, usePayrollStats, useCreatePayrollRun } from "@/hooks/usePayroll";
import { useProductions } from "@/hooks/useTimecards";
import ExportButton from "@/components/common/ExportButton";
import api from "@/lib/axios";

const STATUS_MAP = {
  draft: { label: "Draft", variant: "secondary" },
  calculated: { label: "Calculated", variant: "outline" },
  approved: { label: "Approved", variant: "default", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  paid: { label: "Paid", variant: "default", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
};

export default function Payroll() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    productionId: "",
    status: "",
    page: 1,
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRun, setNewRun] = useState({ productionId: "", weekStarting: "", weekEnding: "" });

  const { data: statsData } = usePayrollStats();
  const { data, isLoading } = usePayrollRuns(filters);
  const { data: productions } = useProductions();
  const createRun = useCreatePayrollRun();

  const runs = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };
  // Derive country from first run's production (for summary currency display)
  const summaryCountry = runs[0]?.productionId?.country;
  // Compute stats from runs if stats endpoint unavailable
  const stats = statsData || (() => {
    const totals = { totalGross: 0, totalFringes: 0, totalNet: 0, headcount: 0 };
    (runs || []).forEach(r => {
      totals.totalGross += r.totalGross || r.totalGrossPay || 0;
      totals.totalFringes += r.totalFringes || 0;
      totals.totalNet += r.totalNet || r.totalNetPay || 0;
      totals.headcount += r.headcount || 0;
    });
    return totals;
  })();

  const [exportingRunId, setExportingRunId] = useState(null);

  const handleExportRun = async (runId, e) => {
    e.stopPropagation();
    setExportingRunId(runId);
    try {
      const response = await api.get(`/export/payroll/${runId}`, {
        params: { format: "csv" },
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `payroll-run-${runId.slice(-6)}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Payroll run exported");
    } catch {
      toast.error("Failed to export payroll run");
    } finally {
      setExportingRunId(null);
    }
  };

  const handleCreateRun = () => {
    if (!newRun.productionId || !newRun.weekStarting || !newRun.weekEnding) {
      toast.error("Please select a production and both week dates");
      return;
    }
    createRun.mutate(newRun, {
      onSuccess: (data) => {
        toast.success("Payroll run created");
        setCreateDialogOpen(false);
        setNewRun({ productionId: "", weekStarting: "", weekEnding: "" });
        navigate(`/payroll/${data._id}`);
      },
      onError: () => toast.error("Failed to create payroll run"),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
          <p className="text-sm text-muted-foreground">
            Manage payroll runs and payments
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Run
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PayrollSummaryCard
          label="Total Gross"
          value={formatCurrency(stats.totalGross || 0, summaryCountry)}
          icon={Banknote}
          variant="primary"
          trend={stats.grossTrend}
          trendLabel="vs last week"
          delay={0}
        />
        <PayrollSummaryCard
          label="Total Fringes"
          value={formatCurrency(stats.totalFringes || 0, summaryCountry)}
          icon={Receipt}
          variant="warning"
          delay={0.05}
        />
        <PayrollSummaryCard
          label="Total Net"
          value={formatCurrency(stats.totalNet || 0, summaryCountry)}
          icon={Landmark}
          variant="success"
          delay={0.1}
        />
        <PayrollSummaryCard
          label="Headcount"
          value={stats.headcount || 0}
          icon={Users}
          delay={0.15}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={filters.productionId}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, productionId: v, page: 1 }))
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Productions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Productions</SelectItem>
                {(productions || []).map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name || p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, status: v, page: 1 }))
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="calculated">Calculated</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payroll runs table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : runs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Banknote className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No payroll runs found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create a payroll run to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run #</TableHead>
                  <TableHead>Production</TableHead>
                  <TableHead>Week Ending</TableHead>
                  <TableHead className="text-right">Headcount</TableHead>
                  <TableHead className="text-right">Total Gross</TableHead>
                  <TableHead className="text-right">Total Fringes</TableHead>
                  <TableHead className="text-right">Total Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {runs.map((run, i) => {
                    const cfg = STATUS_MAP[run.status] || STATUS_MAP.draft;
                    return (
                      <motion.tr
                        key={run._id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/payroll/${run._id}`)}
                      >
                        <TableCell className="font-mono text-xs">
                          {run.runNumber || `PR-${run._id?.slice(-6)}`}
                        </TableCell>
                        <TableCell className="font-medium">
                          {run.productionId?.name || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {run.weekEnding
                            ? format(parseISO(run.weekEnding), "dd MMM yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {run.headcount ?? "-"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {formatCurrency(run.totalGross || 0, run.productionId?.country)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(run.totalFringes || 0, run.productionId?.country)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">
                          {formatCurrency(run.totalNet || 0, run.productionId?.country)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={cfg.variant}
                            className={cfg.color || ""}
                          >
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => handleExportRun(run._id, e)}
                              disabled={exportingRunId === run._id}
                              title="Export payroll run"
                            >
                              {exportingRunId === run._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/payroll/${run._id}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </CardContent>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Showing {runs.length} of {pagination.total}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={pagination.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-xs tabular-nums">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Run Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Payroll Run</DialogTitle>
            <DialogDescription>
              Select a production and week to create a new payroll run.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Production</label>
              <Select
                value={newRun.productionId}
                onValueChange={(v) =>
                  setNewRun((r) => ({ ...r, productionId: v }))
                }
              >
                <SelectTrigger className="w-full">
                  {newRun.productionId
                    ? <span className="truncate">{(productions || []).find(p => p._id === newRun.productionId)?.name || "Select production"}</span>
                    : <SelectValue placeholder="Select production" />
                  }
                </SelectTrigger>
                <SelectContent>
                  {(productions || []).map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name || p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Week Starting</label>
                <Input
                  type="date"
                  value={newRun.weekStarting}
                  onChange={(e) => {
                    const start = e.target.value;
                    setNewRun((r) => ({
                      ...r,
                      weekStarting: start,
                      // Auto-set weekEnding to 6 days after start (Sunday)
                      weekEnding: start ? new Date(new Date(start).getTime() + 6 * 86400000).toISOString().split('T')[0] : r.weekEnding,
                    }));
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Week Ending</label>
                <Input
                  type="date"
                  value={newRun.weekEnding}
                  onChange={(e) =>
                    setNewRun((r) => ({ ...r, weekEnding: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRun}
              disabled={createRun.isPending}
            >
              {createRun.isPending && (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              )}
              Create Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
