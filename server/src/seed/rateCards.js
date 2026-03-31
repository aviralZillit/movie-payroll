// UK Union Rate Cards — 2024-2025 rates from official sources
// IMPORTANT: These are MINIMUM rates. Crew with 3+ years experience typically negotiate above these.
// NOTE: All seeded rate cards have isVerified: false — they need to be verified against official
// union documents via the Admin Rates import flow before being considered authoritative.
//
// Official sources:
//   BECTU Rate Cards:        https://bectu.org.uk/get-involved-in-the-union/ratecards/
//   Camera Branch:           https://camerabranch.org.uk/rates/
//   Sparks Branch:           https://sites.google.com/view/sparksbranch/rates-agreements
//   Art Department:          https://www.bectuartdepartment.co.uk/rate-card-2024
//   Costume:                 https://www.bectucostume.com/rate-card-1
//   Graphics Union:          https://www.graphicsunion.co.uk/rates
//   Pact/Equity Cinema:      https://www.pact.co.uk/static/f436df45-7436-439d-a15f0b4645448bd1/Pact-Equity-Cinema-Film-Agreement-Rate-Card.pdf
//   Pact/FAA Agreement:      https://www.castingcollective.co.uk/production/payrates
//   WGGB:                    https://writersguild.org.uk/rates-and-agreements/
//   EP UK Rates:             https://www.ep.com/uk-casting-community/rates/

// Helper: for BECTU Film, standard day is 11+1 (11 hrs worked + 1hr lunch)
// Daily rate = weekly / 5, hourly = daily / 11

export const rateCards = [
  // ════════════════════════════════════════════════
  // BECTU — CAMERA DEPARTMENT
  // Source: https://camerabranch.org.uk/rates/
  // ════════════════════════════════════════════════
  // MMP (£30m+)
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'DOP', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 5500, dailyRate: 1100, hourlyRate: 100,
    overtimeRate1x5: 150, overtimeRate2x: 200, sixthDayRate: 1650, seventhDayRate: 2200,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'BECTU Camera Branch Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'CAM_OP', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2915, dailyRate: 583, hourlyRate: 53,
    overtimeRate1x5: 79.50, overtimeRate2x: 106, sixthDayRate: 874.50, seventhDayRate: 1166,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'BECTU Camera Branch Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: '1AC', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1800, dailyRate: 360, hourlyRate: 32.73,
    overtimeRate1x5: 49.09, overtimeRate2x: 65.45, sixthDayRate: 540, seventhDayRate: 720,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'BECTU Camera Branch Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: '2AC', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1400, dailyRate: 280, hourlyRate: 25.45,
    overtimeRate1x5: 38.18, overtimeRate2x: 50.91, sixthDayRate: 420, seventhDayRate: 560,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'BECTU Camera Branch Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'DIT', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1800, dailyRate: 360, hourlyRate: 32.73,
    overtimeRate1x5: 49.09, overtimeRate2x: 65.45, sixthDayRate: 540, seventhDayRate: 720,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'BECTU Camera Branch Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'CAM_TRN', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 795, dailyRate: 159, hourlyRate: 14.45,
    overtimeRate1x5: 21.68, overtimeRate2x: 28.91, sixthDayRate: 238.50, seventhDayRate: 318,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'BECTU Camera Branch Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'STEAD', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 3500, dailyRate: 700, hourlyRate: 63.64,
    overtimeRate1x5: 95.45, overtimeRate2x: 127.27, sixthDayRate: 1050, seventhDayRate: 1400,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'BECTU Camera Branch Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'CAM', desigCode: 'DRONE', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 3500, dailyRate: 700, hourlyRate: 63.64,
    overtimeRate1x5: 95.45, overtimeRate2x: 127.27, sixthDayRate: 1050, seventhDayRate: 1400,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://camerabranch.org.uk/rates/', sourceDocument: 'BECTU Camera Branch Rate Card 2024-2025' },

  // ════════════════════════════════════════════════
  // BECTU — LIGHTING (SPARKS) DEPARTMENT
  // Source: https://sites.google.com/view/sparksbranch/rates-agreements
  // Shooting day = SWD 11+1, Rigging day = 9+1
  // ════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'LIT', desigCode: 'GAF', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2750, dailyRate: 550, hourlyRate: 50,
    overtimeRate1x5: 75, overtimeRate2x: 100, sixthDayRate: 825, seventhDayRate: 1100,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://sites.google.com/view/sparksbranch/rates-agreements', sourceDocument: 'BECTU Sparks Branch Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'LIT', desigCode: 'BB_ELC', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2200, dailyRate: 440, hourlyRate: 40,
    overtimeRate1x5: 60, overtimeRate2x: 80, sixthDayRate: 660, seventhDayRate: 880,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://sites.google.com/view/sparksbranch/rates-agreements', sourceDocument: 'BECTU Sparks Branch Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'LIT', desigCode: 'SPARK', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2083, dailyRate: 416.55, hourlyRate: 37.87,
    overtimeRate1x5: 56.80, overtimeRate2x: 75.74, sixthDayRate: 624.83, seventhDayRate: 833.10,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://sites.google.com/view/sparksbranch/rates-agreements', sourceDocument: 'BECTU Sparks Branch Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'LIT', desigCode: 'RIG_GAF', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2400, dailyRate: 480, hourlyRate: 43.64,
    overtimeRate1x5: 65.45, overtimeRate2x: 87.27, sixthDayRate: 720, seventhDayRate: 960,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://sites.google.com/view/sparksbranch/rates-agreements', sourceDocument: 'BECTU Sparks Branch Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'LIT', desigCode: 'RIG_ELC', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1700, dailyRate: 340.82, hourlyRate: 30.98,
    overtimeRate1x5: 46.47, overtimeRate2x: 61.96, sixthDayRate: 511.23, seventhDayRate: 681.64,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://sites.google.com/view/sparksbranch/rates-agreements', sourceDocument: 'BECTU Sparks Branch Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'LIT', desigCode: 'LIT_TRN', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 795, dailyRate: 159, hourlyRate: 14.45,
    overtimeRate1x5: 21.68, overtimeRate2x: 28.91, sixthDayRate: 238.50, seventhDayRate: 318,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://sites.google.com/view/sparksbranch/rates-agreements', sourceDocument: 'BECTU Sparks Branch Rate Card 2024-2025' },

  // ════════════════════════════════════════════════
  // BECTU — SOUND DEPARTMENT
  // Source: https://bectu.org.uk/get-involved-in-the-union/ratecards/
  // ════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'SND', desigCode: 'PSM', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2500, dailyRate: 500, hourlyRate: 45.45,
    overtimeRate1x5: 68.18, overtimeRate2x: 90.91, sixthDayRate: 750, seventhDayRate: 1000,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Sound Dept Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'SND', desigCode: 'BOOM', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1650, dailyRate: 330, hourlyRate: 30,
    overtimeRate1x5: 45, overtimeRate2x: 60, sixthDayRate: 495, seventhDayRate: 660,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Sound Dept Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'SND', desigCode: 'SND_AST', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1200, dailyRate: 240, hourlyRate: 21.82,
    overtimeRate1x5: 32.73, overtimeRate2x: 43.64, sixthDayRate: 360, seventhDayRate: 480,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Sound Dept Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'SND', desigCode: 'SND_TRN', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 795, dailyRate: 159, hourlyRate: 14.45,
    overtimeRate1x5: 21.68, overtimeRate2x: 28.91, sixthDayRate: 238.50, seventhDayRate: 318,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Sound Dept Rate Card 2024-2025' },

  // ════════════════════════════════════════════════
  // BECTU — GRIP DEPARTMENT
  // ════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'GRP', desigCode: 'KEY_GRP', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2750, dailyRate: 550, hourlyRate: 50,
    overtimeRate1x5: 75, overtimeRate2x: 100, sixthDayRate: 825, seventhDayRate: 1100,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Grip Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'GRP', desigCode: 'BB_GRP', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2200, dailyRate: 440, hourlyRate: 40,
    overtimeRate1x5: 60, overtimeRate2x: 80, sixthDayRate: 660, seventhDayRate: 880,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Grip Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'GRP', desigCode: 'DLY_GRP', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2200, dailyRate: 440, hourlyRate: 40,
    overtimeRate1x5: 60, overtimeRate2x: 80, sixthDayRate: 660, seventhDayRate: 880,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Grip Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'GRP', desigCode: 'GRP', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1750, dailyRate: 350, hourlyRate: 31.82,
    overtimeRate1x5: 47.73, overtimeRate2x: 63.64, sixthDayRate: 525, seventhDayRate: 700,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Grip Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'GRP', desigCode: 'GRP_TRN', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 795, dailyRate: 159, hourlyRate: 14.45,
    overtimeRate1x5: 21.68, overtimeRate2x: 28.91, sixthDayRate: 238.50, seventhDayRate: 318,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Grip Rate Card 2024-2025' },

  // ════════════════════════════════════════════════
  // BECTU — ART DEPARTMENT
  // Source: https://www.bectuartdepartment.co.uk/rate-card-2024
  // Art Dept self-schedules at 9+1 (not 11+1), car allowance £150/week
  // 2024-2025: 4.95% increase applied
  // ════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'PROD_DES', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 4200, dailyRate: 840, hourlyRate: 76.36,
    overtimeRate1x5: 114.55, overtimeRate2x: 152.73, sixthDayRate: 1260, seventhDayRate: 1680,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.bectuartdepartment.co.uk/rate-card-2024', sourceDocument: 'BECTU Art Department Rate Card 2024-2025',
    notes: 'Art Dept hours: 9+1 self-scheduled. Car allowance £150/week additional.' },
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'SUP_AD', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2850, dailyRate: 570, hourlyRate: 51.82,
    overtimeRate1x5: 77.73, overtimeRate2x: 103.64, sixthDayRate: 855, seventhDayRate: 1140,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.bectuartdepartment.co.uk/rate-card-2024', sourceDocument: 'BECTU Art Department Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'ART_DIR', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2300, dailyRate: 460, hourlyRate: 41.82,
    overtimeRate1x5: 62.73, overtimeRate2x: 83.64, sixthDayRate: 690, seventhDayRate: 920,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.bectuartdepartment.co.uk/rate-card-2024', sourceDocument: 'BECTU Art Department Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'AST_AD', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1650, dailyRate: 330, hourlyRate: 30,
    overtimeRate1x5: 45, overtimeRate2x: 60, sixthDayRate: 495, seventhDayRate: 660,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.bectuartdepartment.co.uk/rate-card-2024', sourceDocument: 'BECTU Art Department Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'SET_DEC', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2300, dailyRate: 460, hourlyRate: 41.82,
    overtimeRate1x5: 62.73, overtimeRate2x: 83.64, sixthDayRate: 690, seventhDayRate: 920,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.bectuartdepartment.co.uk/rate-card-2024', sourceDocument: 'BECTU Art Department Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'ART_AST', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1200, dailyRate: 240, hourlyRate: 21.82,
    overtimeRate1x5: 32.73, overtimeRate2x: 43.64, sixthDayRate: 360, seventhDayRate: 480,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.bectuartdepartment.co.uk/rate-card-2024', sourceDocument: 'BECTU Art Department Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'ART', desigCode: 'ART_TRN', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 795, dailyRate: 159, hourlyRate: 14.45,
    overtimeRate1x5: 21.68, overtimeRate2x: 28.91, sixthDayRate: 238.50, seventhDayRate: 318,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.bectuartdepartment.co.uk/rate-card-2024', sourceDocument: 'BECTU Art Department Rate Card 2024-2025' },

  // ════════════════════════════════════════════════
  // BECTU — CONSTRUCTION DEPARTMENT
  // Source: Pact/BECTU Construction Crew Agreement 2024-2025 (4.95% increase)
  // ════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'HOD_CARP', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2943, dailyRate: 588.60, hourlyRate: 58.86,
    overtimeRate1x5: 88.29, overtimeRate2x: 117.72, sixthDayRate: 882.90, seventhDayRate: 1177.20,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'Pact/BECTU Construction Agreement 2024-2025',
    notes: 'Construction: hourly minimums. HoD Carpenter £58.86/hr.' },
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'SUP_CARP', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2498, dailyRate: 499.50, hourlyRate: 49.95,
    overtimeRate1x5: 74.93, overtimeRate2x: 99.90, sixthDayRate: 749.25, seventhDayRate: 999,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'Pact/BECTU Construction Agreement 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'CHG_CARP', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2063, dailyRate: 412.50, hourlyRate: 41.25,
    overtimeRate1x5: 61.88, overtimeRate2x: 82.50, sixthDayRate: 618.75, seventhDayRate: 825,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'Pact/BECTU Construction Agreement 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'CON', desigCode: 'CARP', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1748, dailyRate: 349.60, hourlyRate: 34.96,
    overtimeRate1x5: 52.44, overtimeRate2x: 69.92, sixthDayRate: 524.40, seventhDayRate: 699.20,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'Pact/BECTU Construction Agreement 2024-2025' },

  // ════════════════════════════════════════════════
  // BECTU — GRAPHICS
  // Source: https://www.graphicsunion.co.uk/rates
  // ════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'GFX', desigCode: 'LEAD_GFX', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2670, dailyRate: 534, hourlyRate: 48.55,
    overtimeRate1x5: 72.82, overtimeRate2x: 97.09, sixthDayRate: 801, seventhDayRate: 1068,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.graphicsunion.co.uk/rates', sourceDocument: 'Graphics Union Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'GFX', desigCode: 'GFX_DES', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2025, dailyRate: 405, hourlyRate: 36.82,
    overtimeRate1x5: 55.23, overtimeRate2x: 73.64, sixthDayRate: 607.50, seventhDayRate: 810,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.graphicsunion.co.uk/rates', sourceDocument: 'Graphics Union Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'GFX', desigCode: 'AST_GFX', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1605, dailyRate: 321, hourlyRate: 29.18,
    overtimeRate1x5: 43.77, overtimeRate2x: 58.36, sixthDayRate: 481.50, seventhDayRate: 642,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.graphicsunion.co.uk/rates', sourceDocument: 'Graphics Union Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'GFX', desigCode: 'GFX_AST', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1210, dailyRate: 242, hourlyRate: 22,
    overtimeRate1x5: 33, overtimeRate2x: 44, sixthDayRate: 363, seventhDayRate: 484,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.graphicsunion.co.uk/rates', sourceDocument: 'Graphics Union Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'GFX', desigCode: 'GFX_TRN', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 795, dailyRate: 159, hourlyRate: 14.45,
    overtimeRate1x5: 21.68, overtimeRate2x: 28.91, sixthDayRate: 238.50, seventhDayRate: 318,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.graphicsunion.co.uk/rates', sourceDocument: 'Graphics Union Rate Card 2024-2025' },

  // ════════════════════════════════════════════════
  // BECTU — ASSISTANT DIRECTORS
  // Source: https://bectu.org.uk/get-involved-in-the-union/ratecards/
  // AD rates are NOT inclusive of holiday pay — add 12.07%
  // Standard day: 10+1
  // ════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'AD', desigCode: '1AD', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2850, dailyRate: 570, hourlyRate: 57,
    overtimeRate1x5: 85.50, overtimeRate2x: 114, sixthDayRate: 855, seventhDayRate: 1140,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU AD Branch Rate Card 2024-2025',
    notes: 'AD rates EXCLUDE holiday pay (add 12.07%). Hourly = weekly/50.' },
  { unionCode: 'BECTU', deptCode: 'AD', desigCode: '2AD', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1950, dailyRate: 390, hourlyRate: 39,
    overtimeRate1x5: 58.50, overtimeRate2x: 78, sixthDayRate: 585, seventhDayRate: 780,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU AD Branch Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'AD', desigCode: '3AD', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1350, dailyRate: 270, hourlyRate: 27,
    overtimeRate1x5: 40.50, overtimeRate2x: 54, sixthDayRate: 405, seventhDayRate: 540,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU AD Branch Rate Card 2024-2025' },

  // ════════════════════════════════════════════════
  // BECTU — PRODUCTION OFFICE
  // Source: https://bectu.org.uk/get-involved-in-the-union/ratecards/
  // ════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'PROD', desigCode: 'PROD_MGR', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2850, dailyRate: 570, hourlyRate: 51.82,
    overtimeRate1x5: 77.73, overtimeRate2x: 103.64, sixthDayRate: 855, seventhDayRate: 1140,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Production Dept Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'PROD', desigCode: 'PROD_COO', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1550, dailyRate: 310, hourlyRate: 28.18,
    overtimeRate1x5: 42.27, overtimeRate2x: 56.36, sixthDayRate: 465, seventhDayRate: 620,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Production Dept Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'PROD', desigCode: 'PROD_ACC', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2400, dailyRate: 480, hourlyRate: 43.64,
    overtimeRate1x5: 65.45, overtimeRate2x: 87.27, sixthDayRate: 720, seventhDayRate: 960,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Production Dept Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'PROD', desigCode: 'SCRP_SUP', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2200, dailyRate: 440, hourlyRate: 40,
    overtimeRate1x5: 60, overtimeRate2x: 80, sixthDayRate: 660, seventhDayRate: 880,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Production Dept Rate Card 2024-2025' },

  // ════════════════════════════════════════════════
  // BECTU — RUNNERS
  // ════════════════════════════════════════════════
  { unionCode: 'BECTU', deptCode: 'RUN', desigCode: 'RUSH_RUN', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 850, dailyRate: 170, hourlyRate: 15.45,
    overtimeRate1x5: 23.18, overtimeRate2x: 30.91, sixthDayRate: 255, seventhDayRate: 340,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Runners Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'RUN', desigCode: 'OFF_RUN', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 795, dailyRate: 159, hourlyRate: 14.45,
    overtimeRate1x5: 21.68, overtimeRate2x: 28.91, sixthDayRate: 238.50, seventhDayRate: 318,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Runners Rate Card 2024-2025' },
  { unionCode: 'BECTU', deptCode: 'RUN', desigCode: 'SET_RUN', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 795, dailyRate: 159, hourlyRate: 14.45,
    overtimeRate1x5: 21.68, overtimeRate2x: 28.91, sixthDayRate: 238.50, seventhDayRate: 318,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://bectu.org.uk/get-involved-in-the-union/ratecards/', sourceDocument: 'BECTU Runners Rate Card 2024-2025' },

  // ════════════════════════════════════════════════
  // EQUITY — CAST (CINEMA FILMS AGREEMENT)
  // Source: Pact/Equity Cinema Film Agreement Rate Card 2024-2025
  // https://www.pact.co.uk/static/f436df45-7436-439d-a15f0b4645448bd1/Pact-Equity-Cinema-Film-Agreement-Rate-Card.pdf
  // Base daily: £161, weekly (5 days): £644
  // Budget uplifts: £3m+ = +280%, £1m-£3m = +75%, under £1m = +50%
  // ════════════════════════════════════════════════
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'LEAD', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2447, dailyRate: 611.80, hourlyRate: 61.18,
    overtimeRate1x5: 91.77, overtimeRate2x: 94, sixthDayRate: 917.70, seventhDayRate: 1223.60,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html', sourceDocument: 'Pact/Equity Cinema Films Agreement 2024-2025',
    notes: 'Base £644/wk + 280% uplift for £3m+ = £2,447/wk. OT max £94/hr.' },
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'SUPP', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2447, dailyRate: 611.80, hourlyRate: 61.18,
    overtimeRate1x5: 91.77, overtimeRate2x: 94, sixthDayRate: 917.70, seventhDayRate: 1223.60,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html', sourceDocument: 'Pact/Equity Cinema Films Agreement 2024-2025' },
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'DAY_PLR', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2447, dailyRate: 611.80, hourlyRate: 61.18,
    overtimeRate1x5: 91.77, overtimeRate2x: 94, sixthDayRate: 917.70, seventhDayRate: 1223.60,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html', sourceDocument: 'Pact/Equity Cinema Films Agreement 2024-2025' },
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'WK_PLR', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 2447, dailyRate: 611.80, hourlyRate: 61.18,
    overtimeRate1x5: 91.77, overtimeRate2x: 94, sixthDayRate: 917.70, seventhDayRate: 1223.60,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html', sourceDocument: 'Pact/Equity Cinema Films Agreement 2024-2025' },

  // Equity lower budget tiers
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'LEAD', tierCode: 'FILM_1_3',
    effectiveFrom: '2024-04-01', weeklyRate: 1127, dailyRate: 281.75, hourlyRate: 28.18,
    overtimeRate1x5: 42.26, overtimeRate2x: 94, sixthDayRate: 422.63, seventhDayRate: 563.50,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html', sourceDocument: 'Pact/Equity Cinema Films Agreement 2024-2025',
    notes: 'Base £644/wk + 75% uplift for £1m-£3m = £1,127/wk.' },
  { unionCode: 'EQUITY', deptCode: 'CAST', desigCode: 'LEAD', tierCode: 'FILM_U1',
    effectiveFrom: '2024-04-01', weeklyRate: 966, dailyRate: 241.50, hourlyRate: 24.15,
    overtimeRate1x5: 36.23, overtimeRate2x: 94, sixthDayRate: 362.25, seventhDayRate: 483,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.pact.co.uk/resource-hub/contracting-off-screen-talent-crew.html', sourceDocument: 'Pact/Equity Cinema Films Agreement 2024-2025',
    notes: 'Base £644/wk + 50% uplift for under £1m = £966/wk.' },

  // ════════════════════════════════════════════════
  // FAA — BACKGROUND ARTISTS (London, 40-mile radius of Charing Cross)
  // Source: Pact/FAA Agreement, https://www.castingcollective.co.uk/production/payrates
  // ════════════════════════════════════════════════
  { unionCode: 'FAA', deptCode: 'BG', desigCode: 'BG_ART', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 556.05, dailyRate: 111.21, hourlyRate: 11.12,
    overtimeRate1x5: 23.38, overtimeRate2x: 23.38, sixthDayRate: 166.82, seventhDayRate: 166.82,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.castingcollective.co.uk/production/payrates', sourceDocument: 'Pact/FAA Agreement 2024-2025',
    notes: 'Day £111.21, Night £166.82. OT £11.69/30min. Public Holiday = Night rate.' },
  { unionCode: 'FAA', deptCode: 'BG', desigCode: 'STAND_IN', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 695, dailyRate: 139.02, hourlyRate: 13.90,
    overtimeRate1x5: 23.38, overtimeRate2x: 23.38, sixthDayRate: 208.53, seventhDayRate: 208.53,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.castingcollective.co.uk/production/payrates', sourceDocument: 'Pact/FAA Agreement 2024-2025',
    notes: 'Stand-in rate = Double Shift Call (£139.02).' },
  { unionCode: 'FAA', deptCode: 'WO', desigCode: 'WO_ART', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 1250, dailyRate: 250, hourlyRate: 25,
    overtimeRate1x5: 37.50, overtimeRate2x: 50, sixthDayRate: 375, seventhDayRate: 500,
    nightPremiumPct: 0.5, holidayPayInclusive: false,
    sourceUrl: 'https://www.castingcollective.co.uk/production/payrates', sourceDocument: 'Pact/FAA Agreement 2024-2025',
    notes: 'Walk-on rate for commercials/corporates: £250/day.' },

  // ════════════════════════════════════════════════
  // WGGB — SCREENWRITERS
  // Source: https://writersguild.org.uk/rates-and-agreements/
  // Writer rates are flat fees, not daily/hourly
  // ════════════════════════════════════════════════
  { unionCode: 'WGGB', deptCode: 'SCRN', desigCode: 'SCRN_ORIG', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 42120, dailyRate: 42120, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0, holidayPayInclusive: true,
    sourceUrl: 'https://writersguild.org.uk/rates-and-agreements/', sourceDocument: 'WGGB Minimum Terms Agreement 2024',
    notes: 'Flat fee minimum £42,120 for original screenplay (budget over £2m). Not daily/hourly.' },
  { unionCode: 'WGGB', deptCode: 'SCRN', desigCode: 'SCRN_ORIG', tierCode: 'FILM_1_3',
    effectiveFrom: '2024-04-01', weeklyRate: 25650, dailyRate: 25650, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0, holidayPayInclusive: true,
    sourceUrl: 'https://writersguild.org.uk/rates-and-agreements/', sourceDocument: 'WGGB Minimum Terms Agreement 2024',
    notes: 'Flat fee minimum £25,650 for screenplay (budget £750k-£2m).' },
  { unionCode: 'WGGB', deptCode: 'SCRN', desigCode: 'SCRN_ORIG', tierCode: 'FILM_U1',
    effectiveFrom: '2024-04-01', weeklyRate: 18900, dailyRate: 18900, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0, holidayPayInclusive: true,
    sourceUrl: 'https://writersguild.org.uk/rates-and-agreements/', sourceDocument: 'WGGB Minimum Terms Agreement 2024',
    notes: 'Flat fee minimum £18,900 for screenplay (budget under £750k).' },
  { unionCode: 'WGGB', deptCode: 'SCRN', desigCode: 'SCRN_ADAPT', tierCode: 'FILM_MMP',
    effectiveFrom: '2024-04-01', weeklyRate: 25650, dailyRate: 25650, hourlyRate: 0,
    overtimeRate1x5: 0, overtimeRate2x: 0, sixthDayRate: 0, seventhDayRate: 0,
    nightPremiumPct: 0, holidayPayInclusive: true,
    sourceUrl: 'https://writersguild.org.uk/rates-and-agreements/', sourceDocument: 'WGGB Minimum Terms Agreement 2024',
    notes: 'Adaptation screenplay minimum.' },
];

// ════════════════════════════════════════════════════════════════════════
// AUTO-GENERATE rate cards for other budget tiers from MMP rates
// Scale factors based on industry standard — lower budgets = lower minimums
// Source: General industry practice per Pact/BECTU agreements
// ════════════════════════════════════════════════════════════════════════
const tierScaleFactors = {
  FILM_15_30: { scale: 0.90, label: 'Film £15m-£30m' },
  FILM_5_15:  { scale: 0.80, label: 'Film £5m-£15m' },
  FILM_3_5:   { scale: 0.70, label: 'Film £3m-£5m' },
  FILM_1_3:   { scale: 0.60, label: 'Film £1m-£3m' },
  FILM_U1:    { scale: 0.50, label: 'Film Under £1m' },
  TV_BAND4:   { scale: 0.95, label: 'TV Band 4 (£8m+/hr)' },
  TV_BAND3:   { scale: 0.85, label: 'TV Band 3 (£3m-£8m/hr)' },
  TV_BAND2:   { scale: 0.75, label: 'TV Band 2 (£1.25m-£3m/hr)' },
  TV_BAND1:   { scale: 0.65, label: 'TV Band 1 (Under £1.25m/hr)' },
};

const round2 = (n) => Math.round(n * 100) / 100;

const bectuMmpCards = rateCards.filter(
  (rc) => rc.unionCode === 'BECTU' && rc.tierCode === 'FILM_MMP'
);

for (const [tierCode, { scale }] of Object.entries(tierScaleFactors)) {
  for (const mmp of bectuMmpCards) {
    rateCards.push({
      ...mmp,
      tierCode,
      weeklyRate: round2(mmp.weeklyRate * scale),
      dailyRate: round2(mmp.dailyRate * scale),
      hourlyRate: round2(mmp.hourlyRate * scale),
      overtimeRate1x5: round2(mmp.overtimeRate1x5 * scale),
      overtimeRate2x: round2(mmp.overtimeRate2x * scale),
      sixthDayRate: round2(mmp.sixthDayRate * scale),
      seventhDayRate: round2(mmp.seventhDayRate * scale),
      notes: mmp.notes ? mmp.notes + ` Scaled from MMP at ${scale * 100}%.` : `Scaled from MMP rate at ${scale * 100}%.`,
      isVerified: false,
    });
  }
}
