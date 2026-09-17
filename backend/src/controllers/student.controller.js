/**
 * GET /api/students/dashboard
 * Student-only. Protected by `protect` + `authorize('student')`.
 * Phase 2 has no student features yet, so this simply confirms the
 * authenticated student route works and echoes their own profile.
 */
function getDashboard(req, res) {
  res.status(200).json({
    success: true,
    message: `Welcome, ${req.user.fullName}.`,
    user: req.user,
  });
}

module.exports = { getDashboard };
