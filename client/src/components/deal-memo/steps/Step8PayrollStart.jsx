import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Building, CalendarClock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PAY_FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "semi_monthly", label: "Semi-Monthly" },
];

// ---------------------------------------------------------------------------
// Outstanding field status
// ---------------------------------------------------------------------------
function FieldStatus({ label, completed }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-sm">{label}</span>
      {completed ? (
        <Badge variant="outline" className="gap-1 text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400">
          <CheckCircle2 className="size-3" />
          Complete
        </Badge>
      ) : (
        <Badge variant="outline" className="gap-1 text-xs bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400">
          <XCircle className="size-3" />
          Missing
        </Badge>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 8 - Payroll Start
// ---------------------------------------------------------------------------
export default function Step8PayrollStart({
  control,
  errors,
  watch,
  bureaus = [],
  bureausLoading,
  outstandingFields = [],
}) {
  const completedCount = outstandingFields.filter((f) => f.completed).length;
  const totalCount = outstandingFields.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="size-5 text-primary" />
            Payroll Bureau
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="bureauId"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Bureau</Label>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className={cn(errors.bureauId && "border-destructive")}>
                    <SelectValue placeholder={bureausLoading ? "Loading..." : "Select bureau..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {(bureaus ?? []).map((b) => (
                      <SelectItem key={b._id} value={b._id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bureauId && (
                  <p className="text-xs text-destructive">{errors.bureauId.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="payFrequency"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Pay Frequency</Label>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className={cn(errors.payFrequency && "border-destructive")}>
                    <SelectValue placeholder="Select frequency..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PAY_FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.payFrequency && (
                  <p className="text-xs text-destructive">{errors.payFrequency.message}</p>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock className="size-5 text-primary" />
              Outstanding Fields
            </CardTitle>
            {totalCount > 0 && (
              <div className="flex items-center gap-1.5">
                <AlertCircle className={cn(
                  "size-4",
                  completedCount === totalCount ? "text-emerald-500" : "text-amber-500"
                )} />
                <span className="text-sm text-muted-foreground tabular-nums">
                  {completedCount} / {totalCount} complete
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {outstandingFields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              All required fields will be checked before payroll can start.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {outstandingFields.map((field) => (
                <FieldStatus
                  key={field.name}
                  label={field.label}
                  completed={field.completed}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
