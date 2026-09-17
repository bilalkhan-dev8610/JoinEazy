const userModel = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { authCookieOptions } = require('../utils/cookie');
const AppError = require('../utils/AppError');

/**
 * POST /api/auth/register
 * Public self-registration. Role is always forced to 'student' here,
 * regardless of what the client sends — admin accounts are never created
 * through a public endpoint, which is what keeps "admin login uses the
 * same auth system" safe.
 */
async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await userModel.createUser({
      fullName: fullName.trim(),
      email,
      passwordHash,
      role: 'student',
    });

    const token = signToken({ id: user.id, role: user.role });
    res.cookie('token', token, authCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: userModel.toPublicUser(user),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Shared login for every role (student, teacher, admin) — the role
 * distinction happens downstream via the role middleware, not here.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }
    if (!user.is_active) {
      throw new AppError('This account has been deactivated.', 401);
    }

    const passwordMatches = await comparePassword(password, user.password_hash);
    if (!passwordMatches) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = signToken({ id: user.id, role: user.role });
    res.cookie('token', token, authCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: userModel.toPublicUser(user),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Stateless JWT logout: clears the auth cookie client-side. There is no
 * server-side session to invalidate with the current design.
 */
function logout(req, res) {
  res.clearCookie('token', authCookieOptions());
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
}

/**
 * GET /api/auth/profile
 * Protected. Returns the authenticated user's own profile, re-fetched
 * from the database so it reflects the latest data.
 */
async function getProfile(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    res.status(200).json({ success: true, user: userModel.toPublicUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, getProfile };
