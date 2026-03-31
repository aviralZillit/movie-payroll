import mongoose from 'mongoose';

const productionMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
});

const productionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, unique: true },
    productionType: {
      type: String,
      enum: ['feature_film', 'tv_drama', 'tv_comedy', 'tv_entertainment', 'short_film', 'documentary', 'commercial', 'animation'],
      required: true,
    },
    country: { type: String, default: 'UK' },
    budget: { type: Number, required: true },
    currency: { type: String, default: 'GBP' },
    startDate: { type: Date, required: true },
    endDate: Date,
    status: {
      type: String,
      enum: ['pre_production', 'production', 'post_production', 'wrapped', 'cancelled'],
      default: 'pre_production',
    },
    companyName: String,
    companyAddress: String,
    members: [productionMemberSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Production', productionSchema);
