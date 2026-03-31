import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    unionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Union', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true, uppercase: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

departmentSchema.index({ unionId: 1, code: 1 }, { unique: true });

export default mongoose.model('Department', departmentSchema);
