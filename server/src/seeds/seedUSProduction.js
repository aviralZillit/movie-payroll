/**
 * Seed a US-based production: "Midnight in Manhattan"
 *
 * Creates:
 * - US Production (New York, IATSE)
 * - 3 crew members with different employment types:
 *   1. Sarah Chen — Gaffer (IATSE Local 728), W-2 Employee
 *   2. Marcus Rivera — Key Grip (IATSE Local 80), Loan-Out (Corp)
 *   3. Priya Patel — Camera Operator (IATSE Local 600), W-2 Employee
 * - Deal memos with US-specific rates (IATSE BA, NDM, 10hr turnaround, $50 meal penalty)
 * - 8 weeks of timecards with varied scenarios:
 *   Wk1: Normal 5-day prep (light OT)
 *   Wk2: First shoot week (moderate OT, some meal penalties)
 *   Wk3: Heavy week (long days, night shoots, forced call, meal penalties)
 *   Wk4: 6th day work, turnaround violations
 *   Wk5: Night block (all night shoots, NDM in effect)
 *   Wk6: Mixed — 2 night, 3 day, BTA + forced calls
 *   Wk7: Wrap/travel week (lighter hours)
 *   Wk8: Final week (3 days only)
 *
 * Run: node src/seeds/seedUSProduction.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-payroll';

// ── IATSE rates (2025–2026 Basic Agreement scale — from Topsheet/728) ──
// Source: https://www.topsheet.io/edu/rates/iatse/iatse-theatrical-theatrical-rates
// Gaffer / Chief Lighting Technician (Local 728) — high budget theatrical
const GAFFER_RATES = {
  weeklyRate: 4353.30,  // IATSE scale $4,353.30/wk
  dailyRate: 870.66,    // $4,353.30 / 5
  hourlyRate: 63.01,    // IATSE scale $63.01/hr (studio rate)
  otRate1x5: 94.52,     // 1.5x = $94.52/hr
  otRate2x: 126.02,     // 2x = $126.02/hr (after 12h or golden)
  otRateCap: null,      // No cap for IATSE
  otMultiplier: 1.5,
};

// Key Grip / 1st Company Grip (Local 80) — high budget theatrical
const GRIP_RATES = {
  weeklyRate: 3793.59,  // IATSE scale $3,793.59/wk
  dailyRate: 758.72,    // $3,793.59 / 5
  hourlyRate: 63.01,    // IATSE scale $63.01/hr (same hourly as 728)
  otRate1x5: 94.52,     // 1.5x = $94.52/hr
  otRate2x: 126.02,     // 2x = $126.02/hr
  otRateCap: null,
  otMultiplier: 1.5,
};

// Camera Operator (Local 600) — high budget theatrical
const CAM_OP_RATES = {
  weeklyRate: 5907.15,  // IATSE scale $5,907.15/wk
  dailyRate: 1181.43,   // $5,907.15 / 5
  hourlyRate: 147.68,   // $1,181.43 / 8
  otRate1x5: 221.52,    // 1.5x = $221.52/hr
  otRate2x: 295.36,     // 2x = $295.36/hr
  otRateCap: null,
  otMultiplier: 1.5,
  isCameraDept: true,
};

// ── Week definitions ─────────────────────────────────────────────────
// Each week defines per-day schedules. Times in HH:MM format.
// dayType: SWD (Studio Work Day), CWD (Camera Work Day = on-set), LOC (Location), TRVL (Travel)
const WEEKS = [
  // ── WK 1: Prep Week (light OT, no penalties) ──
  {
    n: 1, start: '2026-02-02', status: 'paid', phase: 'Prep',
    days: [
      { type: 'SWD', call: '07:00', uCall: '08:00', uWrap: '17:00', rel: '17:30', l1s: '12:00', l1e: '12:30' },
      { type: 'SWD', call: '07:00', uCall: '08:00', uWrap: '17:00', rel: '17:30', l1s: '12:00', l1e: '12:30' },
      { type: 'SWD', call: '07:00', uCall: '08:00', uWrap: '18:00', rel: '18:30', l1s: '12:00', l1e: '12:30' },
      { type: 'SWD', call: '06:30', uCall: '07:30', uWrap: '18:00', rel: '18:30', l1s: '12:00', l1e: '12:30' },
      { type: 'SWD', call: '07:00', uCall: '08:00', uWrap: '17:00', rel: '17:00', l1s: '12:00', l1e: '12:30' },
      null, null, // Sat, Sun off
    ],
    pipeline: { sub: '2026-02-07', app: '2026-02-09', pay: '2026-02-10', paid: '2026-02-12' },
  },
  // ── WK 2: First Shoot (moderate OT, 1 meal penalty) ──
  {
    n: 2, start: '2026-02-09', status: 'paid', phase: 'Shoot Blk 1',
    days: [
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '18:00', rel: '18:30', l1s: '12:00', l1e: '12:30' },
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '19:00', rel: '19:30', l1s: '12:30', l1e: '13:00' },
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '18:30', rel: '19:00', l1s: '12:00', l1e: '12:30' },
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '19:00', rel: '19:30', l1s: '13:00', l1e: '13:30' }, // Meal penalty: lunch at 13:00, 7h after call
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '18:00', rel: '18:30', l1s: '12:00', l1e: '12:30' },
      null, null,
    ],
    pipeline: { sub: '2026-02-14', app: '2026-02-16', pay: '2026-02-17', paid: '2026-02-19' },
  },
  // ── WK 3: Heavy Week (long days, night shoot, forced call, multiple meal penalties) ──
  {
    n: 3, start: '2026-02-16', status: 'paid', phase: 'Shoot Blk 1',
    days: [
      { type: 'CWD', call: '05:30', uCall: '06:30', uWrap: '19:30', rel: '20:00', l1s: '12:00', l1e: '12:30' }, // 14.5h day, meal at 12 = 6.5h (penalty)
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '20:00', rel: '20:30', l1s: '13:00', l1e: '13:30' }, // Turnaround: 20:00→06:00 = 10h (forced call, min 10h IATSE). Meal at 13 = 7h (penalty)
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '21:00', rel: '21:30', l1s: '12:30', l1e: '13:00', l2s: '18:00', l2e: '18:30' }, // 15.5h! Forced call (20:30→06:00=9.5h). 2nd meal.
      { type: 'CWD', call: '17:00', uCall: '18:00', uWrap: '05:00', rel: '05:30', l1s: '23:00', l1e: '23:30', night: true }, // Night shoot. Turnaround: 21:30→17:00 enough
      { type: 'CWD', call: '17:00', uCall: '18:00', uWrap: '04:00', rel: '04:30', l1s: '23:00', l1e: '23:30', night: true }, // Night shoot 2
      null, null,
    ],
    pipeline: { sub: '2026-02-21', app: '2026-02-23', pay: '2026-02-24', paid: '2026-02-26' },
  },
  // ── WK 4: 6th Day Work + Turnaround Violations ──
  {
    n: 4, start: '2026-02-23', status: 'paid', phase: 'Shoot Blk 1',
    days: [
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '19:00', rel: '19:30', l1s: '12:00', l1e: '12:30' },
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '20:00', rel: '20:30', l1s: '12:00', l1e: '12:30', l2s: '17:30', l2e: '18:00' }, // Long day + 2nd meal
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '19:00', rel: '19:30', l1s: '12:00', l1e: '12:30' }, // Forced call (20:30→06:00=9.5h)
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '18:00', rel: '18:30', l1s: '12:00', l1e: '12:30' },
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '20:00', rel: '20:30', l1s: '12:00', l1e: '12:30', l2s: '17:00', l2e: '17:30' },
      { type: 'CWD', call: '07:00', uCall: '08:00', uWrap: '16:00', rel: '16:30', l1s: '12:00', l1e: '12:30', sixth: true }, // 6TH DAY — 1.5x premium
      null,
    ],
    pipeline: { sub: '2026-02-28', app: '2026-03-02', pay: '2026-03-03', paid: '2026-03-05' },
  },
  // ── WK 5: Full Night Block (NDM, all nights) ──
  {
    n: 5, start: '2026-03-02', status: 'paid', phase: 'Shoot Blk 2',
    days: [
      { type: 'CWD', call: '16:00', uCall: '17:00', uWrap: '04:00', rel: '04:30', l1s: '22:00', l1e: '22:30', night: true },
      { type: 'CWD', call: '16:00', uCall: '17:00', uWrap: '05:00', rel: '05:30', l1s: '22:00', l1e: '22:30', night: true }, // 13.5h
      { type: 'CWD', call: '17:00', uCall: '18:00', uWrap: '05:00', rel: '05:30', l1s: '23:00', l1e: '23:30', night: true },
      { type: 'CWD', call: '17:00', uCall: '18:00', uWrap: '04:30', rel: '05:00', l1s: '23:00', l1e: '23:30', night: true },
      { type: 'CWD', call: '17:00', uCall: '18:00', uWrap: '04:00', rel: '04:30', l1s: '23:00', l1e: '23:30', night: true },
      null, null,
    ],
    pipeline: { sub: '2026-03-07', app: '2026-03-09', pay: '2026-03-10', paid: '2026-03-12' },
  },
  // ── WK 6: Mixed — 2 Night + 3 Day, BTA/Forced Calls ──
  {
    n: 6, start: '2026-03-09', status: 'approved', phase: 'Shoot Blk 2',
    days: [
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '19:00', rel: '19:30', l1s: '12:00', l1e: '12:30' },
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '20:00', rel: '20:30', l1s: '13:00', l1e: '13:30' }, // Meal penalty (lunch 13:00 = 7h after call)
      { type: 'CWD', call: '06:00', uCall: '07:00', uWrap: '19:30', rel: '20:00', l1s: '12:00', l1e: '12:30' }, // Forced call (20:30→06:00=9.5h)
      { type: 'CWD', call: '16:00', uCall: '17:00', uWrap: '04:00', rel: '04:30', l1s: '22:00', l1e: '22:30', night: true }, // Day-to-night flip
      { type: 'CWD', call: '16:00', uCall: '17:00', uWrap: '03:00', rel: '03:30', l1s: '22:00', l1e: '22:30', night: true },
      null, null,
    ],
    pipeline: { sub: '2026-03-14', app: '2026-03-16', pay: null, paid: null },
  },
  // ── WK 7: Wrap/Travel (lighter) ──
  {
    n: 7, start: '2026-03-16', status: 'submitted', phase: 'Wrap',
    days: [
      { type: 'CWD', call: '07:00', uCall: '08:00', uWrap: '17:00', rel: '17:30', l1s: '12:00', l1e: '12:30' },
      { type: 'CWD', call: '07:00', uCall: '08:00', uWrap: '18:00', rel: '18:30', l1s: '12:00', l1e: '12:30' },
      { type: 'SWD', call: '08:00', uCall: '09:00', uWrap: '17:00', rel: '17:00', l1s: '12:30', l1e: '13:00' },
      { type: 'TRVL', call: '06:00', uCall: '06:00', uWrap: '14:00', rel: '14:00', l1s: '10:00', l1e: '10:30' },
      { type: 'SWD', call: '08:00', uCall: '09:00', uWrap: '16:00', rel: '16:00', l1s: '12:00', l1e: '12:30' },
      null, null,
    ],
    pipeline: { sub: '2026-03-21', app: null, pay: null, paid: null },
  },
  // ── WK 8: Final (3 days only) ──
  {
    n: 8, start: '2026-03-23', status: 'draft', phase: 'Wrap',
    days: [
      { type: 'SWD', call: '08:00', uCall: '09:00', uWrap: '17:00', rel: '17:00', l1s: '12:00', l1e: '12:30' },
      { type: 'SWD', call: '08:00', uCall: '09:00', uWrap: '17:00', rel: '17:00', l1s: '12:00', l1e: '12:30' },
      { type: 'SWD', call: '08:00', uCall: '09:00', uWrap: '15:00', rel: '15:00', l1s: '12:00', l1e: '12:30' },
      null, null, null, null, // Thu-Sun off
    ],
    pipeline: { sub: null, app: null, pay: null, paid: null },
  },
];

// ── Crew definitions ──────────────────────────────────────────────────
const CREW = [
  {
    firstName: 'Sarah', lastName: 'Chen',
    email: 'sarah.chen@midnightmanhattan.com',
    role: 'Gaffer',
    deptCode: 'ELC',
    deptName: 'Electricians (Local 728)',
    desigName: 'Gaffer',
    employmentStatus: 'w2',
    rates: GAFFER_RATES,
    tcPrefix: 'SC',
  },
  {
    firstName: 'Marcus', lastName: 'Rivera',
    email: 'marcus.rivera@midnightmanhattan.com',
    role: 'Key Grip',
    deptCode: 'GRP',
    deptName: 'Grips (Local 80)',
    desigName: 'Key Grip',
    employmentStatus: 'loan_out',
    loanOutCompany: 'Rivera Grip Services LLC',
    rates: GRIP_RATES,
    tcPrefix: 'MR',
  },
  {
    firstName: 'Priya', lastName: 'Patel',
    email: 'priya.patel@midnightmanhattan.com',
    role: 'Camera Operator',
    deptCode: 'CAM',
    deptName: 'Camera (Local 600)',
    desigName: 'Camera Operator',
    employmentStatus: 'w2',
    rates: CAM_OP_RATES,
    tcPrefix: 'PP',
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to', MONGO_URI.includes('@') ? 'remote DB' : 'local DB');

  const { User } = await import('../models/index.js');
  const Production = (await import('../models/Production.js')).default;
  const Department = (await import('../models/Department.js')).default;
  const Designation = (await import('../models/Designation.js')).default;
  const Union = (await import('../models/Union.js')).default;
  const DealMemo = (await import('../models/DealMemo.js')).default;
  const { Timecard } = await import('../models/index.js');

  // ── Production ──────────────────────────────────────────────────
  let prod = await Production.findOne({ code: 'MIM' });
  if (!prod) {
    prod = await Production.create({
      name: 'Midnight in Manhattan',
      code: 'MIM',
      productionType: 'feature_film',
      country: 'US',
      currency: 'USD',
      budget: 35000000,
      startDate: new Date('2026-02-02'),
      endDate: new Date('2026-03-29'),
      status: 'production',
      companyName: 'Midnight Pictures Inc.',
    });
    console.log('Created production: Midnight in Manhattan');
  } else {
    console.log('Production already exists:', prod.name);
  }

  // ── Union ───────────────────────────────────────────────────────
  let iatse = await Union.findOne({ code: 'IATSE' });
  if (!iatse) {
    iatse = await Union.create({
      code: 'IATSE', name: 'International Alliance of Theatrical Stage Employees',
      country: 'US', standardWorkDayHrs: 8, standardLunchHrs: 0.5,
      minTurnaroundHrs: 10, holidayPayPct: 9,
    });
    console.log('Created IATSE union');
  }

  // ── Admin user (for createdById) ──
  let admin = await User.findOne({ role: { $in: ['admin', 'payroll_admin'] } });
  if (!admin) admin = await User.findOne({});

  // ── Ensure all users are production members ─────────────────────
  const allUsers = await User.find({});
  const existingMemberIds = new Set((prod.members || []).map(m => m.userId?.toString()));
  const newMembers = allUsers
    .filter(u => !existingMemberIds.has(u._id.toString()))
    .map(u => ({ userId: u._id, role: u.role || 'crew_member', joinedAt: new Date() }));
  if (newMembers.length > 0) {
    prod.members = [...(prod.members || []), ...newMembers];
    await prod.save();
    console.log(`Added ${newMembers.length} members to production (total: ${prod.members.length})`);
  }

  // ── Process each crew member ────────────────────────────────────
  for (const crew of CREW) {
    console.log(`\n── Processing ${crew.firstName} ${crew.lastName} (${crew.role}) ──`);

    // Find or create user
    let user = await User.findOne({ firstName: crew.firstName, lastName: crew.lastName });
    if (!user) {
      user = await User.create({
        firstName: crew.firstName, lastName: crew.lastName,
        email: crew.email, passwordHash: '$2b$10$dummyhash',
        role: 'crew_member', isActive: true,
      });
      console.log(`  Created user: ${crew.firstName} ${crew.lastName}`);
    }

    // Find department
    const dept = await Department.findOne({
      $or: [
        { code: crew.deptCode, name: new RegExp(crew.deptCode, 'i') },
        { name: new RegExp(crew.deptName.replace(/[()]/g, '\\$&'), 'i') },
        { code: crew.deptCode },
      ]
    });

    // Find or create designation
    let desig = await Designation.findOne({ name: new RegExp(crew.desigName, 'i') });
    if (!desig) {
      desig = await Designation.create({
        name: crew.desigName, code: crew.desigName.toUpperCase().replace(/\s+/g, '_'),
        departmentId: dept?._id,
      });
      console.log(`  Created designation: ${crew.desigName}`);
    }

    // ── Deal Memo ─────────────────────────────────────────────────
    let dm = await DealMemo.findOne({ productionId: prod._id, personId: user._id });
    if (dm) {
      console.log(`  Deal memo already exists: ${dm.dealNumber}`);
    } else {
      dm = await DealMemo.create({
        productionId: prod._id,
        personId: user._id,
        crewMemberId: user._id,
        departmentId: dept?._id,
        designationId: desig?._id,
        unionId: iatse?._id,
        screenCredit: crew.role,
        employmentStatus: crew.employmentStatus,
        loanOutCompany: crew.loanOutCompany || undefined,
        dealType: 'weekly',
        rateType: 'basic',
        territory: 'US',
        state: 'NY',
        schemaVersion: 2,

        // Rates from crew definition
        weeklyRate: crew.rates.weeklyRate,
        dailyRate: crew.rates.dailyRate,
        hourlyRate: crew.rates.hourlyRate,
        otRate1x5: crew.rates.otRate1x5,
        otRate2x: crew.rates.otRate2x,
        otRateCap: crew.rates.otRateCap || undefined,
        otMultiplier: crew.rates.otMultiplier,
        isCameraDept: crew.rates.isCameraDept || false,

        // IATSE standard hours
        contractedHoursPerDay: 8, // IATSE 8-hour day
        standardWorkDayHrs: 8,

        // US NDM: hours run continuously through meals (clock doesn't stop)
        mealDeductible: false,

        // Turnaround: IATSE 10-hour minimum
        turnaroundMinHrs: 10,
        btaEnabled: true,
        btaRate: crew.rates.otRate1x5, // BTA at 1.5x rate

        // Meal penalty: $50 per 15-min increment after 6 hours
        mealPenaltyEnabled: true,
        mealPenaltyRate: 50,
        mealPenaltyAfterHrs: 6,

        // Night premium: 10% of daily rate
        nightPremiumEnabled: true,
        nightPremiumFlat: Math.round(crew.rates.dailyRate * 0.10),

        // 6th/7th day premiums (IATSE)
        sixthDayMultiplier: 1.5,
        seventhDayMultiplier: 2.0,

        // Holiday pay: 8.583% vacation/holiday (IATSE)
        holidayPayPct: 8.583,
        hpMode: 'excl',

        // US Fringes (employer side)
        employerNiPct: 0,        // No NI in US
        employerNiThresholdWeekly: 0,
        pensionPct: 7.5,         // IATSE pension
        vacationHolidayPct: 8.583,

        // Allowances
        allowances: [
          { name: 'Box Rental', amount: 75, frequency: 'weekly', taxTreatment: 'non-taxable' },
          { name: 'Per Diem', amount: 60, frequency: 'daily', taxTreatment: 'non-taxable' },
          { name: 'Car Allowance', amount: 100, frequency: 'weekly', taxTreatment: 'taxable' },
          { name: 'Cell Phone', amount: 15, frequency: 'weekly', taxTreatment: 'non-taxable' },
        ],

        startDate: new Date('2026-02-02'),
        dealNumber: `DM-MIM-${crew.tcPrefix}`,
        createdById: admin?._id || user._id,
        status: 'signed',
      });
      console.log(`  Created deal memo: ${dm.dealNumber} (${crew.employmentStatus})`);
    }

    // ── Delete existing timecards for this crew+production ─────────
    const deleted = await Timecard.deleteMany({ productionId: prod._id, ownerId: user._id });
    if (deleted.deletedCount > 0) console.log(`  Deleted ${deleted.deletedCount} existing timecards`);

    // ── Create timecards ──────────────────────────────────────────
    const dmAllowanceWeekly = (dm.allowances || []).reduce((s, a) => s + (Number(a.amount) || 0), 0);

    let created = 0;
    for (const w of WEEKS) {
      const weekStart = new Date(w.start);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const entries = [];
      let prevDayEntry = null;

      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + d);
        const dayDef = w.days[d];
        const isWorked = dayDef !== null;

        if (!isWorked) {
          entries.push({
            date,
            dayOfWeek: d + 1,
            dayType: d >= 5 ? 'OFF' : 'OFF',
            isRestDay: true,
            basicPay: 0, preCallOTPay: 0, filmingOTPay: 0, wrapOTPay: 0,
            btaPay: 0, mealDelayPay: 0, nightPremPay: 0, dayTotal: 0,
            straightHrs: 0, totalWorkedHrs: 0,
            preCallOTMins: 0, filmingOTMins: 0, wrapOTMins: 0,
            btaMins: 0, mealDelayMins: 0,
          });
          prevDayEntry = null;
          continue;
        }

        // Parse times for calculations
        const parseMins = (t) => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
        const callM = parseMins(dayDef.call);
        const uCallM = parseMins(dayDef.uCall);
        let uWrapM = parseMins(dayDef.uWrap);
        let relM = parseMins(dayDef.rel);
        const l1sM = parseMins(dayDef.l1s);
        const l1eM = parseMins(dayDef.l1e);
        const l2sM = parseMins(dayDef.l2s);
        const l2eM = parseMins(dayDef.l2e);

        // Handle overnight wraps
        if (uWrapM < uCallM) uWrapM += 1440;
        if (relM < callM) relM += 1440;

        // NDM: meals don't deduct (US IATSE)
        const totalMins = Math.max(0, relM - callM);
        const totalWorkedHrs = Math.round(totalMins / 60 * 100) / 100;

        // Pre-call OT
        const preCallOTMins = Math.max(0, uCallM - callM);

        // Contracted hours IATSE = 8h
        const contractedMins = 8 * 60;
        // Filming time: unitCall → unitWrap (NDM = no deduction for lunch)
        const filmingMins = Math.max(0, uWrapM - uCallM);
        const filmingOTMins = Math.max(0, filmingMins - contractedMins);

        // Wrap OT: unitWrap → release
        const wrapOTMins = Math.max(0, relM - uWrapM);

        // Straight hours
        const otTotalMins = preCallOTMins + filmingOTMins + wrapOTMins;
        const straightMins = Math.max(0, totalMins - otTotalMins);
        const straightHrs = Math.round(straightMins / 60 * 100) / 100;

        // BTA: check turnaround from previous day
        let btaMins = 0;
        let turnaroundViolation = false;
        let turnaroundHrs = 0;
        let turnaroundShortfallHrs = 0;
        if (prevDayEntry && prevDayEntry.rel) {
          const prevRelM = parseMins(prevDayEntry.rel);
          if (prevRelM !== null) {
            let turnaround = callM - prevRelM;
            if (turnaround < 0) turnaround += 1440;
            turnaroundHrs = Math.round(turnaround / 60 * 100) / 100;
            const minTA = 10 * 60; // IATSE 10h
            if (turnaround < minTA) {
              btaMins = minTA - turnaround;
              turnaroundViolation = true;
              turnaroundShortfallHrs = Math.round(btaMins / 60 * 100) / 100;
            }
          }
        }

        // Meal delay: penalty if first meal > 6h after call
        let mealDelayMins = 0;
        if (l1sM !== null && callM !== null) {
          let mealStart = l1sM;
          if (mealStart < callM) mealStart += 1440;
          const hoursToMeal = mealStart - callM;
          if (hoursToMeal > 6 * 60) {
            mealDelayMins = hoursToMeal - 6 * 60;
          }
        }

        // Pay calculations
        const r = crew.rates;
        const otRate = r.otRate1x5;
        const filmOTRate = r.isCameraDept ? r.otRate2x : r.otRate1x5;
        const basicPay = r.dailyRate;
        const preCallOTPay = Math.round(preCallOTMins / 60 * otRate * 100) / 100;
        const filmingOTPay = Math.round(filmingOTMins / 60 * filmOTRate * 100) / 100;
        const wrapOTPay = Math.round(wrapOTMins / 60 * otRate * 100) / 100;
        const btaPay = btaMins > 0 ? Math.round(btaMins / 60 * otRate * 100) / 100 : 0;
        const mealDelayPay = mealDelayMins > 0 ? Math.ceil(mealDelayMins / 15) * 50 : 0;
        const nightPremPay = dayDef.night ? Math.round(r.dailyRate * 0.10) : 0;

        // 6th day premium
        let actualBasicPay = basicPay;
        if (dayDef.sixth) actualBasicPay = Math.round(basicPay * 1.5 * 100) / 100;
        if (dayDef.seventh) actualBasicPay = Math.round(basicPay * 2.0 * 100) / 100;

        const dayTotal = actualBasicPay + preCallOTPay + filmingOTPay + wrapOTPay + btaPay + mealDelayPay + nightPremPay;

        const entry = {
          date,
          dayOfWeek: d + 1,
          dayType: dayDef.type,
          callTime: dayDef.call,
          unitCall: dayDef.uCall,
          unitWrap: dayDef.uWrap,
          release: dayDef.rel,
          lunchStart: dayDef.l1s,
          lunchEnd: dayDef.l1e,
          secondMealStart: dayDef.l2s || null,
          secondMealEnd: dayDef.l2e || null,
          isRestDay: false,
          nightShoot: dayDef.night || false,
          isSixthDay: dayDef.sixth || false,
          isSeventhDay: dayDef.seventh || false,

          totalWorkedHrs,
          straightHrs,
          preCallOTMins, filmingOTMins, wrapOTMins,
          btaMins, mealDelayMins,
          turnaroundViolation, turnaroundHrs, turnaroundShortfallHrs,

          basicPay: actualBasicPay,
          preCallOTPay, filmingOTPay, wrapOTPay,
          btaPay, mealDelayPay, nightPremPay,
          dayTotal,
        };

        entries.push(entry);
        prevDayEntry = dayDef;
      }

      // Weekly totals
      const workedEntries = entries.filter(e => !e.isRestDay);
      const wkBasicPay = workedEntries.reduce((s, e) => s + e.basicPay, 0);
      const wkPreCallOTPay = workedEntries.reduce((s, e) => s + e.preCallOTPay, 0);
      const wkFilmingOTPay = workedEntries.reduce((s, e) => s + e.filmingOTPay, 0);
      const wkWrapOTPay = workedEntries.reduce((s, e) => s + e.wrapOTPay, 0);
      const wkBTAPay = workedEntries.reduce((s, e) => s + e.btaPay, 0);
      const wkMealPenaltyPay = workedEntries.reduce((s, e) => s + e.mealDelayPay, 0);
      const wkNightPremPay = workedEntries.reduce((s, e) => s + e.nightPremPay, 0);
      const wkAllows = dmAllowanceWeekly;
      const gross = wkBasicPay + wkPreCallOTPay + wkFilmingOTPay + wkWrapOTPay + wkBTAPay + wkMealPenaltyPay + wkNightPremPay + wkAllows;

      // Status mapping
      const statusMap = { paid: 'payroll_approved', approved: 'dept_approved' };
      const tcStatus = statusMap[w.status] || w.status;

      await Timecard.create({
        timecardNumber: `TC-MIM-${crew.tcPrefix}-${String(w.n).padStart(3, '0')}`,
        productionId: prod._id,
        ownerId: user._id,
        dealMemoId: dm._id,
        weekStarting: weekStart,
        weekEnding: weekEnd,
        weekNumber: w.n,
        status: tcStatus,
        daysWorked: workedEntries.length,
        entries,
        totalStraightHrs: workedEntries.reduce((s, e) => s + e.straightHrs, 0),
        totalOt1x5Hrs: workedEntries.reduce((s, e) => s + (e.preCallOTMins + e.filmingOTMins + e.wrapOTMins) / 60, 0),
        totalNightHrs: workedEntries.filter(e => e.nightShoot).length * 2,
        wkBasicPay: Math.round(wkBasicPay * 100) / 100,
        wkPreCallOTPay: Math.round(wkPreCallOTPay * 100) / 100,
        wkFilmingOTPay: Math.round(wkFilmingOTPay * 100) / 100,
        wkWrapOTPay: Math.round(wkWrapOTPay * 100) / 100,
        wkBTAPay: Math.round(wkBTAPay * 100) / 100,
        wkMealPenaltyPay: Math.round(wkMealPenaltyPay * 100) / 100,
        wkNightPremPay: Math.round(wkNightPremPay * 100) / 100,
        wkAllowances: wkAllows,
        wkGross: Math.round(gross * 100) / 100,
        submittedAt: w.pipeline?.sub ? new Date(w.pipeline.sub) : null,
        deptApprovedAt: w.pipeline?.app ? new Date(w.pipeline.app) : null,
        payrollApprovedAt: w.pipeline?.pay ? new Date(w.pipeline.pay) : null,
        paidAt: w.pipeline?.paid ? new Date(w.pipeline.paid) : null,
      });
      created++;
    }

    console.log(`  Created ${created} timecards for ${crew.firstName} ${crew.lastName}`);
  }

  console.log('\n── Summary ──');
  console.log('Production:', prod.name, '(', prod._id, ')');
  console.log('Crew members:', CREW.length);
  console.log('Timecards per crew member:', WEEKS.length);
  console.log('Total timecards:', CREW.length * WEEKS.length);

  await mongoose.disconnect();
  console.log('\nDone!');
}

seed().catch(e => { console.error(e); process.exit(1); });
