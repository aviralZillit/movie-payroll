// UK Union Rate Cards — 2025 rates from OFFICIAL sources only
//
// CAMERA BRANCH: Extracted from camerabranch.org.uk/rates/
//   PDF: camera-branch-ratecard-film-and-tv-drama-2025-v37a-new-format.pdf
//   Published: 01/01/2025
//
// GRAPHICS UNION: Extracted from graphicsunion.co.uk/rates (2025-2026)
// FAA/PACT: Extracted from castingcollective.co.uk/production/payrates
// WGGB: Extracted from writersguild.org.uk/rates-and-agreements
// EQUITY: From Pact/Equity Cinema Films Agreement 2024-2025
//
// All rates are LABOUR ONLY unless noted
// Camera OT = flat Camera Overtime rate (not 1.5x multiplied)

export const rateCards = [

  // ════════════════════════════════════════════════════════════════════════
  // BECTU CAMERA BRANCH — MOTION PICTURE MAJOR FEATURE (£30m+)
  // Source: Camera Branch Rate Card 2025 v37a
  // ════════════════════════════════════════════════════════════════════════

  // Cinematographer — Individually Negotiated
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'DOP', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 0, dailyRate: 0, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a',
    notes: 'Individually Negotiated at all tiers.' },

  // Camera Operator
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'CAM_OP', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 4845, dailyRate: 969, hourlyRate: 81,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 969, seventhDayRate: 969,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'CAM_OP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 4038, dailyRate: 808, hourlyRate: 81,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 808, seventhDayRate: 808,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  // Cam Op — Mid Budget (<£30m) — same as Major
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'CAM_OP', tierCode: 'FILM_15_30',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 4845, dailyRate: 969, hourlyRate: 81,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 969, seventhDayRate: 969,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  // Cam Op — Low Budget (<£10m)
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'CAM_OP', tierCode: 'FILM_5_15',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 4071, dailyRate: 814, hourlyRate: 68,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 814, seventhDayRate: 814,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  // Cam Op — Indie (<£4m)
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'CAM_OP', tierCode: 'FILM_3_5',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 3392, dailyRate: 678, hourlyRate: 57,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 678, seventhDayRate: 678,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  // Cam Op — TV Band 4 (£7m+)
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'CAM_OP', tierCode: 'TV_BAND4',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 3364, dailyRate: 673, hourlyRate: 67,
    overtimeRate1x5: 70, overtimeRate2x: 70, sixthDayRate: 673, seventhDayRate: 673,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  // Cam Op — TV Band 3 (<£7m)
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'CAM_OP', tierCode: 'TV_BAND3',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 3364, dailyRate: 673, hourlyRate: 67,
    overtimeRate1x5: 70, overtimeRate2x: 70, sixthDayRate: 673, seventhDayRate: 673,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  // Cam Op — TV Band 2 (<£3m)
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'CAM_OP', tierCode: 'TV_BAND2',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 3171, dailyRate: 634, hourlyRate: 63,
    overtimeRate1x5: 70, overtimeRate2x: 70, sixthDayRate: 634, seventhDayRate: 634,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  // Cam Op — TV Band 1 (<£1m)
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'CAM_OP', tierCode: 'TV_BAND1',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 2814, dailyRate: 563, hourlyRate: 56,
    overtimeRate1x5: 70, overtimeRate2x: 70, sixthDayRate: 563, seventhDayRate: 563,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },

  // Steadicam Operator — Major Feature
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'STEAD', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 6057, dailyRate: 1211, hourlyRate: 101,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 1211, seventhDayRate: 1211,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'STEAD', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 5048, dailyRate: 1010, hourlyRate: 101,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 1010, seventhDayRate: 1010,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },

  // Focus Puller / 1st AC — Major Feature
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: '1AC', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 3392, dailyRate: 678, hourlyRate: 57,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 678, seventhDayRate: 678,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: '1AC', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 2826, dailyRate: 565, hourlyRate: 57,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 565, seventhDayRate: 565,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  // 1AC — Low Budget (<£10m)
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: '1AC', tierCode: 'FILM_5_15',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 3230, dailyRate: 646, hourlyRate: 54,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 646, seventhDayRate: 646,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  // 1AC — Indie (<£4m)
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: '1AC', tierCode: 'FILM_3_5',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 2716, dailyRate: 543, hourlyRate: 45,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 543, seventhDayRate: 543,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },

  // Clapper Loader / 2nd AC — Major Feature
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: '2AC', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 2489, dailyRate: 498, hourlyRate: 41,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 498, seventhDayRate: 498,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: '2AC', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 2075, dailyRate: 415, hourlyRate: 41,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 415, seventhDayRate: 415,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  // 2AC — Low Budget
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: '2AC', tierCode: 'FILM_5_15',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 2263, dailyRate: 453, hourlyRate: 38,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 453, seventhDayRate: 453,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },
  // 2AC — Indie
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: '2AC', tierCode: 'FILM_3_5',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 2112, dailyRate: 422, hourlyRate: 35,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 422, seventhDayRate: 422,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },

  // DIT — Major Feature (same rates as 1st AC)
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'DIT', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 3392, dailyRate: 678, hourlyRate: 57,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 678, seventhDayRate: 678,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a',
    notes: 'DIT rates same as Focus Puller / 1st AC.' },
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'DIT', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 2826, dailyRate: 565, hourlyRate: 57,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 565, seventhDayRate: 565,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a' },

  // DIT Assistant / Camera Trainee — Major Feature
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'CAM_TRN', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 2112, dailyRate: 422, hourlyRate: 35,
    overtimeRate1x5: 70, overtimeRate2x: 70, sixthDayRate: 422, seventhDayRate: 422,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a',
    notes: 'DIT Assistant. OT rate £70 (not £82 camera rate).' },

  // Drone Operator — aligned with Steadicam
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'DRONE', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 6057, dailyRate: 1211, hourlyRate: 101,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 1211, seventhDayRate: 1211,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a',
    notes: 'Drone Operator aligned with Steadicam rates.' },

  // Script Supervisor (on Camera Branch card) — Major Feature
  { unionCode: 'BECTU', deptCode: 'PROD', desigCode: 'SCRP_SUP', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 3392, dailyRate: 678, hourlyRate: 57,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 678, seventhDayRate: 678,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'Camera Branch Rate Card 2025 v37a',
    notes: 'Script Supervisor listed on Camera Branch card. Same rates as 1st AC.' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU GRAPHICS — FILM MMP (2025-2026)
  // Source: graphicsunion.co.uk/rates
  // Rates shown as ranges — using midpoint
  // ════════════════════════════════════════════════════════════════════════

  { unionCode: 'BECTU', deptCode: 'GFX', desigCode: 'LEAD_GFX', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 2240, dailyRate: 448, hourlyRate: 40.73,
    overtimeRate1x5: 61.09, overtimeRate2x: 81.45, sixthDayRate: 672, seventhDayRate: 896,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.graphicsunion.co.uk/rates', sourceDocument: 'Graphics Union Rate Card 2025-2026',
    notes: 'Range: £1,810–£2,670. Midpoint £2,240.' },
  { unionCode: 'BECTU', deptCode: 'GFX', desigCode: 'GFX_DES', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 1865, dailyRate: 373, hourlyRate: 33.91,
    overtimeRate1x5: 50.86, overtimeRate2x: 67.82, sixthDayRate: 559.50, seventhDayRate: 746,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.graphicsunion.co.uk/rates', sourceDocument: 'Graphics Union Rate Card 2025-2026',
    notes: 'Range: £1,705–£2,025. Midpoint £1,865.' },
  { unionCode: 'BECTU', deptCode: 'GFX', desigCode: 'AST_GFX', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 1523, dailyRate: 304.50, hourlyRate: 27.68,
    overtimeRate1x5: 41.52, overtimeRate2x: 55.36, sixthDayRate: 456.75, seventhDayRate: 609,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.graphicsunion.co.uk/rates', sourceDocument: 'Graphics Union Rate Card 2025-2026',
    notes: 'Range: £1,440–£1,605. Midpoint £1,523.' },
  { unionCode: 'BECTU', deptCode: 'GFX', desigCode: 'GFX_AST', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 1118, dailyRate: 223.50, hourlyRate: 20.32,
    overtimeRate1x5: 30.48, overtimeRate2x: 40.64, sixthDayRate: 335.25, seventhDayRate: 447,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.graphicsunion.co.uk/rates', sourceDocument: 'Graphics Union Rate Card 2025-2026',
    notes: 'Range: £1,025–£1,210. Midpoint £1,118.' },
  { unionCode: 'BECTU', deptCode: 'GFX', desigCode: 'GFX_TRN', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 795, dailyRate: 159, hourlyRate: 14.45,
    overtimeRate1x5: 21.68, overtimeRate2x: 28.91, sixthDayRate: 238.50, seventhDayRate: 318,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.graphicsunion.co.uk/rates', sourceDocument: 'Graphics Union Rate Card 2025-2026',
    notes: 'Graphics Trainee. £795 (MMP).' },

  // ════════════════════════════════════════════════════════════════════════
  // EQUITY — CAST (Pact/Equity Cinema Films Agreement 2024-2025)
  // Source: pact.co.uk/resource-hub
  // Base daily: £161, weekly: £644. Uplifts: +280% (£3m+), +75% (£1-3m), +50% (<£1m)
  // ════════════════════════════════════════════════════════════════════════

  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'LEAD', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-04-01', weeklyRate: 2447, dailyRate: 611.80, hourlyRate: 61.18,
    overtimeRate1x5: 91.77, overtimeRate2x: 94, sixthDayRate: 917.70, seventhDayRate: 1223.60,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html',
    sourceDocument: 'Pact/Equity Cinema Films Agreement 2024-2025',
    notes: 'Base £644 + 280% uplift = £2,447/wk. OT max £94/hr.' },
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'SUPP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-04-01', weeklyRate: 2447, dailyRate: 611.80, hourlyRate: 61.18,
    overtimeRate1x5: 91.77, overtimeRate2x: 94, sixthDayRate: 917.70, seventhDayRate: 1223.60,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html',
    sourceDocument: 'Pact/Equity Cinema Films Agreement 2024-2025' },
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'DAY_PLR', tierCode: 'FILM_MMP',
    dealType: 'daily', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-04-01', weeklyRate: 2447, dailyRate: 611.80, hourlyRate: 61.18,
    overtimeRate1x5: 91.77, overtimeRate2x: 94, sixthDayRate: 917.70, seventhDayRate: 1223.60,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html',
    sourceDocument: 'Pact/Equity Cinema Films Agreement 2024-2025',
    notes: 'Day Player daily: £611.80.' },
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'LEAD', tierCode: 'FILM_1_3',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-04-01', weeklyRate: 1127, dailyRate: 281.75, hourlyRate: 28.18,
    overtimeRate1x5: 42.26, overtimeRate2x: 94, sixthDayRate: 422.63, seventhDayRate: 563.50,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html',
    sourceDocument: 'Pact/Equity Cinema Films Agreement 2024-2025',
    notes: 'Base £644 + 75% uplift = £1,127/wk.' },
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'LEAD', tierCode: 'FILM_U1',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-04-01', weeklyRate: 966, dailyRate: 241.50, hourlyRate: 24.15,
    overtimeRate1x5: 36.23, overtimeRate2x: 94, sixthDayRate: 362.25, seventhDayRate: 483,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html',
    sourceDocument: 'Pact/Equity Cinema Films Agreement 2024-2025',
    notes: 'Base £644 + 50% uplift = £966/wk.' },

  // ════════════════════════════════════════════════════════════════════════
  // FAA — BACKGROUND ARTISTS (London 40-mile radius)
  // Source: castingcollective.co.uk/production/payrates (updated 04/03/2026)
  // ════════════════════════════════════════════════════════════════════════

  { unionCode: 'FAA', deptCode: 'BG', desigCode: 'BG_ART', tierCode: 'FILM_MMP',
    dealType: 'daily', guaranteedHoursPerWeek: 45, guaranteedHoursPerDay: 9,
    effectiveFrom: '2024-04-01', weeklyRate: 556.05, dailyRate: 111.21, hourlyRate: 12.36,
    overtimeRate1x5: 23.38, overtimeRate2x: 23.38, sixthDayRate: 166.82, seventhDayRate: 166.82,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.castingcollective.co.uk/production/payrates',
    sourceDocument: 'FAA/Pact Agreement 2024-2025',
    notes: 'Day £111.21, Night £166.82. OT £11.69/30min. Holiday pay £13.42 extra.' },
  { unionCode: 'FAA', deptCode: 'BG', desigCode: 'STAND_IN', tierCode: 'FILM_MMP',
    dealType: 'daily', guaranteedHoursPerWeek: 45, guaranteedHoursPerDay: 9,
    effectiveFrom: '2024-04-01', weeklyRate: 695.10, dailyRate: 139.02, hourlyRate: 15.45,
    overtimeRate1x5: 23.38, overtimeRate2x: 23.38, sixthDayRate: 208.53, seventhDayRate: 208.53,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.castingcollective.co.uk/production/payrates',
    sourceDocument: 'FAA/Pact Agreement 2024-2025',
    notes: 'Stand-in / Double Shift Call: £139.02/day.' },
  { unionCode: 'FAA', deptCode: 'WO', desigCode: 'WO_ART', tierCode: 'COMMERCIAL',
    dealType: 'daily', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-04-01', weeklyRate: 1250, dailyRate: 250, hourlyRate: 25,
    overtimeRate1x5: 50, overtimeRate2x: 70, sixthDayRate: 375, seventhDayRate: 500,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.castingcollective.co.uk/production/payrates',
    sourceDocument: 'Commercials/Corporate rates',
    notes: 'Walk-On: £250/day. Featured: £350/day. OT: £50-70/hr.' },

  // ════════════════════════════════════════════════════════════════════════
  // WGGB — SCREENWRITERS (FLAT FEES)
  // Source: writersguild.org.uk/rates-and-agreements
  // ════════════════════════════════════════════════════════════════════════

  { unionCode: 'WGGB', deptCode: 'SCRN', desigCode: 'SCRN_ORIG', tierCode: 'FILM_MMP',
    dealType: 'flat_fee', guaranteedHoursPerWeek: 0, guaranteedHoursPerDay: 0,
    effectiveFrom: '2024-04-01', weeklyRate: 42120, dailyRate: 42120, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://writersguild.org.uk/rates-and-agreements/',
    sourceDocument: 'WGGB Minimum Terms Agreement 2024',
    notes: 'Flat fee £42,120 for original screenplay (budget >£2m).' },
  { unionCode: 'WGGB', deptCode: 'SCRN', desigCode: 'SCRN_ORIG', tierCode: 'FILM_1_3',
    dealType: 'flat_fee', guaranteedHoursPerWeek: 0, guaranteedHoursPerDay: 0,
    effectiveFrom: '2024-04-01', weeklyRate: 25650, dailyRate: 25650, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://writersguild.org.uk/rates-and-agreements/',
    sourceDocument: 'WGGB Minimum Terms Agreement 2024',
    notes: 'Flat fee £25,650 (budget £750k-£2m).' },
  { unionCode: 'WGGB', deptCode: 'SCRN', desigCode: 'SCRN_ORIG', tierCode: 'FILM_U1',
    dealType: 'flat_fee', guaranteedHoursPerWeek: 0, guaranteedHoursPerDay: 0,
    effectiveFrom: '2024-04-01', weeklyRate: 18900, dailyRate: 18900, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://writersguild.org.uk/rates-and-agreements/',
    sourceDocument: 'WGGB Minimum Terms Agreement 2024',
    notes: 'Flat fee £18,900 (budget <£750k).' },
  { unionCode: 'WGGB', deptCode: 'SCRN', desigCode: 'SCRN_ADAPT', tierCode: 'FILM_MMP',
    dealType: 'flat_fee', guaranteedHoursPerWeek: 0, guaranteedHoursPerDay: 0,
    effectiveFrom: '2024-04-01', weeklyRate: 25650, dailyRate: 25650, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://writersguild.org.uk/rates-and-agreements/',
    sourceDocument: 'WGGB Minimum Terms Agreement 2024',
    notes: 'Adaptation screenplay £25,650.' },
];

// No auto-scaling. All rates above are verified from official sources.
// Departments not listed here (Sound, Lighting, Art, Costume, etc.) should be
// imported via Admin Rates → Import CSV using official rate card PDFs.
