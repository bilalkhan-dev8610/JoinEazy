const express = require('express');
const assignmentController = require('../controllers/assignment.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateUuidParam,
} = require('../middlewares/validators');

const router = express.Router();

// Every route in this file requires a valid admin session.
router.use(protect, authorize('admin'));

router.post('/', validateCreateAssignment, assignmentController.createAssignment);
router.get('/', assignmentController.listAssignments);
router.get('/:id', validateUuidParam('id'), assignmentController.getAssignment);
router.patch(
  '/:id',
  validateUuidParam('id'),
  validateUpdateAssignment,
  assignmentController.updateAssignment
);

module.exports = router;
