const { pool, query } = require('../config/db');

/**
 * Data-access layer for `groups` and `group_members` (see database/init.sql).
 * "Student ID" throughout the group-members API refers to the user's
 * existing UUID primary key — there is no separate roll-number field,
 * so we reuse the identifier the system already has rather than adding
 * a redundant one.
 */

/**
 * Creates a group and adds the creator as its owner in a single
 * transaction, so a group can never exist without a leader.
 */
const createGroupWithOwner = async ({ name, description, ownerId }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const groupResult = await client.query(
      `INSERT INTO groups (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_by, created_at, updated_at`,
      [name, description || null, ownerId]
    );
    const group = groupResult.rows[0];

    await client.query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [group.id, ownerId]
    );

    await client.query('COMMIT');
    return group;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Finds the group (if any) a user currently belongs to, along with their
 * role in it. A student belongs to at most one group (enforced by the
 * uq_group_members_user constraint), so this is at most one row.
 */
const findMembershipByUser = async (userId) => {
  const result = await query(
    `SELECT gm.group_id, gm.role AS member_role, g.name AS group_name
     FROM group_members gm
     JOIN groups g ON g.id = gm.group_id
     WHERE gm.user_id = $1`,
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Returns a group with its leader and full member list, or null if the
 * group doesn't exist.
 */
const getGroupWithMembers = async (groupId) => {
  const groupResult = await query('SELECT * FROM groups WHERE id = $1', [groupId]);
  const group = groupResult.rows[0];
  if (!group) return null;

  const membersResult = await query(
    `SELECT u.id, u.full_name, u.email, gm.role AS member_role, gm.joined_at
     FROM group_members gm
     JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1
     ORDER BY (gm.role = 'owner') DESC, gm.joined_at ASC`,
    [groupId]
  );

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    createdBy: group.created_by,
    createdAt: group.created_at,
    updatedAt: group.updated_at,
    members: membersResult.rows.map((m) => ({
      id: m.id,
      fullName: m.full_name,
      email: m.email,
      role: m.member_role,
      joinedAt: m.joined_at,
    })),
  };
};

const countMembers = async (groupId) => {
  const result = await query('SELECT COUNT(*)::int AS count FROM group_members WHERE group_id = $1', [
    groupId,
  ]);
  return result.rows[0].count;
};

const addMember = async (groupId, userId) => {
  await query(
    `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'member')`,
    [groupId, userId]
  );
};

const removeMember = async (groupId, userId) => {
  const result = await query(
    'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING id',
    [groupId, userId]
  );
  return result.rowCount > 0;
};

/**
 * Updates a group's name and/or description. Only the fields provided
 * are changed — pass `undefined` for a field to leave it untouched.
 */
const updateGroup = async (groupId, { name, description }) => {
  const result = await query(
    `UPDATE groups
     SET name = COALESCE($2, name),
         description = CASE WHEN $3::boolean THEN $4 ELSE description END
     WHERE id = $1
     RETURNING id, name, description, created_by, created_at, updated_at`,
    [groupId, name ?? null, description !== undefined, description ?? null]
  );
  return result.rows[0] || null;
};

/**
 * Deletes a group outright. `group_members` rows cascade-delete via the
 * existing ON DELETE CASCADE foreign key (see database/init.sql).
 */
const deleteGroup = async (groupId) => {
  const result = await query('DELETE FROM groups WHERE id = $1 RETURNING id', [groupId]);
  return result.rowCount > 0;
};

/**
 * Lists every group with its leader's name and member count. Used by
 * the admin "assign to specific groups" picker (Phase 5), not exposed
 * to students.
 */
const listAllGroups = async () => {
  const result = await query(
    `SELECT g.id, g.name, u.full_name AS leader_name,
            COUNT(gm2.id)::int AS member_count
     FROM groups g
     JOIN group_members gm ON gm.group_id = g.id AND gm.role = 'owner'
     JOIN users u ON u.id = gm.user_id
     LEFT JOIN group_members gm2 ON gm2.group_id = g.id
     GROUP BY g.id, u.full_name
     ORDER BY g.name ASC`
  );
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    leaderName: row.leader_name,
    memberCount: row.member_count,
  }));
};

module.exports = {
  createGroupWithOwner,
  findMembershipByUser,
  getGroupWithMembers,
  countMembers,
  addMember,
  removeMember,
  updateGroup,
  deleteGroup,
  listAllGroups,
};
