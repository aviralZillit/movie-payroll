import mongoose from 'mongoose';

const contractingEntitySchema = new mongoose.Schema(
  {
    productionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Production', required: true },
    name: { type: String, required: true },
    registrationNumber: String,       // Co. No. / EIN / CRO
    vatTaxId: String,
    defaultCurrency: { type: String, default: 'GBP' },
    defaultTerritory: { type: String, default: 'UK' },
    payrollBureau: String,
    employerReference: String,        // PAYE ref / FEIN / ERN
    applicableAgreements: [String],   // ['PACT-BECTU', 'EQUITY']
    signatoriesOf: [String],          // ['PACT Member', 'SAG Signatory']
    bankReference: String,
    isPrimary: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

contractingEntitySchema.index({ productionId: 1 });

export default mongoose.model('ContractingEntity', contractingEntitySchema);
