import { User } from '../models/index.js';
import { generateTokenPair } from '../utils/generateToken.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * POST /api/auth/login
 * Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password.', 400);
  }

  const user = await User.findOne({ email }).select('+passwordHash +refreshToken');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact an admin.', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const tokens = generateTokenPair(user._id);

  user.refreshToken = tokens.refreshToken;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const userObj = user.toJSON();
  delete userObj.passwordHash;
  delete userObj.refreshToken;

  res.json({
    success: true,
    data: {
      user: userObj,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

/**
 * POST /api/auth/register
 * Protected - admin only
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  if (!email || !password || !firstName || !lastName) {
    throw new AppError('Please provide email, password, first name, and last name.', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('A user with that email already exists.', 400);
  }

  const user = await User.create({
    email,
    passwordHash: password,
    firstName,
    lastName,
    phone,
    role: role || 'crew_member',
  });

  const userObj = user.toJSON();
  delete userObj.passwordHash;

  res.status(201).json({
    success: true,
    data: { user: userObj },
  });
});

/**
 * POST /api/auth/refresh-token
 * Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError('Refresh token is required.', 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtRefreshSecret);
  } catch {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user) {
    throw new AppError('User not found.', 401);
  }

  if (user.refreshToken !== token) {
    throw new AppError('Refresh token has been revoked.', 401);
  }

  const tokens = generateTokenPair(user._id);

  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

/**
 * GET /api/auth/me
 * Protected
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: { user },
  });
});

/**
 * POST /api/auth/logout
 * Protected
 */
export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

/**
 * GET /api/users
 * Protected - super_admin, payroll_admin only
 * Query params: role, search, isActive
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { role, search, isActive } = req.query;
  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { users },
  });
});

/**
 * PUT /api/users/:id
 * Protected - super_admin, payroll_admin only
 * Editable: firstName, lastName, phone, role, isActive
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, role, isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save({ validateBeforeSave: false });

  const userObj = user.toJSON();
  delete userObj.passwordHash;

  res.json({
    success: true,
    data: { user: userObj },
  });
});
