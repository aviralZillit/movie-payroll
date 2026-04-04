import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ShieldCheck, CheckCircle2, AlertTriangle, Clock, XCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Status badge helper
// ---------------------------------------------------------------------------
const STATUS_CONFIG = {
  ok: {
    label: "OK",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
  },
  warn: {
    label: "Warning",
    icon: AlertTriangle,
    className: "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400",
  },
  required: {
    label: "Required",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400",
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 text-xs", config.className)}>
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Responsibility badge
// ---------------------------------------------------------------------------
function ResponsibilityBadge({ owner }) {
  if (owner === "production") {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] px-1.5">
        PRODUCTION
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400 text-[10px] px-1.5">
      CREW
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Step 6 - Compliance
// ---------------------------------------------------------------------------
// Territory-based compliance data (mirrors server complianceService.js)
const COMPLIANCE_DATA = {
  UK: {
    checks: [
      { id: 'ir35', label: 'IR35 Status', status: 'pending', description: 'IR35 determination required for Ltd/PSC contractors' },
      { id: 'rtw', label: 'Right to Work', status: 'required', description: 'RTW check must be completed before first day of work' },
      { id: 'wtr', label: 'Working Time Regs', status: 'ok', description: 'WTR opt-out signed, 48-hour week limit waived' },
      { id: 'gdpr', label: 'GDPR & Data', status: 'ok', description: 'Privacy notice issued, data processing agreement in place' },
    ],
    onboarding: [
      { label: 'Right to Work check completed', owner: 'production', required: true },
      { label: 'P45 from previous employer received', owner: 'crew', required: false },
      { label: 'NI Number provided', owner: 'crew', required: true },
      { label: 'Tax code provided or starter declaration', owner: 'crew', required: true },
      { label: 'Bank details provided (sort code + account)', owner: 'crew', required: true },
      { label: 'Emergency contact details', owner: 'crew', required: false },
      { label: 'NDA signed', owner: 'production', required: true },
      { label: 'Anti-Harassment & Bullying policy signed', owner: 'production', required: true },
      { label: 'Health & Safety policy signed', owner: 'production', required: true },
      { label: 'GDPR Data Protection notice issued', owner: 'production', required: false },
    ],
  },
  US: {
    checks: [
      { id: 'i9', label: 'Work Authorization (I-9)', status: 'required', description: 'I-9 must be completed within 3 days of hire' },
      { id: 'union', label: 'Union Membership', status: 'pending', description: 'Union card number verified. Taft-Hartley waiver if non-member.' },
      { id: 'tax', label: 'Federal & State Tax', status: 'pending', description: 'W-4 federal withholding form and state withholding required' },
      { id: 'hw', label: 'Health & Welfare', status: 'ok', description: 'H&W qualifying hours tracking enabled' },
    ],
    onboarding: [
      { label: 'I-9 Work Authorization completed', owner: 'production', required: true },
      { label: 'W-4 Federal Withholding form', owner: 'crew', required: true },
      { label: 'State withholding form', owner: 'crew', required: true },
      { label: 'SSN provided', owner: 'crew', required: true },
      { label: 'Union card number verified', owner: 'production', required: true },
      { label: 'ACH routing + account number', owner: 'crew', required: true },
      { label: 'NDA signed', owner: 'production', required: true },
    ],
  },
  CA: {
    checks: [
      { id: 'sin', label: 'Work Authorization / SIN', status: 'required', description: 'SIN required for all Canadian workers' },
      { id: 'union', label: 'Union Membership', status: 'pending', description: 'Union card required for covered positions' },
      { id: 'tax', label: 'Canadian Tax / TD1', status: 'pending', description: 'TD1 Federal and Provincial forms required' },
      { id: 'pipeda', label: 'PIPEDA Compliance', status: 'ok', description: 'Privacy policy compliant' },
    ],
    onboarding: [
      { label: 'SIN provided', owner: 'crew', required: true },
      { label: 'TD1 Federal form', owner: 'crew', required: true },
      { label: 'TD1 Provincial form', owner: 'crew', required: true },
      { label: 'Bank transit/institution/account', owner: 'crew', required: true },
      { label: 'Union card number', owner: 'production', required: true },
    ],
  },
  AU: {
    checks: [
      { id: 'tfn', label: 'Tax File Number', status: 'required', description: 'TFN must be provided within 28 days' },
      { id: 'fairwork', label: 'Fair Work Act', status: 'ok', description: 'Modern Award compliance confirmed' },
      { id: 'super', label: 'Superannuation', status: 'required', description: 'Super fund choice form required. Quarterly contributions due.' },
      { id: 'privacy', label: 'Privacy Act', status: 'ok', description: 'Privacy policy compliant' },
    ],
    onboarding: [
      { label: 'Tax File Number provided', owner: 'crew', required: true },
      { label: 'Super fund choice form completed', owner: 'crew', required: true },
      { label: 'BSB + Account number', owner: 'crew', required: true },
    ],
  },
};

export default function Step6Compliance({
  control,
  errors,
  watch,
  territory = 'UK',
  complianceChecks: propChecks,
  onboardingItems: propItems,
}) {
  // Use props if provided, otherwise generate from territory
  const data = COMPLIANCE_DATA[territory] || COMPLIANCE_DATA.UK;
  const complianceChecks = propChecks?.length > 0 ? propChecks : data.checks;
  const onboardingItems = propItems?.length > 0 ? propItems : data.onboarding;
  return (
    <div className="space-y-6">
      {/* Compliance cards */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="size-5 text-primary" />
            Compliance Checks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {complianceChecks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Compliance checks will be generated based on territory and employment type.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {complianceChecks.map((check) => (
                <div
                  key={check.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3",
                    check.status === "required" && "border-red-500/30 bg-red-500/5",
                    check.status === "warn" && "border-orange-500/30 bg-orange-500/5"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate">{check.label}</span>
                      <StatusBadge status={check.status} />
                    </div>
                    {check.description && (
                      <p className="text-xs text-muted-foreground">{check.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboarding checklist */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="size-5 text-primary" />
            Onboarding Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          {onboardingItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Onboarding items will be generated based on territory and deal type.
            </p>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Done</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-28">Responsibility</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {onboardingItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        {item.owner === "production" ? (
                          <Controller
                            name={`onboarding.${idx}.completed`}
                            control={control}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value ?? false}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className="size-4 rounded border-muted-foreground/30 accent-primary"
                              />
                            )}
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={item.completed ?? false}
                            disabled
                            className="size-4 rounded opacity-50"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{item.label}</TableCell>
                      <TableCell>
                        <ResponsibilityBadge owner={item.owner} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.completed ? "ok" : "pending"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
