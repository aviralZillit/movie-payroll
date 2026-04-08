import { RateBibleEntry } from '../models/index.js';
import { extraRateBibleEntries } from '../seed/rateBibleExtra.js';

/**
 * Migration 008: Seed extra UK BECTU department rates.
 * Adds 17 new departments: Sound, Grip, Lighting, Costume, HMU, Props,
 * Construction, Locations, Post Production, Production Office, SFX,
 * Set Crafts, Graphics, Animation & VFX, Runners, Drivers, Riggers.
 */
export async function seedExtraRateBible() {
  let created = 0;
  let skipped = 0;

  for (const entry of extraRateBibleEntries) {
    const exists = await RateBibleEntry.findOne({ agreementId: entry.agreementId });
    if (exists) {
      skipped++;
      continue;
    }
    await RateBibleEntry.create(entry);
    created++;
  }

  console.log(`  [008] Extra Rate Bible: created ${created}, skipped ${skipped} (of ${extraRateBibleEntries.length} entries)`);
}
