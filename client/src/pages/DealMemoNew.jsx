import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

import DealMemoWizard from "@/components/deal-memo/DealMemoWizard";
import RateFieldWithInfo from "@/components/deal-memo/RateFieldWithInfo";
import AIDealMemoChat from "@/components/deal-memo/AIDealMemoChat";

import {
  useProductions,
  useCreateDealMemo,
} from "@/hooks/useDealMemos";

import {
  useUnions,
  useDepartments,
  useDesignations,
  useBudgetTiers,
  useRateLookup,
} from "@/hooks/useRateCards";

import { cn, formatCurrency } from "@/lib/utils";
import {
  Film,
  Users,
  Banknote,
  Percent,
  Clock,
  Briefcase,
  FileCheck,
  Info,
  ChevronLeft,
  CalendarDays,
  Sparkles,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const dealMemoSchema = z.object({
  // Step 1
  productionId: z.string().min(1, "Select a production"),
  personId: z.string().min(1, "Select a person"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  // Step 2
  unionId: z.string().min(1, "Select a union"),
  departmentId: z.string().min(1, "Select a department"),
  designationId: z.string().min(1, "Select a designation"),
  budgetTierId: z.string().min(1, "Select a budget tier"),
  // Step 3 - rates
  hourlyRate: z.number().nullable().optional(),
  dailyRate: z.number().nullable().optional(),
  weeklyRate: z.number().min(0.01, "Weekly rate is required"),
  guaranteedHours: z.number().min(0).optional(),
  // Step 4 - fringes
  holidayPayPct: z.number().min(0).max(100),
  employerNiPct: z.number().min(0).max(100),
  pensionPct: z.number().min(0).max(100),
  apprenticeLevyPct: z.number().min(0).max(100),
  // Step 5 - overtime & penalties
  standardWorkDayHrs: z.number().min(1).max(24),
  lunchBreakHrs: z.number().min(0).max(4),
  sixthDayMultiplier: z.number().min(1),
  seventhDayMultiplier: z.number().min(1),
  nightPremiumPct: z.number().min(0).max(200),
  mealPenaltyEnabled: z.boolean(),
  mealPenaltyAmount: z.number().min(0).optional(),
  mealPenaltyAfterHrs: z.number().min(0).optional(),
  turnaroundMinHrs: z.number().min(0).max(24),
  // Step 6 - allowances
  kitAllowance: z.number().min(0),
  travelAllowance: z.number().min(0),
  perDiem: z.number().min(0),
  phoneAllowance: z.number().min(0),
  computerAllowance: z.number().min(0),
  carAllowance: z.number().min(0),
});

const DEFAULT_VALUES = {
  productionId: "",
  personId: "",
  startDate: "",
  endDate: "",
  unionId: "",
  departmentId: "",
  designationId: "",
  budgetTierId: "",
  hourlyRate: null,
  dailyRate: null,
  weeklyRate: 0,
  guaranteedHours: 40,
  holidayPayPct: 12.07,
  employerNiPct: 13.8,
  pensionPct: 3,
  apprenticeLevyPct: 0.5,
  standardWorkDayHrs: 10,
  lunchBreakHrs: 1,
  sixthDayMultiplier: 1.5,
  seventhDayMultiplier: 2,
  nightPremiumPct: 25,
  mealPenaltyEnabled: true,
  mealPenaltyAmount: 35,
  mealPenaltyAfterHrs: 6,
  turnaroundMinHrs: 11,
  kitAllowance: 0,
  travelAllowance: 0,
  perDiem: 0,
  phoneAllowance: 0,
  computerAllowance: 0,
  carAllowance: 0,
};

// Which schema fields belong to which step (for partial validation)
const STEP_FIELDS = [
  ["productionId", "personId", "startDate"],
  ["unionId", "departmentId", "designationId", "budgetTierId"],
  ["weeklyRate"],
  ["holidayPayPct", "employerNiPct", "pensionPct", "apprenticeLevyPct"],
  [
    "standardWorkDayHrs",
    "lunchBreakHrs",
    "sixthDayMultiplier",
    "seventhDayMultiplier",
    "nightPremiumPct",
    "turnaroundMinHrs",
  ],
  [
    "kitAllowance",
    "travelAllowance",
    "perDiem",
    "phoneAllowance",
    "computerAllowance",
    "carAllowance",
  ],
  [], // review step - no extra validation
];

// ---------------------------------------------------------------------------
// FilterSelect (same pattern as RateCards.jsx)
// ---------------------------------------------------------------------------
function FilterSelect({
  label,
  placeholder,
  value,
  onValueChange,
  options,
  disabled,
  loading,
  error,
  className,
}) {
  const selectedLabel = (options ?? []).find((o) => o._id === value)?.name;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      <Select value={value ?? ""} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn("w-full", error && "border-destructive")}>
          {selectedLabel ? (
            <span className="truncate">{selectedLabel}</span>
          ) : (
            <SelectValue placeholder={loading ? "Loading..." : placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {(options ?? []).map((opt) => (
            <SelectItem key={opt._id} value={opt._id}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function DealMemoNew() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [rateSource, setRateSource] = useState(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  // Store display labels for the review step
  const [classificationLabels, setClassificationLabels] = useState({
    union: "",
    department: "",
    designation: "",
    budgetTier: "",
  });

  const { data: productions, isLoading: prodsLoading } = useProductions();
  const rateLookup = useRateLookup();
  const createDealMemo = useCreateDealMemo();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dealMemoSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  const watchedUnionId = watch("unionId");
  const watchedDepartmentId = watch("departmentId");
  const watchedDesignationId = watch("designationId");
  const watchedBudgetTierId = watch("budgetTierId");
  const watchedProductionId = watch("productionId");

  // API-driven cascading selects
  const { data: unions, isLoading: unionsLoading } = useUnions();
  const { data: departments, isLoading: deptsLoading } = useDepartments(watchedUnionId);
  const { data: designations, isLoading: desigsLoading } = useDesignations(watchedDepartmentId);
  const { data: budgetTiers, isLoading: tiersLoading } = useBudgetTiers(watchedUnionId);

  // Build person list from the selected production's members
  const selectedProduction = useMemo(
    () => productions?.find((p) => p._id === watchedProductionId),
    [productions, watchedProductionId]
  );

  const personOptions = useMemo(() => {
    if (!selectedProduction?.members) return [];
    return selectedProduction.members
      .filter((m) => m.userId)
      .map((m) => {
        const u = m.userId;
        return {
          _id: typeof u === "string" ? u : u._id,
          name:
            typeof u === "string"
              ? u
              : `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
        };
      });
  }, [selectedProduction]);

  // ---- Step navigation ----
  const goNext = useCallback(async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    if (fieldsToValidate.length > 0) {
      const valid = await trigger(fieldsToValidate);
      if (!valid) return;
    }

    // After step 2 (classification), auto-lookup rates
    if (currentStep === 1) {
      const vals = getValues();

      // Store display labels for review
      const unionName = (unions ?? []).find((u) => u._id === vals.unionId)?.name ?? "";
      const deptName = (departments ?? []).find((d) => d._id === vals.departmentId)?.name ?? "";
      const desigName = (designations ?? []).find((d) => d._id === vals.designationId)?.name ?? "";
      const tierName = (budgetTiers ?? []).find((t) => t._id === vals.budgetTierId)?.name ?? "";
      setClassificationLabels({
        union: unionName,
        department: deptName,
        designation: desigName,
        budgetTier: tierName,
      });

      rateLookup.mutate(
        {
          unionId: vals.unionId,
          departmentId: vals.departmentId,
          designationId: vals.designationId,
          budgetTierId: vals.budgetTierId,
        },
        {
          onSuccess: (result) => {
            const data = result?.primary || result;
            if (data?.hourlyRate != null) setValue("hourlyRate", data.hourlyRate);
            if (data?.dailyRate != null) setValue("dailyRate", data.dailyRate);
            if (data?.weeklyRate != null) setValue("weeklyRate", data.weeklyRate);
            if (data?.guaranteedHours != null) setValue("guaranteedHours", data.guaranteedHours);
            setRateSource(data?.source || data?.sourceUrl ? { url: data.sourceUrl, label: data.sourceDocument } : null);

            // Auto-populate overtime rules if returned
            if (data?.overtimeRules) {
              const r = data.overtimeRules;
              if (r.standardWorkDayHrs != null) setValue("standardWorkDayHrs", r.standardWorkDayHrs);
              if (r.lunchBreakHrs != null) setValue("lunchBreakHrs", r.lunchBreakHrs);
              if (r.sixthDayMultiplier != null) setValue("sixthDayMultiplier", r.sixthDayMultiplier);
              if (r.seventhDayMultiplier != null) setValue("seventhDayMultiplier", r.seventhDayMultiplier);
              if (r.nightPremiumPct != null) setValue("nightPremiumPct", r.nightPremiumPct);
              if (r.turnaroundMinHrs != null) setValue("turnaroundMinHrs", r.turnaroundMinHrs);
            }
          },
        }
      );
    }

    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, 6));
  }, [currentStep, trigger, getValues, rateLookup, setValue, unions, departments, designations, budgetTiers]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  // ---- Submit ----
  const onSubmit = handleSubmit((data) => {
    // Map form data to what POST /api/deal-memos expects
    const payload = {
      productionId: data.productionId,
      personId: data.personId,
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      unionId: data.unionId,
      departmentId: data.departmentId,
      designationId: data.designationId,
      budgetTierId: data.budgetTierId,
      weeklyRate: data.weeklyRate,
      dailyRate: data.dailyRate,
      hourlyRate: data.hourlyRate,
      guaranteedHours: data.guaranteedHours,
      holidayPayPct: data.holidayPayPct,
      employerNiPct: data.employerNiPct,
      pensionPct: data.pensionPct,
      apprenticeLevyPct: data.apprenticeLevyPct,
      standardWorkDayHrs: data.standardWorkDayHrs,
      lunchBreakHrs: data.lunchBreakHrs,
      sixthDayMultiplier: data.sixthDayMultiplier,
      seventhDayMultiplier: data.seventhDayMultiplier,
      nightPremiumPct: data.nightPremiumPct,
      mealPenaltyEnabled: data.mealPenaltyEnabled,
      mealPenaltyAmount: data.mealPenaltyAmount,
      mealPenaltyAfterHrs: data.mealPenaltyAfterHrs,
      turnaroundMinHrs: data.turnaroundMinHrs,
      kitAllowance: data.kitAllowance,
      travelAllowance: data.travelAllowance,
      perDiem: data.perDiem,
      phoneAllowance: data.phoneAllowance,
      computerAllowance: data.computerAllowance,
      carAllowance: data.carAllowance,
    };

    createDealMemo.mutate(payload, {
      onSuccess: (result) => {
        toast.success("Deal memo created successfully");
        navigate(`/deal-memos/${result._id || result.id}`);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to create deal memo");
      },
    });
  });

  // ---- AI Auto-Fill ----
  const handleAIApply = useCallback(
    (formData) => {
      if (!formData) return;

      // Map each AI-returned field onto the react-hook-form
      const num = (v) => (v != null && v !== '' ? Number(v) : null);
      const fieldMap = {
        productionId: formData.productionId,
        personId: formData.personId,
        unionId: formData.unionId,
        departmentId: formData.departmentId,
        designationId: formData.designationId,
        budgetTierId: formData.budgetTierId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        weeklyRate: num(formData.weeklyRate) || 0,
        dailyRate: num(formData.dailyRate),
        hourlyRate: num(formData.hourlyRate),
        guaranteedHours: num(formData.guaranteedHours),
        holidayPayPct: num(formData.holidayPayPct) ?? 12.07,
        employerNiPct: num(formData.employerNiPct) ?? 15,
        pensionPct: num(formData.pensionPct) ?? 3,
        apprenticeLevyPct: num(formData.apprenticeLevyPct) ?? 0,
        standardWorkDayHrs: num(formData.standardWorkDayHrs) ?? 11,
        lunchBreakHrs: num(formData.lunchBreakHrs) ?? 1,
        sixthDayMultiplier: num(formData.sixthDayMultiplier) ?? 1.5,
        seventhDayMultiplier: num(formData.seventhDayMultiplier) ?? 2,
        nightPremiumPct: num(formData.nightPremiumPct) ?? 50,
        mealPenaltyEnabled: formData.mealPenaltyEnabled ?? true,
        mealPenaltyAmount: num(formData.mealPenaltyAmount) ?? 35,
        mealPenaltyAfterHrs: num(formData.mealPenaltyAfterHrs) ?? 6,
        turnaroundMinHrs: num(formData.turnaroundMinHrs) ?? 11,
        kitAllowance: num(formData.kitAllowance) ?? 0,
        travelAllowance: num(formData.travelAllowance) ?? 0,
        perDiem: num(formData.perDiem) ?? 0,
        phoneAllowance: num(formData.phoneAllowance) ?? 0,
        computerAllowance: num(formData.computerAllowance) ?? 0,
        carAllowance: num(formData.carAllowance) ?? 0,
      };

      for (const [key, value] of Object.entries(fieldMap)) {
        if (value !== undefined && value !== null) {
          setValue(key, value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        }
      }

      // Store classification labels for the review step
      if (formData.labels) {
        setClassificationLabels({
          union: formData.labels.union || "",
          department: formData.labels.department || "",
          designation: formData.labels.designation || "",
          budgetTier: formData.labels.budgetTier || "",
        });
      }

      // Jump to review step
      setDirection(1);
      setCurrentStep(6);
      setAiPanelOpen(false);
      toast.success("AI auto-fill applied! Review the deal memo below.");
    },
    [setValue, setClassificationLabels, setDirection, setCurrentStep]
  );

  // ---- Render steps ----
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepProduction
            control={control}
            productions={productions}
            prodsLoading={prodsLoading}
            personOptions={personOptions}
            errors={errors}
            setValue={setValue}
            watchedProductionId={watchedProductionId}
          />
        );
      case 1:
        return (
          <StepClassification
            control={control}
            errors={errors}
            unions={unions}
            unionsLoading={unionsLoading}
            departments={departments}
            deptsLoading={deptsLoading}
            designations={designations}
            desigsLoading={desigsLoading}
            budgetTiers={budgetTiers}
            tiersLoading={tiersLoading}
            watchedUnionId={watchedUnionId}
            watchedDepartmentId={watchedDepartmentId}
            setValue={setValue}
            isLookingUp={rateLookup.isPending}
          />
        );
      case 2:
        return (
          <StepRates
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            rateSource={rateSource}
          />
        );
      case 3:
        return <StepFringes control={control} errors={errors} watch={watch} setValue={setValue} />;
      case 4:
        return <StepOvertime control={control} errors={errors} watch={watch} setValue={setValue} />;
      case 5:
        return <StepAllowances control={control} errors={errors} watch={watch} setValue={setValue} />;
      case 6:
        return (
          <StepReview
            values={watch()}
            productions={productions}
            personOptions={personOptions}
            classificationLabels={classificationLabels}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-4xl mx-auto space-y-6"
    >
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/deal-memos")}>
          <ChevronLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">New Deal Memo</h1>
          <p className="text-sm text-muted-foreground">
            Set up compensation terms for a crew member
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setAiPanelOpen(true)}
        >
          <Sparkles className="size-4" />
          AI Auto-Fill
        </Button>
      </div>

      {/* AI Chat Panel */}
      <AIDealMemoChat
        open={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        onApplyFormData={handleAIApply}
      />

      {/* Wizard */}
      <Card>
        <CardContent className="pt-6">
          <DealMemoWizard
            currentStep={currentStep}
            direction={direction}
            onNext={goNext}
            onBack={goBack}
            onSubmit={onSubmit}
            isSubmitting={createDealMemo.isPending}
          >
            {renderStep()}
          </DealMemoWizard>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===========================================================================
// Step components
// ===========================================================================

// ---- Step 1: Production, Person, Dates ----
function StepProduction({ control, productions, prodsLoading, personOptions, errors, setValue, watchedProductionId }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Film className="size-5" />
        <h2 className="text-lg font-semibold">Production & Person</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Choose the production, the crew member this deal is for, and the deal dates.
      </p>

      {prodsLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Production */}
          <Controller
            name="productionId"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5 max-w-md">
                <Label>Production</Label>
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    // Reset person when production changes
                    setValue("personId", "");
                  }}
                >
                  <SelectTrigger className={cn("w-full", errors.productionId && "border-destructive")}>
                    <SelectValue placeholder="Select a production..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(productions || []).map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.title || p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productionId && (
                  <p className="text-xs text-destructive">{errors.productionId.message}</p>
                )}
              </div>
            )}
          />

          {/* Person */}
          <Controller
            name="personId"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5 max-w-md">
                <Label>Person (Crew Member)</Label>
                {personOptions.length > 0 ? (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!watchedProductionId}
                  >
                    <SelectTrigger className={cn("w-full", errors.personId && "border-destructive")}>
                      <SelectValue
                        placeholder={watchedProductionId ? "Select a crew member..." : "Select a production first"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {personOptions.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    <Input
                      placeholder={
                        watchedProductionId
                          ? "No members found -- enter person ID manually"
                          : "Select a production first"
                      }
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={!watchedProductionId}
                      className={cn(errors.personId && "border-destructive")}
                    />
                    {watchedProductionId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        This production has no members. Enter the user's MongoDB ID.
                      </p>
                    )}
                  </div>
                )}
                {errors.personId && (
                  <p className="text-xs text-destructive">{errors.personId.message}</p>
                )}
              </div>
            )}
          />

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
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
                  <Label>
                    End Date <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    type="date"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </div>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Step 2: Classification (API-driven cascading selects) ----
function StepClassification({
  control,
  errors,
  unions,
  unionsLoading,
  departments,
  deptsLoading,
  designations,
  desigsLoading,
  budgetTiers,
  tiersLoading,
  watchedUnionId,
  watchedDepartmentId,
  setValue,
  isLookingUp,
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Users className="size-5" />
        <h2 className="text-lg font-semibold">Classification</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Define the union, department, designation, and budget tier. Rates will auto-populate based on your selection.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Union */}
        <Controller
          name="unionId"
          control={control}
          render={({ field }) => (
            <FilterSelect
              label="Union / Agreement"
              placeholder="Select union..."
              value={field.value}
              onValueChange={(val) => {
                field.onChange(val);
                setValue("departmentId", "");
                setValue("designationId", "");
                setValue("budgetTierId", "");
              }}
              options={unions}
              loading={unionsLoading}
              disabled={unionsLoading}
              error={errors.unionId?.message}
            />
          )}
        />

        {/* Department */}
        <Controller
          name="departmentId"
          control={control}
          render={({ field }) => (
            <FilterSelect
              label="Department"
              placeholder={watchedUnionId ? "Select department..." : "Select union first"}
              value={field.value}
              onValueChange={(val) => {
                field.onChange(val);
                setValue("designationId", "");
              }}
              options={departments}
              loading={deptsLoading}
              disabled={!watchedUnionId || deptsLoading}
              error={errors.departmentId?.message}
            />
          )}
        />

        {/* Designation */}
        <Controller
          name="designationId"
          control={control}
          render={({ field }) => (
            <FilterSelect
              label="Designation / Role"
              placeholder={watchedDepartmentId ? "Select designation..." : "Select department first"}
              value={field.value}
              onValueChange={field.onChange}
              options={designations}
              loading={desigsLoading}
              disabled={!watchedDepartmentId || desigsLoading}
              error={errors.designationId?.message}
            />
          )}
        />

        {/* Budget Tier */}
        <Controller
          name="budgetTierId"
          control={control}
          render={({ field }) => (
            <FilterSelect
              label="Budget Tier"
              placeholder={watchedUnionId ? "Select budget tier..." : "Select union first"}
              value={field.value}
              onValueChange={field.onChange}
              options={budgetTiers}
              loading={tiersLoading}
              disabled={!watchedUnionId || tiersLoading}
              error={errors.budgetTierId?.message}
            />
          )}
        />
      </div>

      {isLookingUp && (
        <p className="text-xs text-muted-foreground animate-pulse">Looking up rates...</p>
      )}
    </div>
  );
}

// ---- Step 3: Rates ----
function StepRates({ control, errors, watch, setValue, rateSource }) {
  const unionId = watch("unionId");
  const departmentId = watch("departmentId");
  const designationId = watch("designationId");
  const budgetTierId = watch("budgetTierId");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Banknote className="size-5" />
        <h2 className="text-lg font-semibold">Rates</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Rates have been auto-populated from the rate engine. Adjust as needed. Green indicates the
        rate meets or exceeds the union minimum; yellow means it falls below.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Controller
          name="weeklyRate"
          control={control}
          render={({ field }) => (
            <RateFieldWithInfo
              label="Weekly Rate"
              value={field.value}
              onChange={field.onChange}
              rateType="weeklyRate"
              union={unionId}
              department={departmentId}
              designation={designationId}
              budgetTier={budgetTierId}
              sourceUrl={rateSource?.url}
              sourceLabel={rateSource?.label}
              error={errors.weeklyRate?.message}
            />
          )}
        />

        <Controller
          name="dailyRate"
          control={control}
          render={({ field }) => (
            <RateFieldWithInfo
              label="Daily Rate"
              value={field.value}
              onChange={field.onChange}
              rateType="dailyRate"
              union={unionId}
              department={departmentId}
              designation={designationId}
              budgetTier={budgetTierId}
              sourceUrl={rateSource?.url}
              sourceLabel={rateSource?.label}
            />
          )}
        />

        <Controller
          name="hourlyRate"
          control={control}
          render={({ field }) => (
            <RateFieldWithInfo
              label="Hourly Rate"
              value={field.value}
              onChange={field.onChange}
              rateType="hourlyRate"
              union={unionId}
              department={departmentId}
              designation={designationId}
              budgetTier={budgetTierId}
              sourceUrl={rateSource?.url}
              sourceLabel={rateSource?.label}
            />
          )}
        />

        <Controller
          name="guaranteedHours"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label>Guaranteed Hours / Week</Label>
              <Input
                type="number"
                min={0}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}

// ---- Step 4: Fringes ----
function StepFringes({ control, errors, watch, setValue }) {
  const fringeFields = [
    { name: "holidayPayPct", label: "Holiday Pay %", info: "Statutory holiday pay accrual percentage" },
    { name: "employerNiPct", label: "Employer NI %", info: "Employer National Insurance contribution rate" },
    { name: "pensionPct", label: "Pension %", info: "Auto-enrolment pension employer contribution" },
    { name: "apprenticeLevyPct", label: "Apprenticeship Levy %", info: "Applicable for pay bills over 3M" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Percent className="size-5" />
        <h2 className="text-lg font-semibold">Fringes</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Employer-side costs applied on top of the base rate. Defaults are pre-filled based on current UK regulations.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {fringeFields.map(({ name, label, info }) => (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label>{label}</Label>
                  <Tooltip>
                    <TooltipTrigger className="text-muted-foreground hover:text-foreground transition-colors">
                      <Info className="size-3.5" />
                    </TooltipTrigger>
                    <TooltipContent side="top">{info}</TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="pr-8 tabular-nums"
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
                {errors[name] && (
                  <p className="text-xs text-destructive">{errors[name].message}</p>
                )}
              </div>
            )}
          />
        ))}
      </div>

      {/* Quick total */}
      <div className="rounded-lg border bg-muted/40 p-3">
        <p className="text-sm font-medium">
          Total Fringe Rate:{" "}
          <span className="text-primary font-semibold">
            {(
              (watch("holidayPayPct") || 0) +
              (watch("employerNiPct") || 0) +
              (watch("pensionPct") || 0) +
              (watch("apprenticeLevyPct") || 0)
            ).toFixed(2)}
            %
          </span>
        </p>
      </div>
    </div>
  );
}

// ---- Step 5: Overtime & Penalties ----
function StepOvertime({ control, errors, watch, setValue }) {
  const mealPenaltyEnabled = watch("mealPenaltyEnabled");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Clock className="size-5" />
        <h2 className="text-lg font-semibold">Overtime & Penalty Rules</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Pre-populated from union agreement. Adjust if the deal requires custom terms.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Controller
          name="standardWorkDayHrs"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label>Standard Work Day (hrs)</Label>
              <Input
                type="number"
                step="0.5"
                min={1}
                max={24}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="tabular-nums"
              />
              {errors.standardWorkDayHrs && <p className="text-xs text-destructive">{errors.standardWorkDayHrs.message}</p>}
            </div>
          )}
        />

        <Controller
          name="lunchBreakHrs"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label>Lunch Break (hrs)</Label>
              <Input
                type="number"
                step="0.25"
                min={0}
                max={4}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="tabular-nums"
              />
            </div>
          )}
        />

        <Controller
          name="turnaroundMinHrs"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label>Turnaround Minimum (hrs)</Label>
                <Tooltip>
                  <TooltipTrigger className="text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="size-3.5" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Minimum rest hours between wrap and next call time
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                step="0.5"
                min={0}
                max={24}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="tabular-nums"
              />
            </div>
          )}
        />

        <Controller
          name="sixthDayMultiplier"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label>6th Day Multiplier</Label>
              <Input
                type="number"
                step="0.1"
                min={1}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="tabular-nums"
              />
            </div>
          )}
        />

        <Controller
          name="seventhDayMultiplier"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label>7th Day Multiplier</Label>
              <Input
                type="number"
                step="0.1"
                min={1}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="tabular-nums"
              />
            </div>
          )}
        />

        <Controller
          name="nightPremiumPct"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label>Night Premium %</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="1"
                  min={0}
                  max={200}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="pr-8 tabular-nums"
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          )}
        />
      </div>

      <Separator />

      {/* Meal penalty */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Controller
            name="mealPenaltyEnabled"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="size-4 rounded border-input accent-primary"
                />
                <span className="text-sm font-medium">Meal Penalty</span>
              </label>
            )}
          />
        </div>

        {mealPenaltyEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
            <Controller
              name="mealPenaltyAmount"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Penalty Amount</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      £
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="pl-7 tabular-nums"
                    />
                  </div>
                </div>
              )}
            />

            <Controller
              name="mealPenaltyAfterHrs"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Trigger After (hrs)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="tabular-nums"
                  />
                </div>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Step 6: Allowances ----
function StepAllowances({ control, errors, watch, setValue }) {
  const allowanceFields = [
    { name: "kitAllowance", label: "Kit Allowance" },
    { name: "travelAllowance", label: "Travel Allowance" },
    { name: "perDiem", label: "Per Diem" },
    { name: "phoneAllowance", label: "Phone Allowance" },
    { name: "computerAllowance", label: "Computer Allowance" },
    { name: "carAllowance", label: "Car Allowance" },
  ];

  const totalAllowances = allowanceFields.reduce(
    (sum, f) => sum + (watch(f.name) || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Briefcase className="size-5" />
        <h2 className="text-lg font-semibold">Allowances</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Weekly allowance amounts in GBP. Leave at 0 if not applicable.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {allowanceFields.map(({ name, label }) => (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>{label}</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    £
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="pl-7 tabular-nums"
                  />
                </div>
                {errors[name] && (
                  <p className="text-xs text-destructive">{errors[name].message}</p>
                )}
              </div>
            )}
          />
        ))}
      </div>

      <div className="rounded-lg border bg-muted/40 p-3">
        <p className="text-sm font-medium">
          Total Weekly Allowances:{" "}
          <span className="text-primary font-semibold">{formatCurrency(totalAllowances)}</span>
        </p>
      </div>
    </div>
  );
}

// ---- Step 7: Review ----
function StepReview({ values, productions, personOptions, classificationLabels }) {
  const production = productions?.find((p) => p._id === values.productionId);
  const person = personOptions?.find((p) => p._id === values.personId);
  const totalFringe =
    (values.holidayPayPct || 0) +
    (values.employerNiPct || 0) +
    (values.pensionPct || 0) +
    (values.apprenticeLevyPct || 0);
  const totalAllowances =
    (values.kitAllowance || 0) +
    (values.travelAllowance || 0) +
    (values.perDiem || 0) +
    (values.phoneAllowance || 0) +
    (values.computerAllowance || 0) +
    (values.carAllowance || 0);

  const Section = ({ icon: Icon, title, children }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">{children}</div>
    </div>
  );

  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "--"}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <FileCheck className="size-5" />
        <h2 className="text-lg font-semibold">Review & Submit</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Please review all details before creating the deal memo.
      </p>

      <div className="space-y-6 rounded-lg border p-5">
        <Section icon={Film} title="Production & Person">
          <Field label="Production" value={production?.title || production?.name} />
          <Field label="Person" value={person?.name || values.personId} />
          <Field label="Start Date" value={values.startDate} />
          {values.endDate && <Field label="End Date" value={values.endDate} />}
        </Section>

        <Separator />

        <Section icon={Users} title="Classification">
          <Field label="Union" value={classificationLabels.union} />
          <Field label="Department" value={classificationLabels.department} />
          <Field label="Designation" value={classificationLabels.designation} />
          <Field label="Budget Tier" value={classificationLabels.budgetTier} />
        </Section>

        <Separator />

        <Section icon={Banknote} title="Rates">
          <Field label="Weekly Rate" value={formatCurrency(values.weeklyRate)} />
          <Field label="Daily Rate" value={values.dailyRate ? formatCurrency(values.dailyRate) : "--"} />
          <Field label="Hourly Rate" value={values.hourlyRate ? formatCurrency(values.hourlyRate) : "--"} />
          <Field label="Guaranteed Hours" value={`${values.guaranteedHours || 0} hrs/wk`} />
        </Section>

        <Separator />

        <Section icon={Percent} title="Fringes">
          <Field label="Holiday Pay" value={`${values.holidayPayPct}%`} />
          <Field label="Employer NI" value={`${values.employerNiPct}%`} />
          <Field label="Pension" value={`${values.pensionPct}%`} />
          <Field label="Apprenticeship Levy" value={`${values.apprenticeLevyPct}%`} />
          <Field label="Total Fringe" value={`${totalFringe.toFixed(2)}%`} />
        </Section>

        <Separator />

        <Section icon={Clock} title="Overtime & Penalties">
          <Field label="Standard Day" value={`${values.standardWorkDayHrs} hrs`} />
          <Field label="Lunch Break" value={`${values.lunchBreakHrs} hrs`} />
          <Field label="6th Day" value={`${values.sixthDayMultiplier}x`} />
          <Field label="7th Day" value={`${values.seventhDayMultiplier}x`} />
          <Field label="Night Premium" value={`${values.nightPremiumPct}%`} />
          <Field label="Turnaround Min" value={`${values.turnaroundMinHrs} hrs`} />
          <Field label="Meal Penalty" value={values.mealPenaltyEnabled ? `${formatCurrency(values.mealPenaltyAmount)} after ${values.mealPenaltyAfterHrs} hrs` : "Disabled"} />
        </Section>

        <Separator />

        <Section icon={Briefcase} title="Allowances">
          <Field label="Kit" value={formatCurrency(values.kitAllowance)} />
          <Field label="Travel" value={formatCurrency(values.travelAllowance)} />
          <Field label="Per Diem" value={formatCurrency(values.perDiem)} />
          <Field label="Phone" value={formatCurrency(values.phoneAllowance)} />
          <Field label="Computer" value={formatCurrency(values.computerAllowance)} />
          <Field label="Car" value={formatCurrency(values.carAllowance)} />
          <Field label="Total Allowances" value={formatCurrency(totalAllowances)} />
        </Section>
      </div>
    </div>
  );
}
