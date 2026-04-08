import { addSchemaVersion } from './001-add-schema-version.js';
import { seedTerritories } from './002-seed-territories.js';
import { seedRateBible } from './003-seed-rate-bible.js';
import { dealMemoV2Fields } from './004-deal-memo-v2-fields.js';
import { createContractingEntities } from './005-create-contracting-entities.js';
import { addRightToWorkFields } from './006-add-right-to-work-fields.js';
import { reseedRateBibleRates } from './007-reseed-rate-bible-rates.js';
import { seedExtraRateBible } from './008-seed-extra-rate-bible.js';
import { seedNominalCodes } from './009-seed-nominal-codes.js';

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
  {
    id: '005-create-contracting-entities',
    description: 'Auto-create contracting entities for existing productions',
    up: createContractingEntities,
  },
  {
    id: '006-add-right-to-work-fields',
    description: 'Add rightToWork fields, separateRates, and seed FR/DE/ES territories',
    up: addRightToWorkFields,
  },
  {
    id: '007-reseed-rate-bible-rates',
    description: 'Re-seed rate bible entries with full rate data (fixes empty rates)',
    up: reseedRateBibleRates,
  },
  {
    id: '008-seed-extra-rate-bible',
    description: 'Seed 17 extra UK BECTU department rates (Sound, Grip, Lighting, Costume, HMU, Props, Construction, Locations, Post, Prod Office, SFX, Set Crafts, Graphics, Anim/VFX, Runners, Drivers, Riggers)',
    up: seedExtraRateBible,
  },
  {
    id: '009-seed-nominal-codes',
    description: 'Seed Movie Magic Budgeting nominal codes and designation-to-code mappings',
    up: seedNominalCodes,
  },
];
