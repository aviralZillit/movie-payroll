import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Search,
  Filter,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { format, parseISO } from "date-fns";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTimecards, useProductions } from "@/hooks/useTimecards";
import ExportButton from "@/components/common/ExportButton";
import ImportDialog from "@/components/common/ImportDialog";

const STATUS_CONFIG = {
  draft: { label: "Draft", variant: "secondary" },
  submitted: { label: "Submitted", variant: "default" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  paid: { label: "Paid", variant: "outline" },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <Badge
      variant={config.variant}
      className={cn(
        status === "approved" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
        status === "paid" && "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
      )}
    >
      {config.label}
    </Badge>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function Timecards() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    productionId: "",
    weekEnding: "",
    status: "",
    page: 1,
  });
  const [search, setSearch] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  const { data: productions } = useProductions();
  const { data, isLoading, isError } = useTimecards(filters);

  const timecards = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  const filtered = useMemo(() => {
    if (!search) return timecards;
    const q = search.toLowerCase();
    return timecards.filter(
      (tc) =>
        tc.person?.name?.toLowerCase().includes(q) ||
        tc.production?.title?.toLowerCase().includes(q) ||
        tc.timecardNumber?.toLowerCase().includes(q)
    );
  }, [timecards, search]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timecards</h1>
          <p className="text-sm text-muted-foreground">
            Manage weekly time entries and approvals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            endpoint="/export/timecards"
            filename="timecards"
            params={{
              productionId: filters.productionId || undefined,
              weekStarting: filters.weekEnding || undefined,
            }}
            label="Export"
          />
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="mr-1.5 h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => navigate("/timecards/new")}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Timecard
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, production, TC#..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

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
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="week"
              value={filters.weekEnding}
              onChange={(e) =>
                setFilters((f) => ({ ...f, weekEnding: e.target.value, page: 1 }))
              }
              className="w-[180px]"
            />

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
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Failed to load timecards. Please try again.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No timecards found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create a new timecard to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TC #</TableHead>
                  <TableHead>Production</TableHead>
                  <TableHead>Person</TableHead>
                  <TableHead>Week</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                  <TableHead className="text-right">Total Hrs</TableHead>
                  <TableHead className="text-right">OT Hrs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filtered.map((tc, i) => {
                    const otHours =
                      (tc.totalOt1x5Hrs || 0) + (tc.totalOt2xHrs || 0);
                    return (
                      <motion.tr
                        key={tc._id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/timecards/${tc._id}`)}
                      >
                        <TableCell className="font-mono text-xs">
                          {tc.timecardNumber || `TC-${tc._id?.slice(-6)}`}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate font-medium">
                          {tc.productionId?.name || "-"}
                        </TableCell>
                        <TableCell>{tc.ownerId?.fullName || `${tc.ownerId?.firstName || ''} ${tc.ownerId?.lastName || ''}`.trim() || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {tc.weekStarting
                            ? format(parseISO(tc.weekStarting), "dd MMM")
                            : "-"}
                          {tc.weekEnding &&
                            ` - ${format(parseISO(tc.weekEnding), "dd MMM yyyy")}`}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {tc.daysWorked ?? "-"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {tc.totalStraightHrs != null ? (tc.totalStraightHrs + (tc.totalOt1x5Hrs || 0) + (tc.totalOt2xHrs || 0)).toFixed(1) : "-"}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right tabular-nums",
                            otHours > 0 && "font-medium text-amber-600 dark:text-amber-400"
                          )}
                        >
                          {otHours > 0 ? otHours.toFixed(1) : "-"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={tc.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/timecards/${tc._id}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Showing {filtered.length} of {pagination.total} timecards
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setFilters((f) => ({ ...f, page: f.page - 1 }))
                }
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
                onClick={() =>
                  setFilters((f) => ({ ...f, page: f.page + 1 }))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      {/* Import Dialog */}
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Timecards"
        description="Upload a CSV or JSON file to bulk-import timecards."
        templateHeaders={[
          "Production ID",
          "Person ID",
          "Week Starting",
          "Week Ending",
          "Mon Hours",
          "Tue Hours",
          "Wed Hours",
          "Thu Hours",
          "Fri Hours",
          "Sat Hours",
          "Sun Hours",
          "Notes",
        ]}
        endpoint="/import/timecards"
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </motion.div>
  );
}
