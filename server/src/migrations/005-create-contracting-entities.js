import { Production, ContractingEntity } from '../models/index.js';

/**
 * Migration 005: Auto-create a ContractingEntity for each existing production
 * that doesn't have one yet.
 */
export async function createContractingEntities() {
  const productions = await Production.find({});
  let created = 0;

  for (const p of productions) {
    const exists = await ContractingEntity.findOne({ productionId: p._id });
    if (exists) continue;

    await ContractingEntity.create({
      productionId: p._id,
      name: p.companyName || `${p.name} Productions`,
      defaultCurrency: p.currency || 'GBP',
      defaultTerritory: p.country || 'UK',
      isPrimary: true,
    });
    created++;
  }

  console.log(`  [005] Contracting Entities: created ${created}, skipped ${productions.length - created}`);
}
