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
// BECTU DEPARTMENT PDFs (extracted from union.bectu.org.uk):
//   ADs: Assistant Directors' Branch rate card 2024 — MMP 50hr minimum
//   Construction: PACT/Bectu Construction Rate Card for MMP April 2021 (as amended 1 Apr 2025)
//   Costume: BECTU Costume Dept Film Rate Card July 2023 — MMP (£30m+) 50hr starting rate
//   Grips: Grips Branch rate card 2024 — Feature Films £30m+
//   Locations: Locations Branch Film & Scripted TV rate card 2026 — Major Feature Film £30mil+
//   Post Production: Post-Production & Facilities Branch Rate Card 2023-2024 — Premium (£30M+)
//   Production Office: LPD Production TV — Band 4 (£7m+) minimum rate (50hr)
//   Props: Film & TV Props Dept 2025/26 Rates — Film £30 million+
//   SFX: Special Effects Rate Card 2025 — 11hr SWD day
//   Unit Drivers: BECTU Production Transport — High Budget (£3m+) TV Drama
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

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — ASSISTANT DIRECTORS (MMP £30m+)
  // Source: Assistant Directors' Branch rate card 2024
  // MMP column, 50hr minimum rates. Rates EXCLUDE holiday pay (add 12.07%).
  // For 55hr deals, add 10% to the 50hr rate.
  // ════════════════════════════════════════════════════════════════════════

  // 1st Assistant Director — MMP 50hr minimum: £4,255
  { unionCode: 'BECTU', deptCode: 'AD', desigCode: '1AD', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 4255, dailyRate: 851, hourlyRate: 85.10,
    overtimeRate1x5: 127.65, overtimeRate2x: 170.20, sixthDayRate: 851, seventhDayRate: 851,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/ads.html',
    sourceDocument: "Assistant Directors' Branch rate card 2024",
    notes: 'MMP 50hr minimum £4,255. Excludes holiday pay (add 12.07%). For 55hr deals add 10%.' },

  // 2nd Assistant Director (Key) — MMP 50hr minimum: £2,365
  { unionCode: 'BECTU', deptCode: 'AD', desigCode: '2AD', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 2365, dailyRate: 473, hourlyRate: 47.30,
    overtimeRate1x5: 70.95, overtimeRate2x: 94.60, sixthDayRate: 473, seventhDayRate: 473,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/ads.html',
    sourceDocument: "Assistant Directors' Branch rate card 2024",
    notes: 'MMP 50hr minimum £2,365 (Key 2nd AD). Excludes holiday pay (add 12.07%).' },

  // 2nd Assistant Director (Crowd) — MMP 50hr minimum: £2,005
  { unionCode: 'BECTU', deptCode: 'AD', desigCode: 'CRD_AD', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 2005, dailyRate: 401, hourlyRate: 40.10,
    overtimeRate1x5: 60.15, overtimeRate2x: 80.20, sixthDayRate: 401, seventhDayRate: 401,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/ads.html',
    sourceDocument: "Assistant Directors' Branch rate card 2024",
    notes: 'MMP 50hr minimum £2,005 (Crowd 2nd AD). Excludes holiday pay (add 12.07%).' },

  // 3rd Assistant Director — MMP 50hr minimum: £1,300
  { unionCode: 'BECTU', deptCode: 'AD', desigCode: '3AD', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 1300, dailyRate: 260, hourlyRate: 26,
    overtimeRate1x5: 39, overtimeRate2x: 52, sixthDayRate: 260, seventhDayRate: 260,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/ads.html',
    sourceDocument: "Assistant Directors' Branch rate card 2024",
    notes: 'MMP 50hr minimum £1,300. Excludes holiday pay (add 12.07%).' },

  // AD Runner — MMP 50hr minimum: £650
  { unionCode: 'BECTU', deptCode: 'AD', desigCode: 'FLR_RUN', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 650, dailyRate: 130, hourlyRate: 13,
    overtimeRate1x5: 19.50, overtimeRate2x: 26, sixthDayRate: 130, seventhDayRate: 130,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/ads.html',
    sourceDocument: "Assistant Directors' Branch rate card 2024",
    notes: 'AD Runner MMP 50hr minimum £650. Excludes holiday pay (add 12.07%).' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — CONSTRUCTION (MMP £30m+)
  // Source: PACT/Bectu Construction Rate Card for MMP April 2021 (as amended)
  // Net weekly rates effective 1 April 2025 to 31 March 2026.
  // Holiday pay is separate at 10.77%. Gross weekly = net + 10.77%.
  // OT at 1.5T net hourly rate, capped. 6th day = T1/3, 7th day = T1/2.
  // ════════════════════════════════════════════════════════════════════════

  // HoD Carpenter — Net weekly £2,407.60 (gross £2,666.90)
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'HOD_CARP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-01', weeklyRate: 2407.60, dailyRate: 481.52, hourlyRate: 48.15,
    overtimeRate1x5: 67.50, overtimeRate2x: 67.50, sixthDayRate: 642.03, seventhDayRate: 722.28,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/construction.html',
    sourceDocument: 'PACT/Bectu Construction Rate Card for MMP April 2021 (as amended 1 Apr 2025)',
    notes: 'Net weekly £2,407.60. Holiday pay 10.77% (£259.30) extra = gross £2,666.90. OT capped at £67.50/hr.' },

  // Supervising Carpenter — Net weekly £2,043.15
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'SUP_CARP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-01', weeklyRate: 2043.15, dailyRate: 408.63, hourlyRate: 40.86,
    overtimeRate1x5: 67.50, overtimeRate2x: 67.50, sixthDayRate: 544.84, seventhDayRate: 612.95,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/construction.html',
    sourceDocument: 'PACT/Bectu Construction Rate Card for MMP April 2021 (as amended 1 Apr 2025)',
    notes: 'Net weekly £2,043.15. Holiday pay 10.77% extra. OT capped at £67.50/hr.' },

  // Chargehand Carpenter — Net weekly £1,687.20
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'CHG_CARP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-01', weeklyRate: 1687.20, dailyRate: 337.44, hourlyRate: 33.74,
    overtimeRate1x5: 67, overtimeRate2x: 67, sixthDayRate: 449.92, seventhDayRate: 506.16,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/construction.html',
    sourceDocument: 'PACT/Bectu Construction Rate Card for MMP April 2021 (as amended 1 Apr 2025)',
    notes: 'Net weekly £1,687.20. Holiday pay 10.77% extra. OT capped at £67/hr.' },

  // Carpenter — Net weekly £1,429.80
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'CARP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-01', weeklyRate: 1429.80, dailyRate: 285.96, hourlyRate: 28.60,
    overtimeRate1x5: 57.19, overtimeRate2x: 57.19, sixthDayRate: 381.28, seventhDayRate: 428.94,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/construction.html',
    sourceDocument: 'PACT/Bectu Construction Rate Card for MMP April 2021 (as amended 1 Apr 2025)',
    notes: 'Net weekly £1,429.80. Holiday pay 10.77% extra. OT capped at £57.19/hr.' },

  // HoD Painter — same as HoD Carpenter: Net weekly £2,407.60
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'HOD_PAINT', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-01', weeklyRate: 2407.60, dailyRate: 481.52, hourlyRate: 48.15,
    overtimeRate1x5: 67.50, overtimeRate2x: 67.50, sixthDayRate: 642.03, seventhDayRate: 722.28,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/construction.html',
    sourceDocument: 'PACT/Bectu Construction Rate Card for MMP April 2021 (as amended 1 Apr 2025)',
    notes: 'HoD Painter. Same rate as HoD Carpenter. Net weekly £2,407.60.' },

  // Supervising Painter — Net weekly £2,043.15
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'SUP_PAINT', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-01', weeklyRate: 2043.15, dailyRate: 408.63, hourlyRate: 40.86,
    overtimeRate1x5: 67.50, overtimeRate2x: 67.50, sixthDayRate: 544.84, seventhDayRate: 612.95,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/construction.html',
    sourceDocument: 'PACT/Bectu Construction Rate Card for MMP April 2021 (as amended 1 Apr 2025)',
    notes: 'Supervising Painter. Net weekly £2,043.15.' },

  // Scenic Painter — same rate as Chargehand: Net weekly £1,687.20
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'SCN_PAINT', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-01', weeklyRate: 1687.20, dailyRate: 337.44, hourlyRate: 33.74,
    overtimeRate1x5: 67, overtimeRate2x: 67, sixthDayRate: 449.92, seventhDayRate: 506.16,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/construction.html',
    sourceDocument: 'PACT/Bectu Construction Rate Card for MMP April 2021 (as amended 1 Apr 2025)',
    notes: 'Scenic Painter aligned with Chargehand rate. Net weekly £1,687.20.' },

  // Painter — Net weekly £1,429.80
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'PAINT', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-01', weeklyRate: 1429.80, dailyRate: 285.96, hourlyRate: 28.60,
    overtimeRate1x5: 57.19, overtimeRate2x: 57.19, sixthDayRate: 381.28, seventhDayRate: 428.94,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/construction.html',
    sourceDocument: 'PACT/Bectu Construction Rate Card for MMP April 2021 (as amended 1 Apr 2025)',
    notes: 'Painter. Net weekly £1,429.80.' },

  // HoD Plasterer — same as all HoDs: Net weekly £2,407.60
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'HOD_PLST', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-01', weeklyRate: 2407.60, dailyRate: 481.52, hourlyRate: 48.15,
    overtimeRate1x5: 67.50, overtimeRate2x: 67.50, sixthDayRate: 642.03, seventhDayRate: 722.28,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/construction.html',
    sourceDocument: 'PACT/Bectu Construction Rate Card for MMP April 2021 (as amended 1 Apr 2025)',
    notes: 'HoD Plasterer. Same rate as all HoDs. Net weekly £2,407.60.' },

  // Plasterer — Net weekly £1,429.80
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'PLST', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-01', weeklyRate: 1429.80, dailyRate: 285.96, hourlyRate: 28.60,
    overtimeRate1x5: 57.19, overtimeRate2x: 57.19, sixthDayRate: 381.28, seventhDayRate: 428.94,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/construction.html',
    sourceDocument: 'PACT/Bectu Construction Rate Card for MMP April 2021 (as amended 1 Apr 2025)',
    notes: 'Plasterer. Net weekly £1,429.80.' },

  // Stagehand — Net weekly £1,314.85
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'STGHND', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-04-01', weeklyRate: 1314.85, dailyRate: 262.97, hourlyRate: 26.30,
    overtimeRate1x5: 52.59, overtimeRate2x: 52.59, sixthDayRate: 350.63, seventhDayRate: 394.46,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/construction.html',
    sourceDocument: 'PACT/Bectu Construction Rate Card for MMP April 2021 (as amended 1 Apr 2025)',
    notes: 'Stagehand (standard, not NVQ/BLSS). Net weekly £1,314.85. OT capped £52.59/hr.' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — COSTUME (MMP £30m+)
  // Source: BECTU Costume Dept Film Rate Card July 2023
  // MMP (£30m+) 50hr week, Starting rate. All rates INCLUDE holiday pay.
  // ════════════════════════════════════════════════════════════════════════

  // Costume Designer — own negotiation at MMP
  { unionCode: 'BECTU', deptCode: 'COS', desigCode: 'COS_DES', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-07-01', weeklyRate: 0, dailyRate: 0, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/costume-film.html',
    sourceDocument: 'BECTU Costume Dept Film Rate Card July 2023',
    notes: 'Costume Designer is own negotiation at MMP tier. Rate set to 0.' },

  // Costume Supervisor — MMP 50hr starting £2,650.50 (inc hols)
  { unionCode: 'BECTU', deptCode: 'COS', desigCode: 'COS_SUP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-07-01', weeklyRate: 2650.50, dailyRate: 530.10, hourlyRate: 53.01,
    overtimeRate1x5: 79.52, overtimeRate2x: 81, sixthDayRate: 530.10, seventhDayRate: 530.10,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/costume-film.html',
    sourceDocument: 'BECTU Costume Dept Film Rate Card July 2023',
    notes: 'MMP 50hr starting £2,650.50 inc hols. Experienced £3,141.50. Camera OT £81, Dept OT £79.52.' },

  // Assistant Costume Designer — MMP 50hr starting £1,963 (inc hols)
  { unionCode: 'BECTU', deptCode: 'COS', desigCode: 'AST_COS', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-07-01', weeklyRate: 1963, dailyRate: 392.60, hourlyRate: 39.26,
    overtimeRate1x5: 58.89, overtimeRate2x: 78.52, sixthDayRate: 392.60, seventhDayRate: 392.60,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/costume-film.html',
    sourceDocument: 'BECTU Costume Dept Film Rate Card July 2023',
    notes: 'MMP 50hr starting £1,963 inc hols. Experienced £2,250. Camera OT £78.52, Dept OT £58.89.' },

  // Costume Standby (Assistant Costume Supervisor) — MMP 50hr starting £1,934 (inc hols)
  { unionCode: 'BECTU', deptCode: 'COS', desigCode: 'COS_STBY', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-07-01', weeklyRate: 1934, dailyRate: 386.80, hourlyRate: 38.68,
    overtimeRate1x5: 58.02, overtimeRate2x: 77.36, sixthDayRate: 386.80, seventhDayRate: 386.80,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/costume-film.html',
    sourceDocument: 'BECTU Costume Dept Film Rate Card July 2023',
    notes: 'Assistant Costume Supervisor / Costume Standby. MMP 50hr starting £1,934 inc hols. Experienced £2,200.' },

  // 2nd Assistant Costume Designer (Costume Daily/Dresser) — MMP 50hr starting £1,717.50 (inc hols)
  { unionCode: 'BECTU', deptCode: 'COS', desigCode: 'COS_DRS', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-07-01', weeklyRate: 1717.50, dailyRate: 343.50, hourlyRate: 34.35,
    overtimeRate1x5: 51.53, overtimeRate2x: 68.70, sixthDayRate: 343.50, seventhDayRate: 343.50,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/costume-film.html',
    sourceDocument: 'BECTU Costume Dept Film Rate Card July 2023',
    notes: '2nd Asst Costume Designer. MMP 50hr starting £1,717.50 inc hols. Experienced £1,963.' },

  // Junior Asst Costume Designer (Costume Trainee) — MMP 50hr starting £913 (inc hols)
  { unionCode: 'BECTU', deptCode: 'COS', desigCode: 'COS_TRN', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-07-01', weeklyRate: 913, dailyRate: 182.60, hourlyRate: 18.26,
    overtimeRate1x5: 27.39, overtimeRate2x: 36.52, sixthDayRate: 182.60, seventhDayRate: 182.60,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/costume-film.html',
    sourceDocument: 'BECTU Costume Dept Film Rate Card July 2023',
    notes: 'Junior Asst Costume Designer. MMP 50hr starting £913 inc hols. Experienced £1,104.' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — GRIP (MMP £30m+)
  // Source: Grips Branch rate card 2024 — Feature Films £30m+
  // Film rates are based on 11hrs work + 1hr lunch (55hr equivalent).
  // Rates exclude holiday pay.
  // ════════════════════════════════════════════════════════════════════════

  // Key Grip — Individually negotiated
  { unionCode: 'BECTU', deptCode: 'GRP', desigCode: 'KEY_GRP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 0, dailyRate: 0, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/grips.html',
    sourceDocument: 'Grips Branch rate card 2024',
    notes: 'Key Grip is individually negotiated at all tiers.' },

  // Best Boy Grip — £30m+: weekly £2,820, daily £564, hourly £56
  { unionCode: 'BECTU', deptCode: 'GRP', desigCode: 'BB_GRP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 2820, dailyRate: 564, hourlyRate: 56,
    overtimeRate1x5: 84, overtimeRate2x: 112, sixthDayRate: 564, seventhDayRate: 564,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/grips.html',
    sourceDocument: 'Grips Branch rate card 2024',
    notes: 'Best Boy Grip MMP £30m+. Weekly £2,820, daily £564, hourly £56. Excludes holiday pay.' },

  // Dolly Grip (A Cam Grip) — £30m+: weekly £2,705, daily £541, hourly £54
  { unionCode: 'BECTU', deptCode: 'GRP', desigCode: 'DLY_GRP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 2705, dailyRate: 541, hourlyRate: 54,
    overtimeRate1x5: 81, overtimeRate2x: 108, sixthDayRate: 541, seventhDayRate: 541,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/grips.html',
    sourceDocument: 'Grips Branch rate card 2024',
    notes: 'A Cam Grip / Dolly Grip MMP £30m+. Weekly £2,705, daily £541, hourly £54. Excludes holiday pay.' },

  // Grip — £30m+: weekly £2,535, daily £507, hourly £51
  { unionCode: 'BECTU', deptCode: 'GRP', desigCode: 'GRP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 2535, dailyRate: 507, hourlyRate: 51,
    overtimeRate1x5: 76.50, overtimeRate2x: 102, sixthDayRate: 507, seventhDayRate: 507,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/grips.html',
    sourceDocument: 'Grips Branch rate card 2024',
    notes: 'Grip MMP £30m+. Weekly £2,535, daily £507, hourly £51. Excludes holiday pay.' },

  // Grip Trainee — not listed on Grips rate card; using Grip rate minus standard trainee discount
  { unionCode: 'BECTU', deptCode: 'GRP', desigCode: 'GRP_TRN', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 0, dailyRate: 0, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: false,
    sourceUrl: 'https://union.bectu.org.uk/resource/grips.html',
    sourceDocument: 'Grips Branch rate card 2024',
    notes: 'Grip Trainee not listed on official rate card. Set to 0 — negotiate individually.' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — ART DEPARTMENT (MMP £30m+) — VERIFIED from official BFDG PDF
  // Source: britishfilmdesigners.com/wp-content/uploads/2026/01/FILM-TV-ART-DEPT-2025-RATE-CARD.pdf
  // 3+ Year Minimum rates used (standard for experienced crew)
  // Art Dept self-schedules at 9+1 (not 11+1). Car allowance £150/week extra.
  // ════════════════════════════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'PROD_DES', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 3895, dailyRate: 779, hourlyRate: 71,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 779, seventhDayRate: 779,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://britishfilmdesigners.com/wp-content/uploads/2026/01/FILM-TV-ART-DEPT-2025-RATE-CARD.pdf',
    sourceDocument: 'BFDG/BECTU Art Dept Film Rate Card 2025-2026',
    notes: 'Supervising Art Director 3+ yr rate. Set Decorator same rate. Art Dept 9+1 self-scheduled.' },
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'SUP_AD', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 3895, dailyRate: 779, hourlyRate: 71,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 779, seventhDayRate: 779,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://britishfilmdesigners.com/wp-content/uploads/2026/01/FILM-TV-ART-DEPT-2025-RATE-CARD.pdf',
    sourceDocument: 'BFDG/BECTU Art Dept Film Rate Card 2025-2026',
    notes: 'Supervising Art Director 3+ yr MMP rate.' },
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'ART_DIR', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 2670, dailyRate: 534, hourlyRate: 49,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 534, seventhDayRate: 534,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://britishfilmdesigners.com/wp-content/uploads/2026/01/FILM-TV-ART-DEPT-2025-RATE-CARD.pdf',
    sourceDocument: 'BFDG/BECTU Art Dept Film Rate Card 2025-2026',
    notes: 'Art Director / VFX Art Dir / Set Dec Art Dir 3+ yr MMP rate.' },
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'AST_AD', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 2115, dailyRate: 423, hourlyRate: 38,
    overtimeRate1x5: 58, overtimeRate2x: 58, sixthDayRate: 423, seventhDayRate: 423,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://britishfilmdesigners.com/wp-content/uploads/2026/01/FILM-TV-ART-DEPT-2025-RATE-CARD.pdf',
    sourceDocument: 'BFDG/BECTU Art Dept Film Rate Card 2025-2026',
    notes: 'Assistant Art Director 3+ yr MMP rate.' },
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'SET_DEC', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 3895, dailyRate: 779, hourlyRate: 71,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 779, seventhDayRate: 779,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://britishfilmdesigners.com/wp-content/uploads/2026/01/FILM-TV-ART-DEPT-2025-RATE-CARD.pdf',
    sourceDocument: 'BFDG/BECTU Art Dept Film Rate Card 2025-2026',
    notes: 'Set Decorator 3+ yr MMP rate. Same as Supervising Art Director.' },
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'ART_AST', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 1030, dailyRate: 206, hourlyRate: 19,
    overtimeRate1x5: 28, overtimeRate2x: 28, sixthDayRate: 206, seventhDayRate: 206,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://britishfilmdesigners.com/wp-content/uploads/2026/01/FILM-TV-ART-DEPT-2025-RATE-CARD.pdf',
    sourceDocument: 'BFDG/BECTU Art Dept Film Rate Card 2025-2026',
    notes: 'Art Dept / Set Dec Assistant 3+ yr MMP rate.' },
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'ART_TRN', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2025-01-01', weeklyRate: 795, dailyRate: 159, hourlyRate: 14,
    overtimeRate1x5: 22, overtimeRate2x: 22, sixthDayRate: 159, seventhDayRate: 159,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://britishfilmdesigners.com/wp-content/uploads/2026/01/FILM-TV-ART-DEPT-2025-RATE-CARD.pdf',
    sourceDocument: 'BFDG/BECTU Art Dept Film Rate Card 2025-2026',
    notes: 'Art Dept / Set Dec Trainee. Flat rate across all tiers.' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — LOCATIONS (MMP £30mil+)
  // Source: Locations Branch Film & Scripted TV rate card 2026
  // Major Feature Film column, 55hr week (film uses 11+1 day), Starting rate.
  // Rates exclude holiday pay.
  // ════════════════════════════════════════════════════════════════════════

  // Supervising Location Manager — MMP 55hr starting: £2,990
  { unionCode: 'BECTU', deptCode: 'LOC', desigCode: 'SUP_LOC', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2026-01-01', weeklyRate: 2990, dailyRate: 598, hourlyRate: 54.36,
    overtimeRate1x5: 81.54, overtimeRate2x: 108.72, sixthDayRate: 598, seventhDayRate: 598,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/locations.html',
    sourceDocument: 'Locations Branch Film & Scripted TV rate card 2026',
    notes: 'SLM MMP 55hr starting £2,990. Hourly £54.36. Excludes holiday pay. By negotiation for experienced rate.' },

  // Location Manager — MMP 55hr starting: £2,090
  { unionCode: 'BECTU', deptCode: 'LOC', desigCode: 'LOC_MGR', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2026-01-01', weeklyRate: 2090, dailyRate: 418, hourlyRate: 38,
    overtimeRate1x5: 57, overtimeRate2x: 76, sixthDayRate: 418, seventhDayRate: 418,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/locations.html',
    sourceDocument: 'Locations Branch Film & Scripted TV rate card 2026',
    notes: 'LM MMP 55hr starting £2,090. Recommended experienced £2,670. LM rates with SLM above.' },

  // Unit Manager — MMP 55hr starting: £1,715
  { unionCode: 'BECTU', deptCode: 'LOC', desigCode: 'UNIT_MGR', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2026-01-01', weeklyRate: 1715, dailyRate: 343, hourlyRate: 31.18,
    overtimeRate1x5: 46.77, overtimeRate2x: 62.36, sixthDayRate: 343, seventhDayRate: 343,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/locations.html',
    sourceDocument: 'Locations Branch Film & Scripted TV rate card 2026',
    notes: 'Unit Manager MMP 55hr starting £1,715. Recommended experienced £2,145.' },

  // Location Scout — MMP 55hr starting: £1,830
  { unionCode: 'BECTU', deptCode: 'LOC', desigCode: 'LOC_SCT', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2026-01-01', weeklyRate: 1830, dailyRate: 366, hourlyRate: 33.27,
    overtimeRate1x5: 49.91, overtimeRate2x: 66.54, sixthDayRate: 366, seventhDayRate: 366,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/locations.html',
    sourceDocument: 'Locations Branch Film & Scripted TV rate card 2026',
    notes: 'Location Scout MMP 55hr starting £1,830. Recommended experienced £2,265.' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — POST PRODUCTION (MMP £30M+)
  // Source: Post-Production & Facilities Branch Rate Card 2023-2024
  // Feature Film rates — Premium (£30M AND OVER) column.
  // Rates based on 55hr week (base x 55). Excludes holiday pay.
  // Editor at Premium tier is "Negotiate".
  // ════════════════════════════════════════════════════════════════════════

  // Editor — Negotiate at Premium £30M+
  { unionCode: 'BECTU', deptCode: 'POST', desigCode: 'EDITOR', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-01-01', weeklyRate: 0, dailyRate: 0, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/post-film.html',
    sourceDocument: 'Post-Production & Facilities Branch Rate Card 2023-2024',
    notes: 'Editor at Premium (£30M+) is Negotiate. Medium budget (£5-15M): £3,220/55hr wk.' },

  // Assembly Editor — Premium £30M+: £3,220/55hr (£58.55/hr)
  { unionCode: 'BECTU', deptCode: 'POST', desigCode: 'ASM_ED', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-01-01', weeklyRate: 3220, dailyRate: 644, hourlyRate: 58.55,
    overtimeRate1x5: 87.83, overtimeRate2x: 117.10, sixthDayRate: 644, seventhDayRate: 644,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/post-film.html',
    sourceDocument: 'Post-Production & Facilities Branch Rate Card 2023-2024',
    notes: 'Additional/Assembly Editor. Premium (£30M+): £58.55/hr, £644/11hr day, £3,220/55hr wk.' },

  // VFX Editor — Premium £30M+: £2,610/55hr (£47.45/hr)
  { unionCode: 'BECTU', deptCode: 'POST', desigCode: 'VFX_ED', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-01-01', weeklyRate: 2610, dailyRate: 522, hourlyRate: 47.45,
    overtimeRate1x5: 71.18, overtimeRate2x: 94.90, sixthDayRate: 522, seventhDayRate: 522,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/post-film.html',
    sourceDocument: 'Post-Production & Facilities Branch Rate Card 2023-2024',
    notes: 'VFX Editor. Premium (£30M+): £47.45/hr, £522/11hr day, £2,610/55hr wk.' },

  // 1st Assistant Editor — Premium £30M+: £2,460/55hr (£44.73/hr)
  { unionCode: 'BECTU', deptCode: 'POST', desigCode: 'AST_ED', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-01-01', weeklyRate: 2460, dailyRate: 492, hourlyRate: 44.73,
    overtimeRate1x5: 67.10, overtimeRate2x: 89.46, sixthDayRate: 492, seventhDayRate: 492,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/post-film.html',
    sourceDocument: 'Post-Production & Facilities Branch Rate Card 2023-2024',
    notes: '1st Assistant Editor. Premium (£30M+): £44.73/hr, £492/11hr day, £2,460/55hr wk.' },

  // Post Production Trainee (Editorial Trainee) — Premium £30M+: £18.91/hr
  { unionCode: 'BECTU', deptCode: 'POST', desigCode: 'POST_TRN', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-01-01', weeklyRate: 1040, dailyRate: 208, hourlyRate: 18.91,
    overtimeRate1x5: 28.37, overtimeRate2x: 37.82, sixthDayRate: 208, seventhDayRate: 208,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/post-film.html',
    sourceDocument: 'Post-Production & Facilities Branch Rate Card 2023-2024',
    notes: 'Editorial Trainee. Premium (£30M+): £18.91/hr. Weekly = £18.91 x 55 = £1,040 (55hr); shown as 50hr equivalent.' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — PRODUCTION OFFICE (MMP / Band 4 £7m+)
  // Source: LPD Production TV rate card
  // Band 4 (£7m+) minimum rate, 50hr week (5 x 10hr + 1hr lunch).
  // TV card used as closest official source for prod office.
  // Film MMP rates typically negotiated above these minimums.
  // ════════════════════════════════════════════════════════════════════════

  // Production Manager — Band 4 MR: £2,600/50hr
  { unionCode: 'BECTU', deptCode: 'PROD', desigCode: 'PROD_MGR', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 2600, dailyRate: 520, hourlyRate: 52,
    overtimeRate1x5: 78, overtimeRate2x: 104, sixthDayRate: 520, seventhDayRate: 520,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/production.html',
    sourceDocument: 'LPD Production TV rate card',
    notes: 'Production Manager Band 4 (£7m+) minimum £2,600/50hr wk. Recommended £2,850. 55hr: £2,860.' },

  // Production Coordinator — Band 4 MR: £1,875/50hr
  { unionCode: 'BECTU', deptCode: 'PROD', desigCode: 'PROD_COO', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 1875, dailyRate: 375, hourlyRate: 37.50,
    overtimeRate1x5: 56.25, overtimeRate2x: 75, sixthDayRate: 375, seventhDayRate: 375,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/production.html',
    sourceDocument: 'LPD Production TV rate card',
    notes: 'Production Coordinator Band 4 (£7m+) minimum £1,875/50hr wk. Recommended £2,300.' },

  // Assistant Production Coordinator — Band 4 MR: £1,275/50hr
  { unionCode: 'BECTU', deptCode: 'PROD', desigCode: 'AST_COO', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 1275, dailyRate: 255, hourlyRate: 25.50,
    overtimeRate1x5: 38.25, overtimeRate2x: 51, sixthDayRate: 255, seventhDayRate: 255,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/production.html',
    sourceDocument: 'LPD Production TV rate card',
    notes: 'Asst Production Coordinator Band 4 (£7m+) minimum £1,275/50hr wk. Recommended £1,425.' },

  // Production Secretary — Band 4 MR: £1,000/50hr
  { unionCode: 'BECTU', deptCode: 'PROD', desigCode: 'PROD_SEC', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 1000, dailyRate: 200, hourlyRate: 20,
    overtimeRate1x5: 30, overtimeRate2x: 40, sixthDayRate: 200, seventhDayRate: 200,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/production.html',
    sourceDocument: 'LPD Production TV rate card',
    notes: 'Production Secretary Band 4 (£7m+) minimum £1,000/50hr wk. Recommended £1,100.' },

  // Production Accountant — not on Production TV card; keeping as approximate
  { unionCode: 'BECTU', deptCode: 'PROD', desigCode: 'PROD_ACC', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 3800, dailyRate: 760, hourlyRate: 69,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 760, seventhDayRate: 760,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/',
    sourceDocument: 'BECTU Production (approximate)',
    notes: 'Production Accountant not on the LPD Production TV card. Approximate rate retained.' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — PROPS (MMP £30m+)
  // Source: Film & TV Props Department 2025/26 Rates
  // Film Rates, £30 million+ column. 5-day week recommended rates.
  // Rates INCLUDE holiday pay at 12.07%.
  // ════════════════════════════════════════════════════════════════════════

  // Property Master — Negotiable at MMP
  { unionCode: 'BECTU', deptCode: 'PRP', desigCode: 'PROP_MST', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 0, dailyRate: 0, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/props.html',
    sourceDocument: 'Film & TV Props Department 2025/26 Rates',
    notes: 'Property Master is Negotiable at MMP tier (£30m+). Rate set to 0.' },

  // Standby Props — MMP: £1,850/wk, £370/day (inc holiday pay)
  { unionCode: 'BECTU', deptCode: 'PRP', desigCode: 'STBY_PRP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 1850, dailyRate: 370, hourlyRate: 37,
    overtimeRate1x5: 55.50, overtimeRate2x: 74, sixthDayRate: 370, seventhDayRate: 370,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/props.html',
    sourceDocument: 'Film & TV Props Department 2025/26 Rates',
    notes: 'Standby Props MMP: £370/day, £1,850/wk. Inc holiday pay 12.07%.' },

  // Props Buyer (Supervising Chargehand Props) — MMP: £2,000/wk, £400/day (inc holiday pay)
  { unionCode: 'BECTU', deptCode: 'PRP', desigCode: 'PRP_BUY', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 2000, dailyRate: 400, hourlyRate: 40,
    overtimeRate1x5: 60, overtimeRate2x: 80, sixthDayRate: 400, seventhDayRate: 400,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/props.html',
    sourceDocument: 'Film & TV Props Department 2025/26 Rates',
    notes: 'Supervising Chargehand Props / Storeperson. MMP: £400/day, £2,000/wk. Inc holiday pay.' },

  // Chargehand Props — MMP: £1,850/wk, £370/day (inc holiday pay)
  { unionCode: 'BECTU', deptCode: 'PRP', desigCode: 'CHG_PRP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 1850, dailyRate: 370, hourlyRate: 37,
    overtimeRate1x5: 55.50, overtimeRate2x: 74, sixthDayRate: 370, seventhDayRate: 370,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/props.html',
    sourceDocument: 'Film & TV Props Department 2025/26 Rates',
    notes: 'Chargehand Props MMP: £370/day, £1,850/wk. Inc holiday pay 12.07%.' },

  // Props Hand / Dressing Props — MMP: £1,650/wk, £330/day (inc holiday pay)
  { unionCode: 'BECTU', deptCode: 'PRP', desigCode: 'PRP_HND', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 1650, dailyRate: 330, hourlyRate: 33,
    overtimeRate1x5: 49.50, overtimeRate2x: 66, sixthDayRate: 330, seventhDayRate: 330,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/props.html',
    sourceDocument: 'Film & TV Props Department 2025/26 Rates',
    notes: 'Prop Hand MMP: £330/day, £1,650/wk. Inc holiday pay 12.07%.' },

  // Props Maker — MMP: same as Prop Hand £1,650/wk (Prop Coordinator same rate)
  { unionCode: 'BECTU', deptCode: 'PRP', desigCode: 'PRP_MKR', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 1650, dailyRate: 330, hourlyRate: 33,
    overtimeRate1x5: 49.50, overtimeRate2x: 66, sixthDayRate: 330, seventhDayRate: 330,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/props.html',
    sourceDocument: 'Film & TV Props Department 2025/26 Rates',
    notes: 'Props Maker / Prop Coordinator. MMP: £330/day, £1,650/wk. Inc holiday pay.' },

  // Props Trainee — MMP: £750/wk, £150/day (inc holiday pay)
  { unionCode: 'BECTU', deptCode: 'PRP', desigCode: 'PRP_TRN', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 750, dailyRate: 150, hourlyRate: 15,
    overtimeRate1x5: 22.50, overtimeRate2x: 30, sixthDayRate: 150, seventhDayRate: 150,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/props.html',
    sourceDocument: 'Film & TV Props Department 2025/26 Rates',
    notes: 'Props Trainee MMP: £150/day, £750/wk. Inc holiday pay 12.07%.' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — SPECIAL EFFECTS (MMP)
  // Source: Special Effects Rate Card 2025
  // Recommended minimums. 11hr SWD day (11+1).
  // MMP Agreement OT: 1.5T and 2T of hourly rate, capped at £81.82.
  // ════════════════════════════════════════════════════════════════════════

  // SFX Supervisor — £86.23/hr, £948.51/11hr day
  { unionCode: 'BECTU', deptCode: 'SFX', desigCode: 'SFX_SUP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 4743, dailyRate: 948.51, hourlyRate: 86.23,
    overtimeRate1x5: 86.23, overtimeRate2x: 86.23, sixthDayRate: 948.51, seventhDayRate: 948.51,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/sfx.html',
    sourceDocument: 'Special Effects Rate Card 2025',
    notes: 'SFX Supervisor. £86.23/hr, £948.51/11hr SWD day. OT is 1T (£86.23) at this level. Weekly = daily x 5.' },

  // Senior SFX Technician — £46.95/hr, £516.49/11hr day
  { unionCode: 'BECTU', deptCode: 'SFX', desigCode: 'SR_SFX', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 2582, dailyRate: 516.49, hourlyRate: 46.95,
    overtimeRate1x5: 70.43, overtimeRate2x: 81.82, sixthDayRate: 516.49, seventhDayRate: 516.49,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/sfx.html',
    sourceDocument: 'Special Effects Rate Card 2025',
    notes: 'Senior Tech. £46.95/hr, £516.49/11hr SWD. OT 1.5T=£70.43, 2T capped £81.82. Weekly = daily x 5.' },

  // SFX Technician — £40.08/hr, £440.98/11hr day
  { unionCode: 'BECTU', deptCode: 'SFX', desigCode: 'SFX_TECH', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 2205, dailyRate: 440.98, hourlyRate: 40.08,
    overtimeRate1x5: 60.13, overtimeRate2x: 80.16, sixthDayRate: 440.98, seventhDayRate: 440.98,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/sfx.html',
    sourceDocument: 'Special Effects Rate Card 2025',
    notes: 'SFX Technician. £40.08/hr, £440.98/11hr SWD. OT 1.5T=£60.13, 2T=£80.16. Weekly = daily x 5.' },

  // SFX Assistant Technician — £29.78/hr, £327.59/11hr day
  { unionCode: 'BECTU', deptCode: 'SFX', desigCode: 'SFX_AST', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 1638, dailyRate: 327.59, hourlyRate: 29.78,
    overtimeRate1x5: 44.68, overtimeRate2x: 59.56, sixthDayRate: 327.59, seventhDayRate: 327.59,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/sfx.html',
    sourceDocument: 'Special Effects Rate Card 2025',
    notes: 'SFX Assistant Technician. £29.78/hr, £327.59/11hr SWD. OT 1.5T=£44.68, 2T=£59.56. Weekly = daily x 5.' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — UNIT DRIVERS (High Budget £3m+)
  // Source: BECTU Production Transport rate card — High Budget TV Drama
  // Valid from 1 January 2021. 60hr week (12hr day x 5).
  // Base rates shown; holiday-inclusive rates in parentheses.
  // ════════════════════════════════════════════════════════════════════════

  // Transport Captain — not on rate card; individually negotiated
  { unionCode: 'BECTU', deptCode: 'DRV', desigCode: 'TRANS_CPT', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2021-01-01', weeklyRate: 0, dailyRate: 0, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/unit-drivers.html',
    sourceDocument: 'BECTU Production Transport rate card',
    notes: 'Transport Captain not on official rate card. Individually negotiated.' },

  // Unit Driver — High Budget base: £18.06/hr, £216.66/12hr day, £1,083.33/60hr wk
  { unionCode: 'BECTU', deptCode: 'DRV', desigCode: 'UNIT_DRV', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2021-01-01', weeklyRate: 1083.33, dailyRate: 216.66, hourlyRate: 18.06,
    overtimeRate1x5: 27.09, overtimeRate2x: 36.11, sixthDayRate: 216.66, seventhDayRate: 216.66,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/unit-drivers.html',
    sourceDocument: 'BECTU Production Transport rate card',
    notes: 'Unit Driver High Budget (£3m+) base: £18.06/hr, £216.66/12hr day, £1,083.33/60hr wk. Inc hols: £1,200/wk.' },

  // Minibus Driver — same rate as Unit Driver
  { unionCode: 'BECTU', deptCode: 'DRV', desigCode: 'MINI_DRV', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2021-01-01', weeklyRate: 1083.33, dailyRate: 216.66, hourlyRate: 18.06,
    overtimeRate1x5: 27.09, overtimeRate2x: 36.11, sixthDayRate: 216.66, seventhDayRate: 216.66,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/unit-drivers.html',
    sourceDocument: 'BECTU Production Transport rate card',
    notes: 'Minibus Driver. Same rate as Unit Driver. High Budget base £1,083.33/60hr wk.' },

  // HGV Driver — same rate as Unit Driver (rate card does not differentiate)
  { unionCode: 'BECTU', deptCode: 'DRV', desigCode: 'HGV_DRV', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2021-01-01', weeklyRate: 1083.33, dailyRate: 216.66, hourlyRate: 18.06,
    overtimeRate1x5: 27.09, overtimeRate2x: 36.11, sixthDayRate: 216.66, seventhDayRate: 216.66,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/unit-drivers.html',
    sourceDocument: 'BECTU Production Transport rate card',
    notes: 'HGV Driver. Same rate as Unit Driver on rate card. High Budget base £1,083.33/60hr wk.' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — SOUND DEPARTMENT — VERIFIED from official PDF
  // Source: bectu-production-sound-rates-jan-2024.pdf
  // Feature Film £30m+ column. All rates INCLUDE holiday pay.
  // ════════════════════════════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'SND', desigCode: 'PSM', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2024-01-01', weeklyRate: 3795, dailyRate: 759, hourlyRate: 69,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 759, seventhDayRate: 759,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/production-sound-rates-2024.html',
    sourceDocument: 'BECTU Production Sound Rates Jan 2024',
    notes: 'PSM £30m+. 55hr week. Rates INCLUDE holiday pay.' },
  { unionCode: 'BECTU', deptCode: 'SND', desigCode: 'BOOM', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2024-01-01', weeklyRate: 2805, dailyRate: 561, hourlyRate: 51,
    overtimeRate1x5: 70, overtimeRate2x: 70, sixthDayRate: 561, seventhDayRate: 561,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/production-sound-rates-2024.html',
    sourceDocument: 'BECTU Production Sound Rates Jan 2024',
    notes: 'First Assistant Sound (Boom Op) £30m+. Rates INCLUDE holiday pay.' },
  { unionCode: 'BECTU', deptCode: 'SND', desigCode: 'SND_AST', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2024-01-01', weeklyRate: 2090, dailyRate: 418, hourlyRate: 38,
    overtimeRate1x5: 57, overtimeRate2x: 57, sixthDayRate: 418, seventhDayRate: 418,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/production-sound-rates-2024.html',
    sourceDocument: 'BECTU Production Sound Rates Jan 2024',
    notes: 'Second Assistant Sound £30m+. Rates INCLUDE holiday pay.' },
  { unionCode: 'BECTU', deptCode: 'SND', desigCode: 'SND_TRN', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2024-01-01', weeklyRate: 935, dailyRate: 187, hourlyRate: 17,
    overtimeRate1x5: 26, overtimeRate2x: 26, sixthDayRate: 187, seventhDayRate: 187,
    nightPremiumPct: 0.5, holidayPayInclusive: true, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/production-sound-rates-2024.html',
    sourceDocument: 'BECTU Production Sound Rates Jan 2024',
    notes: 'Sound Trainee £30m+. Rates INCLUDE holiday pay.' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — LIGHTING / SPARKS (MMP £30m+)
  // No official PDF extracted; rates remain approximate.
  // ════════════════════════════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'LIT', desigCode: 'GAF', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 4500, dailyRate: 900, hourlyRate: 82,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 900, seventhDayRate: 900,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: false,
    sourceUrl: 'https://sites.google.com/view/sparksbranch/rates-agreements', sourceDocument: 'BECTU Sparks Branch (approximate)' },
  { unionCode: 'BECTU', deptCode: 'LIT', desigCode: 'BB_ELC', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 3500, dailyRate: 700, hourlyRate: 64,
    overtimeRate1x5: 70, overtimeRate2x: 70, sixthDayRate: 700, seventhDayRate: 700,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: false,
    sourceUrl: 'https://sites.google.com/view/sparksbranch/rates-agreements', sourceDocument: 'BECTU Sparks Branch (approximate)' },
  { unionCode: 'BECTU', deptCode: 'LIT', desigCode: 'SPARK', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 2800, dailyRate: 560, hourlyRate: 51,
    overtimeRate1x5: 70, overtimeRate2x: 70, sixthDayRate: 560, seventhDayRate: 560,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: false,
    sourceUrl: 'https://sites.google.com/view/sparksbranch/rates-agreements', sourceDocument: 'BECTU Sparks Branch (approximate)' },
  { unionCode: 'BECTU', deptCode: 'LIT', desigCode: 'RIG_GAF', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 3800, dailyRate: 760, hourlyRate: 69,
    overtimeRate1x5: 70, overtimeRate2x: 70, sixthDayRate: 760, seventhDayRate: 760,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: false,
    sourceUrl: 'https://sites.google.com/view/sparksbranch/rates-agreements', sourceDocument: 'BECTU Sparks Branch (approximate)' },
  { unionCode: 'BECTU', deptCode: 'LIT', desigCode: 'RIG_ELC', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 2500, dailyRate: 500, hourlyRate: 45,
    overtimeRate1x5: 70, overtimeRate2x: 70, sixthDayRate: 500, seventhDayRate: 500,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: false,
    sourceUrl: 'https://sites.google.com/view/sparksbranch/rates-agreements', sourceDocument: 'BECTU Sparks Branch (approximate)' },
  { unionCode: 'BECTU', deptCode: 'LIT', desigCode: 'LIT_TRN', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2025-01-01', weeklyRate: 1200, dailyRate: 240, hourlyRate: 22,
    overtimeRate1x5: 33, overtimeRate2x: 33, sixthDayRate: 240, seventhDayRate: 240,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: false,
    sourceUrl: 'https://sites.google.com/view/sparksbranch/rates-agreements', sourceDocument: 'BECTU Sparks Branch (approximate)' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — HAIR, MAKEUP & PROSTHETICS — VERIFIED from official PDF
  // Source: hairmakeupbranch.org.uk - Hair & Make-up Rate Card 2023 (V5)
  // MMP (Above £30m) Feature Film column. 50hr and 55hr weeks.
  // ════════════════════════════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'HMU', desigCode: 'HMU_DES', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-03-01', weeklyRate: 4000, dailyRate: 800, hourlyRate: 80,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 800, seventhDayRate: 800,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.hairmakeupbranch.org.uk/copy-of-rate-cards',
    sourceDocument: 'HMU Branch Rate Card 2023 V5',
    notes: 'Designer/HOD/Chief MMP 50hr. 55hr = £4,400.' },
  { unionCode: 'BECTU', deptCode: 'HMU', desigCode: 'HMU_DES', tierCode: 'FILM_MMP',
    dealType: '55hr_week', guaranteedHoursPerWeek: 55, guaranteedHoursPerDay: 11,
    effectiveFrom: '2023-03-01', weeklyRate: 4400, dailyRate: 880, hourlyRate: 80,
    overtimeRate1x5: 82, overtimeRate2x: 82, sixthDayRate: 880, seventhDayRate: 880,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.hairmakeupbranch.org.uk/copy-of-rate-cards',
    sourceDocument: 'HMU Branch Rate Card 2023 V5' },
  { unionCode: 'BECTU', deptCode: 'HMU', desigCode: 'HMU_SUP', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-03-01', weeklyRate: 2650, dailyRate: 530, hourlyRate: 53,
    overtimeRate1x5: 70, overtimeRate2x: 70, sixthDayRate: 530, seventhDayRate: 530,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.hairmakeupbranch.org.uk/copy-of-rate-cards',
    sourceDocument: 'HMU Branch Rate Card 2023 V5',
    notes: 'Key Supervisor - Main Team MMP 50hr. 55hr = £2,915.' },
  { unionCode: 'BECTU', deptCode: 'HMU', desigCode: 'HMU_ART', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-03-01', weeklyRate: 2550, dailyRate: 510, hourlyRate: 51,
    overtimeRate1x5: 70, overtimeRate2x: 70, sixthDayRate: 510, seventhDayRate: 510,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.hairmakeupbranch.org.uk/copy-of-rate-cards',
    sourceDocument: 'HMU Branch Rate Card 2023 V5',
    notes: 'Supervisor - Main Team & Crowd MMP 50hr. 55hr = £2,805.' },
  { unionCode: 'BECTU', deptCode: 'HMU', desigCode: 'HMU_TRN', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2023-03-01', weeklyRate: 1200, dailyRate: 240, hourlyRate: 24,
    overtimeRate1x5: 36, overtimeRate2x: 36, sixthDayRate: 240, seventhDayRate: 240,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://www.hairmakeupbranch.org.uk/copy-of-rate-cards',
    sourceDocument: 'HMU Branch Rate Card 2023 V5',
    notes: 'Trainee MMP 50hr (estimated from lower band pattern).' },

  // ════════════════════════════════════════════════════════════════════════
  // BECTU — RUNNERS (MMP £30m+)
  // Production Runner from LPD TV card Band 4: £775 MR (50hr).
  // ════════════════════════════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'RUN', desigCode: 'RUSH_RUN', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 775, dailyRate: 155, hourlyRate: 15.50,
    overtimeRate1x5: 23.25, overtimeRate2x: 31, sixthDayRate: 155, seventhDayRate: 155,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/production.html',
    sourceDocument: 'LPD Production TV rate card',
    notes: 'Production Assistant/Runner Band 4 minimum £775/50hr wk (£15.50/hr). From LPD Production TV card.' },
  { unionCode: 'BECTU', deptCode: 'RUN', desigCode: 'OFF_RUN', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 775, dailyRate: 155, hourlyRate: 15.50,
    overtimeRate1x5: 23.25, overtimeRate2x: 31, sixthDayRate: 155, seventhDayRate: 155,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/production.html',
    sourceDocument: 'LPD Production TV rate card',
    notes: 'Office Runner. Band 4 minimum £775/50hr wk. From LPD Production TV card.' },
  { unionCode: 'BECTU', deptCode: 'RUN', desigCode: 'SET_RUN', tierCode: 'FILM_MMP',
    dealType: '50hr_week', guaranteedHoursPerWeek: 50, guaranteedHoursPerDay: 10,
    effectiveFrom: '2024-01-01', weeklyRate: 775, dailyRate: 155, hourlyRate: 15.50,
    overtimeRate1x5: 23.25, overtimeRate2x: 31, sixthDayRate: 155, seventhDayRate: 155,
    nightPremiumPct: 0.5, holidayPayInclusive: false, isVerified: true,
    sourceUrl: 'https://union.bectu.org.uk/resource/production.html',
    sourceDocument: 'LPD Production TV rate card',
    notes: 'Set Runner. Band 4 minimum £775/50hr wk. From LPD Production TV card.' },
];

// Departments with rates seeded:
// VERIFIED FROM OFFICIAL PDFs:
//   Camera (Camera Branch Rate Card 2025 v37a)
//   Graphics (Graphics Union Rate Card 2025-2026)
//   Art Dept (BFDG/BECTU Art Dept Film Rate Card 2025-2026)
//   ADs (Assistant Directors' Branch rate card 2024)
//   Construction (PACT/Bectu Construction Rate Card for MMP, amended Apr 2025)
//   Costume (BECTU Costume Dept Film Rate Card July 2023)
//   Grips (Grips Branch rate card 2024)
//   Locations (Locations Branch Film & Scripted TV rate card 2026)
//   Post Production (Post-Production & Facilities Branch Rate Card 2023-2024)
//   Production Office (LPD Production TV rate card)
//   Props (Film & TV Props Department 2025/26 Rates)
//   SFX (Special Effects Rate Card 2025)
//   Unit Drivers (BECTU Production Transport rate card)
//   Runners (LPD Production TV rate card — Production Assistant/Runner)
//   FAA (FAA/Pact Agreement 2024-2025)
//   Equity (Pact/Equity Cinema Films Agreement 2024-2025)
//   WGGB (WGGB Minimum Terms Agreement 2024)
//
// STILL APPROXIMATE (no official PDF available):
//   Sound, Lighting/Sparks, HMU
//
// NOT SEEDED: Set Crafts, VFX, Riggers — import via Admin Rates
