/**
 * Payroll Bureau Export Service.
 * Generates bureau-specific export files from payroll run data.
 * Supports 8 bureaus: Sargent-Disc, Cast & Crew, Media Services,
 * Entertainment Partners, Moneypenny, PSS, In-house, Other.
 */

const BUREAU_CONFIGS = {
  SARGENT_DISC: {
    name: 'Sargent-Disc',
    territories: ['UK', 'IE'],
    csvColumns: ['Employee Name', 'NI Number', 'Tax Code', 'Department', 'Role',
      'Basic Pay', 'OT Pay', 'Holiday Pay', 'Gross Pay', 'Employer NI', 'Pension',
      'Employee NI', 'PAYE', 'Net Pay', 'Kit Allowance', 'Car Allowance',
      'Phone Allowance', 'Per Diem', 'Nominal Code', 'Cost Centre'],
  },
  CAST_AND_CREW: {
    name: 'Cast & Crew',
    territories: ['US', 'CA'],
    csvColumns: ['Employee Name', 'SSN', 'Department', 'Role', 'Union',
      'Base Pay', 'OT 1.5x', 'OT 2x', 'Golden Time', 'Meal Penalties',
      'Gross Pay', 'P&H', 'H&W', 'FICA', 'Federal Tax', 'State Tax',
      'Net Pay', 'Per Diem', 'Box Rental'],
  },
  ENTERTAINMENT_PARTNERS: {
    name: 'Entertainment Partners',
    territories: ['US', 'CA'],
    csvColumns: ['Last Name', 'First Name', 'SSN/SIN', 'Department Code', 'Occupation',
      'Union Code', 'Rate', 'Hours Worked', 'OT Hours', 'Gross', 'Fringes',
      'Deductions', 'Net', 'Check/ACH'],
  },
  MONEYPENNY: {
    name: 'Moneypenny',
    territories: ['IE'],
    csvColumns: ['Name', 'PPS Number', 'Department', 'Gross Pay', 'PRSI',
      'USC', 'PAYE', 'Net Pay'],
  },
  MEDIA_SERVICES: {
    name: 'Media Services',
    territories: ['UK'],
    csvColumns: ['Name', 'NI Number', 'Department', 'Basic', 'OT', 'HP',
      'Gross', 'NI Employer', 'NI Employee', 'Tax', 'Pension', 'Net'],
  },
  PSS_PAYROLL: {
    name: 'PSS Payroll',
    territories: ['UK', 'AU'],
    csvColumns: ['Name', 'Tax ID', 'Department', 'Gross', 'Fringes', 'Tax', 'Net'],
  },
  IN_HOUSE: {
    name: 'In-house',
    territories: ['UK', 'US', 'CA', 'AU', 'NZ', 'IE', 'DE', 'FR'],
    csvColumns: ['Name', 'Department', 'Role', 'Base Pay', 'OT Pay', 'Gross',
      'Holiday Pay', 'Employer Tax', 'Pension', 'H&W', 'Fringes',
      'Employee Tax', 'Employee NI', 'Net Pay', 'Total Cost'],
  },
  OTHER: {
    name: 'Other',
    territories: [],
    csvColumns: ['Name', 'Department', 'Gross', 'Fringes', 'Deductions', 'Net'],
  },
};

/**
 * Generate CSV export for a payroll run.
 */
export function generateCSV(payrollRun, bureauCode) {
  const config = BUREAU_CONFIGS[bureauCode] || BUREAU_CONFIGS.IN_HOUSE;
  const rows = [config.csvColumns.join(',')];

  for (const item of payrollRun.items || []) {
    const row = config.csvColumns.map((col) => {
      const val = mapColumnToValue(col, item, payrollRun);
      // Escape commas and quotes in CSV
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val ?? '';
    });
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

function mapColumnToValue(column, item, run) {
  const map = {
    'Employee Name': item.personName,
    'Name': item.personName,
    'Last Name': item.personName?.split(' ').pop(),
    'First Name': item.personName?.split(' ')[0],
    'Department': item.departmentName,
    'Department Code': item.departmentName,
    'Role': item.designationName,
    'Occupation': item.designationName,
    'Union': item.unionCode,
    'Union Code': item.unionCode,
    'NI Number': item.employmentDetails?.niNumber || '',
    'SSN': item.employmentDetails?.ssn || '',
    'SSN/SIN': item.employmentDetails?.ssn || item.employmentDetails?.sin || '',
    'Tax Code': item.employmentDetails?.taxCode || '',
    'PPS Number': item.employmentDetails?.ppsNumber || '',
    'Tax ID': item.employmentDetails?.taxId || '',
    'Basic Pay': item.basePay?.toFixed(2),
    'Base Pay': item.basePay?.toFixed(2),
    'Basic': item.basePay?.toFixed(2),
    'Rate': item.basePay?.toFixed(2),
    'OT Pay': ((item.overtime1x5Pay || 0) + (item.overtime2xPay || 0)).toFixed(2),
    'OT 1.5x': item.overtime1x5Pay?.toFixed(2),
    'OT 2x': item.overtime2xPay?.toFixed(2),
    'OT': ((item.overtime1x5Pay || 0) + (item.overtime2xPay || 0)).toFixed(2),
    'OT Hours': item.otHours?.toFixed(1),
    'Golden Time': item.goldenTimePay?.toFixed(2) || '0.00',
    'Meal Penalties': item.mealPenaltyPay?.toFixed(2),
    'Hours Worked': item.totalHours?.toFixed(1),
    'Gross Pay': item.grossPay?.toFixed(2),
    'Gross': item.grossPay?.toFixed(2),
    'Holiday Pay': item.holidayPay?.toFixed(2),
    'HP': item.holidayPay?.toFixed(2),
    'Employer NI': item.employerNi?.toFixed(2),
    'NI Employer': item.employerNi?.toFixed(2),
    'Employer Tax': item.employerNi?.toFixed(2),
    'Pension': item.employerPension?.toFixed(2),
    'P&H': ((item.employerPension || 0) + (item.hwContribution || 0)).toFixed(2),
    'H&W': item.hwContribution?.toFixed(2) || '0.00',
    'FICA': item.employerNi?.toFixed(2),
    'PRSI': item.employerNi?.toFixed(2),
    'Fringes': item.totalFringes?.toFixed(2),
    'Employee NI': item.employeeNi?.toFixed(2),
    'NI Employee': item.employeeNi?.toFixed(2),
    'PAYE': item.incomeTax?.toFixed(2),
    'Tax': item.incomeTax?.toFixed(2),
    'Federal Tax': item.incomeTax?.toFixed(2),
    'State Tax': item.stateTax?.toFixed(2) || '0.00',
    'USC': '0.00', // Irish USC — would need separate calc
    'Deductions': item.totalDeductions?.toFixed(2),
    'Net Pay': item.netPay?.toFixed(2),
    'Net': item.netPay?.toFixed(2),
    'Total Cost': item.totalCost?.toFixed(2),
    'Kit Allowance': item.kitAllowance?.toFixed(2),
    'Box Rental': item.kitAllowance?.toFixed(2),
    'Car Allowance': item.carAllowance?.toFixed(2),
    'Phone Allowance': item.phoneAllowance?.toFixed(2),
    'Per Diem': item.perDiem?.toFixed(2),
    'Nominal Code': '2302',
    'Cost Centre': item.departmentName,
    'Check/ACH': 'ACH',
  };

  return map[column] ?? '';
}

/**
 * Generate JSON export for API integration.
 */
export function generateJSON(payrollRun) {
  return {
    runNumber: payrollRun.runNumber,
    production: payrollRun.productionId?.name,
    weekEnding: payrollRun.weekEnding,
    headcount: payrollRun.headcount,
    totals: {
      gross: payrollRun.totalGross,
      fringes: payrollRun.totalFringes,
      deductions: payrollRun.totalDeductions,
      net: payrollRun.totalNet,
      cost: payrollRun.totalCost,
    },
    items: (payrollRun.items || []).map((item) => ({
      person: item.personName,
      department: item.departmentName,
      union: item.unionCode,
      basePay: item.basePay,
      overtimePay: (item.overtime1x5Pay || 0) + (item.overtime2xPay || 0),
      grossPay: item.grossPay,
      fringes: item.totalFringes,
      deductions: item.totalDeductions,
      netPay: item.netPay,
      totalCost: item.totalCost,
    })),
  };
}

/**
 * Get available bureaus for a territory.
 */
export function getBureausForTerritory(territory) {
  return Object.entries(BUREAU_CONFIGS)
    .filter(([, config]) => config.territories.length === 0 || config.territories.includes(territory))
    .map(([code, config]) => ({ code, name: config.name }));
}

export { BUREAU_CONFIGS };
