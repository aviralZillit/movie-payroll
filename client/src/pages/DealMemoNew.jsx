import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// v2 step components
import Step0EntityTerritory from "@/components/deal-memo/steps/Step0EntityTerritory";
import Step1CrewDetails from "@/components/deal-memo/steps/Step1CrewDetails";
import Step2DealStructure from "@/components/deal-memo/steps/Step2DealStructure";
import Step3Rates from "@/components/deal-memo/steps/Step3Rates";
import Step4Allowances from "@/components/deal-memo/steps/Step4Allowances";
import Step5NominalCoding from "@/components/deal-memo/steps/Step5NominalCoding";
import Step6Compliance from "@/components/deal-memo/steps/Step6Compliance";
import Step7Documents from "@/components/deal-memo/steps/Step7Documents";
import Step8PayrollStart from "@/components/deal-memo/steps/Step8PayrollStart";
import Step9PreviewIssue from "@/components/deal-memo/steps/Step9PreviewIssue";

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

import DealMemoWizard, { buildStepArrays } from "@/components/deal-memo/DealMemoWizard";
import RateFieldWithInfo from "@/components/deal-memo/RateFieldWithInfo";
import AIDealMemoChat from "@/components/deal-memo/AIDealMemoChat";
// DealMemoSummaryPanel available for DealMemoDetail page later

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

import { useContractingEntities } from "@/hooks/useContractingEntities";
import api from "@/lib/axios";
import { getUnionConfig } from "@/lib/unionDealMemoConfig";
import useAuthStore from "@/store/authStore";
import { cn, formatCurrency, currencySymbol } from "@/lib/utils";
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
  AlertCircle,
  Plus,
  Save,
  X,
  Home,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
// Minimal schema — only Step 0 fields are strictly validated.
// Everything else is optional and validated at submission time.
const dealMemoSchema = z.object({
  productionId: z.string().min(1, "Select a production"),
  personId: z.string().min(1, "Select a person"),
  unionId: z.string().min(1, "Select a union"),
  departmentId: z.string().min(1, "Select a department"),
  designationId: z.string().min(1, "Select a designation"),
  budgetTierId: z.string().min(1, "Select a budget tier"),
}).passthrough(); // Accept ALL other fields without validation

const DEFAULT_VALUES = {
  // Step 0 - Entity & Territory
  productionId: "",
  personId: "",
  contractingEntityId: "",
  unionId: "",
  departmentId: "",
  designationId: "",
  budgetTierId: "",
  screenCredit: "",
  // Step 1 - Crew Details
  employmentStatus: "",
  // Step 2 - Deal Structure
  dealType: "weekly",
  exclusivity: "",
  startDate: "",
  endDate: "",
  separateRates: false,
  prepRate: null,
  shootRate: null,
  wrapRate: null,
  // Step 3 - Rates
  rateBasis: "weekly",
  rateAmount: null,
  rateType: "",
  hpMode: "excl",
  weeklyRate: 0,
  dailyRate: null,
  hourlyRate: null,
  // Step 4 - Allowances
  allowances: [],
  // Union-specific fields
  unionFields: {},
  // Step 6 - Right to Work
  rightToWork: { status: "pending" },
  // Step 7 - Documents
  documents: [],
  // Step 8 - Payroll
  bureauId: "",
  payFrequency: "weekly",
  productionAccountant: "",
  payrollAdmin: "",
  hodApprover: "",
  timecardApprover: "",
  // v1 compat fields (kept for backward compat with existing deal memos)
  holidayPayPct: 12.07,
  employerNiPct: 13.8,
  pensionPct: 3,
  apprenticeLevyPct: 0.5,
  standardWorkDayHrs: 10,
  lunchBreakHrs: 1,
  sixthDayMultiplier: 1.5,
  seventhDayMultiplier: 2,
  nightPremiumPct: 25,
  turnaroundMinHrs: 11,
  kitAllowance: 0,
  travelAllowance: 0,
  perDiem: 0,
  phoneAllowance: 0,
  computerAllowance: 0,
  carAllowance: 0,
  housingAllowance: 0,
  customAllowances: [],
};

const UK_FRINGE_DEFAULTS = {
  holidayPayPct: 12.07,
  employerNiPct: 13.8,
  pensionPct: 3,
  apprenticeLevyPct: 0.5,
};

const US_FRINGE_DEFAULTS = {
  phPct: 20,
  vacationPct: 8.583,
  ficaPct: 7.65,
};

// Which schema fields belong to which step (for partial validation)
// Per-step validation: only Step 0 (Entity) blocks navigation.
// All other steps are optional during navigation — full validation happens at submission.
const STEP_FIELDS_V2 = [
  ["productionId", "personId", "unionId", "departmentId", "designationId", "budgetTierId"], // Step 0: must select production + classification
  [],  // Step 1: Crew Details
  [],  // Step 2: Deal Structure (startDate validated at submission)
  [],  // Step 3: Rates (weeklyRate validated at submission)
  [],  // Step 4: Allowances
  [],  // Step 5: Nominal Coding
  [],  // Step 6: Right to Work
  [],  // Step 7: Documents
  [],  // Step 8: Payroll Start
  [],  // Step 9: Preview & Issue
];

// Legacy v1 step fields (kept for backward compat if needed)
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
    "productionFee",
    "idleDays",
    "idleDayRate",
    "housingAllowance",
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
const ALLOWED_CREATE_ROLES = ['super_admin', 'payroll_admin', 'production_accountant'];

// Build compliance checklist for payload (mirrors server complianceService.js)
function buildComplianceChecklist(territory) {
  const CHECKLISTS = {
    UK: [
      { itemKey: 'rtw_check', name: 'Right to Work check completed', responsibility: 'PRODUCTION', isRequired: true, isChecked: false },
      { itemKey: 'ni_number', name: 'NI Number provided', responsibility: 'CREW UPLOADS', isRequired: true, isChecked: false, crewField: 'niNumber' },
      { itemKey: 'tax_code', name: 'Tax code provided', responsibility: 'CREW UPLOADS', isRequired: true, isChecked: false, crewField: 'taxCode' },
      { itemKey: 'bank_details', name: 'Bank details provided', responsibility: 'CREW UPLOADS', isRequired: true, isChecked: false, crewField: 'bankSortCode' },
      { itemKey: 'nda_signed', name: 'NDA signed', responsibility: 'PRODUCTION', isRequired: true, isChecked: false },
      { itemKey: 'hb_policy', name: 'Anti-Harassment policy signed', responsibility: 'PRODUCTION', isRequired: true, isChecked: false },
      { itemKey: 'hs_policy', name: 'Health & Safety policy signed', responsibility: 'PRODUCTION', isRequired: true, isChecked: false },
      { itemKey: 'emergency', name: 'Emergency contact details', responsibility: 'CREW UPLOADS', isRequired: false, isChecked: false, crewField: 'emergencyContact' },
    ],
    US: [
      { itemKey: 'i9_completed', name: 'I-9 Work Authorization completed', responsibility: 'PRODUCTION', isRequired: true, isChecked: false },
      { itemKey: 'w4_completed', name: 'W-4 Federal Withholding form', responsibility: 'CREW UPLOADS', isRequired: true, isChecked: false, crewField: 'w4FilingStatus' },
      { itemKey: 'state_withholding', name: 'State withholding form', responsibility: 'CREW UPLOADS', isRequired: true, isChecked: false, crewField: 'stateWithholding' },
      { itemKey: 'ssn_provided', name: 'SSN provided', responsibility: 'CREW UPLOADS', isRequired: true, isChecked: false, crewField: 'ssn' },
      { itemKey: 'union_card', name: 'Union card number verified', responsibility: 'PRODUCTION', isRequired: true, isChecked: false },
      { itemKey: 'ach_details', name: 'ACH routing + account number', responsibility: 'CREW UPLOADS', isRequired: true, isChecked: false, crewField: 'achRoutingNumber' },
      { itemKey: 'nda_signed', name: 'NDA signed', responsibility: 'PRODUCTION', isRequired: true, isChecked: false },
    ],
    CA: [
      { itemKey: 'sin_provided', name: 'SIN provided', responsibility: 'CREW UPLOADS', isRequired: true, isChecked: false, crewField: 'sin' },
      { itemKey: 'td1_federal', name: 'TD1 Federal form', responsibility: 'CREW UPLOADS', isRequired: true, isChecked: false },
      { itemKey: 'bank_details', name: 'Bank details', responsibility: 'CREW UPLOADS', isRequired: true, isChecked: false },
      { itemKey: 'union_card', name: 'Union card number', responsibility: 'PRODUCTION', isRequired: true, isChecked: false },
    ],
    AU: [
      { itemKey: 'tfn_provided', name: 'Tax File Number provided', responsibility: 'CREW UPLOADS', isRequired: true, isChecked: false, crewField: 'tfn' },
      { itemKey: 'super_choice', name: 'Super fund choice form', responsibility: 'CREW UPLOADS', isRequired: true, isChecked: false, crewField: 'superFund' },
      { itemKey: 'bank_details', name: 'BSB + Account number', responsibility: 'CREW UPLOADS', isRequired: true, isChecked: false, crewField: 'bsb' },
    ],
  };
  return CHECKLISTS[territory] || CHECKLISTS.UK;
}

export default function DealMemoNew() {
  const navigate = useNavigate();
  const { id: editId } = useParams(); // If present, we're editing an existing deal memo
  const isEditMode = !!editId;
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role || 'super_admin';

  // Build step mapping: visible step index → original step index (0-9)
  // Non-accounting roles skip Payroll Start (original index 8)
  const { stepMap, labels: stepLabelsForRole } = useMemo(() => buildStepArrays(userRole), [userRole]);
  const totalSteps = stepLabelsForRole.length;

  // Redirect crew members and department heads away from this page
  useEffect(() => {
    if (user && !ALLOWED_CREATE_ROLES.includes(user.role)) {
      navigate('/deal-memos', { replace: true });
    }
  }, [user, navigate]);

  // Load existing deal memo for edit mode
  const { data: existingDealMemo, isLoading: editLoading } = useQuery({
    queryKey: ["deal-memos", "detail", editId],
    queryFn: async () => {
      const { data } = await api.get(`/deal-memos/${editId}`);
      return data.data;
    },
    enabled: isEditMode,
  });

  const DRAFT_KEY = "deal-memo-draft";
  const [currentStep, setCurrentStep] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY + "-step")) || 0; } catch { return 0; }
  });
  const [direction, setDirection] = useState(1);
  const [rateSource, setRateSource] = useState(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [unionConfig, setUnionConfig] = useState(() => {
    // Try to restore union config from saved labels on mount (for draft resume)
    try {
      const saved = localStorage.getItem(DRAFT_KEY + "-labels");
      if (saved) {
        const labels = JSON.parse(saved);
        if (labels.unionCode) {
          return getUnionConfig(labels.unionCode, null) || null;
        }
      }
    } catch {}
    return null;
  });
  const [draftSaved, setDraftSaved] = useState(false);
  const autoSaveTimerRef = useRef(null);

  // Store display labels for the review step
  const [classificationLabels, setClassificationLabels] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY + "-labels");
      return saved ? JSON.parse(saved) : { union: "", department: "", designation: "", budgetTier: "" };
    } catch { return { union: "", department: "", designation: "", budgetTier: "" }; }
  });

  // Nominal lines (auto-generated from deal structure)
  const [nominalLines, setNominalLines] = useState([]);
  const [codeMap, setCodeMap] = useState(null); // DesignationCodeMap for current designation

  const { data: productions, isLoading: prodsLoading } = useProductions();
  const rateLookup = useRateLookup();
  const createDealMemo = useCreateDealMemo();

  // Load draft from localStorage if available
  const [hasDraft, setHasDraft] = useState(() => !!localStorage.getItem(DRAFT_KEY));
  const savedDraft = useMemo(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    // resolver: zodResolver(dealMemoSchema), // Disabled — validation done manually in goNext
    defaultValues: savedDraft || DEFAULT_VALUES,
    mode: "onTouched",
  });

  const watchedUnionId = watch("unionId");
  const watchedDepartmentId = watch("departmentId");
  const watchedDesignationId = watch("designationId");
  const watchedBudgetTierId = watch("budgetTierId");
  const watchedProductionId = watch("productionId");
  const watchedPersonId = watch("personId");

  // Union config is loaded dynamically below (after productionCountry is derived)

  // Auto-fill crew fields from user's previous deal memo when person is selected
  useEffect(() => {
    if (!watchedPersonId || isEditMode) return;
    // Fetch latest deal memo for this person to get their crew fields
    api.get(`/deal-memos?personId=${watchedPersonId}&limit=1`).then(({ data: resp }) => {
      const prevDeal = resp.data?.[0] || resp.data?.dealMemos?.[0];
      if (!prevDeal) return;
      // Auto-fill crew fields that exist on the previous deal
      const crewFields = ['niNumber', 'taxCode', 'bankSortCode', 'bankAccountNumber', 'ssn', 'w4FilingStatus', 'stateWithholding', 'achRoutingNumber', 'achAccountNumber', 'tfn', 'superFund', 'superMemberNumber', 'bsb', 'sin', 'province', 'dateOfBirth', 'address', 'emergencyContact', 'employmentStatus'];
      let filled = 0;
      crewFields.forEach((f) => {
        if (prevDeal[f]) {
          setValue(f, prevDeal[f], { shouldDirty: false });
          filled++;
        }
      });
      if (filled > 0) {
        toast.success(`Auto-filled ${filled} crew fields from previous deal memo`, { duration: 3000 });
      }
    }).catch(() => {}); // Silently ignore if no previous deal
  }, [watchedPersonId, isEditMode, setValue]);

  // Build person list from the selected production's members
  const selectedProduction = useMemo(
    () => productions?.find((p) => p._id === watchedProductionId),
    [productions, watchedProductionId]
  );

  // Derive country from the selected production
  const productionCountry = selectedProduction?.country || "UK";
  const cSymbol = currencySymbol(productionCountry);

  // API-driven cascading selects (country-aware)
  const { data: unions, isLoading: unionsLoading } = useUnions(productionCountry);
  const { data: departments, isLoading: deptsLoading } = useDepartments(watchedUnionId);
  const { data: designations, isLoading: desigsLoading } = useDesignations(watchedDepartmentId);
  const { data: budgetTiers, isLoading: tiersLoading } = useBudgetTiers(watchedUnionId, productionCountry);
  const { data: entities, isLoading: entitiesLoading } = useContractingEntities(watchedProductionId);

  // Dynamically load union config when union selection changes (so step0 fields appear immediately)
  useEffect(() => {
    if (!watchedUnionId || !unions?.length) return;
    const unionObj = unions.find((u) => u._id === watchedUnionId);
    if (!unionObj) return;
    const uConfig = getUnionConfig(unionObj.code, productionCountry);
    setUnionConfig(uConfig);
    // Apply union defaults immediately so fields pre-fill
    if (uConfig?.defaults) {
      Object.entries(uConfig.defaults).forEach(([k, v]) => {
        const current = getValues(`unionFields.${k}`);
        if (current === undefined || current === null || current === '' || current === 0) {
          setValue(`unionFields.${k}`, v, { shouldDirty: false });
        }
      });
    }
  }, [watchedUnionId, unions, productionCountry]);

  // Generate nominal lines from current form values
  const generateNominalLines = useCallback(async () => {
    const vals = getValues();
    const territory = selectedProduction?.country || 'UK';
    const lines = [];
    const cs = cSymbol;
    const nicLabel = territory === 'US' ? 'FICA / Employer Tax' : territory === 'AU' ? 'Superannuation' : 'Employer NIC';
    const weekly = Number(vals.weeklyRate) || Number(vals.rateAmount) || Number(vals.dailyRate) * 5 || 0;
    const hpWeekly = (vals.hpMode === 'excl' && territory !== 'US') ? weekly * 0.1207 : 0;
    const nicPct = territory === 'US' ? 0.0765 : territory === 'AU' ? 0.115 : 0.138;
    const penPct = territory === 'US' ? 0.20 : territory === 'AU' ? 0 : 0.03;

    // Fetch designation → budget code mapping from API
    let cm = codeMap;
    if (!cm) {
      try {
        const desigName = classificationLabels?.designation || '';
        const deptName = classificationLabels?.department || '';
        if (desigName) {
          const { data } = await api.get(`/nominal-codes/map?designation=${encodeURIComponent(desigName)}&department=${encodeURIComponent(deptName)}`);
          cm = data.data || data;
          setCodeMap(cm);
        }
      } catch (e) {
        // Fallback to generic codes if API fails
        console.warn('Failed to fetch code mapping, using defaults:', e.message);
      }
    }

    // Use mapped codes or fallback to generic
    const labourCode = cm?.labourCode || '2302';
    const otCode = cm?.overtimeCode || '4401';
    const allowCode = cm?.allowanceCode || '2580';
    const fringeCode = cm?.fringeCode || '2099';
    const pensionCode = cm?.pensionCode || '2097';
    const hpCode = cm?.holidayPayCode || '2096';
    const deptLabel = classificationLabels?.department || 'DEPT';

    // Core lines with real budget codes
    if (hpWeekly > 0) {
      lines.push({ code: labourCode, label: `Basic Labour`, description: `Contracted rate — ${deptLabel}`, isCore: true, estimatedWeekly: weekly });
      lines.push({ code: hpCode, label: `Holiday Pay`, description: `12.07% on basic — ${deptLabel}`, isCore: true, estimatedWeekly: Math.round(hpWeekly * 100) / 100 });
    } else {
      lines.push({ code: labourCode, label: `Basic Labour`, description: `Contracted rate — ${deptLabel}`, isCore: true, estimatedWeekly: weekly });
    }
    lines.push({ code: otCode, label: 'Overtime', description: 'OT hours (from timecards)', isCore: true, estimatedWeekly: null });
    lines.push({ code: otCode, label: 'Meal Penalties', description: 'Late meal break violations', isCore: true, estimatedWeekly: null });
    lines.push({ code: otCode, label: '6th/7th Day Premiums', description: 'Consecutive day premiums', isCore: true, estimatedWeekly: null });
    lines.push({ code: fringeCode, label: nicLabel, description: `Employer social contributions — ${deptLabel}`, isCore: true, estimatedWeekly: Math.round(weekly * nicPct * 100) / 100 });

    // Pension
    if (penPct > 0) {
      lines.push({ code: pensionCode, label: 'Pension', description: `Employer pension contribution — ${deptLabel}`, isCore: true, estimatedWeekly: Math.round(weekly * penPct * 100) / 100 });
    }

    // v2 allowances array (from Step 4 Allowances)
    const v2Allowances = vals.allowances || [];
    v2Allowances.forEach((a) => {
      const amt = Number(a?.amount) || 0;
      if (amt <= 0) return;
      const freq = a.frequency || 'weekly';
      let weeklyEst = amt;
      if (freq === 'daily') weeklyEst = amt * 5;
      else if (freq === 'monthly') weeklyEst = amt / 4.33;
      else if (freq === 'one_time') weeklyEst = 0;
      lines.push({
        code: allowCode,
        label: a.name || 'Allowance',
        description: `${cs}${amt}/${freq}`,
        estimatedWeekly: Math.round(weeklyEst * 100) / 100,
      });
    });

    // Union-specific allowances (from unionFields — box rental, kit, phone, car, etc.)
    const uf = vals.unionFields || {};
    const unionAllowanceFields = [
      { key: 'boxRentalWeekly', label: 'Box Rental' },
      { key: 'kitAllowanceWeekly', label: 'Kit Allowance' },
      { key: 'computerRentalWeekly', label: 'Computer Rental' },
      { key: 'phoneAllowanceWeekly', label: 'Phone Allowance' },
      { key: 'carAllowanceWeekly', label: 'Car Allowance' },
      { key: 'travelAllowanceDaily', label: 'Travel Allowance' },
      { key: 'perDiem', label: 'Per Diem' },
      { key: 'overnightAllowance', label: 'Overnight Allowance' },
      { key: 'costumeAllowance', label: 'Costume Allowance' },
      { key: 'wigAllowance', label: 'Wig Allowance' },
      { key: 'porterageFee', label: 'Porterage Fee' },
      { key: 'mileageRate', label: 'Mileage' },
      { key: 'housingAllowanceWeekly', label: 'Housing Allowance' },
      { key: 'cellPhoneAllowance', label: 'Cell Phone Allowance' },
    ];
    unionAllowanceFields.forEach(({ key, label }) => {
      const amt = Number(uf[key]) || 0;
      if (amt > 0) {
        const isDaily = key.includes('Daily') || key === 'perDiem' || key === 'mileageRate';
        const weeklyEst = isDaily ? amt * 5 : amt;
        lines.push({
          code: allowCode,
          label,
          description: `${cs}${amt}/${isDaily ? 'daily' : 'weekly'}`,
          estimatedWeekly: Math.round(weeklyEst * 100) / 100,
        });
      }
    });

    setNominalLines(lines);
    setValue('nominalLines', lines, { shouldDirty: true });
  }, [getValues, selectedProduction, cSymbol, setValue, codeMap, classificationLabels]);

  // ---- Draft save/load ----
  const saveDraft = useCallback(() => {
    try {
      const vals = getValues();
      localStorage.setItem(DRAFT_KEY, JSON.stringify(vals));
      localStorage.setItem(DRAFT_KEY + "-step", JSON.stringify(currentStep));
      localStorage.setItem(DRAFT_KEY + "-labels", JSON.stringify(classificationLabels));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    } catch (e) {
      console.warn("Failed to save draft:", e);
    }
  }, [getValues, currentStep, classificationLabels]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(DRAFT_KEY + "-step");
    localStorage.removeItem(DRAFT_KEY + "-labels");
  }, []);

  // Save draft to server (creates deal memo with status: 'draft')
  const saveDraftToServer = useCallback(() => {
    const data = getValues();
    const payload = {
      productionId: data.productionId,
      personId: data.personId,
      startDate: data.startDate || new Date().toISOString().slice(0, 10),
      unionId: data.unionId,
      departmentId: data.departmentId,
      designationId: data.designationId,
      budgetTierId: data.budgetTierId,
      contractingEntityId: data.contractingEntityId || undefined,
      weeklyRate: Number(data.weeklyRate) || Number(data.rateAmount) || 0,
      dailyRate: Number(data.dailyRate) || 0,
      hourlyRate: Number(data.hourlyRate) || 0,
      // v2 fields
      screenCredit: data.screenCredit || undefined,
      employmentStatus: data.employmentStatus || undefined,
      dealType: data.dealType || 'weekly',
      exclusivity: data.exclusivity || undefined,
      rateBasis: data.rateBasis || undefined,
      rateType: data.rateType || undefined,
      rateAmount: Number(data.rateAmount) || undefined,
      hpMode: data.hpMode || 'excl',
      separateRates: data.separateRates || false,
      prepRate: data.prepRate || undefined,
      shootRate: data.shootRate || undefined,
      wrapRate: data.wrapRate || undefined,
      allowances: data.allowances?.length ? data.allowances : undefined,
      rightToWork: data.rightToWork || undefined,
      nominalLines: nominalLines.length > 0 ? nominalLines : undefined,
      payrollBureau: data.bureauId || undefined,
      payFrequency: data.payFrequency || 'weekly',
      signingDocuments: data.documents?.filter(d => d.filename) || undefined,
      // Union-specific fields
      unionSpecificFields: data.unionFields || {},
      // Keep as draft
      status: 'draft',
      schemaVersion: 2,
      territory: productionCountry,
      unionKey: (unions ?? []).find(u => u._id === data.unionId)?.code || undefined,
    };

    // Only send if minimum required fields are present
    if (!payload.productionId || !payload.personId || !payload.unionId || !payload.departmentId || !payload.designationId || !payload.budgetTierId) {
      toast.error("Please complete at least Step 1 (Entity & Classification) before saving as draft");
      return;
    }

    createDealMemo.mutate(payload, {
      onSuccess: (result) => {
        clearDraft();
        toast.success("Draft saved to server");
        navigate(`/deal-memos/${result._id || result.id}`);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to save draft");
      },
    });
  }, [getValues, productionCountry, createDealMemo, navigate, clearDraft]);

  // Populate form when editing an existing deal memo
  useEffect(() => {
    if (!isEditMode || !existingDealMemo) return;
    const dm = existingDealMemo;
    // Map deal memo fields to form fields
    const formValues = {
      productionId: dm.productionId?._id || dm.productionId,
      personId: dm.personId?._id || dm.personId,
      startDate: dm.startDate ? new Date(dm.startDate).toISOString().slice(0, 10) : "",
      endDate: dm.endDate ? new Date(dm.endDate).toISOString().slice(0, 10) : "",
      unionId: dm.unionId?._id || dm.unionId,
      departmentId: dm.departmentId?._id || dm.departmentId,
      designationId: dm.designationId?._id || dm.designationId,
      budgetTierId: dm.budgetTierId?._id || dm.budgetTierId,
      contractingEntityId: dm.contractingEntityId,
      weeklyRate: dm.weeklyRate || 0,
      dailyRate: dm.dailyRate || 0,
      hourlyRate: dm.hourlyRate || 0,
      guaranteedHours: dm.guaranteedHoursPerWeek || 50,
      dealType: dm.dealType || "weekly",
      rateBasis: dm.rateBasis || "weekly",
      rateAmount: dm.weeklyRate || 0,
      hpMode: dm.hpMode || "excl",
      standardWorkDayHrs: dm.standardWorkDayHrs || 10,
      lunchBreakHrs: dm.lunchBreakHrs || 1,
      sixthDayMultiplier: dm.sixthDayMultiplier || 1.5,
      seventhDayMultiplier: dm.seventhDayMultiplier || 2.0,
      nightPremiumPct: dm.nightPremiumPct || 25,
      turnaroundMinHrs: dm.turnaroundMinHrs || 11,
      mealPenaltyEnabled: !!dm.mealPenaltyRate,
      mealPenaltyAmount: dm.mealPenaltyRate || 35,
      mealPenaltyAfterHrs: dm.mealPenaltyAfterHrs || 6,
      kitAllowance: dm.kitAllowance || 0,
      carAllowance: dm.carAllowance || 0,
      phoneAllowance: dm.phoneAllowance || 0,
      computerAllowance: dm.computerAllowance || 0,
      travelAllowance: dm.travelAllowance || 0,
      perDiem: dm.perDiemRate || 0,
      housingAllowance: dm.housingAllowance || 0,
      payFrequency: dm.payFrequency || "weekly",
      taxCreditScheme: dm.taxCreditScheme || "",
      exclusivity: dm.exclusivity || "",
      payOrPlay: dm.payOrPlay || false,
      employmentStatus: dm.employmentStatus || "",
      screenCredit: dm.screenCredit || "",
    };
    reset(formValues);
    // Set classification labels from populated data
    setClassificationLabels({
      union: dm.unionId?.name || "",
      unionCode: dm.unionId?.code || dm.unionKey || "",
      department: dm.departmentId?.name || "",
      designation: dm.designationId?.name || "",
      budgetTier: dm.budgetTierId?.name || "",
    });
    // Restore union config and union-specific field values for edit mode
    const editUnionCode = dm.unionId?.code || dm.unionKey || "";
    const editTerritory = dm.territory || productionCountry;
    const editUConfig = getUnionConfig(editUnionCode, editTerritory);
    setUnionConfig(editUConfig);
    if (dm.unionSpecificFields) {
      Object.entries(dm.unionSpecificFields).forEach(([k, v]) => {
        setValue(`unionFields.${k}`, v, { shouldDirty: false });
      });
    }
    setHasDraft(false); // Don't show "Resuming from draft" banner in edit mode
  }, [isEditMode, existingDealMemo, reset]);

  // Auto-save every 5 seconds when form is dirty
  useEffect(() => {
    if (!isDirty) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        const vals = getValues();
        localStorage.setItem(DRAFT_KEY, JSON.stringify(vals));
        localStorage.setItem(DRAFT_KEY + "-step", JSON.stringify(currentStep));
        localStorage.setItem(DRAFT_KEY + "-labels", JSON.stringify(classificationLabels));
      } catch (e) { /* ignore */ }
    }, 5000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [isDirty, getValues, currentStep, classificationLabels]);

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

  // Reset classification when production (country) changes
  // Skip on initial mount if resuming from draft (savedDraft exists)
  const isInitialMountRef = useRef(!!savedDraft);
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return; // Skip reset on initial mount with draft
    }
    if (watchedProductionId) {
      setValue("unionId", "");
      setValue("departmentId", "");
      setValue("designationId", "");
      setValue("budgetTierId", "");
      // Set country-appropriate fringe defaults
      if (productionCountry === "US") {
        Object.entries(US_FRINGE_DEFAULTS).forEach(([k, v]) => setValue(k, v));
        setValue("holidayPayPct", 0);
        setValue("employerNiPct", 0);
        setValue("pensionPct", 0);
        setValue("apprenticeLevyPct", 0);
      } else {
        Object.entries(UK_FRINGE_DEFAULTS).forEach(([k, v]) => setValue(k, v));
        setValue("phPct", 0);
        setValue("vacationPct", 0);
        setValue("ficaPct", 0);
      }
    }
  }, [watchedProductionId, productionCountry, setValue]);

  // ---- Step navigation ----
  // No useCallback — goNext uses too many dependencies that change frequently.
  // Fresh closure every render avoids stale state bugs.
  const goNext = async () => {
    const fieldsToValidate = STEP_FIELDS_V2[currentStep] || [];
    if (fieldsToValidate.length > 0) {
      const valid = await trigger(fieldsToValidate);
      if (!valid) {
        // Fallback: check if values actually exist (trigger may fail due to stale form state)
        const vals = getValues();
        const allFilled = fieldsToValidate.every(f => vals[f] !== undefined && vals[f] !== '' && vals[f] !== null);
        if (!allFilled) return; // truly invalid
        // Values exist but trigger failed (stale state) — allow advancement
      }
    }

    // Before advancing from Step 0: set labels + fetch rates synchronously
    const currentOriginalStep = stepMap[currentStep];
    if (currentOriginalStep === 0) {
      const vals = getValues();

      // Set classification labels FIRST (needed for compliance check + nominal codes)
      const unionObj = (unions ?? []).find((u) => u._id === vals.unionId);
      const unionName = unionObj?.name ?? "";
      const unionCode = unionObj?.code ?? "";
      const deptName = (departments ?? []).find((d) => d._id === vals.departmentId)?.name ?? "";
      const desigName = (designations ?? []).find((d) => d._id === vals.designationId)?.name ?? "";
      const tierName = (budgetTiers ?? []).find((t) => t._id === vals.budgetTierId)?.name ?? "";
      setClassificationLabels({ union: unionName, unionCode, department: deptName, designation: desigName, budgetTier: tierName });
      setCodeMap(null);

      // Load union config
      const uConfig = getUnionConfig(unionCode, productionCountry);
      setUnionConfig(uConfig);
      if (uConfig?.defaults) {
        Object.entries(uConfig.defaults).forEach(([k, v]) => {
          setValue(`unionFields.${k}`, v, { shouldDirty: false });
        });
      }

      // Fetch rates synchronously
      try {
        const { data: lookupResp } = await api.post('/rate-cards/lookup', {
          unionId: vals.unionId,
          departmentId: vals.departmentId,
          designationId: vals.designationId,
          budgetTierId: vals.budgetTierId,
        });
        const rateData = lookupResp?.data || lookupResp?.primary || lookupResp;
        if (rateData?.weeklyRate > 0) {
          setValue("weeklyRate", rateData.weeklyRate, { shouldDirty: true });
          setValue("rateBasis", "weekly", { shouldDirty: true });
          setValue("rateAmount", rateData.weeklyRate, { shouldDirty: true });
          if (rateData.dailyRate > 0) setValue("dailyRate", rateData.dailyRate, { shouldDirty: true });
          if (rateData.hourlyRate > 0) setValue("hourlyRate", rateData.hourlyRate, { shouldDirty: true });
          // Also set union-specific rate fields (they use unionFields. prefix)
          setValue("unionFields.weeklyRate", rateData.weeklyRate, { shouldDirty: true });
          if (rateData.dailyRate > 0) setValue("unionFields.dailyRate", rateData.dailyRate, { shouldDirty: true });
          if (rateData.hourlyRate > 0) {
            setValue("unionFields.hourlyRate", rateData.hourlyRate, { shouldDirty: true });
            setValue("unionFields.overtimeRateHourly", rateData.hourlyRate, { shouldDirty: true });
          }
          setRateSource(rateData.sourceUrl ? { url: rateData.sourceUrl, label: rateData.sourceDocument } : null);
        }
      } catch { /* rate lookup failed, user enters manually */ }
    }

    // Advance step
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));

    // Auto-generate nominal lines when entering Nominal Coding step
    const nextOriginalStep = stepMap[currentStep + 1];
    if (nextOriginalStep === 5) {
      // Entering Nominal Coding — always regenerate to pick up allowance changes
      generateNominalLines();
    }

    // After Step 0: if rate wasn't set, try union minimum fallback
    if (currentOriginalStep === 0) {
      const currentWeekly = getValues("weeklyRate");
      if (!currentWeekly || currentWeekly <= 0) {
        try {
          const desigName = classificationLabels?.designation || (designations ?? []).find(d => d._id === getValues("designationId"))?.name || '';
          const tierName = classificationLabels?.budgetTier || '';
          const { data: verifyResp } = await api.post('/rates-bible/verify', {
            territoryCode: productionCountry,
            grade: desigName,
            budgetTier: tierName,
            proposedWeeklyRate: 999999,
          });
          const vd = verifyResp.data || verifyResp;
          if (vd?.minimum > 0) {
            setValue("weeklyRate", vd.minimum, { shouldDirty: true });
            setValue("rateBasis", "weekly", { shouldDirty: true });
            setValue("rateAmount", vd.minimum, { shouldDirty: true });
            setValue("dailyRate", Math.round(vd.minimum / 5 * 100) / 100, { shouldDirty: true });
            setValue("unionFields.weeklyRate", vd.minimum, { shouldDirty: true });
            toast.info(`Set to union minimum: £${vd.minimum.toLocaleString()}/wk (${vd.agreementName})`);
          } else if (vd?.isIndividuallyNegotiated) {
            toast.info("Rate is individually negotiated — please enter the agreed rate manually", { duration: 4000 });
          }
        } catch { /* ignore */ }
      }
    }
  };

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  // ---- Submit ----
  const issueModeRef = useRef(false);

  const onIssue = () => {
    issueModeRef.current = true;
    onSubmit();
  };

  const onSubmit = handleSubmit((data) => {
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
      // UK fringes
      holidayPayPct: data.holidayPayPct,
      employerNiPct: data.employerNiPct,
      pensionPct: data.pensionPct,
      apprenticeLevyPct: data.apprenticeLevyPct,
      // US fringes
      phPct: data.phPct,
      vacationPct: data.vacationPct,
      ficaPct: data.ficaPct,
      stateTaxState: data.stateTaxState || undefined,
      // US-specific rate fields
      programFee: data.programFee || undefined,
      overageRate: data.overageRate || undefined,
      prepDays: data.prepDays || undefined,
      shootDays: data.shootDays || undefined,
      studioOrLocation: data.studioOrLocation || undefined,
      episodeLength: data.episodeLength || undefined,
      // Overtime & penalties
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
      // New allowance fields
      productionFee: data.productionFee,
      productionFeeBasis: data.productionFeeBasis || undefined,
      idleDays: data.idleDays,
      idleDayRate: data.idleDayRate,
      housingAllowance: data.housingAllowance,
      customAllowances: data.customAllowances?.length ? data.customAllowances : undefined,
      // ── V2 fields ──────────────────────────────────────
      schemaVersion: 2,
      contractingEntityId: data.contractingEntityId || undefined,
      territory: productionCountry,
      unionKey: (unions ?? []).find(u => u._id === data.unionId)?.code || undefined,
      screenCredit: data.screenCredit || undefined,
      isCustomDeal: data.isCustomDeal || false,
      // Crew details
      employmentStatus: data.employmentStatus || undefined,
      niNumber: data.niNumber || undefined,
      taxCode: data.taxCode || undefined,
      ssn: data.ssn || undefined,
      // Deal structure
      dealType: data.dealType || 'weekly',
      exclusivity: data.exclusivity || undefined,
      // Separate rates
      separateRates: data.separateRates || false,
      prepRate: data.prepRate || undefined,
      shootRate: data.shootRate || undefined,
      wrapRate: data.wrapRate || undefined,
      // Right to Work
      rightToWork: data.rightToWork || undefined,
      // Rates v2
      rateBasis: data.rateBasis || undefined,
      rateType: data.rateType || undefined,
      hpMode: data.hpMode || 'excl',
      // Nominal lines
      nominalLines: nominalLines.length > 0 ? nominalLines : undefined,
      taxCreditScheme: data.taxCreditScheme || undefined,
      // Payroll start
      payrollBureau: data.bureauId || undefined,
      payFrequency: data.payFrequency || 'weekly',
      // Responsibility assignments
      productionAccountant: data.productionAccountant || undefined,
      payrollAdmin: data.payrollAdmin || undefined,
      hodApprover: data.hodApprover || undefined,
      timecardApprover: data.timecardApprover || undefined,
      // Documents
      signingDocuments: data.documents?.filter(d => d.filename) || undefined,
      // Compliance checklist (auto-generated from territory)
      complianceChecklist: buildComplianceChecklist(productionCountry),
      // Union-specific fields (flexible JSON object)
      unionSpecificFields: data.unionFields || {},
      // Status: "issued" when admin clicks Issue, "draft" otherwise
      status: issueModeRef.current ? 'issued' : 'draft',
    };

    issueModeRef.current = false;

    if (isEditMode) {
      // Update existing deal memo
      api.put(`/deal-memos/${editId}`, payload)
        .then(({ data: resp }) => {
          clearDraft();
          toast.success("Deal memo updated successfully", { duration: 3000 });
          navigate(`/deal-memos/${editId}`);
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || "Failed to update deal memo");
        });
    } else {
      createDealMemo.mutate(payload, {
        onSuccess: (result) => {
          clearDraft();
          toast.success(
            payload.status === 'issued'
              ? "Deal memo issued to crew member"
              : "Deal memo saved as draft",
            { duration: 3000 }
          );
          navigate(`/deal-memos/${result._id || result.id}`);
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to create deal memo");
        },
      });
    }
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
        productionFee: num(formData.productionFee) ?? 0,
        productionFeeBasis: formData.productionFeeBasis || "",
        idleDays: num(formData.idleDays) ?? 0,
        idleDayRate: num(formData.idleDayRate) ?? 0,
        housingAllowance: num(formData.housingAllowance) ?? 0,
        customAllowances: formData.customAllowances || [],
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

  // ---- Render steps (v2: 10 steps, mapped by role) ----
  const commonProps = { control, errors, setValue, watch, country: productionCountry, cSymbol, currencySymbol: cSymbol };

  // Map visible step index → original step index using stepMap
  const renderStep = () => {
    const originalStep = stepMap[currentStep] ?? currentStep;
    switch (originalStep) {
      case 0:
        return (
          <Step0EntityTerritory
            {...commonProps}
            productions={productions}
            productionsLoading={prodsLoading}
            personOptions={personOptions}
            entities={entities}
            entitiesLoading={entitiesLoading}
            unions={unions}
            unionsLoading={unionsLoading}
            departments={departments}
            departmentsLoading={deptsLoading}
            designations={designations}
            designationsLoading={desigsLoading}
            budgetTiers={budgetTiers}
            budgetTiersLoading={tiersLoading}
            territory={productionCountry}
            unionFields={unionConfig?.steps?.step0}
          />
        );
      case 1:
        return <Step1CrewDetails {...commonProps} territory={productionCountry} unionFields={unionConfig?.steps?.step1} />;
      case 2:
        return <Step2DealStructure {...commonProps} currencySymbol={cSymbol} unionFields={unionConfig?.steps?.step2} />;
      case 3:
        return (
          <Step3Rates
            {...commonProps}
            currencySymbol={cSymbol}
            territory={productionCountry}
            unionKey={classificationLabels?.unionCode || (unions ?? []).find(u => u._id === watchedUnionId)?.code}
            designationName={classificationLabels?.designation}
            budgetTierName={classificationLabels?.budgetTier}
            rateSource={rateSource}
            unionFields={unionConfig?.steps?.step3}
          />
        );
      case 4:
        return <Step4Allowances {...commonProps} unionFields={unionConfig?.steps?.step4} allowanceSuggestions={unionConfig?.steps?.allowanceSuggestions} />;
      case 5:
        return <Step5NominalCoding {...commonProps} territory={productionCountry} nominalLines={nominalLines} setValue={setValue} designationName={classificationLabels?.designation} departmentName={classificationLabels?.department} />;
      case 6:
        return <Step6Compliance {...commonProps} territory={productionCountry} unionKey={watch("unionKey")} />;
      case 7:
        return <Step7Documents {...commonProps} />;
      case 8:
        return <Step8PayrollStart {...commonProps} territory={productionCountry} />;
      case 9:
        return (
          <Step9PreviewIssue
            watch={watch}
            labels={classificationLabels}
            currencySymbol={cSymbol}
            onSaveDraft={saveDraftToServer}
            onIssue={onIssue}
            isSubmitting={createDealMemo.isPending}
            userRole={user?.role}
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
      className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5"
    >
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/deal-memos")}>
          <ChevronLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? "Edit Deal Memo" : "New Deal Memo"}</h1>
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

      {/* Draft resume banner */}
      {hasDraft && (
        <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Save className="size-4 text-blue-500" />
            <span className="text-sm">Resuming from saved draft (Step {currentStep + 1})</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => { clearDraft(); reset(DEFAULT_VALUES); setCurrentStep(0); setHasDraft(false); setClassificationLabels({ union: "", department: "", designation: "", budgetTier: "" }); }}>
            Discard Draft
          </Button>
        </div>
      )}

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
            onSaveDraft={saveDraft}
            draftSaved={draftSaved}
            isSubmitting={createDealMemo.isPending}
            userRole={user?.role || 'super_admin'}
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
                    {field.value
                      ? <span className="truncate">{(productions || []).find(p => p._id === field.value)?.name || "Select a production..."}</span>
                      : <SelectValue placeholder="Select a production..." />
                    }
                  </SelectTrigger>
                  <SelectContent>
                    {(productions || []).map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name || p.title}
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
                      {field.value
                        ? <span className="truncate">{personOptions.find(p => p._id === field.value)?.name || "Select a crew member..."}</span>
                        : <SelectValue placeholder={watchedProductionId ? "Select a crew member..." : "Select a production first"} />
                      }
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
function StepRates({ control, errors, watch, setValue, rateSource, country, cSymbol }) {
  const unionId = watch("unionId");
  const departmentId = watch("departmentId");
  const designationId = watch("designationId");
  const budgetTierId = watch("budgetTierId");
  const isUS = country === "US";

  const weeklyRate = watch("weeklyRate") || 0;
  const hourlyRate = watch("hourlyRate") || 0;
  const guaranteedHours = watch("guaranteedHours") || 0;

  // Mismatch detection
  const expectedWeekly = hourlyRate > 0 && guaranteedHours > 0 ? Math.round(hourlyRate * guaranteedHours * 100) / 100 : 0;
  const hasMismatch = weeklyRate > 0 && expectedWeekly > 0 && Math.abs(weeklyRate - expectedWeekly) > 1;

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

      {hasMismatch && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <AlertCircle className="size-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-600 dark:text-amber-400">
            <span className="font-medium">Rate mismatch:</span> Weekly rate ({cSymbol}{weeklyRate.toLocaleString()}) doesn't match hourly ({cSymbol}{hourlyRate}) x guaranteed hours ({guaranteedHours}) = {cSymbol}{expectedWeekly.toLocaleString()}.
            This is normal for packaged weekly deals where the weekly rate is negotiated independently.
          </div>
        </div>
      )}

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
              currencySymbol={cSymbol}
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
              currencySymbol={cSymbol}
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
              currencySymbol={cSymbol}
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

      {/* US-specific rate fields */}
      {isUS && (
        <>
          <Separator />
          <div className="flex items-center gap-2 text-muted-foreground">
            <h3 className="text-sm font-semibold uppercase tracking-wide">US Deal Terms</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Controller
              name="programFee"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Program Fee</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {cSymbol}
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
                </div>
              )}
            />

            <Controller
              name="overageRate"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Overage Rate</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {cSymbol}
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
                </div>
              )}
            />

            <Controller
              name="episodeLength"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Episode Length (min)</Label>
                  <Input
                    type="number"
                    step="1"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="tabular-nums"
                  />
                </div>
              )}
            />

            <Controller
              name="prepDays"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Prep Days</Label>
                  <Input
                    type="number"
                    step="1"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="tabular-nums"
                  />
                </div>
              )}
            />

            <Controller
              name="shootDays"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Shoot Days</Label>
                  <Input
                    type="number"
                    step="1"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="tabular-nums"
                  />
                </div>
              )}
            />

            <Controller
              name="studioOrLocation"
              control={control}
              render={({ field }) => (
                <div className="space-y-1.5">
                  <Label>Studio / Location</Label>
                  <Select value={field.value || "studio"} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ---- Step 4: Fringes ----
function StepFringes({ control, errors, watch, setValue, country }) {
  const isUS = country === "US";

  const ukFringeFields = [
    { name: "holidayPayPct", label: "Holiday Pay %", info: "Statutory holiday pay accrual percentage" },
    { name: "employerNiPct", label: "Employer NI %", info: "Employer National Insurance contribution rate" },
    { name: "pensionPct", label: "Pension %", info: "Auto-enrolment pension employer contribution" },
    { name: "apprenticeLevyPct", label: "Apprenticeship Levy %", info: "Applicable for pay bills over 3M" },
  ];

  const usFringeFields = [
    { name: "phPct", label: "P&H %", info: "Pension & Health contribution percentage" },
    { name: "vacationPct", label: "Vacation %", info: "Vacation pay accrual percentage" },
    { name: "ficaPct", label: "FICA %", info: "Federal Insurance Contributions Act (employer share)" },
  ];

  const fringeFields = isUS ? usFringeFields : ukFringeFields;

  const totalFringe = isUS
    ? (watch("phPct") || 0) + (watch("vacationPct") || 0) + (watch("ficaPct") || 0)
    : (watch("holidayPayPct") || 0) + (watch("employerNiPct") || 0) + (watch("pensionPct") || 0) + (watch("apprenticeLevyPct") || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Percent className="size-5" />
        <h2 className="text-lg font-semibold">Fringes</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        {isUS
          ? "Employer-side costs applied on top of the base rate. Defaults are pre-filled based on US union standards."
          : "Employer-side costs applied on top of the base rate. Defaults are pre-filled based on current UK regulations."}
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

        {/* US: State tax selector */}
        {isUS && (
          <Controller
            name="stateTaxState"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label>State</Label>
                  <Tooltip>
                    <TooltipTrigger className="text-muted-foreground hover:text-foreground transition-colors">
                      <Info className="size-3.5" />
                    </TooltipTrigger>
                    <TooltipContent side="top">State for tax withholding purposes</TooltipContent>
                  </Tooltip>
                </div>
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select state..." />
                  </SelectTrigger>
                  <SelectContent>
                    {["CA", "NY", "GA", "LA", "NM", "IL", "TX", "FL", "NC", "OR", "WA", "PA", "MA", "NJ", "CT", "Other"].map((st) => (
                      <SelectItem key={st} value={st}>{st}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        )}
      </div>

      {/* Quick total */}
      <div className="rounded-lg border bg-muted/40 p-3">
        <p className="text-sm font-medium">
          Total Fringe Rate:{" "}
          <span className="text-primary font-semibold">
            {totalFringe.toFixed(2)}%
          </span>
        </p>
      </div>
    </div>
  );
}

// ---- Step 5: Overtime & Penalties ----
function StepOvertime({ control, errors, watch, setValue, country, cSymbol }) {
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
                      {cSymbol}
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
function StepAllowances({ control, errors, watch, setValue, country, cSymbol }) {
  const allowanceFields = [
    { name: "kitAllowance", label: "Kit Allowance" },
    { name: "travelAllowance", label: "Travel Allowance" },
    { name: "perDiem", label: "Per Diem" },
    { name: "phoneAllowance", label: "Phone Allowance" },
    { name: "computerAllowance", label: "Computer Allowance" },
    { name: "carAllowance", label: "Car Allowance" },
    { name: "housingAllowance", label: "Housing Allowance" },
  ];

  const customAllowances = watch("customAllowances") || [];

  const totalFixedAllowances = allowanceFields.reduce(
    (sum, f) => sum + (watch(f.name) || 0),
    0
  );
  const totalCustomAllowances = customAllowances.reduce(
    (sum, c) => sum + (c.amount || 0),
    0
  );
  const totalAllowances = totalFixedAllowances + totalCustomAllowances;

  const addCustomAllowance = () => {
    const current = watch("customAllowances") || [];
    setValue("customAllowances", [...current, { name: "", amount: 0, period: "weekly" }], { shouldDirty: true });
  };

  const removeCustomAllowance = (index) => {
    const current = watch("customAllowances") || [];
    setValue("customAllowances", current.filter((_, i) => i !== index), { shouldDirty: true });
  };

  const updateCustomAllowance = (index, field, value) => {
    const current = [...(watch("customAllowances") || [])];
    current[index] = { ...current[index], [field]: value };
    setValue("customAllowances", current, { shouldDirty: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Briefcase className="size-5" />
        <h2 className="text-lg font-semibold">Allowances</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Allowance amounts in {country === "US" ? "USD" : "GBP"}. Leave at 0 if not applicable.
      </p>

      {/* Production Fee */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Production Fee</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg">
          <Controller
            name="productionFee"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {cSymbol}
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
                {errors.productionFee && (
                  <p className="text-xs text-destructive">{errors.productionFee.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="productionFeeBasis"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Basis</Label>
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select basis..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One-time</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="per_episode">Per Episode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Idle Days */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Idle Days</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg">
          <Controller
            name="idleDays"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Number of Idle Days</Label>
                <Input
                  type="number"
                  step="1"
                  min={0}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="tabular-nums"
                />
                {errors.idleDays && (
                  <p className="text-xs text-destructive">{errors.idleDays.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="idleDayRate"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Idle Day Rate</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {cSymbol}
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
                {errors.idleDayRate && (
                  <p className="text-xs text-destructive">{errors.idleDayRate.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Fixed Allowances (including Housing) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Standard Allowances</h3>
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
                      {cSymbol}
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
      </div>

      <Separator />

      {/* Custom Allowances */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Custom Allowances</h3>
          <Button type="button" variant="outline" size="sm" onClick={addCustomAllowance} className="gap-1.5">
            <Plus className="size-3.5" />
            Add Custom Allowance
          </Button>
        </div>

        <AnimatePresence mode="popLayout">
          {customAllowances.map((ca, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1fr_120px_130px_36px] gap-3 items-end rounded-lg border bg-muted/30 p-3 mb-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Relocation"
                    value={ca.name || ""}
                    onChange={(e) => updateCustomAllowance(index, "name", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Amount</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {cSymbol}
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={ca.amount ?? ""}
                      onChange={(e) => updateCustomAllowance(index, "amount", e.target.value === "" ? 0 : Number(e.target.value))}
                      className="pl-6 tabular-nums"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Period</Label>
                  <Select value={ca.period || "weekly"} onValueChange={(v) => updateCustomAllowance(index, "period", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="one_time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 self-end"
                  onClick={() => removeCustomAllowance(index)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {customAllowances.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No custom allowances added.</p>
        )}
      </div>

      <div className="rounded-lg border bg-muted/40 p-3">
        <p className="text-sm font-medium">
          Total Weekly Allowances:{" "}
          <span className="text-primary font-semibold">{formatCurrency(totalAllowances, country)}</span>
        </p>
      </div>
    </div>
  );
}

// ---- Step 7: Review ----
function StepReview({ values, productions, personOptions, classificationLabels, country }) {
  const production = productions?.find((p) => p._id === values.productionId);
  const person = personOptions?.find((p) => p._id === values.personId);
  const isUS = country === "US";
  const fmt = (v) => formatCurrency(v, country);
  const totalFringe = isUS
    ? (values.phPct || 0) + (values.vacationPct || 0) + (values.ficaPct || 0)
    : (values.holidayPayPct || 0) + (values.employerNiPct || 0) + (values.pensionPct || 0) + (values.apprenticeLevyPct || 0);
  const totalAllowances =
    (values.kitAllowance || 0) +
    (values.travelAllowance || 0) +
    (values.perDiem || 0) +
    (values.phoneAllowance || 0) +
    (values.computerAllowance || 0) +
    (values.carAllowance || 0) +
    (values.housingAllowance || 0) +
    ((values.customAllowances || []).reduce((s, c) => s + (c.amount || 0), 0));

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
          <Field label="Weekly Rate" value={fmt(values.weeklyRate)} />
          <Field label="Daily Rate" value={values.dailyRate ? fmt(values.dailyRate) : "--"} />
          <Field label="Hourly Rate" value={values.hourlyRate ? fmt(values.hourlyRate) : "--"} />
          <Field label="Guaranteed Hours" value={`${values.guaranteedHours || 0} hrs/wk`} />
          {isUS && values.programFee > 0 && <Field label="Program Fee" value={fmt(values.programFee)} />}
          {isUS && values.overageRate > 0 && <Field label="Overage Rate" value={fmt(values.overageRate)} />}
          {isUS && values.episodeLength > 0 && <Field label="Episode Length" value={`${values.episodeLength} min`} />}
          {isUS && values.prepDays > 0 && <Field label="Prep Days" value={values.prepDays} />}
          {isUS && values.shootDays > 0 && <Field label="Shoot Days" value={values.shootDays} />}
          {isUS && values.studioOrLocation && <Field label="Studio/Location" value={values.studioOrLocation} />}
        </Section>

        <Separator />

        <Section icon={Percent} title="Fringes">
          {isUS ? (
            <>
              <Field label="P&H" value={`${values.phPct}%`} />
              <Field label="Vacation" value={`${values.vacationPct}%`} />
              <Field label="FICA" value={`${values.ficaPct}%`} />
              {values.stateTaxState && <Field label="State" value={values.stateTaxState} />}
            </>
          ) : (
            <>
              <Field label="Holiday Pay" value={`${values.holidayPayPct}%`} />
              <Field label="Employer NI" value={`${values.employerNiPct}%`} />
              <Field label="Pension" value={`${values.pensionPct}%`} />
              <Field label="Apprenticeship Levy" value={`${values.apprenticeLevyPct}%`} />
            </>
          )}
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
          <Field label="Meal Penalty" value={values.mealPenaltyEnabled ? `${fmt(values.mealPenaltyAmount)} after ${values.mealPenaltyAfterHrs} hrs` : "Disabled"} />
        </Section>

        <Separator />

        <Section icon={Briefcase} title="Allowances">
          {values.productionFee > 0 && (
            <Field
              label="Production Fee"
              value={`${fmt(values.productionFee)}${values.productionFeeBasis ? ` (${values.productionFeeBasis.replace("_", " ")})` : ""}`}
            />
          )}
          {values.idleDays > 0 && (
            <Field label="Idle Days" value={`${values.idleDays} days @ ${fmt(values.idleDayRate)}/day`} />
          )}
          <Field label="Kit" value={fmt(values.kitAllowance)} />
          <Field label="Travel" value={fmt(values.travelAllowance)} />
          <Field label="Per Diem" value={fmt(values.perDiem)} />
          <Field label="Phone" value={fmt(values.phoneAllowance)} />
          <Field label="Computer" value={fmt(values.computerAllowance)} />
          <Field label="Car" value={fmt(values.carAllowance)} />
          <Field label="Housing" value={fmt(values.housingAllowance)} />
          {(values.customAllowances || []).map((ca, i) => (
            <Field key={i} label={ca.name || `Custom #${i + 1}`} value={`${fmt(ca.amount)} (${ca.period?.replace("_", " ") || "weekly"})`} />
          ))}
          <Field label="Total Allowances" value={fmt(totalAllowances)} />
        </Section>
      </div>
    </div>
  );
}
