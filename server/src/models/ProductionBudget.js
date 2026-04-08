import mongoose from 'mongoose';

const budgetLineSchema = new mongoose.Schema({
  code: { type: String, required: true },
  description: String,
  budgetAmount: { type: Number, default: 0 },
  actualToDate: { type: Number, default: 0 },
  costCentre: String,
  notes: String,
}, { _id: false });

/**
 * Per-production budget. Imported from Movie Magic Budgeting CSV or entered manually.
 * Used to compare budget vs actuals in the cost report.
 */
const productionBudgetSchema = new mongoose.Schema(
  {
    productionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Production', required: true, unique: true },
    budgetLines: [budgetLineSchema],
    importedFrom: { type: String, enum: ['movie_magic', 'manual', 'csv'], default: 'manual' },
    importedAt: Date,
    currency: { type: String, default: 'GBP' },
    totalBudget: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('ProductionBudget', productionBudgetSchema);
