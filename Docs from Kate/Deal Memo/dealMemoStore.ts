// ─────────────────────────────────────────────────────────────────────────────
// Zillit Coda — Deal Memo Store (Zustand)
// ─────────────────────────────────────────────────────────────────────────────
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  DealMemoState, TerritoryKey, UnionKey, DepartmentKey,
  CurrencyCode, HPMode, Allowance, NominalLine, ChecklistItem,
  SigningDocument, ProductionSettings
} from '../types/dealMemo';
import { buildNominalLines } from '../lib/nominalCoding';
import { buildComplianceChecklist } from '../lib/compliance';
import { TERRITORY_RULES, TERRITORY_TO_DEFAULT_RULE } from '../data/territoryRules';
import { getDefaultAllowances } from '../data/allowances';

// ── DEFAULT PRODUCTION SETTINGS (demo data) ───────────────────────────────────

export const DEFAULT_PRODUCTION: ProductionSettings = {
  productionId: 'GH2-2026',
  productionName: 'The Gilded Hour — Series 2',
  productionCompany: 'Gilded Hour Productions Ltd',
  entities: [
    {
      id: 'GHP-UK',
      name: 'Gilded Hour Productions Ltd',
      registrationNumber: 'Co. No. 12345678',
      vatTaxId: 'GB 987654321',
      defaultCurrency: 'GBP',
      defaultTerritory: 'UK',
      payrollBureau: 'Sargent-Disc',
      employerReference: 'PAYE 123/AB456',
      applicableAgreements: ['PACT/BECTU', 'Equity', 'MU'],
      signatoriesOf: ['PACT Member'],
      bankReference: 'BACS registered — GHP001',
      isPrimary: true,
    },
    {
      id: 'GHP-IE',
      name: 'Gilded Hour (Ireland) DAC',
      registrationNumber: 'CRO 654321',
      vatTaxId: 'IE 9876543A',
      defaultCurrency: 'EUR',
      defaultTerritory: 'IE',
      payrollBureau: 'Moneypenny (IE)',
      employerReference: 'ERN IE-GH001',
      applicableAgreements: ['Section 481', 'SIPTU', 'Equity Ireland'],
      signatoriesOf: ['Section 481 Qualified Producer'],
      bankReference: 'SEPA/IBAN — GIE001',
    },
    {
      id: 'GHP-US',
      name: 'Gilded Hour Films LLC',
      registrationNumber: 'EIN 98-7654321',
      vatTaxId: 'CA State 7654321',
      defaultCurrency: 'USD',
      defaultTerritory: 'US',
      payrollBureau: 'Entertainment Partners',
      employerReference: 'FEIN 98-7654321',
      applicableAgreements: ['IATSE', 'SAG-AFTRA', 'DGA', 'WGA'],
      signatoriesOf: ['SAG Signatory', 'DGA Signatory', 'IATSE Signatory'],
      bankReference: 'ACH routing 123456789',
    },
  ],
  customRules: {
    basicHrs: 10,
    rateBasis: 'daily',
    hpTreatment: 'excl',
    hpRate: 12.07,
    ot1Mult: 1.25, ot1Desc: 'Overtime Tier 1', ot1Trigger: 'Hours 11–12',
    ot2Mult: 1.50, ot2Desc: 'Overtime Tier 2', ot2Trigger: 'Hours 13+',
    sixthMult: 1.50, sixthDesc: '6th Day Premium', sixthTrigger: '6th consecutive day',
    seventhMult: 2.00, seventhDesc: '7th Day Premium', seventhTrigger: '7th consecutive day',
    golden: false,
    mealIntervalHrs: 6,
    mealDurationMins: 30,
    mealPaidStatus: 'unpaid',
    mealPenaltyAmount: 35,
    turnaroundHrs: 11,
    nicRate: '13.8%',
    pensionRate: '3% min auto-enrol',
    mileageRate: '45p/mile',
    perDiemAmount: 35,
    kitBoxAmount: 500,
    defaultNominals: {
      basicLabour: '2302',
      overtime: '2360',
      kit: '2350',
      allowances: '2340',
      employerOnCosts: '2399',
      mealPenalties: '2360',
    },
    taxCreditScheme: 'HETVC',
    taxCreditClassification: 'core',
  },
  defaultBureau: 'SARGENT_DISC',
  standardSigningDocuments: [
    { id: 'doc-nda', filename: 'GHP_Non-Disclosure_Agreement_2026.pdf', description: 'NDA — confidentiality of production, cast & story', requiresSignature: true },
    { id: 'doc-hrss', filename: 'GHP_Anti-Harassment_Bullying_Policy_v2.pdf', description: 'Harassment, bullying & discrimination policy', requiresSignature: true },
    { id: 'doc-hs', filename: 'GHP_Health_Safety_Policy_2026.pdf', description: 'H&S policy — includes social media & on-set conduct', requiresSignature: true },
    { id: 'doc-coc', filename: 'GHP_Code_of_Conduct_2026.pdf', description: 'Production code of conduct', requiresSignature: true },
    { id: 'doc-gdpr', filename: 'GHP_GDPR_Data_Protection_Notice.pdf', description: 'Data processing notice — crew rights and consent', requiresSignature: false },
  ],
};

// ── INITIAL STATE ──────────────────────────────────────────────────────────────

const INITIAL_STATE: Omit<DealMemoState, 'nominalLines' | 'checklistItems'> = {
  contractingEntityId: 'GHP-UK',
  department: 'Camera',
  role: '1st Assistant Camera',
  screenCredit: '1st Assistant Camera',
  territory: 'UK',
  unionKey: 'PACT-BECTU',
  isCustomDeal: false,
  crew: {
    firstName: 'Jamie',
    lastName: 'Chen',
    email: 'jamie.chen@email.com',
    phone: '+44 7700 900 123',
    department: 'Camera',
    role: '1st Assistant Camera',
    screenCredit: '1st Assistant Camera',
    reportsTo: 'Marcus Webb — DoP',
    costCentre: 'CAM',
    employmentStatusUK: 'paye',
  },
  deal: {
    dealType: 'daily',
    startDate: '2026-04-14',
    exclusivity: true,
    payOrPlay: false,
    shootDayGuarantee: 5,
    prepDays: 0,
    wrapDays: 0,
    travelDays: 0,
  },
  rates: {
    currency: 'GBP',
    rateBasis: 'daily',
    rateAmount: 550,
    rateType: 'negotiated',
    hpMode: 'excl',
    isCustomDeal: false,
    otRows: [],
  },
  allowances: getDefaultAllowances('PACT-BECTU', 'UK'),
  allowancesVisibleToCrew: true,
  delegateCannotSeeAmounts: false,
  taxCreditTagging: {
    scheme: 'HETVC',
    isCore: true,
    residentStatus: 'qualifying',
  },
  signingDocuments: DEFAULT_PRODUCTION.standardSigningDocuments,
  payrollStartForm: {
    bureau: 'SARGENT_DISC',
    productionReference: 'GH2-2026',
    payFrequency: 'weekly',
    isComplete: false,
    outstandingFields: ['niNumber', 'bankSortCode', 'bankAccountNumber'],
  },
  status: 'draft',
  productionId: 'GH2-2026',
  createdBy: 'Sarah Alderton',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ── STORE INTERFACE ────────────────────────────────────────────────────────────

interface DealMemoStore extends DealMemoState {
  // Navigation
  currentStep: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Step 1 actions
  setContractingEntity: (entityId: string) => void;
  setDepartment: (dept: DepartmentKey) => void;
  setRole: (role: string) => void;
  setTerritory: (territory: TerritoryKey) => void;
  setUnion: (unionKey: UnionKey) => void;
  setCustomDeal: (isCustom: boolean) => void;

  // Step 2 actions
  updateCrew: (fields: Partial<typeof INITIAL_STATE['crew']>) => void;

  // Step 3 actions
  updateDeal: (fields: Partial<typeof INITIAL_STATE['deal']>) => void;

  // Step 4 actions
  updateRates: (fields: Partial<typeof INITIAL_STATE['rates']>) => void;
  setHPMode: (mode: HPMode) => void;
  setCurrency: (currency: CurrencyCode) => void;

  // Step 5 actions
  addAllowance: (allowance: Allowance) => void;
  removeAllowance: (id: string) => void;
  updateAllowance: (id: string, fields: Partial<Allowance>) => void;

  // Step 6 actions
  updateNominalLine: (key: string, fields: Partial<NominalLine>) => void;
  updateTaxCreditTagging: (fields: Partial<typeof INITIAL_STATE['taxCreditTagging']>) => void;

  // Step 7 actions
  toggleChecklistItem: (id: string) => void;

  // Step 8 actions
  addSigningDocument: (doc: SigningDocument) => void;
  removeSigningDocument: (id: string) => void;
  toggleDocumentSignatureRequired: (id: string) => void;

  // Step 9 actions
  updatePayrollStartForm: (fields: Partial<typeof INITIAL_STATE['payrollStartForm']>) => void;

  // Production settings
  production: ProductionSettings;
  updateProductionCustomRules: (rules: Partial<ProductionSettings['customRules']>) => void;
  applyProductionTemplate: () => void;

  // Computed helpers
  getCurrentRule: () => typeof TERRITORY_RULES[keyof typeof TERRITORY_RULES];
  getCurrencySymbol: () => string;
  getDailyRate: () => number;
  getHourlyRate: () => number;
  getWeeklyCostEstimate: () => { basic: number; hp: number; allowances: number; onCosts: number; total: number };
  getOutstandingFields: () => string[];

  // Issue
  issueDealMemo: () => Promise<{ reference: string }>;
}

// ── STORE ──────────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£', USD: '$', EUR: '€', CAD: 'C$', AUD: 'A$',
  NZD: 'NZ$', NOK: 'kr', SEK: 'kr', ZAR: 'R', INR: '₹', JPY: '¥', BRL: 'R$', MXN: 'MX$',
};

export const useDealMemoStore = create<DealMemoStore>()(
  devtools(
    // NOTE: Remove persist() wrapper if server-side rendering — deals should be
    // loaded from the DB, not localStorage. Use persist only for autosave draft.
    (set, get) => ({
      ...INITIAL_STATE,
      nominalLines: buildNominalLines(
        TERRITORY_RULES['PACT-BECTU'],
        getDefaultAllowances('PACT-BECTU', 'UK'),
        'UK'
      ),
      checklistItems: buildComplianceChecklist('UK', 'PACT-BECTU'),
      currentStep: 1,
      production: DEFAULT_PRODUCTION,

      // ── Navigation ──────────────────────────────────────────────────────────
      goToStep: (step) => set({ currentStep: Math.max(1, Math.min(10, step)) }),
      nextStep: () => set((s) => ({ currentStep: Math.min(10, s.currentStep + 1) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(1, s.currentStep - 1) })),

      // ── Step 1 ───────────────────────────────────────────────────────────────
      setContractingEntity: (entityId) => {
        const entity = get().production.entities.find((e) => e.id === entityId);
        if (!entity) return;
        set({ contractingEntityId: entityId });
        // Auto-set territory and currency from entity
        get().setTerritory(entity.defaultTerritory);
        get().setCurrency(entity.defaultCurrency);
      },

      setDepartment: (dept) => {
        set({ department: dept });
        get().updateCrew({ department: dept });
      },

      setRole: (role) => {
        set({ role });
        get().updateCrew({ role, screenCredit: role });
      },

      setTerritory: (territory) => {
        const defaultUnionKey = (TERRITORY_TO_DEFAULT_RULE[territory] || 'default') as UnionKey;
        set({ territory, unionKey: defaultUnionKey });
        // Rebuild compliance and nominals
        set({
          checklistItems: buildComplianceChecklist(territory, defaultUnionKey),
          nominalLines: buildNominalLines(
            TERRITORY_RULES[defaultUnionKey] || TERRITORY_RULES.default,
            get().allowances,
            territory
          ),
        });
      },

      setUnion: (unionKey) => {
        const isCustom = isNonUnionKey(unionKey);
        set({ unionKey, isCustomDeal: isCustom });
        if (!isCustom) {
          const rule = TERRITORY_RULES[unionKey] || TERRITORY_RULES.default;
          set({
            checklistItems: buildComplianceChecklist(get().territory, unionKey),
            nominalLines: buildNominalLines(rule, get().allowances, get().territory),
            // Reset smart allowances for the union
            allowances: getDefaultAllowances(unionKey, get().territory),
          });
        }
      },

      setCustomDeal: (isCustom) => set({ isCustomDeal: isCustom }),

      // ── Step 2 ───────────────────────────────────────────────────────────────
      updateCrew: (fields) =>
        set((s) => ({ crew: { ...s.crew, ...fields }, updatedAt: new Date().toISOString() })),

      // ── Step 3 ───────────────────────────────────────────────────────────────
      updateDeal: (fields) =>
        set((s) => ({ deal: { ...s.deal, ...fields }, updatedAt: new Date().toISOString() })),

      // ── Step 4 ───────────────────────────────────────────────────────────────
      updateRates: (fields) =>
        set((s) => ({ rates: { ...s.rates, ...fields }, updatedAt: new Date().toISOString() })),

      setHPMode: (mode) =>
        set((s) => ({ rates: { ...s.rates, hpMode: mode }, updatedAt: new Date().toISOString() })),

      setCurrency: (currency) =>
        set((s) => ({ rates: { ...s.rates, currency }, updatedAt: new Date().toISOString() })),

      // ── Step 5 ───────────────────────────────────────────────────────────────
      addAllowance: (allowance) =>
        set((s) => {
          const allowances = [...s.allowances, allowance];
          return {
            allowances,
            nominalLines: buildNominalLines(
              get().getCurrentRule(),
              allowances,
              s.territory
            ),
            updatedAt: new Date().toISOString(),
          };
        }),

      removeAllowance: (id) =>
        set((s) => {
          const allowances = s.allowances.filter((a) => a.id !== id);
          return {
            allowances,
            nominalLines: buildNominalLines(get().getCurrentRule(), allowances, s.territory),
            updatedAt: new Date().toISOString(),
          };
        }),

      updateAllowance: (id, fields) =>
        set((s) => {
          const allowances = s.allowances.map((a) => (a.id === id ? { ...a, ...fields } : a));
          return {
            allowances,
            nominalLines: buildNominalLines(get().getCurrentRule(), allowances, s.territory),
            updatedAt: new Date().toISOString(),
          };
        }),

      // ── Step 6 ───────────────────────────────────────────────────────────────
      updateNominalLine: (key, fields) =>
        set((s) => ({
          nominalLines: s.nominalLines.map((l) => (l.key === key ? { ...l, ...fields } : l)),
          updatedAt: new Date().toISOString(),
        })),

      updateTaxCreditTagging: (fields) =>
        set((s) => ({
          taxCreditTagging: { ...s.taxCreditTagging, ...fields },
          updatedAt: new Date().toISOString(),
        })),

      // ── Step 7 ───────────────────────────────────────────────────────────────
      toggleChecklistItem: (id) =>
        set((s) => ({
          checklistItems: s.checklistItems.map((item) =>
            item.id === id ? { ...item, isChecked: !item.isChecked } : item
          ),
          updatedAt: new Date().toISOString(),
        })),

      // ── Step 8 ───────────────────────────────────────────────────────────────
      addSigningDocument: (doc) =>
        set((s) => ({ signingDocuments: [...s.signingDocuments, doc] })),

      removeSigningDocument: (id) =>
        set((s) => ({ signingDocuments: s.signingDocuments.filter((d) => d.id !== id) })),

      toggleDocumentSignatureRequired: (id) =>
        set((s) => ({
          signingDocuments: s.signingDocuments.map((d) =>
            d.id === id ? { ...d, requiresSignature: !d.requiresSignature } : d
          ),
        })),

      // ── Step 9 ───────────────────────────────────────────────────────────────
      updatePayrollStartForm: (fields) =>
        set((s) => ({ payrollStartForm: { ...s.payrollStartForm, ...fields } })),

      // ── Production Settings ───────────────────────────────────────────────────
      updateProductionCustomRules: (rules) =>
        set((s) => ({
          production: {
            ...s.production,
            customRules: { ...s.production.customRules, ...rules },
          },
        })),

      applyProductionTemplate: () => {
        const { production, rates } = get();
        const cr = production.customRules;
        set({
          isCustomDeal: true,
          rates: {
            ...rates,
            hpMode: cr.hpTreatment,
            rateBasis: cr.rateBasis,
          },
        });
      },

      // ── Computed ──────────────────────────────────────────────────────────────
      getCurrentRule: () => {
        const { unionKey, territory } = get();
        return (
          TERRITORY_RULES[unionKey] ||
          TERRITORY_RULES[TERRITORY_TO_DEFAULT_RULE[territory] as UnionKey] ||
          TERRITORY_RULES.default
        );
      },

      getCurrencySymbol: () => CURRENCY_SYMBOLS[get().rates.currency || 'GBP'] || '£',

      getDailyRate: () => {
        const { rates } = get();
        const raw = rates.rateAmount || 550;
        if (rates.rateBasis === 'weekly') return raw / 5;
        if (rates.rateBasis === 'hourly') return raw * 10;
        return raw;
      },

      getHourlyRate: () => {
        const rule = get().getCurrentRule();
        const basicHrs = parseInt(rule.basic) || 10;
        return get().getDailyRate() / basicHrs;
      },

      getWeeklyCostEstimate: () => {
        const { territory, allowances } = get();
        const daily = get().getDailyRate();
        const hpMode = get().rates.hpMode;
        const rule = get().getCurrentRule();
        const hpRate = parseFloat(rule.hp) || 0;
        const showHP = (territory === 'UK' || territory === 'IE') && hpRate > 0 && hpMode !== 'na';
        const basicDaily = hpMode === 'incl' && showHP ? daily / (1 + hpRate / 100) : daily;
        const hpPer = showHP ? (hpMode === 'incl' ? daily - basicDaily : basicDaily * hpRate / 100) : 0;
        const basic5 = basicDaily * 5;
        const hp5 = hpPer * 5;
        const allowTotal = allowances.reduce((sum, a) => sum + a.amount, 0);
        // On-costs (UK NIC simplified)
        const nicThreshold = territory === 'UK' ? 967 : 0;
        const nicRate = territory === 'UK' ? 0.138 : territory === 'AU' ? 0.11 : 0.0765;
        const onCosts = territory === 'UK'
          ? Math.max(0, (basic5 + hp5 - nicThreshold) * nicRate)
          : (basic5 + hp5) * nicRate;
        return { basic: basic5, hp: hp5, allowances: allowTotal, onCosts, total: basic5 + hp5 + allowTotal + onCosts };
      },

      getOutstandingFields: () => {
        const { crew, territory } = get();
        const outstanding: string[] = [];
        if (!crew.niNumber && territory === 'UK') outstanding.push('NI Number');
        if (!crew.ssn && territory === 'US') outstanding.push('SSN');
        if (!crew.tfn && territory === 'AU') outstanding.push('TFN');
        if (!crew.sin && territory === 'CA') outstanding.push('SIN');
        if (!crew.bankSortCode && !crew.achRoutingNumber && !crew.iban) outstanding.push('Bank Details');
        if (!crew.dateOfBirth) outstanding.push('Date of Birth');
        if (!crew.address) outstanding.push('Home Address');
        return outstanding;
      },

      // ── Issue ─────────────────────────────────────────────────────────────────
      issueDealMemo: async () => {
        // POST to /api/deal-memos — server generates reference, triggers DocuSign,
        // activates timecard template, creates cost report lines, sends portal invite
        const reference = `GH2-DM-2026-${String(Date.now()).slice(-4)}`;
        set({ status: 'issued', reference, updatedAt: new Date().toISOString() });
        return { reference };
      },
    }),
    { name: 'deal-memo-wizard' }
  )
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function isNonUnionKey(key: string): boolean {
  return key.endsWith('-NU') || key === 'default' || key === 'INT';
}
