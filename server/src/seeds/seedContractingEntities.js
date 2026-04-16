/**
 * Seed contracting entities for both productions
 * Run: node src/seeds/seedContractingEntities.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movie-payroll';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const Production = (await import('../models/Production.js')).default;
  const ContractingEntity = (await import('../models/ContractingEntity.js')).default;

  // ── UK Production: The Gilded Hour S2 ──
  const ukProd = await Production.findOne({ code: 'GH2' });
  if (ukProd) {
    const existing = await ContractingEntity.findOne({ productionId: ukProd._id });
    if (!existing) {
      await ContractingEntity.create({
        productionId: ukProd._id,
        name: 'Gilded Hour Productions Ltd',
        registrationNumber: '12345678',
        vatTaxId: 'GB123456789',
        defaultCurrency: 'GBP',
        defaultTerritory: 'UK',
        payrollBureau: 'Entertainment Partners UK',
        employerReference: '123/A45678',
        applicableAgreements: ['PACT-BECTU'],
        signatoriesOf: ['PACT Member'],
        isPrimary: true,
        isActive: true,
      });
      console.log('Created UK contracting entity: Gilded Hour Productions Ltd');
    } else {
      console.log('UK contracting entity already exists');
    }
  } else {
    console.log('UK production GH2 not found, skipping');
  }

  // ── US Production: Midnight in Manhattan ──
  const usProd = await Production.findOne({ code: 'MIM' });
  if (usProd) {
    const existing = await ContractingEntity.findOne({ productionId: usProd._id });
    if (!existing) {
      await ContractingEntity.insertMany([
        {
          productionId: usProd._id,
          name: 'Midnight Pictures Inc.',
          registrationNumber: '87-1234567',
          vatTaxId: null,
          defaultCurrency: 'USD',
          defaultTerritory: 'US',
          payrollBureau: 'Entertainment Partners',
          employerReference: '87-1234567',
          applicableAgreements: ['IATSE Basic Agreement'],
          signatoriesOf: ['IATSE Signatory', 'SAG-AFTRA Signatory'],
          isPrimary: true,
          isActive: true,
        },
        {
          productionId: usProd._id,
          name: 'Manhattan Post LLC',
          registrationNumber: '87-7654321',
          vatTaxId: null,
          defaultCurrency: 'USD',
          defaultTerritory: 'US',
          payrollBureau: 'Cast & Crew',
          employerReference: '87-7654321',
          applicableAgreements: ['IATSE Basic Agreement'],
          signatoriesOf: [],
          isPrimary: false,
          isActive: true,
        },
      ]);
      console.log('Created US contracting entities: Midnight Pictures Inc. + Manhattan Post LLC');
    } else {
      console.log('US contracting entities already exist');
    }
  } else {
    console.log('US production MIM not found, skipping');
  }

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => { console.error(err); process.exit(1); });
