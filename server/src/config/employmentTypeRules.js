/**
 * Employment Type Rules — Single source of truth.
 *
 * For each employment type across all territories, defines:
 *   - category: 'employee' | 'corporate' | 'self_employed'
 *   - fringes: which employer fringes apply
 *   - payroll: which payroll features apply (OT, premiums, penalties)
 *   - timecard: whether timecards are required and what to track
 *   - deductions: what tax/NI to deduct from gross
 *   - dealMemoFields: which fields to show/hide/require
 *
 * Used by:
 *   - territoryFringeCalculator.js (fringe rules)
 *   - payrollEngine.js (OT, premiums, penalties)
 *   - Client: Step1CrewDetails.jsx (field visibility)
 *   - Client: DealMemoDetail.jsx (field display)
 */

const RULES = {
  // ═══════════════════════════════════════════════════════════════════
  // UNITED KINGDOM
  // ═══════════════════════════════════════════════════════════════════
  paye: {
    territory: 'UK',
    category: 'employee',
    label: 'PAYE',
    fringes: {
      holidayPay: true,          // Statutory — 12.07% on top or inclusive
      employerNIC: true,         // 13.8% above threshold
      pension: true,             // 3% employer auto-enrol
      apprenticeshipLevy: true,  // 0.5% if payroll > £3m
      workersComp: true,         // Via employer liability insurance
      healthWelfare: false,      // No UK equivalent
    },
    payroll: {
      overtime: true,            // Always — BECTU rates apply
      sixthDayPremium: true,     // 1.5x per BECTU MMP
      seventhDayPremium: true,   // 2x per BECTU MMP
      nightPremium: true,        // 2x after 11pm (BECTU)
      mealPenalties: true,       // If meal not within 6hrs
      turnaroundPenalties: true, // Breach of 11hr rest
      dayPremiums: true,
    },
    timecard: {
      required: true,
      trackHours: true,
      trackOT: true,
      trackMeals: true,
    },
    deductions: {
      incomeTax: true,           // PAYE deducted
      employeeNI: true,          // Class 1
      studentLoan: true,         // If applicable
      pension: true,             // Employee 5%
    },
    showFields: ['niNumber', 'taxCode', 'studentLoan', 'bankSortCode', 'bankAccountNumber', 'dateOfBirth', 'crewAddress', 'emergencyContact'],
    hideFields: ['ltdCompanyName', 'ltdCompanyReg', 'vatNumber', 'ir35Status', 'utrNumber', 'corpName', 'corpEin'],
    requiredFields: ['niNumber', 'taxCode', 'bankSortCode', 'bankAccountNumber'],
  },

  ltd: {
    territory: 'UK',
    category: 'corporate',
    label: 'Ltd Company',
    fringes: {
      holidayPay: false,         // Ltd handles via dividends
      employerNIC: false,        // No — contractor invoices
      pension: false,            // Outside auto-enrol scope
      apprenticeshipLevy: false, // Not applicable
      workersComp: false,        // Self-insured
      healthWelfare: false,
    },
    payroll: {
      overtime: false,           // Typically flat day rate
      sixthDayPremium: false,    // Contract-dependent, usually no
      seventhDayPremium: false,
      nightPremium: false,
      mealPenalties: false,      // Contractor manages own
      turnaroundPenalties: false,
      dayPremiums: false,
    },
    timecard: {
      required: false,           // Invoice-based, not timesheet
      trackHours: false,
      trackOT: false,
      trackMeals: false,
    },
    deductions: {
      incomeTax: false,          // Corp handles own tax
      employeeNI: false,
      studentLoan: false,
      pension: false,
    },
    showFields: ['ltdCompanyName', 'ltdCompanyReg', 'vatNumber', 'ir35Status', 'dateOfBirth', 'crewAddress'],
    hideFields: ['niNumber', 'taxCode', 'studentLoan', 'bankSortCode', 'bankAccountNumber', 'utrNumber', 'corpName', 'corpEin'],
    requiredFields: ['ltdCompanyName', 'ltdCompanyReg'],
    notes: 'IR35 Status Determination Statement (SDS) required before engagement. If inside IR35, treat as PAYE equivalent.',
  },

  sole_trader: {
    territory: 'UK',
    category: 'self_employed',
    label: 'Sole Trader',
    fringes: {
      holidayPay: true,          // Statutory entitlement — must accrue
      employerNIC: false,        // Sole trader pays own Class 2/4
      pension: false,            // No auto-enrol
      apprenticeshipLevy: false,
      workersComp: false,        // Self-responsible
      healthWelfare: false,
    },
    payroll: {
      overtime: false,           // Typically flat day rate, contract-dependent
      sixthDayPremium: false,    // Contract-dependent
      seventhDayPremium: false,
      nightPremium: false,
      mealPenalties: false,
      turnaroundPenalties: false,
      dayPremiums: false,
    },
    timecard: {
      required: false,           // Day log only
      trackHours: false,
      trackOT: false,
      trackMeals: false,
    },
    deductions: {
      incomeTax: false,          // Self Assessment
      employeeNI: false,         // Self Assessment
      studentLoan: false,
      pension: false,
    },
    showFields: ['niNumber', 'utrNumber', 'bankSortCode', 'bankAccountNumber', 'dateOfBirth', 'crewAddress', 'emergencyContact'],
    hideFields: ['ltdCompanyName', 'ltdCompanyReg', 'vatNumber', 'ir35Status', 'taxCode', 'corpName', 'corpEin'],
    requiredFields: ['utrNumber', 'bankSortCode', 'bankAccountNumber'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // UNITED STATES
  // ═══════════════════════════════════════════════════════════════════
  w2: {
    territory: 'US',
    category: 'employee',
    label: 'W-2 Employee',
    fringes: {
      holidayPay: false,         // No statutory HP in US
      employerNIC: true,         // FICA: 6.2% SS + 1.45% Medicare
      pension: true,             // Union P&H (SAG 19.5%, IATSE varies)
      apprenticeshipLevy: false,
      workersComp: true,         // Mandatory per state
      healthWelfare: true,       // Union H&W per hour
    },
    payroll: {
      overtime: true,            // Federal: 1.5x after 40hrs/wk. CA: after 8hrs/day
      sixthDayPremium: true,     // Day players mainly
      seventhDayPremium: true,
      nightPremium: false,       // Not standard in US (DGA: no)
      mealPenalties: true,       // IATSE/DGA: escalating penalties
      turnaroundPenalties: true, // Union-mandated rest periods
      dayPremiums: true,
    },
    timecard: {
      required: true,
      trackHours: true,
      trackOT: true,
      trackMeals: true,
    },
    deductions: {
      incomeTax: true,           // Federal + State withholding
      employeeNI: true,          // Employee FICA 7.65%
      studentLoan: false,
      pension: true,             // Employee contribution if applicable
    },
    showFields: ['ssn', 'w4FilingStatus', 'w4Allowances', 'stateWithholding', 'achRoutingNumber', 'achAccountNumber', 'dateOfBirth', 'crewAddress', 'emergencyContact'],
    hideFields: ['corpName', 'corpEin', 'niNumber', 'taxCode', 'ltdCompanyName'],
    requiredFields: ['ssn', 'w4FilingStatus', 'achRoutingNumber', 'achAccountNumber'],
  },

  loanout: {
    territory: 'US',
    category: 'corporate',
    label: 'Loan-Out Corp',
    fringes: {
      holidayPay: false,
      employerNIC: false,        // Corp pays own 15.3% self-employment tax
      pension: true,             // Union P&H still applies through loan-out
      apprenticeshipLevy: false,
      workersComp: true,         // Often covered by production policy
      healthWelfare: true,       // Union H&W still applies
    },
    payroll: {
      overtime: false,           // Negotiated rate, no OT
      sixthDayPremium: false,
      seventhDayPremium: false,
      nightPremium: false,
      mealPenalties: false,      // Loan-out handles own compliance
      turnaroundPenalties: false,
      dayPremiums: false,
    },
    timecard: {
      required: false,           // Invoice days/weeks
      trackHours: false,
      trackOT: false,
      trackMeals: false,
    },
    deductions: {
      incomeTax: false,          // Corp responsible
      employeeNI: false,
      studentLoan: false,
      pension: false,
    },
    showFields: ['corpName', 'corpEin', 'dateOfBirth', 'crewAddress'],
    hideFields: ['ssn', 'w4FilingStatus', 'w4Allowances', 'stateWithholding', 'achRoutingNumber', 'achAccountNumber', 'niNumber', 'taxCode'],
    requiredFields: ['corpName', 'corpEin'],
    notes: 'Loan-Out Addendum and Letter of Inducement required. W-9 required. 10 states impose loan-out taxes (CA, CO, GA, HI, LA, MA, MS, MT, NJ, NM).',
  },

  '1099': {
    territory: 'US',
    category: 'self_employed',
    label: '1099 Contractor',
    fringes: {
      holidayPay: false,
      employerNIC: false,        // Contractor pays own 15.3%
      pension: false,            // No union fringe
      apprenticeshipLevy: false,
      workersComp: false,        // Self-insured
      healthWelfare: false,
    },
    payroll: {
      overtime: false,           // Not entitled under FLSA
      sixthDayPremium: false,
      seventhDayPremium: false,
      nightPremium: false,
      mealPenalties: false,
      turnaroundPenalties: false,
      dayPremiums: false,
    },
    timecard: {
      required: false,
      trackHours: false,
      trackOT: false,
      trackMeals: false,
    },
    deductions: {
      incomeTax: false,          // Files own 1040 + quarterly estimated
      employeeNI: false,
      studentLoan: false,
      pension: false,
    },
    showFields: ['ssn', 'crewAddress', 'dateOfBirth'],
    hideFields: ['corpName', 'corpEin', 'w4FilingStatus', 'w4Allowances', 'stateWithholding', 'achRoutingNumber', 'achAccountNumber'],
    requiredFields: ['ssn'],
    notes: '1099-NEC issued if paid $600+/yr. AB-5 misclassification risk in California.',
  },

  // ═══════════════════════════════════════════════════════════════════
  // AUSTRALIA
  // ═══════════════════════════════════════════════════════════════════
  payg: {
    territory: 'AU',
    category: 'employee',
    label: 'PAYG',
    fringes: {
      holidayPay: true,          // 4 weeks annual leave loaded at 17.5%
      employerNIC: false,        // No NIC equivalent
      pension: true,             // Superannuation 11.5% (rising to 12%)
      apprenticeshipLevy: false,
      workersComp: true,
      healthWelfare: false,
    },
    payroll: {
      overtime: true,
      sixthDayPremium: true,
      seventhDayPremium: true,
      nightPremium: true,        // MEAA rates apply
      mealPenalties: true,
      turnaroundPenalties: true,
      dayPremiums: true,
    },
    timecard: { required: true, trackHours: true, trackOT: true, trackMeals: true },
    deductions: { incomeTax: true, employeeNI: false, studentLoan: false, pension: true },
    showFields: ['tfn', 'superFund', 'superMemberNumber', 'bsb', 'bankAccountNumber', 'dateOfBirth', 'crewAddress', 'emergencyContact'],
    hideFields: ['corpName', 'corpEin', 'niNumber', 'taxCode', 'abn'],
    requiredFields: ['tfn', 'superFund', 'bsb', 'bankAccountNumber'],
  },

  pty_ltd: {
    territory: 'AU',
    category: 'corporate',
    label: 'Pty Ltd',
    fringes: {
      holidayPay: false,
      employerNIC: false,
      pension: false,            // Company handles own super
      apprenticeshipLevy: false,
      workersComp: false,
      healthWelfare: false,
    },
    payroll: {
      overtime: false, sixthDayPremium: false, seventhDayPremium: false,
      nightPremium: false, mealPenalties: false, turnaroundPenalties: false, dayPremiums: false,
    },
    timecard: { required: false, trackHours: false, trackOT: false, trackMeals: false },
    deductions: { incomeTax: false, employeeNI: false, studentLoan: false, pension: false },
    showFields: ['ltdCompanyName', 'ltdCompanyReg', 'dateOfBirth', 'crewAddress'],
    hideFields: ['tfn', 'superFund', 'superMemberNumber', 'bsb', 'bankAccountNumber'],
    requiredFields: ['ltdCompanyName', 'ltdCompanyReg'],
  },

  abn: {
    territory: 'AU',
    category: 'self_employed',
    label: 'ABN Sole Trader',
    fringes: {
      holidayPay: false,         // No statutory leave loading for contractors
      employerNIC: false,
      pension: true,             // Super still required if >$450/month from one client
      apprenticeshipLevy: false,
      workersComp: false,
      healthWelfare: false,
    },
    payroll: {
      overtime: false, sixthDayPremium: false, seventhDayPremium: false,
      nightPremium: false, mealPenalties: false, turnaroundPenalties: false, dayPremiums: false,
    },
    timecard: { required: false, trackHours: false, trackOT: false, trackMeals: false },
    deductions: { incomeTax: false, employeeNI: false, studentLoan: false, pension: false },
    showFields: ['taxId', 'bsb', 'bankAccountNumber', 'dateOfBirth', 'crewAddress'],
    hideFields: ['tfn', 'superFund', 'superMemberNumber', 'ltdCompanyName'],
    requiredFields: ['taxId', 'bsb', 'bankAccountNumber'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // GERMANY
  // ═══════════════════════════════════════════════════════════════════
  festanstellung: {
    territory: 'DE',
    category: 'employee',
    label: 'Festanstellung (Permanent)',
    fringes: {
      holidayPay: true,          // BUrlG: 24 working days minimum
      employerNIC: true,         // ~21% social contributions
      pension: true,             // Statutory pension ~9.3% employer
      apprenticeshipLevy: false,
      workersComp: true,         // Berufsgenossenschaft
      healthWelfare: true,       // Statutory health insurance ~7.3% employer
    },
    payroll: {
      overtime: true, sixthDayPremium: true, seventhDayPremium: true,
      nightPremium: true, mealPenalties: false, turnaroundPenalties: true, dayPremiums: true,
    },
    timecard: { required: true, trackHours: true, trackOT: true, trackMeals: false },
    deductions: { incomeTax: true, employeeNI: true, studentLoan: false, pension: true },
    showFields: ['steuerID', 'sozialversicherung', 'steuerklasse', 'iban', 'dateOfBirth', 'crewAddress', 'emergencyContact'],
    hideFields: ['steuernummer', 'ustIdNr', 'handelsregister', 'corpName'],
    requiredFields: ['steuerID', 'sozialversicherung', 'steuerklasse', 'iban'],
  },

  freiberufler: {
    territory: 'DE',
    category: 'self_employed',
    label: 'Freiberufler (Freelance)',
    fringes: {
      holidayPay: false,
      employerNIC: false,
      pension: false,
      apprenticeshipLevy: false,
      workersComp: false,
      healthWelfare: false,
      ksk: true,                 // KSK 5% on self-employed artists
    },
    payroll: {
      overtime: false, sixthDayPremium: false, seventhDayPremium: false,
      nightPremium: false, mealPenalties: false, turnaroundPenalties: false, dayPremiums: false,
    },
    timecard: { required: false, trackHours: false, trackOT: false, trackMeals: false },
    deductions: { incomeTax: false, employeeNI: false, studentLoan: false, pension: false },
    showFields: ['steuerID', 'steuernummer', 'iban', 'dateOfBirth', 'crewAddress'],
    hideFields: ['sozialversicherung', 'steuerklasse', 'handelsregister', 'ustIdNr'],
    requiredFields: ['steuerID', 'iban'],
  },

  gmbh: {
    territory: 'DE',
    category: 'corporate',
    label: 'GmbH (Ltd Company)',
    fringes: {
      holidayPay: false, employerNIC: false, pension: false,
      apprenticeshipLevy: false, workersComp: false, healthWelfare: false,
    },
    payroll: {
      overtime: false, sixthDayPremium: false, seventhDayPremium: false,
      nightPremium: false, mealPenalties: false, turnaroundPenalties: false, dayPremiums: false,
    },
    timecard: { required: false, trackHours: false, trackOT: false, trackMeals: false },
    deductions: { incomeTax: false, employeeNI: false, studentLoan: false, pension: false },
    showFields: ['ltdCompanyName', 'handelsregister', 'ustIdNr', 'iban', 'dateOfBirth', 'crewAddress'],
    hideFields: ['steuerID', 'sozialversicherung', 'steuerklasse', 'steuernummer'],
    requiredFields: ['ltdCompanyName', 'handelsregister', 'iban'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // FRANCE
  // ═══════════════════════════════════════════════════════════════════
  cdi: {
    territory: 'FR',
    category: 'employee',
    label: 'CDI (Permanent)',
    fringes: {
      holidayPay: true,          // 10% congés payés
      employerNIC: true,         // ~45% cotisations patronales
      pension: true,             // Retraite complémentaire
      apprenticeshipLevy: true,  // Taxe d'apprentissage 0.68%
      workersComp: true,
      healthWelfare: true,       // Sécurité sociale
    },
    payroll: {
      overtime: true, sixthDayPremium: true, seventhDayPremium: true,
      nightPremium: true, mealPenalties: false, turnaroundPenalties: true, dayPremiums: true,
    },
    timecard: { required: true, trackHours: true, trackOT: true, trackMeals: false },
    deductions: { incomeTax: true, employeeNI: true, studentLoan: false, pension: true },
    showFields: ['numSecSociale', 'mutuelle', 'iban', 'dateOfBirth', 'crewAddress', 'emergencyContact'],
    hideFields: ['corpName', 'siret'],
    requiredFields: ['numSecSociale', 'iban'],
  },

  intermittent: {
    territory: 'FR',
    category: 'employee',
    label: 'Intermittent du Spectacle',
    fringes: {
      holidayPay: true,          // 10% congés payés
      employerNIC: true,         // ~45% cotisations
      pension: true,
      apprenticeshipLevy: true,
      workersComp: true,
      healthWelfare: true,
    },
    payroll: {
      overtime: true, sixthDayPremium: true, seventhDayPremium: true,
      nightPremium: true, mealPenalties: false, turnaroundPenalties: true, dayPremiums: true,
    },
    timecard: { required: true, trackHours: true, trackOT: true, trackMeals: false },
    deductions: { incomeTax: true, employeeNI: true, studentLoan: false, pension: true },
    showFields: ['numSecSociale', 'congespectacle', 'audiensMember', 'mutuelle', 'iban', 'dateOfBirth', 'crewAddress', 'emergencyContact'],
    hideFields: ['corpName', 'siret'],
    requiredFields: ['numSecSociale', 'congespectacle', 'iban'],
    notes: 'Must track hours for Pôle Emploi (unemployment). 507 hours over 12 months required for intermittent status.',
  },

  micro_entrepreneur: {
    territory: 'FR',
    category: 'self_employed',
    label: 'Micro-Entrepreneur',
    fringes: {
      holidayPay: false, employerNIC: false, pension: false,
      apprenticeshipLevy: false, workersComp: false, healthWelfare: false,
    },
    payroll: {
      overtime: false, sixthDayPremium: false, seventhDayPremium: false,
      nightPremium: false, mealPenalties: false, turnaroundPenalties: false, dayPremiums: false,
    },
    timecard: { required: false, trackHours: false, trackOT: false, trackMeals: false },
    deductions: { incomeTax: false, employeeNI: false, studentLoan: false, pension: false },
    showFields: ['taxId', 'iban', 'dateOfBirth', 'crewAddress'],
    hideFields: ['numSecSociale', 'congespectacle', 'mutuelle'],
    requiredFields: ['taxId', 'iban'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // SPAIN
  // ═══════════════════════════════════════════════════════════════════
  fijo: {
    territory: 'ES',
    category: 'employee',
    label: 'Contrato Fijo (Permanent)',
    fringes: {
      holidayPay: true,          // 30 calendar days/yr
      employerNIC: true,         // ~30% cotizaciones
      pension: true,
      apprenticeshipLevy: false,
      workersComp: true,
      healthWelfare: true,
    },
    payroll: {
      overtime: true, sixthDayPremium: true, seventhDayPremium: true,
      nightPremium: true, mealPenalties: false, turnaroundPenalties: true, dayPremiums: true,
    },
    timecard: { required: true, trackHours: true, trackOT: true, trackMeals: false },
    deductions: { incomeTax: true, employeeNI: true, studentLoan: false, pension: true },
    showFields: ['nie', 'numSegSocial', 'iban', 'dateOfBirth', 'crewAddress', 'emergencyContact'],
    hideFields: ['corpName', 'iaeCode'],
    requiredFields: ['nie', 'numSegSocial', 'iban'],
  },

  autonomo: {
    territory: 'ES',
    category: 'self_employed',
    label: 'Autónomo (Self-Employed)',
    fringes: {
      holidayPay: false, employerNIC: false, pension: false,
      apprenticeshipLevy: false, workersComp: false, healthWelfare: false,
    },
    payroll: {
      overtime: false, sixthDayPremium: false, seventhDayPremium: false,
      nightPremium: false, mealPenalties: false, turnaroundPenalties: false, dayPremiums: false,
    },
    timecard: { required: false, trackHours: false, trackOT: false, trackMeals: false },
    deductions: { incomeTax: false, employeeNI: false, studentLoan: false, pension: false },
    showFields: ['nie', 'iaeCode', 'iban', 'dateOfBirth', 'crewAddress'],
    hideFields: ['numSegSocial', 'corpName'],
    requiredFields: ['nie', 'iban'],
  },

  sl: {
    territory: 'ES',
    category: 'corporate',
    label: 'S.L. (Ltd Company)',
    fringes: {
      holidayPay: false, employerNIC: false, pension: false,
      apprenticeshipLevy: false, workersComp: false, healthWelfare: false,
    },
    payroll: {
      overtime: false, sixthDayPremium: false, seventhDayPremium: false,
      nightPremium: false, mealPenalties: false, turnaroundPenalties: false, dayPremiums: false,
    },
    timecard: { required: false, trackHours: false, trackOT: false, trackMeals: false },
    deductions: { incomeTax: false, employeeNI: false, studentLoan: false, pension: false },
    showFields: ['ltdCompanyName', 'ltdCompanyReg', 'iban', 'dateOfBirth', 'crewAddress'],
    hideFields: ['nie', 'numSegSocial', 'iaeCode'],
    requiredFields: ['ltdCompanyName', 'iban'],
  },
};

/**
 * Get rules for a given employment status.
 * Falls back to generic employee rules if not found.
 */
export function getEmploymentRules(employmentStatus) {
  if (!employmentStatus) return RULES.paye; // default
  const raw = employmentStatus.toLowerCase();
  // Normalize: loan_out → loanout, loan-out → loanout, sole_trader → soletrader, self_employed → selfemployed
  const key = raw.replace(/[-_\s]/g, '');
  return RULES[raw] || RULES[key] || RULES.paye;
}

/**
 * Get the employment category for fringe calculation.
 */
export function getEmploymentCategory(employmentStatus) {
  const rules = getEmploymentRules(employmentStatus);
  return rules.category;
}

/**
 * Check if a specific payroll feature applies.
 */
export function isPayrollFeatureEnabled(employmentStatus, feature) {
  const rules = getEmploymentRules(employmentStatus);
  return rules.payroll?.[feature] ?? false;
}

/**
 * Check if a specific fringe applies.
 */
export function isFringeApplicable(employmentStatus, fringe) {
  const rules = getEmploymentRules(employmentStatus);
  return rules.fringes?.[fringe] ?? false;
}

/**
 * Check if timecards are required.
 */
export function isTimecardRequired(employmentStatus) {
  const rules = getEmploymentRules(employmentStatus);
  return rules.timecard?.required ?? true;
}

/**
 * Get field visibility for deal memo form.
 */
export function getFieldVisibility(employmentStatus) {
  const rules = getEmploymentRules(employmentStatus);
  return {
    show: rules.showFields || [],
    hide: rules.hideFields || [],
    required: rules.requiredFields || [],
  };
}

export default RULES;
