import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useDealMemo, useTransitionDealMemo, useUpdateDealMemo } from "@/hooks/useDealMemos";
import useAuthStore from "@/store/authStore";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  ChevronLeft,
  Film,
  Users,
  Banknote,
  Percent,
  Clock,
  Briefcase,
  Info,
  ExternalLink,
  Send,
  PenLine,
  Play,
  CheckCircle2,
  XCircle,
  Printer,
  FileDown,
  MessageSquare,
  History,
  Edit3,
} from "lucide-react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Status config & timeline
// ---------------------------------------------------------------------------
const STATUS_ORDER = ["draft", "sent", "negotiating", "signed", "active", "completed"];
const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-500", textColor: "text-gray-600 dark:text-gray-400" },
  sent: { label: "Sent", color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400" },
  negotiating: { label: "Negotiating", color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400" },
  signed: { label: "Signed", color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400" },
  active: { label: "Active", color: "bg-purple-500", textColor: "text-purple-600 dark:text-purple-400" },
  completed: { label: "Completed", color: "bg-teal-500", textColor: "text-teal-600 dark:text-teal-400" },
  cancelled: { label: "Cancelled", color: "bg-red-500", textColor: "text-red-600 dark:text-red-400" },
};

const UNION_LABELS = {
  bectu: "BECTU",
  equity: "Equity",
  musicians_union: "Musicians' Union",
  non_union: "Non-Union",
};

const BUDGET_TIER_LABELS = {
  low: "Low Budget (< £5M)",
  mid: "Mid Budget (£5M - £15M)",
  high: "High Budget (£15M - £50M)",
  studio: "Studio (> £50M)",
};

const ADMIN_ROLES = ['super_admin', 'payroll_admin', 'production_accountant'];

/**
 * Returns the available actions based on the deal memo status and the current user.
 */
function getStatusActions(status, user, memo) {
  const isAdmin = ADMIN_ROLES.includes(user?.role);
  const personIdStr = (memo?.personId?._id || memo?.personId || '').toString();
  const userIdStr = (user?._id || user?.id || '').toString();
  const isPersonOnDeal = personIdStr && userIdStr && personIdStr === userIdStr;
  const actions = [];

  if (status === 'draft' && isAdmin) {
    actions.push({ action: 'send', label: 'Send', icon: Send, variant: 'default' });
    actions.push({ action: 'cancel', label: 'Cancel', icon: XCircle, variant: 'destructive', confirm: true });
  } else if (status === 'sent') {
    if (isPersonOnDeal) {
      actions.push({ action: 'sign', label: 'Review & Sign', icon: PenLine, variant: 'default', signFlow: true });
      actions.push({ action: 'negotiate', label: 'Negotiate', icon: MessageSquare, variant: 'outline' });
    }
    if (isAdmin) {
      actions.push({ action: 'sign', label: 'Mark Signed', icon: PenLine, variant: 'default' });
      actions.push({ action: 'negotiate', label: 'Negotiate', icon: MessageSquare, variant: 'outline' });
      actions.push({ action: 'cancel', label: 'Cancel', icon: XCircle, variant: 'destructive', confirm: true });
    }
  } else if (status === 'negotiating') {
    if (isAdmin) {
      actions.push({ action: 'resend', label: 'Re-send', icon: Send, variant: 'default' });
    }
    if (isAdmin || isPersonOnDeal) {
      actions.push({ action: 'sign', label: 'Mark Signed', icon: PenLine, variant: 'default' });
    }
    if (isAdmin) {
      actions.push({ action: 'cancel', label: 'Cancel', icon: XCircle, variant: 'destructive', confirm: true });
    }
  } else if (status === 'signed') {
    if (isAdmin) {
      actions.push({ action: 'activate', label: 'Activate Deal', icon: Play, variant: 'default' });
      actions.push({ action: 'cancel', label: 'Cancel', icon: XCircle, variant: 'destructive', confirm: true });
    }
  } else if (status === 'active' && isAdmin) {
    actions.push({ action: 'complete', label: 'Complete', icon: CheckCircle2, variant: 'default' });
    actions.push({ action: 'cancel', label: 'Cancel', icon: XCircle, variant: 'destructive', confirm: true });
  }

  return actions;
}

// ---------------------------------------------------------------------------
// Status Timeline
// ---------------------------------------------------------------------------
function StatusTimeline({ currentStatus }) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className="flex items-center gap-1">
      {STATUS_ORDER.map((status, i) => {
        const cfg = STATUS_CONFIG[status];
        const isCompleted = !isCancelled && i <= currentIdx;
        const isCurrent = status === currentStatus;

        return (
          <div key={status} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={cn(
                  "size-3 rounded-full border-2 transition-all",
                  isCompleted ? `${cfg.color} border-transparent` : "border-muted-foreground/30 bg-transparent",
                  isCurrent && "ring-4 ring-offset-2 ring-offset-background",
                  isCurrent && status === "draft" && "ring-gray-500/20",
                  isCurrent && status === "sent" && "ring-blue-500/20",
                  isCurrent && status === "negotiating" && "ring-amber-500/20",
                  isCurrent && status === "signed" && "ring-emerald-500/20",
                  isCurrent && status === "active" && "ring-purple-500/20",
                  isCurrent && status === "completed" && "ring-teal-500/20"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium text-center leading-tight",
                  isCurrent ? cfg.textColor : isCompleted ? "text-foreground/70" : "text-muted-foreground/50"
                )}
              >
                {cfg.label}
              </span>
            </div>
            {i < STATUS_ORDER.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded-full self-start mt-[5px]",
                  !isCancelled && i < currentIdx ? cfg.color : "bg-muted-foreground/15"
                )}
              />
            )}
          </div>
        );
      })}
      {isCancelled && (
        <div className="flex flex-col items-center gap-1 ml-2">
          <div className="size-3 rounded-full bg-red-500 ring-4 ring-red-500/20 ring-offset-2 ring-offset-background" />
          <span className="text-[10px] font-medium text-red-600 dark:text-red-400">Cancelled</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Info field with optional tooltip
// ---------------------------------------------------------------------------
function DetailField({ label, value, sourceUrl, sourceLabel, className }) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <div className="flex items-center gap-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {(sourceUrl || sourceLabel) && (
          <Tooltip>
            <TooltipTrigger className="text-muted-foreground/60 hover:text-foreground transition-colors">
              <Info className="size-3" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <span className="flex items-center gap-1.5">
                Source: {sourceLabel || "Rate Card"}
                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-blue-400 hover:text-blue-300"
                  >
                    View <ExternalLink className="size-3" />
                  </a>
                )}
              </span>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="text-sm font-medium">{value || "--"}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function Section({ icon: Icon, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirm dialog for destructive actions
// ---------------------------------------------------------------------------
function ConfirmAction({ action, label, icon: Icon, variant, onConfirm, isPending }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm">
          <Icon className="size-3.5 mr-1.5" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm {label}</DialogTitle>
          <DialogDescription>
            Are you sure you want to {label.toLowerCase()} this deal memo? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={variant}
            disabled={isPending}
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            {isPending ? "Processing..." : `Yes, ${label}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DealMemoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = ADMIN_ROLES.includes(user?.role);
  const { data: memo, isLoading, isError } = useDealMemo(id);
  const transitionMutation = useTransitionDealMemo();
  const updateMutation = useUpdateDealMemo();
  const [signDialogOpen, setSignDialogOpen] = useState(false);

  // Note dialog state for negotiate / re-send
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDialogAction, setNoteDialogAction] = useState(null);
  const [noteText, setNoteText] = useState("");

  const NOTE_DIALOG_CONFIG = {
    negotiate: { title: "Negotiate Deal", description: "Add a note explaining why you want to negotiate this deal." },
    resend: { title: "Re-send Deal", description: "Add a note explaining the changes or reason for re-sending." },
  };

  const openNoteDialog = (action) => {
    setNoteDialogAction(action);
    setNoteText("");
    setNoteDialogOpen(true);
  };

  const submitNoteDialog = () => {
    if (!noteDialogAction) return;
    transitionMutation.mutate(
      { id, action: noteDialogAction, note: noteText.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`Deal memo ${noteDialogAction} successful`);
          setNoteDialogOpen(false);
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || `Failed to ${noteDialogAction} deal memo`);
          setNoteDialogOpen(false);
        },
      }
    );
  };

  // Edit Rates dialog state
  const [editRatesOpen, setEditRatesOpen] = useState(false);
  const [editRates, setEditRates] = useState({ weeklyRate: "", dailyRate: "", hourlyRate: "" });

  const openEditRates = () => {
    setEditRates({
      weeklyRate: memo?.weeklyRate ?? "",
      dailyRate: memo?.dailyRate ?? "",
      hourlyRate: memo?.hourlyRate ?? "",
    });
    setEditRatesOpen(true);
  };

  const submitEditRates = () => {
    const payload = {};
    if (editRates.weeklyRate !== "") payload.weeklyRate = Number(editRates.weeklyRate);
    if (editRates.dailyRate !== "") payload.dailyRate = Number(editRates.dailyRate);
    if (editRates.hourlyRate !== "") payload.hourlyRate = Number(editRates.hourlyRate);

    updateMutation.mutate(
      { id, ...payload },
      {
        onSuccess: () => {
          toast.success("Rates updated successfully");
          setEditRatesOpen(false);
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to update rates");
        },
      }
    );
  };

  const handleAction = (action) => {
    // Redirect negotiate / resend through the note dialog
    if (action === "negotiate" || action === "resend") {
      openNoteDialog(action);
      return;
    }
    transitionMutation.mutate(
      { id, action },
      {
        onSuccess: () => toast.success(`Deal memo ${action} successful`),
        onError: (err) => toast.error(err?.response?.data?.message || `Failed to ${action} deal memo`),
      }
    );
  };

  const handleSign = () => {
    transitionMutation.mutate(
      { id, action: 'sign', note: 'Signed by crew member' },
      {
        onSuccess: () => {
          toast.success('Deal memo signed successfully');
          setSignDialogOpen(false);
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || 'Failed to sign deal memo');
          setSignDialogOpen(false);
        },
      }
    );
  };

  const handlePrint = () => {
    toast.info("Print / PDF export coming soon");
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !memo) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-sm text-destructive">Failed to load deal memo.</p>
            <Button variant="outline" onClick={() => navigate("/deal-memos")}>
              Back to Deal Memos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const actions = getStatusActions(memo.status, user, memo);
  const rateSource = memo.rateSource || memo.source;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-4xl mx-auto space-y-6"
    >
      {/* Signing confirmation dialog */}
      <Dialog open={signDialogOpen} onOpenChange={setSignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review & Sign Deal Memo</DialogTitle>
            <DialogDescription>
              By signing, you confirm that you have reviewed and agree to the terms of this deal memo,
              including rates, working conditions, and all other provisions outlined above.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            I agree to the terms of this deal memo.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={transitionMutation.isPending}
              onClick={handleSign}
            >
              {transitionMutation.isPending ? "Signing..." : "Sign Deal Memo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/deal-memos")}>
            <ChevronLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {memo.dealNumber || `Deal Memo`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {memo.person?.name && `${memo.person.name} - `}
              {memo.production?.title || memo.production?.name || ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="size-3.5 mr-1.5" />
            Print / PDF
          </Button>
          {actions.map((act) =>
            act.signFlow ? (
              <Button
                key={`${act.action}-sign`}
                variant={act.variant}
                size="sm"
                onClick={() => setSignDialogOpen(true)}
                disabled={transitionMutation.isPending}
              >
                <act.icon className="size-3.5 mr-1.5" />
                {act.label}
              </Button>
            ) : act.confirm ? (
              <ConfirmAction
                key={act.action}
                {...act}
                onConfirm={() => handleAction(act.action)}
                isPending={transitionMutation.isPending}
              />
            ) : (
              <Button
                key={act.action}
                variant={act.variant}
                size="sm"
                onClick={() => handleAction(act.action)}
                disabled={transitionMutation.isPending}
              >
                <act.icon className="size-3.5 mr-1.5" />
                {act.label}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <StatusTimeline currentStatus={memo.status || "draft"} />
        </CardContent>
      </Card>

      {/* Detail sections */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Production */}
          <Section icon={Film} title="Production">
            <DetailField label="Production" value={memo.productionId?.name || memo.production?.name} />
            <DetailField label="Deal Number" value={memo.dealNumber} />
            <DetailField label="Person" value={memo.personId?.fullName || `${memo.personId?.firstName || ''} ${memo.personId?.lastName || ''}`.trim() || memo.person?.name} />
            <DetailField label="Created" value={formatDate(memo.createdAt)} />
          </Section>

          <Separator />

          {/* Classification */}
          <Section icon={Users} title="Classification">
            <DetailField label="Union" value={memo.unionId?.name || memo.unionId?.code || UNION_LABELS[memo.union] || memo.union} />
            <DetailField
              label="Department"
              value={memo.departmentId?.name || memo.department}
              sourceLabel="Rate Card"
              sourceUrl={memo.rateCardSourceUrl || rateSource?.url}
            />
            <DetailField
              label="Designation"
              value={memo.designationId?.name || memo.designation}
              sourceLabel="Rate Card"
              sourceUrl={memo.rateCardSourceUrl || rateSource?.url}
            />
            <DetailField label="Budget Tier" value={memo.budgetTierId?.name || BUDGET_TIER_LABELS[memo.budgetTier] || memo.budgetTier} />
          </Section>

          <Separator />

          {/* Rates */}
          <Section icon={Banknote} title="Rates">
            <DetailField
              label="Weekly Rate"
              value={formatCurrency(memo.weeklyRate)}
              sourceLabel={rateSource?.label || "Rate Engine"}
              sourceUrl={rateSource?.url}
            />
            <DetailField
              label="Daily Rate"
              value={memo.dailyRate ? formatCurrency(memo.dailyRate) : "--"}
              sourceLabel={rateSource?.label}
              sourceUrl={rateSource?.url}
            />
            <DetailField
              label="Hourly Rate"
              value={memo.hourlyRate ? formatCurrency(memo.hourlyRate) : "--"}
              sourceLabel={rateSource?.label}
              sourceUrl={rateSource?.url}
            />
            <DetailField label="Guaranteed Hours" value={(memo.guaranteedHoursPerWeek || memo.guaranteedHours) ? `${memo.guaranteedHoursPerWeek || memo.guaranteedHours} hrs/wk` : "--"} />
          </Section>

          <Separator />

          {/* Fringes */}
          <Section icon={Percent} title="Fringes">
            <DetailField label="Holiday Pay" value={memo.holidayPayPct != null ? `${memo.holidayPayPct}%` : "--"} />
            <DetailField label="Employer NI" value={memo.employerNiPct != null ? `${memo.employerNiPct}%` : "--"} />
            <DetailField label="Pension" value={memo.pensionPct != null ? `${memo.pensionPct}%` : "--"} />
            <DetailField label="Apprenticeship Levy" value={(memo.apprenticeshipLevyPct ?? memo.apprenticeLevyPct) != null ? `${memo.apprenticeshipLevyPct ?? memo.apprenticeLevyPct}%` : "--"} />
            <DetailField
              label="Total Fringe Rate"
              value={`${(
                (memo.holidayPayPct || 0) +
                (memo.employerNiPct || 0) +
                (memo.pensionPct || 0) +
                (memo.apprenticeLevyPct || 0)
              ).toFixed(2)}%`}
            />
          </Section>

          <Separator />

          {/* Overtime & Penalties */}
          <Section icon={Clock} title="Overtime & Penalties">
            <DetailField label="Standard Work Day" value={memo.standardWorkDayHrs ? `${memo.standardWorkDayHrs} hrs` : "--"} />
            <DetailField label="Lunch Break" value={memo.lunchBreakHrs != null ? `${memo.lunchBreakHrs} hrs` : "--"} />
            <DetailField label="6th Day Multiplier" value={memo.sixthDayMultiplier ? `${memo.sixthDayMultiplier}x` : "--"} />
            <DetailField label="7th Day Multiplier" value={memo.seventhDayMultiplier ? `${memo.seventhDayMultiplier}x` : "--"} />
            <DetailField label="Night Premium" value={memo.nightPremiumPct != null ? `${memo.nightPremiumPct}%` : "--"} />
            <DetailField label="Turnaround Minimum" value={memo.turnaroundMinHrs ? `${memo.turnaroundMinHrs} hrs` : "--"} />
            <DetailField
              label="Meal Penalty"
              value={
                (memo.mealPenaltyRate > 0 || memo.mealPenaltyEnabled)
                  ? `${formatCurrency(memo.mealPenaltyRate || memo.mealPenaltyAmount || 0)} after ${memo.mealPenaltyAfterHrs || 6} hrs`
                  : "Disabled"
              }
            />
          </Section>

          <Separator />

          {/* Allowances */}
          <Section icon={Briefcase} title="Allowances">
            <DetailField label="Kit" value={formatCurrency(memo.kitAllowance)} />
            <DetailField label="Travel" value={formatCurrency(memo.travelAllowance)} />
            <DetailField label="Per Diem" value={formatCurrency(memo.perDiem)} />
            <DetailField label="Phone" value={formatCurrency(memo.phoneAllowance)} />
            <DetailField label="Computer" value={formatCurrency(memo.computerAllowance)} />
            <DetailField label="Car" value={formatCurrency(memo.carAllowance)} />
            <DetailField
              label="Total Weekly Allowances"
              value={formatCurrency(
                (memo.kitAllowance || 0) +
                (memo.travelAllowance || 0) +
                (memo.perDiem || 0) +
                (memo.phoneAllowance || 0) +
                (memo.computerAllowance || 0) +
                (memo.carAllowance || 0)
              )}
            />
          </Section>
        </CardContent>
      </Card>

      {/* Negotiation History */}
      {memo.statusHistory && memo.statusHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="size-4 text-primary" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Negotiation History
                </CardTitle>
              </div>
              {/* Edit Rates button for admins when status allows */}
              {isAdmin && ["draft", "negotiating"].includes(memo.status) && (
                <Button variant="outline" size="sm" onClick={openEditRates}>
                  <Edit3 className="size-3.5 mr-1.5" />
                  Edit Rates
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-0">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

              {memo.statusHistory.map((entry, i) => {
                const fromCfg = STATUS_CONFIG[entry.fromStatus] || STATUS_CONFIG.draft;
                const toCfg = STATUS_CONFIG[entry.toStatus] || STATUS_CONFIG.draft;
                const changedByName =
                  entry.changedBy?.firstName && entry.changedBy?.lastName
                    ? `${entry.changedBy.firstName} ${entry.changedBy.lastName}`
                    : entry.changedBy?.email || "System";

                return (
                  <div key={i} className="relative pl-7 pb-5 last:pb-0">
                    {/* Dot */}
                    <div
                      className={cn(
                        "absolute left-0 top-1 size-[15px] rounded-full border-2 border-background",
                        toCfg.color
                      )}
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", fromCfg.textColor)}>
                          {fromCfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground">&rarr;</span>
                        <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", toCfg.textColor)}>
                          {toCfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          by {changedByName}
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          &mdash; {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-sm text-foreground/80 italic pl-1 border-l-2 border-muted-foreground/20 ml-1">
                          &ldquo;{entry.note}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Rates button when no status history exists yet */}
      {(!memo.statusHistory || memo.statusHistory.length === 0) &&
        isAdmin && ["draft", "negotiating"].includes(memo.status) && (
        <Card>
          <CardContent className="pt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="size-4 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No negotiation history yet.</p>
            </div>
            <Button variant="outline" size="sm" onClick={openEditRates}>
              <Edit3 className="size-3.5 mr-1.5" />
              Edit Rates
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Note dialog for Negotiate / Re-send */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{NOTE_DIALOG_CONFIG[noteDialogAction]?.title}</DialogTitle>
            <DialogDescription>
              {NOTE_DIALOG_CONFIG[noteDialogAction]?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Add a note explaining the reason..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={transitionMutation.isPending}
              onClick={submitNoteDialog}
            >
              {transitionMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rates dialog */}
      <Dialog open={editRatesOpen} onOpenChange={setEditRatesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Rates</DialogTitle>
            <DialogDescription>
              Update the compensation rates for this deal memo. Rates must meet union minimums.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-weekly-rate">Weekly Rate</Label>
              <Input
                id="edit-weekly-rate"
                type="number"
                step="0.01"
                min="0"
                value={editRates.weeklyRate}
                onChange={(e) => setEditRates((prev) => ({ ...prev, weeklyRate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-daily-rate">Daily Rate</Label>
              <Input
                id="edit-daily-rate"
                type="number"
                step="0.01"
                min="0"
                value={editRates.dailyRate}
                onChange={(e) => setEditRates((prev) => ({ ...prev, dailyRate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-hourly-rate">Hourly Rate</Label>
              <Input
                id="edit-hourly-rate"
                type="number"
                step="0.01"
                min="0"
                value={editRates.hourlyRate}
                onChange={(e) => setEditRates((prev) => ({ ...prev, hourlyRate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRatesOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={updateMutation.isPending}
              onClick={submitEditRates}
            >
              {updateMutation.isPending ? "Saving..." : "Save Rates"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
