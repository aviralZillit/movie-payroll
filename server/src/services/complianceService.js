/**
 * Territory-aware compliance checklist and card builder.
 * Based on Kate's buildComplianceCards() + buildChecklist().
 */

const COMPLIANCE_DATA = {
  UK: {
    cards: [
      { title: 'IR35 Status', status: 'pending', items: [
        { dot: 'o', text: 'IR35 determination required for Ltd/PSC contractors' },
        { dot: 'g', text: 'PAYE workers are automatically outside scope' },
      ]},
      { title: 'Right to Work', status: 'pending', items: [
        { dot: 'r', text: 'RTW check must be completed before first day' },
        { dot: 'o', text: 'Document copy retained on file' },
      ]},
      { title: 'Working Time Regs', status: 'ok', items: [
        { dot: 'g', text: 'WTR opt-out signed' },
        { dot: 'g', text: '48-hour week limit waived' },
      ]},
      { title: 'GDPR & Data', status: 'ok', items: [
        { dot: 'g', text: 'Privacy notice issued' },
        { dot: 'g', text: 'Data processing agreement in place' },
      ]},
    ],
    checklist: [
      { itemKey: 'rtw_check', name: 'Right to Work check completed', responsibility: 'PRODUCTION', isRequired: true },
      { itemKey: 'p45_received', name: 'P45 from previous employer received', responsibility: 'CREW UPLOADS', isRequired: false },
      { itemKey: 'ni_number', name: 'NI Number provided', responsibility: 'CREW UPLOADS', isRequired: true },
      { itemKey: 'tax_code', name: 'Tax code provided or starter declaration', responsibility: 'CREW UPLOADS', isRequired: true },
      { itemKey: 'bank_details', name: 'Bank details provided (sort code + account)', responsibility: 'CREW UPLOADS', isRequired: true },
      { itemKey: 'emergency_contact', name: 'Emergency contact details', responsibility: 'CREW UPLOADS', isRequired: false },
      { itemKey: 'nda_signed', name: 'NDA signed', responsibility: 'PRODUCTION', isRequired: true },
      { itemKey: 'hb_policy', name: 'Anti-Harassment & Bullying policy signed', responsibility: 'PRODUCTION', isRequired: true },
      { itemKey: 'hs_policy', name: 'Health & Safety policy signed', responsibility: 'PRODUCTION', isRequired: true },
      { itemKey: 'gdpr_notice', name: 'GDPR Data Protection notice issued', responsibility: 'PRODUCTION', isRequired: false },
    ],
  },

  US: {
    cards: [
      { title: 'Work Authorization I-9', status: 'pending', items: [
        { dot: 'r', text: 'I-9 must be completed within 3 days of hire' },
        { dot: 'o', text: 'E-Verify if applicable' },
      ]},
      { title: 'Union Membership', status: 'required', items: [
        { dot: 'o', text: 'Union card number verified' },
        { dot: 'g', text: 'Taft-Hartley waiver if non-member (30 days to join)' },
      ]},
      { title: 'Federal & State Tax', status: 'pending', items: [
        { dot: 'r', text: 'W-4 federal withholding form' },
        { dot: 'o', text: 'State withholding form (CA DE-4, NY IT-2104)' },
      ]},
      { title: 'Health & Welfare', status: 'tracking', items: [
        { dot: 'g', text: 'H&W qualifying hours tracking enabled' },
        { dot: 'o', text: 'Pension vesting period tracked' },
      ]},
    ],
    checklist: [
      { itemKey: 'i9_completed', name: 'I-9 Work Authorization completed', responsibility: 'PRODUCTION', isRequired: true },
      { itemKey: 'w4_completed', name: 'W-4 Federal Withholding form', responsibility: 'CREW UPLOADS', isRequired: true },
      { itemKey: 'state_withholding', name: 'State withholding form', responsibility: 'CREW UPLOADS', isRequired: true },
      { itemKey: 'ssn_provided', name: 'SSN provided', responsibility: 'CREW UPLOADS', isRequired: true },
      { itemKey: 'union_card', name: 'Union card number verified', responsibility: 'PRODUCTION', isRequired: true },
      { itemKey: 'ach_details', name: 'ACH routing + account number', responsibility: 'CREW UPLOADS', isRequired: true },
      { itemKey: 'nda_signed', name: 'NDA signed', responsibility: 'PRODUCTION', isRequired: true },
    ],
  },

  CA: {
    cards: [
      { title: 'Work Authorization / SIN', status: 'pending', items: [
        { dot: 'r', text: 'SIN required for all Canadian workers' },
      ]},
      { title: 'Union Membership', status: 'required', items: [
        { dot: 'o', text: 'Union card required for covered positions' },
      ]},
      { title: 'Canadian Tax / TD1', status: 'pending', items: [
        { dot: 'r', text: 'TD1 Federal form required' },
        { dot: 'o', text: 'TD1 Provincial form required' },
      ]},
      { title: 'PIPEDA Compliance', status: 'ok', items: [
        { dot: 'g', text: 'Privacy policy compliant' },
      ]},
    ],
    checklist: [
      { itemKey: 'sin_provided', name: 'SIN provided', responsibility: 'CREW UPLOADS', isRequired: true },
      { itemKey: 'td1_federal', name: 'TD1 Federal form', responsibility: 'CREW UPLOADS', isRequired: true },
      { itemKey: 'td1_provincial', name: 'TD1 Provincial form', responsibility: 'CREW UPLOADS', isRequired: true },
      { itemKey: 'bank_details', name: 'Bank transit/institution/account', responsibility: 'CREW UPLOADS', isRequired: true },
      { itemKey: 'union_card', name: 'Union card number', responsibility: 'PRODUCTION', isRequired: true },
    ],
  },

  AU: {
    cards: [
      { title: 'Tax File Number', status: 'pending', items: [
        { dot: 'r', text: 'TFN must be provided within 28 days' },
      ]},
      { title: 'Fair Work Act', status: 'ok', items: [
        { dot: 'g', text: 'Modern Award compliance confirmed' },
      ]},
      { title: 'Superannuation', status: 'required', items: [
        { dot: 'r', text: 'Super fund choice form required', },
        { dot: 'o', text: 'Quarterly contributions due — late attracts SGC penalties' },
      ]},
      { title: 'Privacy Act', status: 'ok', items: [
        { dot: 'g', text: 'Privacy policy compliant' },
      ]},
    ],
    checklist: [
      { itemKey: 'tfn_provided', name: 'Tax File Number provided', responsibility: 'CREW UPLOADS', isRequired: true },
      { itemKey: 'super_choice', name: 'Super fund choice form completed', responsibility: 'CREW UPLOADS', isRequired: true },
      { itemKey: 'bank_details', name: 'BSB + Account number', responsibility: 'CREW UPLOADS', isRequired: true },
    ],
  },
};

// DGA-specific overrides
const DGA_OVERRIDES = {
  cards: [
    { title: 'Work Authorization I-9', status: 'pending', items: [
      { dot: 'r', text: 'I-9 completed' },
    ]},
    { title: 'DGA Membership', status: 'required', items: [
      { dot: 'o', text: 'DGA member in good standing' },
    ]},
    { title: 'DGA Deal Memo', status: 'warn', items: [
      { dot: 'r', text: 'Must file deal memo with DGA office within 15 days' },
    ]},
    { title: 'DGA H&W', status: 'tracking', items: [
      { dot: 'g', text: 'P&H tracking: 8.75% pension + 11.25% health' },
    ]},
  ],
};

const SAG_OVERRIDES = {
  cards: [
    { title: 'Work Authorization I-9', status: 'pending', items: [
      { dot: 'r', text: 'I-9 completed' },
    ]},
    { title: 'SAG-AFTRA Status', status: 'required', items: [
      { dot: 'o', text: 'Taft-Hartley for non-members (30 days to join)' },
    ]},
    { title: 'SAG Contract', status: 'warn', items: [
      { dot: 'r', text: 'P&H at 18.5% on ALL earnings confirmed' },
    ]},
    { title: 'SAG Health Plan', status: 'tracking', items: [
      { dot: 'g', text: 'Qualifying earnings tracked' },
    ]},
  ],
};

/**
 * Build compliance cards for a given territory and union.
 */
export function buildComplianceCards(territory, unionKey) {
  // Check for union-specific overrides
  if (unionKey === 'DGA') return DGA_OVERRIDES.cards;
  if (unionKey === 'SAG-THEATRICAL' || unionKey === 'SAG-TV') return SAG_OVERRIDES.cards;

  const data = COMPLIANCE_DATA[territory] || COMPLIANCE_DATA.UK;
  return data.cards;
}

/**
 * Build compliance checklist for a given territory.
 */
export function buildComplianceChecklist(territory) {
  const data = COMPLIANCE_DATA[territory] || COMPLIANCE_DATA.UK;
  return data.checklist.map((item) => ({
    ...item,
    isChecked: false,
  }));
}

/**
 * Get outstanding fields for crew completion.
 */
export function getOutstandingFields(territory, employmentStatus) {
  const fields = [];

  if (territory === 'UK') {
    fields.push('niNumber', 'taxCode', 'bankSortCode', 'bankAccountNumber', 'dateOfBirth', 'address');
    if (employmentStatus === 'ltd') fields.push('ltdCompanyReg', 'ir35Status');
  } else if (territory === 'US') {
    fields.push('ssn', 'w4FilingStatus', 'achRoutingNumber', 'achAccountNumber');
    if (employmentStatus === 'loanout') fields.push('corpEin');
  } else if (territory === 'CA') {
    fields.push('sin', 'province', 'bankTransit', 'bankInstitution', 'bankAccount');
  } else if (territory === 'AU') {
    fields.push('tfn', 'superFund', 'superMemberNumber', 'bsb', 'bankAccount');
  }

  return fields;
}
