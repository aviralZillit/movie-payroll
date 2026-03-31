import AppError from '../utils/AppError.js';

const ROLE_HIERARCHY = {
  super_admin: 5,
  payroll_admin: 4,
  production_accountant: 3,
  department_head: 2,
  crew_member: 1,
};

/**
 * Middleware factory that restricts access to users whose role
 * is included in the provided list.
 * Usage: authorize('super_admin', 'payroll_admin')
 */
export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }

    next();
  };
};

/**
 * Checks if userRole is at least as high as requiredRole in the hierarchy.
 */
export const hasMinRole = (userRole, requiredRole) => {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
};

export { ROLE_HIERARCHY };
