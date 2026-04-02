import { Production, User } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * GET /api/productions
 */
export const getAll = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Non-admin users only see productions they are members of
  if (['department_head', 'crew_member'].includes(req.user.role)) {
    filter['members.userId'] = req.user._id;
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [productions, total] = await Promise.all([
    Production.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('members.userId', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Production.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: productions,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/productions/:id
 */
export const getById = asyncHandler(async (req, res) => {
  const production = await Production.findById(req.params.id)
    .populate('createdBy', 'firstName lastName email')
    .populate('members.userId', 'firstName lastName email role');

  if (!production) {
    throw new AppError('Production not found.', 404);
  }

  res.json({ success: true, data: production });
});

/**
 * POST /api/productions
 */
export const create = asyncHandler(async (req, res) => {
  const production = await Production.create({
    ...req.body,
    createdBy: req.user._id,
  });

  const populated = await Production.findById(production._id)
    .populate('createdBy', 'firstName lastName email')
    .populate('members.userId', 'firstName lastName email role');

  res.status(201).json({ success: true, data: populated });
});

/**
 * PUT /api/productions/:id
 */
export const update = asyncHandler(async (req, res) => {
  const production = await Production.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate('createdBy', 'firstName lastName email')
    .populate('members.userId', 'firstName lastName email role');

  if (!production) {
    throw new AppError('Production not found.', 404);
  }

  res.json({ success: true, data: production });
});

/**
 * DELETE /api/productions/:id
 */
export const remove = asyncHandler(async (req, res) => {
  const production = await Production.findById(req.params.id);

  if (!production) {
    throw new AppError('Production not found.', 404);
  }

  production.status = 'cancelled';
  await production.save();

  res.json({ success: true, message: 'Production cancelled.' });
});

/**
 * POST /api/productions/:id/members
 * Add a member to a production
 */
export const addMember = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    throw new AppError('userId and role are required.', 400);
  }

  const production = await Production.findById(req.params.id);
  if (!production) {
    throw new AppError('Production not found.', 404);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const alreadyMember = production.members.some(
    (m) => m.userId.toString() === userId
  );
  if (alreadyMember) {
    throw new AppError('User is already a member of this production.', 409);
  }

  production.members.push({ userId, role });
  await production.save();

  const populated = await Production.findById(production._id)
    .populate('createdBy', 'firstName lastName email')
    .populate('members.userId', 'firstName lastName email role');

  res.status(201).json({ success: true, data: populated });
});

/**
 * DELETE /api/productions/:id/members/:userId
 * Remove a member from a production
 */
export const removeMember = asyncHandler(async (req, res) => {
  const production = await Production.findById(req.params.id);
  if (!production) {
    throw new AppError('Production not found.', 404);
  }

  const memberIndex = production.members.findIndex(
    (m) => m.userId.toString() === req.params.userId
  );

  if (memberIndex === -1) {
    throw new AppError('User is not a member of this production.', 404);
  }

  production.members.splice(memberIndex, 1);
  await production.save();

  const populated = await Production.findById(production._id)
    .populate('createdBy', 'firstName lastName email')
    .populate('members.userId', 'firstName lastName email role');

  res.json({ success: true, data: populated });
});
