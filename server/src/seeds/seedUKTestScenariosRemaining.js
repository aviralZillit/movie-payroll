/**
 * Seed remaining UK Test Scenarios (4, 6-10, 12-25).
 * Run: cd server && node src/seeds/seedUKTestScenariosRemaining.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-payroll';

const IDS = {
  lastHorizon: '69ce735623c537958cba7a92',
  nightfall: '69ce735723c537958cba7a9f',
  urbanEcho: '69ce735723c537958cba7aa7',
  horizonPics: '69d019965ee7e058955155f3',
  nightfallEnt: '69d019975ee7e058955155fc',
  echoFilms: '69d019975ee7e05895515600',
  tom: '69ce734a23c537958cba7a6b',
  lisa: '69ce734a23c537958cba7a6d',
  jake: '69ce734b23c537958cba7a6f',
  nina: '69ce734b23c537958cba7a71',
  alex: '69ce734c23c537958cba7a73',
  sam: '69ce734d23c537958cba7a75',
  kate: '69ce734d23c537958cba7a77',
  ben: '69ce734e23c537958cba7a79',
  zara: '69ce734e23c537958cba7a7b',
  emma: '69ce734823c537958cba7a65',
  michael: '69ce734923c537958cba7a67',
  rachel: '69ce734923c537958cba7a69',
  david: '69ce734723c537958cba7a63',
  admin: '69ce734623c537958cba7a5f',
  bectu: '69ce734223c537958cba7767',
  equity: '69ce734223c537958cba7768',
  faa: '69ce734223c537958cba7769',
  directorsUK: '69ce734222c537958cba776a',
  wggb: '69ce734222c537958cba776b',
  mu: '69ce734222c537958cba776c',
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

async function findDeptDesig(db, unionId, deptName, desigName) {
  const dept = await db.collection('departments').findOne({ unionId: new mongoose.Types.ObjectId(unionId), name: { $regex: deptName, $options: 'i' } });
  if (!dept) return { deptId: null, desigId: null };
  const desig = await db.collection('designations').findOne({ departmentId: dept._id, name: { $regex: desigName, $options: 'i' } });
  return { deptId: dept._id, desigId: desig?._id || null };
}

let tcC = 200; let dmC = 200;
function tcNum() { return `TC-2026-${String(++tcC).padStart(5, '0')}`; }
function dmNum() { return `DM-2026-${String(++dmC).padStart(3, '0')}`; }

const W1S = new Date('2026-04-13');
const W1E = new Date('2026-04-19');
const W2S = new Date('2026-04-20');
const W2E = new Date('2026-04-26');

function be(weekStart, configs) {
  return configs.map((c, i) => ({
    date: new Date(weekStart.getTime() + i * 86400000), dayOfWeek: i, dayNumber: i + 1,
    callTime: c.call || null, unitCall: c.uc || c.call || null, unitWrap: c.uw || c.wrap || null,
    release: c.rel || c.wrap || null, wrapTime: c.wrap || null,
    lunchStart: c.m1o || null, lunchEnd: c.m1i || null,
    secondMealStart: c.m2o || null, secondMealEnd: c.m2i || null,
    dayType: c.dt || 'SWD', isTravelDay: c.dt === 'TRVL', isRestDay: c.dt === 'OFF',
    isHoliday: c.dt === 'HOL', isSixthDay: c.six || false, isSeventhDay: c.sev || false,
    source: 'manual', notes: c.n || null,
  }));
}

const BASE_DM = {
  hpMode: 'excl', holidayPayPct: 12.07, overtimeApplicable: true,
  mealPenaltyEnabled: true, mealPenaltyRate: 35, mealPenaltyAfterHrs: 6,
  nightPremiumEnabled: true, nightPremiumFlat: 20, turnaroundMinHrs: 11,
  btaEnabled: true, btaRate: 45, sixthDayMultiplier: 1.5, seventhDayMultiplier: 2.0,
  employerNiPct: 13.8, pensionPct: 3, apprenticeshipLevyPct: 0.5,
  mealDeductible: true, contractedHoursPerDayType: { SWD: 11, CWD: 10, SCWD: 10 },
  isCameraDept: false, otMultiplier: 1.5, otRateCap: 81.82,
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  console.log('Connected. Seeding remaining UK scenarios...\n');

  const sound = await findDeptDesig(db, IDS.bectu, 'Sound', 'Boom Operator');
  const grip = await findDeptDesig(db, IDS.bectu, 'Grip', 'Best Boy Grip');
  const spark = await findDeptDesig(db, IDS.bectu, 'Lighting', 'Electrician');
  const editor = await findDeptDesig(db, IDS.bectu, 'Post Production', 'Editor');
  const castLead = await findDeptDesig(db, IDS.equity, 'Cast', 'Lead Actor');
  const castDay = await findDeptDesig(db, IDS.equity, 'Cast', 'Day Player');
  const stunt = await findDeptDesig(db, IDS.equity, 'Stunt', 'Stunt Performer');
  const ad1st = await findDeptDesig(db, IDS.bectu, 'Assistant Directors', '1st Assistant Director');
  const camOp = await findDeptDesig(db, IDS.bectu, 'Camera', 'Camera Operator');
  const soundMix = await findDeptDesig(db, IDS.bectu, 'Sound', 'Sound Mixer');

  // Standard day: call 06, UC 07, UW 18, rel 18:30, lunch 13-13:30
  const STD = { call: '06:00', uc: '07:00', uw: '18:00', rel: '18:30', wrap: '18:30', m1o: '13:00', m1i: '13:30', dt: 'SWD' };
  const OFF = { dt: 'OFF' };

  const scenarios = [
    // S04: CWD Night Shoot + HP Included + meal buyout
    { id: 4, label: 'S04: CWD Night Shoot + HP Included',
      person: IDS.nina, production: IDS.nightfall, entity: IDS.nightfallEnt,
      union: IDS.bectu, dept: sound.deptId, desig: sound.desigId, tier: IDS.film5_15,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'daily', rateType: 'basic',
        weeklyRate: 2200, dailyRate: 440, hourlyRate: 44,
        hpMode: 'incl', isCameraDept: false, contractedHoursPerDayType: { SWD: 11, CWD: 10 },
        screenCredit: 'Boom Operator' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { call: '18:00', uc: '19:00', uw: '05:00', rel: '05:30', wrap: '05:30', m1o: '00:00', m1i: '00:30', dt: 'CWD', n: 'Night shoot' },
        { call: '18:00', uc: '19:00', uw: '04:00', rel: '04:30', wrap: '04:30', m1o: '00:00', m1i: '00:30', dt: 'CWD', n: 'Night shoot' },
        { call: '18:00', uc: '19:00', uw: '05:30', rel: '06:00', wrap: '06:00', m1o: '00:00', m1i: '00:30', dt: 'CWD', n: 'Night shoot' },
        OFF, OFF, OFF, OFF,
      ])},
      allowances: [{ name: 'Meal Buyout', amount: 15, frequency: 'daily', taxTreatment: 'non-taxable' }],
    },

    // S06: Sole Trader, Daily, HP only fringes, partial week
    { id: 6, label: 'S06: Sole Trader Daily HP-only fringes + partial week',
      person: IDS.alex, production: IDS.urbanEcho, entity: IDS.echoFilms,
      union: IDS.bectu, dept: grip.deptId, desig: grip.desigId, tier: IDS.film1_3,
      dm: { ...BASE_DM, employmentStatus: 'sole_trader', dealType: 'daily', rateType: 'basic',
        weeklyRate: 1800, dailyRate: 360, hourlyRate: 32.73,
        employerNiPct: 0, pensionPct: 0, apprenticeshipLevyPct: 0,
        screenCredit: 'Best Boy Grip' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        OFF, OFF,
        { ...STD, n: 'Started mid-week' },
        { call: '06:00', uc: '07:00', uw: '20:00', rel: '20:30', wrap: '20:30', m1o: '13:00', m1i: '13:30', dt: 'SWD', n: 'Wrap OT' },
        { ...STD },
        OFF, OFF,
      ])},
      allowances: [
        { name: 'Per Diem', amount: 45, frequency: 'daily', taxTreatment: 'non-taxable' },
        { name: 'Mileage', amount: 22.50, frequency: 'daily', taxTreatment: 'non-taxable' },
      ],
    },

    // S07: Equity performer, fitting/rehearsal days
    { id: 7, label: 'S07: Equity Performer fitting + rehearsal days',
      person: IDS.kate, production: IDS.lastHorizon, entity: IDS.horizonPics,
      union: IDS.equity, dept: castLead.deptId, desig: castLead.desigId, tier: IDS.tvBand3,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'weekly', rateType: 'negotiated',
        weeklyRate: 5000, dailyRate: 1000, hourlyRate: 90.91,
        isCameraDept: false, screenCredit: 'Lead Actor' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { call: '09:00', uc: '09:30', uw: '13:00', rel: '13:30', wrap: '13:30', dt: 'Fitting', n: 'Costume fitting' },
        { call: '09:00', uc: '09:30', uw: '13:00', rel: '13:30', wrap: '13:30', dt: 'Fitting', n: 'Hair/makeup test' },
        { call: '08:00', uc: '09:00', uw: '17:00', rel: '17:30', wrap: '17:30', m1o: '13:00', m1i: '14:00', dt: 'Rehearsal' },
        { ...STD, n: 'Shoot day' },
        { ...STD, n: 'Shoot day' },
        { ...STD, n: 'Shoot day' },
        OFF,
      ])},
      allowances: [{ name: 'Per Diem', amount: 35, frequency: 'daily', taxTreatment: 'non-taxable' }],
    },

    // S08: Equity Flat Buyout Run of Show
    { id: 8, label: 'S08: Equity Flat Buyout — Run of Show',
      person: IDS.kate, production: IDS.nightfall, entity: IDS.nightfallEnt,
      union: IDS.equity, dept: castLead.deptId, desig: castLead.desigId, tier: IDS.film3_5,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'flat', rateType: 'buyout',
        weeklyRate: 25000, dailyRate: 0, hourlyRate: 0,
        overtimeApplicable: false, mealPenaltyEnabled: false, nightPremiumEnabled: false, btaEnabled: false,
        screenCredit: 'Lead Actor' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { ...STD, n: 'Shoot' }, { ...STD, n: 'Shoot' }, { call: '05:00', uc: '06:00', uw: '16:00', rel: '16:30', wrap: '16:30', m1o: '12:00', m1i: '12:30', dt: 'TRVL', n: 'Travel day' },
        { ...STD, n: 'Shoot' }, { ...STD, n: 'Shoot' }, OFF, OFF,
      ])},
      allowances: [{ name: 'Per Diem', amount: 45, frequency: 'daily', taxTreatment: 'non-taxable' }],
    },

    // S09: Director flat deal, prep+shoot+edit
    { id: 9, label: 'S09: Director Flat Deal — prep+shoot phases',
      person: IDS.david, production: IDS.urbanEcho, entity: IDS.echoFilms,
      union: IDS.directorsUK, dept: null, desig: null, tier: IDS.tvBand2,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'flat', rateType: 'negotiated',
        weeklyRate: 8000, dailyRate: 0, hourlyRate: 0,
        overtimeApplicable: false, mealPenaltyEnabled: false, nightPremiumEnabled: false, btaEnabled: false,
        screenCredit: 'Director' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { call: '09:00', uc: '09:00', uw: '18:00', rel: '18:00', wrap: '18:00', m1o: '13:00', m1i: '14:00', dt: 'Prep' },
        { call: '09:00', uc: '09:00', uw: '18:00', rel: '18:00', wrap: '18:00', m1o: '13:00', m1i: '14:00', dt: 'Prep' },
        { ...STD, n: 'Shoot' }, { ...STD, n: 'Shoot' }, { ...STD, n: 'Shoot' },
        OFF, OFF,
      ])},
      allowances: [{ name: 'Car Allowance', amount: 150, frequency: 'weekly', taxTreatment: 'non-taxable' }],
    },

    // S10: Writer step deal
    { id: 10, label: 'S10: WGGB Writer Step Deal',
      person: IDS.zara, production: IDS.lastHorizon, entity: IDS.horizonPics,
      union: IDS.wggb, dept: null, desig: null, tier: IDS.filmU1,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'flat', rateType: 'negotiated',
        weeklyRate: 5000, dailyRate: 0, hourlyRate: 0,
        overtimeApplicable: false, mealPenaltyEnabled: false, nightPremiumEnabled: false, btaEnabled: false,
        screenCredit: 'Writer' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [OFF, OFF, OFF, OFF, OFF, OFF, OFF]) },
      allowances: [],
    },

    // S12: SCWD mixed week
    { id: 12, label: 'S12: SCWD mixed week — different OT thresholds',
      person: IDS.ben, production: IDS.nightfall, entity: IDS.nightfallEnt,
      union: IDS.bectu, dept: editor.deptId, desig: editor.desigId, tier: IDS.tvBand3,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'weekly', rateType: 'basic',
        weeklyRate: 2400, dailyRate: 480, hourlyRate: 43.64,
        screenCredit: 'Editor' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { ...STD, dt: 'SWD' }, { ...STD, dt: 'SWD' }, { ...STD, dt: 'SWD' },
        { call: '07:00', uc: '07:00', uw: '17:30', rel: '17:30', wrap: '17:30', m1o: '12:30', m1i: '13:00', dt: 'SCWD', n: 'Semi-continuous' },
        { call: '07:00', uc: '07:00', uw: '18:00', rel: '18:00', wrap: '18:00', m1o: '12:30', m1i: '13:00', dt: 'SCWD', n: 'Semi-continuous with OT' },
        OFF, OFF,
      ])},
      allowances: [{ name: 'Kit Rental', amount: 30, frequency: 'weekly', taxTreatment: 'non-taxable' }],
    },

    // S13: Holiday + Sick day
    { id: 13, label: 'S13: Holiday + Sick day in week',
      person: IDS.tom, production: IDS.nightfall, entity: IDS.nightfallEnt,
      union: IDS.bectu, dept: (await findDeptDesig(db, IDS.bectu, 'Camera', 'Director of Photography')).deptId,
      desig: (await findDeptDesig(db, IDS.bectu, 'Camera', 'Director of Photography')).desigId, tier: IDS.film5_15,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'weekly', rateType: 'basic',
        weeklyRate: 4255, dailyRate: 851, hourlyRate: 77.36,
        isCameraDept: true, otMultiplier: 2.0, screenCredit: 'Director of Photography' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { ...STD }, { ...STD }, { ...STD },
        { dt: 'HOL', n: 'Bank Holiday' },
        { dt: 'SICK', n: 'Sick day' },
        OFF, OFF,
      ])},
      allowances: [{ name: 'Per Diem', amount: 35, frequency: 'daily', taxTreatment: 'non-taxable' }],
    },

    // S14: Rigging + Travel day + HP Included
    { id: 14, label: 'S14: Rigging + Travel + HP Included',
      person: IDS.lisa, production: IDS.urbanEcho, entity: IDS.echoFilms,
      union: IDS.bectu, dept: (await findDeptDesig(db, IDS.bectu, 'Camera', '1st Assistant Camera')).deptId,
      desig: (await findDeptDesig(db, IDS.bectu, 'Camera', '1st Assistant Camera')).desigId, tier: IDS.film3_5,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'daily', rateType: 'basic',
        weeklyRate: 2800, dailyRate: 560, hourlyRate: 50.91,
        hpMode: 'incl', isCameraDept: true, otMultiplier: 2.0, screenCredit: '1st Assistant Camera' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { call: '06:00', uc: '06:30', uw: '17:00', rel: '17:30', wrap: '17:30', m1o: '12:00', m1i: '12:30', dt: 'RIG', n: 'Rigging day' },
        { call: '06:00', uc: '06:30', uw: '19:00', rel: '19:30', wrap: '19:30', m1o: '12:30', m1i: '13:00', dt: 'RIG', n: 'Rigging + OT' },
        { call: '05:00', uc: '05:00', uw: '12:00', rel: '12:00', wrap: '12:00', dt: 'TRVL', n: 'Travel to location' },
        { ...STD, n: 'Shoot' }, { ...STD, n: 'Shoot' }, { ...STD, n: 'Shoot' },
        OFF,
      ])},
      allowances: [
        { name: 'Per Diem', amount: 45, frequency: 'daily', taxTreatment: 'non-taxable' },
        { name: 'Mileage', amount: 31.50, frequency: 'daily', taxTreatment: 'non-taxable' },
      ],
    },

    // S15: Ltd Director Flat Deal
    { id: 15, label: 'S15: Ltd Director Flat — zero fringes',
      person: IDS.rachel, production: IDS.lastHorizon, entity: IDS.horizonPics,
      union: IDS.directorsUK, dept: null, desig: null, tier: IDS.film15_30,
      dm: { ...BASE_DM, employmentStatus: 'ltd', dealType: 'flat', rateType: 'negotiated',
        weeklyRate: 12000, dailyRate: 0, hourlyRate: 0,
        hpMode: 'na', overtimeApplicable: false, mealPenaltyEnabled: false, nightPremiumEnabled: false, btaEnabled: false,
        employerNiPct: 0, pensionPct: 0, apprenticeshipLevyPct: 0,
        screenCredit: 'Director' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { call: '09:00', uc: '09:00', uw: '18:00', rel: '18:00', wrap: '18:00', m1o: '13:00', m1i: '14:00', dt: 'Prep' },
        { call: '09:00', uc: '09:00', uw: '18:00', rel: '18:00', wrap: '18:00', m1o: '13:00', m1i: '14:00', dt: 'Prep' },
        { ...STD }, { ...STD }, { ...STD },
        OFF, OFF,
      ])},
      allowances: [{ name: 'Car Allowance', amount: 200, frequency: 'weekly', taxTreatment: 'non-taxable' }],
    },

    // S16: Musician session fee
    { id: 16, label: 'S16: MU Musician — session fee + cartage',
      person: IDS.nina, production: IDS.urbanEcho, entity: IDS.echoFilms,
      union: IDS.mu, dept: null, desig: null, tier: IDS.tvBand4,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'daily', rateType: 'negotiated',
        weeklyRate: 1500, dailyRate: 500, hourlyRate: 166.67,
        screenCredit: 'Musician' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { call: '09:00', uc: '10:00', uw: '13:00', rel: '13:30', wrap: '13:30', dt: 'SWD', n: 'Recording session 1' },
        { call: '09:00', uc: '10:00', uw: '13:00', rel: '13:30', wrap: '13:30', dt: 'SWD', n: 'Recording session 2' },
        { call: '09:00', uc: '10:00', uw: '14:00', rel: '14:30', wrap: '14:30', m1o: '12:00', m1i: '12:30', dt: 'SWD', n: 'Extended session' },
        OFF, OFF, OFF, OFF,
      ])},
      allowances: [{ name: 'Instrument Cartage', amount: 75, frequency: 'daily', taxTreatment: 'non-taxable' }],
    },

    // S17: 1st AD Night shoots + 6th day + stacked
    { id: 17, label: 'S17: 1st AD Night + 6th + pre-call stacked',
      person: IDS.jake, production: IDS.lastHorizon, entity: IDS.horizonPics,
      union: IDS.bectu, dept: ad1st.deptId, desig: ad1st.desigId, tier: IDS.mmp,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'weekly', rateType: 'basic',
        weeklyRate: 3800, dailyRate: 760, hourlyRate: 69.09,
        screenCredit: '1st Assistant Director' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { ...STD }, { ...STD }, { ...STD }, { ...STD },
        { call: '17:00', uc: '18:00', uw: '05:00', rel: '05:30', wrap: '05:30', m1o: '23:00', m1i: '23:30', dt: 'SWD', n: 'Night shoot' },
        { call: '17:00', uc: '18:00', uw: '06:00', rel: '06:30', wrap: '06:30', m1o: '23:30', m1i: '00:00', dt: 'SWD', six: true, n: '6th day night shoot' },
        OFF,
      ])},
      allowances: [
        { name: 'Per Diem', amount: 35, frequency: 'daily', taxTreatment: 'non-taxable' },
        { name: 'Phone', amount: 10, frequency: 'weekly', taxTreatment: 'non-taxable' },
      ],
    },

    // S18: Rest day worked
    { id: 18, label: 'S18: Rest day worked — premium rate',
      person: IDS.alex, production: IDS.lastHorizon, entity: IDS.horizonPics,
      union: IDS.bectu, dept: grip.deptId, desig: grip.desigId, tier: IDS.tvBand2,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'weekly', rateType: 'basic',
        weeklyRate: 2100, dailyRate: 420, hourlyRate: 38.18,
        screenCredit: 'Best Boy Grip' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { ...STD }, { ...STD }, { ...STD }, { ...STD }, { ...STD },
        { ...STD, dt: 'SWD', six: true, n: 'Called in on scheduled rest day' },
        OFF,
      ])},
      allowances: [],
    },

    // S19: Wrap day (short day) at lowest tier
    { id: 19, label: 'S19: Wrap day short — lowest budget',
      person: IDS.sam, production: IDS.urbanEcho, entity: IDS.echoFilms,
      union: IDS.bectu, dept: spark.deptId, desig: spark.desigId, tier: IDS.filmU1,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'daily', rateType: 'basic',
        weeklyRate: 1200, dailyRate: 240, hourlyRate: 21.82,
        screenCredit: 'Electrician' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { call: '08:00', uc: '08:30', uw: '13:00', rel: '14:00', wrap: '14:00', dt: 'Wrap', n: 'Production wrap day - short' },
        OFF, OFF, OFF, OFF, OFF, OFF,
      ])},
      allowances: [{ name: 'Kit Rental', amount: 20, frequency: 'daily', taxTreatment: 'non-taxable' }],
    },

    // S20: Sole Trader Performer HP Included
    { id: 20, label: 'S20: Sole Trader Equity performer + HP Included',
      person: IDS.kate, production: IDS.urbanEcho, entity: IDS.echoFilms,
      union: IDS.equity, dept: castDay.deptId || castLead.deptId, desig: castDay.desigId || castLead.desigId, tier: IDS.film1_3,
      dm: { ...BASE_DM, employmentStatus: 'sole_trader', dealType: 'daily', rateType: 'negotiated',
        weeklyRate: 3500, dailyRate: 700, hourlyRate: 63.64,
        hpMode: 'incl', employerNiPct: 0, pensionPct: 0, apprenticeshipLevyPct: 0,
        screenCredit: 'Day Player' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { ...STD }, { ...STD }, { ...STD }, { ...STD }, { ...STD },
        OFF, OFF,
      ])},
      allowances: [
        { name: 'Per Diem', amount: 35, frequency: 'daily', taxTreatment: 'non-taxable' },
        { name: 'Costume Cleaning', amount: 15, frequency: 'daily', taxTreatment: 'non-taxable' },
      ],
    },

    // S21: BTA across week boundary
    { id: 21, label: 'S21: BTA across week boundary + partial week 2',
      person: IDS.ben, production: IDS.lastHorizon, entity: IDS.horizonPics,
      union: IDS.bectu, dept: editor.deptId, desig: editor.desigId, tier: IDS.film5_15,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'weekly', rateType: 'basic',
        weeklyRate: 2400, dailyRate: 480, hourlyRate: 43.64,
        screenCredit: 'Editor' },
      tc: { weekStart: W2S, weekEnd: W2E, entries: be(W2S, [
        { call: '07:00', uc: '07:30', uw: '18:00', rel: '18:30', wrap: '18:30', m1o: '13:00', m1i: '13:30', dt: 'SWD', n: 'BTA from prev week Fri 23:00 wrap' },
        { ...STD }, { ...STD },
        OFF, OFF, OFF, OFF,
      ])},
      allowances: [{ name: 'Per Diem', amount: 25, frequency: 'daily', taxTreatment: 'non-taxable' }],
    },

    // S22: HOD Camera All-In + full allowances
    { id: 22, label: 'S22: HOD Camera All-In + full allowance stack',
      person: IDS.emma, production: IDS.nightfall, entity: IDS.nightfallEnt,
      union: IDS.bectu, dept: camOp.deptId, desig: camOp.desigId, tier: IDS.mmp,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'weekly', rateType: 'all_in',
        weeklyRate: 5500, dailyRate: 1100, hourlyRate: 100,
        overtimeApplicable: false, mealPenaltyEnabled: false,
        isCameraDept: true, screenCredit: 'Camera Operator' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { ...STD }, { ...STD }, { ...STD }, { ...STD }, { ...STD },
        { ...STD, six: true, n: '6th day — does all-in cover?' },
        OFF,
      ])},
      allowances: [
        { name: 'Kit Rental', amount: 100, frequency: 'weekly', taxTreatment: 'non-taxable' },
        { name: 'Per Diem', amount: 45, frequency: 'daily', taxTreatment: 'non-taxable' },
        { name: 'Car Allowance', amount: 75, frequency: 'weekly', taxTreatment: 'non-taxable' },
        { name: 'Phone', amount: 10, frequency: 'weekly', taxTreatment: 'non-taxable' },
        { name: 'Mileage', amount: 27, frequency: 'daily', taxTreatment: 'non-taxable' },
      ],
    },

    // S23: Extreme 16hr day, multiple meals
    { id: 23, label: 'S23: Extreme 16hr day — multi meal penalty + 2T OT',
      person: IDS.tom, production: IDS.urbanEcho, entity: IDS.echoFilms,
      union: IDS.bectu, dept: (await findDeptDesig(db, IDS.bectu, 'Camera', 'Director of Photography')).deptId,
      desig: (await findDeptDesig(db, IDS.bectu, 'Camera', 'Director of Photography')).desigId, tier: IDS.film15_30,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'daily', rateType: 'basic',
        weeklyRate: 4255, dailyRate: 851, hourlyRate: 77.36,
        isCameraDept: true, otMultiplier: 2.0, screenCredit: 'Director of Photography' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { call: '05:00', uc: '06:00', uw: '22:00', rel: '22:30', wrap: '22:30', m1o: '12:00', m1i: '12:30', dt: 'SWD', n: '16+ hr day, M1 at 7hrs, M2 not provided' },
        OFF, OFF, OFF, OFF, OFF, OFF,
      ])},
      allowances: [{ name: 'Per Diem', amount: 35, frequency: 'daily', taxTreatment: 'non-taxable' }],
    },

    // S24: Ltd all budget tiers (just one, parameterized later)
    { id: 24, label: 'S24: Ltd budget tier comparison',
      person: IDS.michael, production: IDS.lastHorizon, entity: IDS.horizonPics,
      union: IDS.bectu, dept: soundMix.deptId, desig: soundMix.desigId, tier: IDS.mmp,
      dm: { ...BASE_DM, employmentStatus: 'ltd', dealType: 'daily', rateType: 'basic',
        weeklyRate: 3000, dailyRate: 600, hourlyRate: 54.55,
        hpMode: 'na', overtimeApplicable: false, mealPenaltyEnabled: false, nightPremiumEnabled: false, btaEnabled: false,
        employerNiPct: 0, pensionPct: 0, apprenticeshipLevyPct: 0,
        screenCredit: 'Sound Mixer' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { ...STD }, OFF, OFF, OFF, OFF, OFF, OFF,
      ])},
      allowances: [],
    },

    // S25: Night crossing midnight + BTA + fitting next day
    { id: 25, label: 'S25: Night midnight + BTA into fitting day',
      person: IDS.kate, production: IDS.lastHorizon, entity: IDS.horizonPics,
      union: IDS.equity, dept: castLead.deptId, desig: castLead.desigId, tier: IDS.tvBand3,
      dm: { ...BASE_DM, employmentStatus: 'paye', dealType: 'daily', rateType: 'negotiated',
        weeklyRate: 5000, dailyRate: 1000, hourlyRate: 90.91,
        screenCredit: 'Lead Actor' },
      tc: { weekStart: W1S, weekEnd: W1E, entries: be(W1S, [
        { call: '18:00', uc: '19:00', uw: '05:00', rel: '06:00', wrap: '06:00', m1o: '00:00', m1i: '00:30', dt: 'SWD', n: 'Night shoot — wrap 06:00' },
        { call: '14:00', uc: '14:30', uw: '17:00', rel: '17:30', wrap: '17:30', dt: 'Fitting', n: 'Fitting after night — BTA: 06:00→14:00=8hrs' },
        { ...STD, n: 'Shoot' }, { ...STD, n: 'Shoot' }, { ...STD, n: 'Shoot' },
        OFF, OFF,
      ])},
      allowances: [
        { name: 'Per Diem', amount: 45, frequency: 'daily', taxTreatment: 'non-taxable' },
        { name: 'Costume Cleaning', amount: 20, frequency: 'daily', taxTreatment: 'non-taxable' },
      ],
    },
  ];

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
      territory: 'UK', country: 'UK', currency: 'GBP',
      startDate: W1S, endDate: W2E, status: 'issued', schemaVersion: 2,
      allowances: s.allowances || [],
      ...s.dm,
    };
    const dmResult = await db.collection('dealmemos').insertOne(dealData);

    const tcData = {
      timecardNumber: tcNum(),
      productionId: new mongoose.Types.ObjectId(s.production),
      dealMemoId: dmResult.insertedId,
      ownerId: new mongoose.Types.ObjectId(s.person),
      weekStarting: s.tc.weekStart, weekEnding: s.tc.weekEnd,
      status: 'draft', entries: s.tc.entries, schemaVersion: 2, auditLog: [],
    };
    await db.collection('timecards').insertOne(tcData);
    created++;
    console.log(`  ✅ ${s.label} → ${dealNumber}`);
  }

  console.log(`\n✅ Created ${created} scenarios (total with previous: ${created + 5})`);
  process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
