const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password for storage.
 */
const hashPassword = (plainPassword) => bcrypt.hash(plainPassword, SALT_ROUNDS);

/**
 * Compares a plaintext password against a stored bcrypt hash.
 */
const comparePassword = (plainPassword, passwordHash) =>
  bcrypt.compare(plainPassword, passwordHash);

module.exports = { hashPassword, comparePassword };
