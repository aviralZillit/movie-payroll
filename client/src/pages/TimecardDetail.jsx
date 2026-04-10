import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format, parseISO, addDays } from "date-fns";
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
  usePayrollApproveTimecard,
  useRejectTimecard,
} from "@/hooks/useTimecards";
import TimecardGrid from "@/components/timecard/TimecardGrid";
import TimecardSummary from "@/components/timecard/TimecardSummary";
import TimecardShell from "@/components/timecard/TimecardShell";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  dept_approved: { label: "Dept Approved", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  payroll_approved: { label: "Payroll Approved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
  revision_requested: { label: "Revision Requested", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" },
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
  const payrollApproveTC = usePayrollApproveTimecard();
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
        const completeEntries = entries.filter(e => e.date && (e.callTime && e.wrapTime || e.isRestDay || e.isHoliday));
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
      const weekStart = timecard?.weekStarting
        ? parseISO(timecard.weekStarting)
        : new Date();
      setLocalEntries((prev) => {
        const next = prev.length === 7
          ? [...prev]
          : Array.from({ length: 7 }, (_, i) => ({
              date: addDays(weekStart, i).toISOString(),
              dayOfWeek: i + 1,
            }));
        next[dayIndex] = {
          ...next[dayIndex],
          ...updatedEntry,
          date: updatedEntry.date || next[dayIndex]?.date || addDays(weekStart, dayIndex).toISOString(),
          dayOfWeek: dayIndex + 1,
        };
        debouncedSave(next);
        setHasChanges(true);
        return next;
      });
    },
    [debouncedSave, timecard?.weekStarting]
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
      onSuccess: () => toast.success("Timecard department approved"),
      onError: () => toast.error("Failed to approve timecard"),
    });
  };

  const handlePayrollApprove = () => {
    payrollApproveTC.mutate(id, {
      onSuccess: () => toast.success("Timecard payroll approved — ready for payroll run"),
      onError: () => toast.error("Failed to payroll approve timecard"),
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
    const completeEntries = localEntries.filter(e => e.date && (e.callTime && e.wrapTime || e.isRestDay || e.isHoliday));
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
        timecardId: id,
      });
      const aiEntries = data.data.entries;

      // Compute dates from weekStarting
      const weekStart = timecard.weekStarting
        ? parseISO(timecard.weekStarting)
        : new Date();

      setLocalEntries((prev) => {
        // Initialize 7-day array with dates if prev is empty
        const next = prev.length === 7
          ? [...prev]
          : Array.from({ length: 7 }, (_, i) => ({
              date: addDays(weekStart, i).toISOString(),
              dayOfWeek: i + 1,
            }));

        for (const aiEntry of aiEntries) {
          const idx = (aiEntry.dayOfWeek || 1) - 1; // dayOfWeek 1-7 -> index 0-6
          if (idx < 0 || idx > 6) continue;
          const existing = next[idx] || {};
          next[idx] = {
            ...existing,
            date: existing.date || addDays(weekStart, idx).toISOString(),
            dayOfWeek: idx + 1,
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
  const canDeptApprove =
    user?.role === "super_admin" ||
    user?.role === "payroll_admin" ||
    user?.role === "production_accountant" ||
    user?.role === "department_head";
  const canPayrollApprove =
    user?.role === "super_admin" ||
    user?.role === "payroll_admin" ||
    user?.role === "production_accountant";
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
      className="h-[calc(100vh-64px)]"
    >
      {/* Back button + Title — compact bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-background">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/timecards")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight">
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

      {/* New TimecardShell — full layout with aside, week summary, expandable days */}
      <div className="flex-1 overflow-hidden rounded-lg border">
        <TimecardShell
          timecard={timecard}
          entries={localEntries}
          weekStartDate={timecard.weekStarting}
          onEntryChange={handleEntryChange}
          onSave={handleManualSave}
          onCalculate={handleCalculate}
          onSubmit={handleSubmit}
          disabled={!isEditable}
          crew={{
            name: timecard.ownerId?.fullName || `${timecard.ownerId?.firstName || ''} ${timecard.ownerId?.lastName || ''}`.trim(),
            role: timecard.dealMemoId?.designationId?.name || timecard.dealMemoId?.screenCredit || '',
            department: timecard.dealMemoId?.departmentId?.name || '',
            weekNumber: timecard.weekNumber,
          }}
          dealMemo={timecard.dealMemoId || {}}
        />
      </div>

      {/* Old action bar removed — now in TimecardShell footer */}

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
