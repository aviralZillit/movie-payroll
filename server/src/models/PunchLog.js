import mongoose from 'mongoose';

const punchLogSchema = new mongoose.Schema(
  {
    crewId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Production', required: true },
    type: { type: String, enum: ['punch_in', 'punch_out'], required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    location: {
      lat: Number,
      lng: Number,
      accuracy: Number,
    },
    source: { type: String, enum: ['gps', 'manual', 'nfc'], default: 'gps' },
    linkedTimecardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Timecard' },
    linkedEntryDate: Date,
  },
  { timestamps: true }
);

punchLogSchema.index({ crewId: 1, productionId: 1, timestamp: -1 });

export default mongoose.model('PunchLog', punchLogSchema);
