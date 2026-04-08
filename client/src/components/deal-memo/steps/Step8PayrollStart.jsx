import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Building, Users } from "lucide-react";
import { getBureauOptions } from "@/lib/countryFieldConfig";

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
// Step 8 - Payroll Start
// ---------------------------------------------------------------------------
export default function Step8PayrollStart({
  control,
  errors,
  watch,
  territory = "UK",
}) {
  const bureaus = getBureauOptions(territory);

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
                    <SelectValue placeholder="Select bureau..." />
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

      {/* Responsibility Assignments */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5 text-primary" />
            Responsibility Assignments
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Who manages approvals, payroll processing, and department oversight for this deal.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="productionAccountant"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Production Accountant</Label>
                <Input
                  placeholder="e.g. David Chen"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </div>
            )}
          />

          <Controller
            name="payrollAdmin"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Payroll Admin</Label>
                <Input
                  placeholder="e.g. Sarah Mitchell"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </div>
            )}
          />

          <Controller
            name="hodApprover"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>HOD / Approver</Label>
                <Input
                  placeholder="e.g. Emma Thompson"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </div>
            )}
          />

          <Controller
            name="timecardApprover"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Timecard Approver</Label>
                <Input
                  placeholder="e.g. Michael Brooks"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </div>
            )}
          />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Crew onboarding requirements and payroll readiness are tracked separately in the Crew Portal and Payroll page.
      </p>
    </div>
  );
}
