import { useEffect } from "react";
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
import { Banknote, Calculator, Clock, Info } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const RATE_BASIS_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
  { value: "hourly", label: "Hourly" },
  { value: "flat", label: "Flat" },
];

const RATE_TYPE_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "all_in", label: "All-In" },
  { value: "scale", label: "Scale" },
  { value: "above_scale", label: "Above Scale" },
  { value: "negotiated", label: "Negotiated" },
];

const HP_MODE_OPTIONS = [
  { value: "excl", label: "HP Excluded" },
  { value: "incl", label: "HP Included" },
  { value: "na", label: "N/A" },
];

// ---------------------------------------------------------------------------
// Currency input helper
// ---------------------------------------------------------------------------
function CurrencyInput({ label, value, onChange, currencySymbol = "\u00A3", error, disabled, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {currencySymbol}
        </span>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          disabled={disabled}
          className={cn("pl-7 tabular-nums", error && "border-destructive")}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 - Rates
// ---------------------------------------------------------------------------
export default function Step3Rates({
  control,
  errors,
  setValue,
  watch,
  currencySymbol = "\u00A3",
  territory = "UK",
  fringeSummary,
}) {
  const rateBasis = watch("rateBasis");
  const rateAmount = watch("rateAmount");
  const weeklyRate = watch("weeklyRate");
  const dailyRate = watch("dailyRate");
  const hourlyRate = watch("hourlyRate");
  const hpMode = watch("hpMode");

  // Auto-derive rates from primary rate
  useEffect(() => {
    if (!rateAmount || !rateBasis) return;
    const amount = Number(rateAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (rateBasis === "weekly") {
      setValue("weeklyRate", amount, { shouldDirty: true });
      setValue("dailyRate", Math.round((amount / 5) * 100) / 100, { shouldDirty: true });
      setValue("hourlyRate", Math.round((amount / 50) * 100) / 100, { shouldDirty: true });
    } else if (rateBasis === "daily") {
      setValue("dailyRate", amount, { shouldDirty: true });
      setValue("weeklyRate", Math.round(amount * 5 * 100) / 100, { shouldDirty: true });
      setValue("hourlyRate", Math.round((amount / 10) * 100) / 100, { shouldDirty: true });
    } else if (rateBasis === "hourly") {
      setValue("hourlyRate", amount, { shouldDirty: true });
      setValue("dailyRate", Math.round(amount * 10 * 100) / 100, { shouldDirty: true });
      setValue("weeklyRate", Math.round(amount * 50 * 100) / 100, { shouldDirty: true });
    }
  }, [rateAmount, rateBasis, setValue]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Banknote className="size-5 text-primary" />
            Rate Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Controller
            name="rateBasis"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Rate Basis</Label>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className={cn(errors.rateBasis && "border-destructive")}>
                    <SelectValue placeholder="Select basis..." />
                  </SelectTrigger>
                  <SelectContent>
                    {RATE_BASIS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rateBasis && (
                  <p className="text-xs text-destructive">{errors.rateBasis.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="rateAmount"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Rate Amount"
                value={field.value}
                onChange={field.onChange}
                currencySymbol={currencySymbol}
                error={errors.rateAmount?.message}
              />
            )}
          />

          <Controller
            name="rateType"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Rate Type</Label>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {RATE_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          {/* Holiday Pay mode - UK only */}
          {territory === "UK" && (
            <Controller
              name="hpMode"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label>Holiday Pay Mode</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="size-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        Whether holiday pay is included in or excluded from the quoted rate
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select HP mode..." />
                    </SelectTrigger>
                    <SelectContent>
                      {HP_MODE_OPTIONS.map((opt) => (
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

      {/* Derived rates */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="size-5 text-primary" />
            Derived Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Controller
            name="weeklyRate"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Weekly Rate"
                value={field.value}
                onChange={field.onChange}
                currencySymbol={currencySymbol}
                error={errors.weeklyRate?.message}
                disabled={rateBasis === "weekly"}
              />
            )}
          />
          <Controller
            name="dailyRate"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Daily Rate"
                value={field.value}
                onChange={field.onChange}
                currencySymbol={currencySymbol}
                disabled={rateBasis === "daily"}
              />
            )}
          />
          <Controller
            name="hourlyRate"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Hourly Rate"
                value={field.value}
                onChange={field.onChange}
                currencySymbol={currencySymbol}
                disabled={rateBasis === "hourly"}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Fringe summary - read-only */}
      {fringeSummary && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="size-4" />
              Fringe Summary (Territory Rule)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
              {fringeSummary.map((item) => (
                <div key={item.label} className="flex justify-between rounded-md bg-muted/50 px-3 py-2">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* OT table placeholder */}
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          <Clock className="size-8 mx-auto mb-2 opacity-40" />
          Overtime table will be auto-populated from territory rules
        </CardContent>
      </Card>

      {/* Rate comparison bar placeholder */}
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          <Banknote className="size-8 mx-auto mb-2 opacity-40" />
          Rate comparison bar will display union minimum vs. offered rate
        </CardContent>
      </Card>
    </div>
  );
}
