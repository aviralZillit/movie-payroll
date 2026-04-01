import mongoose from 'mongoose';

const budgetTierSchema = new mongoose.Schema(
  {
    unionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Union' },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    productionType: {
      type: String,
      enum: ['feature_film', 'tv_drama', 'tv_comedy', 'tv_entertainment', 'short_film', 'documentary', 'commercial', 'animation', null],
      default: null,
    },
    minBudget: Number,
    maxBudget: Number,
    description: String,
    country: { type: String, default: 'UK' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('BudgetTier', budgetTierSchema);
