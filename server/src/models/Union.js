import mongoose from 'mongoose';

const unionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    country: { type: String, default: 'UK' },
    website: String,
    currentAgreementUrl: String,
    standardWorkDayHrs: { type: Number, required: true },
    standardLunchHrs: { type: Number, default: 1 },
    minTurnaroundHrs: { type: Number, required: true },
    holidayPayPct: { type: Number, required: true },
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Union', unionSchema);
