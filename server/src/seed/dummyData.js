import bcrypt from 'bcryptjs';
import {
  User,
  Union,
  Department,
  Designation,
  BudgetTier,
  RateCard,
  Production,
  DealMemo,
  Timecard,
  PayrollRun,
} from '../models/index.js';

/**
 * Seeds comprehensive dummy data for client presentation.
 * Must be called AFTER union/department/designation/budgetTier/rateCard seeding.
 */
export async function seedDummyData() {
  console.log('\n--- Seeding dummy data for demo ---');

  // Clean previous dummy data (but not reference data)
  await Promise.all([
    User.deleteMany({}),
    Production.deleteMany({}),
    DealMemo.deleteMany({}),
    Timecard.deleteMany({}),
    PayrollRun.deleteMany({}),
  ]);
  console.log('Cleared previous dummy data');

  // ──────────────────────────────────────────────────
  // 1. USERS
  // ──────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Demo123!', 12);

  const usersData = [
    { email: 'admin@prodpayroll.com', firstName: 'James', lastName: 'Richardson', role: 'super_admin', phone: '+44 7700 100001' },
    { email: 'sarah@prodpayroll.com', firstName: 'Sarah', lastName: 'Mitchell', role: 'payroll_admin', phone: '+44 7700 100002' },
    { email: 'david@prodpayroll.com', firstName: 'David', lastName: 'Chen', role: 'production_accountant', phone: '+44 7700 100003' },
    { email: 'emma@prodpayroll.com', firstName: 'Emma', lastName: 'Thompson', role: 'department_head', phone: '+44 7700 100004' },
    { email: 'michael@prodpayroll.com', firstName: 'Michael', lastName: 'Brooks', role: 'department_head', phone: '+44 7700 100005' },
    { email: 'rachel@prodpayroll.com', firstName: 'Rachel', lastName: 'Kumar', role: 'department_head', phone: '+44 7700 100006' },
    { email: 'tom@prodpayroll.com', firstName: 'Tom', lastName: 'Harris', role: 'crew_member', phone: '+44 7700 100007' },
    { email: 'lisa@prodpayroll.com', firstName: 'Lisa', lastName: 'Patel', role: 'crew_member', phone: '+44 7700 100008' },
    { email: 'jake@prodpayroll.com', firstName: 'Jake', lastName: 'Morrison', role: 'crew_member', phone: '+44 7700 100009' },
    { email: 'nina@prodpayroll.com', firstName: 'Nina', lastName: 'Costa', role: 'crew_member', phone: '+44 7700 100010' },
    { email: 'alex@prodpayroll.com', firstName: 'Alex', lastName: 'Wright', role: 'crew_member', phone: '+44 7700 100011' },
    { email: 'sam@prodpayroll.com', firstName: 'Sam', lastName: "O'Brien", role: 'crew_member', phone: '+44 7700 100012' },
    { email: 'kate@prodpayroll.com', firstName: 'Kate', lastName: 'Ashford', role: 'crew_member', phone: '+44 7700 100013' },
    { email: 'ben@prodpayroll.com', firstName: 'Ben', lastName: 'Fletcher', role: 'crew_member', phone: '+44 7700 100014' },
    { email: 'zara@prodpayroll.com', firstName: 'Zara', lastName: 'Phillips', role: 'crew_member', phone: '+44 7700 100015' },
  ];

  // Insert users directly to bypass the pre-save hash (we already hashed)
  const users = [];
  for (const u of usersData) {
    const created = await User.create({ ...u, passwordHash: 'Demo123!' });
    users.push(created);
  }

  const userMap = {};
  users.forEach((u) => { userMap[u.email.split('@')[0]] = u; });

  console.log(`Created ${users.length} users`);

  // ──────────────────────────────────────────────────
  // 2. LOOK UP REFERENCE DATA
  // ──────────────────────────────────────────────────
  const bectu = await Union.findOne({ code: 'BECTU' });
  const equity = await Union.findOne({ code: 'EQUITY' });

  if (!bectu || !equity) {
    throw new Error('Unions not found. Please run the main seed first.');
  }

  // Departments
  const camDept = await Department.findOne({ unionId: bectu._id, code: 'CAM' });
  const sndDept = await Department.findOne({ unionId: bectu._id, code: 'SND' });
  const litDept = await Department.findOne({ unionId: bectu._id, code: 'LIT' });
  const artDept = await Department.findOne({ unionId: bectu._id, code: 'ART' });
  const postDept = await Department.findOne({ unionId: bectu._id, code: 'POST' });
  const runDept = await Department.findOne({ unionId: bectu._id, code: 'RUN' });
  const castDept = await Department.findOne({ unionId: equity._id, code: 'CAST' });

  // Designations
  const dopDesig = await Designation.findOne({ departmentId: camDept._id, code: 'DOP' });
  const ac1Desig = await Designation.findOne({ departmentId: camDept._id, code: '1AC' });
  const gafDesig = await Designation.findOne({ departmentId: litDept._id, code: 'GAF' });
  const sparkDesig = await Designation.findOne({ departmentId: litDept._id, code: 'SPARK' });
  const boomDesig = await Designation.findOne({ departmentId: sndDept._id, code: 'BOOM' });
  const artDirDesig = await Designation.findOne({ departmentId: artDept._id, code: 'ART_DIR' });
  const editorDesig = await Designation.findOne({ departmentId: postDept._id, code: 'EDITOR' });
  const setRunDesig = await Designation.findOne({ departmentId: runDept._id, code: 'SET_RUN' });
  const leadDesig = await Designation.findOne({ departmentId: castDept._id, code: 'LEAD' });

  // Budget tiers
  const mmpTier = await BudgetTier.findOne({ code: 'FILM_MMP' });
  const tvBand3Tier = await BudgetTier.findOne({ code: 'TV_BAND3' });
  const film515Tier = await BudgetTier.findOne({ code: 'FILM_5_15' });

  console.log('Looked up reference data');

  // Helper to find rate card or return null
  async function findRateCard(unionId, deptId, desigId, tierId) {
    return RateCard.findOne({
      unionId,
      departmentId: deptId,
      designationId: desigId,
      budgetTierId: tierId,
      isActive: true,
    });
  }

  // ──────────────────────────────────────────────────
  // 3. PRODUCTIONS
  // ──────────────────────────────────────────────────
  const admin = userMap['admin'];
  const sarah = userMap['sarah'];
  const david = userMap['david'];
  const emma = userMap['emma'];
  const michael = userMap['michael'];
  const rachel = userMap['rachel'];
  const tom = userMap['tom'];
  const lisa = userMap['lisa'];
  const jake = userMap['jake'];
  const nina = userMap['nina'];
  const alex = userMap['alex'];
  const sam = userMap['sam'];
  const kate = userMap['kate'];
  const ben = userMap['ben'];
  const zara = userMap['zara'];

  const prod1 = await Production.create({
    name: 'The Last Horizon',
    code: 'TLH-2024',
    productionType: 'feature_film',
    country: 'UK',
    budget: 35000000,
    currency: 'GBP',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2025-06-30'),
    status: 'production',
    companyName: 'Horizon Pictures Ltd',
    companyAddress: '42 Wardour Street, London W1D 6PW',
    members: [
      { userId: admin._id, role: 'Executive Producer', joinedAt: new Date('2024-08-01') },
      { userId: sarah._id, role: 'Payroll Admin', joinedAt: new Date('2024-08-15') },
      { userId: david._id, role: 'Production Accountant', joinedAt: new Date('2024-08-15') },
      { userId: emma._id, role: 'HoD Camera', joinedAt: new Date('2024-08-20') },
      { userId: michael._id, role: 'HoD Sound', joinedAt: new Date('2024-08-20') },
      { userId: tom._id, role: 'DOP', joinedAt: new Date('2024-09-01') },
      { userId: lisa._id, role: '1st AC', joinedAt: new Date('2024-09-01') },
      { userId: jake._id, role: 'Gaffer', joinedAt: new Date('2024-09-01') },
      { userId: nina._id, role: 'Boom Operator', joinedAt: new Date('2024-09-01') },
      { userId: sam._id, role: 'Spark', joinedAt: new Date('2024-09-01') },
      { userId: kate._id, role: 'Lead Actor', joinedAt: new Date('2024-09-15') },
    ],
    createdBy: admin._id,
  });

  const prod2 = await Production.create({
    name: 'Nightfall Chronicles',
    code: 'NC-2024',
    productionType: 'tv_drama',
    country: 'UK',
    budget: 5000000,
    currency: 'GBP',
    startDate: new Date('2024-10-15'),
    endDate: new Date('2025-08-31'),
    status: 'production',
    companyName: 'Nightfall Entertainment Ltd',
    companyAddress: '15 Greek Street, London W1D 4DP',
    members: [
      { userId: admin._id, role: 'Executive Producer', joinedAt: new Date('2024-09-15') },
      { userId: sarah._id, role: 'Payroll Admin', joinedAt: new Date('2024-10-01') },
      { userId: david._id, role: 'Production Accountant', joinedAt: new Date('2024-10-01') },
      { userId: rachel._id, role: 'HoD Art', joinedAt: new Date('2024-10-01') },
      { userId: alex._id, role: 'Art Director', joinedAt: new Date('2024-10-15') },
      { userId: ben._id, role: 'Editor', joinedAt: new Date('2024-11-01') },
    ],
    createdBy: admin._id,
  });

  const prod3 = await Production.create({
    name: 'Urban Echo',
    code: 'UE-2025',
    productionType: 'feature_film',
    country: 'UK',
    budget: 8000000,
    currency: 'GBP',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-10-31'),
    status: 'pre_production',
    companyName: 'Echo Films Ltd',
    companyAddress: '88 Dean Street, London W1D 3SR',
    members: [
      { userId: admin._id, role: 'Executive Producer', joinedAt: new Date('2025-01-01') },
      { userId: david._id, role: 'Production Accountant', joinedAt: new Date('2025-01-10') },
      { userId: zara._id, role: 'Runner', joinedAt: new Date('2025-01-15') },
    ],
    createdBy: admin._id,
  });

  // US Production
  const prod4 = await Production.create({
    name: 'Shadow Protocol',
    code: 'SP-2025',
    productionType: 'feature_film',
    country: 'US',
    budget: 50000000,
    currency: 'USD',
    startDate: new Date('2025-04-01'),
    endDate: new Date('2026-03-31'),
    status: 'pre_production',
    companyName: 'Apex Studios LLC',
    companyAddress: '5555 Melrose Avenue, Los Angeles, CA 90038',
    members: [
      { userId: admin._id, role: 'Executive Producer', joinedAt: new Date('2025-03-01') },
      { userId: sarah._id, role: 'Payroll Admin', joinedAt: new Date('2025-03-15') },
      { userId: david._id, role: 'Production Accountant', joinedAt: new Date('2025-03-15') },
      { userId: tom._id, role: 'Director', joinedAt: new Date('2025-04-01') },
      { userId: jake._id, role: '1st AD', joinedAt: new Date('2025-04-01') },
      { userId: kate._id, role: 'Lead Actor', joinedAt: new Date('2025-04-01') },
    ],
    createdBy: admin._id,
  });

  // US TV Production
  const prod5 = await Production.create({
    name: 'The Circuit',
    code: 'TC-2025',
    productionType: 'tv_drama',
    country: 'US',
    budget: 4000000,
    currency: 'USD',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-12-31'),
    status: 'pre_production',
    companyName: 'Circuit Television Inc.',
    companyAddress: '30 Rockefeller Plaza, New York, NY 10112',
    members: [
      { userId: admin._id, role: 'Executive Producer', joinedAt: new Date('2025-05-01') },
      { userId: ben._id, role: 'Editor', joinedAt: new Date('2025-06-01') },
    ],
    createdBy: admin._id,
  });

  console.log('Created 5 productions (3 UK + 2 US)');

  // ──────────────────────────────────────────────────
  // 4. DEAL MEMOS
  // ──────────────────────────────────────────────────

  // Helper to build a deal memo from rate card (or fallback rates)
  async function buildDealMemo({
    dealNumber, productionId, personId, createdById,
    unionId, departmentId, designationId, budgetTierId,
    status, startDate, endDate, guaranteedWeeks,
    fallbackRates, // { weeklyRate, dailyRate, hourlyRate, ot1x5, ot2x }
    kitAllowance, phoneAllowance, travelAllowance, computerAllowance, carAllowance,
    notes,
  }) {
    const rc = await findRateCard(unionId, departmentId, designationId, budgetTierId);
    const fb = fallbackRates || { weeklyRate: 1500, dailyRate: 300, hourlyRate: 27, ot1x5: 41, ot2x: 54 };

    // Use rate card if available and non-zero, otherwise fallback
    const weeklyRate = (rc && rc.weeklyRate > 0) ? rc.weeklyRate : fb.weeklyRate;
    const dailyRate = (rc && rc.dailyRate > 0) ? rc.dailyRate : fb.dailyRate;
    const hourlyRate = (rc && rc.hourlyRate > 0) ? rc.hourlyRate : fb.hourlyRate;
    const ot1x5 = (rc && rc.overtimeRate1x5 > 0) ? rc.overtimeRate1x5 : fb.ot1x5;
    const ot2x = (rc && rc.overtimeRate2x > 0) ? rc.overtimeRate2x : fb.ot2x;

    // Look up union for turnaround hours
    const union = await Union.findById(unionId);

    const dealData = {
      dealNumber,
      productionId,
      personId,
      createdById: createdById || admin._id,
      unionId,
      departmentId,
      designationId,
      budgetTierId,
      status,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      guaranteedWeeks: guaranteedWeeks || undefined,
      weeklyRate,
      dailyRate,
      hourlyRate,
      payBasis: 'weekly',
      rateCardId: rc ? rc._id : undefined,
      rateCardSourceUrl: rc ? rc.sourceUrl : undefined,
      otRate1x5: ot1x5,
      otRate2x: ot2x,
      standardWorkDayHrs: union.standardWorkDayHrs || 11,
      lunchBreakHrs: union.standardLunchHrs || 1,
      holidayPayPct: 0.1207,
      holidayPayInclusive: false,
      employerNiPct: 0.15,
      employerNiThresholdWeekly: 96.15,
      pensionPct: 0.03,
      apprenticeshipLevyPct: 0,
      sixthDayMultiplier: 1.5,
      seventhDayMultiplier: 2.0,
      nightPremiumPct: 0.5,
      nightStartTime: '23:00',
      mealPenaltyRate: Math.round(hourlyRate * 0.5 * 100) / 100,
      mealPenaltyIncrementMin: 15,
      mealPenaltyAfterHrs: 6,
      turnaroundMinHrs: union.minTurnaroundHrs || 11,
      turnaroundPenaltyMultiplier: 1.5,
      kitAllowance: kitAllowance || 0,
      kitAllowancePeriod: 'weekly',
      travelAllowance: travelAllowance || 0,
      phoneAllowance: phoneAllowance || 0,
      computerAllowance: computerAllowance || 0,
      carAllowance: carAllowance || 0,
      perDiemRate: 0,
      notes: notes || '',
      statusHistory: [
        { toStatus: 'draft', changedBy: admin._id, note: 'Deal memo created', createdAt: new Date(startDate) },
      ],
    };

    if (status === 'signed' || status === 'active' || status === 'completed') {
      dealData.signedAt = new Date(startDate);
      dealData.statusHistory.push(
        { fromStatus: 'draft', toStatus: 'sent', changedBy: admin._id, note: 'Sent for signature' },
        { fromStatus: 'sent', toStatus: 'signed', changedBy: personId, note: 'Signed by crew member' },
      );
      if (status === 'active') {
        dealData.statusHistory.push(
          { fromStatus: 'signed', toStatus: 'active', changedBy: admin._id, note: 'Activated for payroll' },
        );
      }
    }

    return DealMemo.create(dealData);
  }

  // DM-2025-001: Tom Harris as DOP on "The Last Horizon"
  // DOP is "Individually Negotiated" on Camera Branch card, so we supply a realistic negotiated rate
  const dm1 = await buildDealMemo({
    dealNumber: 'DM-2025-001',
    productionId: prod1._id,
    personId: tom._id,
    createdById: admin._id,
    unionId: bectu._id,
    departmentId: camDept._id,
    designationId: dopDesig._id,
    budgetTierId: mmpTier._id,
    status: 'active',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    guaranteedWeeks: 40,
    fallbackRates: { weeklyRate: 7500, dailyRate: 1500, hourlyRate: 136, ot1x5: 82, ot2x: 82 },
    kitAllowance: 250,
    phoneAllowance: 25,
    notes: 'Negotiated rate above card. Includes own camera package.',
  });

  // DM-2025-002: Lisa Patel as 1st AC on "The Last Horizon"
  const dm2 = await buildDealMemo({
    dealNumber: 'DM-2025-002',
    productionId: prod1._id,
    personId: lisa._id,
    createdById: admin._id,
    unionId: bectu._id,
    departmentId: camDept._id,
    designationId: ac1Desig._id,
    budgetTierId: mmpTier._id,
    status: 'active',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    guaranteedWeeks: 40,
    kitAllowance: 100,
    phoneAllowance: 15,
    notes: 'Focus puller. Own kit provided.',
  });

  // DM-2025-003: Jake Morrison as Gaffer on "The Last Horizon"
  const dm3 = await buildDealMemo({
    dealNumber: 'DM-2025-003',
    productionId: prod1._id,
    personId: jake._id,
    createdById: admin._id,
    unionId: bectu._id,
    departmentId: litDept._id,
    designationId: gafDesig._id,
    budgetTierId: mmpTier._id,
    status: 'active',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    guaranteedWeeks: 38,
    kitAllowance: 150,
    phoneAllowance: 20,
    travelAllowance: 75,
    notes: 'Gaffer. Owns lighting console.',
  });

  // DM-2025-004: Nina Costa as Boom Op on "The Last Horizon"
  const dm4 = await buildDealMemo({
    dealNumber: 'DM-2025-004',
    productionId: prod1._id,
    personId: nina._id,
    createdById: admin._id,
    unionId: bectu._id,
    departmentId: sndDept._id,
    designationId: boomDesig._id,
    budgetTierId: mmpTier._id,
    status: 'signed',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    guaranteedWeeks: 36,
    kitAllowance: 50,
    phoneAllowance: 15,
    notes: 'Boom operator. Recently signed, awaiting activation.',
  });

  // DM-2025-005: Alex Wright as Art Director on "Nightfall Chronicles" (TV Band 3)
  const dm5 = await buildDealMemo({
    dealNumber: 'DM-2025-005',
    productionId: prod2._id,
    personId: alex._id,
    createdById: admin._id,
    unionId: bectu._id,
    departmentId: artDept._id,
    designationId: artDirDesig._id,
    budgetTierId: tvBand3Tier._id,
    status: 'active',
    startDate: '2024-10-15',
    endDate: '2025-08-31',
    guaranteedWeeks: 30,
    fallbackRates: { weeklyRate: 1950, dailyRate: 390, hourlyRate: 35.45, ot1x5: 53.18, ot2x: 70.91 },
    phoneAllowance: 20,
    notes: 'Art Director for TV drama. Rate negotiated for TV Band 3.',
  });

  // DM-2025-006: Sam O'Brien as Spark on "The Last Horizon"
  const dm6 = await buildDealMemo({
    dealNumber: 'DM-2025-006',
    productionId: prod1._id,
    personId: sam._id,
    createdById: admin._id,
    unionId: bectu._id,
    departmentId: litDept._id,
    designationId: sparkDesig._id,
    budgetTierId: mmpTier._id,
    status: 'active',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    guaranteedWeeks: 36,
    travelAllowance: 50,
    notes: 'Electrician / Spark. Reliable crew member.',
  });

  // DM-2025-007: Kate Ashford as Lead Actor on "The Last Horizon" (Equity)
  const dm7 = await buildDealMemo({
    dealNumber: 'DM-2025-007',
    productionId: prod1._id,
    personId: kate._id,
    createdById: admin._id,
    unionId: equity._id,
    departmentId: castDept._id,
    designationId: leadDesig._id,
    budgetTierId: mmpTier._id,
    status: 'active',
    startDate: '2024-09-15',
    endDate: '2025-04-30',
    guaranteedWeeks: 20,
    travelAllowance: 100,
    carAllowance: 200,
    notes: 'Lead role. Negotiated above Equity minimum. Includes per-episode fee.',
  });

  // DM-2025-008: Zara Phillips as Runner on "Urban Echo" (Film 5-15m)
  const dm8 = await buildDealMemo({
    dealNumber: 'DM-2025-008',
    productionId: prod3._id,
    personId: zara._id,
    createdById: admin._id,
    unionId: bectu._id,
    departmentId: runDept._id,
    designationId: setRunDesig._id,
    budgetTierId: film515Tier._id,
    status: 'draft',
    startDate: '2025-02-01',
    endDate: '2025-10-31',
    guaranteedWeeks: 20,
    fallbackRates: { weeklyRate: 675, dailyRate: 135, hourlyRate: 12.27, ot1x5: 18.41, ot2x: 24.55 },
    travelAllowance: 30,
    notes: 'Set runner. First feature film role. Draft pending approval.',
  });

  // DM-2025-009: Ben Fletcher as Editor on "Nightfall Chronicles" (TV Band 3)
  const dm9 = await buildDealMemo({
    dealNumber: 'DM-2025-009',
    productionId: prod2._id,
    personId: ben._id,
    createdById: admin._id,
    unionId: bectu._id,
    departmentId: postDept._id,
    designationId: editorDesig._id,
    budgetTierId: tvBand3Tier._id,
    status: 'signed',
    startDate: '2024-11-01',
    endDate: '2025-08-31',
    guaranteedWeeks: 24,
    fallbackRates: { weeklyRate: 2100, dailyRate: 420, hourlyRate: 38.18, ot1x5: 57.27, ot2x: 76.36 },
    computerAllowance: 50,
    phoneAllowance: 15,
    notes: 'Offline editor. Own Avid system provided. Signed, awaiting start of post.',
  });

  console.log('Created 9 deal memos');

  // ──────────────────────────────────────────────────
  // 5. TIMECARDS
  // ──────────────────────────────────────────────────
  const weekStart = new Date('2025-03-24');
  const weekEnd = new Date('2025-03-30');
  const prevWeekStart = new Date('2025-03-17');
  const prevWeekEnd = new Date('2025-03-23');

  // Helper to create a date for a given day of the week (0=Mon starting from weekStart)
  function dayDate(baseDate, dayOffset) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + dayOffset);
    return d;
  }

  // Helper to compute hours between two "HH:MM" times minus lunch
  function computeHours(call, wrap, lunchStart, lunchEnd) {
    const [ch, cm] = call.split(':').map(Number);
    const [wh, wm] = wrap.split(':').map(Number);
    const callMin = ch * 60 + cm;
    const wrapMin = wh * 60 + wm;
    let worked = (wrapMin - callMin) / 60;
    if (lunchStart && lunchEnd) {
      const [ls, lsm] = lunchStart.split(':').map(Number);
      const [le, lem] = lunchEnd.split(':').map(Number);
      worked -= ((le * 60 + lem) - (ls * 60 + lsm)) / 60;
    }
    return Math.round(worked * 100) / 100;
  }

  function buildEntry({ date, dayOfWeek, dayNumber, callTime, wrapTime, lunchStart, lunchEnd, standardHrs, isSixthDay, isTravelDay, isRestDay, mealPenaltyCount, turnaroundViolation, turnaroundShortfallHrs, notes }) {
    const totalWorkedHrs = isRestDay ? 0 : computeHours(callTime, wrapTime, lunchStart, lunchEnd);
    const straight = Math.min(totalWorkedHrs, standardHrs || 11);
    const otTotal = Math.max(0, totalWorkedHrs - straight);
    // First 2 OT hours at 1.5x, rest at 2x
    const ot1x5 = Math.min(otTotal, 2);
    const ot2x = Math.max(0, otTotal - 2);

    return {
      date: new Date(date),
      dayOfWeek,
      dayNumber: dayNumber || 1,
      callTime: isRestDay ? null : callTime,
      wrapTime: isRestDay ? null : wrapTime,
      lunchStart: isRestDay ? null : (lunchStart || null),
      lunchEnd: isRestDay ? null : (lunchEnd || null),
      totalWorkedHrs,
      straightHrs: straight,
      ot1x5Hrs: ot1x5,
      ot2xHrs: ot2x,
      nightHrs: 0,
      mealPenaltyCount: mealPenaltyCount || 0,
      mealPenaltyMinutes: (mealPenaltyCount || 0) * 15,
      turnaroundViolation: turnaroundViolation || false,
      turnaroundShortfallHrs: turnaroundShortfallHrs || 0,
      isTravelDay: isTravelDay || false,
      isSixthDay: isSixthDay || false,
      isSeventhDay: false,
      isHoliday: false,
      isRestDay: isRestDay || false,
      notes: notes || '',
    };
  }

  // ── Timecard 1: Tom Harris (DOP) — 5 days, 1 day with 2hrs OT, 1 meal penalty
  const tc1Entries = [
    buildEntry({ date: dayDate(weekStart, 0), dayOfWeek: 1, dayNumber: 1, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 1), dayOfWeek: 2, dayNumber: 2, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 2), dayOfWeek: 3, dayNumber: 3, callTime: '06:30', wrapTime: '20:30', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11, mealPenaltyCount: 1, notes: 'Late wrap due to sunset scene. Meal penalty: second meal not provided after 6hrs.' }),
    buildEntry({ date: dayDate(weekStart, 3), dayOfWeek: 4, dayNumber: 4, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 4), dayOfWeek: 5, dayNumber: 5, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 5), dayOfWeek: 6, dayNumber: 6, callTime: null, wrapTime: null, lunchStart: null, lunchEnd: null, standardHrs: 11, isRestDay: true }),
    buildEntry({ date: dayDate(weekStart, 6), dayOfWeek: 0, dayNumber: 7, callTime: null, wrapTime: null, lunchStart: null, lunchEnd: null, standardHrs: 11, isRestDay: true }),
  ];

  const tc1TotalStraight = tc1Entries.reduce((s, e) => s + e.straightHrs, 0);
  const tc1TotalOt1x5 = tc1Entries.reduce((s, e) => s + e.ot1x5Hrs, 0);
  const tc1TotalOt2x = tc1Entries.reduce((s, e) => s + e.ot2xHrs, 0);
  const tc1TotalMealPenalties = tc1Entries.reduce((s, e) => s + e.mealPenaltyCount, 0);

  const tc1 = await Timecard.create({
    timecardNumber: 'TC-2025-W13-001',
    productionId: prod1._id,
    dealMemoId: dm1._id,
    ownerId: tom._id,
    weekStarting: weekStart,
    weekEnding: weekEnd,
    status: 'payroll_approved',
    totalStraightHrs: tc1TotalStraight,
    totalOt1x5Hrs: tc1TotalOt1x5,
    totalOt2xHrs: tc1TotalOt2x,
    totalMealPenalties: tc1TotalMealPenalties,
    totalTurnaroundPenalties: 0,
    totalNightHrs: 0,
    daysWorked: 5,
    entries: tc1Entries,
    submittedAt: new Date('2025-03-30T18:00:00'),
    deptApprovedById: emma._id,
    deptApprovedAt: new Date('2025-03-31T09:00:00'),
    payrollApprovedById: sarah._id,
    payrollApprovedAt: new Date('2025-03-31T11:00:00'),
  });

  // ── Timecard 2: Lisa Patel (1st AC) — 5 days, standard hours, clean
  const tc2Entries = [
    buildEntry({ date: dayDate(weekStart, 0), dayOfWeek: 1, dayNumber: 1, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 1), dayOfWeek: 2, dayNumber: 2, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 2), dayOfWeek: 3, dayNumber: 3, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 3), dayOfWeek: 4, dayNumber: 4, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 4), dayOfWeek: 5, dayNumber: 5, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 5), dayOfWeek: 6, dayNumber: 6, callTime: null, wrapTime: null, standardHrs: 11, isRestDay: true }),
    buildEntry({ date: dayDate(weekStart, 6), dayOfWeek: 0, dayNumber: 7, callTime: null, wrapTime: null, standardHrs: 11, isRestDay: true }),
  ];

  const tc2 = await Timecard.create({
    timecardNumber: 'TC-2025-W13-002',
    productionId: prod1._id,
    dealMemoId: dm2._id,
    ownerId: lisa._id,
    weekStarting: weekStart,
    weekEnding: weekEnd,
    status: 'dept_approved',
    totalStraightHrs: tc2Entries.reduce((s, e) => s + e.straightHrs, 0),
    totalOt1x5Hrs: 0,
    totalOt2xHrs: 0,
    totalMealPenalties: 0,
    totalTurnaroundPenalties: 0,
    totalNightHrs: 0,
    daysWorked: 5,
    entries: tc2Entries,
    submittedAt: new Date('2025-03-30T17:30:00'),
    deptApprovedById: emma._id,
    deptApprovedAt: new Date('2025-03-31T09:15:00'),
  });

  // ── Timecard 3: Jake Morrison (Gaffer) — 6 days worked (6th day!), some OT
  const tc3Entries = [
    buildEntry({ date: dayDate(weekStart, 0), dayOfWeek: 1, dayNumber: 1, callTime: '06:30', wrapTime: '19:30', lunchStart: '12:30', lunchEnd: '13:30', standardHrs: 11, notes: 'Rigging day' }),
    buildEntry({ date: dayDate(weekStart, 1), dayOfWeek: 2, dayNumber: 2, callTime: '07:00', wrapTime: '20:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 2), dayOfWeek: 3, dayNumber: 3, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 3), dayOfWeek: 4, dayNumber: 4, callTime: '07:00', wrapTime: '20:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11, notes: 'Night exterior setup' }),
    buildEntry({ date: dayDate(weekStart, 4), dayOfWeek: 5, dayNumber: 5, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 5), dayOfWeek: 6, dayNumber: 6, callTime: '08:00', wrapTime: '18:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11, isSixthDay: true, notes: '6th day — rigging for Monday' }),
    buildEntry({ date: dayDate(weekStart, 6), dayOfWeek: 0, dayNumber: 7, callTime: null, wrapTime: null, standardHrs: 11, isRestDay: true }),
  ];

  const tc3 = await Timecard.create({
    timecardNumber: 'TC-2025-W13-003',
    productionId: prod1._id,
    dealMemoId: dm3._id,
    ownerId: jake._id,
    weekStarting: weekStart,
    weekEnding: weekEnd,
    status: 'payroll_approved',
    totalStraightHrs: tc3Entries.reduce((s, e) => s + e.straightHrs, 0),
    totalOt1x5Hrs: tc3Entries.reduce((s, e) => s + e.ot1x5Hrs, 0),
    totalOt2xHrs: tc3Entries.reduce((s, e) => s + e.ot2xHrs, 0),
    totalMealPenalties: 0,
    totalTurnaroundPenalties: 0,
    totalNightHrs: 0,
    daysWorked: 6,
    entries: tc3Entries,
    submittedAt: new Date('2025-03-30T19:00:00'),
    deptApprovedById: emma._id,
    deptApprovedAt: new Date('2025-03-31T09:30:00'),
    payrollApprovedById: sarah._id,
    payrollApprovedAt: new Date('2025-03-31T11:15:00'),
  });

  // ── Timecard 4: Sam O'Brien (Spark) — 5 days, 1 turnaround violation
  const tc4Entries = [
    buildEntry({ date: dayDate(weekStart, 0), dayOfWeek: 1, dayNumber: 1, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 1), dayOfWeek: 2, dayNumber: 2, callTime: '07:00', wrapTime: '21:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11, notes: 'Late wrap — night exterior' }),
    buildEntry({ date: dayDate(weekStart, 2), dayOfWeek: 3, dayNumber: 3, callTime: '06:00', wrapTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00', standardHrs: 11, turnaroundViolation: true, turnaroundShortfallHrs: 2, notes: 'Turnaround violation: only 9hrs between wrap and call (21:00 to 06:00)' }),
    buildEntry({ date: dayDate(weekStart, 3), dayOfWeek: 4, dayNumber: 4, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 4), dayOfWeek: 5, dayNumber: 5, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 5), dayOfWeek: 6, dayNumber: 6, callTime: null, wrapTime: null, standardHrs: 11, isRestDay: true }),
    buildEntry({ date: dayDate(weekStart, 6), dayOfWeek: 0, dayNumber: 7, callTime: null, wrapTime: null, standardHrs: 11, isRestDay: true }),
  ];

  const tc4 = await Timecard.create({
    timecardNumber: 'TC-2025-W13-004',
    productionId: prod1._id,
    dealMemoId: dm6._id,
    ownerId: sam._id,
    weekStarting: weekStart,
    weekEnding: weekEnd,
    status: 'draft',
    totalStraightHrs: tc4Entries.reduce((s, e) => s + e.straightHrs, 0),
    totalOt1x5Hrs: tc4Entries.reduce((s, e) => s + e.ot1x5Hrs, 0),
    totalOt2xHrs: tc4Entries.reduce((s, e) => s + e.ot2xHrs, 0),
    totalMealPenalties: 0,
    totalTurnaroundPenalties: 1,
    totalNightHrs: 0,
    daysWorked: 5,
    entries: tc4Entries,
    notes: 'Turnaround violation on Wednesday — needs review.',
  });

  // ── Timecard 5: Kate Ashford (Lead Actor) — 4 days worked, 1 travel day
  const tc5Entries = [
    buildEntry({ date: dayDate(weekStart, 0), dayOfWeek: 1, dayNumber: 1, callTime: '08:00', wrapTime: '18:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 10, isTravelDay: true, notes: 'Travel day — London to location in Wales' }),
    buildEntry({ date: dayDate(weekStart, 1), dayOfWeek: 2, dayNumber: 2, callTime: '07:00', wrapTime: '18:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 10 }),
    buildEntry({ date: dayDate(weekStart, 2), dayOfWeek: 3, dayNumber: 3, callTime: '07:00', wrapTime: '18:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 10 }),
    buildEntry({ date: dayDate(weekStart, 3), dayOfWeek: 4, dayNumber: 4, callTime: '07:00', wrapTime: '18:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 10 }),
    buildEntry({ date: dayDate(weekStart, 4), dayOfWeek: 5, dayNumber: 5, callTime: '08:00', wrapTime: '17:00', lunchStart: '12:30', lunchEnd: '13:30', standardHrs: 10, notes: 'Half day — rehearsal only' }),
    buildEntry({ date: dayDate(weekStart, 5), dayOfWeek: 6, dayNumber: 6, callTime: null, wrapTime: null, standardHrs: 10, isRestDay: true }),
    buildEntry({ date: dayDate(weekStart, 6), dayOfWeek: 0, dayNumber: 7, callTime: null, wrapTime: null, standardHrs: 10, isRestDay: true }),
  ];

  const tc5 = await Timecard.create({
    timecardNumber: 'TC-2025-W13-005',
    productionId: prod1._id,
    dealMemoId: dm7._id,
    ownerId: kate._id,
    weekStarting: weekStart,
    weekEnding: weekEnd,
    status: 'payroll_approved',
    totalStraightHrs: tc5Entries.reduce((s, e) => s + e.straightHrs, 0),
    totalOt1x5Hrs: tc5Entries.reduce((s, e) => s + e.ot1x5Hrs, 0),
    totalOt2xHrs: tc5Entries.reduce((s, e) => s + e.ot2xHrs, 0),
    totalMealPenalties: 0,
    totalTurnaroundPenalties: 0,
    totalNightHrs: 0,
    daysWorked: 5,
    entries: tc5Entries,
    submittedAt: new Date('2025-03-30T16:00:00'),
    deptApprovedById: emma._id,
    deptApprovedAt: new Date('2025-03-31T09:45:00'),
    payrollApprovedById: sarah._id,
    payrollApprovedAt: new Date('2025-03-31T11:30:00'),
    notes: '1 travel day + 4 work days. Travel day to Wales location.',
  });

  // ── Timecard 6: Nina Costa (Boom Op) — 5 days, submitted status
  const tc6Entries = [
    buildEntry({ date: dayDate(weekStart, 0), dayOfWeek: 1, dayNumber: 1, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 1), dayOfWeek: 2, dayNumber: 2, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 2), dayOfWeek: 3, dayNumber: 3, callTime: '07:00', wrapTime: '19:30', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11, notes: 'Slight overrun on sound check' }),
    buildEntry({ date: dayDate(weekStart, 3), dayOfWeek: 4, dayNumber: 4, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 4), dayOfWeek: 5, dayNumber: 5, callTime: '07:00', wrapTime: '19:00', lunchStart: '13:00', lunchEnd: '14:00', standardHrs: 11 }),
    buildEntry({ date: dayDate(weekStart, 5), dayOfWeek: 6, dayNumber: 6, callTime: null, wrapTime: null, standardHrs: 11, isRestDay: true }),
    buildEntry({ date: dayDate(weekStart, 6), dayOfWeek: 0, dayNumber: 7, callTime: null, wrapTime: null, standardHrs: 11, isRestDay: true }),
  ];

  const tc6 = await Timecard.create({
    timecardNumber: 'TC-2025-W13-006',
    productionId: prod1._id,
    dealMemoId: dm4._id,
    ownerId: nina._id,
    weekStarting: weekStart,
    weekEnding: weekEnd,
    status: 'submitted',
    totalStraightHrs: tc6Entries.reduce((s, e) => s + e.straightHrs, 0),
    totalOt1x5Hrs: tc6Entries.reduce((s, e) => s + e.ot1x5Hrs, 0),
    totalOt2xHrs: tc6Entries.reduce((s, e) => s + e.ot2xHrs, 0),
    totalMealPenalties: 0,
    totalTurnaroundPenalties: 0,
    totalNightHrs: 0,
    daysWorked: 5,
    entries: tc6Entries,
    submittedAt: new Date('2025-03-30T20:00:00'),
  });

  console.log('Created 6 timecards');

  // ──────────────────────────────────────────────────
  // 6. PAYROLL RUNS
  // ──────────────────────────────────────────────────

  // Helper to calculate payroll item from deal memo and timecard
  function calcPayrollItem(timecard, dealMemo, personName, unionCode, deptName, desigName) {
    const basePay = dealMemo.weeklyRate;
    const ot1x5Pay = Math.round(timecard.totalOt1x5Hrs * dealMemo.otRate1x5 * 100) / 100;
    const ot2xPay = Math.round(timecard.totalOt2xHrs * dealMemo.otRate2x * 100) / 100;
    const mealPenaltyPay = Math.round(timecard.totalMealPenalties * (dealMemo.mealPenaltyRate || 0) * 100) / 100;
    const turnaroundPenaltyPay = Math.round(timecard.totalTurnaroundPenalties * dealMemo.hourlyRate * dealMemo.turnaroundPenaltyMultiplier * 100) / 100;

    // 6th day premium
    const sixthDayEntries = timecard.entries.filter(e => e.isSixthDay);
    const sixthDayPremium = sixthDayEntries.reduce((sum, e) => {
      return sum + Math.round(e.totalWorkedHrs * dealMemo.hourlyRate * (dealMemo.sixthDayMultiplier - 1) * 100) / 100;
    }, 0);

    const kitAllowance = dealMemo.kitAllowance || 0;
    const travelAllowance = dealMemo.travelAllowance || 0;
    const phoneAllowance = dealMemo.phoneAllowance || 0;
    const computerAllowance = dealMemo.computerAllowance || 0;
    const carAllowance = dealMemo.carAllowance || 0;

    const grossPay = Math.round((basePay + ot1x5Pay + ot2xPay + mealPenaltyPay + turnaroundPenaltyPay + sixthDayPremium + kitAllowance + travelAllowance + phoneAllowance + computerAllowance + carAllowance) * 100) / 100;

    // Employer fringes
    const holidayPay = Math.round(grossPay * dealMemo.holidayPayPct * 100) / 100;
    const employerNi = Math.round(Math.max(0, grossPay - dealMemo.employerNiThresholdWeekly) * dealMemo.employerNiPct * 100) / 100;
    const employerPension = Math.round(grossPay * dealMemo.pensionPct * 100) / 100;
    const totalFringes = Math.round((holidayPay + employerNi + employerPension) * 100) / 100;

    // Employee deductions (simplified estimates)
    const employeeNi = Math.round(Math.max(0, grossPay - 242) * 0.08 * 100) / 100;
    const incomeTax = Math.round(Math.max(0, grossPay - 242.31) * 0.2 * 100) / 100;
    const employeePension = Math.round(grossPay * 0.05 * 100) / 100;
    const totalDeductions = Math.round((employeeNi + incomeTax + employeePension) * 100) / 100;

    const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;
    const totalCost = Math.round((grossPay + totalFringes) * 100) / 100;

    return {
      timecardId: timecard._id,
      dealMemoId: dealMemo._id,
      personName,
      unionCode,
      departmentName: deptName,
      designationName: desigName,
      basePay,
      overtime1x5Pay: ot1x5Pay,
      overtime2xPay: ot2xPay,
      mealPenaltyPay,
      turnaroundPenaltyPay,
      sixthDayPremium,
      seventhDayPremium: 0,
      nightPremium: 0,
      kitAllowance,
      travelAllowance,
      perDiem: 0,
      phoneAllowance,
      computerAllowance,
      carAllowance,
      otherEarnings: 0,
      grossPay,
      holidayPay,
      employerNi,
      employerPension,
      apprenticeshipLevy: 0,
      totalFringes,
      employeeNi,
      incomeTax,
      employeePension,
      studentLoan: 0,
      otherDeductions: 0,
      totalDeductions,
      netPay,
      totalCost,
    };
  }

  // Run 1: Current week (W13) — status "calculated"
  const item1 = calcPayrollItem(tc1, dm1, 'Tom Harris', 'BECTU', 'Camera', 'DOP');
  const item3 = calcPayrollItem(tc3, dm3, 'Jake Morrison', 'BECTU', 'Lighting (Sparks)', 'Gaffer');
  const item5 = calcPayrollItem(tc5, dm7, 'Kate Ashford', 'EQUITY', 'Cast (Principals)', 'Lead Actor');

  const run1Items = [item1, item3, item5];
  const run1TotalGross = run1Items.reduce((s, i) => s + i.grossPay, 0);
  const run1TotalFringes = run1Items.reduce((s, i) => s + i.totalFringes, 0);
  const run1TotalDeductions = run1Items.reduce((s, i) => s + i.totalDeductions, 0);
  const run1TotalNet = run1Items.reduce((s, i) => s + i.netPay, 0);
  const run1TotalCost = run1Items.reduce((s, i) => s + i.totalCost, 0);

  await PayrollRun.create({
    runNumber: 'PR-2025-W13',
    productionId: prod1._id,
    weekStarting: weekStart,
    weekEnding: weekEnd,
    status: 'calculated',
    processedById: sarah._id,
    processedAt: new Date('2025-03-31T12:00:00'),
    totalGross: Math.round(run1TotalGross * 100) / 100,
    totalFringes: Math.round(run1TotalFringes * 100) / 100,
    totalDeductions: Math.round(run1TotalDeductions * 100) / 100,
    totalNet: Math.round(run1TotalNet * 100) / 100,
    totalCost: Math.round(run1TotalCost * 100) / 100,
    headcount: 3,
    items: run1Items,
    notes: 'Week 13 payroll. 3 approved timecards processed. Pending review.',
  });

  // Run 2: Previous week (W12) — status "paid"
  // Create simplified payroll items for the previous week (reusing rates, slightly different hours)
  function prevWeekItem(dealMemo, personName, unionCode, deptName, desigName, daysWorked, otHrs) {
    const basePay = dealMemo.weeklyRate;
    const ot1x5Pay = Math.round(Math.min(otHrs, 2) * dealMemo.otRate1x5 * 100) / 100;
    const ot2xPay = Math.round(Math.max(0, otHrs - 2) * dealMemo.otRate2x * 100) / 100;
    const kitAllowance = dealMemo.kitAllowance || 0;
    const travelAllowance = dealMemo.travelAllowance || 0;
    const phoneAllowance = dealMemo.phoneAllowance || 0;
    const computerAllowance = dealMemo.computerAllowance || 0;
    const carAllowance = dealMemo.carAllowance || 0;

    const grossPay = Math.round((basePay + ot1x5Pay + ot2xPay + kitAllowance + travelAllowance + phoneAllowance + computerAllowance + carAllowance) * 100) / 100;
    const holidayPay = Math.round(grossPay * dealMemo.holidayPayPct * 100) / 100;
    const employerNi = Math.round(Math.max(0, grossPay - dealMemo.employerNiThresholdWeekly) * dealMemo.employerNiPct * 100) / 100;
    const employerPension = Math.round(grossPay * dealMemo.pensionPct * 100) / 100;
    const totalFringes = Math.round((holidayPay + employerNi + employerPension) * 100) / 100;
    const employeeNi = Math.round(Math.max(0, grossPay - 242) * 0.08 * 100) / 100;
    const incomeTax = Math.round(Math.max(0, grossPay - 242.31) * 0.2 * 100) / 100;
    const employeePension = Math.round(grossPay * 0.05 * 100) / 100;
    const totalDeductions = Math.round((employeeNi + incomeTax + employeePension) * 100) / 100;
    const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;
    const totalCost = Math.round((grossPay + totalFringes) * 100) / 100;

    return {
      timecardId: tc1._id, // placeholder — in reality these would be W12 timecards
      dealMemoId: dealMemo._id,
      personName,
      unionCode,
      departmentName: deptName,
      designationName: desigName,
      basePay,
      overtime1x5Pay: ot1x5Pay,
      overtime2xPay: ot2xPay,
      mealPenaltyPay: 0,
      turnaroundPenaltyPay: 0,
      sixthDayPremium: 0,
      seventhDayPremium: 0,
      nightPremium: 0,
      kitAllowance,
      travelAllowance,
      perDiem: 0,
      phoneAllowance,
      computerAllowance,
      carAllowance,
      otherEarnings: 0,
      grossPay,
      holidayPay,
      employerNi,
      employerPension,
      apprenticeshipLevy: 0,
      totalFringes,
      employeeNi,
      incomeTax,
      employeePension,
      studentLoan: 0,
      otherDeductions: 0,
      totalDeductions,
      netPay,
      totalCost,
    };
  }

  const prevItem1 = prevWeekItem(dm1, 'Tom Harris', 'BECTU', 'Camera', 'DOP', 5, 1);
  const prevItem2 = prevWeekItem(dm2, 'Lisa Patel', 'BECTU', 'Camera', '1st AC', 5, 0);
  const prevItem3 = prevWeekItem(dm3, 'Jake Morrison', 'BECTU', 'Lighting (Sparks)', 'Gaffer', 5, 0);
  const prevItem4 = prevWeekItem(dm6, "Sam O'Brien", 'BECTU', 'Lighting (Sparks)', 'Spark', 5, 0);
  const prevItem5 = prevWeekItem(dm7, 'Kate Ashford', 'EQUITY', 'Cast (Principals)', 'Lead Actor', 5, 0);

  const run2Items = [prevItem1, prevItem2, prevItem3, prevItem4, prevItem5];
  const run2TotalGross = run2Items.reduce((s, i) => s + i.grossPay, 0);
  const run2TotalFringes = run2Items.reduce((s, i) => s + i.totalFringes, 0);
  const run2TotalDeductions = run2Items.reduce((s, i) => s + i.totalDeductions, 0);
  const run2TotalNet = run2Items.reduce((s, i) => s + i.netPay, 0);
  const run2TotalCost = run2Items.reduce((s, i) => s + i.totalCost, 0);

  await PayrollRun.create({
    runNumber: 'PR-2025-W12',
    productionId: prod1._id,
    weekStarting: prevWeekStart,
    weekEnding: prevWeekEnd,
    status: 'paid',
    processedById: sarah._id,
    processedAt: new Date('2025-03-24T14:00:00'),
    totalGross: Math.round(run2TotalGross * 100) / 100,
    totalFringes: Math.round(run2TotalFringes * 100) / 100,
    totalDeductions: Math.round(run2TotalDeductions * 100) / 100,
    totalNet: Math.round(run2TotalNet * 100) / 100,
    totalCost: Math.round(run2TotalCost * 100) / 100,
    headcount: 5,
    items: run2Items,
    notes: 'Week 12 payroll — all paid via BACS on 2025-03-26.',
    exportedAt: new Date('2025-03-24T15:00:00'),
    paidAt: new Date('2025-03-26T09:00:00'),
  });

  console.log('Created 2 payroll runs');
  console.log('--- Dummy data seeding complete ---\n');
}
