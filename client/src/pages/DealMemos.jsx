import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

import { useDealMemos, useProductions, useTransitionDealMemo } from "@/hooks/useDealMemos";
import useAuthStore from "@/store/authStore";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Plus, FileText, Search, Filter, X, Send, PenLine, Play } from "lucide-react";
import ExportButton from "@/components/common/ExportButton";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------
const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-500/15 text-gray-600 dark:text-gray-400" },
  sent: { label: "Sent", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  negotiating: { label: "Negotiating", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  signed: { label: "Signed", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  active: { label: "Active", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
  completed: { label: "Completed", color: "bg-teal-500/15 text-teal-600 dark:text-teal-400" },
};

const UNION_LABELS = {
  bectu: "BECTU",
  equity: "Equity",
  musicians_union: "Musicians' Union",
  non_union: "Non-Union",
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        cfg.color
      )}
    >
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const ADMIN_ROLES = ['super_admin', 'payroll_admin', 'production_accountant'];

export default function DealMemos() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = ADMIN_ROLES.includes(user?.role);
  const transitionMutation = useTransitionDealMemo();

  const handleTransition = (e, id, action) => {
    e.stopPropagation();
    transitionMutation.mutate(
      { id, action },
      {
        onSuccess: () => toast.success(`Deal memo ${action} successful`),
        onError: (err) => toast.error(err?.response?.data?.message || `Failed to ${action} deal memo`),
      }
    );
  };

  const [statusFilter, setStatusFilter] = useState("all");
  const [productionFilter, setProductionFilter] = useState("all");
  const [unionFilter, setUnionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filters = useMemo(() => {
    const f = {};
    if (statusFilter && statusFilter !== "all") f.status = statusFilter;
    if (productionFilter && productionFilter !== "all") f.productionId = productionFilter;
    if (unionFilter && unionFilter !== "all") f.union = unionFilter;
    return f;
  }, [statusFilter, productionFilter, unionFilter]);

  const { data: dealMemos, isLoading, isError } = useDealMemos(filters);
  const { data: productions } = useProductions();

  const hasFilters = (statusFilter && statusFilter !== "all") || (productionFilter && productionFilter !== "all") || (unionFilter && unionFilter !== "all");

  const filteredMemos = useMemo(() => {
    if (!dealMemos) return [];
    if (!searchQuery.trim()) return dealMemos;
    const q = searchQuery.toLowerCase();
    return dealMemos.filter(
      (dm) =>
        dm.dealNumber?.toLowerCase().includes(q) ||
        (dm.personId?.fullName || `${dm.personId?.firstName || ''} ${dm.personId?.lastName || ''}`).toLowerCase().includes(q) ||
        dm.departmentId?.name?.toLowerCase().includes(q) ||
        dm.designationId?.name?.toLowerCase().includes(q)
    );
  }, [dealMemos, searchQuery]);

  const clearFilters = () => {
    setStatusFilter("all");
    setProductionFilter("all");
    setUnionFilter("all");
    setSearchQuery("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deal Memos</h1>
          <p className="text-sm text-muted-foreground">
            Manage compensation agreements for cast and crew
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            endpoint="/export/deal-memos"
            filename="deal-memos"
            params={{
              productionId: productionFilter !== "all" ? productionFilter : undefined,
              status: statusFilter !== "all" ? statusFilter : undefined,
            }}
            label="Export"
          />
          {isAdmin && (
            <Button onClick={() => navigate("/deal-memos/new")}>
              <Plus className="size-4 mr-1.5" />
              New Deal Memo
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* Search */}
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <Label className="text-xs text-muted-foreground">Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Deal #, name, department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5 w-40">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Production */}
            <div className="space-y-1.5 w-48">
              <Label className="text-xs text-muted-foreground">Production</Label>
              <Select value={productionFilter} onValueChange={setProductionFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All productions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Productions</SelectItem>
                  {(productions || []).map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.title || p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Union */}
            <div className="space-y-1.5 w-40">
              <Label className="text-xs text-muted-foreground">Union</Label>
              <Select value={unionFilter} onValueChange={setUnionFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All unions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Unions</SelectItem>
                  {Object.entries(UNION_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="mb-0.5">
                <X className="size-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <p className="text-sm text-destructive">Failed to load deal memos. Please try again.</p>
            </div>
          ) : filteredMemos.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="size-10 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {hasFilters || searchQuery ? "No deal memos match your filters." : "No deal memos yet."}
              </p>
              {!hasFilters && !searchQuery && isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate("/deal-memos/new")}>
                  <Plus className="size-3.5 mr-1" />
                  Create First Deal Memo
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal #</TableHead>
                  <TableHead>Production</TableHead>
                  <TableHead>Person</TableHead>
                  <TableHead>Union</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-right">Weekly Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemos.map((dm) => (
                  <TableRow
                    key={dm._id || dm.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/deal-memos/${dm._id || dm.id}`)}
                  >
                    <TableCell className="font-medium text-primary">
                      {dm.dealNumber || `DM-${(dm._id || dm.id)?.slice(-6)}`}
                    </TableCell>
                    <TableCell>
                      {dm.productionId?.name || "--"}
                    </TableCell>
                    <TableCell>{dm.personId?.fullName || `${dm.personId?.firstName || ''} ${dm.personId?.lastName || ''}`.trim() || "--"}</TableCell>
                    <TableCell>{dm.unionId?.code || "--"}</TableCell>
                    <TableCell>{dm.departmentId?.name || "--"}</TableCell>
                    <TableCell>{dm.designationId?.name || "--"}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatCurrency(dm.weeklyRate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={dm.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(dm.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Admin: Send button for draft deals */}
                        {isAdmin && dm.status === "draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={transitionMutation.isPending}
                            onClick={(e) => handleTransition(e, dm._id || dm.id, "send")}
                          >
                            <Send className="size-3.5 mr-1" />
                            Send
                          </Button>
                        )}
                        {/* Crew: Sign button for sent deals that belong to them */}
                        {!isAdmin && dm.status === "sent" && (dm.personId?._id === user?._id || dm.personId === user?._id) && (
                          <Button
                            variant="default"
                            size="sm"
                            disabled={transitionMutation.isPending}
                            onClick={(e) => handleTransition(e, dm._id || dm.id, "sign")}
                          >
                            <PenLine className="size-3.5 mr-1" />
                            Sign
                          </Button>
                        )}
                        {/* Admin: Activate button for signed deals */}
                        {isAdmin && dm.status === "signed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={transitionMutation.isPending}
                            onClick={(e) => handleTransition(e, dm._id || dm.id, "activate")}
                          >
                            <Play className="size-3.5 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
