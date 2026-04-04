/**
 * 20 territories from Kate's production accounting system.
 * Each territory has employment statuses, tax credit schemes, and fringe defaults.
 */
export const territories = [
  // ─── Europe & UK ────────────────────────────────────────────────────
  {
    code: 'UK', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe & UK',
    defaultCurrency: 'GBP', timezone: 'GMT/BST',
    summary: 'Major production hub. PACT/BECTU agreements cover most crew. HETV Tax Credit at 34%. Equity for performers. Strong union infrastructure.',
    employmentStatuses: [
      { code: 'paye', label: 'PAYE Employee', requiredFields: ['niNumber', 'taxCode', 'starterDeclaration', 'bankSortCode', 'bankAccountNumber'] },
      { code: 'ltd', label: 'Ltd Company (PSC)', requiredFields: ['ltdCompanyName', 'ltdCompanyReg', 'ir35Status'], riskLevel: 'medium' },
      { code: 'sole', label: 'Sole Trader', requiredFields: ['utrNumber', 'publicLiabilityInsurance'], riskLevel: 'medium' },
    ],
    taxCreditSchemes: ['HETVC', 'FTC'],
    defaultEmployerNicPct: 13.8, defaultPensionPct: 3, defaultHolidayPayPct: 12.07, defaultMileageRate: '45p/mile',
  },
  {
    code: 'IE', name: 'Ireland', flag: '🇮🇪', region: 'Europe & UK',
    defaultCurrency: 'EUR', timezone: 'GMT/IST',
    summary: 'Growing production destination. Section 481 at 32%. SIPTU for crew, Irish Equity for performers.',
    employmentStatuses: [
      { code: 'paye', label: 'PAYE Employee', requiredFields: ['ppsNumber', 'taxCredits', 'bankIban'] },
      { code: 'contractor', label: 'Contractor', requiredFields: ['companyRegNumber', 'vatNumber'], riskLevel: 'medium' },
    ],
    taxCreditSchemes: ['SECTION_481'],
    defaultEmployerNicPct: 11.05, defaultPensionPct: 0, defaultHolidayPayPct: 12.07, defaultMileageRate: '€0.49/km',
  },

  // ─── North America ──────────────────────────────────────────────────
  {
    code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America',
    defaultCurrency: 'USD', timezone: 'EST/PST',
    summary: 'Largest production market. IATSE, DGA, SAG-AFTRA, WGA, Teamsters. State incentives vary widely (GA 20-30%, CA 20-25%, NY 25-35%).',
    employmentStatuses: [
      { code: 'w2', label: 'W-2 Employee', requiredFields: ['ssn', 'w4FilingStatus', 'stateWithholding', 'i9Status', 'achRoutingNumber', 'achAccountNumber'] },
      { code: 'loanout', label: 'Loan-out Corporation', requiredFields: ['corpName', 'corpEin', 'loanoutAgreement'], riskLevel: 'medium' },
      { code: '1099', label: '1099 Contractor', requiredFields: ['ssn', 'w9'], riskLevel: 'high' },
    ],
    taxCreditSchemes: ['US_STATE'],
    defaultEmployerNicPct: 7.65, defaultPensionPct: 0, defaultHolidayPayPct: 0, defaultMileageRate: '67¢/mile',
  },
  {
    code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America',
    defaultCurrency: 'CAD', timezone: 'EST/PST',
    summary: 'Strong production incentives. BCCFU (BC), IATSE 873 (Ontario), ACTRA, DGC, WGC. Federal+provincial incentives up to 36%.',
    employmentStatuses: [
      { code: 't4', label: 'T4 Employee', requiredFields: ['sin', 'province', 'td1Federal', 'td1Provincial', 'bankTransit', 'bankInstitution', 'bankAccount'] },
      { code: 'incorporated', label: 'Incorporated', requiredFields: ['corpName', 'corpBN'], riskLevel: 'medium' },
      { code: 'selfemployed', label: 'Self-Employed', requiredFields: ['sin', 'gstHstNumber'], riskLevel: 'medium' },
    ],
    taxCreditSchemes: ['CANADA_FEDERAL', 'BC_VRDTC', 'ONTARIO_OPSTC'],
    defaultEmployerNicPct: 5.95, defaultPensionPct: 5.95, defaultHolidayPayPct: 4, defaultMileageRate: '70¢/km',
  },

  // ─── Asia-Pacific ───────────────────────────────────────────────────
  {
    code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Asia-Pacific',
    defaultCurrency: 'AUD', timezone: 'AEDT/AEST',
    summary: 'MEAA/SPA agreements. Super at 11.5% (rising to 12% July 2026). Location Offset 16.5%, PDV Offset 30%, Producer Offset 40%.',
    employmentStatuses: [
      { code: 'payg', label: 'PAYG Employee', requiredFields: ['tfn', 'superFund', 'superMemberNumber', 'bsb', 'bankAccount'] },
      { code: 'ptyltd', label: 'Pty Ltd Company', requiredFields: ['abn', 'companyName'], riskLevel: 'medium' },
      { code: 'abn', label: 'ABN Sole Trader', requiredFields: ['abn', 'bsb', 'bankAccount'], riskLevel: 'medium' },
    ],
    taxCreditSchemes: ['AU_LOCATION_OFFSET', 'AU_PDV_OFFSET', 'AU_PRODUCER_OFFSET'],
    defaultEmployerNicPct: 0, defaultPensionPct: 11.5, defaultHolidayPayPct: 0, defaultMileageRate: 'A$0.88/km',
  },
  {
    code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'Asia-Pacific',
    defaultCurrency: 'NZD', timezone: 'NZST/NZDT',
    summary: 'Screen Industry Workers Act. SPADA/Equity NZ. International rebate 20-25%, domestic 40%.',
    employmentStatuses: [
      { code: 'employee', label: 'Employee', requiredFields: ['irdNumber', 'bankAccount'] },
      { code: 'contractor', label: 'Contractor', requiredFields: ['irdNumber', 'gstNumber'], riskLevel: 'low' },
    ],
    taxCreditSchemes: ['NZ_INTERNATIONAL', 'NZ_DOMESTIC'],
    defaultEmployerNicPct: 0, defaultPensionPct: 0, defaultHolidayPayPct: 0, defaultMileageRate: 'NZ$0.99/km',
  },
  {
    code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia-Pacific',
    defaultCurrency: 'INR', timezone: 'IST',
    summary: 'State-level incentives up to 25%. EPF 12% employer. ESI 3.25% employer. Growing international production hub.',
    employmentStatuses: [
      { code: 'employee', label: 'Employee', requiredFields: ['pan', 'aadhaar', 'bankAccount', 'ifscCode'] },
    ],
    taxCreditSchemes: ['IN_STATE'],
    defaultEmployerNicPct: 3.25, defaultPensionPct: 12, defaultHolidayPayPct: 0, defaultMileageRate: '₹10/km',
  },
  {
    code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia-Pacific',
    defaultCurrency: 'JPY', timezone: 'JST',
    summary: 'Labour Standards Act. Social insurance ~15% employer. Strong domestic production industry.',
    employmentStatuses: [
      { code: 'employee', label: 'Employee', requiredFields: ['myNumber', 'bankAccount'] },
    ],
    taxCreditSchemes: [],
    defaultEmployerNicPct: 15, defaultPensionPct: 0, defaultHolidayPayPct: 0, defaultMileageRate: '¥37/km',
  },
  {
    code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia-Pacific',
    defaultCurrency: 'KRW', timezone: 'KST',
    summary: 'KOFIC incentives. Social insurance ~10% employer. Growing international co-production destination.',
    employmentStatuses: [
      { code: 'employee', label: 'Employee', requiredFields: ['residentRegNumber', 'bankAccount'] },
    ],
    taxCreditSchemes: ['KR_KOFIC'],
    defaultEmployerNicPct: 10, defaultPensionPct: 0, defaultHolidayPayPct: 0, defaultMileageRate: '₩200/km',
  },
  {
    code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia-Pacific',
    defaultCurrency: 'SGD', timezone: 'SGT',
    summary: 'CPF 17% employer (citizens/PR only). No income tax for foreign workers. Studio hub for Southeast Asia.',
    employmentStatuses: [
      { code: 'employee', label: 'Employee', requiredFields: ['nric', 'bankAccount'] },
    ],
    taxCreditSchemes: [],
    defaultEmployerNicPct: 17, defaultPensionPct: 0, defaultHolidayPayPct: 0, defaultMileageRate: 'S$0.75/km',
  },

  // ─── Europe ─────────────────────────────────────────────────────────
  {
    code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe',
    defaultCurrency: 'EUR', timezone: 'CET/CEST',
    summary: 'Ver.di + BFFS. 12-hour ABSOLUTE MAXIMUM (criminal liability). KSK 5% on self-employed. DFFF II at 20-25%.',
    employmentStatuses: [
      { code: 'employee', label: 'Arbeitnehmer', requiredFields: ['steuerIdentNr', 'sozialversicherungNr', 'iban'] },
      { code: 'freelance', label: 'Freiberufler', requiredFields: ['steuerNr', 'iban'], riskLevel: 'medium' },
    ],
    taxCreditSchemes: ['DE_DFFF', 'DE_MEDIENBOARD'],
    defaultEmployerNicPct: 21, defaultPensionPct: 4, defaultHolidayPayPct: 0, defaultMileageRate: '€0.30/km',
  },
  {
    code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe',
    defaultCurrency: 'EUR', timezone: 'CET/CEST',
    summary: 'CGT/CFDT conventions. 39hr standard week. Holiday pay 10%. C2I at 30% (min €1.5M spend). Intermittent du spectacle status.',
    employmentStatuses: [
      { code: 'intermittent', label: 'Intermittent du Spectacle', requiredFields: ['securiteSociale', 'congesSpectacles', 'iban'] },
      { code: 'cdd', label: "CDD d'Usage", requiredFields: ['securiteSociale', 'iban'] },
    ],
    taxCreditSchemes: ['FR_C2I', 'FR_CREDIT_CINEMA'],
    defaultEmployerNicPct: 45, defaultPensionPct: 0, defaultHolidayPayPct: 10, defaultMileageRate: '€0.60/km',
  },
  {
    code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe',
    defaultCurrency: 'EUR', timezone: 'CET/CEST',
    summary: 'UGT/CC.OO agreements. State tax deduction 30-50%. Canary Islands 50% incentive.',
    employmentStatuses: [
      { code: 'employee', label: 'Trabajador', requiredFields: ['nie', 'nss', 'iban'] },
    ],
    taxCreditSchemes: ['ES_STATE', 'ES_CANARY'],
    defaultEmployerNicPct: 30, defaultPensionPct: 0, defaultHolidayPayPct: 0, defaultMileageRate: '€0.26/km',
  },
  {
    code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe',
    defaultCurrency: 'EUR', timezone: 'CET/CEST',
    summary: 'INPS/ENPALS for entertainment workers. Tax Credit Cinema up to 40%. 13th month mandatory.',
    employmentStatuses: [
      { code: 'employee', label: 'Dipendente', requiredFields: ['codiceFiscale', 'iban'] },
    ],
    taxCreditSchemes: ['IT_TAX_CREDIT'],
    defaultEmployerNicPct: 30, defaultPensionPct: 0, defaultHolidayPayPct: 0, defaultMileageRate: '€0.46/km',
  },
  {
    code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'Europe',
    defaultCurrency: 'EUR', timezone: 'CET/CEST',
    summary: 'Film Fund at 35%. Vakantiegeld (vacation money) 8% of annual gross. Employer social ~18-25%.',
    employmentStatuses: [
      { code: 'employee', label: 'Werknemer', requiredFields: ['bsn', 'iban'] },
    ],
    taxCreditSchemes: ['NL_FILM_FUND'],
    defaultEmployerNicPct: 22, defaultPensionPct: 0, defaultHolidayPayPct: 8, defaultMileageRate: '€0.23/km',
  },

  // ─── Nordic ─────────────────────────────────────────────────────────
  {
    code: 'NO', name: 'Norway', flag: '🇳🇴', region: 'Nordic',
    defaultCurrency: 'NOK', timezone: 'CET/CEST',
    summary: 'Production Incentive 25% (min NOK 2M). National Insurance 14.1% (Oslo zone). Holiday pay 10.2%.',
    employmentStatuses: [
      { code: 'employee', label: 'Ansatt', requiredFields: ['fodselsnummer', 'bankAccount'] },
    ],
    taxCreditSchemes: ['NO_INCENTIVE'],
    defaultEmployerNicPct: 14.1, defaultPensionPct: 0, defaultHolidayPayPct: 10.2, defaultMileageRate: 'kr 3.50/km',
  },
  {
    code: 'SE', name: 'Sweden', flag: '🇸🇪', region: 'Nordic',
    defaultCurrency: 'SEK', timezone: 'CET/CEST',
    summary: 'Arbetsgivaravgift 31.42%. Strong film industry support via SFI.',
    employmentStatuses: [
      { code: 'employee', label: 'Anställd', requiredFields: ['personnummer', 'bankAccount'] },
    ],
    taxCreditSchemes: ['SE_SFI'],
    defaultEmployerNicPct: 31.42, defaultPensionPct: 0, defaultHolidayPayPct: 0, defaultMileageRate: 'kr 2.50/km',
  },

  // ─── Middle East & Africa ───────────────────────────────────────────
  {
    code: 'AE', name: 'UAE / Dubai', flag: '🇦🇪', region: 'Middle East & Africa',
    defaultCurrency: 'AED', timezone: 'GST (UTC+4)',
    summary: 'No income tax. Abu Dhabi Film Commission 30% rebate. End-of-service gratuity after 1+ year.',
    employmentStatuses: [
      { code: 'employee', label: 'Employee', requiredFields: ['emiratesId', 'labourCard', 'bankAccount'] },
    ],
    taxCreditSchemes: ['AE_ADFC'],
    defaultEmployerNicPct: 0, defaultPensionPct: 0, defaultHolidayPayPct: 0, defaultMileageRate: 'AED 1.5/km',
  },
  {
    code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Middle East & Africa',
    defaultCurrency: 'ZAR', timezone: 'SAST (UTC+2)',
    summary: 'DTIC Film & TV Production Incentive: 20% foreign, 35-50% SA co-prod. UIF 1% employer.',
    employmentStatuses: [
      { code: 'employee', label: 'Employee', requiredFields: ['idNumber', 'taxNumber', 'bankAccount'] },
    ],
    taxCreditSchemes: ['ZA_DTIC'],
    defaultEmployerNicPct: 1, defaultPensionPct: 0, defaultHolidayPayPct: 0, defaultMileageRate: 'R 4.64/km',
  },

  // ─── Latin America ──────────────────────────────────────────────────
  {
    code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'Latin America',
    defaultCurrency: 'MXN', timezone: 'CST/MST',
    summary: 'Eficine 189 at 10%. IMSS ~25-28% employer contributions.',
    employmentStatuses: [
      { code: 'employee', label: 'Empleado', requiredFields: ['curp', 'rfc', 'clabe'] },
    ],
    taxCreditSchemes: ['MX_EFICINE'],
    defaultEmployerNicPct: 26, defaultPensionPct: 0, defaultHolidayPayPct: 0, defaultMileageRate: 'MX$1.50/km',
  },
];
