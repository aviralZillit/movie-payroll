import { useMemo } from "react";
import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Users, Briefcase } from "lucide-react";
import {
  getEmploymentStatuses,
  getCrewFields,
} from "@/lib/countryFieldConfig";
import UnionField from "@/components/deal-memo/UnionField";

// ---------------------------------------------------------------------------
// Responsibility badge
// ---------------------------------------------------------------------------
function OwnerBadge({ owner }) {
  if (owner === "production") {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] px-1.5">
        PRODUCTION
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400 text-[10px] px-1.5">
      Crew will complete
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Step 1 - Crew Details + Right to Work
// ---------------------------------------------------------------------------
export default function Step1CrewDetails({ control, errors, setValue, watch, territory = "UK", unionFields, currencySymbol }) {
  const employmentStatus = watch("employmentStatus");

  const statusOptions = useMemo(
    () => getEmploymentStatuses(territory),
    [territory]
  );

  const dynamicFields = useMemo(
    () => getCrewFields(employmentStatus),
    [employmentStatus]
  );

  return (
    <div className="space-y-6">
      {/* Employment Status */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="size-5 text-primary" />
            Employment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="employmentStatus"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5 max-w-sm">
                <Label>Employment Type</Label>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(val) => {
                    field.onChange(val);
                  }}
                >
                  <SelectTrigger className={cn(errors.employmentStatus && "border-destructive")}>
                    <SelectValue placeholder="Select employment type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employmentStatus && (
                  <p className="text-xs text-destructive">{errors.employmentStatus.message}</p>
                )}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Dynamic crew fields based on employment status */}
      {dynamicFields.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-primary" />
              Crew Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {dynamicFields.map((fieldDef) => (
              <Controller
                key={fieldDef.name}
                name={fieldDef.name}
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Label>{fieldDef.label}</Label>
                      <OwnerBadge owner={fieldDef.owner} />
                    </div>
                    <Input
                      type={fieldDef.type || "text"}
                      placeholder={fieldDef.placeholder}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      disabled={fieldDef.owner === "crew"}
                      className={cn(
                        errors[fieldDef.name] && "border-destructive",
                        fieldDef.owner === "crew" && "bg-muted/50"
                      )}
                    />
                    {errors[fieldDef.name] && (
                      <p className="text-xs text-destructive">{errors[fieldDef.name].message}</p>
                    )}
                  </div>
                )}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Right to Work is handled in Step 6 (RTW) with the document checklist */}

      {unionFields?.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Union-Specific Terms</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {unionFields.map((field) => (
              <UnionField
                key={field.key}
                field={field}
                control={control}
                errors={errors}
                currencySymbol={currencySymbol}
                watch={watch}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
