import mongoose from 'mongoose';

/**
 * Maps designations to their correct budget account codes.
 * When a deal memo is created for "Director of Photography" in "Camera",
 * this tells us: labour→3301, OT→4401, kit→3380, NIC→3399, etc.
 */
const designationCodeMapSchema = new mongoose.Schema(
  {
    designationName: { type: String, required: true },
    departmentName: { type: String, required: true },
    labourCode: { type: String, required: true },        // Basic pay: "3301"
    overtimeCode: { type: String, default: '4401' },     // OT: usually central "4401"
    allowanceCode: { type: String },                     // Kit/box: "3380" (dept box rentals)
    fringeCode: { type: String },                        // Employer NIC: "3399"
    pensionCode: { type: String },                       // Pension: "3397"
    holidayPayCode: { type: String },                    // HP: "3396"
    territory: { type: String, default: 'universal' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

designationCodeMapSchema.index({ designationName: 1, departmentName: 1 }, { unique: true });
designationCodeMapSchema.index({ departmentName: 1 });

export default mongoose.model('DesignationCodeMap', designationCodeMapSchema);
