import mongoose from 'mongoose';

/**
 * Migration 001: Add schemaVersion=1 to all existing core documents.
 * This allows the payroll engine to version-route calculations
 * (v1 = existing logic, v2 = territory-aware logic).
 */
export async function addSchemaVersion() {
  const db = mongoose.connection.db;

  const collections = ['dealmemos', 'timecards', 'payrollruns', 'productions'];

  for (const collName of collections) {
    const coll = db.collection(collName);
    const result = await coll.updateMany(
      { schemaVersion: { $exists: false } },
      { $set: { schemaVersion: 1 } }
    );
    console.log(`  [001] ${collName}: updated ${result.modifiedCount} documents`);
  }
}
