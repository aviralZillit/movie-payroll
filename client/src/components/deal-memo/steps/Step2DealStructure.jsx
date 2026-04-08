import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarDays, Briefcase, Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import UnionField from "@/components/deal-memo/UnionField";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DEAL_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "flat", label: "Flat / Run of Show" },
  { value: "picture", label: "Per Picture" },
  { value: "step", label: "Step Deal" },
];

const EXCLUSIVITY_OPTIONS = [
  { value: "full", label: "Exclusive" },
  { value: "first_call", label: "First Call" },
  { value: "none", label: "Non-Exclusive" },
];

// ---------------------------------------------------------------------------
// Step 2 - Deal Structure
// ---------------------------------------------------------------------------
export default function Step2DealStructure({ control, errors, watch, setValue, currencySymbol = "£", unionFields, country }) {
  const separateRates = watch("separateRates");
  const weeklyRate = watch("weeklyRate");
  const dailyRate = watch("dailyRate");

  // Auto-populate prep/shoot/wrap/travel rates when toggle turns ON
  useEffect(() => {
    if (!separateRates || !setValue) return;
    const daily = Number(dailyRate) || (Number(weeklyRate) / 5) || 0;
    if (daily <= 0) return;
    const r2 = (n) => Math.round(n * 100) / 100;
    // Derive from daily rate — only set if currently empty
    const prepRate = watch("prepRate");
    const shootRate = watch("shootRate");
    const wrapRate = watch("wrapRate");
    const travelRate = watch("travelRate");
    if (!prepRate) setValue("prepRate", r2(daily), { shouldDirty: true });
    if (!shootRate) setValue("shootRate", r2(daily), { shouldDirty: true });
    if (!wrapRate) setValue("wrapRate", r2(daily), { shouldDirty: true });
    // Travel rate: no standard — BECTU pays 1T (one hour) minimum, but productions often negotiate more
    // Default to 0 so user must enter the negotiated amount
    if (!travelRate) setValue("travelRate", 0, { shouldDirty: true });
  }, [separateRates]); // Only runs when toggle changes

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="size-5 text-primary" />
            Deal Type
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="dealType"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Deal Type</Label>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className={cn(errors.dealType && "border-destructive")}>
                    {field.value ? (
                      <span>{DEAL_TYPES.find(o => o.value === field.value)?.label || field.value}</span>
                    ) : (
                      <SelectValue placeholder="Select deal type..." />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_TYPES.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dealType && (
                  <p className="text-xs text-destructive">{errors.dealType.message}</p>
                )}
              </div>
            )}
          />

          {country === 'US' && (
            <Controller
              name="exclusivity"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Exclusivity</Label>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      {field.value ? (
                        <span>{EXCLUSIVITY_OPTIONS.find(o => o.value === field.value)?.label || field.value}</span>
                      ) : (
                        <SelectValue placeholder="Select exclusivity..." />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {EXCLUSIVITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="size-5 text-primary" />
            Dates & Duration
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  className={cn(errors.startDate && "border-destructive")}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </div>
            )}
          />

          <p className="text-xs text-muted-foreground sm:col-span-2">
            Prep, shoot, wrap & travel periods are defined in the production schedule and applied automatically during payroll.
          </p>
        </CardContent>
      </Card>

      {/* Separate rates toggle */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="size-5 text-primary" />
            Rate Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Controller
            name="separateRates"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
                <Label className="cursor-pointer">Different rates for prep / shoot / wrap</Label>
                <span className="text-xs text-muted-foreground">
                  Enable to set separate day rates for each production period
                </span>
              </div>
            )}
          />

          {separateRates && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
              <Controller
                name="prepRate"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label>Prep Day Rate</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                        className="pl-7 tabular-nums"
                      />
                    </div>
                  </div>
                )}
              />
              <Controller
                name="shootRate"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label>Shoot Day Rate</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                        className="pl-7 tabular-nums"
                      />
                    </div>
                  </div>
                )}
              />
              <Controller
                name="wrapRate"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label>Wrap Day Rate</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                        className="pl-7 tabular-nums"
                      />
                    </div>
                  </div>
                )}
              />
              <Controller
                name="travelRate"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label>Travel Day Rate</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="size-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          Enter the agreed travel day rate. Productions typically negotiate half-day or full-day rate depending on travel duration.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                        className="pl-7 tabular-nums"
                      />
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

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
