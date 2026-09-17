/**
 * Operational error with an HTTP status code attached.
 * The existing errorHandler middleware (Phase 1) already reads
 * `err.statusCode`, so throwing/forwarding this class is enough
 * to get a correctly-coded JSON error response.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
