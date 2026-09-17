const express = require('express');
const studentController = require('../controllers/student.controller');
const assignmentController = require('../controllers/assignment.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

// Every route in this file requires a valid student session.
router.use(protect, authorize('student'));

router.get('/dashboard', studentController.getDashboard);
router.get('/assignments', assignmentController.getVisibleAssignments);

module.exports = router;
