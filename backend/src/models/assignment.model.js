const { pool, query } = require('../config/db');

/**
 * Data-access layer for `assignments` and `assignment_groups` (see
 * database/init.sql). An assignment is visible to students either
 * because it's global (`is_global = true`, visible to everyone) or
 * because it's targeted at specific groups via `assignment_groups`.
 */

/**
 * Creates an assignment and, if it isn't global, links it to the given
 * groups — all in one transaction so an assignment is never left
 * half-configured (e.g. non-global with zero groups attached).
 */
const createAssignment = async ({
  title,
  description,
  dueDate,
  resourceUrl,
  isGlobal,
  groupIds,
  createdBy,
}) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO assignments (title, description, due_date, resource_url, is_global, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [title, description || null, dueDate || null, resourceUrl || null, isGlobal, createdBy]
    );
    const assignmentId = result.rows[0].id;

    if (!isGlobal && groupIds.length > 0) {
      await client.query(
        `INSERT INTO assignment_groups (assignment_id, group_id)
         SELECT $1, UNNEST($2::uuid[])`,
        [assignmentId, groupIds]
      );
    }

    await client.query('COMMIT');
    return assignmentId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Updates an assignment's own fields. Only fields provided (not
 * `undefined`) are changed. Group targeting is handled separately by
 * `setAssignmentGroups`, mirroring how creation separates the two
 * concerns.
 */
const updateAssignment = async (
  assignmentId,
  { title, description, dueDate, resourceUrl, isGlobal }
) => {
  const result = await query(
    `UPDATE assignments
     SET title = COALESCE($2, title),
         description = CASE WHEN $3::boolean THEN $4 ELSE description END,
         due_date = CASE WHEN $5::boolean THEN $6 ELSE due_date END,
         resource_url = CASE WHEN $7::boolean THEN $8 ELSE resource_url END,
         is_global = COALESCE($9, is_global)
     WHERE id = $1
     RETURNING id`,
    [
      assignmentId,
      title ?? null,
      description !== undefined,
      description ?? null,
      dueDate !== undefined,
      dueDate ?? null,
      resourceUrl !== undefined,
      resourceUrl ?? null,
      isGlobal ?? null,
    ]
  );
  return result.rows[0] || null;
};

/**
 * Replaces the full set of groups an assignment is targeted at.
 * Passing an empty array clears all targeting (used when an assignment
 * becomes global). Runs as a transaction so the swap is atomic.
 */
const setAssignmentGroups = async (assignmentId, groupIds) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM assignment_groups WHERE assignment_id = $1', [assignmentId]);
    if (groupIds.length > 0) {
      await client.query(
        `INSERT INTO assignment_groups (assignment_id, group_id)
         SELECT $1, UNNEST($2::uuid[])`,
        [assignmentId, groupIds]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const toPublicAssignment = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  dueDate: row.due_date,
  resourceUrl: row.resource_url,
  isGlobal: row.is_global,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Returns a single assignment with its targeted groups (empty array for
 * global assignments), or null if it doesn't exist. Used for the admin
 * detail view and after create/update to return the full picture.
 */
const getAssignmentWithGroups = async (assignmentId) => {
  const assignmentResult = await query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
  const assignment = assignmentResult.rows[0];
  if (!assignment) return null;

  const groupsResult = await query(
    `SELECT g.id, g.name
     FROM assignment_groups ag
     JOIN groups g ON g.id = ag.group_id
     WHERE ag.assignment_id = $1
     ORDER BY g.name ASC`,
    [assignmentId]
  );

  return {
    ...toPublicAssignment(assignment),
    groups: groupsResult.rows,
  };
};

/**
 * Lists every assignment for the admin view, most recently created
 * first, along with how many groups each is targeted at (0 for global
 * assignments since they don't need any).
 */
const listAllForAdmin = async () => {
  const result = await query(
    `SELECT a.*, COUNT(ag.group_id)::int AS group_count
     FROM assignments a
     LEFT JOIN assignment_groups ag ON ag.assignment_id = a.id
     GROUP BY a.id
     ORDER BY a.created_at DESC`
  );
  return result.rows.map((row) => ({
    ...toPublicAssignment(row),
    groupCount: row.group_count,
  }));
};

/**
 * Lists assignments visible to a student: every global assignment, plus
 * any assignment specifically targeted at the group they belong to (if
 * any). Ordered so the soonest due date shows first; assignments with
 * no due date sort last.
 */
const listVisibleForStudent = async (studentGroupId) => {
  const result = await query(
    `SELECT DISTINCT a.*
     FROM assignments a
     LEFT JOIN assignment_groups ag ON ag.assignment_id = a.id
     WHERE a.is_global = TRUE
        OR ($1::uuid IS NOT NULL AND ag.group_id = $1)
     ORDER BY a.due_date ASC NULLS LAST, a.created_at DESC`,
    [studentGroupId || null]
  );
  return result.rows.map(toPublicAssignment);
};

/**
 * Given a list of group IDs, returns only the ones that actually exist
 * — used to validate an admin's "assign to specific groups" input
 * without a separate round trip per ID.
 */
const findExistingGroupIds = async (groupIds) => {
  if (groupIds.length === 0) return [];
  const result = await query('SELECT id FROM groups WHERE id = ANY($1::uuid[])', [groupIds]);
  return result.rows.map((r) => r.id);
};

module.exports = {
  createAssignment,
  updateAssignment,
  setAssignmentGroups,
  getAssignmentWithGroups,
  listAllForAdmin,
  listVisibleForStudent,
  findExistingGroupIds,
};
