/**
 * Cleanup script: removes all Timecards, DealMemos, and PayrollRuns
 * EXCEPT those belonging to "The Gilded Hour S2" (GH2) + Tom Harris.
 *
 * Does NOT touch Productions, Users, Departments, Designations, Unions, or Territories.
 *
 * Run: node --loader ts-node/esm src/seeds/cleanupOldData.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-payroll';

async function cleanup() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to', MONGO_URI.includes('@') ? 'remote DB' : 'local DB');

  const { Timecard } = await import('../models/index.js');
  const DealMemo = (await import('../models/DealMemo.js')).default;
  const { PayrollRun } = await import('../models/index.js');
  const Production = (await import('../models/Production.js')).default;
  const { User } = await import('../models/index.js');

  // Find the production and user to keep
  const prod = await Production.findOne({ code: 'GH2', name: 'The Gilded Hour S2' });
  if (!prod) {
    console.error('Production "The Gilded Hour S2" (GH2) not found. Aborting.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log('Found production:', prod.name, '- ID:', prod._id);

  const tom = await User.findOne({ firstName: 'Tom', lastName: 'Harris' });
  if (!tom) {
    console.error('User "Tom Harris" not found. Aborting.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log('Found user:', tom.firstName, tom.lastName, '- ID:', tom._id);

  // --- Timecards ---
  const totalTimecards = await Timecard.countDocuments();
  const keptTimecards = await Timecard.countDocuments({
    productionId: prod._id,
    ownerId: tom._id,
  });
  const deletedTimecards = await Timecard.deleteMany({
    $or: [
      { productionId: { $ne: prod._id } },
      { ownerId: { $ne: tom._id } },
    ],
  });
  console.log(`Timecards: deleted ${deletedTimecards.deletedCount}, kept ${keptTimecards} (total was ${totalTimecards})`);

  // --- DealMemos ---
  const totalDealMemos = await DealMemo.countDocuments();
  const keptDealMemos = await DealMemo.countDocuments({
    productionId: prod._id,
    personId: tom._id,
  });
  const deletedDealMemos = await DealMemo.deleteMany({
    $or: [
      { productionId: { $ne: prod._id } },
      { personId: { $ne: tom._id } },
    ],
  });
  console.log(`DealMemos: deleted ${deletedDealMemos.deletedCount}, kept ${keptDealMemos} (total was ${totalDealMemos})`);

  // --- PayrollRuns ---
  const totalPayrollRuns = await PayrollRun.countDocuments();
  const keptPayrollRuns = await PayrollRun.countDocuments({
    productionId: prod._id,
  });
  const deletedPayrollRuns = await PayrollRun.deleteMany({
    productionId: { $ne: prod._id },
  });
  console.log(`PayrollRuns: deleted ${deletedPayrollRuns.deletedCount}, kept ${keptPayrollRuns} (total was ${totalPayrollRuns})`);

  await mongoose.disconnect();
  console.log('Done! Cleanup complete.');
}

cleanup().catch(e => { console.error(e); process.exit(1); });
