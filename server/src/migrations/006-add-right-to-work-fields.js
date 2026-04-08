import DealMemo from '../models/DealMemo.js';
import Territory from '../models/Territory.js';

/**
 * Migration 006: Add Right to Work fields and seed FR/DE/ES territories
 */
export async function addRightToWorkFields() {
  // 1. Add rightToWork subdocument + separateRates fields to existing deal memos
  const result = await DealMemo.updateMany(
    { rightToWork: { $exists: false } },
    {
      $set: {
        rightToWork: { status: 'pending' },
        separateRates: false,
      },
    }
  );
  console.log(`  [006] Updated ${result.modifiedCount} deal memos with rightToWork + separateRates`);

  // 2. Seed FR/DE/ES territories if they don't exist
  const newTerritories = [
    {
      code: 'FR',
      name: 'France',
      region: 'europe',
      currency: 'EUR',
      currencySymbol: '€',
      employmentStatuses: ['cdi', 'cdd', 'intermittent'],
      taxSystem: 'progressive',
      defaultFringes: {
        employerSocial: 45.0,
        pension: 0,
        apprenticeship: 0,
      },
      payrollBureaus: ['AUDIENS', 'CENTRE_NATIONAL', 'IN_HOUSE'],
      complianceNotes: 'Intermittent du Spectacle regime applies to most film crew. Congés Spectacles manages paid leave.',
    },
    {
      code: 'DE',
      name: 'Germany',
      region: 'europe',
      currency: 'EUR',
      currencySymbol: '€',
      employmentStatuses: ['festanstellung', 'freiberufler', 'gmbh'],
      taxSystem: 'progressive',
      defaultFringes: {
        employerSocial: 20.0,
        pension: 9.3,
        healthInsurance: 7.3,
        apprenticeship: 0,
      },
      payrollBureaus: ['PENSIONSKASSE', 'BVK', 'IN_HOUSE'],
      complianceNotes: 'Künstlersozialkasse (KSK) may apply to freelance creatives. Kurzfristige Beschäftigung for short-term engagements.',
    },
    {
      code: 'ES',
      name: 'Spain',
      region: 'europe',
      currency: 'EUR',
      currencySymbol: '€',
      employmentStatuses: ['fijo', 'temporal', 'autonomo'],
      taxSystem: 'progressive',
      defaultFringes: {
        employerSocial: 30.0,
        pension: 0,
        apprenticeship: 0,
      },
      payrollBureaus: ['SEG_SOCIAL', 'IN_HOUSE'],
      complianceNotes: 'Artistas en espectáculos públicos special regime. Autónomos require alta in Seguridad Social.',
    },
  ];

  let seeded = 0;
  for (const t of newTerritories) {
    const exists = await Territory.findOne({ code: t.code });
    if (!exists) {
      await Territory.create(t);
      seeded++;
    }
  }
  console.log(`  [006] Territories: seeded ${seeded} new (FR/DE/ES), skipped ${newTerritories.length - seeded}`);
}
