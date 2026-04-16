// ============================================================
// ZILLIT CODA — DEAL MEMO WIZARD
// TypeScript Types & Interfaces
// Generated from v21 prototype — April 2026
// ============================================================

// ── TERRITORY & CURRENCY ─────────────────────────────────────

export type TerritoryCode = 'uk' | 'us' | 'ie' | 'fr' | 'de' | 'es' | 'it' | 'au' | 'ca' | 'hu' | 'nz' | 'za' | 'other';

export type CurrencyCode = 'GBP' | 'USD' | 'EUR' | 'AUD' | 'CAD' | 'NZD' | 'ZAR' | 'HUF' | 'DKK' | 'SEK' | 'NOK' | 'CHF';

export interface Territory {
  code: TerritoryCode;
  name: string;
  flag: string;
  curr: CurrencyCode;
  sym: string;
  badge: string;
  unions: Union[];
}

// ── UNION & AGREEMENT ────────────────────────────────────────

export type UnionId =
  | 'pact-bectu' | 'pact-mmp' | 'pact-equity' | 'bectu-anim' | 'wggb'
  | 'dga' | 'iatse-600' | 'iatse-728' | 'iatse-80' | 'iatse-695'
  | 'sag-aftra' | 'wga-west' | 'teamsters-399'
  | 'siptu' | 'equity-ie'
  | 'meaa' | 'iatse-ca' | 'actra'
  | 'spiac-cgt' | 'f3c-cfdt' | 'sfa-cgt'
  | 'nu-uk' | 'nu-us' | 'nu-ie' | 'nu-fr' | 'nu-de' | 'nu-es' | 'nu-it' | 'nu-au' | 'nu-ca' | 'nu-hu' | 'nu-nz' | 'nu-za' | 'nu-other';

export interface Union {
  id: UnionId;
  name: string;
  sub: string;
  suggested: DepartmentId[];
}

// ── DEPARTMENT & JOB TITLE ───────────────────────────────────

export type DepartmentId =
  | 'atl' | 'art' | 'ad' | 'cam' | 'cast' | 'costume' | 'dir'
  | 'grip' | 'hair' | 'light' | 'loc' | 'post' | 'prod' | 'script' | 'sound' | 'trans' | 'vfx';

export interface Department {
  id: DepartmentId;
  label: string;
}

// ── EMPLOYMENT STATUS ─────────────────────────────────────────

export type AlertClass = 'blue' | 'gold' | 'red' | 'green' | 'teal' | 'orange';

export interface EmploymentStatus {
  id: string;
  label: string;
  sub: string;
  hpShow: boolean;               // whether holiday pay appears on deal memo
  badge: string;
  alertCls: AlertClass;
  icon: '!' | 'i';
  alert: string;
}

// ── DEAL TYPE ────────────────────────────────────────────────

export type DealType = 'weekly' | 'fixed' | 'dayplayer' | 'buyout' | 'picture' | 'boxrental';
export type HPMode = 'incl' | 'excl';
export type NoticeType = 'statutory' | '1week' | '2week' | '1month' | 'negotiated' | 'none';

export interface DealTypeConfig {
  label: string;
  showOT: boolean;
  showPhase: boolean;
  showHP: boolean;
  notice: NoticeType[];
  defNotice: NoticeType;
  alert: string;
}

// ── PACT/BECTU BUDGET BANDS ──────────────────────────────────

export type PactBand = '' | '1' | '2' | '3' | '4';

export interface PactBandInfo {
  band: PactBand;
  label: string;
  rate: string;                  // per broadcast hour threshold
  otMin: number;                 // OT minimum rate (£/hr)
  otMax: number;                 // OT maximum rate (£/hr)
  bankHolidayNote: string;
  notes: string;
}

// ── OT SCHEDULE ──────────────────────────────────────────────

export interface OTRow {
  p: string;                     // period label
  h: string;                     // hours description
  m: string;                     // multiplier
  note: string;
  isGoldTime?: boolean;
}

export interface OTSchedule {
  note: string;
  divisor: number;               // contracted hours divisor for hourly rate
  rows: OTRow[];
}

// ── RATES ────────────────────────────────────────────────────

export interface RateEntry {
  dayRate: number;
  weeklyRate: number;
  currency: CurrencyCode;
  paymentCurrency: CurrencyCode;
  fxMechanism?: 'spot' | 'ecb' | 'fixed' | 'production';
  fixedFxRate?: number;
  hpMode: HPMode;
  phaseRatesOn: boolean;
  prepRate?: number;
  shootRate?: number;
  wrapRate?: number;
}

export interface RateSummary {
  dayRate: number;
  baseRate: number;              // ex HP (if inclusive)
  hpElement: number;             // HP amount per day
  weeklyRate: number;
  hpPct: number;
  hourlyRate: number;
}

// ── US SCALE MINIMUMS (EP Paymaster 2025-26) ─────────────────

export interface ScaleMinimum {
  weekly: number | null;
  daily: number | null;
  flat?: number | null;
  note: string;
  prodFee?: number;              // DGA production fee (if applicable)
}

export type ScaleMinimumsByRole = Record<string, ScaleMinimum>;
export type ScaleMinimumsByUnion = Partial<Record<UnionId, ScaleMinimumsByRole>>;

// ── FRINGES ──────────────────────────────────────────────────

export type FringeType = 'pct' | 'flat' | 'range' | 'note';

export interface FringeItem {
  name: string;
  rate: number;                  // % rate (0 if flat)
  flat: number;                  // flat amount per period (0 if pct)
  basis: string;
  statutory: boolean;
  hpExclOnly?: boolean;          // only show when HP is exclusive
}

export interface FringePackage {
  label: string;
  badge: string;
  items: FringeItem[];
  note: string;
}

export type FringePackages = Record<string, FringePackage>;

// ── DISTANT LOCATION ─────────────────────────────────────────

export interface DistantLocationRules {
  thresholdMiles: number;
  thresholdLabel: string;
  travelOptions?: string[];
  defTravelOption?: string;
  perDiemNote: string;
  perDiemRate: number;
  perDiemCurr: CurrencyCode;
  highCostPerDiem?: number;
  highCostCities?: string;
  hotel: string;
  turnaround?: string;
  guarantee?: string;
  travelPay?: string;
  restDays?: string;
  showIdleDays: boolean;
  note: string;
  dgaAllowance?: number;
}

export interface IdleDayRules {
  applicable: boolean;
  rate?: string;
  max?: number;
  fringes?: 'benefits-only' | 'full' | 'none';
  note: string;
}

// ── DGA PRODUCTION FEE & COA ─────────────────────────────────

export type COABasis = '1week' | '2.5days' | '50pct' | '100pct' | 'negotiated' | 'none';

export interface DGAProductionFee {
  weeklyFee: number;
  ppWeeks: number;
  totalPPFee: number;
  totalPPSalary: number;
  totalCompensation: number;
}

export interface DGACOACalc {
  basis: COABasis;
  amount: number;
  negotiatedAmount?: number;
}

// ── ALLOWANCES ───────────────────────────────────────────────

export interface Allowance {
  id: string;
  name: string;
  active: boolean;
  rate: number;
  frequency: 'daily' | 'weekly' | 'trip' | 'flat';
  nominal: string;
  mandatory: boolean;
  note?: string;
}

// ── COMPLIANCE ───────────────────────────────────────────────

export type ComplianceStatus = 'pass' | 'pending' | 'required' | 'warning' | 'na';
export type CompliancePriority = 'mandatory' | 'recommended' | 'info';

export interface ComplianceCheck {
  id: string;
  title: string;
  detail: string;
  status: ComplianceStatus;
  priority: CompliancePriority;
  territoryCode: TerritoryCode | 'all';
  appliesTo?: UnionId[];
  appliesToEmpStatus?: string[];
}

// ── COMPLETE DEAL MEMO STATE ─────────────────────────────────

export interface DealMemoState {
  // Meta
  id: string;
  productionId: string;
  productionName: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'issued' | 'signed' | 'cancelled';
  currentStep: number;

  // Step 1 — Territory & Union
  territory: TerritoryCode;
  union: UnionId;
  pactBand: PactBand;
  pactSpecialDept: boolean;
  mmpBudgetConfirm: 'confirmed' | 'pending' | 'below';
  mmpHighEarner: boolean;
  schedPrepDays: number;
  schedShootDays: number;
  schedWrapDays: number;

  // Step 2 — Crew Details
  department: DepartmentId | '';
  jobTitle: string;
  customJobTitle?: string;
  reportsTo: string;
  callSheetTier: 'HOD' | 'Crew' | 'Day Player' | 'Background';
  employmentStatusId: string;
  screenCredit?: string;
  // Personal details (crew to complete via portal)
  fullName?: string;
  dob?: string;
  nationalInsurance?: string;
  taxCode?: string;
  rightToWork?: string;
  homeAddress?: string;
  emergencyContact?: string;

  // Step 3 — Deal Structure
  dealType: DealType;
  startDate?: string;
  endDate?: string;
  firstPayDate?: string;
  billingBasis: string;
  noticeType: NoticeType;
  customNotice?: string;
  // Work location
  ukTravelZone: '30mile' | 'm25';
  distantLocation: boolean;
  distantPerDiem?: number;
  distantAccommodation: 'hotel-provided' | 'allowance' | 'actuals';
  distantTravelOption: string;
  distantTravelDays: 'flat' | 'negotiated' | 'none';
  // Idle days
  idleDaysApplicable: 'no' | 'agreement' | 'negotiated';
  idleDaysRate?: string;
  idleDaysMax: number;
  idleDaysFringes: 'benefits-only' | 'full' | 'none';

  // Step 4 — Rates & Compensation
  rates: RateEntry;
  rateSummary?: RateSummary;
  // DGA production fee (US only)
  dgaProductionFee?: DGAProductionFee;
  dgaCOA?: DGACOACalc;

  // Step 5 — Allowances & Rentals
  allowances: Allowance[];

  // Step 6 — Nominal Coding
  nominalCodes: Record<string, string>;

  // Step 7 — Compliance
  complianceChecks: ComplianceCheck[];

  // Step 8 — Additional Documents
  documents: string[];

  // Step 9 — Payroll Start Form
  payrollStartDate?: string;
  payrollBureau?: string;
  payrollNotes?: string;

  // Additional
  dealNotes?: string;
}

// ── API TYPES ────────────────────────────────────────────────

export interface CreateDealMemoRequest {
  productionId: string;
  templateId?: string;
  prePopulate?: Partial<DealMemoState>;
}

export interface IssueDealMemoRequest {
  id: string;
  crewEmail: string;
  signatoryEmail: string;
  sendCrewPortalInvite: boolean;
}

export interface DealMemoSummary {
  id: string;
  productionId: string;
  crewName?: string;
  jobTitle: string;
  department: DepartmentId;
  territory: TerritoryCode;
  union: UnionId;
  dealType: DealType;
  startDate?: string;
  weeklyRate: number;
  currency: CurrencyCode;
  status: DealMemoState['status'];
  updatedAt: string;
}
