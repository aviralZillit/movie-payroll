import { RateBibleEntry } from '../models/index.js';
import { rateBibleEntries } from '../seed/rateBible.js';

/**
 * Migration 007: Re-seed rate bible entries that have empty rates arrays.
 * Fixes entries created before full rate data was added to the seed file.
 */
export async function reseedRateBibleRates() {
  let updated = 0;

  for (const entry of rateBibleEntries) {
    if (!entry.rates || entry.rates.length === 0) continue;

    const result = await RateBibleEntry.updateOne(
      { agreementId: entry.agreementId, $or: [{ rates: { $size: 0 } }, { rates: { $exists: false } }] },
      { $set: { rates: entry.rates, rules: entry.rules || [], incentives: entry.incentives || [] } }
    );

    if (result.modifiedCount > 0) updated++;
  }

  console.log(`  [007] Rate Bible rates: updated ${updated} entries with rate data`);
}
