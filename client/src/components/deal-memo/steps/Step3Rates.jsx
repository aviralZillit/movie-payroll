import { useEffect, useMemo } from "react";
// useMemo needed for lowestDailyRate calculation
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
import { Banknote, Clock, Info, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useTerritoryRule } from "@/hooks/useTerritories";
import { useVerifyRate } from "@/hooks/useRatesBible";
import UnionField from "@/components/deal-memo/UnionField";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const RATE_BASIS_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
  { value: "hourly", label: "Hourly" },
  { value: "flat", label: "Flat" },
];

// UK rate types (BECTU/PACT/Equity terminology)
const UK_RATE_TYPE_OPTIONS = [
  { value: "basic", label: "Basic Rate" },
  { value: "all_in", label: "All-In" },
  { value: "buyout", label: "Buyout" },
  { value: "negotiated", label: "Negotiated" },
];

// US rate types (SAG-AFTRA/DGA/IATSE terminology)
const US_RATE_TYPE_OPTIONS = [
  { value: "scale", label: "Scale" },
  { value: "scale_plus_10", label: "Scale + 10%" },
  { value: "scale_plus_15", label: "Scale + 15%" },
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
function CurrencyInput({ label, value, onChange, currencySymbol = "£", error, disabled, className }) {
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
// Step 3 - Rates (Simplified)
// ---------------------------------------------------------------------------
export default function Step3Rates({
  control,
  errors,
  setValue,
  watch,
  currencySymbol = "£",
  territory = "UK",
  unionKey,
  designationName,
  budgetTierName,
  fringeSummary,
  unionFields,
}) {
  const rateTypeOptions = territory === 'US' ? US_RATE_TYPE_OPTIONS : UK_RATE_TYPE_OPTIONS;
  const rateBasis = watch("rateBasis");
  const rateAmount = watch("rateAmount");
  const weeklyRate = watch("weeklyRate");
  const dailyRate = watch("dailyRate");
  const separateRates = watch("separateRates");
  const prepRate = watch("prepRate");
  const shootRate = watch("shootRate");
  const wrapRate = watch("wrapRate");

  // Fetch territory rule (still used internally for fringes)
  const { data: territoryRule } = useTerritoryRule(territory, unionKey);

  // Rate verification — single rate mode
  const verifyRate = useVerifyRate();
  useEffect(() => {
    if (!separateRates && weeklyRate && weeklyRate > 0 && territory) {
      verifyRate.mutate({
        territoryCode: territory,
        grade: designationName,
        budgetTier: budgetTierName,
        proposedWeeklyRate: weeklyRate,
      });
    }
  }, [weeklyRate, territory, designationName, budgetTierName, separateRates]);

  // Rate verification — separate rates mode: check the LOWEST rate (worst case)
  const verifySeparateRate = useVerifyRate();
  const lowestDailyRate = useMemo(() => {
    if (!separateRates) return 0;
    const rates = [prepRate, shootRate, wrapRate].filter(r => r > 0);
    return rates.length > 0 ? Math.min(...rates) : 0;
  }, [separateRates, prepRate, shootRate, wrapRate]);

  useEffect(() => {
    if (separateRates && lowestDailyRate > 0 && territory && designationName) {
      verifySeparateRate.mutate({
        territoryCode: territory,
        grade: designationName,
        budgetTier: budgetTierName,
        proposedWeeklyRate: lowestDailyRate * 5,
      });
    }
  }, [lowestDailyRate, territory, designationName, budgetTierName, separateRates]);

  // Auto-derive rates from primary rate (keep internal calc for payroll engine)
  useEffect(() => {
    if (!rateAmount || !rateBasis) return;
    const amount = Number(rateAmount);
    if (isNaN(amount) || amount <= 0) return;

    const r2 = (n) => Math.round(n * 100) / 100;

    if (rateBasis === "weekly") {
      setValue("weeklyRate", amount, { shouldDirty: true });
      setValue("dailyRate", r2(amount / 5), { shouldDirty: true });
      setValue("hourlyRate", r2(amount / 50), { shouldDirty: true });
    } else if (rateBasis === "daily") {
      setValue("dailyRate", amount, { shouldDirty: true });
      setValue("weeklyRate", r2(amount * 5), { shouldDirty: true });
      setValue("hourlyRate", r2(amount / 10), { shouldDirty: true });
    } else if (rateBasis === "hourly") {
      setValue("hourlyRate", amount, { shouldDirty: true });
      setValue("dailyRate", r2(amount * 10), { shouldDirty: true });
      setValue("weeklyRate", r2(amount * 50), { shouldDirty: true });
    }
  }, [rateAmount, rateBasis, setValue]);

  // Auto-set union-specific rate fields from derived rates
  const hourlyRate = watch("hourlyRate");
  useEffect(() => {
    if (hourlyRate > 0) setValue("unionFields.overtimeRateHourly", hourlyRate, { shouldDirty: true });
    if (hourlyRate > 0) setValue("unionFields.hourlyRate", hourlyRate, { shouldDirty: true });
    if (dailyRate > 0) setValue("unionFields.dailyRate", dailyRate, { shouldDirty: true });
    if (weeklyRate > 0) setValue("unionFields.weeklyRate", weeklyRate, { shouldDirty: true });
  }, [hourlyRate, dailyRate, weeklyRate, setValue]);

  // Get OT cap from territory rule (read-only, not editable)
  const otRateCap = territoryRule?.otRateCap || null;

  return (
    <div className="space-y-6">
      {/* Rate Configuration */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Banknote className="size-5 text-primary" />
            Rate Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Controller
              name="rateBasis"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Rate Basis</Label>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger className={cn(errors.rateBasis && "border-destructive")}>
                      {field.value ? (
                        <span>{RATE_BASIS_OPTIONS.find(o => o.value === field.value)?.label || field.value}</span>
                      ) : (
                        <SelectValue placeholder="Select basis..." />
                      )}
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

            {!separateRates && (
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
            )}

            <Controller
              name="rateType"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Rate Type</Label>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      {field.value ? (
                        <span>{rateTypeOptions.find(o => o.value === field.value)?.label || field.value}</span>
                      ) : (
                        <SelectValue placeholder="Select type..." />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {rateTypeOptions.map((opt) => (
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
                        {field.value ? (
                          <span>{HP_MODE_OPTIONS.find(o => o.value === field.value)?.label || field.value}</span>
                        ) : (
                          <SelectValue placeholder="Select HP mode..." />
                        )}
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
          </div>

          {/* Derived rates — compact read-only line (no hourly shown) */}
          {rateAmount > 0 && rateBasis && !separateRates && (
            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground border-t">
              {rateBasis !== "weekly" && weeklyRate > 0 && (
                <span>Weekly: <strong className="text-foreground">{currencySymbol}{Number(weeklyRate).toLocaleString()}</strong></span>
              )}
              {rateBasis !== "daily" && dailyRate > 0 && (
                <span>Daily: <strong className="text-foreground">{currencySymbol}{Number(dailyRate).toLocaleString()}</strong></span>
              )}
            </div>
          )}

          {/* Separate prep/shoot/wrap rates (from Step 2 toggle) */}
          {separateRates && (
            <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t">
              <Controller
                name="prepRate"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    label="Prep Rate"
                    value={field.value}
                    onChange={field.onChange}
                    currencySymbol={currencySymbol}
                  />
                )}
              />
              <Controller
                name="shootRate"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    label="Shoot Rate"
                    value={field.value}
                    onChange={field.onChange}
                    currencySymbol={currencySymbol}
                  />
                )}
              />
              <Controller
                name="wrapRate"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    label="Wrap Rate"
                    value={field.value}
                    onChange={field.onChange}
                    currencySymbol={currencySymbol}
                  />
                )}
              />
            </div>
          )}
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

      {/* Rate Compliance Check — from Rates Bible */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Banknote className="size-4" />
            Rate Compliance Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {separateRates ? (
            // Separate rate compliance — check the lowest rate
            <div className="space-y-3">
              {lowestDailyRate > 0 ? (
                <>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                    <span>Rates entered:</span>
                    {prepRate > 0 && <Badge variant="outline">Prep: {currencySymbol}{prepRate}/day</Badge>}
                    {shootRate > 0 && <Badge variant="outline">Shoot: {currencySymbol}{shootRate}/day</Badge>}
                    {wrapRate > 0 && <Badge variant="outline">Wrap: {currencySymbol}{wrapRate}/day</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Checking lowest rate ({currencySymbol}{lowestDailyRate}/day = {currencySymbol}{(lowestDailyRate * 5).toLocaleString()}/wk) against union minimum:
                  </div>
                  <ComplianceSingle verifyRate={verifySeparateRate} weeklyRate={lowestDailyRate * 5} currencySymbol={currencySymbol} />
                </>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Enter prep, shoot, or wrap rates to check compliance
                </div>
              )}
            </div>
          ) : (
            // Single rate compliance
            <ComplianceSingle verifyRate={verifyRate} weeklyRate={weeklyRate} currencySymbol={currencySymbol} />
          )}
        </CardContent>
      </Card>

      {/* OT Cap from territory rule */}
      {otRateCap && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Overtime Rules</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {otRateCap && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  Max OT Rate Cap
                  <Tooltip>
                    <TooltipTrigger><Info className="size-3.5 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      Union-mandated cap on hourly OT rate. From {territoryRule?.badge || territoryRule?.unionKey || 'territory rule'}. OT hours above this cap are still paid, but capped at this rate.
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="flex items-center h-9 px-3 rounded-md border bg-muted/50 text-sm font-medium tabular-nums">
                  {currencySymbol}{otRateCap.toFixed(2)}/hr
                  <Badge variant="outline" className="ml-2 text-[10px]">From union agreement</Badge>
                </div>
                {hourlyRate > otRateCap && (
                  <div className="flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs">
                    <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                    <span className="text-amber-600 dark:text-amber-400">
                      Hourly rate ({currencySymbol}{Number(hourlyRate).toFixed(2)}) exceeds OT cap ({currencySymbol}{otRateCap.toFixed(2)}).
                      OT will be calculated at the capped rate of {currencySymbol}{otRateCap.toFixed(2)}/hr.
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compliance display for a single rate (used in non-separate mode)
// ---------------------------------------------------------------------------
function ComplianceSingle({ verifyRate, weeklyRate, currencySymbol }) {
  const cs = currencySymbol;
  if (verifyRate.data) {
    return (
      <div className="space-y-3">
        {verifyRate.data.isIndividuallyNegotiated ? (
          <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 px-4 py-3">
            <Badge className="bg-purple-500 text-white text-xs">Ind. Neg.</Badge>
            <span className="text-sm text-purple-300">Individually negotiated — no minimum rate applies</span>
          </div>
        ) : verifyRate.data.minimum ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {verifyRate.data.isCompliant ? (
                  <CheckCircle2 className="size-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="size-5 text-red-500" />
                )}
                <span className={cn("text-sm font-medium", verifyRate.data.isCompliant ? "text-emerald-400" : "text-red-400")}>
                  {verifyRate.data.isCompliant ? 'Rate meets union minimum' : 'Below union minimum'}
                </span>
              </div>
              {verifyRate.data.source && (
                <a href={verifyRate.data.pdfUrl || verifyRate.data.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink className="size-3" />
                  View source
                </a>
              )}
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Minimum: {cs}{verifyRate.data.minimum?.toLocaleString()}/wk</span>
                <span>Offered: {cs}{weeklyRate?.toLocaleString()}/wk</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", verifyRate.data.isCompliant ? "bg-emerald-500" : "bg-red-500")}
                  style={{ width: `${Math.min(100, ((weeklyRate || 0) / (verifyRate.data.minimum || 1)) * 100)}%` }}
                />
              </div>
              {verifyRate.data.percentAboveMinimum != null && verifyRate.data.isCompliant && (
                <p className="text-xs text-emerald-500 mt-1">+{verifyRate.data.percentAboveMinimum}% above minimum</p>
              )}
              {!verifyRate.data.isCompliant && verifyRate.data.difference != null && (
                <p className="text-xs text-red-500 mt-1">{cs}{Math.abs(verifyRate.data.difference).toLocaleString()} below minimum — requires justification</p>
              )}
            </div>
            {verifyRate.data.agreementName && (
              <p className="text-xs text-muted-foreground">Source: {verifyRate.data.agreementName}</p>
            )}
          </>
        ) : verifyRate.data.warning ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="size-4" />
            <span>{verifyRate.data.warning}</span>
          </div>
        ) : null}
      </div>
    );
  }
  if (weeklyRate > 0) {
    return <div className="py-4 text-center text-sm text-muted-foreground">Checking rate compliance...</div>;
  }
  return <div className="py-4 text-center text-sm text-muted-foreground">Enter a rate to check against union minimums</div>;
}

