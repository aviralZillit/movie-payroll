// ============================================================
// Compliance Checks & Territory Onboarding
// Extracted from Zillit Deal Memo v21 HTML prototype
// ============================================================

export type ComplianceStatus = 'pass' | 'warn' | 'fail' | 'info';

export interface ComplianceCheck {
  icon: string;
  title: string;
  detail: string;
  status: ComplianceStatus;
  statusLabel: string;
}

/** Default compliance check template (populated dynamically per territory/union/status) */
export const COMPLIANCE_CHECKS: ComplianceCheck[] = [
  { icon: '\ud83e\udea5', title: 'Right to Work Verification', detail: '', status: 'warn', statusLabel: 'Pending' },
  { icon: '\u2696\ufe0f', title: 'IR35 / Employment Status', detail: '', status: 'fail', statusLabel: 'Required' },
  { icon: '\ud83d\udd12', title: 'GDPR / Data Processing', detail: 'Crew data processed under production DPA. Privacy notice must be provided.', status: 'pass', statusLabel: 'Pass' },
  { icon: '\ud83c\udfd6\ufe0f', title: 'Holiday Pay Entitlement', detail: '', status: 'pass', statusLabel: 'Pass' },
  { icon: '\ud83d\udccb', title: 'Collective Agreement Minimum', detail: '', status: 'pass', statusLabel: 'Pass' },
  { icon: '\ud83c\udfdb\ufe0f', title: 'Auto-Enrolment / Social Security', detail: '', status: 'info', statusLabel: 'Pending' },
];

// ── TERRITORY ONBOARDING ──

export type DocRequirement = 'mandatory' | 'conditional' | 'optional';

export interface OnboardingDocument {
  name: string;
  req: DocRequirement;
  desc: string;
}

export interface TerritoryOnboarding {
  name: string;
  payrollMethods: string[];
  payrollNote: string;
  docs: OnboardingDocument[];
}

export const TERRITORY_ONBOARDING: Record<string, TerritoryOnboarding> = {
  uk: {
    name: 'United Kingdom',
    payrollMethods: ['PAYE via RTI (Real Time Information)', 'Ltd Co / PSC Invoice (IR35 assessed)', 'Self-Employed / Schedule D', 'Agency / Payroll Bureau PAYE'],
    payrollNote: 'UK PAYE via RTI. Employer must operate PAYE and submit RTI returns to HMRC on or before each payment date.',
    docs: [
      { name: 'P45 or Starter Checklist (P46)', req: 'mandatory', desc: 'Required for PAYE. P45 from previous employer or starter checklist if no P45 available.' },
      { name: 'National Insurance Number', req: 'mandatory', desc: 'NI number required before first payment. Crew member must provide their NI number.' },
      { name: 'Right to Work Documents', req: 'mandatory', desc: 'Passport, settled status share code, EU pre-settled status, or UK visa documentation.' },
      { name: 'IR35 Status Determination Statement (SDS)', req: 'conditional', desc: 'Required for Ltd Co / PSC engagements under Chapter 10 ITEPA 2003. Must be provided before first payment.' },
      { name: 'Bank Details (sort code & account)', req: 'mandatory', desc: 'UK bank account details for BACS Standard 18 payment.' },
      { name: 'Pension Auto-Enrolment Assessment', req: 'mandatory', desc: 'All eligible workers must be assessed within 3 months of start date.' },
      { name: 'GDPR Privacy Notice', req: 'mandatory', desc: 'Must be provided on or before start date.' },
      { name: 'Health & Safety Induction Acknowledgement', req: 'optional', desc: 'Good practice; may be required by production insurance.' },
      { name: 'Production NDA', req: 'optional', desc: 'Non-disclosure agreement covering all series materials and information.' },
    ],
  },

  us: {
    name: 'United States',
    payrollMethods: ['W-2 via Payroll Company (EP / C&C / PSI)', 'Loan-Out Corporation (Corp-to-Corp)', 'Schedule C / 1099-NEC (if truly independent)', 'SAG-AFTRA / DGA / IATSE Guild Start Forms'],
    payrollNote: 'US productions typically engage crew via a payroll company (Entertainment Partners, Cast & Crew, etc.) who act as Employer of Record.',
    docs: [
      { name: 'I-9 Employment Eligibility Verification', req: 'mandatory', desc: 'Must be completed on or before first day. Employer must physically inspect original documents (List A, or B+C).' },
      { name: 'W-4 Federal Tax Withholding Form', req: 'mandatory', desc: 'Required for W-2 employees. Determines federal income tax withholding allowances.' },
      { name: 'State Tax Withholding Form', req: 'mandatory', desc: 'Varies by state: DE-4 (CA), IT-2104 (NY), etc. Required if working in a state with income tax.' },
      { name: 'Social Security Number (SSN)', req: 'mandatory', desc: 'Required for all US tax filings and payroll. Non-US nationals may need an ITIN.' },
      { name: 'Loanout Agreement & Certificate of Insurance', req: 'conditional', desc: 'Required for loan-out corporations. Must include General Liability and E&O coverage. Submit W-9.' },
      { name: 'Guild Start Notice (IATSE / SAG / DGA)', req: 'conditional', desc: 'Union productions must notify the relevant guild of all deal terms before or on first day of work.' },
      { name: 'State New Hire Report', req: 'mandatory', desc: 'Employers must report new hires to the state within 20 days. Handled by payroll company.' },
      { name: 'Minor Work Permit', req: 'conditional', desc: 'Required if crew member is under 18 in any state.' },
    ],
  },

  ie: {
    name: 'Ireland',
    payrollMethods: ['PAYE via Revenue Online Service (ROS)', 'Self-Assessed (Form 11)', 'Ltd Company / DAC Invoice'],
    payrollNote: 'Irish PAYE via ROS. Employer must retrieve a Revenue Payroll Notification (RPN) before making first payment.',
    docs: [
      { name: 'PPS Number', req: 'mandatory', desc: 'Personal Public Service Number \u2014 Irish equivalent of NI number. Required for all workers.' },
      { name: 'Revenue Payroll Notification (RPN)', req: 'mandatory', desc: 'Employer retrieves RPN from Revenue. Replaces the P2C. Must be retrieved before first payment.' },
      { name: 'Right to Work (EU / EEA or Stamp 1G/4)', req: 'mandatory', desc: 'EU/EEA passport or national ID. Non-EEA workers need an Employment Permit or Stamp 4.' },
      { name: 'Bank Account (IBAN)', req: 'mandatory', desc: 'Irish or European IBAN for SEPA credit transfer.' },
      { name: 'Company Registration (if Ltd)', req: 'conditional', desc: 'CRO registration number and VAT number required for company invoices.' },
    ],
  },

  hu: {
    name: 'Hungary',
    payrollMethods: ['Hungarian PAYE (NAV via payroll agent)', 'Kft / ZRt Company Invoice', 'EU Posted Worker Declaration'],
    payrollNote: 'Hungarian payroll is complex \u2014 a local payroll agent is strongly recommended. Social contributions are high.',
    docs: [
      { name: 'Adoazonositojel (Tax ID Number)', req: 'mandatory', desc: '10-digit Hungarian tax identification number. Required for all workers including foreign nationals.' },
      { name: 'TAJ Szam (Social Security Number)', req: 'mandatory', desc: 'Required for Hungarian social insurance. Foreign nationals obtain from Government Office.' },
      { name: 'A1 Certificate (EU nationals only)', req: 'conditional', desc: 'Posted workers from EU member states must carry an A1 certificate confirming home-country social security applies.' },
      { name: 'Tartozkodasi Engedely (Residence Permit, non-EU)', req: 'conditional', desc: 'Non-EU nationals require residence and work permit from OIF.' },
      { name: 'Bank Account (HUF or EUR)', req: 'mandatory', desc: 'Hungarian bank account preferred. SEPA transfers from EU accounts are possible.' },
      { name: 'Employment Contract (Munkaszerzodesz)', req: 'mandatory', desc: 'Written employment contract required under Hungarian Labour Code for all employees.' },
    ],
  },

  au: {
    name: 'Australia',
    payrollMethods: ['PAYG Withholding (TFN Employee)', 'ABN Contractor (self-employed)', 'Pty Ltd Company Invoice'],
    payrollNote: 'Superannuation (11%) is mandatory for all workers earning over AUD 450/month. Must be paid quarterly to employee nominated fund.',
    docs: [
      { name: 'Tax File Number (TFN)', req: 'mandatory', desc: 'Without a TFN declaration, employer must withhold at top marginal rate (47%). Must be provided before first payment.' },
      { name: 'ABN Declaration (if contractor)', req: 'conditional', desc: 'Workers quoting an ABN are treated as contractors. Must confirm genuine independent business.' },
      { name: 'Superannuation Fund Details', req: 'mandatory', desc: '11% super guarantee payable. Employee nominates preferred fund or employer uses default fund.' },
      { name: 'Right to Work (visa if non-PR)', req: 'mandatory', desc: 'Australian citizen, Permanent Resident, or valid work visa (subclass 400, 457, 482 etc.).' },
      { name: 'Fair Work Information Statement', req: 'mandatory', desc: 'Must be provided to all new employees before or as soon as possible after engagement.' },
      { name: 'Single Touch Payroll (STP)', req: 'mandatory', desc: 'Each payment must be reported to ATO via STP-enabled software on or before pay day.' },
    ],
  },

  ca: {
    name: 'Canada',
    payrollMethods: ['T4 Employment (CRA)', 'Incorporated / Corp-to-Corp (T4A)', 'ACTRA / IATSE Union Start'],
    payrollNote: 'Payroll deductions include CPP (pension), EI (employment insurance), and federal/provincial income tax. Province of work determines applicable employment standards.',
    docs: [
      { name: 'Social Insurance Number (SIN)', req: 'mandatory', desc: 'Required for all workers in Canada. Employee must provide SIN before first pay.' },
      { name: 'TD1 Federal Personal Tax Credits Return', req: 'mandatory', desc: 'Determines federal personal tax credit amounts for withholding.' },
      { name: 'TD1 Provincial (province of work)', req: 'mandatory', desc: 'Provincial equivalent \u2014 e.g. TD1ON for Ontario, TD1BC for British Columbia.' },
      { name: 'Work Permit / PR Card (non-Canadian)', req: 'conditional', desc: 'Non-Canadian citizens require open or employer-specific work permit.' },
      { name: 'Corporation Documents (if Inc.)', req: 'conditional', desc: 'Corp-to-corp: articles of incorporation, HST/GST registration number, W-8BEN-E (if invoicing US co).' },
      { name: 'ACTRA / IATSE Guild Documentation', req: 'conditional', desc: 'Union productions require guild deal memos filed and signed before first day.' },
    ],
  },

  fr: {
    name: 'France',
    payrollMethods: ['Intermittent du spectacle (CDDU via Pole Emploi)', 'CDI/CDD Salarie Standard (URSSAF)', 'Societe / SARL Invoice'],
    payrollNote: 'French film/TV uses intermittents du spectacle status. CDDU contracts handled via payroll agents. Cotisations sociales approximately 45-47% employer cost.',
    docs: [
      { name: 'Numero de Securite Sociale (NIR / NIRPP)', req: 'mandatory', desc: 'French social security number \u2014 15-digit NIR. Foreign workers apply at CPAM before first day.' },
      { name: 'Contrat de Travail / CDDU', req: 'mandatory', desc: 'Written CDDU required before first day. Must specify dates, role, and cachet (daily rate).' },
      { name: 'RIB / IBAN (French or SEPA)', req: 'mandatory', desc: 'French or SEPA-compatible bank account details for payment via virement (bank transfer).' },
      { name: 'Numero SIRET (if company / autoentrepreneur)', req: 'conditional', desc: 'SIRET registration number required for all self-employed / company invoices in France.' },
      { name: 'Autorisation de Travail (non-EU)', req: 'conditional', desc: 'Non-EU nationals require work authorisation \u2014 titre de sejour with travailleur temporaire status.' },
      { name: 'Justificatif de domicile', req: 'mandatory', desc: 'Proof of address required for URSSAF and social security registration.' },
      { name: 'Attestation intermittent / Relevance Pole Emploi', req: 'conditional', desc: 'Evidence of qualifying intermittent hours (507 hrs in 12 months) for benefit eligibility.' },
      { name: 'AGESSA / Maison des Artistes (auteurs/realisateurs)', req: 'conditional', desc: 'Authors and directors register with AGESSA or MDA for social protection under auteur status.' },
    ],
  },

  de: {
    name: 'Germany',
    payrollMethods: ['German PAYE (DATEV / payroll agent)', 'Freiberufler / Selbststaendig Invoice', 'GmbH / UG Company Invoice'],
    payrollNote: 'German social security covers health, pension, unemployment and care insurance \u2014 combined ~40% employer/employee split. Local payroll agent essential.',
    docs: [
      { name: 'Steuer-ID (Tax Identification Number)', req: 'mandatory', desc: '11-digit permanent tax ID. All workers in Germany must have one.' },
      { name: 'Sozialversicherungsnummer (Social Security Number)', req: 'mandatory', desc: 'Required for pension fund contribution registration. Issued by Deutsche Rentenversicherung.' },
      { name: 'A1 Certificate (EU posted workers)', req: 'conditional', desc: 'Workers posted from another EU member state must carry an A1 certificate.' },
      { name: 'Aufenthaltstitel / Arbeitserlaubnis (non-EU)', req: 'conditional', desc: 'Residence and work permission required from local Auslaenderbehorde before start date.' },
      { name: 'Lohnsteuerkarte / ELSTAM registration', req: 'mandatory', desc: 'Employer must register with ELSTAM system to retrieve electronic income tax information.' },
    ],
  },

  nz: {
    name: 'New Zealand',
    payrollMethods: ['PAYE via myIR (Inland Revenue)', 'Contractor / Self-Employed (IR3)', 'Ltd Company Invoice'],
    payrollNote: 'New Zealand PAYE is straightforward. Employers file Employment Information (EI) each pay period via myIR.',
    docs: [
      { name: 'IRD Number', req: 'mandatory', desc: 'NZ tax identification number. Without it, no-declaration rate (45%) applies.' },
      { name: 'Tax Code Declaration (IR330)', req: 'mandatory', desc: 'Crew member declares tax code to employer before first pay.' },
      { name: 'KiwiSaver Enrolment', req: 'mandatory', desc: 'New employees are auto-enrolled. Employee may opt out after 2\u20138 weeks. Employer contributes minimum 3%.' },
      { name: 'Right to Work (visa if non-resident)', req: 'mandatory', desc: 'NZ citizen, resident visa, or relevant work visa. Production may qualify for the Specific Purpose Work Visa.' },
      { name: 'ACC Employer Levy', req: 'mandatory', desc: 'Accident Compensation Corporation levy applies to all employed earnings.' },
    ],
  },

  es: {
    name: 'Spain',
    payrollMethods: ['Spanish PAYE (Seguridad Social)', 'Autonomo (Self-Employed)', 'SL Company Invoice'],
    payrollNote: 'Spanish social security contributions are high (~30% employer). Local gestoria essential for compliance.',
    docs: [
      { name: 'NIE / NIF (Tax ID)', req: 'mandatory', desc: 'NIE for foreign nationals; NIF (DNI) for Spanish citizens. Required before any payment.' },
      { name: 'Numero de Seguridad Social', req: 'mandatory', desc: 'Social security number required for all workers. Register at INSS.' },
      { name: 'Autorizacion de Trabajo (non-EU)', req: 'conditional', desc: 'Non-EU nationals require work authorisation from immigration authority.' },
      { name: 'Alta en la Seguridad Social', req: 'mandatory', desc: 'Employer must register worker with Social Security before first day (via Sistema RED).' },
    ],
  },

  it: {
    name: 'Italy',
    payrollMethods: ['Italian PAYE (INPS/INAIL)', 'Partita IVA (VAT Number / Self-Employed)', 'SRL Company Invoice'],
    payrollNote: 'Italian payroll is complex \u2014 a local commercialista and payroll specialist is essential. INPS and INAIL contributions are mandatory.',
    docs: [
      { name: 'Codice Fiscale (Tax Code)', req: 'mandatory', desc: 'Italian tax code \u2014 16-character alphanumeric. Required for all workers including foreign nationals.' },
      { name: 'INPS Registration', req: 'mandatory', desc: 'National social insurance registration for pension and sickness contributions.' },
      { name: 'INAIL Registration', req: 'mandatory', desc: 'Mandatory workplace accident insurance registration.' },
      { name: 'Permesso di Soggiorno (non-EU)', req: 'conditional', desc: 'Non-EU nationals require a residence permit with work authorisation.' },
    ],
  },

  za: {
    name: 'South Africa',
    payrollMethods: ['PAYE via SARS eFiling', 'Independent Contractor (ITR12)', '(Pty) Ltd Company Invoice'],
    payrollNote: 'South African PAYE administered by SARS. UIF contributions mandatory.',
    docs: [
      { name: 'South African ID / Tax Reference Number', req: 'mandatory', desc: 'SA ID for citizens; tax reference number (TRN) from SARS for all workers.' },
      { name: 'UIF Registration', req: 'mandatory', desc: 'Unemployment Insurance Fund \u2014 1% employer + 1% employee contribution.' },
      { name: 'Work Visa / Permit (non-SA nationals)', req: 'conditional', desc: 'General Work Visa or Critical Skills Visa required for foreign nationals.' },
    ],
  },

  default: {
    name: 'International',
    payrollMethods: ['Local Employment Agreement', 'Contractor / Freelance Invoice', 'Company Invoice'],
    payrollNote: 'Consult a local payroll specialist for this territory. Employment law, tax, and social security requirements vary significantly.',
    docs: [
      { name: 'Government-Issued ID / Passport', req: 'mandatory', desc: 'Identity and nationality verification.' },
      { name: 'Tax Registration / Identification Number', req: 'mandatory', desc: 'Local tax ID required before first payment.' },
      { name: 'Bank Account Details', req: 'mandatory', desc: 'Local bank account for payment in local currency.' },
      { name: 'Work Authorisation / Visa', req: 'conditional', desc: 'Work permit or visa if not a citizen or resident of the territory.' },
    ],
  },
};
