/**
 * Auto-generate nominal coding lines for a deal memo.
 * Based on Kate's buildNominalLines() logic.
 *
 * Core lines:
 * - 2302: Basic Labour + HP
 * - 2360: Overtime / Penalties
 * - 2399: Employer NIC / FICA / On-costs
 *
 * Allowance lines:
 * - 2350: Kit/Box rental
 * - 2340: General allowances (one per allowance)
 *
 * Fringe lines (US/CA):
 * - 2397: Pension (if union pension applies)
 * - 2399: H&W (if rfHwPerHour > 0)
 */
export function buildNominalLines(dealMemo, territoryRule, productionSettings) {
  const lines = [];
  const nominalCodes = productionSettings?.nominalCodes || {
    basicLabour: '2302',
    overtime: '2360',
    kit: '2350',
    allowances: '2340',
    employerOnCosts: '2399',
    pension: '2397',
    mealPenalties: '2360',
  };

  const territory = dealMemo.territory || dealMemo.country || 'UK';

  // ─── Core lines (always present) ──────────────────────────────
  lines.push({
    lineKey: 'basic',
    label: territory === 'UK' || territory === 'IE' ? 'Basic Labour + HP' : 'Basic Labour',
    description: 'Contracted weekly/daily rate',
    nominalCode: nominalCodes.basicLabour,
    costCentre: 'DEPT',
    episode: 'All Episodes',
    isCore: true,
    isFringe: false,
  });

  lines.push({
    lineKey: 'ot',
    label: 'Overtime / Pre-call / Penalties',
    description: 'OT, meal penalties, turnaround penalties',
    nominalCode: nominalCodes.overtime,
    costCentre: 'DEPT',
    episode: 'All Episodes',
    isCore: true,
    isFringe: false,
  });

  // Territory-dependent employer on-costs label
  let nicLabel = 'Employer NIC';
  if (territory === 'US') nicLabel = 'FICA / Employer Tax';
  else if (territory === 'AU') nicLabel = 'Superannuation';
  else if (territory === 'CA') nicLabel = 'CPP / EI';
  else if (territory === 'DE') nicLabel = 'Sozialversicherung';
  else if (territory === 'FR') nicLabel = 'Charges Patronales';

  lines.push({
    lineKey: 'nic',
    label: nicLabel,
    description: 'Employer social contributions / tax',
    nominalCode: nominalCodes.employerOnCosts,
    costCentre: 'DEPT',
    episode: 'All Episodes',
    isCore: true,
    isFringe: true,
  });

  // ─── Fringe lines (US/CA with H&W or separate pension) ────────
  const hwPerHour = territoryRule?.rfHwPerHour || dealMemo.hwPerHour;
  if (hwPerHour && hwPerHour > 0) {
    lines.push({
      lineKey: 'hw',
      label: 'Health & Welfare (Employer)',
      description: `$${hwPerHour}/hr contribution`,
      nominalCode: nominalCodes.employerOnCosts,
      costCentre: 'DEPT',
      episode: 'All Episodes',
      isCore: false,
      isFringe: true,
    });
  }

  const pensionPct = territoryRule?.rfPensionPct || dealMemo.unionPensionPct;
  if ((territory === 'US' || territory === 'CA') && pensionPct && pensionPct > 0) {
    lines.push({
      lineKey: 'pension',
      label: 'Pension / Retirement (Employer)',
      description: `${(pensionPct * 100).toFixed(1)}% of gross`,
      nominalCode: nominalCodes.pension,
      costCentre: 'DEPT',
      episode: 'All Episodes',
      isCore: false,
      isFringe: true,
    });
  }

  // ─── Allowance lines (one per active allowance) ───────────────
  const allowances = dealMemo.customAllowances || [];

  // Kit allowance
  if (dealMemo.kitAllowance > 0) {
    lines.push({
      lineKey: 'kit',
      label: 'Box/Kit Allowance',
      description: `${dealMemo.kitAllowance}/${dealMemo.kitAllowancePeriod || 'weekly'}`,
      nominalCode: nominalCodes.kit,
      costCentre: 'DEPT',
      episode: 'All Episodes',
      isCore: false,
      isFringe: false,
    });
  }

  // Other fixed allowances
  const fixedAllowances = [
    { key: 'car', amount: dealMemo.carAllowance, label: 'Car Allowance' },
    { key: 'phone', amount: dealMemo.phoneAllowance, label: 'Phone Allowance' },
    { key: 'computer', amount: dealMemo.computerAllowance, label: 'Computer Allowance' },
    { key: 'travel', amount: dealMemo.travelAllowance, label: 'Travel Allowance' },
    { key: 'perdiem', amount: dealMemo.perDiemRate, label: 'Per Diem' },
    { key: 'housing', amount: dealMemo.housingAllowance, label: 'Housing Allowance' },
  ];

  for (const a of fixedAllowances) {
    if (a.amount > 0) {
      lines.push({
        lineKey: `allowance_${a.key}`,
        label: a.label,
        nominalCode: nominalCodes.allowances,
        costCentre: 'DEPT',
        episode: 'All Episodes',
        isCore: false,
        isFringe: false,
      });
    }
  }

  // Custom allowances
  for (const ca of allowances) {
    if (ca.amount > 0) {
      lines.push({
        lineKey: `custom_${ca.name?.toLowerCase().replace(/\s+/g, '_') || 'custom'}`,
        label: ca.name,
        nominalCode: ca.nominalCode || nominalCodes.allowances,
        costCentre: 'DEPT',
        episode: 'All Episodes',
        isCore: false,
        isFringe: false,
      });
    }
  }

  return lines;
}
