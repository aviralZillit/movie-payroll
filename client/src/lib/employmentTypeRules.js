/**
 * Client-side employment type rules.
 * Mirrors server/src/config/employmentTypeRules.js for field visibility in the UI.
 * Used by Step1CrewDetails, DealMemoDetail, TimecardGrid to show/hide fields.
 */

const RULES = {
  // UK
  paye: { category: 'employee', showFields: ['niNumber', 'taxCode', 'studentLoan', 'bankSortCode', 'bankAccountNumber', 'dateOfBirth', 'crewAddress', 'emergencyContact'], hideFields: ['ltdCompanyName', 'ltdCompanyReg', 'vatNumber', 'ir35Status', 'utrNumber', 'corpName', 'corpEin'], timecardRequired: true, otApplies: true, fringesApply: true },
  ltd: { category: 'corporate', showFields: ['ltdCompanyName', 'ltdCompanyReg', 'vatNumber', 'ir35Status', 'dateOfBirth', 'crewAddress'], hideFields: ['niNumber', 'taxCode', 'studentLoan', 'bankSortCode', 'bankAccountNumber', 'utrNumber'], timecardRequired: false, otApplies: false, fringesApply: false },
  sole_trader: { category: 'self_employed', showFields: ['niNumber', 'utrNumber', 'bankSortCode', 'bankAccountNumber', 'dateOfBirth', 'crewAddress', 'emergencyContact'], hideFields: ['ltdCompanyName', 'ltdCompanyReg', 'vatNumber', 'ir35Status', 'taxCode'], timecardRequired: false, otApplies: false, fringesApply: false },

  // US
  w2: { category: 'employee', showFields: ['ssn', 'w4FilingStatus', 'w4Allowances', 'stateWithholding', 'achRoutingNumber', 'achAccountNumber', 'dateOfBirth', 'crewAddress', 'emergencyContact'], hideFields: ['corpName', 'corpEin'], timecardRequired: true, otApplies: true, fringesApply: true },
  loanout: { category: 'corporate', showFields: ['corpName', 'corpEin', 'dateOfBirth', 'crewAddress'], hideFields: ['ssn', 'w4FilingStatus', 'w4Allowances', 'achRoutingNumber', 'achAccountNumber'], timecardRequired: false, otApplies: false, fringesApply: false },
  '1099': { category: 'self_employed', showFields: ['ssn', 'crewAddress', 'dateOfBirth'], hideFields: ['corpName', 'corpEin', 'w4FilingStatus', 'w4Allowances', 'achRoutingNumber', 'achAccountNumber'], timecardRequired: false, otApplies: false, fringesApply: false },

  // AU
  payg: { category: 'employee', showFields: ['tfn', 'superFund', 'superMemberNumber', 'bsb', 'bankAccountNumber', 'dateOfBirth', 'crewAddress', 'emergencyContact'], hideFields: [], timecardRequired: true, otApplies: true, fringesApply: true },
  pty_ltd: { category: 'corporate', showFields: ['ltdCompanyName', 'ltdCompanyReg', 'dateOfBirth', 'crewAddress'], hideFields: ['tfn', 'superFund', 'superMemberNumber', 'bsb', 'bankAccountNumber'], timecardRequired: false, otApplies: false, fringesApply: false },
  abn: { category: 'self_employed', showFields: ['taxId', 'bsb', 'bankAccountNumber', 'dateOfBirth', 'crewAddress'], hideFields: ['tfn', 'superFund', 'superMemberNumber'], timecardRequired: false, otApplies: false, fringesApply: false },

  // DE
  festanstellung: { category: 'employee', showFields: ['steuerID', 'sozialversicherung', 'steuerklasse', 'iban', 'dateOfBirth', 'crewAddress', 'emergencyContact'], hideFields: ['steuernummer', 'ustIdNr', 'handelsregister'], timecardRequired: true, otApplies: true, fringesApply: true },
  freiberufler: { category: 'self_employed', showFields: ['steuerID', 'steuernummer', 'iban', 'dateOfBirth', 'crewAddress'], hideFields: ['sozialversicherung', 'steuerklasse', 'handelsregister'], timecardRequired: false, otApplies: false, fringesApply: false },
  gmbh: { category: 'corporate', showFields: ['ltdCompanyName', 'handelsregister', 'ustIdNr', 'iban', 'dateOfBirth', 'crewAddress'], hideFields: ['steuerID', 'sozialversicherung', 'steuerklasse'], timecardRequired: false, otApplies: false, fringesApply: false },

  // FR
  cdi: { category: 'employee', showFields: ['numSecSociale', 'mutuelle', 'iban', 'dateOfBirth', 'crewAddress', 'emergencyContact'], hideFields: [], timecardRequired: true, otApplies: true, fringesApply: true },
  intermittent: { category: 'employee', showFields: ['numSecSociale', 'congespectacle', 'audiensMember', 'mutuelle', 'iban', 'dateOfBirth', 'crewAddress', 'emergencyContact'], hideFields: [], timecardRequired: true, otApplies: true, fringesApply: true },
  micro_entrepreneur: { category: 'self_employed', showFields: ['taxId', 'iban', 'dateOfBirth', 'crewAddress'], hideFields: ['numSecSociale', 'congespectacle', 'mutuelle'], timecardRequired: false, otApplies: false, fringesApply: false },

  // ES
  fijo: { category: 'employee', showFields: ['nie', 'numSegSocial', 'iban', 'dateOfBirth', 'crewAddress', 'emergencyContact'], hideFields: ['iaeCode'], timecardRequired: true, otApplies: true, fringesApply: true },
  autonomo: { category: 'self_employed', showFields: ['nie', 'iaeCode', 'iban', 'dateOfBirth', 'crewAddress'], hideFields: ['numSegSocial'], timecardRequired: false, otApplies: false, fringesApply: false },
  sl: { category: 'corporate', showFields: ['ltdCompanyName', 'ltdCompanyReg', 'iban', 'dateOfBirth', 'crewAddress'], hideFields: ['nie', 'numSegSocial', 'iaeCode'], timecardRequired: false, otApplies: false, fringesApply: false },
};

export function getEmploymentRules(employmentStatus) {
  if (!employmentStatus) return RULES.paye;
  return RULES[employmentStatus.toLowerCase()] || RULES.paye;
}

export function shouldShowField(employmentStatus, fieldName) {
  const rules = getEmploymentRules(employmentStatus);
  if (rules.hideFields.includes(fieldName)) return false;
  if (rules.showFields.includes(fieldName)) return true;
  return true; // show by default if not in either list
}

export function shouldHideOTColumns(employmentStatus) {
  const rules = getEmploymentRules(employmentStatus);
  return !rules.otApplies;
}

export function shouldHideFringes(employmentStatus) {
  const rules = getEmploymentRules(employmentStatus);
  return !rules.fringesApply;
}

export default RULES;
