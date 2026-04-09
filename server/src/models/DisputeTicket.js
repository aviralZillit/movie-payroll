import mongoose from 'mongoose';

const disputeTicketSchema = new mongoose.Schema(
  {
    crewId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Production', required: true },
    timecardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Timecard' },
    weekId: String,
    weekNumber: Number,

    type: {
      type: String,
      enum: ['incorrect_time', 'missing_overtime', 'wrong_day_type', 'allowance_missing', 'rate_incorrect', 'payment_missing', 'other'],
      required: true,
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'closed', 'rejected'],
      default: 'open',
    },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolution: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,

    comments: [{
      text: String,
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

disputeTicketSchema.index({ crewId: 1, productionId: 1 });
disputeTicketSchema.index({ status: 1 });

export default mongoose.model('DisputeTicket', disputeTicketSchema);
