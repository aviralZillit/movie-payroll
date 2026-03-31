import mongoose from 'mongoose';

const designationSchema = new mongoose.Schema(
  {
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true, uppercase: true },
    level: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

designationSchema.index({ departmentId: 1, code: 1 }, { unique: true });

export default mongoose.model('Designation', designationSchema);
