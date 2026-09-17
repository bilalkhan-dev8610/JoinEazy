const jwt = require('jsonwebtoken');

/**
 * Reads and validates the JWT secret from the environment. Throws instead
 * of silently falling back to an insecure default.
 */
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Add it to your .env file.');
  }
  return secret;
}

/**
 * Signs a JWT for the given payload (expects at least { id, role }).
 */
const signToken = (payload) =>
  jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

/**
 * Verifies a JWT and returns its decoded payload, or throws on failure
 * (expired, malformed, or invalid signature).
 */
const verifyToken = (token) => jwt.verify(token, getSecret());

module.exports = { signToken, verifyToken };
