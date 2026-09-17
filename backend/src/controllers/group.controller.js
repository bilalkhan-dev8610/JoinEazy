const groupModel = require('../models/group.model');
const userModel = require('../models/user.model');
const AppError = require('../utils/AppError');
const { GROUP_MAX_MEMBERS } = require('../config/constants');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves the "identifier" field from the add-member request to a real
 * user: a UUID is treated as the student's ID, anything else as an email.
 */
async function resolveTargetUser(identifier) {
  const value = identifier.trim();
  return UUID_REGEX.test(value) ? userModel.findById(value) : userModel.findByEmail(value);
}

/**
 * POST /api/groups
 * Creates a new group with the requesting student as its leader.
 * A student who already belongs to a group (as leader or member) cannot
 * create another one.
 */
async function createGroup(req, res, next) {
  try {
    const { name, description } = req.body;

    const existingMembership = await groupModel.findMembershipByUser(req.user.id);
    if (existingMembership) {
      throw new AppError(
        `You are already in a group ("${existingMembership.group_name}"). Leave it before creating a new one.`,
        409
      );
    }

    const group = await groupModel.createGroupWithOwner({
      name: name.trim(),
      description: description ? description.trim() : null,
      ownerId: req.user.id,
    });

    const fullGroup = await groupModel.getGroupWithMembers(group.id);

    res.status(201).json({
      success: true,
      message: 'Group created.',
      group: { ...fullGroup, maxMembers: GROUP_MAX_MEMBERS },
    });
  } catch (err) {
    if (err.code === '23505') {
      // Unique violation, e.g. uq_groups_name_owner
      return next(new AppError('You already have a group with this name.', 409));
    }
    next(err);
  }
}

/**
 * GET /api/groups/mine
 * Returns the requesting student's group (with leader + members), or
 * `group: null` if they haven't joined/created one yet. This is a normal
 * state for a logged-in student, not an error, so it's a 200 either way.
 */
async function getMyGroup(req, res, next) {
  try {
    const membership = await groupModel.findMembershipByUser(req.user.id);
    if (!membership) {
      return res.status(200).json({ success: true, group: null });
    }

    const group = await groupModel.getGroupWithMembers(membership.group_id);
    res.status(200).json({ success: true, group: { ...group, maxMembers: GROUP_MAX_MEMBERS } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/groups/mine/members
 * Leader-only. Adds a student to the caller's own group by email or
 * student ID, after checking:
 *  - the target user exists
 *  - the target is a student (not a teacher/admin)
 *  - the target isn't already a member of this group
 *  - the target isn't already in a different group
 *  - the group hasn't hit the member limit
 */
async function addMember(req, res, next) {
  try {
    const { identifier } = req.body;

    const membership = await groupModel.findMembershipByUser(req.user.id);
    if (!membership) {
      throw new AppError('You are not in a group yet.', 404);
    }
    if (membership.member_role !== 'owner') {
      throw new AppError('Only the group leader can add members.', 403);
    }

    const targetUser = await resolveTargetUser(identifier);
    if (!targetUser) {
      throw new AppError('No student found with that email or student ID.', 404);
    }
    if (targetUser.role !== 'student') {
      throw new AppError('Only students can be added to a group.', 400);
    }
    if (targetUser.id === req.user.id) {
      throw new AppError('You cannot add yourself — you are already the group leader.', 400);
    }

    const targetMembership = await groupModel.findMembershipByUser(targetUser.id);
    if (targetMembership && targetMembership.group_id === membership.group_id) {
      throw new AppError('This student is already a member of this group.', 409);
    }
    if (targetMembership) {
      throw new AppError('This student is already in another group.', 409);
    }

    const currentCount = await groupModel.countMembers(membership.group_id);
    if (currentCount >= GROUP_MAX_MEMBERS) {
      throw new AppError(`This group has reached the maximum of ${GROUP_MAX_MEMBERS} members.`, 400);
    }

    await groupModel.addMember(membership.group_id, targetUser.id);

    const group = await groupModel.getGroupWithMembers(membership.group_id);
    res.status(201).json({
      success: true,
      message: 'Member added.',
      group: { ...group, maxMembers: GROUP_MAX_MEMBERS },
    });
  } catch (err) {
    if (err.code === '23505') {
      return next(new AppError('This student is already a member of this group.', 409));
    }
    next(err);
  }
}

/**
 * DELETE /api/groups/mine/members/:userId
 * Leader-only. Removes a member from the caller's own group. The leader
 * cannot be removed through this endpoint — see `deleteGroup` (disband)
 * and `leaveGroup` (member exits voluntarily) below instead.
 */
async function removeMember(req, res, next) {
  try {
    const { userId } = req.params;

    const membership = await groupModel.findMembershipByUser(req.user.id);
    if (!membership) {
      throw new AppError('You are not in a group yet.', 404);
    }
    if (membership.member_role !== 'owner') {
      throw new AppError('Only the group leader can remove members.', 403);
    }
    if (userId === req.user.id) {
      throw new AppError('The group leader cannot be removed.', 400);
    }

    const removed = await groupModel.removeMember(membership.group_id, userId);
    if (!removed) {
      throw new AppError('That student is not a member of this group.', 404);
    }

    const group = await groupModel.getGroupWithMembers(membership.group_id);
    res.status(200).json({
      success: true,
      message: 'Member removed.',
      group: { ...group, maxMembers: GROUP_MAX_MEMBERS },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/groups/mine
 * Leader-only. Updates the group's name and/or description.
 */
async function updateGroup(req, res, next) {
  try {
    const { name, description } = req.body;

    const membership = await groupModel.findMembershipByUser(req.user.id);
    if (!membership) {
      throw new AppError('You are not in a group yet.', 404);
    }
    if (membership.member_role !== 'owner') {
      throw new AppError('Only the group leader can update the group.', 403);
    }

    await groupModel.updateGroup(membership.group_id, {
      name: name !== undefined ? name.trim() : undefined,
      description: description !== undefined ? (description ? description.trim() : null) : undefined,
    });

    const group = await groupModel.getGroupWithMembers(membership.group_id);
    res.status(200).json({
      success: true,
      message: 'Group updated.',
      group: { ...group, maxMembers: GROUP_MAX_MEMBERS },
    });
  } catch (err) {
    if (err.code === '23505') {
      return next(new AppError('You already have a group with this name.', 409));
    }
    next(err);
  }
}

/**
 * DELETE /api/groups/mine
 * Leader-only. Disbands the group entirely. All memberships are removed
 * via the existing ON DELETE CASCADE foreign key on group_members.
 */
async function deleteGroup(req, res, next) {
  try {
    const membership = await groupModel.findMembershipByUser(req.user.id);
    if (!membership) {
      throw new AppError('You are not in a group yet.', 404);
    }
    if (membership.member_role !== 'owner') {
      throw new AppError('Only the group leader can disband the group.', 403);
    }

    await groupModel.deleteGroup(membership.group_id);

    res.status(200).json({ success: true, message: 'Group disbanded.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/groups/mine/leave
 * Any non-leader member can leave their group voluntarily. The leader
 * must disband the group instead (`deleteGroup`) rather than leave it,
 * since a group can't exist without a leader.
 */
async function leaveGroup(req, res, next) {
  try {
    const membership = await groupModel.findMembershipByUser(req.user.id);
    if (!membership) {
      throw new AppError('You are not in a group yet.', 404);
    }
    if (membership.member_role === 'owner') {
      throw new AppError(
        'The group leader cannot leave. Disband the group instead if you want to end it.',
        400
      );
    }

    await groupModel.removeMember(membership.group_id, req.user.id);

    res.status(200).json({ success: true, message: 'You have left the group.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createGroup,
  getMyGroup,
  addMember,
  removeMember,
  updateGroup,
  deleteGroup,
  leaveGroup,
};
