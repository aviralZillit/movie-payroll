import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Edit,
  Filter,
  Download,
  Info,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Table as TableIcon,
  Moon,
  Sun,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  useAdminRateCards,
  useAdminRateCardsSummary,
  useUpdateRateCard,
} from "@/hooks/useAdminRateCards";
import { useUnions, useBudgetTiers } from "@/hooks/useRateCards";
import ExportButton from "@/components/common/ExportButton";
import ImportDialog from "@/components/common/ImportDialog";
import { Upload } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatGBP(value) {
  if (value == null) return "--";
  return formatCurrency(value);
}

function formatPercent(value) {
  if (value == null) return "--";
  return `${value}%`;
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// ---------------------------------------------------------------------------
// Summary stat card
// ---------------------------------------------------------------------------

function SummaryCard({ label, value, description, icon: Icon }) {
  return (
    <motion.div variants={cardVariants}>
      <Card className="bg-card/80 backdrop-blur-sm transition-shadow hover:shadow-lg">
        <CardContent className="flex items-start justify-between gap-3 pt-5 pb-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Icon className="size-5" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Sort icon helper
// ---------------------------------------------------------------------------

function SortIcon({ column, sortKey, sortDir }) {
  if (column !== sortKey) {
    return <ArrowUpDown className="ml-1 inline size-3.5 opacity-30" />;
  }
  return sortDir === "asc" ? (
    <ArrowUp className="ml-1 inline size-3.5 text-primary" />
  ) : (
    <ArrowDown className="ml-1 inline size-3.5 text-primary" />
  );
}

// ---------------------------------------------------------------------------
// Edit dialog
// ---------------------------------------------------------------------------

function EditRateCardDialog({ rateCard, open, onOpenChange }) {
  const updateMutation = useUpdateRateCard();
  const [form, setForm] = useState({
    weeklyRate: rateCard?.weeklyRate ?? "",
    dailyRate: rateCard?.dailyRate ?? "",
    hourlyRate: rateCard?.hourlyRate ?? "",
    overtimeRate1x5: rateCard?.overtimeRate1x5 ?? "",
    overtimeRate2x: rateCard?.overtimeRate2x ?? "",
    sixthDayRate: rateCard?.sixthDayRate ?? "",
    seventhDayRate: rateCard?.seventhDayRate ?? "",
    nightPremiumPct: rateCard?.nightPremiumPct ?? "",
    holidayPayInclusive: rateCard?.holidayPayInclusive ?? false,
    sourceUrl: rateCard?.sourceUrl ?? "",
    sourceDocument: rateCard?.sourceDocument ?? "",
    notes: rateCard?.notes ?? "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const payload = { id: rateCard._id };
    const numericFields = [
      "weeklyRate",
      "dailyRate",
      "hourlyRate",
      "overtimeRate1x5",
      "overtimeRate2x",
      "sixthDayRate",
      "seventhDayRate",
      "nightPremiumPct",
    ];
    for (const f of numericFields) {
      const val = form[f];
      if (val !== "" && val != null) {
        payload[f] = parseFloat(val);
      }
    }
    payload.holidayPayInclusive = form.holidayPayInclusive;
    payload.sourceUrl = form.sourceUrl;
    payload.sourceDocument = form.sourceDocument;
    payload.notes = form.notes;

    try {
      await updateMutation.mutateAsync(payload);
      toast.success("Rate card updated successfully.");
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update rate card."
      );
    }
  };

  if (!rateCard) return null;

  const rateFields = [
    { key: "weeklyRate", label: "Weekly (£)" },
    { key: "dailyRate", label: "Daily (£)" },
    { key: "hourlyRate", label: "Hourly (£)" },
    { key: "overtimeRate1x5", label: "OT 1.5x (£)" },
    { key: "overtimeRate2x", label: "OT 2x (£)" },
    { key: "sixthDayRate", label: "6th Day (£)" },
    { key: "seventhDayRate", label: "7th Day (£)" },
    { key: "nightPremiumPct", label: "Night %" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Edit Rate Card -{" "}
            {rateCard.designationId?.name || "Unknown Designation"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          {rateFields.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Input
                type="number"
                step="0.01"
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="h-9"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Switch
            checked={form.holidayPayInclusive}
            onCheckedChange={(v) => handleChange("holidayPayInclusive", v)}
          />
          <Label className="text-sm">Holiday Pay Inclusive</Label>
        </div>

        <div className="space-y-2 pt-2">
          <div className="space-y-1">
            <Label className="text-xs">Source URL</Label>
            <Input
              value={form.sourceUrl}
              onChange={(e) => handleChange("sourceUrl", e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Source Document</Label>
            <Input
              value={form.sourceDocument}
              onChange={(e) => handleChange("sourceDocument", e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notes</Label>
            <Input
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// CSV export helper
// ---------------------------------------------------------------------------

function exportToCSV(rateCards) {
  const headers = [
    "Union",
    "Department",
    "Designation",
    "Budget Tier",
    "Weekly",
    "Daily",
    "Hourly",
    "OT 1.5x",
    "OT 2x",
    "6th Day",
    "7th Day",
    "Night %",
    "Holiday Incl.",
    "Source",
    "Source URL",
  ];

  const rows = rateCards.map((rc) => [
    rc.unionId?.code || "",
    rc.departmentId?.name || "",
    rc.designationId?.name || "",
    rc.budgetTierId?.name || "",
    rc.weeklyRate ?? "",
    rc.dailyRate ?? "",
    rc.hourlyRate ?? "",
    rc.overtimeRate1x5 ?? "",
    rc.overtimeRate2x ?? "",
    rc.sixthDayRate ?? "",
    rc.seventhDayRate ?? "",
    rc.nightPremiumPct ?? "",
    rc.holidayPayInclusive ? "Yes" : "No",
    rc.sourceDocument || "",
    rc.sourceUrl || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((r) =>
      r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rate-cards-export-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Comparison view
// ---------------------------------------------------------------------------

function ComparisonView({ rateCards, budgetTiers }) {
  // Group rate cards by department -> designation -> budgetTier
  const grouped = useMemo(() => {
    const departments = {};
    for (const rc of rateCards) {
      const deptName = rc.departmentId?.name || "Unknown";
      const desigName = rc.designationId?.name || "Unknown";
      const tierCode = rc.budgetTierId?.code || "Unknown";

      if (!departments[deptName]) departments[deptName] = {};
      if (!departments[deptName][desigName])
        departments[deptName][desigName] = {};
      departments[deptName][desigName][tierCode] = rc.weeklyRate;
    }
    return departments;
  }, [rateCards]);

  const tierCodes = useMemo(() => {
    if (budgetTiers?.length) {
      return budgetTiers.map((t) => ({ code: t.code, name: t.name }));
    }
    const codes = new Set();
    for (const rc of rateCards) {
      if (rc.budgetTierId?.code) {
        codes.add(
          JSON.stringify({
            code: rc.budgetTierId.code,
            name: rc.budgetTierId.name,
          })
        );
      }
    }
    return [...codes].map((c) => JSON.parse(c));
  }, [rateCards, budgetTiers]);

  const departmentNames = Object.keys(grouped).sort();

  if (departmentNames.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        No data available for comparison view.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {departmentNames.map((deptName) => {
        const designations = grouped[deptName];
        const desigNames = Object.keys(designations).sort();

        return (
          <motion.div key={deptName} variants={cardVariants}>
            <Card className="overflow-hidden bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{deptName}</CardTitle>
                <CardDescription>
                  Weekly rates comparison across budget tiers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 z-10 bg-background min-w-[200px]">
                          Designation
                        </TableHead>
                        {tierCodes.map((tier) => (
                          <TableHead
                            key={tier.code}
                            className="text-right min-w-[120px]"
                          >
                            {tier.name}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {desigNames.map((desigName, idx) => (
                        <TableRow
                          key={desigName}
                          className={idx % 2 === 0 ? "bg-muted/20" : ""}
                        >
                          <TableCell className="sticky left-0 z-10 bg-inherit font-medium">
                            {desigName}
                          </TableCell>
                          {tierCodes.map((tier) => {
                            const rate =
                              designations[desigName]?.[tier.code];
                            return (
                              <TableCell
                                key={tier.code}
                                className="text-right tabular-nums"
                              >
                                {rate != null ? formatGBP(rate) : (
                                  <span className="text-muted-foreground/40">
                                    --
                                  </span>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AdminRateCards() {
  // Filters
  const [unionCode, setUnionCode] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [budgetTierCode, setBudgetTierCode] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Import dialog
  const [importOpen, setImportOpen] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState("table"); // "table" | "comparison"
  const [collapsedDepts, setCollapsedDepts] = useState({});
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [editCard, setEditCard] = useState(null);

  // Search debounce
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(window.__adminRCSearchTimer);
    window.__adminRCSearchTimer = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  }, []);

  // Data hooks
  const queryParams = useMemo(() => {
    const params = { page, limit };
    if (unionCode) params.unionCode = unionCode;
    if (deptCode) params.deptCode = deptCode;
    if (budgetTierCode) params.budgetTierCode = budgetTierCode;
    if (debouncedSearch) params.search = debouncedSearch;
    return params;
  }, [unionCode, deptCode, budgetTierCode, debouncedSearch, page, limit]);

  const { data: rcResponse, isLoading, isError } = useAdminRateCards(queryParams);
  const { data: summary, isLoading: summaryLoading } = useAdminRateCardsSummary();
  const { data: unions } = useUnions();
  const { data: budgetTiers } = useBudgetTiers(
    unions?.find((u) => u.code === unionCode)?._id || null
  );

  const rateCards = rcResponse?.data || [];
  const pagination = rcResponse?.pagination || {
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  };

  // Departments available from the loaded data for the department filter
  const departmentsFromData = useMemo(() => {
    if (!summary?.byDepartment) return [];
    return summary.byDepartment;
  }, [summary]);

  // Union tabs from summary
  const unionTabs = useMemo(() => {
    if (!summary?.byUnion) return [];
    return summary.byUnion;
  }, [summary]);

  // Group rate cards by department for grouped table view
  const groupedByDept = useMemo(() => {
    const groups = {};
    for (const rc of rateCards) {
      const deptName = rc.departmentId?.name || "Unknown";
      if (!groups[deptName]) groups[deptName] = [];
      groups[deptName].push(rc);
    }
    return groups;
  }, [rateCards]);

  // Local sort (within already-fetched page)
  const sortedRateCards = useMemo(() => {
    if (!sortKey) return rateCards;
    const sorted = [...rateCards].sort((a, b) => {
      let valA, valB;
      switch (sortKey) {
        case "union":
          valA = a.unionId?.code || "";
          valB = b.unionId?.code || "";
          return valA.localeCompare(valB);
        case "department":
          valA = a.departmentId?.name || "";
          valB = b.departmentId?.name || "";
          return valA.localeCompare(valB);
        case "designation":
          valA = a.designationId?.name || "";
          valB = b.designationId?.name || "";
          return valA.localeCompare(valB);
        case "budgetTier":
          valA = a.budgetTierId?.name || "";
          valB = b.budgetTierId?.name || "";
          return valA.localeCompare(valB);
        case "weeklyRate":
        case "dailyRate":
        case "hourlyRate":
        case "overtimeRate1x5":
        case "overtimeRate2x":
        case "sixthDayRate":
        case "seventhDayRate":
        case "nightPremiumPct":
          valA = a[sortKey] ?? -Infinity;
          valB = b[sortKey] ?? -Infinity;
          return valA - valB;
        default:
          return 0;
      }
    });
    return sortDir === "desc" ? sorted.reverse() : sorted;
  }, [rateCards, sortKey, sortDir]);

  // Sorted grouped by dept
  const sortedGrouped = useMemo(() => {
    const groups = {};
    for (const rc of sortedRateCards) {
      const deptName = rc.departmentId?.name || "Unknown";
      if (!groups[deptName]) groups[deptName] = [];
      groups[deptName].push(rc);
    }
    return groups;
  }, [sortedRateCards]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleDept = (dept) => {
    setCollapsedDepts((prev) => ({ ...prev, [dept]: !prev[dept] }));
  };

  const handleUnionFilter = (code) => {
    setUnionCode(code === "ALL" ? "" : code);
    setDeptCode("");
    setPage(1);
  };

  const handleExport = () => {
    if (rateCards.length === 0) {
      toast.warning("No rate cards to export.");
      return;
    }
    exportToCSV(rateCards);
    toast.success("CSV exported successfully.");
  };

  // Sortable column header
  const SortableHeader = ({ column, label, className }) => (
    <TableHead
      className={cn("cursor-pointer select-none whitespace-nowrap", className)}
      onClick={() => handleSort(column)}
    >
      {label}
      <SortIcon column={column} sortKey={sortKey} sortDir={sortDir} />
    </TableHead>
  );

  return (
    <div className="space-y-6 p-6">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Rate Card Administration
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cross-verification view of all rate cards across unions,
            departments, and designations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            endpoint="/export/rate-cards"
            filename="rate-cards"
            params={{ unionCode: unionCode || undefined, deptCode: deptCode || undefined }}
            label="Export"
          />
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="mr-1.5 h-4 w-4" />
            Import
          </Button>
          <Tabs
            value={viewMode}
            onValueChange={setViewMode}
            className="hidden sm:block"
          >
            <TabsList>
              <TabsTrigger value="table" className="gap-1.5">
                <TableIcon className="size-3.5" />
                Table
              </TabsTrigger>
              <TabsTrigger value="comparison" className="gap-1.5">
                <LayoutGrid className="size-3.5" />
                Comparison
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* ---- Summary stat cards ---- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {summaryLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </>
        ) : (
          <>
            <SummaryCard
              label="Total Rate Cards"
              value={summary?.totalRateCards?.toLocaleString() || "0"}
              icon={TableIcon}
            />
            <SummaryCard
              label="Unions Covered"
              value={summary?.unionCount || "0"}
              description={
                unionTabs.length
                  ? unionTabs.map((u) => u.code).join(", ")
                  : undefined
              }
              icon={Filter}
            />
            <SummaryCard
              label="Departments"
              value={summary?.departmentCount || "0"}
              icon={LayoutGrid}
            />
            <SummaryCard
              label="Last Updated"
              value={
                summary?.lastUpdated
                  ? formatDate(summary.lastUpdated)
                  : "N/A"
              }
              icon={Info}
            />
          </>
        )}
      </motion.div>

      {/* ---- Filter bar ---- */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Union tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Union
              </label>
              <div className="flex flex-wrap gap-1">
                <Button
                  size="sm"
                  variant={unionCode === "" ? "default" : "outline"}
                  onClick={() => handleUnionFilter("ALL")}
                  className="h-8 text-xs"
                >
                  All
                </Button>
                {unionTabs.map((u) => (
                  <Button
                    key={u.code}
                    size="sm"
                    variant={unionCode === u.code ? "default" : "outline"}
                    onClick={() => handleUnionFilter(u.code)}
                    className="h-8 text-xs"
                  >
                    {u.code}
                    <Badge
                      variant="secondary"
                      className="ml-1.5 h-4 text-[10px]"
                    >
                      {u.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Department dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Department
              </label>
              <Select
                value={deptCode || "ALL"}
                onValueChange={(v) => {
                  setDeptCode(v === "ALL" ? "" : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Departments</SelectItem>
                  {departmentsFromData.map((d) => (
                    <SelectItem key={d._id} value={d.code}>
                      {d.name} ({d.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget Tier dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Budget Tier
              </label>
              <Select
                value={budgetTierCode || "ALL"}
                onValueChange={(v) => {
                  setBudgetTierCode(v === "ALL" ? "" : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Tiers</SelectItem>
                  {(budgetTiers || []).map((t) => (
                    <SelectItem key={t._id} value={t.code}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Search Designation
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="e.g. Camera Operator"
                  className="h-8 w-[200px] pl-8 text-xs"
                />
              </div>
            </div>

            {/* Export */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={handleExport}
            >
              <Download className="size-3.5" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ---- Loading / Error ---- */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <XCircle className="size-5 shrink-0" />
          Failed to load rate cards. Please try again.
        </div>
      )}

      {/* ---- Main content ---- */}
      {!isLoading && !isError && (
        <AnimatePresence mode="wait">
          {viewMode === "table" ? (
            <motion.div
              key="table-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Row count and pagination controls */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {rateCards.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {pagination.total}
                  </span>{" "}
                  rate cards
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">
                    Per page
                  </label>
                  <Select
                    value={String(limit)}
                    onValueChange={(v) => {
                      setLimit(parseInt(v, 10));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table */}
              <Card className="overflow-hidden bg-card/80 backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8" />
                        <SortableHeader column="union" label="Union" />
                        <SortableHeader column="department" label="Department" />
                        <SortableHeader
                          column="designation"
                          label="Designation"
                        />
                        <SortableHeader
                          column="budgetTier"
                          label="Budget Tier"
                        />
                        <SortableHeader
                          column="weeklyRate"
                          label="Weekly"
                          className="text-right"
                        />
                        <SortableHeader
                          column="dailyRate"
                          label="Daily"
                          className="text-right"
                        />
                        <SortableHeader
                          column="hourlyRate"
                          label="Hourly"
                          className="text-right"
                        />
                        <SortableHeader
                          column="overtimeRate1x5"
                          label="OT 1.5x"
                          className="text-right"
                        />
                        <SortableHeader
                          column="overtimeRate2x"
                          label="OT 2x"
                          className="text-right"
                        />
                        <SortableHeader
                          column="sixthDayRate"
                          label="6th Day"
                          className="text-right"
                        />
                        <SortableHeader
                          column="seventhDayRate"
                          label="7th Day"
                          className="text-right"
                        />
                        <SortableHeader
                          column="nightPremiumPct"
                          label="Night %"
                          className="text-right"
                        />
                        <TableHead className="text-center whitespace-nowrap">
                          Holiday
                        </TableHead>
                        <TableHead className="text-center">Source</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(sortedGrouped).map(
                        ([deptName, cards]) => (
                          <DepartmentGroup
                            key={deptName}
                            deptName={deptName}
                            cards={cards}
                            collapsed={!!collapsedDepts[deptName]}
                            onToggle={() => toggleDept(deptName)}
                            onEdit={setEditCard}
                          />
                        )
                      )}
                      {rateCards.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={16}
                            className="h-32 text-center text-muted-foreground"
                          >
                            No rate cards found matching your filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={page <= 1}
                    onClick={() => setPage(1)}
                  >
                    <ChevronsLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page{" "}
                    <span className="font-medium text-foreground">{page}</span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {pagination.totalPages}
                    </span>
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={page >= pagination.totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(pagination.totalPages)}
                  >
                    <ChevronsRight className="size-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="comparison-view"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <ComparisonView
                rateCards={rateCards}
                budgetTiers={budgetTiers}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ---- Edit dialog ---- */}
      <EditRateCardDialog
        rateCard={editCard}
        open={!!editCard}
        onOpenChange={(open) => {
          if (!open) setEditCard(null);
        }}
      />

      {/* ---- Import dialog ---- */}
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Rate Cards"
        description="Upload a CSV or JSON file to bulk-import rate cards."
        templateHeaders={[
          "Union Code",
          "Dept Code",
          "Designation Code",
          "Tier Code",
          "Weekly Rate",
          "Daily Rate",
          "Hourly Rate",
          "OT 1.5x",
          "OT 2x",
          "6th Day Rate",
          "7th Day Rate",
          "Night Premium %",
          "Holiday Pay Inclusive",
          "Source URL",
          "Source Document",
          "Effective From",
        ]}
        endpoint="/import/rate-cards"
        onSuccess={() => {
          // Trigger refetch of rate cards
          window.location.reload();
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Department group rows
// ---------------------------------------------------------------------------

function DepartmentGroup({ deptName, cards, collapsed, onToggle, onEdit }) {
  return (
    <>
      {/* Group header row */}
      <TableRow
        className="bg-muted/40 hover:bg-muted/60 cursor-pointer"
        onClick={onToggle}
      >
        <TableCell colSpan={16} className="py-2">
          <div className="flex items-center gap-2">
            {collapsed ? (
              <ChevronRight className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
            <span className="text-sm font-semibold">{deptName}</span>
            <Badge variant="secondary" className="text-[10px]">
              {cards.length}
            </Badge>
          </div>
        </TableCell>
      </TableRow>

      {/* Data rows */}
      {!collapsed &&
        cards.map((rc, idx) => (
          <RateCardRow key={rc._id} rc={rc} idx={idx} onEdit={onEdit} />
        ))}
    </>
  );
}

function RateCardRow({ rc, idx, onEdit }) {
  const isEntryLevel = rc.designationId?.level === 0;
  const hasNightPremium = rc.nightPremiumPct != null && rc.nightPremiumPct > 0;

  return (
    <TableRow className={cn(idx % 2 === 0 ? "bg-background" : "bg-muted/10")}>
      <TableCell />
      <TableCell>
        <Badge variant="outline" className="text-[10px] font-mono">
          {rc.unionId?.code || "--"}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{rc.departmentId?.name || "--"}</TableCell>
      <TableCell className="text-sm font-medium">
        <span className="flex items-center gap-1.5">
          {rc.designationId?.name || "--"}
          {isEntryLevel && (
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant="secondary"
                  className="h-4 text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                >
                  Entry
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                Entry level / trainee minimum rate
              </TooltipContent>
            </Tooltip>
          )}
        </span>
      </TableCell>
      <TableCell className="text-sm">{rc.budgetTierId?.name || "--"}</TableCell>
      <TableCell className="text-right tabular-nums font-medium">
        {formatGBP(rc.weeklyRate)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatGBP(rc.dailyRate)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatGBP(rc.hourlyRate)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatGBP(rc.overtimeRate1x5)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatGBP(rc.overtimeRate2x)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatGBP(rc.sixthDayRate)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatGBP(rc.seventhDayRate)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        <span
          className={cn(
            hasNightPremium &&
              "text-violet-600 dark:text-violet-400 font-medium"
          )}
        >
          {hasNightPremium && <Moon className="mr-1 inline size-3" />}
          {formatPercent(rc.nightPremiumPct)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        {rc.holidayPayInclusive ? (
          <Tooltip>
            <TooltipTrigger>
              <CheckCircle2 className="mx-auto size-4 text-emerald-500" />
            </TooltipTrigger>
            <TooltipContent>Holiday pay inclusive</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger>
              <XCircle className="mx-auto size-4 text-muted-foreground/40" />
            </TooltipTrigger>
            <TooltipContent>Holiday pay exclusive</TooltipContent>
          </Tooltip>
        )}
      </TableCell>
      <TableCell className="text-center">
        {rc.sourceUrl ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={rc.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md p-1 hover:bg-muted transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="size-3.5 text-blue-500" />
              </a>
            </TooltipTrigger>
            <TooltipContent>{rc.sourceDocument || rc.sourceUrl}</TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-muted-foreground/40">--</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(rc);
          }}
        >
          <Edit className="size-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
