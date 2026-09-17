const AppError = require('../utils/AppError');

/**
 * Restricts a route to specific roles. Must run after `protect` so
 * `req.user` is already populated. Responds 403 Forbidden when the
 * authenticated user's role isn't in the allowed list.
 *
 * Usage: router.get('/admin/overview', protect, authorize('admin'), handler)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized: authentication required.', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: this endpoint requires role(s): ${allowedRoles.join(', ')}.`,
          403
        )
      );
    }
    next();
  };
}

module.exports = { authorize };
