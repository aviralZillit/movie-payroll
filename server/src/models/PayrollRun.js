import mongoose from 'mongoose';

const payrollItemSchema = new mongoose.Schema({
  timecardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Timecard', required: true },
  dealMemoId: { type: mongoose.Schema.Types.ObjectId, ref: 'DealMemo' },
  personName: { type: String, required: true },
  unionCode: String,
  departmentName: String,
  designationName: String,

  // Timecard summary
  daysWorked: { type: Number, default: 0 },
  totalHours: { type: Number, default: 0 },
  otHours: { type: Number, default: 0 },
  penalties: { type: Number, default: 0 },

  // Earnings
  basePay: { type: Number, default: 0 },
  overtime1x5Pay: { type: Number, default: 0 },
  overtime2xPay: { type: Number, default: 0 },
  mealPenaltyPay: { type: Number, default: 0 },
  turnaroundPenaltyPay: { type: Number, default: 0 },
  sixthDayPremium: { type: Number, default: 0 },
  seventhDayPremium: { type: Number, default: 0 },
  nightPremium: { type: Number, default: 0 },
  kitAllowance: { type: Number, default: 0 },
  travelAllowance: { type: Number, default: 0 },
  perDiem: { type: Number, default: 0 },
  phoneAllowance: { type: Number, default: 0 },
  computerAllowance: { type: Number, default: 0 },
  carAllowance: { type: Number, default: 0 },
  otherEarnings: { type: Number, default: 0 },
  grossPay: { type: Number, default: 0 },

  // Employer fringes
  holidayPay: { type: Number, default: 0 },
  employerNi: { type: Number, default: 0 },
  employerPension: { type: Number, default: 0 },
  apprenticeshipLevy: { type: Number, default: 0 },
  totalFringes: { type: Number, default: 0 },

  // Employee deductions
  employeeNi: { type: Number, default: 0 },
  incomeTax: { type: Number, default: 0 },
  employeePension: { type: Number, default: 0 },
  studentLoan: { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },

  netPay: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
});

const payrollRunSchema = new mongoose.Schema(
  {
    runNumber: { type: String, unique: true, required: true },
    productionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Production', required: true },
    weekStarting: { type: Date, required: true },
    weekEnding: { type: Date, required: true },

    status: {
      type: String,
      enum: ['draft', 'calculating', 'calculated', 'reviewed', 'approved', 'exported', 'paid'],
      default: 'draft',
    },

    processedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedAt: Date,

    totalGross: { type: Number, default: 0 },
    totalFringes: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    totalNet: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    headcount: { type: Number, default: 0 },

    items: [payrollItemSchema],
    notes: String,
    exportedAt: Date,
    paidAt: Date,

    schemaVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

payrollRunSchema.index({ productionId: 1, weekStarting: 1 });

export default mongoose.model('PayrollRun', payrollRunSchema);
