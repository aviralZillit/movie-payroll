import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle2,
  XCircle,
  Calculator,
  FileText,
  Loader2,
  User,
  Film,
  Calendar,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import {
  useTimecard,
  useUpdateTimecardEntries,
  useCalculateTimecard,
  useSubmitTimecard,
  useApproveTimecard,
  useRejectTimecard,
} from "@/hooks/useTimecards";
import TimecardGrid from "@/components/timecard/TimecardGrid";
import TimecardSummary from "@/components/timecard/TimecardSummary";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
  paid: { label: "Paid", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" },
};

function HeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="flex gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

export default function TimecardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: timecard, isLoading, isError } = useTimecard(id);
  const updateEntries = useUpdateTimecardEntries(id);
  const calculate = useCalculateTimecard(id);
  const submitTC = useSubmitTimecard();
  const approveTC = useApproveTimecard();
  const rejectTC = useRejectTimecard();

  const [localEntries, setLocalEntries] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const debounceRef = useRef(null);

  // Sync server data into local state
  useEffect(() => {
    if (timecard?.entries) {
      setLocalEntries(timecard.entries);
      setHasChanges(false);
    }
  }, [timecard?.entries]);

  // Auto-save with debounce — only send complete entries (have both callTime and wrapTime)
  const debouncedSave = useCallback(
    (entries) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const completeEntries = entries.filter(e => e.callTime && e.wrapTime);
        if (completeEntries.length === 0) return; // don't save if no complete entries
        updateEntries.mutate(completeEntries, {
          onSuccess: () => {
            setHasChanges(false);
          },
          onError: () => {
            toast.error("Failed to save changes");
          },
        });
      }, 1500);
    },
    [updateEntries]
  );

  const handleEntryChange = useCallback(
    (dayIndex, updatedEntry) => {
      setLocalEntries((prev) => {
        const next = [...prev];
        next[dayIndex] = updatedEntry;
        debouncedSave(next);
        setHasChanges(true);
        return next;
      });
    },
    [debouncedSave]
  );

  const handleCalculate = () => {
    calculate.mutate(undefined, {
      onSuccess: () => toast.success("Hours calculated successfully"),
      onError: () => toast.error("Calculation failed"),
    });
  };

  const handleSubmit = () => {
    submitTC.mutate(id, {
      onSuccess: () => toast.success("Timecard submitted for approval"),
      onError: () => toast.error("Failed to submit timecard"),
    });
  };

  const handleApprove = () => {
    approveTC.mutate(id, {
      onSuccess: () => toast.success("Timecard approved"),
      onError: () => toast.error("Failed to approve timecard"),
    });
  };

  const handleReject = () => {
    rejectTC.mutate(
      { id, reason: rejectReason },
      {
        onSuccess: () => {
          toast.success("Timecard rejected");
          setRejectDialogOpen(false);
          setRejectReason("");
        },
        onError: () => toast.error("Failed to reject timecard"),
      }
    );
  };

  const handleManualSave = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const completeEntries = localEntries.filter(e => e.callTime && e.wrapTime);
    updateEntries.mutate(completeEntries, {
      onSuccess: () => {
        setHasChanges(false);
        toast.success("Timecard saved");
      },
      onError: () => toast.error("Failed to save"),
    });
  };

  const handleAiFill = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const dealMemoId =
        typeof timecard.dealMemoId === "object"
          ? timecard.dealMemoId._id
          : timecard.dealMemoId;
      const { data } = await api.post("/ai/timecard", {
        message: aiPrompt.trim(),
        dealMemoId,
      });
      const aiEntries = data.data.entries;

      setLocalEntries((prev) => {
        const next = [...prev];
        for (const aiEntry of aiEntries) {
          const idx = (aiEntry.dayOfWeek || 1) - 1; // dayOfWeek 1-7 -> index 0-6
          if (idx < 0 || idx > 6) continue;
          const existing = next[idx] || {};
          next[idx] = {
            ...existing,
            callTime: aiEntry.callTime || existing.callTime || "",
            lunchStart: aiEntry.lunchStart || existing.lunchStart || "",
            lunchEnd: aiEntry.lunchEnd || existing.lunchEnd || "",
            wrapTime: aiEntry.wrapTime || existing.wrapTime || "",
            isRestDay: aiEntry.isRestDay || false,
            isHoliday: aiEntry.isHoliday || false,
            isTravelDay: aiEntry.isTravelDay || false,
            notes: aiEntry.notes || existing.notes || "",
          };
          // Clear time fields for rest/holiday days
          if (aiEntry.isRestDay || aiEntry.isHoliday) {
            next[idx].callTime = "";
            next[idx].lunchStart = "";
            next[idx].lunchEnd = "";
            next[idx].wrapTime = "";
          }
        }
        setHasChanges(true);
        debouncedSave(next);
        return next;
      });

      const summary = data.data.summary;
      toast.success(summary || "Timecard filled by AI");
      setAiDialogOpen(false);
      setAiPrompt("");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "AI fill failed. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const isEditable =
    timecard?.status === "draft" || timecard?.status === "rejected";
  const canApprove =
    user?.role === "admin" ||
    user?.role === "payroll_admin" ||
    user?.role === "production_manager";
  const statusConfig = STATUS_CONFIG[timecard?.status] || STATUS_CONFIG.draft;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <HeaderSkeleton />
      </div>
    );
  }

  if (isError || !timecard) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-medium">Timecard not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/timecards")}>
          Back to Timecards
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
      {/* Back button + Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate("/timecards")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {timecard.timecardNumber || "Timecard"}
            </h1>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                statusConfig.color
              )}
            >
              {statusConfig.label}
            </span>
            {hasChanges && (
              <span className="text-xs text-amber-500">Unsaved changes</span>
            )}
          </div>
        </div>
      </div>

      {/* Header info bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {timecard.ownerId?.fullName || `${timecard.ownerId?.firstName || ''} ${timecard.ownerId?.lastName || ''}`.trim() || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Film className="h-4 w-4 text-muted-foreground" />
              <span>{timecard.productionId?.name || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {timecard.weekStarting
                  ? `${format(parseISO(timecard.weekStarting), "dd MMM")} - ${format(
                      parseISO(timecard.weekEnding || timecard.weekStarting),
                      "dd MMM yyyy"
                    )}`
                  : "N/A"}
              </span>
            </div>
            {timecard.dealMemoId && (
              <Link
                to={`/deal-memos/${typeof timecard.dealMemoId === 'object' ? timecard.dealMemoId._id : timecard.dealMemoId}`}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                View Deal Memo
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main content: Grid + Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Timecard Grid */}
        <div className="min-w-0">
          <TimecardGrid
            entries={localEntries}
            weekStartDate={timecard.weekStartDate}
            onEntryChange={handleEntryChange}
            disabled={!isEditable}
          />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <TimecardSummary entries={localEntries} />
        </div>
      </div>

      {/* Actions bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="sticky bottom-0 z-20 -mx-6 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditable && (
              <>
                <Button
                  variant="outline"
                  onClick={handleManualSave}
                  disabled={updateEntries.isPending || !hasChanges}
                >
                  {updateEntries.isPending ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-4 w-4" />
                  )}
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCalculate}
                  disabled={calculate.isPending}
                >
                  {calculate.isPending ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Calculator className="mr-1.5 h-4 w-4" />
                  )}
                  Calculate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAiDialogOpen(true)}
                >
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  AI Fill
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditable && (
              <Button
                onClick={handleSubmit}
                disabled={submitTC.isPending}
              >
                {submitTC.isPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-1.5 h-4 w-4" />
                )}
                Submit for Approval
              </Button>
            )}

            {timecard.status === "submitted" && canApprove && (
              <>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={rejectTC.isPending}
                >
                  <XCircle className="mr-1.5 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleApprove}
                  disabled={approveTC.isPending}
                >
                  {approveTC.isPending ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  )}
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Timecard</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this timecard. The crew
              member will be notified and can make corrections.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectTC.isPending}
            >
              {rejectTC.isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-1.5 h-4 w-4" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Fill Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Fill Timecard</DialogTitle>
            <DialogDescription>
              Describe your work week in plain English. The AI will fill all 7
              days of your timecard automatically.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe your work week... e.g. 'Standard 12hr days Mon-Fri. Tuesday I worked 14 hours. Saturday and Sunday were holidays.'"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={4}
            disabled={aiLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleAiFill();
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAiDialogOpen(false)}
              disabled={aiLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAiFill}
              disabled={!aiPrompt.trim() || aiLoading}
            >
              {aiLoading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-4 w-4" />
              )}
              {aiLoading ? "Filling..." : "Fill Timecard"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
