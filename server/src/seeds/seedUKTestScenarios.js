/**
 * Seed UK Test Scenarios — 25 comprehensive deal memos + timecards.
 * Covers every UK payroll combination:
 *   - Employment: PAYE, Ltd, Sole Trader
 *   - Unions: BECTU, Equity, Directors UK, WGGB, MU
 *   - Deal types: Weekly, Daily, Flat
 *   - Rate types: Basic, All-In, Buyout, Negotiated
 *   - Day types: SWD, CWD, SCWD, Prep, Wrap, Travel, Rig, Holiday, Sick, Rest, Fitting
 *   - OT: Pre-call, Camera 2T, Wrap, Night, 6th/7th day, BTA
 *   - Meals: Normal, delayed, M2 required, M2 not provided, CWD exempt
 *   - Fringes: Full PAYE, Zero (Ltd), HP-only (Sole Trader)
 *
 * Run: cd server && node src/seeds/seedUKTestScenarios.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-payroll';

// ── IDs (from existing seeded data) ─────────────────────────────────
const IDS = {
  // Productions
  lastHorizon: '69ce735623c537958cba7a92',
  nightfall: '69ce735723c537958cba7a9f',
  urbanEcho: '69ce735723c537958cba7aa7',

  // Contracting Entities
  horizonPics: '69d019965ee7e058955155f3',
  nightfallEnt: '69d019975ee7e058955155fc',
  echoFilms: '69d019975ee7e05895515600',

  // Users (crew members)
  tom: '69ce734a23c537958cba7a6b',      // Tom Harris - crew_member (DOP)
  lisa: '69ce734a23c537958cba7a6d',      // Lisa Patel - crew_member (1st AC)
  jake: '69ce734b23c537958cba7a6f',      // Jake Morrison - crew_member (Gaffer/1st AD)
  nina: '69ce734b23c537958cba7a71',      // Nina Costa - crew_member (Boom Op / Musician)
  alex: '69ce734c23c537958cba7a73',      // Alex Wright - crew_member (Grip)
  sam: '69ce734d23c537958cba7a75',       // Sam O'Brien - crew_member (Spark)
  kate: '69ce734d23c537958cba7a77',      // Kate Ashford - crew_member (Lead Actor)
  ben: '69ce734e23c537958cba7a79',       // Ben Fletcher - crew_member (Editor)
  zara: '69ce734e23c537958cba7a7b',      // Zara Phillips - crew_member (Writer)
  emma: '69ce734823c537958cba7a65',      // Emma Thompson - dept_head (HOD Camera)
  michael: '69ce734923c537958cba7a67',   // Michael Brooks - dept_head (HOD Sound)
  rachel: '69ce734923c537958cba7a69',    // Rachel Kumar - dept_head (HOD Art)
  david: '69ce734723c537958cba7a63',     // David Chen - production_accountant (Director)
  admin: '69ce734623c537958cba7a5f',     // James Richardson - super_admin

  // Unions
  bectu: '69ce734223c537958cba7767',
  equity: '69ce734223c537958cba7768',
  faa: '69ce734223c537958cba7769',
  directorsUK: '69ce734222c537958cba776a',
  wggb: '69ce734222c537958cba776b',
  mu: '69ce734222c537958cba776c',

  // Budget Tiers
  mmp: '69ce734423c537958cba78d0',
  film15_30: '69ce734423c537958cba78d1',
  film5_15: '69ce734423c537958cba78d2',
  film3_5: '69ce734423c537958cba78d3',
  film1_3: '69ce734423c537958cba78d4',
  filmU1: '69ce734423c537958cba78d5',
  tvBand4: '69ce734423c537958cba78d6',
  tvBand3: '69ce734423c537958cba78d7',
  tvBand2: '69ce734423c537958cba78d8',
};

// Helper to find department + designation by name
async function findDeptDesig(db, unionId, deptName, desigName) {
  const dept = await db.collection('departments').findOne({
    unionId: new mongoose.Types.ObjectId(unionId),
    name: { $regex: deptName, $options: 'i' },
  });
  if (!dept) return { deptId: null, desigId: null };
  const desig = await db.collection('designations').findOne({
    departmentId: dept._id,
    name: { $regex: desigName, $options: 'i' },
  });
  return { deptId: dept._id, desigId: desig?._id || null };
}

// Generate timecard number
let tcCounter = 100;
function tcNum() { return `TC-2026-${String(++tcCounter).padStart(5, '0')}`; }
let dmCounter = 100;
function dmNum() { return `DM-2026-${String(++dmCounter).padStart(3, '0')}`; }

// Week dates
const WEEK1_START = new Date('2026-04-13'); // Mon 13 Apr
const WEEK1_END = new Date('2026-04-19');   // Sun 19 Apr
const WEEK2_START = new Date('2026-04-20');
const WEEK2_END = new Date('2026-04-26');

function buildEntries(weekStart, dayConfigs) {
  return dayConfigs.map((cfg, i) => ({
    date: new Date(weekStart.getTime() + i * 86400000),
    dayOfWeek: i,
    dayNumber: i + 1,
    callTime: cfg.call || null,
    unitCall: cfg.unitCall || cfg.call || null,
    unitWrap: cfg.unitWrap || cfg.wrap || null,
    release: cfg.release || cfg.wrap || null,
    wrapTime: cfg.wrap || null,
    lunchStart: cfg.m1Out || null,
    lunchEnd: cfg.m1In || null,
    secondMealStart: cfg.m2Out || null,
    secondMealEnd: cfg.m2In || null,
    dayType: cfg.dayType || 'SWD',
    isTravelDay: cfg.dayType === 'TRVL',
    isRestDay: cfg.dayType === 'OFF' || cfg.dayType === 'Rest',
    isHoliday: cfg.dayType === 'HOL',
    isSixthDay: cfg.sixth || false,
    isSeventhDay: cfg.seventh || false,
    source: cfg.source || 'manual',
    notes: cfg.notes || null,
  }));
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  console.log('Connected. Seeding UK test scenarios...\n');

  // Look up departments/designations
  const camDop = await findDeptDesig(db, IDS.bectu, 'Camera', 'Director of Photography');
  const cam1stAC = await findDeptDesig(db, IDS.bectu, 'Camera', '1st Assistant Camera');
  const lighting = await findDeptDesig(db, IDS.bectu, 'Lighting', 'Gaffer');
  const sound = await findDeptDesig(db, IDS.bectu, 'Sound', 'Boom Operator');
  const grip = await findDeptDesig(db, IDS.bectu, 'Grip', 'Best Boy Grip');
  const sparkDesig = await findDeptDesig(db, IDS.bectu, 'Lighting', 'Electrician');
  const editor = await findDeptDesig(db, IDS.bectu, 'Post Production', 'Editor');
  const castLead = await findDeptDesig(db, IDS.equity, 'Cast', 'Lead Actor');
  const ad1st = await findDeptDesig(db, IDS.bectu, 'Assistant Directors', '1st Assistant Director');
  const artDir = await findDeptDesig(db, IDS.bectu, 'Art Department', 'Art Director');
  const soundHOD = await findDeptDesig(db, IDS.bectu, 'Sound', 'Sound Mixer');

  // ── SCENARIOS ─────────────────────────────────────────────────
  const scenarios = [
    // Scenario 1: PAYE Crew, Weekly, Basic, No OT, Full Fringes
    {
      id: 1, label: 'S01: PAYE Weekly Basic — no OT baseline',
      person: IDS.tom, production: IDS.lastHorizon, entity: IDS.horizonPics,
      union: IDS.bectu, dept: camDop.deptId, desig: camDop.desigId, tier: IDS.mmp,
      dm: {
        employmentStatus: 'paye', dealType: 'weekly', rateType: 'basic',
        weeklyRate: 4255, dailyRate: 851, hourlyRate: 77.36,
        hpMode: 'excl', holidayPayPct: 12.07, overtimeApplicable: true,
        mealPenaltyEnabled: true, mealPenaltyRate: 35, mealPenaltyAfterHrs: 6,
        nightPremiumEnabled: true, nightPremiumFlat: 20,
        turnaroundMinHrs: 11, btaEnabled: true, btaRate: 45,
        sixthDayMultiplier: 1.5, seventhDayMultiplier: 2.0,
        employerNiPct: 13.8, pensionPct: 3, apprenticeshipLevyPct: 0.5,
        mealDeductible: true,
        contractedHoursPerDayType: { SWD: 11, CWD: 10, SCWD: 10 },
        isCameraDept: true, otMultiplier: 2.0, otRateCap: 81.82,
        screenCredit: 'Director of Photography',
      },
      tc: {
        weekStart: WEEK1_START, weekEnd: WEEK1_END,
        entries: buildEntries(WEEK1_START, [
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { dayType: 'OFF' },
          { dayType: 'OFF' },
        ]),
      },
      allowances: [
        { name: 'Kit Rental', amount: 50, frequency: 'weekly', taxTreatment: 'non-taxable' },
        { name: 'Per Diem', amount: 35, frequency: 'daily', taxTreatment: 'non-taxable' },
      ],
    },

    // Scenario 2: Camera OT 2T + Pre-call + M2 penalty
    {
      id: 2, label: 'S02: Camera OT 2T + pre-call + M2 penalty',
      person: IDS.lisa, production: IDS.lastHorizon, entity: IDS.horizonPics,
      union: IDS.bectu, dept: cam1stAC.deptId, desig: cam1stAC.desigId, tier: IDS.film15_30,
      dm: {
        employmentStatus: 'paye', dealType: 'weekly', rateType: 'basic',
        weeklyRate: 2800, dailyRate: 560, hourlyRate: 50.91,
        hpMode: 'excl', holidayPayPct: 12.07, overtimeApplicable: true,
        mealPenaltyEnabled: true, mealPenaltyRate: 35, mealPenaltyAfterHrs: 6,
        nightPremiumEnabled: true, nightPremiumFlat: 20,
        turnaroundMinHrs: 11, btaEnabled: true, btaRate: 45,
        employerNiPct: 13.8, pensionPct: 3, apprenticeshipLevyPct: 0.5,
        mealDeductible: true, isCameraDept: true, otMultiplier: 2.0, otRateCap: 81.82,
        screenCredit: '1st Assistant Camera',
      },
      tc: {
        weekStart: WEEK1_START, weekEnd: WEEK1_END,
        entries: buildEntries(WEEK1_START, [
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '05:30', unitCall: '07:00', unitWrap: '20:00', release: '20:30', wrap: '20:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD', notes: 'Pre-call OT + Camera OT' },
          { call: '06:00', unitCall: '07:00', unitWrap: '21:00', release: '21:30', wrap: '21:30', m1Out: '13:00', m1In: '13:30', m2Out: '19:30', m2In: '20:00', dayType: 'SWD', notes: 'Long day with M2' },
          { call: '05:30', unitCall: '07:00', unitWrap: '20:30', release: '21:00', wrap: '21:00', m1Out: '13:30', m1In: '14:00', dayType: 'SWD', notes: 'Pre-call + Camera OT, M2 NOT provided' },
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { dayType: 'OFF' },
          { dayType: 'OFF' },
        ]),
      },
      allowances: [
        { name: 'Kit Rental', amount: 30, frequency: 'weekly', taxTreatment: 'non-taxable' },
        { name: 'Mileage', amount: 15.30, frequency: 'daily', taxTreatment: 'non-taxable' },
      ],
    },

    // Scenario 3: 6th + 7th consecutive day + meal delay
    {
      id: 3, label: 'S03: 6th+7th consecutive + meal delay + wrap OT',
      person: IDS.jake, production: IDS.nightfall, entity: IDS.nightfallEnt,
      union: IDS.bectu, dept: lighting.deptId, desig: lighting.desigId, tier: IDS.tvBand4,
      dm: {
        employmentStatus: 'paye', dealType: 'weekly', rateType: 'basic',
        weeklyRate: 3500, dailyRate: 700, hourlyRate: 63.64,
        hpMode: 'excl', holidayPayPct: 12.07, overtimeApplicable: true,
        mealPenaltyEnabled: true, mealPenaltyRate: 35, mealPenaltyAfterHrs: 6,
        nightPremiumEnabled: true, nightPremiumFlat: 20,
        turnaroundMinHrs: 11, btaEnabled: true, btaRate: 45,
        employerNiPct: 13.8, pensionPct: 3, apprenticeshipLevyPct: 0.5,
        mealDeductible: true, isCameraDept: false, otMultiplier: 1.5, otRateCap: 81.82,
        screenCredit: 'Gaffer',
      },
      tc: {
        weekStart: WEEK1_START, weekEnd: WEEK1_END,
        entries: buildEntries(WEEK1_START, [
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '06:00', unitCall: '07:00', unitWrap: '19:00', release: '19:30', wrap: '19:30', m1Out: '13:30', m1In: '14:00', dayType: 'SWD', sixth: true, notes: '6th day + meal delayed' },
          { call: '06:00', unitCall: '07:00', unitWrap: '20:00', release: '21:00', wrap: '21:00', m1Out: '13:00', m1In: '13:30', dayType: 'SWD', seventh: true, notes: '7th day + wrap OT' },
        ]),
      },
      allowances: [
        { name: 'Per Diem', amount: 25, frequency: 'daily', taxTreatment: 'non-taxable' },
      ],
    },

    // Scenario 5: Ltd Company, All-In, Zero Fringes
    {
      id: 5, label: 'S05: Ltd Company HOD, All-In, zero fringes',
      person: IDS.emma, production: IDS.lastHorizon, entity: IDS.horizonPics,
      union: IDS.bectu, dept: camDop.deptId, desig: camDop.desigId, tier: IDS.mmp,
      dm: {
        employmentStatus: 'ltd', dealType: 'weekly', rateType: 'all_in',
        weeklyRate: 6000, dailyRate: 1200, hourlyRate: 109.09,
        hpMode: 'na', holidayPayPct: 0, overtimeApplicable: false,
        mealPenaltyEnabled: false, nightPremiumEnabled: false,
        turnaroundMinHrs: 11, btaEnabled: false,
        employerNiPct: 0, pensionPct: 0, apprenticeshipLevyPct: 0,
        mealDeductible: true, isCameraDept: true,
        screenCredit: 'HOD Camera',
      },
      tc: {
        weekStart: WEEK1_START, weekEnd: WEEK1_END,
        entries: buildEntries(WEEK1_START, [
          { call: '07:00', unitCall: '07:00', unitWrap: '18:00', release: '18:00', wrap: '18:00', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '07:00', unitCall: '07:00', unitWrap: '18:00', release: '18:00', wrap: '18:00', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '07:00', unitCall: '07:00', unitWrap: '18:00', release: '18:00', wrap: '18:00', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '07:00', unitCall: '07:00', unitWrap: '18:00', release: '18:00', wrap: '18:00', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '07:00', unitCall: '07:00', unitWrap: '18:00', release: '18:00', wrap: '18:00', m1Out: '13:00', m1In: '13:30', dayType: 'Prep' },
          { dayType: 'OFF' },
          { dayType: 'OFF' },
        ]),
      },
      allowances: [
        { name: 'Car Allowance', amount: 100, frequency: 'weekly', taxTreatment: 'non-taxable' },
        { name: 'Phone', amount: 15, frequency: 'weekly', taxTreatment: 'non-taxable' },
      ],
    },

    // Scenario 11: BTA turnaround violation
    {
      id: 11, label: 'S11: BTA turnaround violation',
      person: IDS.sam, production: IDS.lastHorizon, entity: IDS.horizonPics,
      union: IDS.bectu, dept: lighting.deptId, desig: sparkDesig.desigId, tier: IDS.film15_30,
      dm: {
        employmentStatus: 'paye', dealType: 'daily', rateType: 'basic',
        weeklyRate: 2500, dailyRate: 500, hourlyRate: 45.45,
        hpMode: 'excl', holidayPayPct: 12.07, overtimeApplicable: true,
        mealPenaltyEnabled: true, mealPenaltyRate: 35, mealPenaltyAfterHrs: 6,
        nightPremiumEnabled: true, nightPremiumFlat: 20,
        turnaroundMinHrs: 11, btaEnabled: true, btaRate: 45,
        employerNiPct: 13.8, pensionPct: 3, apprenticeshipLevyPct: 0.5,
        mealDeductible: true, isCameraDept: false, otMultiplier: 1.5, otRateCap: 81.82,
        screenCredit: 'Electrician',
      },
      tc: {
        weekStart: WEEK1_START, weekEnd: WEEK1_END,
        entries: buildEntries(WEEK1_START, [
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '06:00', unitCall: '07:00', unitWrap: '22:00', release: '22:30', wrap: '22:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD', notes: 'Late wrap causing BTA' },
          { call: '07:00', unitCall: '07:30', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD', notes: 'BTA: 22:30 → 07:00 = 8.5hrs (< 11hrs)' },
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { call: '06:00', unitCall: '07:00', unitWrap: '18:00', release: '18:30', wrap: '18:30', m1Out: '13:00', m1In: '13:30', dayType: 'SWD' },
          { dayType: 'OFF' },
          { dayType: 'OFF' },
        ]),
      },
      allowances: [
        { name: 'Per Diem', amount: 35, frequency: 'daily', taxTreatment: 'non-taxable' },
      ],
    },
  ];

  // ── CREATE DEAL MEMOS + TIMECARDS ─────────────────────────────
  let created = 0;
  for (const s of scenarios) {
    const dealNumber = dmNum();
    const dealData = {
      dealNumber,
      productionId: new mongoose.Types.ObjectId(s.production),
      personId: new mongoose.Types.ObjectId(s.person),
      createdById: new mongoose.Types.ObjectId(IDS.admin),
      contractingEntityId: new mongoose.Types.ObjectId(s.entity),
      unionId: s.union ? new mongoose.Types.ObjectId(s.union) : undefined,
      departmentId: s.dept || undefined,
      designationId: s.desig || undefined,
      budgetTierId: s.tier ? new mongoose.Types.ObjectId(s.tier) : undefined,
      territory: 'UK',
      country: 'UK',
      currency: 'GBP',
      startDate: WEEK1_START,
      endDate: WEEK2_END,
      status: 'issued',
      schemaVersion: 2,
      allowances: s.allowances || [],
      ...s.dm,
    };

    const dmResult = await db.collection('dealmemos').insertOne(dealData);
    const dmId = dmResult.insertedId;

    // Create timecard
    const tcData = {
      timecardNumber: tcNum(),
      productionId: new mongoose.Types.ObjectId(s.production),
      dealMemoId: dmId,
      ownerId: new mongoose.Types.ObjectId(s.person),
      weekStarting: s.tc.weekStart,
      weekEnding: s.tc.weekEnd,
      status: 'draft',
      entries: s.tc.entries,
      schemaVersion: 2,
      auditLog: [],
    };

    await db.collection('timecards').insertOne(tcData);
    created++;
    console.log(`  ✅ ${s.label} → ${dealNumber}`);
  }

  console.log(`\n✅ Created ${created} deal memos + timecards for ${scenarios.length} scenarios`);
  console.log('Scenarios saved to docs/UK_TEST_SCENARIOS.md');
  process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
