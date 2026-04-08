import { NominalCode, DesignationCodeMap } from '../models/index.js';
import { nominalCodesData } from '../seed/nominalCodes.js';
import { designationCodeMapData } from '../seed/designationCodeMap.js';

/**
 * Migration 009: Seed NominalCode and DesignationCodeMap collections.
 * Skips entries that already exist (matched by code+territory or designationName+departmentName).
 */
export async function seedNominalCodes() {
  let ncCreated = 0;
  let ncSkipped = 0;

  for (const entry of nominalCodesData) {
    const result = await NominalCode.updateOne(
      { code: entry.code, territory: entry.territory },
      { $setOnInsert: entry },
      { upsert: true }
    );
    if (result.upsertedCount > 0) ncCreated++;
    else ncSkipped++;
  }

  let dmCreated = 0;
  let dmSkipped = 0;

  for (const entry of designationCodeMapData) {
    const result = await DesignationCodeMap.updateOne(
      { designationName: entry.designationName, departmentName: entry.departmentName },
      { $setOnInsert: entry },
      { upsert: true }
    );
    if (result.upsertedCount > 0) dmCreated++;
    else dmSkipped++;
  }

  console.log(`  [009] Nominal Codes: created ${ncCreated}, skipped ${ncSkipped} (of ${nominalCodesData.length})`);
  console.log(`  [009] Designation Code Map: created ${dmCreated}, skipped ${dmSkipped} (of ${designationCodeMapData.length})`);
}
