import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/axios";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { getEmploymentRules } from "@/lib/employmentTypeRules";
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
  Shield,
} from "lucide-react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Status config & timeline
// ---------------------------------------------------------------------------
const STATUS_ORDER = ["draft", "issued", "signed", "active", "completed"];
const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-500", textColor: "text-gray-600 dark:text-gray-400" },
  issued: { label: "Issued", color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400" },
  sent: { label: "Sent", color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400" },
  negotiating: { label: "Negotiating", color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400" },
  pending_approval: { label: "Pending Approval", color: "bg-orange-500", textColor: "text-orange-600 dark:text-orange-400" },
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
    actions.push({ action: 'edit', label: 'Edit', icon: PenLine, variant: 'outline', isLink: true });
    actions.push({ action: 'send', label: 'Issue to Crew', icon: Send, variant: 'default' });
    actions.push({ action: 'cancel', label: 'Cancel', icon: XCircle, variant: 'destructive', confirm: true });
  } else if (status === 'issued') {
    // Issued → crew is completing onboarding / RTW / signing
    if (isAdmin) {
      actions.push({ action: 'sign', label: 'Mark Signed', icon: PenLine, variant: 'default' });
      actions.push({ action: 'edit', label: 'Edit', icon: PenLine, variant: 'outline', isLink: true });
      actions.push({ action: 'cancel', label: 'Cancel', icon: XCircle, variant: 'destructive', confirm: true });
    }
    if (isPersonOnDeal) {
      actions.push({ action: 'sign', label: 'Review & Sign', icon: PenLine, variant: 'default', signFlow: true });
    }
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
                  isCurrent && status === "issued" && "ring-blue-500/20",
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
  const queryClient = useQueryClient();
  const { data: memo, isLoading, isError } = useDealMemo(id);
  const isCrew = memo?.personId?._id?.toString() === (user?._id || user?.id)?.toString()
    || memo?.personId?.toString() === (user?._id || user?.id)?.toString();
  const memoCountry = memo?.territory || memo?.country || memo?.productionId?.country || "UK";
  const fmt = (amount) => formatCurrency(amount || 0, memoCountry);
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
    // Edit: navigate to wizard in edit mode
    if (action === "edit") {
      navigate(`/deal-memos/${id}/edit`);
      return;
    }
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
            <DetailField label="Contracting Entity" value={memo.contractingEntityId?.name} />
            <DetailField label="Territory" value={memo.territory || memo.country} />
            <DetailField label="Screen Credit" value={memo.screenCredit} />
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

          {/* Deal Structure — conditionally show fields based on employment type */}
          {(() => {
            const empRules = getEmploymentRules(memo.employmentStatus);
            const empCat = empRules?.category || 'employee';
            const isFlatOrBuyout = ['flat', 'picture', 'per_film', 'flat_fee'].includes(memo.dealType) || memo.rateType === 'buyout' || memo.rateType === 'all_in';
            const showOTFields = empCat === 'employee' && !isFlatOrBuyout;

            return (
              <Section icon={Banknote} title="Deal Structure">
                <DetailField label="Employment Type" value={memo.employmentStatus} />
                <DetailField label="Deal Type" value={memo.dealType} />
                <DetailField label="Rate Type" value={memo.rateType} />
                <DetailField label="Start Date" value={memo.startDate ? formatDate(memo.startDate) : null} />
                <DetailField label="End Date" value={memo.endDate ? formatDate(memo.endDate) : null} />
                <DetailField label="Guaranteed Weeks" value={memo.guaranteedWeeks} />
                <DetailField label="Exclusivity" value={memo.exclusivity} />
                {/* HP Mode — show for employee types only */}
                {empCat === 'employee' && memo.hpMode && (
                  <DetailField label="Holiday Pay Mode" value={memo.hpMode === 'excl' ? 'HP Excluded' : memo.hpMode === 'incl' ? 'HP Included' : 'N/A'} />
                )}
                {/* OT/Night/Meal — only for employee types with non-flat/buyout deals */}
                {showOTFields && (
                  <>
                    <DetailField label="Overtime Applicable" value={memo.overtimeApplicable === false ? 'No' : 'Yes'} />
                    <DetailField label="Night Premium" value={memo.nightPremiumEnabled === false ? 'Disabled' : memo.nightPremiumPct != null ? `${memo.nightPremiumPct}%` : 'Enabled'} />
                    <DetailField label="Meal Penalty" value={memo.mealPenaltyEnabled === false ? 'Disabled' : 'Enabled'} />
                  </>
                )}
                {/* For corporate/self-employed, show a note */}
                {empCat === 'corporate' && (
                  <DetailField label="Payroll Note" value="Ltd/Corporate — no fringes, OT, or penalties apply" />
                )}
                {empCat === 'self_employed' && (
                  <DetailField label="Payroll Note" value="Self-employed — reduced fringes, no OT or penalties" />
                )}
              </Section>
            );
          })()}

          <Separator />

          {/* Rates */}
          <Section icon={Banknote} title="Rates">
            <DetailField
              label="Weekly Rate"
              value={fmt(memo.weeklyRate)}
              sourceLabel={rateSource?.label || "Rate Engine"}
              sourceUrl={rateSource?.url}
            />
            <DetailField
              label="Daily Rate"
              value={memo.dailyRate ? fmt(memo.dailyRate) : "--"}
              sourceLabel={rateSource?.label}
              sourceUrl={rateSource?.url}
            />
            <DetailField
              label="Hourly Rate"
              value={memo.hourlyRate ? fmt(memo.hourlyRate) : "--"}
              sourceLabel={rateSource?.label}
              sourceUrl={rateSource?.url}
            />
            <DetailField label="Guaranteed Hours" value={(memo.guaranteedHoursPerWeek || memo.guaranteedHours) ? `${memo.guaranteedHoursPerWeek || memo.guaranteedHours} hrs/wk` : "--"} />
            {memo.separateRates && (
              <>
                <DetailField label="Prep Day Rate" value={memo.prepRate ? fmt(memo.prepRate) : null} />
                <DetailField label="Shoot Day Rate" value={memo.shootRate ? fmt(memo.shootRate) : null} />
                <DetailField label="Wrap Day Rate" value={memo.wrapRate ? fmt(memo.wrapRate) : null} />
                <DetailField label="Travel Day Rate" value={memo.travelRate ? fmt(memo.travelRate) : null} />
              </>
            )}
          </Section>

          <Separator />

          {/* Fringes — hide for corporate types */}
          {getEmploymentRules(memo.employmentStatus)?.category !== 'corporate' && (
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
          )}

          <Separator />

          {/* Overtime & Penalties — hide for corporate (Ltd, Loan-out) and flat/buyout deals */}
          {(() => {
            const empCat = getEmploymentRules(memo.employmentStatus)?.category;
            const isFlatOrBuyout = ['flat', 'picture', 'per_film', 'flat_fee'].includes(memo.dealType) || memo.rateType === 'buyout' || memo.rateType === 'all_in';
            if (empCat === 'corporate' || isFlatOrBuyout) return null;
            return (
              <Section icon={Clock} title="Overtime & Penalties">
                <DetailField label="Standard Work Day" value={memo.standardWorkDayHrs ? `${memo.standardWorkDayHrs} hrs` : "--"} />
                <DetailField label="Lunch Break" value={memo.lunchBreakHrs != null ? `${memo.lunchBreakHrs} hrs` : "--"} />
                <DetailField label="6th Day Multiplier" value={memo.sixthDayMultiplier ? `${memo.sixthDayMultiplier}x` : "--"} />
                <DetailField label="7th Day Multiplier" value={memo.seventhDayMultiplier ? `${memo.seventhDayMultiplier}x` : "--"} />
                <DetailField label="Night Premium" value={memo.nightPremiumEnabled === false ? "Disabled" : memo.nightPremiumPct != null ? `${memo.nightPremiumPct}%` : "--"} />
                <DetailField label="Turnaround Minimum" value={memo.turnaroundMinHrs ? `${memo.turnaroundMinHrs} hrs` : "--"} />
                <DetailField
                  label="Meal Penalty"
                  value={
                    memo.mealPenaltyEnabled === false ? "Disabled"
                      : (memo.mealPenaltyRate > 0 || memo.mealPenaltyEnabled)
                        ? `${fmt(memo.mealPenaltyRate || memo.mealPenaltyAmount || 0)} after ${memo.mealPenaltyAfterHrs || 6} hrs`
                        : "Disabled"
                  }
                />
              </Section>
            );
          })()}

          <Separator />

          {/* Allowances — v2 array first, v1 flat fields as fallback */}
          <Section icon={Briefcase} title="Allowances">
            {memo.productionFee > 0 && (
              <DetailField
                label="Production Fee"
                value={`${fmt(memo.productionFee)}${memo.productionFeeBasis ? ` (${memo.productionFeeBasis.replace("_", " ")})` : ""}`}
              />
            )}
            {memo.idleDays > 0 && (
              <DetailField
                label="Idle Days"
                value={`${memo.idleDays} days @ ${fmt(memo.idleDayRate)}/day`}
              />
            )}
            {memo.allowances?.length > 0 ? (
              <>
                {memo.allowances.map((a, i) => (
                  <DetailField
                    key={i}
                    label={a.name || `Allowance #${i + 1}`}
                    value={`${fmt(a.amount)} (${(a.frequency || "weekly").replace("_", " ")}${a.taxTreatment === "non_taxable" ? ", non-taxable" : a.taxTreatment === "reimbursement" ? ", reimbursement" : ""})`}
                  />
                ))}
                <DetailField
                  label="Total Weekly Allowances"
                  value={fmt(memo.allowances.reduce((s, a) => s + (Number(a.amount) || 0), 0))}
                />
              </>
            ) : (
              <>
                {(memo.kitAllowance > 0) && <DetailField label="Kit" value={fmt(memo.kitAllowance)} />}
                {(memo.travelAllowance > 0) && <DetailField label="Travel" value={fmt(memo.travelAllowance)} />}
                {(memo.perDiem > 0) && <DetailField label="Per Diem" value={fmt(memo.perDiem)} />}
                {(memo.phoneAllowance > 0) && <DetailField label="Phone" value={fmt(memo.phoneAllowance)} />}
                {(memo.computerAllowance > 0) && <DetailField label="Computer" value={fmt(memo.computerAllowance)} />}
                {(memo.carAllowance > 0) && <DetailField label="Car" value={fmt(memo.carAllowance)} />}
                {(memo.housingAllowance > 0) && <DetailField label="Housing" value={fmt(memo.housingAllowance)} />}
                {memo.customAllowances?.length > 0 && memo.customAllowances.map((ca, i) => (
                  <DetailField
                    key={i}
                    label={ca.name || `Custom #${i + 1}`}
                    value={`${fmt(ca.amount)} (${(ca.period || "weekly").replace("_", " ")})`}
                  />
                ))}
                {(() => {
                  const v1Total = (memo.kitAllowance || 0) + (memo.travelAllowance || 0) + (memo.perDiem || 0) +
                    (memo.phoneAllowance || 0) + (memo.computerAllowance || 0) + (memo.carAllowance || 0) +
                    (memo.housingAllowance || 0) + ((memo.customAllowances || []).reduce((s, c) => s + (c.amount || 0), 0));
                  return v1Total > 0 ? <DetailField label="Total Weekly Allowances" value={fmt(v1Total)} /> : null;
                })()}
              </>
            )}
          </Section>
        </CardContent>
      </Card>

      {/* Right to Work Documents — Admin Review */}
      {memo.rightToWork?.documents?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Right to Work Documents
              </CardTitle>
              <Badge variant="outline" className={cn("ml-auto text-xs",
                memo.rightToWork.status === 'verified' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
              )}>
                {memo.rightToWork.status === 'verified' ? 'Verified' : 'Pending'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {memo.rightToWork.documents.map((doc, idx) => {
                const statusColors = {
                  requested: "text-amber-600 bg-amber-500/10 border-amber-500/30",
                  uploaded: "text-blue-600 bg-blue-500/10 border-blue-500/30",
                  verified: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
                  rejected: "text-red-600 bg-red-500/10 border-red-500/30",
                };
                return (
                  <div key={idx} className={cn("rounded-md border px-3 py-2 space-y-1",
                    doc.status === 'rejected' && "border-red-500/30",
                    doc.status === 'verified' && "border-emerald-500/30",
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{doc.docType}</span>
                        {doc.required && <Badge variant="outline" className="text-[10px]">Required</Badge>}
                        {doc.reference && <span className="text-xs text-muted-foreground">Ref: {doc.reference}</span>}
                      </div>
                      <Badge variant="outline" className={cn("text-xs", statusColors[doc.status])}>
                        {doc.status}
                      </Badge>
                    </div>
                    {doc.uploadedFile && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>📎 {doc.uploadedFile}</span>
                        {doc.fileUrl && (
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Download
                          </a>
                        )}
                      </div>
                    )}
                    {doc.rejectionNote && (
                      <p className="text-xs text-red-500">Rejection: {doc.rejectionNote}</p>
                    )}
                    {/* Admin verify/reject buttons */}
                    {isAdmin && doc.status === 'uploaded' && (
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                          onClick={() => {
                            api.patch(`/deal-memos/${id}/rtw-documents/${idx}/verify`, { status: 'verified' })
                              .then(() => { toast.success(`${doc.docType} verified`); queryClient.invalidateQueries({ queryKey: ['deal-memos'] }); })
                              .catch((err) => toast.error(err?.response?.data?.message || 'Failed'));
                          }}
                        >
                          ✓ Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs text-red-600 border-red-500/30 hover:bg-red-500/10"
                          onClick={() => {
                            const note = prompt('Rejection reason:');
                            if (!note) return;
                            api.patch(`/deal-memos/${id}/rtw-documents/${idx}/verify`, { status: 'rejected', rejectionNote: note })
                              .then(() => { toast.success(`${doc.docType} rejected — crew will be notified`); queryClient.invalidateQueries({ queryKey: ['deal-memos'] }); })
                              .catch((err) => toast.error(err?.response?.data?.message || 'Failed'));
                          }}
                        >
                          ✗ Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signing Documents — Admin View */}
      {memo.signingDocuments?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Signing Documents
              </CardTitle>
              {(() => {
                const reqSig = memo.signingDocuments.filter(d => d.requiresSignature);
                const signed = reqSig.filter(d => d.status === 'signed');
                return (
                  <Badge variant="outline" className={cn("ml-auto text-xs",
                    signed.length === reqSig.length ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                  )}>
                    {signed.length}/{reqSig.length} signed
                  </Badge>
                );
              })()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {memo.signingDocuments.map((doc, idx) => (
                <div key={idx} className={cn(
                  "flex items-center justify-between rounded-md border px-3 py-2",
                  doc.status === 'signed' && "border-emerald-500/30 bg-emerald-500/5"
                )}>
                  <div className="flex items-center gap-3">
                    {doc.status === 'signed' ? (
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    ) : doc.requiresSignature ? (
                      <Clock className="size-4 text-amber-500 shrink-0" />
                    ) : (
                      <Info className="size-4 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{doc.filename}</p>
                      {doc.description && <p className="text-xs text-muted-foreground">{doc.description}</p>}
                      {doc.status === 'signed' && (
                        <p className="text-[10px] text-emerald-600 mt-0.5">
                          ✍️ Signed by {doc.signatureText || 'crew member'}
                          {doc.signedAt && ` on ${new Date(doc.signedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                          {doc.signedIP && ` • IP: ${doc.signedIP}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        Download
                      </a>
                    )}
                    {doc.status === 'signed' ? (
                      <Badge className="bg-emerald-500 text-white text-xs">Signed</Badge>
                    ) : doc.requiresSignature ? (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30">Awaiting signature</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Read-only</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Checklist */}
      {memo.complianceChecklist && memo.complianceChecklist.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Compliance & Onboarding
              </CardTitle>
              <Badge variant="outline" className="ml-auto text-xs">
                {memo.complianceChecklist.filter(c => c.isChecked).length}/{memo.complianceChecklist.length} complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {memo.complianceChecklist.map((item, idx) => {
                const canToggle = isAdmin;
                return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-3 py-2",
                    canToggle && "cursor-pointer hover:bg-muted/30 transition-colors",
                  )}
                  onClick={() => {
                    if (canToggle) {
                      api.patch(`/deal-memos/${id}/compliance/${idx}/toggle`)
                        .then(({ data: resp }) => {
                          toast.success(item.isChecked ? `"${item.name}" unchecked` : `"${item.name}" marked complete`, { duration: 2000 });
                          queryClient.setQueryData(["deal-memos", "detail", id], resp.data);
                        })
                        .catch((err) => toast.error(err?.response?.data?.message || "Failed to update"));
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {item.isChecked ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : canToggle ? (
                      <div className="size-4 rounded-full border-2 border-primary/50 hover:border-primary" />
                    ) : (
                      <div className="size-4 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <span className={cn("text-sm", item.isChecked && "text-muted-foreground line-through")}>{item.name}</span>
                    {canToggle && !item.isChecked && (
                      <span className="text-[10px] text-muted-foreground">(click to complete)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{item.responsibility}</Badge>
                    <Badge variant="outline" className={cn("text-[10px]",
                      item.isChecked ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    )}>
                      {item.isChecked ? "Done" : "Pending"}
                    </Badge>
                  </div>
                </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Crew Onboarding Section (visible to assigned crew member) ── */}
      {isCrew && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Your Onboarding Details
              </CardTitle>
              <Badge variant="outline" className="ml-auto text-xs">
                Fill in your details below
              </Badge>
            </div>
            <CardDescription>
              Complete your tax, bank, and personal details. This information is confidential and only visible to payroll administrators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CrewOnboardingForm dealMemoId={id} memo={memo} territory={memo.territory || memo.country || 'UK'} employmentStatus={memo.employmentStatus} />
          </CardContent>
        </Card>
      )}

      {/* ── Crew Document Signing (visible to assigned crew member) ── */}
      {isCrew && memo.signingDocuments?.some(d => d.requiresSignature && d.status !== 'signed') && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Documents to Sign
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {memo.signingDocuments.filter(d => d.requiresSignature && d.status !== 'signed').map((doc, idx) => {
                const actualIdx = memo.signingDocuments.indexOf(doc);
                return (
                  <div key={actualIdx} className="rounded-md border px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{doc.filename}</p>
                      {doc.fileUrl && (
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          Download & Review
                        </a>
                      )}
                    </div>
                    {doc.description && <p className="text-xs text-muted-foreground">{doc.description}</p>}
                    <CrewSignButton dealMemoId={id} docIndex={actualIdx} docName={doc.filename} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Crew RTW Upload (visible to assigned crew member) ── */}
      {isCrew && memo.rightToWork?.documents?.some(d => d.status === 'requested' || d.status === 'rejected') && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Right to Work — Upload Documents
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {memo.rightToWork.documents.filter(d => d.status === 'requested' || d.status === 'rejected').map((doc, idx) => {
                const actualIdx = memo.rightToWork.documents.indexOf(doc);
                return (
                  <div key={actualIdx} className="rounded-md border px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{doc.docType}</p>
                      <Badge variant="outline" className={cn("text-xs", doc.status === 'rejected' ? "text-red-600 border-red-500/30" : "text-amber-600 border-amber-500/30")}>
                        {doc.status === 'rejected' ? 'Rejected — re-upload' : 'Upload Required'}
                      </Badge>
                    </div>
                    {doc.rejectionNote && <p className="text-xs text-red-500">{doc.rejectionNote}</p>}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="text-xs"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                          await api.post(`/deal-memos/${id}/rtw-documents/${actualIdx}/upload`, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                          });
                          toast.success(`${doc.docType} uploaded successfully`);
                          queryClient.invalidateQueries({ queryKey: ['deal-memos'] });
                        } catch (err) {
                          toast.error(err?.response?.data?.message || 'Upload failed');
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Approval Status Timeline ── */}
      {memo.approvalStatus?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Approval Status
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {memo.approvalStatus.map((step, idx) => (
                <div key={idx} className={cn("flex items-center justify-between rounded-md border px-3 py-2",
                  step.status === 'approved' && "border-emerald-500/30 bg-emerald-500/5",
                  step.status === 'rejected' && "border-red-500/30 bg-red-500/5",
                )}>
                  <div>
                    <p className="text-sm font-medium">Step {step.step + 1}: {step.label || step.approverRole}</p>
                    {step.approvedAt && <p className="text-xs text-muted-foreground">{formatDate(step.approvedAt)}</p>}
                    {step.note && <p className="text-xs text-muted-foreground">{step.note}</p>}
                  </div>
                  <Badge variant="outline" className={cn("text-xs",
                    step.status === 'approved' ? "bg-emerald-500/10 text-emerald-600" :
                    step.status === 'rejected' ? "bg-red-500/10 text-red-600" :
                    "bg-amber-500/10 text-amber-600"
                  )}>
                    {step.status}
                  </Badge>
                </div>
              ))}
            </div>
            {/* Approve/Reject buttons for the current approver */}
            {isAdmin && memo.status === 'pending_approval' && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={async () => {
                  try {
                    await api.patch(`/deal-memos/${id}/approve`, { action: 'approve' });
                    toast.success('Deal memo approved');
                    queryClient.invalidateQueries({ queryKey: ['deal-memos'] });
                  } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
                }}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={async () => {
                  const note = prompt('Rejection reason:');
                  if (!note) return;
                  try {
                    await api.patch(`/deal-memos/${id}/approve`, { action: 'reject', note });
                    toast.success('Deal memo rejected');
                    queryClient.invalidateQueries({ queryKey: ['deal-memos'] });
                  } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
                }}>
                  Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Counter-Signatures */}
      {(memo.counterSignatures?.length > 0 || isAdmin) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Counter-Signatures
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {memo.counterSignatures?.length > 0 && (
              <div className="space-y-2 mb-3">
                {memo.counterSignatures.map((cs, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{cs.signatureText}</p>
                      <p className="text-xs text-muted-foreground">
                        {cs.signedAt && formatDate(cs.signedAt)}
                        {cs.note && ` — ${cs.note}`}
                      </p>
                    </div>
                    <Badge className="bg-emerald-500 text-white text-xs">Signed</Badge>
                  </div>
                ))}
              </div>
            )}
            {isAdmin && ['issued', 'active', 'signed'].includes(memo.status) && (
              <Button size="sm" variant="outline" onClick={async () => {
                const name = prompt('Enter your full name to counter-sign:');
                if (!name?.trim()) return;
                const note = prompt('Add a note (optional):') || '';
                try {
                  await api.post(`/deal-memos/${id}/countersign`, { signatureText: name.trim(), note });
                  toast.success('Counter-signature recorded');
                  queryClient.invalidateQueries({ queryKey: ['deal-memos'] });
                } catch (err) { toast.error(err?.response?.data?.message || 'Failed'); }
              }}>
                Add Counter-Signature
              </Button>
            )}
          </CardContent>
        </Card>
      )}

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

// ── Crew Onboarding Form (inline in DealMemoDetail) ─────────────────
function CrewOnboardingForm({ dealMemoId, memo, territory, employmentStatus }) {
  const queryClient = useQueryClient();
  const [fields, setFields] = useState(() => {
    const initial = {};
    const fieldDefs = getCrewFieldsForTerritory(territory, employmentStatus);
    fieldDefs.forEach((f) => { initial[f.name] = memo?.[f.name] || ""; });
    return initial;
  });
  const [saving, setSaving] = useState(false);

  const fieldDefs = getCrewFieldsForTerritory(territory, employmentStatus);
  const requiredKeys = new Set((memo?.crewRequiredFields || []).map(f => f.fieldKey));
  const requiredCount = requiredKeys.size;
  const completedCount = [...requiredKeys].filter(k => fields[k] && fields[k].trim() !== "").length;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/deal-memos/${dealMemoId}/crew-complete`, fields);
      toast.success("Details saved successfully");
      queryClient.invalidateQueries({ queryKey: ["deal-memos"] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    }
    setSaving(false);
  };

  if (fieldDefs.length === 0) return <p className="text-sm text-muted-foreground">No onboarding fields required for this territory.</p>;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      {requiredCount > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedCount}/{requiredCount} required fields completed</span>
            {completedCount === requiredCount && <span className="text-emerald-500 font-medium">All complete</span>}
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", completedCount === requiredCount ? "bg-emerald-500" : "bg-primary")}
              style={{ width: `${requiredCount > 0 ? (completedCount / requiredCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {fieldDefs.map((f) => {
          const isRequired = requiredKeys.has(f.name);
          return (
            <div key={f.name} className="space-y-1">
              <Label className="text-sm">
                {f.label}
                {isRequired && <span className="text-destructive ml-0.5">*</span>}
              </Label>
              <Input
                type={f.type || "text"}
                placeholder={f.placeholder || ""}
                value={fields[f.name] || ""}
                onChange={(e) => setFields((prev) => ({ ...prev, [f.name]: e.target.value }))}
                className={cn("h-9", isRequired && !fields[f.name] && "border-amber-500/50")}
              />
            </div>
          );
        })}
      </div>
      <Button size="sm" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Details"}
      </Button>
    </div>
  );
}

// Helper: get crew fields for territory + employment status
function getCrewFieldsForTerritory(territory, employmentStatus) {
  // Import from countryFieldConfig would be ideal, but inline for now
  const FIELD_MAP = {
    paye: [
      { name: "niNumber", label: "NI Number", placeholder: "AB 12 34 56 C" },
      { name: "taxCode", label: "Tax Code", placeholder: "1257L" },
      { name: "bankSortCode", label: "Sort Code", placeholder: "00-00-00" },
      { name: "bankAccountNumber", label: "Account Number", placeholder: "12345678" },
    ],
    ltd: [
      { name: "ltdCompanyName", label: "Company Name", placeholder: "Company Ltd" },
      { name: "ltdCompanyReg", label: "Company Reg Number", placeholder: "12345678" },
      { name: "vatNumber", label: "VAT Number", placeholder: "GB 123 4567 89" },
    ],
    sole_trader: [
      { name: "niNumber", label: "NI Number", placeholder: "AB 12 34 56 C" },
      { name: "utrNumber", label: "UTR Number", placeholder: "1234567890" },
    ],
    w2: [
      { name: "ssn", label: "SSN", placeholder: "XXX-XX-XXXX" },
      { name: "achRoutingNumber", label: "ACH Routing", placeholder: "123456789" },
      { name: "achAccountNumber", label: "ACH Account", placeholder: "1234567890" },
    ],
    loanout: [
      { name: "corpName", label: "Corp Name", placeholder: "My Corp Inc" },
      { name: "corpEin", label: "Corp EIN", placeholder: "12-3456789" },
    ],
    "1099": [
      { name: "ssn", label: "SSN / ITIN", placeholder: "XXX-XX-XXXX" },
    ],
  };

  const common = [
    { name: "dateOfBirth", label: "Date of Birth", type: "date" },
    { name: "crewAddress", label: "Address", placeholder: "Full postal address" },
    { name: "emergencyContact", label: "Emergency Contact", placeholder: "Name + phone" },
  ];

  return [...(FIELD_MAP[employmentStatus] || []), ...common];
}

// ── Crew Sign Button ─────────────────────────────────────────────────
function CrewSignButton({ dealMemoId, docIndex, docName }) {
  const queryClient = useQueryClient();
  const [signatureText, setSignatureText] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [open, setOpen] = useState(false);
  const [signing, setSigning] = useState(false);

  const handleSign = async () => {
    if (!signatureText.trim() || !agreed) return;
    setSigning(true);
    try {
      await api.post(`/deal-memos/${dealMemoId}/documents/${docIndex}/sign`, {
        signatureText: signatureText.trim(),
        signatureMethod: "typed",
        agreed: true,
      });
      toast.success(`"${docName}" signed successfully`);
      queryClient.invalidateQueries({ queryKey: ["deal-memos"] });
      setOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to sign");
    }
    setSigning(false);
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Sign Document
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign: {docName}</DialogTitle>
            <DialogDescription>Type your full name to electronically sign this document.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Your Full Name</Label>
              <Input
                placeholder="Type your full legal name"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                className="text-lg"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="rounded" />
              I confirm I have read and agree to the terms of this document
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSign} disabled={!signatureText.trim() || !agreed || signing}>
              {signing ? "Signing..." : "Sign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
