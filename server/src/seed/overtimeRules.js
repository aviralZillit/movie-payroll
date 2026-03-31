// Overtime rules for UK unions
// Source: Pact/BECTU MMP Agreement, Pact/BECTU TV Drama Agreement,
//         Pact/Equity Cinema Films Agreement, FOCAL UK Working Conditions
//         https://focal.ch/prodvalue/working_conditions/UK.html
//         https://bectu.org.uk/news/bectu-pact-joint-statement-on-broken-turnaround

export const overtimeRules = [
  // ════════════════════════════════════════════════
  // BECTU — FILM (MMP) GENERAL CREW
  // Standard: 11+1 (11hrs worked + 1hr lunch)
  // Non-camera OT: 1.5x in 30-min increments, capped at £81.82/hr
  // ════════════════════════════════════════════════
  {
    unionCode: 'BECTU', deptCode: null,
    name: 'Standard OT (1.5x after 11hrs)',
    afterHours: 11,
    multiplier: 1.5,
    afterTime: null,
    isNightRate: false,
    appliesTo: 'weekday',
    minHoursGuaranteed: 0,
    maxRatePerHour: 81.82,
    minRatePerHour: 25,
    incrementMinutes: 15,
    priority: 1,
    sourceUrl: 'https://focal.ch/prodvalue/working_conditions/UK.html',
  },
  {
    unionCode: 'BECTU', deptCode: null,
    name: 'Night OT (2x after 23:00)',
    afterHours: 0,
    multiplier: 2.0,
    afterTime: '23:00',
    isNightRate: true,
    appliesTo: 'all',
    minHoursGuaranteed: 0,
    maxRatePerHour: 81.82,
    minRatePerHour: 25,
    incrementMinutes: 15,
    priority: 10,
    sourceUrl: 'https://focal.ch/prodvalue/working_conditions/UK.html',
  },
  {
    unionCode: 'BECTU', deptCode: null,
    name: '6th Day (1.5x, min 6hrs)',
    afterHours: 0,
    multiplier: 1.5,
    afterTime: null,
    isNightRate: false,
    appliesTo: '6th_day',
    minHoursGuaranteed: 6,
    maxRatePerHour: 81.82,
    minRatePerHour: 25,
    incrementMinutes: 15,
    priority: 5,
    sourceUrl: 'https://focal.ch/prodvalue/working_conditions/UK.html',
  },
  {
    unionCode: 'BECTU', deptCode: null,
    name: '7th Day (2x, min 6hrs)',
    afterHours: 0,
    multiplier: 2.0,
    afterTime: null,
    isNightRate: false,
    appliesTo: '7th_day',
    minHoursGuaranteed: 6,
    maxRatePerHour: 81.82,
    minRatePerHour: 25,
    incrementMinutes: 15,
    priority: 5,
    sourceUrl: 'https://focal.ch/prodvalue/working_conditions/UK.html',
  },

  // ════════════════════════════════════════════════
  // BECTU — CAMERA DEPARTMENT SPECIFIC
  // Camera OT: 2x (not 1.5x like other depts), min £25/hr max £81.82/hr
  // ════════════════════════════════════════════════
  {
    unionCode: 'BECTU', deptCode: 'CAM',
    name: 'Camera OT (2x after 11hrs)',
    afterHours: 11,
    multiplier: 2.0,
    afterTime: null,
    isNightRate: false,
    appliesTo: 'weekday',
    minHoursGuaranteed: 0,
    maxRatePerHour: 81.82,
    minRatePerHour: 25,
    incrementMinutes: 15,
    priority: 20,
    sourceUrl: 'https://camerabranch.org.uk/rates/',
  },

  // ════════════════════════════════════════════════
  // BECTU — TV DRAMA
  // Standard: 10+1 (10hrs worked + 1hr lunch)
  // OT: 1.5x, min £35/hr max £70/hr
  // Night: 2x after 23:00 (changed from midnight in 2023)
  // ════════════════════════════════════════════════
  // Note: TV rules applied when production type is tv_drama
  // These are stored as separate rules with a naming convention

  // ════════════════════════════════════════════════
  // EQUITY — PERFORMERS
  // Standard: 10hr day
  // Film OT: max £94/hr
  // Night: +50% of daily fee
  // 12-hour turnaround
  // ════════════════════════════════════════════════
  {
    unionCode: 'EQUITY', deptCode: null,
    name: 'Performer OT (1.5x after 10hrs)',
    afterHours: 10,
    multiplier: 1.5,
    afterTime: null,
    isNightRate: false,
    appliesTo: 'weekday',
    minHoursGuaranteed: 0,
    maxRatePerHour: 94,
    minRatePerHour: 0,
    incrementMinutes: 15,
    priority: 1,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html',
  },
  {
    unionCode: 'EQUITY', deptCode: null,
    name: 'Performer Night Work (+50% daily fee)',
    afterHours: 0,
    multiplier: 1.5,
    afterTime: '20:00',
    isNightRate: true,
    appliesTo: 'all',
    minHoursGuaranteed: 0,
    maxRatePerHour: 94,
    minRatePerHour: 0,
    incrementMinutes: 15,
    priority: 10,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html',
  },
  {
    unionCode: 'EQUITY', deptCode: null,
    name: 'Performer 6th Day (1.5x)',
    afterHours: 0,
    multiplier: 1.5,
    afterTime: null,
    isNightRate: false,
    appliesTo: '6th_day',
    minHoursGuaranteed: 0,
    maxRatePerHour: 94,
    minRatePerHour: 0,
    incrementMinutes: 15,
    priority: 5,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html',
  },
  {
    unionCode: 'EQUITY', deptCode: null,
    name: 'Performer 7th Day (2x)',
    afterHours: 0,
    multiplier: 2.0,
    afterTime: null,
    isNightRate: false,
    appliesTo: '7th_day',
    minHoursGuaranteed: 0,
    maxRatePerHour: 94,
    minRatePerHour: 0,
    incrementMinutes: 15,
    priority: 5,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html',
  },

  // ════════════════════════════════════════════════
  // FAA — BACKGROUND ARTISTS
  // OT: £11.69 per 30 min (day), £17.54 per 30 min (night/public holiday)
  // ════════════════════════════════════════════════
  {
    unionCode: 'FAA', deptCode: null,
    name: 'Background OT (per 30min)',
    afterHours: 10,
    multiplier: 1.5,
    afterTime: null,
    isNightRate: false,
    appliesTo: 'weekday',
    minHoursGuaranteed: 0,
    maxRatePerHour: 23.38,
    minRatePerHour: 23.38,
    incrementMinutes: 30,
    priority: 1,
    sourceUrl: 'https://www.castingcollective.co.uk/production/payrates',
  },
  {
    unionCode: 'FAA', deptCode: null,
    name: 'Background Night OT (per 30min)',
    afterHours: 0,
    multiplier: 2.0,
    afterTime: '20:00',
    isNightRate: true,
    appliesTo: 'all',
    minHoursGuaranteed: 0,
    maxRatePerHour: 35.08,
    minRatePerHour: 35.08,
    incrementMinutes: 30,
    priority: 10,
    sourceUrl: 'https://www.castingcollective.co.uk/production/payrates',
  },
];
