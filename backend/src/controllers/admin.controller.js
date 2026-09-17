const userModel = require('../models/user.model');
const groupModel = require('../models/group.model');

/**
 * GET /api/admin/overview
 * Admin-only. Protected by `protect` + `authorize('admin')`. Real data
 * (not mocked) — a count of users per role — used to prove the
 * authenticated admin dashboard is wired end-to-end. A student calling
 * this endpoint never reaches this handler; the role middleware returns
 * 403 first.
 */
async function getOverview(req, res, next) {
  try {
    const counts = await userModel.countByRole();
    res.status(200).json({
      success: true,
      message: `Welcome, ${req.user.fullName}.`,
      usersByRole: counts,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/groups
 * Admin-only. Lists every student group (with leader + member count),
 * used to populate the "assign to specific groups" picker when
 * creating/editing an assignment.
 */
async function listGroups(req, res, next) {
  try {
    const groups = await groupModel.listAllGroups();
    res.status(200).json({ success: true, groups });
  } catch (err) {
    next(err);
  }
}

module.exports = { getOverview, listGroups };
