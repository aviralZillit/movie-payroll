import { addSchemaVersion } from './001-add-schema-version.js';
import { seedTerritories } from './002-seed-territories.js';
import { seedRateBible } from './003-seed-rate-bible.js';
import { dealMemoV2Fields } from './004-deal-memo-v2-fields.js';

/**
 * Ordered list of all migrations.
 * Each must have: id (string, unique), description, up() function.
 * Migrations run in array order. Never reorder or remove entries.
 */
export const migrations = [
  {
    id: '001-add-schema-version',
    description: 'Add schemaVersion field to core documents',
    up: addSchemaVersion,
  },
  {
    id: '002-seed-territories',
    description: 'Seed 20 territories and territory rules (10 agreements)',
    up: seedTerritories,
  },
  {
    id: '003-seed-rate-bible',
    description: 'Seed Global Rates Bible with verified union rate data',
    up: seedRateBible,
  },
  {
    id: '004-deal-memo-v2-fields',
    description: 'Upgrade existing deal memos to v2 schema with territory, hpMode, nominalLines, compliance',
    up: dealMemoV2Fields,
  },
];
