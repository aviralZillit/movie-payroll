// ============================================================
// Zillit Deal Memo — Shared TypeScript Types
// ============================================================

export type Territory = 'uk' | 'us' | 'canada' | 'ireland' | 'eu';
export type Union = 'pact-bectu' | 'iatse' | 'dga' | 'non-union';
export type DealType = 'daily' | 'weekly' | 'flat' | 'run-of-show';
export type EmploymentStatus = 'paye' | 'ltd' | 'self-employed' | 'loan-out';
export type CallSheetTier = 'HOD' | 'Crew' | 'Trainee' | 'Supporting';
export type UKTravelZone = '30mile' | 'outside-30' | 'distant';
export type DistantAccommodation = 'hotel-provided' | 'self-find' | 'per-diem' | 'none';
export type IdleDaysApplicable = 'yes' | 'no';
export type IdleDaysFringes = 'benefits-only' | 'full-rate' | 'half-rate' | 'none';
export type HPMode = 'incl' | 'excl';

export interface PhaseRate {
  phase: string;
  rate: number;
  weeks?: number;
}

export interface Rates {
  dayRate: number;
  weeklyRate: number;
  currency: string;
  paymentCurrency: string;
  hpMode: HPMode;
  phaseRatesOn: boolean;
  phaseRates?: PhaseRate[];
}

export interface DealMemoData {
  _id?: string;
  productionId?: string;
  territory: string;
  union: string;
  pactBand: string;
  pactSpecialDept: boolean;
  schedPrepDays: number;
  schedShootDays: number;
  schedWrapDays: number;
  department: string;
  jobTitle: string;
  customJobTitle?: string;
  callSheetTier: CallSheetTier;
  employmentStatusId: string;
  dealType: string;
  ukTravelZone: string;
  distantLocation: boolean;
  distantAccommodation: string;
  distantPerDiem?: number;
  distantTravelOption?: string;
  distantTravelDays?: string;
  idleDaysApplicable: string;
  idleDaysMax: number;
  idleDaysFringes: string;
  idleDaysRate?: string;
  rates: Rates;
  currentStep: number;
  status?: 'draft' | 'pending' | 'approved' | 'signed';
  crewMemberId?: string;
  crewMemberName?: string;
  crewMemberEmail?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;

  // Step 1 extras
  entity?: string;
  productionType?: string;
  caProvince?: string;
  mmpBudgetConfirm?: string;
  mmpHighEarner?: boolean;

  // Step 2 — crew personal details
  reportsTo?: string;
  fullName?: string;
  preferredName?: string;
  dob?: string;
  nationalInsurance?: string;
  taxCode?: string;
  rightToWork?: string;
  homeAddress?: string;
  emergencyContact?: string;

  // Step 3 — deal structure
  startDate?: string;
  endDate?: string;
  billingBasis?: string;
  noticeType?: string;
  customNotice?: string;
  screenCredit?: string;
  exclusivity?: boolean;
  travelDayFullRate?: boolean;
  restDayDoubleTime?: boolean;

  // Step 5 — allowances (typed loosely so rows can be added)
  allowances?: Array<{
    id: string;
    name: string;
    active: boolean;
    rate: number;
    rate2?: number;
    frequency: string;
    nominal: string;
    mandatory: boolean;
    isRental?: boolean;
    isCustom?: boolean;
    note?: string;
  }>;

  // Step 6 — nominal coding
  nominalCodes?: Record<string, string>;
  costCentre?: string;
  setCode?: string;

  // Step 7 — compliance
  payrollMethod?: string;
  ir35Status?: string;

  // Step 8 — documents
  documents?: string[];

  // Step 9 — payroll start
  payrollBureau?: string;
  payrollStartDate?: string;
  payFirstPayDate?: string;
  payFrequency?: string;
  payExportFormat?: string;
  payrollNotes?: string;

  // DGA-specific
  dgaProductionFee?: {
    weeklyFee: number;
    ppWeeks: number;
    totalPPFee: number;
    totalPPSalary: number;
    totalCompensation: number;
  };
  dgaCOA?: {
    basis: string;
    amount: number;
    negotiatedAmount?: number;
  };

  // Non-union custom rules (Step 1)
  nonUnionRules?: {
    dayRate: number;
    weeklyGuarantee: number;
    otStandard: number;
    otEnhanced: number;
    mealBreak: number;
    turnaround: number;
  };

  // Step 4 extras
  buyoutCovers?: string; // '8' | '10' | '12' | 'unlimited'
  fxLockDate?: string;
  pictureRate?: number;

  // Step 8
  copyToProductionOffice?: boolean;

  // Step 9 sync toggles
  payrollAutoSync?: boolean;
  payrollNotifyOnIssue?: boolean;
  payrollIncludePdf?: boolean;

  // Additional notes
  dealNotes?: string;

  // Per-field required overrides (keyed by stable fieldKey, e.g. "step1.productionEntity")
  fieldRequired?: Record<string, boolean>;

  // Assigned crew user (set in Step 2 when admin picks from dropdown)
  assignedUserId?: string;
}

export interface Production {
  _id: string;
  name: string;
  productionCompany: string;
  territory: Territory;
  union: Union;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'coordinator' | 'viewer';
  token?: string;
}
