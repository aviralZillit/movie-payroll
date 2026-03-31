import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { User } from '../models/index.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const auth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Not authenticated. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];

  const decoded = jwt.verify(token, config.jwtSecret);

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User belonging to this token no longer exists.', 401);
  }

  if (!user.isActive) {
    throw new AppError('User account is deactivated.', 403);
  }

  req.user = user;
  next();
});

export default auth;
