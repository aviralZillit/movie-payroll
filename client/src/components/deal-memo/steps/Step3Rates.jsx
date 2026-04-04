import { useEffect, useMemo } from "react";
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
import { Banknote, Calculator, Clock, Info, CheckCircle2, AlertTriangle, ExternalLink, Shield } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useTerritoryRule } from "@/hooks/useTerritories";
import { useVerifyRate } from "@/hooks/useRatesBible";

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
  unionKey,
  designationName,
  budgetTierName,
  fringeSummary,
}) {
  const rateBasis = watch("rateBasis");
  const rateAmount = watch("rateAmount");
  const weeklyRate = watch("weeklyRate");
  const dailyRate = watch("dailyRate");
  const hourlyRate = watch("hourlyRate");
  const hpMode = watch("hpMode");

  // Fetch territory rule for OT table
  const { data: territoryRule } = useTerritoryRule(territory, unionKey);

  // Rate verification
  const verifyRate = useVerifyRate();
  useEffect(() => {
    if (weeklyRate && weeklyRate > 0 && territory && designationName) {
      verifyRate.mutate({
        territoryCode: territory,
        grade: designationName,
        budgetTier: budgetTierName,
        proposedWeeklyRate: weeklyRate,
      });
    }
  }, [weeklyRate, territory, designationName, budgetTierName]);

  // Build OT rows from territory rule
  const otRows = useMemo(() => {
    if (!territoryRule) return [];
    const rows = [];
    const hr = hourlyRate || 0;
    rows.push({ code: 'BASIC', desc: territoryRule.basicDescription || `${territoryRule.basicHrs}hrs`, trigger: 'Standard day', mult: '×1.0', rate: `${currencySymbol}${hr.toFixed(2)}/hr` });
    if (territoryRule.ot1Multiplier) rows.push({ code: 'OT1', desc: territoryRule.ot1Description || `×${territoryRule.ot1Multiplier}`, trigger: territoryRule.ot1Trigger || 'After standard day', mult: `×${territoryRule.ot1Multiplier}`, rate: `${currencySymbol}${(hr * territoryRule.ot1Multiplier).toFixed(2)}/hr` });
    if (territoryRule.ot2Multiplier) rows.push({ code: 'OT2', desc: territoryRule.ot2Description || `×${territoryRule.ot2Multiplier}`, trigger: territoryRule.ot2Trigger || 'After OT1', mult: `×${territoryRule.ot2Multiplier}`, rate: `${currencySymbol}${(hr * territoryRule.ot2Multiplier).toFixed(2)}/hr` });
    if (territoryRule.goldenTimeMultiplier) rows.push({ code: 'GOLDEN', desc: territoryRule.goldenTimeDescription || 'Golden Time', trigger: `After ${territoryRule.goldenTimeAfterHours}hrs`, mult: `×${territoryRule.goldenTimeMultiplier}`, rate: `${currencySymbol}${(hr * territoryRule.goldenTimeMultiplier).toFixed(2)}/hr`, highlight: true });
    if (territoryRule.sixthDayMultiplier) rows.push({ code: '6TH', desc: territoryRule.sixthDayDescription || '6th Day', trigger: '6th consecutive day', mult: `×${territoryRule.sixthDayMultiplier}`, rate: `${currencySymbol}${(hr * territoryRule.sixthDayMultiplier).toFixed(2)}/hr` });
    if (territoryRule.seventhDayMultiplier) rows.push({ code: '7TH', desc: territoryRule.seventhDayDescription || '7th Day', trigger: '7th consecutive day', mult: `×${territoryRule.seventhDayMultiplier}`, rate: `${currencySymbol}${(hr * territoryRule.seventhDayMultiplier).toFixed(2)}/hr` });
    if (territoryRule.otRateCap) rows.push({ code: 'CAP', desc: `OT Rate Cap`, trigger: 'Maximum OT hourly rate', mult: 'MAX', rate: `${currencySymbol}${territoryRule.otRateCap.toFixed(2)}/hr`, highlight: true });
    return rows;
  }, [territoryRule, hourlyRate, currencySymbol]);

  // Auto-derive rates from primary rate
  useEffect(() => {
    if (!rateAmount || !rateBasis) return;
    const amount = Number(rateAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Use precise rounding to avoid floating point drift (e.g., 34999.98 instead of 35000)
    const r2 = (n) => Number(n.toFixed(2));

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
                    {field.value ? (
                      <span>{RATE_TYPE_OPTIONS.find(o => o.value === field.value)?.label || field.value}</span>
                    ) : (
                      <SelectValue placeholder="Select type..." />
                    )}
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

      {/* OT Table — from territory rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="size-5 text-primary" />
            Overtime & Day Premiums
            {territoryRule && (
              <Badge variant="outline" className="text-[10px] ml-2">{territoryRule.badge || territoryRule.unionKey}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {otRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left py-2 px-2 font-medium w-16">Code</th>
                    <th className="text-left py-2 px-2 font-medium">Description</th>
                    <th className="text-left py-2 px-2 font-medium">Trigger</th>
                    <th className="text-right py-2 px-2 font-medium w-16">Mult.</th>
                    <th className="text-right py-2 px-2 font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {otRows.map((row) => (
                    <tr key={row.code} className={cn(
                      "border-b border-border/30",
                      row.highlight && "bg-amber-500/5"
                    )}>
                      <td className="py-2 px-2">
                        <Badge variant={row.highlight ? "default" : "secondary"} className="text-[10px]">{row.code}</Badge>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">{row.desc}</td>
                      <td className="py-2 px-2 text-xs text-muted-foreground">{row.trigger}</td>
                      <td className="py-2 px-2 text-right font-mono font-medium">{row.mult}</td>
                      <td className="py-2 px-2 text-right font-mono tabular-nums">{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {territoryRule?.mealPenaltyAmounts?.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground border-t pt-2">
                  <AlertTriangle className="size-3.5 text-amber-500" />
                  <span>Meal penalty: {territoryRule.mealPenaltyAmounts.map(a => `${currencySymbol}${a}`).join(' → ')} per violation{territoryRule.mealPaidStatus === 'non-deductible' ? ' (non-deductible meals — clock keeps running)' : ''}</span>
                </div>
              )}
              {territoryRule?.turnaroundMinHrs && (
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="size-3.5 text-blue-500" />
                  <span>Turnaround: {territoryRule.turnaroundMinHrs}hrs minimum rest ({territoryRule.turnaroundDescription || 'wrap to call'})</span>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <Clock className="size-8 mx-auto mb-2 opacity-40" />
              {unionKey ? 'Loading territory rules...' : 'Select a union to see OT rules'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rate Comparison Bar — from Rates Bible */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Banknote className="size-4" />
            Rate Compliance Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verifyRate.data ? (
            <div className="space-y-3">
              {verifyRate.data.isIndividuallyNegotiated ? (
                <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 px-4 py-3">
                  <Badge className="bg-purple-500 text-white text-xs">Ind. Neg.</Badge>
                  <span className="text-sm text-purple-300">Individually negotiated — no minimum rate applies for this role</span>
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
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Minimum: {currencySymbol}{verifyRate.data.minimum?.toLocaleString()}/wk</span>
                      <span>Offered: {currencySymbol}{weeklyRate?.toLocaleString()}/wk</span>
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
                      <p className="text-xs text-red-500 mt-1">{currencySymbol}{Math.abs(verifyRate.data.difference).toLocaleString()} below minimum — requires justification</p>
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
          ) : weeklyRate > 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Checking rate compliance...
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Enter a rate to check against union minimums
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
