import { PunchLog, Timecard } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

export const punchIn = asyncHandler(async (req, res) => {
  const { productionId, location } = req.body;
  const punch = await PunchLog.create({
    crewId: req.user._id,
    productionId,
    type: 'punch_in',
    timestamp: new Date(),
    location: location || {},
    source: location?.lat ? 'gps' : 'manual',
  });
  res.status(201).json({ success: true, data: punch });
});

export const punchOut = asyncHandler(async (req, res) => {
  const { productionId, location } = req.body;
  const punch = await PunchLog.create({
    crewId: req.user._id,
    productionId,
    type: 'punch_out',
    timestamp: new Date(),
    location: location || {},
    source: location?.lat ? 'gps' : 'manual',
  });
  res.status(201).json({ success: true, data: punch });
});

export const getTodayPunches = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const punches = await PunchLog.find({
    crewId: req.user._id,
    timestamp: { $gte: today, $lt: tomorrow },
  }).sort({ timestamp: 1 });

  res.json({ success: true, data: punches });
});

export const getPunchLogs = asyncHandler(async (req, res) => {
  const { crewId } = req.params;
  const filter = { crewId };
  if (req.query.productionId) filter.productionId = req.query.productionId;
  if (req.query.from) filter.timestamp = { ...filter.timestamp, $gte: new Date(req.query.from) };
  if (req.query.to) filter.timestamp = { ...filter.timestamp, $lte: new Date(req.query.to) };

  const punches = await PunchLog.find(filter).sort({ timestamp: -1 }).limit(100);
  res.json({ success: true, data: punches });
});

/**
 * Auto-fill timecard entries from punch logs.
 * Matches punches to days and sets callTime/release + source='gps'.
 */
export const autoFillTimecard = asyncHandler(async (req, res) => {
  const tc = await Timecard.findById(req.params.timecardId);
  if (!tc) throw new AppError('Timecard not found.', 404);

  const weekStart = new Date(tc.weekStarting);
  const weekEnd = new Date(tc.weekEnding || tc.weekStarting);
  weekEnd.setDate(weekEnd.getDate() + 1);

  const punches = await PunchLog.find({
    crewId: tc.ownerId,
    productionId: tc.productionId,
    timestamp: { $gte: weekStart, $lt: weekEnd },
  }).sort({ timestamp: 1 });

  // Group by date
  const byDate = {};
  punches.forEach(p => {
    const dateKey = p.timestamp.toISOString().split('T')[0];
    if (!byDate[dateKey]) byDate[dateKey] = { ins: [], outs: [] };
    if (p.type === 'punch_in') byDate[dateKey].ins.push(p);
    else byDate[dateKey].outs.push(p);
  });

  let filled = 0;
  for (const entry of tc.entries) {
    const dateKey = new Date(entry.date).toISOString().split('T')[0];
    const dayPunches = byDate[dateKey];
    if (!dayPunches) continue;

    // First punch-in → callTime
    if (dayPunches.ins.length > 0 && !entry.callTime) {
      const firstIn = dayPunches.ins[0];
      entry.callTime = `${String(firstIn.timestamp.getHours()).padStart(2, '0')}:${String(firstIn.timestamp.getMinutes()).padStart(2, '0')}`;
      entry.source = 'gps';
      filled++;
    }

    // Last punch-out → release
    if (dayPunches.outs.length > 0 && !entry.release && !entry.wrapTime) {
      const lastOut = dayPunches.outs[dayPunches.outs.length - 1];
      const timeStr = `${String(lastOut.timestamp.getHours()).padStart(2, '0')}:${String(lastOut.timestamp.getMinutes()).padStart(2, '0')}`;
      entry.release = timeStr;
      entry.wrapTime = timeStr;
      filled++;
    }
  }

  await tc.save();
  res.json({ success: true, data: tc, filled });
});
