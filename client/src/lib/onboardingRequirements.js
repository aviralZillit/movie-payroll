// ---------------------------------------------------------------------------
// Country-specific onboarding requirements.
// These are the DEFAULT fields a crew member must provide before payroll.
// Productions can override via ProductionSettings.onboardingRequirements.
// ---------------------------------------------------------------------------

export const ONBOARDING_REQUIREMENTS = {
  UK: [
    { key: 'niNumber', label: 'National Insurance Number', category: 'tax', required: true },
    { key: 'taxCode', label: 'Tax Code', category: 'tax', required: true },
    { key: 'studentLoan', label: 'Student Loan Plan', category: 'tax', required: false },
    { key: 'p45', label: 'P45 from Previous Employer', category: 'tax', required: false },
    { key: 'bankSortCode', label: 'Bank Sort Code', category: 'bank', required: true },
    { key: 'bankAccountNumber', label: 'Bank Account Number', category: 'bank', required: true },
    { key: 'dateOfBirth', label: 'Date of Birth', category: 'personal', required: true, type: 'date' },
    { key: 'address', label: 'Home Address', category: 'personal', required: true },
    { key: 'emergencyContact', label: 'Emergency Contact', category: 'personal', required: false },
  ],
  US: [
    { key: 'ssn', label: 'Social Security Number', category: 'tax', required: true },
    { key: 'w4FilingStatus', label: 'W-4 Filing Status', category: 'tax', required: true },
    { key: 'w4Allowances', label: 'W-4 Allowances', category: 'tax', required: false },
    { key: 'stateWithholding', label: 'State Withholding Form', category: 'tax', required: true },
    { key: 'i9Form', label: 'I-9 Employment Eligibility', category: 'compliance', required: true },
    { key: 'achRoutingNumber', label: 'ACH Routing Number', category: 'bank', required: true },
    { key: 'achAccountNumber', label: 'ACH Account Number', category: 'bank', required: true },
    { key: 'dateOfBirth', label: 'Date of Birth', category: 'personal', required: true, type: 'date' },
    { key: 'address', label: 'Home Address', category: 'personal', required: true },
  ],
  AU: [
    { key: 'tfn', label: 'Tax File Number', category: 'tax', required: true },
    { key: 'superFund', label: 'Superannuation Fund Name', category: 'pension', required: true },
    { key: 'superMemberNumber', label: 'Super Member Number', category: 'pension', required: true },
    { key: 'bsb', label: 'BSB Number', category: 'bank', required: true },
    { key: 'bankAccountNumber', label: 'Bank Account Number', category: 'bank', required: true },
    { key: 'dateOfBirth', label: 'Date of Birth', category: 'personal', required: true, type: 'date' },
    { key: 'address', label: 'Home Address', category: 'personal', required: true },
  ],
  FR: [
    { key: 'numSecSociale', label: 'Numéro de Sécurité Sociale', category: 'tax', required: true },
    { key: 'congespectacle', label: 'Congés Spectacles Number', category: 'compliance', required: false },
    { key: 'audiensMember', label: 'Audiens Member Number', category: 'pension', required: false },
    { key: 'mutuelle', label: 'Mutuelle (Health Insurance)', category: 'compliance', required: true },
    { key: 'iban', label: 'IBAN', category: 'bank', required: true },
    { key: 'dateOfBirth', label: 'Date of Birth', category: 'personal', required: true, type: 'date' },
    { key: 'address', label: 'Home Address', category: 'personal', required: true },
  ],
  DE: [
    { key: 'steuerID', label: 'Steuer-ID', category: 'tax', required: true },
    { key: 'sozialversicherung', label: 'Sozialversicherungsnummer', category: 'tax', required: true },
    { key: 'steuerklasse', label: 'Steuerklasse (Tax Class)', category: 'tax', required: true },
    { key: 'iban', label: 'IBAN', category: 'bank', required: true },
    { key: 'dateOfBirth', label: 'Date of Birth', category: 'personal', required: true, type: 'date' },
    { key: 'address', label: 'Home Address', category: 'personal', required: true },
  ],
  ES: [
    { key: 'nie', label: 'NIE / DNI', category: 'tax', required: true },
    { key: 'numSegSocial', label: 'Número Seguridad Social', category: 'tax', required: true },
    { key: 'iban', label: 'IBAN', category: 'bank', required: true },
    { key: 'dateOfBirth', label: 'Date of Birth', category: 'personal', required: true, type: 'date' },
    { key: 'address', label: 'Home Address', category: 'personal', required: true },
  ],
  IN: [
    { key: 'aadhaar', label: 'Aadhaar Card Number', category: 'id', required: true },
    { key: 'pan', label: 'PAN Card Number', category: 'tax', required: true },
    { key: 'uan', label: 'UAN (Provident Fund Number)', category: 'pension', required: true },
    { key: 'esiNumber', label: 'ESI Number', category: 'compliance', required: false },
    { key: 'bankAccountNumber', label: 'Bank Account Number', category: 'bank', required: true },
    { key: 'ifsc', label: 'IFSC Code', category: 'bank', required: true },
    { key: 'dateOfBirth', label: 'Date of Birth', category: 'personal', required: true, type: 'date' },
    { key: 'address', label: 'Home Address', category: 'personal', required: true },
    { key: 'emergencyContact', label: 'Emergency Contact', category: 'personal', required: false },
  ],
  CA: [
    { key: 'sin', label: 'Social Insurance Number', category: 'tax', required: true },
    { key: 'td1Federal', label: 'TD1 Federal Form', category: 'tax', required: true },
    { key: 'td1Provincial', label: 'TD1 Provincial Form', category: 'tax', required: true },
    { key: 'bankTransit', label: 'Bank Transit Number', category: 'bank', required: true },
    { key: 'bankInstitution', label: 'Bank Institution Number', category: 'bank', required: true },
    { key: 'bankAccount', label: 'Bank Account Number', category: 'bank', required: true },
    { key: 'dateOfBirth', label: 'Date of Birth', category: 'personal', required: true, type: 'date' },
    { key: 'address', label: 'Home Address', category: 'personal', required: true },
  ],
};

// Category display config
export const ONBOARDING_CATEGORIES = {
  tax: { label: 'Tax & ID', icon: 'receipt', order: 1 },
  id: { label: 'Identity Documents', icon: 'id-card', order: 2 },
  bank: { label: 'Bank Details', icon: 'landmark', order: 3 },
  pension: { label: 'Pension / Superannuation', icon: 'piggy-bank', order: 4 },
  compliance: { label: 'Compliance', icon: 'shield-check', order: 5 },
  personal: { label: 'Personal Details', icon: 'user', order: 6 },
  custom: { label: 'Additional Requirements', icon: 'list-checks', order: 7 },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get onboarding requirements for a territory.
 * If productionOverrides are provided, use those instead.
 */
export function getOnboardingRequirements(territory, productionOverrides) {
  if (productionOverrides && productionOverrides.length > 0) {
    return productionOverrides;
  }
  return ONBOARDING_REQUIREMENTS[territory] || ONBOARDING_REQUIREMENTS.UK;
}

/**
 * Group requirements by category and sort.
 */
export function groupByCategory(requirements) {
  const grouped = {};
  for (const req of requirements) {
    const cat = req.category || 'custom';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(req);
  }
  // Sort categories by order
  return Object.entries(grouped)
    .sort(([a], [b]) => (ONBOARDING_CATEGORIES[a]?.order || 99) - (ONBOARDING_CATEGORIES[b]?.order || 99))
    .map(([category, items]) => ({
      category,
      label: ONBOARDING_CATEGORIES[category]?.label || category,
      items,
    }));
}

/**
 * Check completion status: how many required fields are filled.
 */
export function checkOnboardingCompletion(requirements, crewData) {
  const required = requirements.filter(r => r.required);
  const filled = required.filter(r => crewData[r.key]);
  return {
    total: requirements.length,
    requiredTotal: required.length,
    requiredFilled: filled.length,
    isComplete: filled.length === required.length,
    missing: required.filter(r => !crewData[r.key]).map(r => r.label),
  };
}
