import { useState, useCallback } from "react";
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

import {
  useProductions,
  useRateCardLookup,
  useCreateDealMemo,
} from "@/hooks/useDealMemos";

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
} from "lucide-react";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const dealMemoSchema = z.object({
  // Step 1
  productionId: z.string().min(1, "Select a production"),
  // Step 2
  union: z.string().min(1, "Select a union"),
  department: z.string().min(1, "Select a department"),
  designation: z.string().min(1, "Select a designation"),
  budgetTier: z.string().min(1, "Select a budget tier"),
  // Step 3 – rates
  hourlyRate: z.number().nullable().optional(),
  dailyRate: z.number().nullable().optional(),
  weeklyRate: z.number().min(0.01, "Weekly rate is required"),
  guaranteedHours: z.number().min(0).optional(),
  // Step 4 – fringes
  holidayPayPct: z.number().min(0).max(100),
  employerNiPct: z.number().min(0).max(100),
  pensionPct: z.number().min(0).max(100),
  apprenticeLevyPct: z.number().min(0).max(100),
  // Step 5 – overtime & penalties
  standardWorkDayHrs: z.number().min(1).max(24),
  lunchBreakHrs: z.number().min(0).max(4),
  sixthDayMultiplier: z.number().min(1),
  seventhDayMultiplier: z.number().min(1),
  nightPremiumPct: z.number().min(0).max(200),
  mealPenaltyEnabled: z.boolean(),
  mealPenaltyAmount: z.number().min(0).optional(),
  mealPenaltyAfterHrs: z.number().min(0).optional(),
  turnaroundMinHrs: z.number().min(0).max(24),
  // Step 6 – allowances
  kitAllowance: z.number().min(0),
  travelAllowance: z.number().min(0),
  perDiem: z.number().min(0),
  phoneAllowance: z.number().min(0),
  computerAllowance: z.number().min(0),
  carAllowance: z.number().min(0),
});

const DEFAULT_VALUES = {
  productionId: "",
  union: "",
  department: "",
  designation: "",
  budgetTier: "",
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
  ["productionId"],
  ["union", "department", "designation", "budgetTier"],
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
  [], // review step — no extra validation
];

// Union / department / designation options (would come from API in production)
const UNION_OPTIONS = [
  { value: "bectu", label: "BECTU" },
  { value: "equity", label: "Equity" },
  { value: "musicians_union", label: "Musicians' Union" },
  { value: "non_union", label: "Non-Union" },
];

const DEPARTMENT_OPTIONS = {
  bectu: [
    { value: "camera", label: "Camera" },
    { value: "sound", label: "Sound" },
    { value: "lighting", label: "Lighting" },
    { value: "art", label: "Art Department" },
    { value: "costume", label: "Costume" },
    { value: "makeup", label: "Make-Up & Hair" },
    { value: "editing", label: "Editing" },
    { value: "production", label: "Production" },
  ],
  equity: [
    { value: "cast", label: "Cast" },
    { value: "stunts", label: "Stunts" },
    { value: "stand_ins", label: "Stand-Ins" },
  ],
  musicians_union: [{ value: "music", label: "Music" }],
  non_union: [
    { value: "general", label: "General" },
    { value: "office", label: "Office" },
    { value: "transport", label: "Transport" },
  ],
};

const DESIGNATION_OPTIONS = {
  camera: [
    { value: "dop", label: "Director of Photography" },
    { value: "camera_operator", label: "Camera Operator" },
    { value: "first_ac", label: "1st AC / Focus Puller" },
    { value: "second_ac", label: "2nd AC / Clapper Loader" },
    { value: "dit", label: "DIT" },
  ],
  sound: [
    { value: "sound_mixer", label: "Sound Mixer" },
    { value: "boom_operator", label: "Boom Operator" },
    { value: "sound_assistant", label: "Sound Assistant" },
  ],
  lighting: [
    { value: "gaffer", label: "Gaffer" },
    { value: "best_boy", label: "Best Boy" },
    { value: "electrician", label: "Electrician" },
  ],
  art: [
    { value: "production_designer", label: "Production Designer" },
    { value: "art_director", label: "Art Director" },
    { value: "set_decorator", label: "Set Decorator" },
    { value: "props_master", label: "Props Master" },
  ],
  costume: [
    { value: "costume_designer", label: "Costume Designer" },
    { value: "costume_supervisor", label: "Costume Supervisor" },
    { value: "wardrobe_assistant", label: "Wardrobe Assistant" },
  ],
  makeup: [
    { value: "makeup_designer", label: "Make-Up Designer" },
    { value: "hair_designer", label: "Hair Designer" },
    { value: "makeup_artist", label: "Make-Up Artist" },
  ],
  editing: [
    { value: "editor", label: "Editor" },
    { value: "assistant_editor", label: "Assistant Editor" },
    { value: "vfx_editor", label: "VFX Editor" },
  ],
  production: [
    { value: "line_producer", label: "Line Producer" },
    { value: "production_manager", label: "Production Manager" },
    { value: "production_coordinator", label: "Production Coordinator" },
    { value: "production_assistant", label: "Production Assistant" },
  ],
  cast: [
    { value: "lead_actor", label: "Lead Actor" },
    { value: "supporting_actor", label: "Supporting Actor" },
    { value: "day_player", label: "Day Player" },
    { value: "featured_extra", label: "Featured Extra" },
  ],
  stunts: [
    { value: "stunt_coordinator", label: "Stunt Coordinator" },
    { value: "stunt_performer", label: "Stunt Performer" },
  ],
  stand_ins: [{ value: "stand_in", label: "Stand-In" }],
  music: [
    { value: "composer", label: "Composer" },
    { value: "musician", label: "Session Musician" },
  ],
  general: [
    { value: "runner", label: "Runner" },
    { value: "intern", label: "Intern" },
  ],
  office: [
    { value: "accountant", label: "Production Accountant" },
    { value: "accounts_assistant", label: "Accounts Assistant" },
  ],
  transport: [
    { value: "transport_captain", label: "Transport Captain" },
    { value: "driver", label: "Driver" },
  ],
};

const BUDGET_TIER_OPTIONS = [
  { value: "low", label: "Low Budget (< £5M)" },
  { value: "mid", label: "Mid Budget (£5M - £15M)" },
  { value: "high", label: "High Budget (£15M - £50M)" },
  { value: "studio", label: "Studio (> £50M)" },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function DealMemoNew() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [rateSource, setRateSource] = useState(null);

  const { data: productions, isLoading: prodsLoading } = useProductions();
  const rateCardLookup = useRateCardLookup();
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

  const watchedUnion = watch("union");
  const watchedDepartment = watch("department");
  const watchedDesignation = watch("designation");
  const watchedBudgetTier = watch("budgetTier");

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
      rateCardLookup.mutate(
        {
          union: vals.union,
          department: vals.department,
          designation: vals.designation,
          budgetTier: vals.budgetTier,
        },
        {
          onSuccess: (data) => {
            if (data?.hourlyRate != null) setValue("hourlyRate", data.hourlyRate);
            if (data?.dailyRate != null) setValue("dailyRate", data.dailyRate);
            if (data?.weeklyRate != null) setValue("weeklyRate", data.weeklyRate);
            if (data?.guaranteedHours != null) setValue("guaranteedHours", data.guaranteedHours);
            setRateSource(data?.source || null);

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
  }, [currentStep, trigger, getValues, rateCardLookup, setValue]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  // ---- Submit ----
  const onSubmit = handleSubmit((data) => {
    createDealMemo.mutate(data, {
      onSuccess: (result) => {
        toast.success("Deal memo created successfully");
        navigate(`/deal-memos/${result._id || result.id}`);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to create deal memo");
      },
    });
  });

  // ---- Helpers ----
  const departments = DEPARTMENT_OPTIONS[watchedUnion] || [];
  const designations = DESIGNATION_OPTIONS[watchedDepartment] || [];
  const selectedProduction = productions?.find((p) => p._id === watch("productionId"));

  const labelForValue = (options, val) => options.find((o) => o.value === val)?.label || val || "--";

  // ---- Render steps ----
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepProduction control={control} productions={productions} prodsLoading={prodsLoading} errors={errors} />;
      case 1:
        return (
          <StepClassification
            control={control}
            errors={errors}
            watchedUnion={watchedUnion}
            watchedDepartment={watchedDepartment}
            departments={departments}
            designations={designations}
            setValue={setValue}
            isLookingUp={rateCardLookup.isPending}
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
            values={getValues()}
            productions={productions}
            labelForValue={labelForValue}
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Deal Memo</h1>
          <p className="text-sm text-muted-foreground">
            Set up compensation terms for a crew member
          </p>
        </div>
      </div>

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

// ---- Step 1: Production ----
function StepProduction({ control, productions, prodsLoading, errors }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Film className="size-5" />
        <h2 className="text-lg font-semibold">Select Production</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Choose the production this deal memo belongs to.
      </p>

      {prodsLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <Controller
          name="productionId"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5 max-w-md">
              <Label>Production</Label>
              <Select value={field.value} onValueChange={field.onChange}>
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
      )}
    </div>
  );
}

// ---- Step 2: Classification ----
function StepClassification({
  control,
  errors,
  watchedUnion,
  watchedDepartment,
  departments,
  designations,
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
          name="union"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label>Union / Agreement</Label>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("department", "");
                  setValue("designation", "");
                }}
              >
                <SelectTrigger className={cn("w-full", errors.union && "border-destructive")}>
                  <SelectValue placeholder="Select union..." />
                </SelectTrigger>
                <SelectContent>
                  {UNION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.union && <p className="text-xs text-destructive">{errors.union.message}</p>}
            </div>
          )}
        />

        {/* Department */}
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("designation", "");
                }}
                disabled={!watchedUnion}
              >
                <SelectTrigger className={cn("w-full", errors.department && "border-destructive")}>
                  <SelectValue placeholder={watchedUnion ? "Select department..." : "Select union first"} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
            </div>
          )}
        />

        {/* Designation */}
        <Controller
          name="designation"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label>Designation / Role</Label>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!watchedDepartment}
              >
                <SelectTrigger className={cn("w-full", errors.designation && "border-destructive")}>
                  <SelectValue placeholder={watchedDepartment ? "Select designation..." : "Select department first"} />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.designation && <p className="text-xs text-destructive">{errors.designation.message}</p>}
            </div>
          )}
        />

        {/* Budget Tier */}
        <Controller
          name="budgetTier"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label>Budget Tier</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={cn("w-full", errors.budgetTier && "border-destructive")}>
                  <SelectValue placeholder="Select budget tier..." />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_TIER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.budgetTier && <p className="text-xs text-destructive">{errors.budgetTier.message}</p>}
            </div>
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
  const union = watch("union");
  const department = watch("department");
  const designation = watch("designation");
  const budgetTier = watch("budgetTier");

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
              union={union}
              department={department}
              designation={designation}
              budgetTier={budgetTier}
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
              union={union}
              department={department}
              designation={designation}
              budgetTier={budgetTier}
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
              union={union}
              department={department}
              designation={designation}
              budgetTier={budgetTier}
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
    { name: "apprenticeLevyPct", label: "Apprenticeship Levy %", info: "Applicable for pay bills over £3M" },
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
function StepReview({ values, productions, labelForValue }) {
  const production = productions?.find((p) => p._id === values.productionId);
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
        <Section icon={Film} title="Production">
          <Field label="Production" value={production?.title || production?.name} />
        </Section>

        <Separator />

        <Section icon={Users} title="Classification">
          <Field label="Union" value={labelForValue(UNION_OPTIONS, values.union)} />
          <Field label="Department" value={labelForValue(DEPARTMENT_OPTIONS[values.union] || [], values.department)} />
          <Field label="Designation" value={labelForValue(DESIGNATION_OPTIONS[values.department] || [], values.designation)} />
          <Field label="Budget Tier" value={labelForValue(BUDGET_TIER_OPTIONS, values.budgetTier)} />
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
