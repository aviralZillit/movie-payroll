import mongoose from 'mongoose';

const overtimeRuleSchema = new mongoose.Schema(
  {
    unionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Union', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    name: { type: String, required: true },
    afterHours: { type: Number, required: true },
    multiplier: { type: Number, required: true },
    afterTime: { type: String, default: null },
    isNightRate: { type: Boolean, default: false },
    appliesTo: {
      type: String,
      enum: ['weekday', '6th_day', '7th_day', 'all'],
      default: 'weekday',
    },
    minHoursGuaranteed: { type: Number, default: 0 },
    maxRatePerHour: Number,
    minRatePerHour: Number,
    incrementMinutes: { type: Number, default: 15 },
    priority: { type: Number, default: 0 },
    sourceUrl: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

overtimeRuleSchema.index({ unionId: 1, departmentId: 1, appliesTo: 1, isActive: 1 });

export default mongoose.model('OvertimeRule', overtimeRuleSchema);
