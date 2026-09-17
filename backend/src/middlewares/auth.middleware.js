const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const userModel = require('../models/user.model');

/**
 * Protects a route: requires a valid JWT (from the httpOnly cookie or an
 * Authorization: Bearer header) and attaches the authenticated user to
 * `req.user`. Responds 401 Unauthorized when missing/invalid/expired.
 */
async function protect(req, res, next) {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Unauthorized: no authentication token provided.', 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new AppError('Unauthorized: invalid or expired token.', 401);
    }

    const user = await userModel.findById(decoded.id);
    if (!user || !user.is_active) {
      throw new AppError('Unauthorized: account no longer exists or is inactive.', 401);
    }

    req.user = userModel.toPublicUser(user);
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { protect };
