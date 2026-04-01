import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { User, Union, Department, Designation, BudgetTier, RateCard, OvertimeRule } from '../models/index.js';
import { unions } from './unions.js';
import { departmentsByUnion } from './departments.js';
import { designationsByDept } from './designations.js';
import { budgetTiers } from './budgetTiers.js';
import { rateCards } from './rateCards.js';
import { overtimeRules } from './overtimeRules.js';
import { seedDummyData } from './dummyData.js';

// US seed data
import { usUnions } from './usUnions.js';
import { usDepartmentsByUnion } from './usDepartments.js';
import { usDesignationsByDept } from './usDesignations.js';
import { usBudgetTiers } from './usBudgetTiers.js';
import { usRateCards } from './usRateCards.js';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Union.deleteMany({}),
      Department.deleteMany({}),
      Designation.deleteMany({}),
      BudgetTier.deleteMany({}),
      RateCard.deleteMany({}),
      OvertimeRule.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // 1. Seed unions (UK + US)
    const createdUkUnions = await Union.insertMany(unions);
    const createdUsUnions = await Union.insertMany(usUnions);
    const unionMap = {};
    createdUkUnions.forEach((u) => { unionMap[u.code] = u._id; });
    createdUsUnions.forEach((u) => { unionMap[u.code] = u._id; });
    console.log(`Seeded ${createdUkUnions.length} UK unions + ${createdUsUnions.length} US unions`);

    // 2. Seed departments (UK + US)
    const deptDocs = [];
    for (const [unionCode, depts] of Object.entries(departmentsByUnion)) {
      for (const dept of depts) {
        deptDocs.push({ ...dept, unionId: unionMap[unionCode] });
      }
    }
    for (const [unionCode, depts] of Object.entries(usDepartmentsByUnion)) {
      for (const dept of depts) {
        deptDocs.push({ ...dept, unionId: unionMap[unionCode] });
      }
    }
    const createdDepts = await Department.insertMany(deptDocs);
    const deptMap = {};
    createdDepts.forEach((d) => { deptMap[`${d.unionId}_${d.code}`] = d._id; });
    console.log(`Seeded ${createdDepts.length} departments (UK + US)`);

    // 3. Seed designations (UK + US)
    const desigDocs = [];
    const allDesigSets = { ...designationsByDept, ...usDesignationsByDept };
    for (const [key, desigs] of Object.entries(allDesigSets)) {
      const lastUnderscore = key.lastIndexOf('_');
      const unionCode = key.slice(0, lastUnderscore);
      const deptCode = key.slice(lastUnderscore + 1);
      const deptId = deptMap[`${unionMap[unionCode]}_${deptCode}`];
      if (!deptId) { console.warn(`Dept not found: ${key}`); continue; }
      for (const desig of desigs) {
        desigDocs.push({ ...desig, departmentId: deptId });
      }
    }
    const createdDesigs = await Designation.insertMany(desigDocs);
    const desigMap = {};
    createdDesigs.forEach((d) => {
      desigMap[`${d.departmentId}_${d.code}`] = d._id;
    });
    console.log(`Seeded ${createdDesigs.length} designations (UK + US)`);

    // 4. Seed budget tiers (UK + US)
    const allTiers = [...budgetTiers, ...usBudgetTiers];
    const tierDocs = allTiers.map((t) => ({
      ...t,
      country: t.country || 'UK',
      unionId: t.unionCode ? unionMap[t.unionCode] : null,
    }));
    tierDocs.forEach((t) => delete t.unionCode);
    const createdTiers = await BudgetTier.insertMany(tierDocs);
    const tierMap = {};
    createdTiers.forEach((t) => { tierMap[t.code] = t._id; });
    console.log(`Seeded ${createdTiers.length} budget tiers (UK + US)`);

    // 5. Seed rate cards (UK + US)
    const allRateCards = [...rateCards, ...usRateCards];
    const rcDocs = [];
    for (const rc of allRateCards) {
      const unionId = unionMap[rc.unionCode];
      const deptId = deptMap[`${unionId}_${rc.deptCode}`];
      const desigId = deptId ? desigMap[`${deptId}_${rc.desigCode}`] : null;
      const tierId = tierMap[rc.tierCode];
      if (!unionId || !deptId || !desigId || !tierId) {
        console.warn(`Skipping rate card: missing ref for ${rc.unionCode}/${rc.deptCode}/${rc.desigCode}/${rc.tierCode}`);
        continue;
      }
      rcDocs.push({
        unionId, departmentId: deptId, designationId: desigId, budgetTierId: tierId,
        dealType: rc.dealType || '55hr_week',
        guaranteedHoursPerWeek: rc.guaranteedHoursPerWeek,
        guaranteedHoursPerDay: rc.guaranteedHoursPerDay,
        effectiveFrom: rc.effectiveFrom,
        effectiveTo: rc.effectiveTo || null,
        weeklyRate: rc.weeklyRate,
        dailyRate: rc.dailyRate,
        hourlyRate: rc.hourlyRate,
        overtimeRate1x5: rc.overtimeRate1x5,
        overtimeRate2x: rc.overtimeRate2x,
        sixthDayRate: rc.sixthDayRate,
        seventhDayRate: rc.seventhDayRate,
        nightPremiumPct: rc.nightPremiumPct,
        holidayPayInclusive: rc.holidayPayInclusive || false,
        sourceUrl: rc.sourceUrl,
        sourceDocument: rc.sourceDocument,
        notes: rc.notes || null,
        isActive: true,
        isVerified: rc.isVerified || false,
        // US per-episode / studio-location fields
        episodeLength: rc.episodeLength || null,
        prepDays: rc.prepDays,
        shootDays: rc.shootDays,
        overageRate: rc.overageRate,
        studioRate: rc.studioRate,
        locationRate: rc.locationRate,
      });
    }
    const createdRcs = await RateCard.insertMany(rcDocs);
    console.log(`Seeded ${createdRcs.length} rate cards (UK + US)`);

    // 6. Seed overtime rules
    const otDocs = [];
    for (const rule of overtimeRules) {
      const unionId = unionMap[rule.unionCode];
      let departmentId = null;
      if (rule.deptCode) {
        departmentId = deptMap[`${unionId}_${rule.deptCode}`];
      }
      otDocs.push({
        ...rule,
        unionId,
        departmentId,
      });
      delete otDocs[otDocs.length - 1].unionCode;
      delete otDocs[otDocs.length - 1].deptCode;
    }
    const createdOts = await OvertimeRule.insertMany(otDocs);
    console.log(`Seeded ${createdOts.length} overtime rules`);

    // 7. Seed dummy data (users, productions, deal memos, timecards, payroll runs)
    await seedDummyData();
    console.log('Dummy data seeded');

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
