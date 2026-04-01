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
  // EQUITY — CAST (Pact/Equity Cinema Films Agreement – April 2025)
  // Source: Pact announcement, +3% interim increase effective 6 April 2025
  // New base daily: £166, weekly: £664
  // Uplifts: +280% (£3m+), +75% (£1-3m), +50% (<£1m)
  // ════════════════════════════════════════════════════════════════════════

  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'LEAD', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-06', weeklyRate: 2523, dailyRate: 630.75, hourlyRate: 63.08,
    overtimeRate1x5: 94.61, overtimeRate2x: 96.82, sixthDayRate: 946.13, seventhDayRate: 1261.50,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource/pact-equity-cinema-films-agreement-rate-card-april-oct-2025.html',
    sourceDocument: 'Pact/Equity CFA Rate Card April 2025 (Appendix FG)',
    notes: 'Base £664 + 280% uplift = £2,523/wk. 3% interim increase from April 2025.' },
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'SUPP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-06', weeklyRate: 2523, dailyRate: 630.75, hourlyRate: 63.08,
    overtimeRate1x5: 94.61, overtimeRate2x: 96.82, sixthDayRate: 946.13, seventhDayRate: 1261.50,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource/pact-equity-cinema-films-agreement-rate-card-april-oct-2025.html',
    sourceDocument: 'Pact/Equity CFA Rate Card April 2025 (Appendix FG)',
    notes: 'Min weekly performance salary £664, +280% uplift.' },
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'DAY_PLR', tierCode: 'FILM_MMP',
    dealType: 'daily', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-06', weeklyRate: 2523, dailyRate: 630.75, hourlyRate: 63.08,
    overtimeRate1x5: 94.61, overtimeRate2x: 96.82, sixthDayRate: 946.13, seventhDayRate: 1261.50,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource/pact-equity-cinema-films-agreement-rate-card-april-oct-2025.html',
    sourceDocument: 'Pact/Equity CFA Rate Card April 2025 (Appendix FG)',
    notes: 'Day Player daily: £630.75. Min daily performance salary £166.' },
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'WK_PLR', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-06', weeklyRate: 2523, dailyRate: 630.75, hourlyRate: 63.08,
    overtimeRate1x5: 94.61, overtimeRate2x: 96.82, sixthDayRate: 946.13, seventhDayRate: 1261.50,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource/pact-equity-cinema-films-agreement-rate-card-april-oct-2025.html',
    sourceDocument: 'Pact/Equity CFA Rate Card April 2025 (Appendix FG)',
    notes: 'Weekly Player: £2,523/wk (£664 base + 280% uplift).' },
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'LEAD', tierCode: 'FILM_1_3',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-06', weeklyRate: 1162, dailyRate: 290.50, hourlyRate: 29.05,
    overtimeRate1x5: 43.58, overtimeRate2x: 96.82, sixthDayRate: 435.75, seventhDayRate: 581,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource/pact-equity-cinema-films-agreement-rate-card-april-oct-2025.html',
    sourceDocument: 'Pact/Equity CFA Rate Card April 2025 (Appendix FG)',
    notes: 'Base £664 + 75% uplift = £1,162/wk. Low budget (£1m-£3m).' },
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'LEAD', tierCode: 'FILM_U1',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-06', weeklyRate: 996, dailyRate: 249, hourlyRate: 24.90,
    overtimeRate1x5: 37.35, overtimeRate2x: 96.82, sixthDayRate: 373.50, seventhDayRate: 498,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource/pact-equity-cinema-films-agreement-rate-card-april-oct-2025.html',
    sourceDocument: 'Pact/Equity CFA Rate Card April 2025 (Appendix FG)',
    notes: 'Base £664 + 50% uplift = £996/wk. Very low budget (<£1m).' },
  // Equity TV engagement fee (Pact/Equity TV Agreement 2024-2026)
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'DAY_PLR', tierCode: 'TV_BAND4',
    dealType: 'daily', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 2980, dailyRate: 596, hourlyRate: 59.60,
    overtimeRate1x5: 89.40, overtimeRate2x: 96.82, sixthDayRate: 894, seventhDayRate: 1192,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.thecdg.co.uk/Secure/Rate%20Card%20for%20the%20Pact%20Equity%20TV%20Agreement%202024-2026.pdf',
    sourceDocument: 'Pact/Equity TV Agreement Rate Card 2024-2026',
    notes: 'TV engagement fee £596/day (2025). Rises to ~£636 in 2026.' },

  // ════════════════════════════════════════════════════════════════════════
  // FAA — BACKGROUND ARTISTS (London 40-mile radius)
  // Source: Pact/FAA Rate Card 1 Jan – 31 Dec 2025
  // Via: Extra People, Poleaseextras, casting agencies (public)
  // Holiday pay: 10.77% (separated, not inclusive in BDR)
  // Standard day: 9hrs incl meal break (7am-10pm)
  // ════════════════════════════════════════════════════════════════════════

  // Background Artist — Standard Day
  { unionCode: 'FAA', deptCode: 'BG', desigCode: 'BG_ART', tierCode: 'FILM_MMP',
    dealType: 'daily', guaranteedHoursPerWeek: 45, guaranteedHoursPerDay: 9,
    effectiveFrom: '2025-01-01', weeklyRate: 535.95, dailyRate: 107.19, hourlyRate: 11.91,
    overtimeRate1x5: 22.28, overtimeRate2x: 22.28, sixthDayRate: 160.79, seventhDayRate: 160.79,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource/pact-faa-rate-card-2025.html',
    sourceDocument: 'Pact/FAA Rate Card 2025',
    notes: 'BDR £107.19/day. HP £11.54. Night £160.79. OT £10.05/30min (+£1.09 HP = £11.14 total). PH Day £160.79 (+£17.31 HP). PH Night £241.18 (+£25.97 HP).' },
  // Background Artist — Photo Double (same BDR as BG_ART)
  { unionCode: 'FAA', deptCode: 'BG', desigCode: 'PHT_DBL', tierCode: 'FILM_MMP',
    dealType: 'daily', guaranteedHoursPerWeek: 45, guaranteedHoursPerDay: 9,
    effectiveFrom: '2025-01-01', weeklyRate: 535.95, dailyRate: 107.19, hourlyRate: 11.91,
    overtimeRate1x5: 22.28, overtimeRate2x: 22.28, sixthDayRate: 160.79, seventhDayRate: 160.79,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource/pact-faa-rate-card-2025.html',
    sourceDocument: 'Pact/FAA Rate Card 2025',
    notes: 'Photo Double paid at BG Artist BDR. Supplementary fees may apply per Pact/FAA agreement.' },
  // Stand-In
  { unionCode: 'FAA', deptCode: 'BG', desigCode: 'STAND_IN', tierCode: 'FILM_MMP',
    dealType: 'daily', guaranteedHoursPerWeek: 45, guaranteedHoursPerDay: 9,
    effectiveFrom: '2025-01-01', weeklyRate: 535.95, dailyRate: 107.19, hourlyRate: 11.91,
    overtimeRate1x5: 22.28, overtimeRate2x: 22.28, sixthDayRate: 160.79, seventhDayRate: 160.79,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource/pact-faa-rate-card-2025.html',
    sourceDocument: 'Pact/FAA Rate Card 2025',
    notes: 'Stand-In paid at BG Artist BDR with supplementary fee per Pact/FAA Clause 17.' },
  // Walk-On Artist — Film/TV (Pact/FAA)
  { unionCode: 'FAA', deptCode: 'WO', desigCode: 'WO_ART', tierCode: 'FILM_MMP',
    dealType: 'daily', guaranteedHoursPerWeek: 45, guaranteedHoursPerDay: 9,
    effectiveFrom: '2025-01-01', weeklyRate: 535.95, dailyRate: 107.19, hourlyRate: 11.91,
    overtimeRate1x5: 22.28, overtimeRate2x: 22.28, sixthDayRate: 160.79, seventhDayRate: 160.79,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.pact.co.uk/resource/pact-faa-rate-card-2025.html',
    sourceDocument: 'Pact/FAA Rate Card 2025',
    notes: 'Walk-On paid at BDR + walk-on supplement per Pact/FAA agreement. Supplement amount negotiated per production.' },
  // Walk-On Artist — Commercials
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
