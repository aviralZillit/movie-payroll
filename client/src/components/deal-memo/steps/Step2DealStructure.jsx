import { useEffect, useMemo, useRef } from "react";
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
import { CalendarDays, Briefcase, Info, DollarSign, AlertTriangle, Clock, CheckCircle2, XCircle, Banknote } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useVerifyRate } from "@/hooks/useRatesBible";
import { useTerritoryRule } from "@/hooks/useTerritories";
import { computeCascadedDefaults } from "@/lib/cascadingDefaults";
import { getEmploymentRules } from "@/lib/employmentTypeRules";

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

const RATE_TYPES_UK = [
  { value: "basic", label: "Basic Rate" },
  { value: "all_in", label: "All-In" },
  { value: "buyout", label: "Buyout" },
  { value: "negotiated", label: "Negotiated" },
];

const RATE_TYPES_US = [
  { value: "scale", label: "Scale" },
  { value: "scale_plus_10", label: "Scale + 10%" },
  { value: "scale_plus_15", label: "Scale + 15%" },
  { value: "negotiated", label: "Negotiated" },
  { value: "buyout", label: "Buyout" },
];

const HP_MODE_OPTIONS = [
  { value: "excl", label: "HP Excluded" },
  { value: "incl", label: "HP Included" },
  { value: "na", label: "N/A" },
];

// ---------------------------------------------------------------------------
// Currency input helper
// ---------------------------------------------------------------------------
function CurrencyInput({ label, value, onChange, currencySymbol = "£", error, placeholder = "0.00", helpText }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label>{label}</Label>
        {helpText && (
          <Tooltip>
            <TooltipTrigger><Info className="size-3.5 text-muted-foreground" /></TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">{helpText}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {currencySymbol}
        </span>
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          className={cn("pl-7 tabular-nums", error && "border-destructive")}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 - Deal & Rates (combined)
// ---------------------------------------------------------------------------
export default function Step2DealStructure({ control, errors, watch, setValue, currencySymbol = "£", country, fringeSummary, territory, unionKey, designationName, budgetTierName, rateSource }) {
  const dealType = watch("dealType");
  const rateType = watch("rateType");
  const separateRates = watch("separateRates");
  const weeklyRate = watch("weeklyRate");
  const dailyRate = watch("dailyRate");
  const hourlyRate = watch("hourlyRate");

  const isFlatDeal = ["flat", "picture", "step"].includes(dealType);
  const isBuyout = rateType === "buyout" || rateType === "all_in";
  const empRulesForRateType = getEmploymentRules(employmentStatus);
  const empCategoryForRate = empRulesForRateType?.category || 'employee';

  // Filter rate type options based on employment type
  const allRateTypeOptions = country === "US" ? RATE_TYPES_US : RATE_TYPES_UK;
  const rateTypeOptions = empCategoryForRate === 'employee'
    ? allRateTypeOptions
    : allRateTypeOptions.filter(o => ['negotiated', 'buyout'].includes(o.value));

  // Territory rule for OT rate cap
  const { data: territoryRule } = useTerritoryRule(territory || country, unionKey);
  const otRateCap = territoryRule?.otRateCap || null;
  const employmentStatus = watch("employmentStatus");

  // ── Cascading auto-fill: territory + employment + dealType + rateType ──
  const prevCascadeRef = useRef(null);
  useEffect(() => {
    if (!setValue || !country) return;
    const empCategory = getEmploymentRules(employmentStatus)?.category || 'employee';
    const newDefaults = computeCascadedDefaults(country, empCategory, dealType, rateType);

    // On first run, apply all defaults for empty fields
    // On subsequent runs, force-apply only the fields that CHANGED
    const prev = prevCascadeRef.current;
    if (!prev) {
      // First run: fill only empty fields
      Object.entries(newDefaults).forEach(([key, value]) => {
        const current = watch(key);
        if (current === undefined || current === null || current === '' || current === 0) {
          setValue(key, value, { shouldDirty: false });
        }
      });
    } else {
      // Subsequent runs: force-apply fields that changed due to trigger
      Object.entries(newDefaults).forEach(([key, value]) => {
        if (prev[key] !== value) {
          setValue(key, value, { shouldDirty: true });
        }
      });
    }
    prevCascadeRef.current = newDefaults;
  }, [country, dealType, rateType, employmentStatus]);

  // Derive rateBasis from dealType (no separate dropdown)
  useEffect(() => {
    if (!dealType || !setValue) return;
    const basisMap = { daily: "daily", weekly: "weekly", flat: "flat", picture: "flat", step: "flat" };
    setValue("rateBasis", basisMap[dealType] || "weekly", { shouldDirty: false });
  }, [dealType, setValue]);

  // Auto-derive rates when primary rate changes
  useEffect(() => {
    if (!setValue) return;
    if (isFlatDeal) return; // flat deals don't derive
    const w = Number(weeklyRate) || 0;
    const d = Number(dailyRate) || 0;
    const h = Number(hourlyRate) || 0;
    const r2 = (n) => Math.round(n * 100) / 100;

    if (dealType === "weekly" && w > 0) {
      if (!d) setValue("dailyRate", r2(w / 5), { shouldDirty: true });
      if (!h) setValue("hourlyRate", r2(w / 50), { shouldDirty: true });
    } else if (dealType === "daily" && d > 0) {
      if (!w) setValue("weeklyRate", r2(d * 5), { shouldDirty: true });
      if (!h) setValue("hourlyRate", r2(d / 10), { shouldDirty: true });
    }
  }, [weeklyRate, dailyRate, hourlyRate, dealType, isFlatDeal, setValue]);

  // Auto-populate separate rates when toggle turns ON
  useEffect(() => {
    if (!separateRates || !setValue) return;
    const daily = Number(dailyRate) || (Number(weeklyRate) / 5) || 0;
    if (daily <= 0) return;
    const r2 = (n) => Math.round(n * 100) / 100;
    const prepRate = watch("prepRate");
    const shootRate = watch("shootRate");
    const wrapRate = watch("wrapRate");
    if (!prepRate) setValue("prepRate", r2(daily), { shouldDirty: true });
    if (!shootRate) setValue("shootRate", r2(daily), { shouldDirty: true });
    if (!wrapRate) setValue("wrapRate", r2(daily), { shouldDirty: true });
  }, [separateRates]);

  return (
    <div className="space-y-6">
      {/* Deal Type + Exclusivity */}
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
                <Label>Deal Type <span className="text-destructive">*</span></Label>
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

      {/* Dates & Duration */}
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
                <Input type="date" value={field.value ?? ""} onChange={field.onChange} />
              </div>
            )}
          />
          {isFlatDeal && (
            <Controller
              name="guaranteedWeeks"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Length of Engagement (weeks)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 12"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  />
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Rates — inline, driven by deal type */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="size-5 text-primary" />
            Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Rate Type */}
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
                        <SelectValue placeholder="Select rate type..." />
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

            {/* HP Mode — UK only */}
            {(country === "UK" || country === "IE") && (
              <Controller
                name="hpMode"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label>Holiday Pay</Label>
                    <Select value={field.value ?? "excl"} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <span>{HP_MODE_OPTIONS.find(o => o.value === field.value)?.label || "HP Excluded"}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {HP_MODE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            )}

            {/* OT Applicable toggle */}
            <Controller
              name="overtimeApplicable"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={isBuyout ? false : (field.value ?? true)}
                    onCheckedChange={field.onChange}
                    disabled={isBuyout}
                  />
                  <div>
                    <Label className="cursor-pointer">Overtime Applicable</Label>
                    {isBuyout && (
                      <p className="text-xs text-amber-500">Disabled — {rateType === 'all_in' ? 'all-in rate' : 'buyout rate'} includes all hours</p>
                    )}
                  </div>
                </div>
              )}
            />
          </div>

          {/* Rate amounts — different layout for flat vs rate-based */}
          {isFlatDeal ? (
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <Controller
                name="weeklyRate"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    label="Total Fee"
                    value={field.value}
                    onChange={field.onChange}
                    currencySymbol={currencySymbol}
                    error={errors.weeklyRate?.message}
                    helpText="The total flat fee for the engagement"
                  />
                )}
              />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3 pt-2">
                <Controller
                  name={dealType === "daily" ? "dailyRate" : "weeklyRate"}
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      label={dealType === "daily" ? "Daily Rate" : "Weekly Rate"}
                      value={field.value}
                      onChange={field.onChange}
                      currencySymbol={currencySymbol}
                      error={errors[dealType === "daily" ? "dailyRate" : "weeklyRate"]?.message}
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
                      helpText={dealType === "weekly" ? "Auto-derived from weekly ÷ 5" : undefined}
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
                      helpText="Used for OT calculations"
                    />
                  )}
                />
              </div>

              {/* Derived rates summary */}
              {Number(weeklyRate) > 0 && (
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Weekly: <strong className="text-foreground">{currencySymbol}{Number(weeklyRate).toLocaleString()}</strong></span>
                  {Number(dailyRate) > 0 && (
                    <span>Daily: <strong className="text-foreground">{currencySymbol}{Number(dailyRate).toLocaleString()}</strong></span>
                  )}
                  {Number(hourlyRate) > 0 && (
                    <span>Hourly: <strong className="text-foreground">{currencySymbol}{Number(hourlyRate).toFixed(2)}</strong></span>
                  )}
                </div>
              )}
            </>
          )}

          {/* Separate rates toggle — non-flat deals only */}
          {!isFlatDeal && (
            <>
              <Controller
                name="separateRates"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-3 pt-2">
                    <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                    <Label className="cursor-pointer">Different rates for prep / shoot / wrap</Label>
                  </div>
                )}
              />

              {separateRates && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
                  {[
                    { name: "prepRate", label: "Prep Day Rate" },
                    { name: "shootRate", label: "Shoot Day Rate" },
                    { name: "wrapRate", label: "Wrap Day Rate" },
                    { name: "travelRate", label: "Travel Day Rate" },
                  ].map((item) => (
                    <Controller
                      key={item.name}
                      name={item.name}
                      control={control}
                      render={({ field }) => (
                        <CurrencyInput
                          label={item.label}
                          value={field.value}
                          onChange={field.onChange}
                          currencySymbol={currencySymbol}
                          helpText={item.name === "travelRate" ? "Enter agreed travel day rate" : undefined}
                        />
                      )}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Buyout indicator */}
          {isBuyout && (
            <div className="flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-sm">
              <AlertTriangle className="size-4 text-amber-500 shrink-0" />
              <span className="text-amber-600 dark:text-amber-400">
                {rateType === 'all_in' ? 'All-In deal' : 'Buyout deal'} — overtime and day premiums will not be calculated
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editable Fringes — only for employee types (PAYE, W-2, etc.) */}
      {(() => {
        const empRules = getEmploymentRules(employmentStatus);
        if (empRules?.category === 'corporate') return null; // Ltd, Loan-out — no fringes
        const isReduced = empRules?.category === 'self_employed'; // Sole trader — reduced
        const territoryCode = country || 'UK';
        const isUK = ['UK', 'IE'].includes(territoryCode);
        const isUS = territoryCode === 'US';
        const isAU = territoryCode === 'AU';

        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <DollarSign className="size-4" />
                Fringes & Employer On-Costs
                {isReduced && <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">Reduced — self-employed</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Holiday Pay — UK/IE/FR only */}
                {(isUK || territoryCode === 'FR') && (
                  <Controller
                    name="holidayPayPct"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label className="text-xs">Holiday Pay %</Label>
                        <Input type="number" step="0.01" min="0" className="h-8 text-sm tabular-nums"
                          value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} />
                      </div>
                    )}
                  />
                )}
                {/* Employer NIC — employees only (not self-employed) */}
                {!isReduced && (isUK || territoryCode === 'DE' || territoryCode === 'FR' || territoryCode === 'ES') && (
                  <Controller
                    name="employerNiPct"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label className="text-xs">{isUK ? 'Employer NIC %' : 'Social Contributions %'}</Label>
                        <Input type="number" step="0.01" min="0" className="h-8 text-sm tabular-nums"
                          value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} />
                      </div>
                    )}
                  />
                )}
                {/* Pension — employees only */}
                {!isReduced && (
                  <Controller
                    name="pensionPct"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label className="text-xs">{isAU ? 'Superannuation %' : isUS ? 'Union P&H %' : 'Pension %'}</Label>
                        <Input type="number" step="0.01" min="0" className="h-8 text-sm tabular-nums"
                          value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} />
                      </div>
                    )}
                  />
                )}
                {/* Apprenticeship Levy — UK employees only */}
                {isUK && !isReduced && (
                  <Controller
                    name="apprenticeshipLevyPct"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label className="text-xs">Apprenticeship Levy %</Label>
                        <Input type="number" step="0.01" min="0" className="h-8 text-sm tabular-nums"
                          value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} />
                      </div>
                    )}
                  />
                )}
                {/* FICA — US employees only */}
                {isUS && !isReduced && (
                  <Controller
                    name="employerNiPct"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label className="text-xs">FICA (Employer) %</Label>
                        <Input type="number" step="0.01" min="0" className="h-8 text-sm tabular-nums"
                          value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} />
                      </div>
                    )}
                  />
                )}
                {/* Workers Comp — US/AU employees */}
                {(isUS || isAU) && !isReduced && (
                  <Controller
                    name="workersCompPct"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Label className="text-xs">Workers Comp %</Label>
                        <Input type="number" step="0.01" min="0" className="h-8 text-sm tabular-nums"
                          value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} />
                      </div>
                    )}
                  />
                )}
                {/* H&W per hour — US union crew */}
                {isUS && (
                  <Controller
                    name="hwPerHour"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput label="H&W Per Hour" value={field.value} onChange={field.onChange} currencySymbol={currencySymbol} />
                    )}
                  />
                )}
              </div>
              {empRules?.category === 'self_employed' && (
                <p className="text-xs text-amber-600 mt-2">Self-employed: only statutory entitlements apply. No employer NIC or pension.</p>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Fringe Summary — read-only from territory rule */}
      {fringeSummary && fringeSummary.length > 0 && (
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

      {/* Rate Compliance Check — uses lowest rate when separate rates enabled */}
      {(() => {
        const prepRate = Number(watch("prepRate")) || 0;
        const shootRate = Number(watch("shootRate")) || 0;
        const wrapRate = Number(watch("wrapRate")) || 0;
        const rates = [prepRate, shootRate, wrapRate].filter(r => r > 0);
        const lowestDaily = separateRates && rates.length > 0 ? Math.min(...rates) : 0;
        const complianceWeekly = separateRates && lowestDaily > 0 ? lowestDaily * 5 : Number(weeklyRate);
        const complianceLabel = separateRates && lowestDaily > 0
          ? `Checking lowest rate (${currencySymbol}${lowestDaily}/day = ${currencySymbol}${(lowestDaily * 5).toLocaleString()}/wk)`
          : null;

        return complianceWeekly > 0 ? (
          <RateComplianceCard
            territory={territory || country}
            unionKey={unionKey}
            designationName={designationName}
            budgetTierName={budgetTierName}
            weeklyRate={complianceWeekly}
            currencySymbol={currencySymbol}
            subtitle={complianceLabel}
            separateRateBadges={separateRates ? { prep: prepRate, shoot: shootRate, wrap: wrapRate } : null}
          />
        ) : null;
      })()}

      {/* OT Rate Cap from territory rule */}
      {otRateCap && !isFlatDeal && !isBuyout && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="size-4" />
              Overtime Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                Max OT Rate Cap
                <Tooltip>
                  <TooltipTrigger><Info className="size-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    Union-mandated cap on hourly OT rate. From {territoryRule?.badge || territoryRule?.unionKey || "territory rule"}. OT hours above this cap are still paid, but capped at this rate.
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="flex items-center h-9 px-3 rounded-md border bg-muted/50 text-sm font-medium tabular-nums">
                {currencySymbol}{otRateCap.toFixed(2)}/hr
                <Badge variant="outline" className="ml-2 text-[10px]">From union agreement</Badge>
              </div>
              {Number(hourlyRate) > otRateCap && (
                <div className="flex items-center gap-2 rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs">
                  <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                  <span className="text-amber-600 dark:text-amber-400">
                    Hourly rate ({currencySymbol}{Number(hourlyRate).toFixed(2)}) exceeds OT cap ({currencySymbol}{otRateCap.toFixed(2)}).
                    OT will be calculated at the capped rate of {currencySymbol}{otRateCap.toFixed(2)}/hr.
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Rate Compliance Check (full version with progress bar) ───────────
function RateComplianceCard({ territory, unionKey, designationName, budgetTierName, weeklyRate, currencySymbol, subtitle, separateRateBadges }) {
  const verifyRate = useVerifyRate();
  const cs = currencySymbol;

  useEffect(() => {
    if (weeklyRate > 0 && territory && designationName) {
      verifyRate.mutate({
        territoryCode: territory,
        unionKey,
        grade: designationName,
        budgetTier: budgetTierName,
        proposedWeeklyRate: weeklyRate,
      });
    }
  }, [weeklyRate, territory, designationName, budgetTierName]);

  const data = verifyRate.data;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Banknote className="size-4" />
          Rate Compliance Check
        </CardTitle>
      </CardHeader>
      <CardContent>
        {separateRateBadges && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <span>Rates entered:</span>
            {separateRateBadges.prep > 0 && <Badge variant="outline">Prep: {currencySymbol}{separateRateBadges.prep}/day</Badge>}
            {separateRateBadges.shoot > 0 && <Badge variant="outline">Shoot: {currencySymbol}{separateRateBadges.shoot}/day</Badge>}
            {separateRateBadges.wrap > 0 && <Badge variant="outline">Wrap: {currencySymbol}{separateRateBadges.wrap}/day</Badge>}
          </div>
        )}
        {subtitle && <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>}
        {data ? (
          <div className="space-y-3">
            {data.isIndividuallyNegotiated ? (
              <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 px-4 py-3">
                <Badge className="bg-purple-500 text-white text-xs">Ind. Neg.</Badge>
                <span className="text-sm text-purple-400">Individually negotiated — no minimum rate applies</span>
              </div>
            ) : data.minimum ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {data.isCompliant ? (
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="size-5 text-red-500" />
                    )}
                    <span className={cn("text-sm font-medium", data.isCompliant ? "text-emerald-400" : "text-red-400")}>
                      {data.isCompliant ? "Rate meets union minimum" : "Below union minimum"}
                    </span>
                  </div>
                  {data.source && (
                    <a href={data.pdfUrl || data.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                      View source
                    </a>
                  )}
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Minimum: {cs}{data.minimum?.toLocaleString()}/wk</span>
                    <span>Offered: {cs}{weeklyRate?.toLocaleString()}/wk</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", data.isCompliant ? "bg-emerald-500" : "bg-red-500")}
                      style={{ width: `${Math.min(100, ((weeklyRate || 0) / (data.minimum || 1)) * 100)}%` }}
                    />
                  </div>
                  {data.percentAboveMinimum != null && data.isCompliant && (
                    <p className="text-xs text-emerald-500 mt-1">+{data.percentAboveMinimum}% above minimum</p>
                  )}
                  {!data.isCompliant && data.difference != null && (
                    <p className="text-xs text-red-500 mt-1">{cs}{Math.abs(data.difference).toLocaleString()} below minimum — requires justification</p>
                  )}
                </div>
                {data.agreementName && (
                  <p className="text-xs text-muted-foreground">Source: {data.agreementName}</p>
                )}
              </>
            ) : data.warning ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="size-4" />
                <span>{data.warning}</span>
              </div>
            ) : null}
          </div>
        ) : weeklyRate > 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Checking rate compliance...</p>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">Enter a rate to check against union minimums</p>
        )}
      </CardContent>
    </Card>
  );
}
