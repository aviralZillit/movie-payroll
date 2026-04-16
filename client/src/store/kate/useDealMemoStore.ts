import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { DealMemoData } from '../../types/kate/index';

const INITIAL_STATE: DealMemoData = {
  territory: 'uk',
  union: 'pact-bectu',
  pactBand: '',
  pactSpecialDept: false,
  schedPrepDays: 0,
  schedShootDays: 0,
  schedWrapDays: 0,
  department: '',
  jobTitle: '',
  customJobTitle: '',
  callSheetTier: 'Crew',
  employmentStatusId: 'paye',
  dealType: 'weekly',
  ukTravelZone: '30mile',
  distantLocation: false,
  distantAccommodation: 'hotel-provided',
  distantTravelOption: '',
  distantTravelDays: 'none',
  idleDaysApplicable: 'no',
  idleDaysMax: 2,
  idleDaysFringes: 'benefits-only',
  rates: {
    dayRate: 0,
    weeklyRate: 0,
    currency: 'GBP',
    paymentCurrency: 'GBP',
    hpMode: 'incl',
    phaseRatesOn: false,
  },
  currentStep: 1,
  // Step 2 personal details
  reportsTo: '',
  fullName: '',
  preferredName: '',
  dob: '',
  nationalInsurance: '',
  taxCode: '',
  rightToWork: '',
  homeAddress: '',
  emergencyContact: '',
  // Step 3
  startDate: '',
  endDate: '',
  billingBasis: '',
  noticeType: '1week',
  screenCredit: '',
  // Step 5
  allowances: [],
  // Step 6
  nominalCodes: {},
  // Step 8
  documents: [],
  dealNotes: '',
  // Step 4 extras
  buyoutCovers: '10',
  fxLockDate: '',
  // Step 8
  copyToProductionOffice: true,
  // Step 9
  payrollAutoSync: true,
  payrollNotifyOnIssue: true,
  payrollIncludePdf: false,
  // Assigned crew user (set in Step 2)
  assignedUserId: '',
};

interface DealMemoStore extends DealMemoData {
  currentMemoId: string | null;
  update: (patch: Partial<DealMemoData>) => void;
  goStep:  (step: number) => void;
  reset:   () => void;
  setCurrentMemoId: (id: string | null) => void;
}

export const useDealMemoStore = create<DealMemoStore>()(
  devtools(
    persist(
      (set) => ({
        ...INITIAL_STATE,
        currentMemoId: null,

        update: (patch) => set((state) => ({ ...state, ...patch }), false, 'update'),

        goStep: (step) => set({ currentStep: step }, false, 'goStep'),

        reset: () => set({ ...INITIAL_STATE, currentMemoId: null }, false, 'reset'),

        setCurrentMemoId: (id) => set({ currentMemoId: id }, false, 'setCurrentMemoId'),
      }),
      {
        name: 'zillit-deal-memo',
        version: 5, // bump whenever INITIAL_STATE shape changes — clears stale persisted state
        migrate: (_persistedState, _version) => {
          // Always start fresh on schema change — avoids stale type mismatches
          return { ...INITIAL_STATE, currentMemoId: null };
        },
      },
    ),
    { name: 'DealMemoStore' },
  ),
);
