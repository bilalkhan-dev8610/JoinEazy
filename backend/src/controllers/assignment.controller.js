const assignmentModel = require('../models/assignment.model');
const groupModel = require('../models/group.model');
const AppError = require('../utils/AppError');

/**
 * Validates that every group ID an admin wants to target actually
 * exists, throwing a single clear error naming any that don't.
 */
async function assertGroupsExist(groupIds) {
  if (!groupIds || groupIds.length === 0) return;
  const existing = await assignmentModel.findExistingGroupIds(groupIds);
  const missing = groupIds.filter((id) => !existing.includes(id));
  if (missing.length > 0) {
    throw new AppError(`No group found for ID(s): ${missing.join(', ')}`, 404);
  }
}

/**
 * POST /api/assignments
 * Admin-only. Creates an assignment, either global (visible to every
 * student) or targeted at specific groups.
 */
async function createAssignment(req, res, next) {
  try {
    const { title, description, dueDate, resourceUrl, isGlobal, groupIds } = req.body;
    const targetGroupIds = isGlobal ? [] : groupIds;

    await assertGroupsExist(targetGroupIds);

    const assignmentId = await assignmentModel.createAssignment({
      title: title.trim(),
      description: description ? description.trim() : null,
      dueDate: dueDate || null,
      resourceUrl: resourceUrl ? resourceUrl.trim() : null,
      isGlobal: !!isGlobal,
      groupIds: targetGroupIds,
      createdBy: req.user.id,
    });

    const assignment = await assignmentModel.getAssignmentWithGroups(assignmentId);
    res.status(201).json({ success: true, message: 'Assignment created.', assignment });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/assignments/:id
 * Admin-only. Partial update of an assignment's fields and/or its
 * group targeting. Switching to `isGlobal: true` clears any existing
 * group targeting; switching to `isGlobal: false` requires `groupIds`.
 */
async function updateAssignment(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, dueDate, resourceUrl, isGlobal, groupIds } = req.body;

    const existing = await assignmentModel.getAssignmentWithGroups(id);
    if (!existing) {
      throw new AppError('Assignment not found.', 404);
    }

    const willBeGlobal = isGlobal !== undefined ? isGlobal : existing.isGlobal;
    // How many groups the assignment would end up targeting: the new
    // list if one was sent, otherwise whatever it already has.
    const effectiveGroupCount = groupIds !== undefined ? groupIds.length : existing.groups.length;
    if (!willBeGlobal && effectiveGroupCount === 0) {
      throw new AppError(
        'groupIds must include at least one group when isGlobal is false.',
        400
      );
    }

    await assignmentModel.updateAssignment(id, {
      title: title !== undefined ? title.trim() : undefined,
      description: description !== undefined ? (description ? description.trim() : null) : undefined,
      dueDate: dueDate !== undefined ? dueDate : undefined,
      resourceUrl: resourceUrl !== undefined ? (resourceUrl ? resourceUrl.trim() : null) : undefined,
      isGlobal: isGlobal !== undefined ? isGlobal : undefined,
    });

    if (willBeGlobal) {
      // A global assignment doesn't need explicit group targeting.
      if (isGlobal === true) {
        await assignmentModel.setAssignmentGroups(id, []);
      }
    } else if (groupIds !== undefined) {
      await assertGroupsExist(groupIds);
      await assignmentModel.setAssignmentGroups(id, groupIds);
    }

    const assignment = await assignmentModel.getAssignmentWithGroups(id);
    res.status(200).json({ success: true, message: 'Assignment updated.', assignment });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/assignments
 * Admin-only. Lists every assignment.
 */
async function listAssignments(req, res, next) {
  try {
    const assignments = await assignmentModel.listAllForAdmin();
    res.status(200).json({ success: true, assignments });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/assignments/:id
 * Admin-only. Full detail view of a single assignment, including which
 * groups it's targeted at.
 */
async function getAssignment(req, res, next) {
  try {
    const assignment = await assignmentModel.getAssignmentWithGroups(req.params.id);
    if (!assignment) {
      throw new AppError('Assignment not found.', 404);
    }
    res.status(200).json({ success: true, assignment });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/students/assignments
 * Student-only. Lists assignments visible to the caller: every global
 * assignment, plus any assignment targeted at the group they belong to
 * (if they're in one). Each entry carries exactly what the student
 * needs to see: title, description, due date, and the resource link.
 */
async function getVisibleAssignments(req, res, next) {
  try {
    const membership = await groupModel.findMembershipByUser(req.user.id);
    const assignments = await assignmentModel.listVisibleForStudent(
      membership ? membership.group_id : null
    );
    res.status(200).json({ success: true, assignments });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAssignment,
  updateAssignment,
  listAssignments,
  getAssignment,
  getVisibleAssignments,
};
