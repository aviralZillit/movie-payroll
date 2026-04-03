import { RateBibleEntry } from '../models/index.js';
import { rateBibleEntries } from '../seed/rateBible.js';

/**
 * Migration 003: Seed Global Rates Bible entries.
 * Creates verified rate data from official union sources.
 */
export async function seedRateBible() {
  let created = 0;

  for (const entry of rateBibleEntries) {
    const exists = await RateBibleEntry.findOne({ agreementId: entry.agreementId });
    if (!exists) {
      await RateBibleEntry.create(entry);
      created++;
    }
  }
  console.log(`  [003] Rate Bible: created ${created}, skipped ${rateBibleEntries.length - created}`);
}
