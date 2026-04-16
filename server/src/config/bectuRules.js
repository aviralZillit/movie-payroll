/**
 * PACT/BECTU MMP Agreement — Codified Rules
 * Source: PACT/BECTU Agreement Terms Applicable to Major Motion Pictures (Amended 5 Apr 2021)
 * Downloaded from: https://camerabranch.org.uk/wp-content/uploads/2021/03/mmp-old-new-compared.pdf
 *
 * This file is the SINGLE SOURCE OF TRUTH for all BECTU agreement terms.
 * All calculators, defaults, and UI should reference this file.
 *
 * NOTE: These rules apply to MMP (Major Motion Pictures) — productions with
 * budget ≥ £30,000,000. For TV Drama, see the separate PACT/BECTU TV Agreement.
 */

// ═══════════════════════════════════════════════════════════════════════
// §1 — APPLICABILITY
// ═══════════════════════════════════════════════════════════════════════
export const APPLICABILITY = {
  agreementName: 'PACT/BECTU MMP Agreement',
  effectiveDate: '2021-04-05',
  majorPictureThreshold: 30_000_000, // £30m — §1.3
  description: 'Feature film or single theatric/SVOD content with budget ≥ £30m',
};

// ═══════════════════════════════════════════════════════════════════════
// §2 — WORKING DAY AND WORKING WEEK
// ═══════════════════════════════════════════════════════════════════════
export const WORKING_DAY = {
  // §2.1: Standard Working Week
  standardWorkingWeek: {
    hours: 55, // 55-hour, 5-day week
    days: 5,
    overtimeIsVoluntary: true,
  },

  // §2.2: Non-shooting crew (pre-production, post-production)
  nonShooting: {
    SWD: { hoursWorked: 11, lunchBreak: 1, totalElapsed: 12, label: 'Standard Working Day' },
  },

  // §2.3: Shooting crew — 3 variations, all paid as 11 worked hours
  shooting: {
    SWD:  { hoursWorked: 11, lunchBreak: 1,   totalElapsed: 12,   label: 'Standard Working Day' },
    CWD:  { hoursWorked: 10, lunchBreak: 0,   totalElapsed: 10,   label: 'Continuous Working Day — no formal lunch break' },
    SCWD: { hoursWorked: 10, lunchBreak: 0.5, totalElapsed: 10.5, label: 'Semi-Continuous Working Day — 30 min lunch' },
  },

  // §2.2(a): Rigging Electricians exception
  riggingElectricians: {
    hoursWorked: 9, lunchBreak: 1, totalElapsed: 10,
    overtimeAfter: 10, // elapsed hours
    hourlyRateDivisor: 45, // weekly ÷ 45, or daily ÷ 9
  },
};

// ═══════════════════════════════════════════════════════════════════════
// §3 — OVERTIME RATES
// ═══════════════════════════════════════════════════════════════════════
export const OVERTIME = {
  // §3.3(a): Hourly Rate derivation
  hourlyRate: {
    fromWeekly: (weeklyRate) => Math.round(weeklyRate / 55 * 100) / 100,
    fromDaily: (dailyRate) => Math.round(dailyRate / 11 * 100) / 100,
    weeklyDivisor: 55,
    dailyDivisor: 11,
  },

  // §3.3(a): OT multipliers
  multipliers: {
    standard: 1.5, // 1.5T — "the Hourly Rate multiplied by 1.5"
    double: 2.0,   // 2T — "the Hourly Rate multiplied by 2"
  },

  // §3.3(a)(i): Camera Overtime — filming beyond contracted hours
  cameraOT: {
    multiplier: 2.0,             // 2T
    incrementMinutes: 15,        // paid in 15-min increments
    gracePeriod: false,          // "No Grace Period is applicable"
    first2HoursProRated: true,   // first 2 hours pro-rated
    thirdHourNotProRated: true,  // 3rd hour NOT pro-rated
    note: 'Best practice to avoid 3rd hour camera OT on any working day',
  },

  // §3.3(a)(ii): Non-Camera Overtime — pre-calls, de-rigs
  nonCameraOT: {
    multiplier: 1.5,             // 1.5T
    incrementMinutes: 30,        // paid in 30-min increments
    prepAndWrapProvisions: true,  // subject to prep & wrap provisions §3.2
  },

  // §3.3(b): Minimum Camera Overtime Rate
  minCameraOTRate: 25, // £25/hr

  // §3.3(c): Maximum Overtime Rate (cap)
  maxOTRate: 81.82, // £81.82/hr — applies to ALL OT including 6th/7th days

  // §3.3(d): Grades where OT is case-by-case if weekly > £3,000
  caseByCase: {
    weeklyThreshold: 3000,
    grades: [
      '1st AD', 'Action Vehicle Co-Ordinator', 'Assistant SFX Supervisor',
      'Costume Designer', 'DOP', 'Editor', 'Financial Controller/Accountant',
      'Chief of Department for Make-Up and Hair Design', 'Producer',
      'Production Designer', 'Production Manager/UPM', 'Production Supervisor',
      'Set Decorator', 'SFX Supervisor', 'Supervising Art Director',
      'VFX Supervisor', 'VFX Producer', 'Specialist Workshop Supervisor',
    ],
  },

  // §3.2(a): Prep & Wrap — specific departments include 30 min at start and end
  prepAndWrapDepartments: [
    'ADs', 'Costume', 'Hair and Make-up', 'Locations',
    'Script Supervisor', 'VFX',
  ],
};

// ═══════════════════════════════════════════════════════════════════════
// §4 — 6TH AND 7TH DAYS
// ═══════════════════════════════════════════════════════════════════════
export const SIXTH_SEVENTH_DAYS = {
  // §4.1: 6th consecutive day
  sixthDay: {
    multiplier: 1.5,                    // 1.5T for actual hours worked
    minHoursNonShooting: 6,             // minimum guarantee: 6 hours
    minHoursShooting: 8,                // minimum guarantee: 8 hours
    overtimePer: 'Section 3.3',         // OT per normal rules
  },

  // §4.2: 7th consecutive day
  seventhDay: {
    multiplier: 2.0,                    // 2T for actual hours worked
    minHoursNonShooting: 6,
    minHoursShooting: 8,
    overtimePer: 'Section 3.3 at 2T',   // OT also at 2T
  },

  // §4.3: Clarifications
  saturdaySundayNotAutoPremium: true,    // Only premium if consecutive 6th/7th
  otRatesSubjectToMinAndMax: true,       // §4.3(b): min/max camera OT still applies

  // §4.4: Travel days do NOT count as worked days for 6th/7th calculation
  travelDayExclusion: true,
};

// ═══════════════════════════════════════════════════════════════════════
// §5 — OTHER TERMS, PREMIUMS AND PENALTIES
// ═══════════════════════════════════════════════════════════════════════

// §5.1: Pre-Dawn Calls
export const PRE_DAWN = {
  threshold: '05:00',              // before 05:00
  rate: 2.0,                       // 2T
  from0500: 'normal hourly rate',  // from 05:00 = normal
  isNotNightWork: true,            // §5.1: "a pre-dawn call will not be treated as Night Work"
};

// §5.2: Night Work
export const NIGHT_WORK = {
  // §5.2(a): Definition
  definition: 'Shooting hours which continue after midnight or any unit call between midnight and 03:00',
  clarifications: [
    'Camera wrapped by midnight + appropriate crew wrap after = NOT Night Work',
    'Department asked to work overnight for non-shooting reasons = Night Work',
  ],

  // §5.2(b): Night Work Premium
  premium: {
    amount: 20,                     // £20 flat per night
    currency: 'GBP',
    type: 'flat',                   // flat amount, NOT a percentage
    appliesTo: 'Crew members taking part in Night Work (including dailies)',
    perNight: true,
  },

  // §5.2(c): Turnaround Day after Night Work
  turnaroundDay: {
    paid: true,
    rate: 'standard contractual daily rate',
    atEndOfNightBlock: true,
    forDailies: 'paid at end of any scheduled period of Night Work',
  },

  // §5.2(d): Night Block Scheduling
  nightBlocks: {
    standard: 5,                    // usually 5 nights
    maxConsecutive: 6,
    restBetween6and6: '24 + 11 hours',
    restBetween6and5: '24 + 11 hours',
    restBetween5and6: '48 + 11 hours',
    restBetween5and5: '48 + 11 hours',
  },
};

// §5.3: Broken Turnarounds
export const TURNAROUND = {
  minimumHours: 11,                 // 11 hours between wrap and call
  label: 'Turnaround Period',

  // §5.3(b): Broken Turnaround payment
  brokenTurnaround: {
    rate: 1.5,                      // 1.5T
    incrementMinutes: 30,           // paid in 30-min increments
    proRated: true,
    maxHourlyRate: 45,              // capped at £45/hr
    maxPerIncrement: 22.50,         // £22.50 per 30-min increment
  },
};

// §5.4: Meal Breaks
export const MEAL_BREAKS = {
  // §5.4(a): SWD and SCWD — lunch no later than 6 hours after unit call
  swd_scwd: {
    maxHoursAfterUnitCall: 6,
    note: 'During principal photography crew members should be generally entitled to take their lunch break no later than 6 hours after unit call',
  },

  // §5.4(b): Shooting crew — penalty for delayed/curtailed lunch
  shootingCrewPenalty: {
    delayed: {
      incrementMinutes: 15,
      rate: 'standard Hourly Rate',  // crew member's own hourly rate
      proRated: true,
    },
    curtailed: {
      incrementMinutes: 15,
      rate: 'camera Overtime rate',
      proRated: true,
      capSWD: 60,                    // capped at 1 hour for SWD
      capSCWD: 30,                   // capped at 30 min for SCWD
    },
  },

  // §5.4(b) continued: Non-shooting crew
  nonShootingCrewPenalty: {
    shortenedFrom1hr: {
      incrementMinutes: 30,
      rate: 1.5,                     // 1.5T
    },
    requiresHoDApproval: true,
  },

  // §5.4(c): CWD food
  cwd: {
    foodProvidedAfterHours: 4.5,     // from unit call
    foodDuration: 2,                 // runs for 2 hours
  },

  // §5.4(d): SCWD food
  scwd: {
    foodProvidedAfterHours: 4.5,     // from unit call
    foodDuration: 2,
    break: 30,                       // 30-min break during this time
  },

  // §5.4(e): General
  thirdHourCameraOT: 'Food will be served during the third hour of any Camera Overtime',

  // §5.5: Rest Breaks
  restBreaks: {
    additionalBreak: 20,             // 20 minutes
    afterHours: 12,                  // when working > 12 hours on CWD or SCWD
  },
};

// §5.6: Bank Holidays
export const BANK_HOLIDAYS = {
  // §5.6(a): Not required to work but contracted over period = daily fee
  notRequired: 'daily fee for that Bank Holiday',
  // §5.6(b): Required to work = 2T
  required: {
    multiplier: 2.0,
    appliesTo: 'weekly or daily crew',
  },
};

// ═══════════════════════════════════════════════════════════════════════
// §6 — TRAVEL AND BASES
// ═══════════════════════════════════════════════════════════════════════
export const TRAVEL = {
  // §6.1: Definitions
  locations: {
    productionBase: 'Place where production carries out majority of work',
    recognisedStudios: [
      'Shepperton', 'Pinewood', 'Leavesden', 'Elstree', 'Ealing',
      'Twickenham', 'Gillette', 'Longcross', '3 Mills',
    ],
    nonResident: 'Location where crew can travel daily from Production Base',
    resident: 'Location more than 50 road miles from Production Base',
    overseas: 'Location outside the United Kingdom',
  },

  // §6.2: Terms Applicable to Travel
  rules: {
    // §6.2(a): Home → Base or Recognised Studio = NO PAYMENT
    homeToBase: { paid: false },

    // §6.2(b): Base → Non-Resident/Resident Location
    baseToLocation: { paid: true, rate: 'HMRC mileage rate', unlessTransportProvided: true },

    // §6.2(c): Local Locations — contractual rate includes up to 30 road miles
    localLocations: {
      freeMilesStart: 30,            // 30 road miles at start of day
      freeMilesEnd: 30,              // 30 road miles at end of day
      beyondFreeNote: 'No further payment for travel to/from filming location',
    },

    // §6.2(d): Paid Travel — Local Locations
    paidTravelLocal: {
      first30Miles: 'No payment',
      beyond30Miles: {
        rate: 'agreed rate',
        incrementMinutes: 30,
        maxHourlyRate: 45,           // £45/hr
        maxPerIncrement: 22.50,      // £22.50 per 30 min
      },
    },

    // §6.2(e): Distant/Overseas Locations — same 30-mile rule from Hotel
    distantLocations: {
      freeMilesFromHotelStart: 30,
      freeMilesFromHotelEnd: 30,
    },

    // §6.2(f): Paid Travel — Distant/Overseas
    paidTravelDistant: {
      first30Miles: 'No payment',
      beyond30Miles: {
        rate: 'agreed rate',
        incrementMinutes: 30,
        maxHourlyRate: 45,
        maxPerIncrement: 22.50,
      },
    },

    // §6.2(g): Off-set Prep Crews — travel is part of normal working day
    offSetPrepCrews: {
      travelIsPartOfDay: true,
      overtimeCap: 45,               // £45/hr
      incrementMinutes: 30,
    },

    // §6.2(h): Travel time rate
    travelTimeRate: {
      rate: 'contractual daily/hourly rate',
      noUplifts: true,               // NO uplifts or premiums
      even6th7thOrBankHoliday: true, // even on premium days
    },

    // §6.2(i): Travel outside contracted week
    travelOutsideWeek: {
      rate: 'contractual flat daily rate',
      noTimeZoneAdjustment: true,
    },

    // §6.2(j): Rest days at Resident/Overseas Location
    restDaysAtLocation: {
      paid: false,                   // NOT paid unless actually worked
      mustBePreApproved: true,
    },

    // §6.2(k): Travel home on rest day
    travelHomeOnRestDay: {
      paid: false,                   // NO payment unless producer instructed
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════
// FRINGES (Statutory — not in BECTU agreement, but UK law)
// ═══════════════════════════════════════════════════════════════════════
export const FRINGES = {
  holidayPay: {
    percentage: 12.07,
    basis: '5.6 weeks statutory leave ÷ 46.4 working weeks',
    appliesTo: ['paye', 'sole_trader'],  // statutory entitlement for all workers
    excludes: ['ltd'],                    // Ltd handles via dividends
    source: 'Working Time Regulations 1998',
  },
  employerNI: {
    percentage: 13.8,
    threshold: 175,                       // weekly threshold (2024/25)
    appliesTo: ['paye'],
    source: 'HMRC National Insurance rates',
  },
  pension: {
    employerPercentage: 3,
    employeePercentage: 5,
    appliesTo: ['paye'],
    source: 'Auto-enrolment minimum contributions',
  },
  apprenticeshipLevy: {
    percentage: 0.5,
    payrollThreshold: 3_000_000,          // only if annual payroll > £3m
    appliesTo: ['paye'],
    source: 'Apprenticeship Levy Act 2016',
  },
};

// ═══════════════════════════════════════════════════════════════════════
// HELPER: Get all defaults for a BECTU PAYE deal memo
// ═══════════════════════════════════════════════════════════════════════
export function getBECTUDefaults(weeklyRate) {
  const hourly = OVERTIME.hourlyRate.fromWeekly(weeklyRate);
  const otRate = Math.min(hourly * OVERTIME.multipliers.standard, OVERTIME.maxOTRate);

  return {
    territory: 'UK',
    // Working hours
    standardWorkDayHrs: WORKING_DAY.shooting.SWD.hoursWorked,
    lunchBreakHrs: WORKING_DAY.shooting.SWD.lunchBreak,
    // Rates
    hourlyRate: hourly,
    dailyRate: Math.round(weeklyRate / 5 * 100) / 100,
    otRate1x5: otRate,
    otRate2x: Math.min(hourly * OVERTIME.multipliers.double, OVERTIME.maxOTRate),
    otRateCap: OVERTIME.maxOTRate,
    // Multipliers
    sixthDayMultiplier: SIXTH_SEVENTH_DAYS.sixthDay.multiplier,
    seventhDayMultiplier: SIXTH_SEVENTH_DAYS.seventhDay.multiplier,
    // Night
    nightPremiumEnabled: true,
    nightPremiumFlat: NIGHT_WORK.premium.amount,
    nightPremiumPct: 0,
    nightPremiumMode: 'flat',
    // Turnaround
    turnaroundMinHrs: TURNAROUND.minimumHours,
    btaEnabled: true,
    btaRate: TURNAROUND.brokenTurnaround.maxHourlyRate,
    btaIncrementMin: TURNAROUND.brokenTurnaround.incrementMinutes,
    // Meal
    mealPenaltyEnabled: true,
    mealPenaltyAfterHrs: MEAL_BREAKS.swd_scwd.maxHoursAfterUnitCall,
    mealPenaltyUseHourlyRate: true,
    mealPenaltyIncrementMin: MEAL_BREAKS.shootingCrewPenalty.delayed.incrementMinutes,
    minMealBreakMins: 30,
    // Fringes
    holidayPayPct: FRINGES.holidayPay.percentage,
    employerNiPct: FRINGES.employerNI.percentage,
    pensionPct: FRINGES.pension.employerPercentage,
    apprenticeshipLevyPct: FRINGES.apprenticeshipLevy.percentage,
    // Overtime
    overtimeApplicable: true,
  };
}
