// ---------------------------------------------------------------------------
// Country-specific field visibility configuration for the Deal Memo wizard.
// Single source of truth — steps import helpers to decide what to show/hide.
// ---------------------------------------------------------------------------

// Supported territories (6 target countries + extras kept for compat)
export const SUPPORTED_TERRITORIES = ['UK', 'US', 'AU', 'FR', 'DE', 'ES', 'CA', 'IE', 'NZ', 'IN'];

// ---------------------------------------------------------------------------
// Employment status options per territory
// ---------------------------------------------------------------------------
export const EMPLOYMENT_STATUSES = {
  UK: [
    { value: 'paye', label: 'PAYE' },
    { value: 'ltd', label: 'Ltd Company' },
    { value: 'sole_trader', label: 'Sole Trader' },
  ],
  US: [
    { value: 'w2', label: 'W-2 Employee' },
    { value: 'loanout', label: 'Loan-out Corp' },
    { value: '1099', label: '1099 Contractor' },
  ],
  AU: [
    { value: 'payg', label: 'PAYG' },
    { value: 'pty_ltd', label: 'Pty Ltd' },
    { value: 'abn', label: 'ABN Sole Trader' },
  ],
  CA: [
    { value: 't4', label: 'T4 Employee' },
    { value: 'corp', label: 'Personal Corp' },
    { value: 'self_employed', label: 'Self-Employed' },
  ],
  FR: [
    { value: 'cdi', label: 'CDI (Permanent)' },
    { value: 'cdd', label: 'CDD (Fixed-term)' },
    { value: 'intermittent', label: 'Intermittent du Spectacle' },
  ],
  DE: [
    { value: 'festanstellung', label: 'Festanstellung (Permanent)' },
    { value: 'freiberufler', label: 'Freiberufler (Freelance)' },
    { value: 'gmbh', label: 'GmbH (Ltd Company)' },
  ],
  ES: [
    { value: 'fijo', label: 'Contrato Fijo (Permanent)' },
    { value: 'temporal', label: 'Contrato Temporal (Fixed-term)' },
    { value: 'autonomo', label: 'Autónomo (Self-employed)' },
  ],
  IN: [
    { value: 'permanent', label: 'Permanent Employee' },
    { value: 'contract', label: 'Contract (Fixed-term)' },
    { value: 'freelance', label: 'Freelance' },
  ],
};

// ---------------------------------------------------------------------------
// Crew detail fields per employment status
// ---------------------------------------------------------------------------
export const CREW_FIELD_DEFS = {
  // UK
  paye: [
    { name: 'niNumber', label: 'NI Number', placeholder: 'AB 12 34 56 C', owner: 'crew' },
    { name: 'taxCode', label: 'Tax Code', placeholder: '1257L', owner: 'crew' },
    { name: 'studentLoan', label: 'Student Loan Plan', placeholder: 'Plan 1 / Plan 2 / None', owner: 'crew' },
  ],
  ltd: [
    { name: 'companyName', label: 'Company Name', placeholder: 'Enter company name', owner: 'crew' },
    { name: 'companyRegNumber', label: 'Company Reg Number', placeholder: '12345678', owner: 'crew' },
    { name: 'vatNumber', label: 'VAT Number', placeholder: 'GB 123 4567 89', owner: 'crew' },
  ],
  sole_trader: [
    { name: 'niNumber', label: 'NI Number', placeholder: 'AB 12 34 56 C', owner: 'crew' },
    { name: 'utrNumber', label: 'UTR Number', placeholder: '1234567890', owner: 'crew' },
  ],
  // US
  w2: [
    { name: 'ssn', label: 'SSN', placeholder: 'XXX-XX-XXXX', owner: 'crew' },
    { name: 'w4FilingStatus', label: 'W-4 Filing Status', placeholder: 'Single / Married', owner: 'crew' },
    { name: 'w4Allowances', label: 'W-4 Allowances', placeholder: '0', owner: 'crew', type: 'number' },
    { name: 'stateWithholding', label: 'State Withholding', placeholder: 'CA / NY / etc.', owner: 'production' },
  ],
  loanout: [
    { name: 'loanoutCorpName', label: 'Loan-out Corp Name', placeholder: 'Enter corp name', owner: 'crew' },
    { name: 'federalId', label: 'Federal ID (EIN)', placeholder: 'XX-XXXXXXX', owner: 'crew' },
    { name: 'stateOfIncorp', label: 'State of Incorporation', placeholder: 'CA', owner: 'crew' },
  ],
  '1099': [
    { name: 'ssn', label: 'SSN / EIN', placeholder: 'XXX-XX-XXXX', owner: 'crew' },
    { name: 'businessName', label: 'Business Name (if applicable)', placeholder: '', owner: 'crew' },
  ],
  // AU
  payg: [
    { name: 'tfn', label: 'Tax File Number', placeholder: '123 456 789', owner: 'crew' },
    { name: 'superFund', label: 'Super Fund Name', placeholder: 'Enter super fund', owner: 'crew' },
    { name: 'superMemberNo', label: 'Super Member Number', placeholder: 'Member number', owner: 'crew' },
  ],
  pty_ltd: [
    { name: 'abn', label: 'ABN', placeholder: '12 345 678 901', owner: 'crew' },
    { name: 'companyName', label: 'Company Name', placeholder: 'Enter company name', owner: 'crew' },
    { name: 'gstRegistered', label: 'GST Registered', placeholder: 'Yes / No', owner: 'crew' },
  ],
  abn: [
    { name: 'tfn', label: 'Tax File Number', placeholder: '123 456 789', owner: 'crew' },
    { name: 'abn', label: 'ABN', placeholder: '12 345 678 901', owner: 'crew' },
  ],
  // CA
  t4: [
    { name: 'sin', label: 'SIN', placeholder: '123 456 789', owner: 'crew' },
    { name: 'td1FederalClaim', label: 'TD1 Federal Claim', placeholder: 'Basic personal amount', owner: 'crew' },
  ],
  corp: [
    { name: 'corpName', label: 'Corporation Name', placeholder: 'Enter corp name', owner: 'crew' },
    { name: 'businessNumber', label: 'Business Number', placeholder: '123456789RC0001', owner: 'crew' },
  ],
  self_employed: [
    { name: 'sin', label: 'SIN', placeholder: '123 456 789', owner: 'crew' },
    { name: 'businessNumber', label: 'Business Number (optional)', placeholder: '', owner: 'crew' },
  ],
  // FR
  cdi: [
    { name: 'numSecSociale', label: 'Numéro de Sécurité Sociale', placeholder: '1 XX XX XX XXX XXX XX', owner: 'crew' },
    { name: 'iban', label: 'IBAN', placeholder: 'FR76 XXXX XXXX XXXX XXXX XXXX XXX', owner: 'crew' },
    { name: 'mutuelle', label: 'Mutuelle (Health Insurance)', placeholder: 'Provider name', owner: 'crew' },
  ],
  cdd: [
    { name: 'numSecSociale', label: 'Numéro de Sécurité Sociale', placeholder: '1 XX XX XX XXX XXX XX', owner: 'crew' },
    { name: 'iban', label: 'IBAN', placeholder: 'FR76 XXXX XXXX XXXX XXXX XXXX XXX', owner: 'crew' },
    { name: 'cddEndDate', label: 'Contract End Date', placeholder: '', owner: 'production', type: 'date' },
  ],
  intermittent: [
    { name: 'numSecSociale', label: 'Numéro de Sécurité Sociale', placeholder: '1 XX XX XX XXX XXX XX', owner: 'crew' },
    { name: 'congespectacle', label: 'Congés Spectacles No.', placeholder: 'Membership number', owner: 'crew' },
    { name: 'iban', label: 'IBAN', placeholder: 'FR76 XXXX XXXX XXXX XXXX XXXX XXX', owner: 'crew' },
    { name: 'audiensMember', label: 'Audiens Member No.', placeholder: '', owner: 'crew' },
  ],
  // DE
  festanstellung: [
    { name: 'steuerID', label: 'Steuer-ID', placeholder: '12 345 678 901', owner: 'crew' },
    { name: 'sozialversicherung', label: 'Sozialversicherungsnummer', placeholder: '12 345678 A 123', owner: 'crew' },
    { name: 'iban', label: 'IBAN', placeholder: 'DE89 XXXX XXXX XXXX XXXX XX', owner: 'crew' },
    { name: 'steuerklasse', label: 'Steuerklasse (Tax Class)', placeholder: '1-6', owner: 'crew' },
  ],
  freiberufler: [
    { name: 'steuerID', label: 'Steuer-ID', placeholder: '12 345 678 901', owner: 'crew' },
    { name: 'steuernummer', label: 'Steuernummer', placeholder: 'XX/XXX/XXXXX', owner: 'crew' },
    { name: 'iban', label: 'IBAN', placeholder: 'DE89 XXXX XXXX XXXX XXXX XX', owner: 'crew' },
    { name: 'ustIdNr', label: 'USt-IdNr. (VAT ID)', placeholder: 'DE XXXXXXXXX', owner: 'crew' },
  ],
  gmbh: [
    { name: 'companyName', label: 'GmbH Name', placeholder: 'Company GmbH', owner: 'crew' },
    { name: 'handelsregister', label: 'Handelsregister No.', placeholder: 'HRB XXXXX', owner: 'crew' },
    { name: 'iban', label: 'IBAN', placeholder: 'DE89 XXXX XXXX XXXX XXXX XX', owner: 'crew' },
    { name: 'ustIdNr', label: 'USt-IdNr. (VAT ID)', placeholder: 'DE XXXXXXXXX', owner: 'crew' },
  ],
  // IN
  permanent: [
    { name: 'aadhaar', label: 'Aadhaar Card Number', placeholder: 'XXXX XXXX XXXX', owner: 'crew' },
    { name: 'pan', label: 'PAN Card Number', placeholder: 'ABCDE1234F', owner: 'crew' },
    { name: 'uan', label: 'UAN (PF Number)', placeholder: 'XXXXXXXXXXXX', owner: 'crew' },
    { name: 'bankAccountNumber', label: 'Bank Account Number', placeholder: 'Account number', owner: 'crew' },
    { name: 'ifsc', label: 'IFSC Code', placeholder: 'SBIN0001234', owner: 'crew' },
  ],
  contract: [
    { name: 'aadhaar', label: 'Aadhaar Card Number', placeholder: 'XXXX XXXX XXXX', owner: 'crew' },
    { name: 'pan', label: 'PAN Card Number', placeholder: 'ABCDE1234F', owner: 'crew' },
    { name: 'bankAccountNumber', label: 'Bank Account Number', placeholder: 'Account number', owner: 'crew' },
    { name: 'ifsc', label: 'IFSC Code', placeholder: 'SBIN0001234', owner: 'crew' },
    { name: 'contractEndDate', label: 'Contract End Date', type: 'date', owner: 'production' },
  ],
  freelance: [
    { name: 'aadhaar', label: 'Aadhaar Card Number', placeholder: 'XXXX XXXX XXXX', owner: 'crew' },
    { name: 'pan', label: 'PAN Card Number', placeholder: 'ABCDE1234F', owner: 'crew' },
    { name: 'gstin', label: 'GSTIN (if registered)', placeholder: 'XXAAAAA0000A0ZX', owner: 'crew' },
    { name: 'bankAccountNumber', label: 'Bank Account Number', placeholder: 'Account number', owner: 'crew' },
    { name: 'ifsc', label: 'IFSC Code', placeholder: 'SBIN0001234', owner: 'crew' },
  ],
  // ES
  fijo: [
    { name: 'nie', label: 'NIE / DNI', placeholder: 'X-1234567-X', owner: 'crew' },
    { name: 'numSegSocial', label: 'Número Seguridad Social', placeholder: 'XX/XXXXXXXX/XX', owner: 'crew' },
    { name: 'iban', label: 'IBAN', placeholder: 'ES91 XXXX XXXX XXXX XXXX XXXX', owner: 'crew' },
  ],
  temporal: [
    { name: 'nie', label: 'NIE / DNI', placeholder: 'X-1234567-X', owner: 'crew' },
    { name: 'numSegSocial', label: 'Número Seguridad Social', placeholder: 'XX/XXXXXXXX/XX', owner: 'crew' },
    { name: 'iban', label: 'IBAN', placeholder: 'ES91 XXXX XXXX XXXX XXXX XXXX', owner: 'crew' },
    { name: 'contractEndDate', label: 'Contract End Date', placeholder: '', owner: 'production', type: 'date' },
  ],
  autonomo: [
    { name: 'nie', label: 'NIE / DNI', placeholder: 'X-1234567-X', owner: 'crew' },
    { name: 'numSegSocial', label: 'Número Seguridad Social', placeholder: 'XX/XXXXXXXX/XX', owner: 'crew' },
    { name: 'iban', label: 'IBAN', placeholder: 'ES91 XXXX XXXX XXXX XXXX XXXX', owner: 'crew' },
    { name: 'iaeCode', label: 'IAE Code (Activity)', placeholder: 'XXX.X', owner: 'crew' },
  ],
};

// ---------------------------------------------------------------------------
// Right to Work fields per territory
// ---------------------------------------------------------------------------
export const RIGHT_TO_WORK_FIELDS = {
  UK: {
    label: 'Right to Work (UK)',
    // Documents admin can request from crew — shown as checkboxes in Step 6
    requestableDocuments: [
      'UK/Irish Passport',
      'Biometric Residence Permit (BRP)',
      'Share Code Check Result',
      'EU Settled Status Proof',
      'Visa Copy',
      'Birth Certificate',
      'Right to Work Letter',
    ],
    fields: [
      { name: 'rtwDocType', label: 'Document Type', type: 'select', options: ['UK/Irish Passport', 'Biometric Residence Permit', 'Share Code Check', 'EU Settled Status', 'Visa'], owner: 'crew' },
      { name: 'rtwDocRef', label: 'Document Reference / Share Code', placeholder: 'Enter reference...', owner: 'crew' },
      { name: 'rtwExpiryDate', label: 'Expiry Date (if visa-based)', type: 'date', owner: 'crew' },
    ],
  },
  US: {
    label: 'Work Authorization (US)',
    requestableDocuments: ['I-9 Employment Eligibility Form', 'US Passport', 'Green Card (Permanent Resident)', 'H-1B Visa Copy', 'O-1 Visa Copy', 'P-1 Visa Copy', 'EAD Card', 'Social Security Card'],
    fields: [
      { name: 'rtwDocType', label: 'Authorization Type', type: 'select', options: ['US Citizen', 'Permanent Resident (Green Card)', 'H-1B Visa', 'O-1 Visa', 'P-1 Visa', 'Other Work Visa'], owner: 'crew' },
      { name: 'rtwDocRef', label: 'I-9 Status / Visa Number', placeholder: 'Enter reference...', owner: 'crew' },
      { name: 'rtwExpiryDate', label: 'Visa Expiry Date', type: 'date', owner: 'crew' },
    ],
  },
  AU: {
    label: 'Work Authorization (Australia)',
    requestableDocuments: ['Australian Passport', 'VEVO Check Result', 'Visa Grant Notice (subclass 482)', 'Visa Grant Notice (subclass 408)', 'ImmiCard', 'Birth Certificate'],
    fields: [
      { name: 'rtwDocType', label: 'Authorization Type', type: 'select', options: ['Australian Citizen', 'Permanent Resident', 'Work Visa (subclass 482)', 'Work Visa (subclass 408)', 'Other Visa'], owner: 'crew' },
      { name: 'rtwDocRef', label: 'VEVO Check Reference', placeholder: 'Enter VEVO reference...', owner: 'crew' },
      { name: 'rtwExpiryDate', label: 'Visa Expiry Date', type: 'date', owner: 'crew' },
    ],
  },
  FR: {
    label: 'Droit de Travail (France)',
    requestableDocuments: ['Carte Nationale d\'Identité (UE)', 'Passeport', 'Titre de Séjour', 'Autorisation de Travail', 'Récépissé de demande', 'Carte de Résident'],
    fields: [
      { name: 'rtwDocType', label: 'Type de Document', type: 'select', options: ['Citoyen UE', 'Carte de Résident', 'Titre de Séjour', 'Autorisation de Travail', 'Visa Long Séjour'], owner: 'crew' },
      { name: 'rtwDocRef', label: 'Numéro de Titre / Référence', placeholder: 'Enter reference...', owner: 'crew' },
      { name: 'rtwExpiryDate', label: 'Date d\'expiration', type: 'date', owner: 'crew' },
    ],
  },
  DE: {
    label: 'Arbeitserlaubnis (Germany)',
    requestableDocuments: ['EU-Personalausweis', 'Reisepass', 'Aufenthaltstitel', 'Blaue Karte EU', 'Arbeitserlaubnis', 'Niederlassungserlaubnis'],
    fields: [
      { name: 'rtwDocType', label: 'Dokumenttyp', type: 'select', options: ['EU-Bürger', 'Niederlassungserlaubnis', 'Aufenthaltstitel mit Arbeitserlaubnis', 'Blaue Karte EU', 'Visum mit Arbeitserlaubnis'], owner: 'crew' },
      { name: 'rtwDocRef', label: 'Aufenthaltstitel Nr.', placeholder: 'Enter reference...', owner: 'crew' },
      { name: 'rtwExpiryDate', label: 'Ablaufdatum', type: 'date', owner: 'crew' },
    ],
  },
  ES: {
    label: 'Permiso de Trabajo (Spain)',
    requestableDocuments: ['DNI (Ciudadano UE)', 'Pasaporte', 'NIE con Permiso de Trabajo', 'Tarjeta de Residencia', 'Visa de Trabajo', 'Certificado de Registro UE'],
    fields: [
      { name: 'rtwDocType', label: 'Tipo de Documento', type: 'select', options: ['Ciudadano UE', 'NIE con Permiso de Trabajo', 'Tarjeta de Residencia', 'Visa de Trabajo', 'Autónomo Extranjero'], owner: 'crew' },
      { name: 'rtwDocRef', label: 'NIE / Número de Referencia', placeholder: 'Enter NIE...', owner: 'crew' },
      { name: 'rtwExpiryDate', label: 'Fecha de Vencimiento', type: 'date', owner: 'crew' },
    ],
  },
  IN: {
    label: 'Work Authorization (India)',
    requestableDocuments: ['Aadhaar Card Copy', 'PAN Card Copy', 'Passport', 'Employment Visa (if foreign)', 'Work Permit (if foreign)', 'Address Proof'],
    fields: [
      { name: 'rtwDocType', label: 'Authorization Type', type: 'select', options: ['Indian Citizen', 'Employment Visa', 'Business Visa', 'Other Visa'], owner: 'crew' },
      { name: 'rtwDocRef', label: 'Visa Number / Reference', placeholder: 'Enter reference...', owner: 'crew' },
      { name: 'rtwExpiryDate', label: 'Visa Expiry Date', type: 'date', owner: 'crew' },
    ],
  },
  CA: {
    label: 'Work Authorization (Canada)',
    requestableDocuments: ['Canadian Passport', 'Permanent Resident Card', 'Work Permit', 'Open Work Permit', 'Study Permit with Work Authorization', 'Birth Certificate'],
    fields: [
      { name: 'rtwDocType', label: 'Authorization Type', type: 'select', options: ['Canadian Citizen', 'Permanent Resident', 'Work Permit', 'Open Work Permit'], owner: 'crew' },
      { name: 'rtwDocRef', label: 'Work Permit Number', placeholder: 'Enter reference...', owner: 'crew' },
      { name: 'rtwExpiryDate', label: 'Permit Expiry Date', type: 'date', owner: 'crew' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Bureau options per territory
// ---------------------------------------------------------------------------
export const BUREAU_OPTIONS = {
  UK: [
    { _id: 'SARGENT_DISC', name: 'Sargent-Disc' },
    { _id: 'MEDIA_SERVICES', name: 'Media Services' },
    { _id: 'PSS_PAYROLL', name: 'PSS Payroll' },
    { _id: 'IN_HOUSE', name: 'In-house' },
  ],
  US: [
    { _id: 'CAST_AND_CREW', name: 'Cast & Crew' },
    { _id: 'ENTERTAINMENT_PARTNERS', name: 'Entertainment Partners' },
    { _id: 'IN_HOUSE', name: 'In-house' },
  ],
  AU: [
    { _id: 'PSS_PAYROLL', name: 'PSS Payroll' },
    { _id: 'IN_HOUSE', name: 'In-house' },
  ],
  FR: [
    { _id: 'AUDIENS', name: 'Audiens' },
    { _id: 'CENTRE_NATIONAL', name: 'Centre National du Cinéma' },
    { _id: 'IN_HOUSE', name: 'In-house' },
  ],
  DE: [
    { _id: 'PENSIONSKASSE', name: 'Pensionskasse Rundfunk' },
    { _id: 'BVK', name: 'BVK (Versorgungskasse)' },
    { _id: 'IN_HOUSE', name: 'In-house' },
  ],
  ES: [
    { _id: 'SEG_SOCIAL', name: 'Seguridad Social' },
    { _id: 'IN_HOUSE', name: 'In-house' },
  ],
  CA: [
    { _id: 'CAST_AND_CREW', name: 'Cast & Crew' },
    { _id: 'ENTERTAINMENT_PARTNERS', name: 'Entertainment Partners' },
    { _id: 'IN_HOUSE', name: 'In-house' },
  ],
  IN: [
    { _id: 'IN_HOUSE', name: 'In-house' },
    { _id: 'ADP_INDIA', name: 'ADP India' },
    { _id: 'GREYTHR', name: 'Greythr' },
    { _id: 'KEKA', name: 'Keka HR' },
  ],
  IE: [
    { _id: 'MONEYPENNY', name: 'Moneypenny' },
    { _id: 'IN_HOUSE', name: 'In-house' },
  ],
  DEFAULT: [
    { _id: 'IN_HOUSE', name: 'In-house' },
    { _id: 'OTHER', name: 'Other' },
  ],
};

// ---------------------------------------------------------------------------
// Outstanding fields per territory (for payroll readiness check)
// ---------------------------------------------------------------------------
export const OUTSTANDING_FIELDS = {
  UK: [
    { name: 'niNumber', label: 'NI Number' },
    { name: 'taxCode', label: 'Tax Code' },
    { name: 'bankSortCode', label: 'Bank Sort Code' },
    { name: 'bankAccountNumber', label: 'Bank Account Number' },
    { name: 'dateOfBirth', label: 'Date of Birth' },
    { name: 'address', label: 'Address' },
    { name: 'emergencyContact', label: 'Emergency Contact' },
  ],
  US: [
    { name: 'ssn', label: 'Social Security Number' },
    { name: 'w4FilingStatus', label: 'W-4 Filing Status' },
    { name: 'stateWithholding', label: 'State Withholding' },
    { name: 'achRoutingNumber', label: 'ACH Routing Number' },
    { name: 'achAccountNumber', label: 'ACH Account Number' },
    { name: 'dateOfBirth', label: 'Date of Birth' },
    { name: 'address', label: 'Address' },
  ],
  AU: [
    { name: 'tfn', label: 'Tax File Number' },
    { name: 'superFund', label: 'Superannuation Fund' },
    { name: 'superMemberNumber', label: 'Super Member Number' },
    { name: 'bsb', label: 'BSB' },
    { name: 'dateOfBirth', label: 'Date of Birth' },
    { name: 'address', label: 'Address' },
  ],
  CA: [
    { name: 'sin', label: 'Social Insurance Number' },
    { name: 'province', label: 'Province' },
    { name: 'dateOfBirth', label: 'Date of Birth' },
    { name: 'address', label: 'Address' },
  ],
  FR: [
    { name: 'numSecSociale', label: 'N° Sécurité Sociale' },
    { name: 'iban', label: 'IBAN' },
    { name: 'dateOfBirth', label: 'Date of Birth' },
    { name: 'address', label: 'Address' },
  ],
  DE: [
    { name: 'steuerID', label: 'Steuer-ID' },
    { name: 'sozialversicherung', label: 'Sozialversicherungsnummer' },
    { name: 'iban', label: 'IBAN' },
    { name: 'steuerklasse', label: 'Steuerklasse' },
    { name: 'dateOfBirth', label: 'Date of Birth' },
    { name: 'address', label: 'Address' },
  ],
  ES: [
    { name: 'nie', label: 'NIE / DNI' },
    { name: 'numSegSocial', label: 'N° Seguridad Social' },
    { name: 'iban', label: 'IBAN' },
    { name: 'dateOfBirth', label: 'Date of Birth' },
    { name: 'address', label: 'Address' },
  ],
};

// ---------------------------------------------------------------------------
// Country-specific standard documents
// ---------------------------------------------------------------------------
export const STANDARD_DOCUMENTS = {
  UK: [
    { filename: 'NDA_Confidentiality_Agreement.pdf', requiresSignature: true },
    { filename: 'Anti_Harassment_Bullying_Policy.pdf', requiresSignature: true },
    { filename: 'Health_Safety_Policy.pdf', requiresSignature: true },
    { filename: 'Code_of_Conduct.pdf', requiresSignature: true },
    { filename: 'GDPR_Data_Protection_Notice.pdf', requiresSignature: false },
  ],
  US: [
    { filename: 'NDA_Confidentiality_Agreement.pdf', requiresSignature: true },
    { filename: 'Anti_Harassment_Policy.pdf', requiresSignature: true },
    { filename: 'Safety_Guidelines.pdf', requiresSignature: true },
    { filename: 'Code_of_Conduct.pdf', requiresSignature: true },
    { filename: 'Workers_Comp_Notice.pdf', requiresSignature: false },
  ],
  AU: [
    { filename: 'NDA_Confidentiality_Agreement.pdf', requiresSignature: true },
    { filename: 'Anti_Harassment_Policy.pdf', requiresSignature: true },
    { filename: 'WHS_Safety_Policy.pdf', requiresSignature: true },
    { filename: 'Code_of_Conduct.pdf', requiresSignature: true },
    { filename: 'Privacy_Notice.pdf', requiresSignature: false },
  ],
  FR: [
    { filename: 'Accord_Confidentialite.pdf', requiresSignature: true },
    { filename: 'Charte_Anti_Harcelement.pdf', requiresSignature: true },
    { filename: 'Reglement_Securite.pdf', requiresSignature: true },
    { filename: 'Code_de_Conduite.pdf', requiresSignature: true },
    { filename: 'Notice_RGPD.pdf', requiresSignature: false },
  ],
  DE: [
    { filename: 'Geheimhaltungsvereinbarung.pdf', requiresSignature: true },
    { filename: 'Anti_Belastigung_Richtlinie.pdf', requiresSignature: true },
    { filename: 'Arbeitssicherheit_Richtlinie.pdf', requiresSignature: true },
    { filename: 'Verhaltenskodex.pdf', requiresSignature: true },
    { filename: 'Datenschutzhinweis_DSGVO.pdf', requiresSignature: false },
  ],
  ES: [
    { filename: 'Acuerdo_Confidencialidad.pdf', requiresSignature: true },
    { filename: 'Politica_Anti_Acoso.pdf', requiresSignature: true },
    { filename: 'Politica_Seguridad_Salud.pdf', requiresSignature: true },
    { filename: 'Codigo_Conducta.pdf', requiresSignature: true },
    { filename: 'Aviso_Proteccion_Datos_LOPD.pdf', requiresSignature: false },
  ],
  CA: [
    { filename: 'NDA_Confidentiality_Agreement.pdf', requiresSignature: true },
    { filename: 'Anti_Harassment_Policy.pdf', requiresSignature: true },
    { filename: 'Health_Safety_Policy.pdf', requiresSignature: true },
    { filename: 'Code_of_Conduct.pdf', requiresSignature: true },
    { filename: 'PIPEDA_Privacy_Notice.pdf', requiresSignature: false },
  ],
};

// ---------------------------------------------------------------------------
// Territory flag map
// ---------------------------------------------------------------------------
export const TERRITORY_FLAGS = {
  UK: { emoji: '\uD83C\uDDEC\uD83C\uDDE7', label: 'United Kingdom' },
  US: { emoji: '\uD83C\uDDFA\uD83C\uDDF8', label: 'United States' },
  AU: { emoji: '\uD83C\uDDE6\uD83C\uDDFA', label: 'Australia' },
  CA: { emoji: '\uD83C\uDDE8\uD83C\uDDE6', label: 'Canada' },
  NZ: { emoji: '\uD83C\uDDF3\uD83C\uDDFF', label: 'New Zealand' },
  FR: { emoji: '\uD83C\uDDEB\uD83C\uDDF7', label: 'France' },
  DE: { emoji: '\uD83C\uDDE9\uD83C\uDDEA', label: 'Germany' },
  ES: { emoji: '\uD83C\uDDEA\uD83C\uDDF8', label: 'Spain' },
  IN: { emoji: '\uD83C\uDDEE\uD83C\uDDF3', label: 'India' },
  IE: { emoji: '\uD83C\uDDEE\uD83C\uDDEA', label: 'Ireland' },
};

// ---------------------------------------------------------------------------
// Roles that can see payroll step
// ---------------------------------------------------------------------------
export const PAYROLL_VISIBLE_ROLES = ['super_admin', 'payroll_admin', 'production_accountant'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function getEmploymentStatuses(territory) {
  return EMPLOYMENT_STATUSES[territory] || EMPLOYMENT_STATUSES.UK;
}

export function getCrewFields(employmentStatus) {
  return CREW_FIELD_DEFS[employmentStatus] || [];
}

export function getRightToWorkConfig(territory) {
  return RIGHT_TO_WORK_FIELDS[territory] || RIGHT_TO_WORK_FIELDS.UK;
}

export function getBureauOptions(territory) {
  return BUREAU_OPTIONS[territory] || BUREAU_OPTIONS.DEFAULT;
}

export function getOutstandingFields(territory) {
  return OUTSTANDING_FIELDS[territory] || OUTSTANDING_FIELDS.UK;
}

export function getStandardDocuments(territory) {
  return STANDARD_DOCUMENTS[territory] || STANDARD_DOCUMENTS.UK;
}

export function getTerritoryFlag(territory) {
  return TERRITORY_FLAGS[territory] || { emoji: '\uD83C\uDF0D', label: territory };
}

export function isPayrollVisibleRole(role) {
  return PAYROLL_VISIBLE_ROLES.includes(role);
}
