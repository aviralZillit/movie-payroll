import mongoose from 'mongoose';
import { migrations } from './registry.js';

const MigrationSchema = new mongoose.Schema({
  migrationId: { type: String, required: true, unique: true },
  appliedAt: { type: Date, default: Date.now },
  durationMs: Number,
});

const Migration = mongoose.model('Migration', MigrationSchema);

/**
 * Run all pending migrations in order.
 * Called once on app startup after MongoDB connects.
 */
export async function runMigrations() {
  const applied = await Migration.find({}).select('migrationId').lean();
  const appliedIds = new Set(applied.map((m) => m.migrationId));

  let ranCount = 0;

  for (const migration of migrations) {
    if (appliedIds.has(migration.id)) continue;

    console.log(`[Migration] Running: ${migration.id} — ${migration.description}`);
    const start = Date.now();

    try {
      await migration.up();
      const durationMs = Date.now() - start;

      await Migration.create({
        migrationId: migration.id,
        appliedAt: new Date(),
        durationMs,
      });

      console.log(`[Migration] ✅ ${migration.id} completed in ${durationMs}ms`);
      ranCount++;
    } catch (err) {
      console.error(`[Migration] ❌ ${migration.id} FAILED:`, err.message);
      throw err; // Stop startup on migration failure
    }
  }

  if (ranCount === 0) {
    console.log('[Migration] All migrations up to date.');
  } else {
    console.log(`[Migration] Ran ${ranCount} migration(s).`);
  }
}
