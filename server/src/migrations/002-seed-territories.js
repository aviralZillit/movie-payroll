import { Territory, TerritoryRule } from '../models/index.js';
import { territories } from '../seed/territories.js';
import { territoryRules } from '../seed/territoryRules.js';

/**
 * Migration 002: Seed territories and territory rules.
 * Creates 20 territory documents and 10+ territory rule documents.
 * Idempotent — skips existing documents by code/unionKey.
 */
export async function seedTerritories() {
  let tCreated = 0;
  let rCreated = 0;

  for (const t of territories) {
    const exists = await Territory.findOne({ code: t.code });
    if (!exists) {
      await Territory.create(t);
      tCreated++;
    }
  }
  console.log(`  [002] Territories: created ${tCreated}, skipped ${territories.length - tCreated}`);

  for (const r of territoryRules) {
    const exists = await TerritoryRule.findOne({ unionKey: r.unionKey });
    if (!exists) {
      await TerritoryRule.create(r);
      rCreated++;
    }
  }
  console.log(`  [002] Territory Rules: created ${rCreated}, skipped ${territoryRules.length - rCreated}`);
}
