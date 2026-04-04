/**
 * Field Ownership Middleware.
 * Enforces two-tier field ownership on deal memos:
 * - PRODUCTION fields: only admin/payroll_admin/production_accountant can edit
 * - CREW fields: only the crew member themselves can edit
 *
 * Kate's model: PRODUCTION badge (coordinator fills) vs CREW badge (crew portal)
 */

const PRODUCTION_FIELDS = [
  'productionId', 'unionId', 'departmentId', 'designationId', 'budgetTierId',
  'contractingEntityId', 'territory', 'unionKey', 'isCustomDeal',
  'startDate', 'endDate', 'guaranteedWeeks', 'guaranteedDays',
  'dealType', 'weeklyRate', 'dailyRate', 'hourlyRate',
  'otRate1x5', 'otRate2x', 'standardWorkDayHrs',
  'holidayPayPct', 'employerNiPct', 'pensionPct',
  'kitAllowance', 'carAllowance', 'phoneAllowance', 'computerAllowance',
  'travelAllowance', 'perDiemRate', 'housingAllowance',
  'productionFee', 'idleDays', 'idleDayRate',
  'hpMode', 'goldenTimeEnabled', 'otRateCap', 'hwPerHour', 'unionPensionPct',
  'nominalLines', 'complianceChecklist', 'signingDocuments', 'payrollStartForm',
  'status', 'notes',
];

const CREW_FIELDS = [
  'dateOfBirth', 'address', 'emergencyContact',
  'niNumber', 'taxCode', 'starterDeclaration', 'p45Received',
  'bankSortCode', 'bankAccountNumber',
  'ssn', 'w4FilingStatus', 'stateWithholding', 'achRoutingNumber', 'achAccountNumber',
  'tfn', 'superFund', 'superMemberNumber', 'bsb',
  'sin', 'province',
  'taxId', 'iban', 'swift',
  'ltdCompanyName', 'ltdCompanyReg',
  'corpName', 'corpEin',
];

const ADMIN_ROLES = ['super_admin', 'payroll_admin', 'production_accountant'];

/**
 * Middleware: validates that the user can edit the fields they're trying to update.
 */
export function validateFieldOwnership(req, res, next) {
  const userRole = req.user?.role;
  const userId = req.user?._id?.toString();
  const updateFields = Object.keys(req.body || {});
  const isAdmin = ADMIN_ROLES.includes(userRole);

  // Admins can edit production fields
  // Crew members can only edit crew fields on their own deal memos
  const violations = [];

  for (const field of updateFields) {
    if (PRODUCTION_FIELDS.includes(field) && !isAdmin) {
      violations.push(`${field} (production-only field)`);
    }
    // Crew fields require either admin OR being the person on the deal
    // This is checked at the controller level (personId match)
  }

  if (violations.length > 0) {
    return res.status(403).json({
      success: false,
      message: `Insufficient permissions to edit: ${violations.join(', ')}`,
    });
  }

  next();
}

/**
 * Get field ownership classification for UI rendering.
 */
export function getFieldOwnership(territory) {
  return {
    production: PRODUCTION_FIELDS,
    crew: CREW_FIELDS,
    territory,
  };
}

export { PRODUCTION_FIELDS, CREW_FIELDS, ADMIN_ROLES };
