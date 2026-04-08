import mongoose from 'mongoose';

const nominalCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, index: true },
    category: { type: String, required: true },         // "CAMERA", "LIGHTING", etc.
    categoryCode: { type: String, required: true },      // "3300", "3200" (parent)
    description: { type: String, required: true },       // "Dir of Photography"
    type: {
      type: String,
      enum: ['labour', 'equipment', 'materials', 'travel', 'allowance', 'fringes', 'other'],
      default: 'labour',
    },
    isLabour: { type: Boolean, default: false },
    isAllowance: { type: Boolean, default: false },
    isFringe: { type: Boolean, default: false },
    isCategory: { type: Boolean, default: false },       // true for header codes like 3300
    territory: { type: String, default: 'universal' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

nominalCodeSchema.index({ code: 1, territory: 1 }, { unique: true });
nominalCodeSchema.index({ categoryCode: 1 });
nominalCodeSchema.index({ type: 1 });

export default mongoose.model('NominalCode', nominalCodeSchema);
