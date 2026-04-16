/**
 * Seed Kate's exact 22-week production timeline for Tom Harris (DP).
 * Matches zillit-crew-portal-v1.html data identically.
 * Production: "The Gilded Hour S2"
 * Crew: Tom Harris, Director of Photography, Camera, BECTU
 *
 * Run: node --loader ts-node/esm src/seeds/seedKateTimeline.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-payroll';

// Kate's 22 weeks of data
const WEEKS = [
  // PRE-PRODUCTION (wks 1-3)
  { n:1, start:'2026-01-05', days:5, types:['SWD','SWD','SWD','SWD','SWD'], status:'paid',
    basic:3500, holPay:423, preCall:81, wrapOT:41, camOT:0, meal:0, night:0, bta:0, allows:375,
    pipeline:{ sub:'2026-01-10', app:'2026-01-12', pay:'2026-01-13', paid:'2026-01-15' } },
  { n:2, start:'2026-01-12', days:5, types:['SWD','SWD','SWD','SWD','SWD'], status:'paid',
    basic:3500, holPay:423, preCall:122, wrapOT:82, camOT:0, meal:0, night:0, bta:0, allows:375,
    pipeline:{ sub:'2026-01-17', app:'2026-01-19', pay:'2026-01-20', paid:'2026-01-22' } },
  { n:3, start:'2026-01-19', days:5, types:['SWD','SWD','SWD','SWD','SWD'], status:'paid',
    basic:3500, holPay:423, preCall:82, wrapOT:122, camOT:0, meal:64, night:0, bta:0, allows:375,
    pipeline:{ sub:'2026-01-24', app:'2026-01-26', pay:'2026-01-27', paid:'2026-01-29' } },
  // SHOOT BLOCK 1 (wks 4-8)
  { n:4, start:'2026-01-26', days:5, types:['SWD','SWD','CWD','SWD','SWD'], status:'paid',
    basic:3500, holPay:423, preCall:245, wrapOT:163, camOT:41, meal:32, night:0, bta:0, allows:450,
    pipeline:{ sub:'2026-01-31', app:'2026-02-02', pay:'2026-02-03', paid:'2026-02-05' } },
  { n:5, start:'2026-02-02', days:5, types:['SWD','SWD','SWD','SCWD','SWD'], status:'paid',
    basic:3500, holPay:423, preCall:245, wrapOT:245, camOT:82, meal:64, night:0, bta:45, allows:450,
    pipeline:{ sub:'2026-02-07', app:'2026-02-09', pay:'2026-02-10', paid:'2026-02-12' } },
  { n:6, start:'2026-02-09', days:5, types:['CWD','SWD','SWD','SWD','CWD'], status:'paid',
    basic:3500, holPay:423, preCall:163, wrapOT:163, camOT:123, meal:0, night:40, bta:0, allows:450,
    nightShoots:2,
    pipeline:{ sub:'2026-02-14', app:'2026-02-16', pay:'2026-02-17', paid:'2026-02-19' } },
  { n:7, start:'2026-02-16', days:5, types:['SWD','SWD','SWD','SWD','SCWD'], status:'paid',
    basic:3500, holPay:423, preCall:327, wrapOT:204, camOT:61, meal:96, night:0, bta:22, allows:450,
    pipeline:{ sub:'2026-02-21', app:'2026-02-23', pay:'2026-02-24', paid:'2026-02-26' } },
  { n:8, start:'2026-02-23', days:5, types:['SWD','CWD','SWD','SWD','SWD'], status:'paid',
    basic:3500, holPay:423, preCall:204, wrapOT:163, camOT:164, meal:32, night:0, bta:0, allows:450,
    pipeline:{ sub:'2026-02-28', app:'2026-03-02', pay:'2026-03-03', paid:'2026-03-05' } },
  // HIATUS (wk 9)
  { n:9, start:'2026-03-02', days:3, types:['SWD','SWD','SWD'], status:'paid',
    basic:2100, holPay:254, preCall:82, wrapOT:41, camOT:0, meal:0, night:0, bta:0, allows:225,
    pipeline:{ sub:'2026-03-07', app:'2026-03-09', pay:'2026-03-10', paid:'2026-03-12' } },
  // SHOOT BLOCK 2 (wks 10-14)
  { n:10, start:'2026-03-09', days:5, types:['SWD','SWD','CWD','SWD','SWD'], status:'paid',
    basic:3500, holPay:423, preCall:245, wrapOT:204, camOT:82, meal:64, night:20, bta:0, allows:450,
    nightShoots:1,
    pipeline:{ sub:'2026-03-14', app:'2026-03-16', pay:'2026-03-17', paid:'2026-03-19' } },
  { n:11, start:'2026-03-16', days:5, types:['SWD','SWD','SWD','SWD','CWD'], status:'paid',
    basic:3500, holPay:423, preCall:163, wrapOT:245, camOT:41, meal:32, night:0, bta:45, allows:450,
    pipeline:{ sub:'2026-03-21', app:'2026-03-23', pay:'2026-03-24', paid:'2026-03-26' } },
  { n:12, start:'2026-03-23', days:5, types:['SWD','SWD','SWD','SCWD','SWD'], status:'approved',
    basic:3500, holPay:423, preCall:245, wrapOT:245, camOT:164, meal:96, night:40, bta:0, allows:450,
    nightShoots:2,
    pipeline:{ sub:'2026-03-28', app:'2026-04-06', pay:null, paid:null } },
  { n:13, start:'2026-03-30', days:5, types:['CWD','SWD','SWD','SWD','SWD'], status:'submitted',
    basic:3500, holPay:423, preCall:245, wrapOT:163, camOT:123, meal:64, night:20, bta:22, allows:450,
    nightShoots:1,
    pipeline:{ sub:'2026-04-04', app:null, pay:null, paid:null } },
  { n:14, start:'2026-04-06', days:5, types:['CWD','SWD','SCWD','SWD','CWD'], status:'draft',
    basic:3500, holPay:423, preCall:327, wrapOT:245, camOT:123, meal:32, night:20, bta:90, allows:510,
    nightShoots:1,
    pipeline:{ sub:null, app:null, pay:null, paid:null } },
  // UPCOMING (wks 15-22) — empty
  { n:15, start:'2026-04-13', days:5, types:[], status:'draft', basic:0,holPay:0,preCall:0,wrapOT:0,camOT:0,meal:0,night:0,bta:0,allows:0 },
  { n:16, start:'2026-04-20', days:5, types:[], status:'draft', basic:0,holPay:0,preCall:0,wrapOT:0,camOT:0,meal:0,night:0,bta:0,allows:0 },
  { n:17, start:'2026-04-27', days:5, types:[], status:'draft', basic:0,holPay:0,preCall:0,wrapOT:0,camOT:0,meal:0,night:0,bta:0,allows:0 },
  { n:18, start:'2026-05-04', days:5, types:[], status:'draft', basic:0,holPay:0,preCall:0,wrapOT:0,camOT:0,meal:0,night:0,bta:0,allows:0 },
  { n:19, start:'2026-05-11', days:5, types:[], status:'draft', basic:0,holPay:0,preCall:0,wrapOT:0,camOT:0,meal:0,night:0,bta:0,allows:0 },
  { n:20, start:'2026-05-18', days:5, types:[], status:'draft', basic:0,holPay:0,preCall:0,wrapOT:0,camOT:0,meal:0,night:0,bta:0,allows:0 },
  { n:21, start:'2026-05-25', days:4, types:[], status:'draft', basic:0,holPay:0,preCall:0,wrapOT:0,camOT:0,meal:0,night:0,bta:0,allows:0 },
  { n:22, start:'2026-06-01', days:3, types:[], status:'draft', basic:0,holPay:0,preCall:0,wrapOT:0,camOT:0,meal:0,night:0,bta:0,allows:0 },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to', MONGO_URI.includes('@') ? 'remote DB' : 'local DB');

  const { User } = await import('../models/index.js');
  const Production = (await import('../models/Production.js')).default;
  const Department = (await import('../models/Department.js')).default;
  const Designation = (await import('../models/Designation.js')).default;
  const DealMemo = (await import('../models/DealMemo.js')).default;
  const { Timecard } = await import('../models/index.js');

  // Find or create Tom Harris user
  let tom = await User.findOne({ firstName: 'Tom', lastName: 'Harris' });
  if (!tom) {
    tom = await User.create({
      firstName: 'Tom', lastName: 'Harris',
      email: 'tom.harris@gildedhour.com', passwordHash: '$2b$10$dummyhash',
      role: 'crew_member', isActive: true,
    });
    console.log('Created Tom Harris user');
  }

  // Find or create production "The Gilded Hour S2"
  let prod = await Production.findOne({ name: 'The Gilded Hour S2' });
  if (!prod) {
    prod = await Production.create({
      name: 'The Gilded Hour S2',
      code: 'GH2',
      productionType: 'tv_drama',
      country: 'UK',
      currency: 'GBP',
      budget: 12000000,
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-06-06'),
      status: 'production',
      companyName: 'Gilded Hour Productions Ltd',
    });
    console.log('Created production: The Gilded Hour S2');
  }

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

  // Find Camera department and DP designation
  const cameraDept = await Department.findOne({ code: 'CAM', name: /^Camera$/i }).lean();
  const dpDesig = await Designation.findOne({ name: /Director of Photography/i }).lean();

  // Find or create deal memo
  let dm = await DealMemo.findOne({ productionId: prod._id, personId: tom._id });
  if (!dm) {
    dm = await DealMemo.create({
      productionId: prod._id,
      personId: tom._id,
      crewMemberId: tom._id,
      departmentId: cameraDept?._id,
      designationId: dpDesig?._id,
      screenCredit: 'Director of Photography',
      employmentStatus: 'paye',
      dealType: 'weekly',
      rateType: 'basic',
      territory: 'UK',
      schemaVersion: 2,
      weeklyRate: 3500,
      dailyRate: 700,
      hourlyRate: 54.55,
      otRate1x5: 81.82,
      otRate2x: 81.82,
      otRateCap: 81.82,
      isCameraDept: true,
      otMultiplier: 2,
      contractedHoursPerDay: 10,
      holidayPayPct: 12.07,
      hpMode: 'excl',
      employerNiPct: 13.8,
      employerNiThresholdWeekly: 175,
      pensionPct: 3,
      mealPenaltyEnabled: true,
      mealPenaltyRate: 35,
      mealDeductible: true,
      nightPremiumEnabled: true,
      nightPremiumFlat: 20,
      btaEnabled: true,
      btaRate: 45,
      startDate: new Date('2026-01-05'),
      dealNumber: 'DM-GH2-001',
      createdById: tom._id,
      status: 'signed',
      allowances: [
        { name: 'Kit Rental', amount: 50, frequency: 'weekly', taxTreatment: 'non-taxable' },
        { name: 'Per Diem', amount: 35, frequency: 'daily', taxTreatment: 'non-taxable' },
        { name: 'Car Allowance', amount: 75, frequency: 'weekly', taxTreatment: 'taxable' },
        { name: 'Phone', amount: 10, frequency: 'weekly', taxTreatment: 'non-taxable' },
      ],
    });
    console.log('Created deal memo for Tom Harris');
  }

  // Delete existing timecards for this crew+production
  const deleted = await Timecard.deleteMany({ productionId: prod._id, ownerId: tom._id });
  console.log('Deleted', deleted.deletedCount, 'existing timecards');

  // Create 22 week timecards
  let created = 0;
  for (const w of WEEKS) {
    const weekStart = new Date(w.start);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Build 7 daily entries
    const entries = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + d);
      const dayType = w.types[d] || null;
      const isWorked = dayType && d < w.days;

      entries.push({
        date,
        dayOfWeek: d + 1,
        dayType: dayType || (d >= 5 ? 'OFF' : 'SWD'),
        callTime: isWorked ? '06:00' : null,
        unitCall: isWorked ? '07:00' : null,
        unitWrap: isWorked ? '18:00' : null,
        release: isWorked ? '18:30' : null,
        lunchStart: isWorked ? '13:00' : null,
        lunchEnd: isWorked ? '13:30' : null,
        isRestDay: !isWorked,
        nightShoot: (w.nightShoots || 0) > 0 && d < (w.nightShoots || 0),
        // Pay data (from Kate's exact figures, distributed evenly across worked days)
        basicPay: isWorked ? Math.round(w.basic / w.days * 100) / 100 : 0,
        preCallOTPay: isWorked ? Math.round(w.preCall / w.days * 100) / 100 : 0,
        wrapOTPay: isWorked ? Math.round(w.wrapOT / w.days * 100) / 100 : 0,
        filmingOTPay: isWorked ? Math.round(w.camOT / w.days * 100) / 100 : 0,
        mealDelayPay: isWorked && w.meal > 0 ? Math.round(w.meal / w.days * 100) / 100 : 0,
        mealDelayMins: isWorked && w.meal > 0 ? Math.round((w.meal / 35) * 15 / w.days) : 0,
        nightPremPay: (w.nightShoots || 0) > 0 && d < (w.nightShoots || 0) ? 20 : 0,
        btaPay: isWorked && w.bta > 0 ? Math.round(w.bta / Math.min(w.days, 2) * 100) / 100 : 0,
        btaMins: isWorked && w.bta > 0 ? Math.round(w.bta / 45 * 60 / Math.min(w.days, 2)) : 0,
        turnaroundViolation: isWorked && w.bta > 0 && d === 0,
        dayTotal: 0, // set below
        straightHrs: isWorked ? 10 : 0,
        totalWorkedHrs: isWorked ? 11 : 0,
        preCallOTMins: isWorked ? Math.round(w.preCall / 81.82 * 60 / w.days) : 0,
        wrapOTMins: isWorked ? Math.round(w.wrapOT / 81.82 * 60 / w.days) : 0,
        filmingOTMins: isWorked ? Math.round(w.camOT / 81.82 * 60 / w.days) : 0,
      });
    }

    // Calculate dayTotals
    entries.forEach(e => {
      e.dayTotal = (e.basicPay || 0) + (e.preCallOTPay || 0) + (e.wrapOTPay || 0) +
        (e.filmingOTPay || 0) + (e.mealDelayPay || 0) + (e.nightPremPay || 0) + (e.btaPay || 0);
    });

    const gross = w.basic + w.holPay + w.preCall + w.wrapOT + w.camOT + w.meal + w.night + w.bta + w.allows;

    const tc = await Timecard.create({
      timecardNumber: `TC-GH2-${String(w.n).padStart(3, '0')}`,
      productionId: prod._id,
      ownerId: tom._id,
      dealMemoId: dm._id,
      weekStarting: weekStart,
      weekEnding: weekEnd,
      weekNumber: w.n,
      status: w.status === 'paid' ? 'payroll_approved' : w.status === 'approved' ? 'dept_approved' : w.status,
      daysWorked: w.days,
      entries,
      totalStraightHrs: w.days * 10,
      totalOt1x5Hrs: Math.round((w.preCall + w.wrapOT) / 81.82 * 10) / 10,
      totalNightHrs: (w.nightShoots || 0) * 2,
      // Weekly pay
      wkBasicPay: w.basic,
      wkPreCallOTPay: w.preCall,
      wkWrapOTPay: w.wrapOT,
      wkFilmingOTPay: w.camOT,
      wkBTAPay: w.bta,
      wkMealPenaltyPay: w.meal,
      wkNightPremPay: w.night,
      wkAllowances: w.allows,
      wkGross: gross,
      // Pipeline dates
      submittedAt: w.pipeline?.sub ? new Date(w.pipeline.sub) : null,
      deptApprovedAt: w.pipeline?.app ? new Date(w.pipeline.app) : null,
      payrollApprovedAt: w.pipeline?.pay ? new Date(w.pipeline.pay) : null,
      paidAt: w.pipeline?.paid ? new Date(w.pipeline.paid) : null,
    });
    created++;
  }

  console.log(`Created ${created} timecards for Tom Harris on "The Gilded Hour S2"`);
  console.log('Production ID:', prod._id);
  console.log('Tom Harris ID:', tom._id);
  console.log('Deal Memo ID:', dm._id);

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(e => { console.error(e); process.exit(1); });
