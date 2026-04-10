import { DisputeTicket } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

export const createDispute = asyncHandler(async (req, res) => {
  const { productionId, timecardId, weekId, weekNumber, type, description } = req.body;
  const dispute = await DisputeTicket.create({
    crewId: req.user._id,
    productionId,
    timecardId,
    weekId,
    weekNumber,
    type,
    description,
  });
  res.status(201).json({ success: true, data: dispute });
});

export const getDisputes = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.crewId) filter.crewId = req.query.crewId;
  if (req.query.productionId) filter.productionId = req.query.productionId;
  if (req.query.status) filter.status = req.query.status;
  // Crew can only see their own
  if (req.user.role === 'crew_member') filter.crewId = req.user._id;

  const disputes = await DisputeTicket.find(filter)
    .populate('crewId', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: disputes });
});

export const getDisputeById = asyncHandler(async (req, res) => {
  const dispute = await DisputeTicket.findById(req.params.id)
    .populate('crewId', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName')
    .populate('resolvedBy', 'firstName lastName')
    .populate('comments.author', 'firstName lastName');
  if (!dispute) throw new AppError('Dispute not found.', 404);
  res.json({ success: true, data: dispute });
});

export const updateDispute = asyncHandler(async (req, res) => {
  const dispute = await DisputeTicket.findById(req.params.id);
  if (!dispute) throw new AppError('Dispute not found.', 404);

  const { status, assignedTo, resolution } = req.body;
  if (status) dispute.status = status;
  if (assignedTo) dispute.assignedTo = assignedTo;
  if (resolution) {
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
  }
  await dispute.save();
  res.json({ success: true, data: dispute });
});

export const addComment = asyncHandler(async (req, res) => {
  const dispute = await DisputeTicket.findById(req.params.id);
  if (!dispute) throw new AppError('Dispute not found.', 404);

  dispute.comments.push({ text: req.body.text, author: req.user._id });
  await dispute.save();

  const populated = await DisputeTicket.findById(dispute._id)
    .populate('comments.author', 'firstName lastName');
  res.json({ success: true, data: populated });
});
