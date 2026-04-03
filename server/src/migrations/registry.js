import { addSchemaVersion } from './001-add-schema-version.js';

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
];
