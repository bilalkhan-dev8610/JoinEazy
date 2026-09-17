const AppError = require('../utils/AppError');

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * Validates that a route param looks like a UUID before it ever reaches
 * a query — without this, an malformed ID (e.g. "abc") would hit
 * Postgres and come back as a raw "invalid input syntax for type uuid"
 * error instead of a clean 400.
 * Usage: router.get('/:id', validateUuidParam('id'), controller.getX)
 */
function validateUuidParam(paramName) {
  const paramUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!paramUuidRegex.test(value)) {
      return next(new AppError(`${paramName} must be a valid ID.`, 400));
    }
    next();
  };
}

/**
 * Validates POST /api/auth/register body.
 * Rejects with 400 + a list of all problems found (not just the first)
 * so the frontend can show them all at once.
 */
function validateRegister(req, res, next) {
  const { fullName, email, password } = req.body || {};
  const errors = [];

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.push('fullName is required and must be at least 2 characters.');
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email is required.');
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('password is required and must be at least 8 characters.');
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(' '), 400));
  }

  next();
}

/**
 * Validates POST /api/auth/login body.
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email is required.');
  }
  if (!password || typeof password !== 'string') {
    errors.push('password is required.');
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(' '), 400));
  }

  next();
}

/**
 * Validates POST /api/groups body.
 */
function validateCreateGroup(req, res, next) {
  const { name, description } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('name is required and must be at least 2 characters.');
  }
  if (name && name.trim().length > 150) {
    errors.push('name must be at most 150 characters.');
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push('description must be a string.');
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(' '), 400));
  }

  next();
}

/**
 * Validates POST /api/groups/mine/members body.
 * `identifier` is either the target student's email or their user ID
 * (UUID) — see models/group.model.js for why UUID doubles as "Student ID".
 */
function validateAddMember(req, res, next) {
  const { identifier } = req.body || {};

  if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
    return next(new AppError('identifier (email or student ID) is required.', 400));
  }

  next();
}

/**
 * Validates PATCH /api/groups/mine body.
 * Both fields are optional (partial update), but at least one must be
 * present, and whatever is present must be well-formed.
 */
function validateUpdateGroup(req, res, next) {
  const { name, description } = req.body || {};
  const errors = [];

  if (name === undefined && description === undefined) {
    errors.push('Provide at least one of name or description to update.');
  }
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      errors.push('name must be at least 2 characters.');
    } else if (name.trim().length > 150) {
      errors.push('name must be at most 150 characters.');
    }
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push('description must be a string.');
  }

  if (errors.length > 0) {
    return next(new AppError(errors.join(' '), 400));
  }

  next();
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_REGEX = /^https?:\/\/.+/i;

/**
 * Shared checks for the assignment fields that both create and update
 * care about. Only validates a field when it's actually present in the
 * body, so callers decide what's required vs optional for their case.
 */
function collectAssignmentFieldErrors(body) {
  const { title, description, dueDate, resourceUrl, isGlobal, groupIds } = body;
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 2) {
      errors.push('title must be at least 2 characters.');
    } else if (title.trim().length > 200) {
      errors.push('title must be at most 200 characters.');
    }
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push('description must be a string.');
  }
  if (dueDate !== undefined && dueDate !== null) {
    if (typeof dueDate !== 'string' || Number.isNaN(Date.parse(dueDate))) {
      errors.push('dueDate must be a valid date.');
    }
  }
  if (resourceUrl !== undefined && resourceUrl !== null) {
    if (typeof resourceUrl !== 'string' || !URL_REGEX.test(resourceUrl.trim())) {
      errors.push('resourceUrl must be a valid http(s) URL.');
    }
  }
  if (isGlobal !== undefined && typeof isGlobal !== 'boolean') {
    errors.push('isGlobal must be true or false.');
  }
  if (groupIds !== undefined) {
    if (!Array.isArray(groupIds) || groupIds.some((id) => typeof id !== 'string' || !UUID_REGEX.test(id))) {
      errors.push('groupIds must be an array of valid group IDs.');
    }
  }
  if (isGlobal === false && (!groupIds || groupIds.length === 0)) {
    errors.push('groupIds is required (at least one group) when isGlobal is false.');
  }

  return errors;
}

/**
 * Validates POST /api/assignments body.
 */
function validateCreateAssignment(req, res, next) {
  const body = req.body || {};
  const errors = [];

  if (body.title === undefined || body.title === null) {
    errors.push('title is required.');
  }
  if (body.isGlobal === undefined) {
    errors.push('isGlobal is required (true = assign to all students, false = assign to specific groups).');
  }

  errors.push(...collectAssignmentFieldErrors(body));

  if (errors.length > 0) {
    return next(new AppError(errors.join(' '), 400));
  }

  next();
}

/**
 * Validates PATCH /api/assignments/:id body. All fields are optional
 * (partial update), but at least one must be present.
 */
function validateUpdateAssignment(req, res, next) {
  const body = req.body || {};
  const { title, description, dueDate, resourceUrl, isGlobal, groupIds } = body;
  const errors = [];

  if (
    title === undefined &&
    description === undefined &&
    dueDate === undefined &&
    resourceUrl === undefined &&
    isGlobal === undefined &&
    groupIds === undefined
  ) {
    errors.push('Provide at least one field to update.');
  }

  errors.push(...collectAssignmentFieldErrors(body));

  if (errors.length > 0) {
    return next(new AppError(errors.join(' '), 400));
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateGroup,
  validateAddMember,
  validateUpdateGroup,
  validateCreateAssignment,
  validateUpdateAssignment,
  validateUuidParam,
};
