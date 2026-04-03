// ─────────────────────────────────────────────────────────────────────────────
// lib/nominalCoding.ts
// ─────────────────────────────────────────────────────────────────────────────
import type { NominalLine, Allowance, TerritoryKey } from '../types/dealMemo';
import type { TerritoryRule } from '../types/dealMemo';

export function buildNominalLines(
  rule: TerritoryRule,
  allowances: Allowance[],
  territory: TerritoryKey
): NominalLine[] {
  const lines: NominalLine[] = [
    {
      key: 'basic',
      label: 'Basic Labour + HP/Vacation',
      description: `Basic ${rule.basic} day rate including HP uplift → 2302`,
      estimatedWeekly: null, // calculated from rate
      nominalCode: '2302',
      costCentre: 'DEPT',
      episode: 'All Episodes',
      isCore: true,
    },
    {
      key: 'ot',
      label: 'Overtime / Pre-call / Penalties',
      description: 'Variable hours, premiums, meal penalties → 2360',
      estimatedWeekly: null,
      nominalCode: '2360',
      costCentre: 'DEPT',
      episode: 'All Episodes',
      isCore: true,
    },
    {
      key: 'nic',
      label: territory === 'US' ? 'FICA / Employer Tax' : territory === 'AU' ? 'Superannuation' : 'Employer NIC',
      description: territory === 'UK' ? '13.8% above secondary threshold → 2399'
        : territory === 'US' ? '7.65% FICA on gross wages → 2399'
        : territory === 'AU' ? '11% Super Guarantee → 2399'
        : 'Employer tax/contributions → 2399',
      estimatedWeekly: null,
      nominalCode: '2399',
      costCentre: 'DEPT',
      episode: 'All Episodes',
      isCore: true,
    },
  ];

  // Add allowance lines
  for (const allowance of allowances) {
    lines.push({
      key: `allow_${allowance.id}`,
      label: allowance.name,
      description: `${allowance.amount} · ${allowance.taxTreatment} → ${allowance.nominalCode}`,
      estimatedWeekly: allowance.amount,
      nominalCode: allowance.nominalCode,
      costCentre: 'DEPT',
      episode: 'All Episodes',
      isCore: false,
    });
  }

  // Add US/CA fringe lines
  if (rule.rfHw && territory === 'US') {
    lines.push({
      key: 'hw',
      label: 'Health & Welfare (Employer)',
      description: `${rule.rfHw} per hour worked`,
      estimatedWeekly: null,
      nominalCode: '2399',
      costCentre: 'DEPT',
      episode: 'All Episodes',
      isCore: false,
      isFringe: true,
    });
  }

  if (rule.rfPension && rule.rfPension.includes('%') && (territory === 'US' || territory === 'CA')) {
    lines.push({
      key: 'pension',
      label: 'Pension / Retirement (Employer)',
      description: `${rule.rfPension} of gross wages`,
      estimatedWeekly: null,
      nominalCode: '2397',
      costCentre: 'DEPT',
      episode: 'All Episodes',
      isCore: false,
      isFringe: true,
    });
  }

  return lines;
}


// ─────────────────────────────────────────────────────────────────────────────
// lib/compliance.ts
// ─────────────────────────────────────────────────────────────────────────────
import type { ChecklistItem, TerritoryKey as Terr, UnionKey as UK } from '../types/dealMemo';

export function buildComplianceChecklist(territory: Terr, unionKey: UK): ChecklistItem[] {
  const key = getComplianceKey(territory, unionKey);

  const checklists: Record<string, ChecklistItem[]> = {
    UK: [
      { id: 'signed-dm', name: 'Signed Deal Memo / Offer Letter', responsibility: 'PRODUCTION', isChecked: true, isRequired: true },
      { id: 'photo-id', name: 'Photo ID — Passport or Driving Licence (Right to Work)', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'p45', name: 'P45 or Starter Checklist (P46 equivalent)', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'email', name: 'Email address confirmed (portal invite sent)', responsibility: 'PRODUCTION', isChecked: true, isRequired: true },
      { id: 'bank', name: 'Bank Account Details — sort code & account number', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'ni', name: 'National Insurance Number', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'wtd', name: 'Working Time Directive Opt-Out (if applicable)', responsibility: 'OPTIONAL', isChecked: false, isRequired: false },
      { id: 'kit-insurance', name: 'Kit / Equipment Insurance Certificate', responsibility: 'IF APPLICABLE', isChecked: false, isRequired: false },
      { id: 'pli', name: 'Public Liability Insurance (if self-employed)', responsibility: 'IF APPLICABLE', isChecked: false, isRequired: false },
    ],
    US: [
      { id: 'start-card', name: 'Signed Start Card / Deal Memo', responsibility: 'PRODUCTION', isChecked: true, isRequired: true },
      { id: 'i9', name: 'I-9 Form — completed with original documents', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'w4', name: 'W-4 Federal Tax Withholding Form', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'state-tax', name: 'State Income Tax Withholding Form', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'ach', name: 'Direct Deposit Authorization (ACH)', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'union-card', name: 'Union Card — valid local membership', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'ssn', name: 'Social Security Number verified', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'box-rental', name: 'Box / kit rental agreement', responsibility: 'IF APPLICABLE', isChecked: false, isRequired: false },
    ],
    CA: [
      { id: 'deal-memo', name: 'Signed Deal Memo', responsibility: 'PRODUCTION', isChecked: true, isRequired: true },
      { id: 'photo-id', name: 'Government-issued photo ID', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'sin', name: 'SIN Card or SIN confirmation letter', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'td1-fed', name: 'TD1 Federal Personal Tax Credits Return', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'td1-prov', name: 'Provincial TD1 Form', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'bank', name: 'Direct deposit / banking details', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'union-card', name: 'Union card (valid provincial membership)', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: false },
    ],
    AU: [
      { id: 'deal-memo', name: 'Signed Deal Memo / Crew Agreement', responsibility: 'PRODUCTION', isChecked: true, isRequired: true },
      { id: 'photo-id', name: 'Government-issued photo ID', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'tfn', name: 'TFN Declaration Form', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'super', name: 'Superannuation fund name and member number', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'bank', name: 'BSB and account number (bank details)', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'abn', name: 'ABN (if sole trader or Pty Ltd)', responsibility: 'IF APPLICABLE', isChecked: false, isRequired: false },
    ],
    default: [
      { id: 'deal-memo', name: 'Signed Deal Memo', responsibility: 'PRODUCTION', isChecked: true, isRequired: true },
      { id: 'photo-id', name: 'Government-issued photo ID', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'tax-id', name: 'Tax identification number', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'email', name: 'Email confirmed (portal invite sent)', responsibility: 'PRODUCTION', isChecked: true, isRequired: true },
      { id: 'bank', name: 'Bank / payment account details', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: true },
      { id: 'work-auth', name: 'Work authorization document', responsibility: 'CREW UPLOADS', isChecked: false, isRequired: false },
    ],
  };

  return checklists[key] || checklists.default;
}

function getComplianceKey(territory: Terr, unionKey: UK): string {
  if (territory === 'UK' || territory === 'IE') return 'UK';
  if (territory === 'CA') return 'CA';
  if (territory === 'AU' || territory === 'NZ') return 'AU';
  if (territory === 'US') return 'US';
  return 'default';
}


// ─────────────────────────────────────────────────────────────────────────────
// data/allowances.ts — Default allowances per agreement
// ─────────────────────────────────────────────────────────────────────────────
import { v4 as uuid } from 'uuid'; // npm install uuid @types/uuid
import type { Allowance, UnionKey as UnionK, TerritoryKey as TerrK } from '../types/dealMemo';

export function getDefaultAllowances(unionKey: UnionK, territory: TerrK): Allowance[] {
  const isUK = territory === 'UK' || territory === 'IE';
  const isUS = territory === 'US';
  const isAU = territory === 'AU';

  if (isUK) {
    return [
      {
        id: uuid(),
        name: 'Box / Kit Allowance',
        amount: 500,
        taxTreatment: 'non-taxable',
        nominalCode: '2350',
        caps: {
          frequency: 'weekly',
          weeklyCap: 500,
          minDaysForFullRate: 3,
          proRateShortWeeks: true,
          excludeSundays: true,
          excludeSaturdays: false,
          payableOnTravelDays: true,
          payableOnPrepDays: true,
        },
        isVisible: true,
      },
      {
        id: uuid(),
        name: 'Car Allowance',
        amount: 25,
        taxTreatment: 'non-taxable',
        nominalCode: '2340',
        caps: {
          frequency: 'daily',
          maxDaysPerWeek: 5,
          proRateShortWeeks: false,
          excludeSundays: true,
          excludeSaturdays: false,
          payableOnTravelDays: false,
          payableOnPrepDays: true,
        },
        isVisible: true,
      },
      {
        id: uuid(),
        name: 'Phone Allowance',
        amount: 2,
        taxTreatment: 'non-taxable',
        nominalCode: '2340',
        caps: {
          frequency: 'daily',
          weeklyCap: 10,
          proRateShortWeeks: false,
          excludeSundays: false,
          payableOnTravelDays: true,
          payableOnPrepDays: true,
        },
        isVisible: true,
      },
    ];
  }

  if (isUS) {
    return [
      {
        id: uuid(),
        name: 'Box / Kit Rental',
        amount: 100,
        taxTreatment: 'non-taxable',
        nominalCode: '2350',
        caps: {
          frequency: 'daily',
          proRateShortWeeks: false,
          excludeSundays: false,
          payableOnTravelDays: true,
          payableOnPrepDays: true,
        },
        isVisible: true,
      },
    ];
  }

  // Default: no pre-populated allowances
  return [];
}
