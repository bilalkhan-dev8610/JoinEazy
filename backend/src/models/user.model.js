const { query } = require('../config/db');

/**
 * Data-access layer for the `users` table (see database/init.sql).
 * Controllers should go through this module rather than querying the
 * pool directly.
 */

const createUser = async ({ fullName, email, passwordHash, role = 'student' }) => {
  const result = await query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name, email, role, is_active, created_at, updated_at`,
    [fullName, email.toLowerCase().trim(), passwordHash, role]
  );
  return result.rows[0];
};

const findByEmail = async (email) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
  return result.rows[0] || null;
};

const findById = async (id) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const countByRole = async () => {
  const result = await query('SELECT role, COUNT(*)::int AS count FROM users GROUP BY role');
  return result.rows;
};

/**
 * Strips sensitive/internal fields (password_hash) before a user record
 * is ever sent to the client or attached to req.user.
 */
const toPublicUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: user.role,
  isActive: user.is_active,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

module.exports = { createUser, findByEmail, findById, countByRole, toPublicUser };
