// ─────────────────────────────────────────────────────────────────────────────
// Zillit Coda — Deal Memo Wizard — TypeScript Interfaces
// Production: The Gilded Hour — Series 2
// ─────────────────────────────────────────────────────────────────────────────

// ── STEP 1: ENTITY / TERRITORY / UNION ──────────────────────────────────────

export type TerritoryKey =
  | 'UK' | 'US' | 'CA' | 'AU' | 'NZ'
  | 'DE' | 'FR' | 'IE' | 'ES' | 'IT' | 'NL' | 'NO' | 'SE'
  | 'ZA' | 'IN' | 'JP' | 'KR' | 'BR' | 'MX' | 'INT';

export type UnionKey =
  | 'PACT-BECTU' | 'PACT-BECTU-ITV' | 'PACT-LB' | 'PACT-ULB'
  | 'EQUITY' | 'MU' | 'BBC-BECTU' | 'C4-BECTU' | 'UK-NU'
  | 'IATSE-BASIC' | 'IATSE-ASA' | 'IATSE-LB1' | 'IATSE-LB2' | 'IATSE-ULB' | 'IATSE-NM'
  | 'IATSE-600' | 'IATSE-728' | 'IATSE-695'
  | 'DGA' | 'SAG-THEATRICAL' | 'SAG-TV'
  | 'WGA-WEST' | 'WGA-EAST' | 'TEAMSTERS-399' | 'NABET' | 'US-NU'
  | 'AU-NU' | 'default';

export type CurrencyCode =
  | 'GBP' | 'USD' | 'EUR' | 'CAD' | 'AUD' | 'NZD'
  | 'NOK' | 'SEK' | 'ZAR' | 'INR' | 'JPY' | 'BRL' | 'MXN' | 'KRW';

export interface ContractingEntity {
  id: string;
  name: string;
  registrationNumber: string;         // Co. No. / EIN / CRO
  vatTaxId: string;
  defaultCurrency: CurrencyCode;
  defaultTerritory: TerritoryKey;
  payrollBureau: string;
  employerReference: string;          // PAYE ref / FEIN / ERN
  applicableAgreements: string[];
  signatoriesOf: string[];            // 'PACT Member', 'SAG Signatory', etc.
  bankReference: string;
  isPrimary?: boolean;
}

export interface TerritoryRule {
  badge: string;
  // Basic day
  basic: string;          // e.g. '10 hrs'
  basicS: string;
  hrBasis: string;        // e.g. 'Day ÷ 10'
  hrBasisS: string;
  // OT tiers
  ot1: string;            // e.g. '×1.25'
  ot1S: string;           // e.g. 'Hours 11–12'
  ot2: string;
  ot2S: string;
  golden: string | null;
  goldenS: string | null;
  sixth: string;          // e.g. '×1.5 All hours Saturday'
  sixthS: string;
  seventh: string;
  seventhS: string;
  // Holiday / vacation
  hp: string;             // e.g. '12.07%' or 'N/A'
  hpS: string;
  vacation: string | null;
  vacationS: string | null;
  // Night / other
  night: string | null;
  nightS: string | null;
  // Meals
  meal: string;           // first meal interval e.g. '6 hrs'
  mealS: string;
  mealDur: string;
  mealPaid: string;
  mealSubseq: string;
  mealGrace: string;
  mp: string;             // meal penalty amount
  mpS: string;
  mp2: string | null;
  mp2S: string | null;
  french: string;
  rest: string;           // turnaround minimum
  restS: string;
  taPen: string;
  weeklyRest: string;
  dayBreak: string;
  // Fringes
  rfHp: string;
  rfHpS: string;
  rfNic: string;
  rfNicS: string;
  rfPension: string;
  rfPensionS: string;
  rfHw: string | null;   // H&W per hour — null if not applicable
  rfHwS: string | null;
  rfEmployerTotal: string;
  rfKit: string;
  rfMileage: string;
  rfPerdiem: string;
  rfTaxcredit: string;
  // Special provisions (HTML strings for rich text)
  special: string[];
}

// ── STEP 1: DEPARTMENT / ROLE ────────────────────────────────────────────────

export type DepartmentKey =
  | 'Camera' | 'Grip' | 'Electrical' | 'Art' | 'Costume'
  | 'Make-Up & Hair' | 'Sound' | 'Production' | 'Locations'
  | 'VFX & Post' | 'Transport' | 'Construction' | 'Stunts'
  | 'Music' | 'Performers' | 'Directing' | 'Writing';

export interface DeptUnionSuggestion {
  keys: UnionKey[];
  hint: string;
}

// ── STEP 2: CREW DETAILS ─────────────────────────────────────────────────────

export type EmploymentStatusUK = 'paye' | 'ltd' | 'sole';
export type EmploymentStatusUS = 'w2' | 'loanout' | '1099';
export type EmploymentStatusCA = 't4' | 'incorporated' | 'selfemployed';
export type EmploymentStatusAU = 'payg' | 'ptyltd' | 'abn';

export interface CrewDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;            // crew-to-complete
  address?: string;                // crew-to-complete
  emergencyContact?: string;       // crew-to-complete
  department: DepartmentKey;
  role: string;
  screenCredit?: string;
  reportsTo?: string;
  costCentre?: string;
  // UK fields
  employmentStatusUK?: EmploymentStatusUK;
  niNumber?: string;               // crew-to-complete
  taxCode?: string;                // crew-to-complete
  starterDeclaration?: string;     // crew-to-complete
  p45Received?: boolean;
  bankSortCode?: string;           // crew-to-complete
  bankAccountNumber?: string;      // crew-to-complete
  ltdCompanyName?: string;
  ltdCompanyReg?: string;
  // US fields
  employmentStatusUS?: EmploymentStatusUS;
  ssn?: string;                    // crew-to-complete
  w4FilingStatus?: string;         // crew-to-complete
  stateWithholding?: string;       // crew-to-complete
  i9Status?: string;
  corpEin?: string;
  unionCard?: string;
  workAuthorization?: string;
  achRoutingNumber?: string;       // crew-to-complete
  achAccountNumber?: string;       // crew-to-complete
  // AU fields
  tfn?: string;                    // crew-to-complete
  abn?: string;
  superFund?: string;              // crew-to-complete
  superMemberNumber?: string;      // crew-to-complete
  bsb?: string;                   // crew-to-complete
  // CA fields
  sin?: string;                    // crew-to-complete
  province?: string;
  // Generic
  taxId?: string;                  // crew-to-complete
  iban?: string;                   // crew-to-complete
  swift?: string;                  // crew-to-complete
}

// ── STEP 3: DEAL STRUCTURE ───────────────────────────────────────────────────

export type DealType = 'daily' | 'weekly' | 'flat' | 'picture' | 'step' | 'pop';

export interface DealStructure {
  dealType: DealType;
  startDate: string;
  endDate?: string;
  payrollWeekStart?: string;
  shootDayGuarantee?: number;
  prepDays?: number;
  wrapDays?: number;
  travelDays?: number;
  exclusivity: boolean;
  payOrPlay: boolean;
  aiImportedFrom?: string;         // filename if AI contract import was used
}

// ── STEP 4: RATES ────────────────────────────────────────────────────────────

export type RateBasis = 'daily' | 'weekly' | 'hourly';
export type HPMode = 'excl' | 'incl' | 'na';
export type RateType = 'negotiated' | 'scale' | 'scale_plus_10' | 'scale_plus_15';

export interface OTRow {
  code: string;
  description: string;
  trigger: string;
  multiplier: string;          // e.g. '×1.250' or '12.07%'
  calculatedRate: string;      // display string e.g. '£55.00/hr'
  isOverridden?: boolean;
  overrideNote?: string;
}

export interface RatesAndCompensation {
  currency: CurrencyCode;
  rateBasis: RateBasis;
  rateAmount: number;
  rateType: RateType;
  hpMode: HPMode;
  isCustomDeal: boolean;
  otRows: OTRow[];
}

// ── STEP 5: ALLOWANCES ───────────────────────────────────────────────────────

export type AllowanceTaxTreatment = 'non-taxable' | 'taxable-paye' | 'partly-exempt';
export type AllowanceFrequency = 'daily' | 'weekly' | 'monthly' | 'per-engagement';

export interface AllowanceCaps {
  frequency: AllowanceFrequency;
  weeklyCap?: number;
  dailyCap?: number;
  maxDaysPerWeek?: number;
  minDaysForFullRate?: number;
  proRateShortWeeks: boolean;
  excludeSundays: boolean;
  excludeSaturdays?: boolean;
  payableOnTravelDays: boolean;
  payableOnPrepDays: boolean;
}

export interface Allowance {
  id: string;                      // uuid
  name: string;
  amount: number;
  taxTreatment: AllowanceTaxTreatment;
  nominalCode: string;             // e.g. '2350'
  caps: AllowanceCaps;
  isVisible: boolean;              // visible to crew on timecard
}

// ── STEP 6: NOMINAL CODING ───────────────────────────────────────────────────

export type TaxCreditScheme =
  | 'HETVC' | 'FTC' | 'AVISC' | 'SECTION_481'
  | 'CANADA_FEDERAL' | 'US_STATE' | 'NONE';

export interface NominalLine {
  key: string;
  label: string;
  description: string;
  estimatedWeekly: number | null;
  nominalCode: string;
  costCentre: string;
  episode: string;
  isCore: boolean;                 // core lines can't be removed
  isFringe?: boolean;              // H&W, pension — union-specific
}

export interface TaxCreditTagging {
  scheme: TaxCreditScheme;
  isCore: boolean;
  residentStatus: 'qualifying' | 'eea' | 'non-qualifying';
}

// ── STEP 7: COMPLIANCE ───────────────────────────────────────────────────────

export type ComplianceStatus = 'ok' | 'pending' | 'warn' | 'required' | 'tracking' | 'review';

export interface ComplianceCard {
  icon: string;
  title: string;
  status: ComplianceStatus;
  items: Array<{ dot: 'g' | 'o' | 'r' | 'gr'; text: string }>;
}

export interface ChecklistItem {
  id: string;
  name: string;
  responsibility: 'PRODUCTION' | 'CREW UPLOADS' | 'OPTIONAL' | 'IF APPLICABLE';
  isChecked: boolean;
  isRequired: boolean;             // blocks payroll run if unchecked
}

// ── STEP 8: ADDITIONAL DOCUMENTS ────────────────────────────────────────────

export interface SigningDocument {
  id: string;
  filename: string;
  description: string;
  requiresSignature: boolean;
  isProductionContract?: boolean;  // the main contract template
  uploadedBy?: string;
  uploadedAt?: string;
  pages?: number;
}

// ── STEP 9: PAYROLL START FORM ───────────────────────────────────────────────

export type PayrollBureau =
  | 'SARGENT_DISC' | 'CAST_AND_CREW' | 'MEDIA_SERVICES'
  | 'ENTERTAINMENT_PARTNERS' | 'MONEYPENNY' | 'PSS_PAYROLL'
  | 'IN_HOUSE' | 'OTHER';

export interface PayrollStartForm {
  bureau: PayrollBureau;
  productionReference: string;
  payFrequency: 'weekly' | 'biweekly' | 'monthly';
  // Status
  isComplete: boolean;
  outstandingFields: string[];     // field names pending crew completion
}

// ── MASTER DEAL MEMO STATE ────────────────────────────────────────────────────

export interface DealMemoState {
  // Step 1
  contractingEntityId: string;
  department: DepartmentKey | null;
  role: string;
  screenCredit: string;
  territory: TerritoryKey;
  unionKey: UnionKey;
  isCustomDeal: boolean;

  // Step 2
  crew: Partial<CrewDetails>;

  // Step 3
  deal: Partial<DealStructure>;

  // Step 4
  rates: Partial<RatesAndCompensation>;

  // Step 5
  allowances: Allowance[];
  allowancesVisibleToCrew: boolean;
  delegateCannotSeeAmounts: boolean;

  // Step 6
  nominalLines: NominalLine[];
  taxCreditTagging: Partial<TaxCreditTagging>;

  // Step 7
  checklistItems: ChecklistItem[];

  // Step 8
  signingDocuments: SigningDocument[];

  // Step 9
  payrollStartForm: Partial<PayrollStartForm>;

  // Meta
  status: 'draft' | 'issued' | 'signed' | 'active' | 'expired';
  reference?: string;              // e.g. 'GH2-DM-2026-0047'
  productionId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── PRODUCTION SETTINGS (admin-level config) ─────────────────────────────────

export interface ProductionCustomRules {
  basicHrs: number;
  rateBasis: RateBasis;
  hpTreatment: HPMode;
  hpRate: number;
  ot1Mult: number; ot1Desc: string; ot1Trigger: string;
  ot2Mult: number; ot2Desc: string; ot2Trigger: string;
  sixthMult: number; sixthDesc: string; sixthTrigger: string;
  seventhMult: number; seventhDesc: string; seventhTrigger: string;
  golden: boolean;
  mealIntervalHrs: number;
  mealDurationMins: number;
  mealPaidStatus: 'paid' | 'unpaid' | 'non-deductible';
  mealPenaltyAmount: number;
  turnaroundHrs: number;
  nicRate: string;
  pensionRate: string;
  mileageRate: string;
  perDiemAmount: number;
  kitBoxAmount: number;
  defaultNominals: {
    basicLabour: string;
    overtime: string;
    kit: string;
    allowances: string;
    employerOnCosts: string;
    mealPenalties: string;
  };
  taxCreditScheme: TaxCreditScheme;
  taxCreditClassification: 'core' | 'non-core';
}

export interface ProductionSettings {
  productionId: string;
  productionName: string;
  productionCompany: string;
  entities: ContractingEntity[];
  customRules: ProductionCustomRules;
  defaultBureau: PayrollBureau;
  productionContractTemplate?: SigningDocument;
  standardSigningDocuments: SigningDocument[];
}
