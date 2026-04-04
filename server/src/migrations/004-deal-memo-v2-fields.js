import mongoose from 'mongoose';
import { buildNominalLines } from '../services/nominalCodingService.js';
import { buildComplianceChecklist } from '../services/complianceService.js';

/**
 * Migration 004: Upgrade existing deal memos to v2 schema.
 * Sets territory from country, hpMode from holidayPayInclusive,
 * employmentStatus defaults, generates nominalLines and complianceChecklist.
 */
export async function dealMemoV2Fields() {
  const db = mongoose.connection.db;
  const coll = db.collection('dealmemos');

  // Only migrate v1 deal memos that haven't been upgraded
  const v1Docs = await coll.find({ $or: [{ schemaVersion: 1 }, { schemaVersion: { $exists: false } }] }).toArray();
  console.log(`  [004] Found ${v1Docs.length} v1 deal memos to upgrade`);

  let updated = 0;
  for (const doc of v1Docs) {
    const territory = doc.country || 'UK';
    const hpMode = doc.holidayPayInclusive ? 'incl' : (territory === 'US' ? 'na' : 'excl');
    const employmentStatus = territory === 'US' ? 'w2' : territory === 'AU' ? 'payg' : territory === 'CA' ? 't4' : 'paye';

    // Generate nominal lines from existing data
    const nominalLines = buildNominalLines(doc, null, null);

    // Generate compliance checklist
    const complianceChecklist = buildComplianceChecklist(territory);

    await coll.updateOne(
      { _id: doc._id },
      {
        $set: {
          schemaVersion: 2,
          territory,
          hpMode,
          employmentStatus,
          nominalLines,
          complianceChecklist,
          otMode: 'agreement',
          goldenTimeEnabled: territory === 'US',
          goldenTimeAfterHours: territory === 'US' ? 14 : null,
          goldenTimeMultiplier: territory === 'US' ? 2.0 : null,
          allowances: [],
          signingDocuments: [],
          outstandingFields: [],
          mealPaidStatus: territory === 'US' ? 'non-deductible' : 'unpaid',
        },
      }
    );
    updated++;
  }

  console.log(`  [004] Upgraded ${updated} deal memos to v2`);

  // Also add new fields to timecards
  const tcColl = db.collection('timecards');
  const tcResult = await tcColl.updateMany(
    { territory: { $exists: false } },
    { $set: { territory: null } }
  );
  console.log(`  [004] Updated ${tcResult.modifiedCount} timecards with territory field`);
}
